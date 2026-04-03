import { useState, useEffect } from 'react';
console.log("hii from options page")

export default function OptionsApp() {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', linkedin: '', github: ''
  });
  const [loading, setLoading] = useState(false);

  // 1. Handle File Upload
  // const handleFileUpload = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   setLoading(true);
  //   const data = new FormData();
  //   data.append('resume', file);

  //   try {
  //     // Call your backend
  //     const response = await fetch('http://localhost:3000/parse-resume', {
  //       method: 'POST',
  //       body: data
  //     });
  //     const result = await response.json();

  //     console.log("🔍 Full API Response:", JSON.stringify(result, null, 2));
  //     console.log("🔍 result.data:", result.data);
      
  //     if (result.success) {
  //       // Auto-fill the state with AI data
  //       setFormData(prev => ({ ...prev, ...result.data }));
  //       alert("✨ Resume Parsed Successfully!");
  //     }
  //   } catch (err) {
  //     alert("Error parsing resume");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setLoading(true);
  const data = new FormData();
  data.append('resume', file);

  try {
    const response = await fetch('http://localhost:3000/parse-resume', {
      method: 'POST',
      body: data
    });
    const result = await response.json();

    console.log("🔍 Full API Response:", JSON.stringify(result, null, 2));
    
    if (result.success) {
      // 🔥 Transform nested data to flat structure
      const { personalInfo } = result.data;
      
      // Split full name into first and last
      const nameParts = personalInfo.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Build transformed data
      const transformedData = {
        first_name: firstName,
        last_name: lastName,
        email: personalInfo.email || '',
        phone: personalInfo.phone || '',
        linkedin: personalInfo.profiles?.linkedin 
          ? `www.linkedin.com/in/${personalInfo.profiles.linkedin}` 
          : '',
        github: personalInfo.profiles?.github 
          ? `www.github.com/${personalInfo.profiles.github}` 
          : '',
        full_resume_data: result.data
      };

      // Update form with transformed data
      setFormData(prev => ({ ...prev, ...transformedData }));
      alert("✨ Resume Parsed Successfully!");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Error parsing resume");
  } finally {
    setLoading(false);
  }
  };

  // 2. Handle Save (Persist to Chrome Storage)
  const handleSave = () => {
    // Save as "Default Profile" for now
    chrome.storage.local.set({ 'default_profile': formData }, () => {
      alert("Profile Saved! yess");
    });
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">Your Persona</h1>
      
      {/* THE WOW FACTOR: Upload Button */}
      <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-2">✨ Magic Import</h3>
        <p className="text-sm text-blue-600 mb-4">Upload your PDF resume and we'll fill the details for you.</p>
        <input 
          type="file" 
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={loading}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
        {loading && <p className="mt-2 text-blue-600 font-bold animate-pulse">Analyzing Resume...</p>}
      </div>

      {/* Manual Fields */}
      <div className="grid grid-cols-2 gap-4">
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 capitalize">{key.replace('_', ' ')}</label>
            <input 
              type="text" 
              value={formData[key]}
              onChange={(e) => setFormData({...formData, [key]: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>
        ))}
      </div>

      <button onClick={handleSave} className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">
        Save Profile
      </button>
    </div>
  );
}