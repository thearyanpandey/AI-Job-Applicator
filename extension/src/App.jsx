import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileText, Settings, PenTool, Loader2, CheckCircle } from "lucide-react";

export default function App() {
  const [status, setStatus] = useState("Idle");
  const [profile, setProfile] = useState(null);
  const [isTailoring, setIsTailoring] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    chrome.storage.local.get(['default_profile'], (result) => {
      if (result.default_profile) {
        setProfile(result.default_profile);
        setStatus("Ready to dominate.");
      } else {
        setStatus("No Profile Found.");
      }
    });
  }, []);

  const openOptions = () => chrome.runtime.openOptionsPage();

  const handleTailorResume = async () => {
    if (!profile) return;
    setIsTailoring(true);
    setLoadingStep(1); // "Parsing JD..."
    
    // Simulating the steps for the sleek UI wait state
    setTimeout(() => setLoadingStep(2), 2500); // "Aligning Skills..."
    setTimeout(() => setLoadingStep(3), 5000); // "Formatting PDF..."

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { type: "GET_JOB_DESCRIPTION" }, async (response) => {
        if (!response?.jobDescription) {
          setStatus("Could not find Job Description.");
          setIsTailoring(false);
          return;
        }

        const res = await fetch('http://127.0.0.1:3000/tailor-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userProfile: profile, jobDescription: response.jobDescription })
        });

        if (!res.ok) throw new Error("Backend failed");

        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `Tailored_Resume_${profile.first_name}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);

        setStatus("Resume Compiled.");
        setIsTailoring(false);
      });
    } catch (error) {
      console.error(error);
      setStatus("Generation failed.");
      setIsTailoring(false);
    }
  };

  const handleApply = async () => {
    if (!profile) return openOptions();
    setStatus("Injecting data...");
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { type: "START_AUTOFILL", userProfile: profile });
    setStatus("Autofill Complete.");
  };

  return (
    <div className="w-96 bg-white text-slate-900 font-sans overflow-hidden shadow-2xl selection:bg-indigo-100">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-5 bg-gray-50/50 border-b border-gray-100">
        <div>
          <h1 className="text-sm font-bold tracking-tight text-gray-900">
            {profile ? `Welcome, ${profile.first_name}` : "AI Applicator"}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{status}</p>
        </div>
        <button onClick={openOptions} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
          <Settings className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Main Content */}
      <div className="p-6 pb-8">
        <AnimatePresence mode="wait">
          {isTailoring ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-8 space-y-4"
            >
              <div className="relative">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-indigo-200"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>
              <div className="text-center font-mono text-xs text-slate-500 space-y-1">
                <p className={loadingStep >= 1 ? "text-indigo-600 font-semibold" : "opacity-50"}>&gt; Parsing JD...</p>
                <p className={loadingStep >= 2 ? "text-indigo-600 font-semibold" : "opacity-50"}>&gt; Aligning Skills...</p>
                <p className={loadingStep >= 3 ? "text-indigo-600 font-semibold" : "opacity-50"}>&gt; Compiling PDF...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <button
                onClick={handleApply}
                disabled={!profile}
                className="group relative w-full flex items-center justify-between p-4 bg-indigo-600 disabled:bg-gray-200 hover:bg-indigo-700 text-white disabled:text-gray-400 rounded-2xl transition-all shadow-[0_8px_30px_rgb(79,70,229,0.15)] disabled:shadow-none overflow-hidden"
              >
                <span className="font-semibold tracking-wide text-sm relative z-10">Auto-Fill Application</span>
                <Sparkles className="w-5 h-5 relative z-10" />
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>

              <button
                onClick={handleTailorResume}
                disabled={!profile}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 disabled:bg-gray-50 text-gray-900 disabled:text-gray-400 border border-gray-200 rounded-2xl transition-colors font-semibold tracking-wide text-sm"
              >
                Tailor Resume for this JD
                <FileText className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}