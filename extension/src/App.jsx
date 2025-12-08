import { useState } from "react";

function App(){
  const [status, setStatus] = useState("Idle");

  const handleApply = async () => {
    setStatus("Scanning...");

    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    const mockProfile ={
      first_name : "Rahul",
      last_name: "Kumar",
      email: "rahul@example.com",
      phone: "+91 8823522315",
    };

    chrome.tabs.sendMessage(tab.id, {
      type: "START_AUTOFILL",
      userProfile: mockProfile,
    });

    setStatus("Command Sent!");
  }

  return (
    <div className="p-4 w-64 bg-slate-900 text-white">
      <h1 className="text-xl font-bold mb-4">AI Applicator 🚀</h1>
      <button 
        onClick={handleApply}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded"
      >
        Autofill Form
      </button>
      <p className="mt-2 text-sm text-gray-400">Status: {status}</p>
    </div>
  );
}

export default App;