import { useEffect, useState } from "react";

//TODO : + also ai should refer his/her resume to answer other questions  picking up from resume like what did your last job role was and what did you learn there now to answer this question ai should give anser based on resume by tailoring it to that specific job role 

function App(){
  const [status, setStatus] = useState("Idle");
  const [profile, setProfile] = useState(null);

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