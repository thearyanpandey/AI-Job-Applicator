import { useState, useEffect } from "react";
import { LayoutDashboard, Settings2, UserCircle } from "lucide-react";
import Dashboard from "../components/Dashboard.jsx";
import PersonaTab from "../components/PersonaTab.jsx"

export default function WebPlatform({ onReset }) {
  const [activeTab, setActiveTab] = useState("tracker");
  const [profileData, setProfileData] = useState(null);
  
  // Unified Job State
  const [jobs, setJobs] = useState([
    { id: 1, role: "Senior Frontend Engineer", company: "Vercel", status: "Applied", date: "Oct 24", icon: "V" },
    { id: 2, role: "UI/UX Designer", company: "Stripe", status: "Interviewing", date: "Oct 22", icon: "S" },
  ]);

  useEffect(() => {
    chrome.storage.local.get(['default_profile'], (result) => {
      if (result.default_profile) setProfileData(result.default_profile);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#171717] font-sans flex">
      {/* Sleek Sidebar Master */}
      <nav className="w-64 border-r border-gray-200 bg-white p-6 flex flex-col justify-between hidden md:flex z-50">
        <div>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-10 shadow-lg">
            <span className="text-white font-black text-xl tracking-tighter">AI</span>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab("tracker")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${activeTab === "tracker" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Tracker
            </button>
            <button 
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${activeTab === "profile" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
            >
              <UserCircle className="w-4 h-4" /> Profile Details
            </button>
          </div>
        </div>
        <button className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
          <Settings2 className="w-4 h-4" /> Settings
        </button>
      </nav>

      {/* Main Stage Canvas */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === "tracker" && <Dashboard jobs={jobs} profileName={profileData?.first_name || "User"} />}
        {activeTab === "profile" && (
          <div className="p-8 md:p-16">
            <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-8">Your Profile</h2>
            <PersonaTab />
          </div>
        )}
      </main>
    </div>
  );
}