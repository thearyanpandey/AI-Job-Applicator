import { useEffect, useState } from "react";

//TODO : + also ai should refer his/her resume to answer other questions  picking up from resume like what did your last job role was and what did you learn there now to answer this question ai should give anser based on resume by tailoring it to that specific job role 

function App(){
  const [status, setStatus] = useState("Idle");
  const [profile, setProfile] = useState(null);
  const [isTailoring, setIsTailoring] = useState(false);

  //Loading the user's profile when the popup opens
  useEffect(() => {
    chrome.storage.local.get(['default_profile'], (result) => {
      if(result.default_profile){
        setProfile(result.default_profile);
        setStatus("Ready to Apply!");
      }else{
        setStatus("No Profile Found. Please upload resume in Options")
      }
    });
  }, []);

  const handleApply = async () => {
    if(!profile){
      //open option page if no profile exists
      chrome.runtime.openOptionsPage();
      return;
    }

    setStatus("Scanning...");

    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    //send the real profile data to content script
    chrome.tabs.sendMessage(tab.id, {
      type: "START_AUTOFILL",
      userProfile: profile
    });

    setStatus("Autofill Command Sent!");
  };

  const handleCoverLetter = async () => {
      if (!profile) return;
      setStatus("Reading Job Description...");
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // 3. Send REAL profile for Cover Letter generation too
      chrome.tabs.sendMessage(tab.id, { 
        type: "GENERATE_COVER_LETTER", 
        userProfile: profile
      }, (response) => {
          if(response && response.success) setStatus("Cover Letter Written! ✍️");
          else setStatus("Error writing letter");
      });
  };

  const handleTailorResume = async () => {
    if(!profile) return;
    setIsTailoring(true);
    setStatus("Scraping Job Description...");

    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

      chrome.tabs.sendMessage(tab.id, {type: "GET_JOB_DESCRIPTION"}, async(response) => {
        if(!response || !response.jobDescription){
          setStatus("Could not find Job Description on this page.");
          setIsTailoring(false);
          return;
        }

        setStatus("AI is rewriting and compiling your resume. This takes few seconds...");

        const res = await fetch('http://127.0.0.1:3000/tailor-resume', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            userProfile: profile,
            jobDescription: response.jobDescription
          })
        })

        if (!res.ok) throw new Error("Backend failed to generate PDF");

        //Trigger the file download in the browser
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `Tailored_Resume_${profile.first_name}.pdf`;
        document.body.appendChile(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);

        setStatus("Tailored Resume Downloaded! Ready to Autofill..");
        setIsTailoring(false);
      });
    } catch (error) {
      console.error(error);
      setStatus("Error generating resume..");
      setIsTailoring(false);
    }
  }

  return (
    <div className="p-4 w-72 bg-slate-900 text-white border-t-4 boarder-purple-500">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">AI Applicator</h1>
        <button onClick={() => chrome.runtime.openOptionsPage()} className="text-gray-400 hover:text-white">
          ⚙️
        </button>
      </div>

      <div className="mb-4 p-3 bg-slate-800 rounded-lg text-sm">
        <p className="text-gray-400 text-xs uppercase font-bold mb-1">Active Profile</p>
        <p className="font-medium truncate">
          {profile ? `${profile.first_name} ${profile.last_name}` : "No profile selected"}
        </p>
      </div>

      <button 
        onClick={handleTailorResume}
        disabled={!profile || isTailoring}
        className={`w-full font-bold py-2 px-4 rounded mb-2 flex justify-center items-center ${
          profile && !isTailoring ? 'bg-amber-500 hover:bg-amber-400 text-slate-900' : 'bg-gray-600 text-gray-300 cursor-not-allowed'
        }`}
      >
        {isTailoring ? (
           <span className="animate-pulse">⏳ Compiling PDF...</span>
        ) : (
           "✨ 1. Tailor Resume (Pre-Flight)"
        )}
      </button>

      <button 
        onClick={handleApply}
        disabled={!profile}
        className={`w-full font-bold py-2 px-4 rounded mb-2 ${profile ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 cursor-not-allowed'}`}
      >
        {profile ? "Autofill Form" : "Setup Profile First"}
      </button>

      <button
        onClick={handleCoverLetter}
        disabled={!profile}
        className={`w-full font-bold py-2 px-4 rounded ${profile ? 'bg-purple-600 hover:bg-purple-500' : 'bg-gray-600 cursor-not-allowed'}`}
        >
          Write Cover Letter
        </button>
        <p className="mt-3 text-center text-xs text-gray-500">{status}</p>
    </div>
  );
}

export default App;