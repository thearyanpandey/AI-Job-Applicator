import { useState } from 'react';
import PersonaTab from '../components/PersonaTab';
import DashboardTab from '../components/DashboardTab';

export default function OptionsApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <h1 className="text-xl font-black tracking-tight text-slate-900">AI Applicator</h1>
        </div>
        
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('persona')}
            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
              activeTab === 'persona' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            👤 My Persona
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-8">
        {activeTab === 'dashboard' ? <DashboardTab /> : <PersonaTab />}
      </main>
    </div>
  );
}