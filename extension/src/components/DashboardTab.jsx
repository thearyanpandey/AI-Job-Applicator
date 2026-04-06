import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function DashboardTab() {
  const [jobs, setJobs] = useState([]);

  // Fetch jobs from Chrome Storage on load
  useEffect(() => {
    chrome.storage.local.get(['applied_jobs'], (result) => {
      if (result.applied_jobs) {
        // Reverse so the newest applications show up at the top
        setJobs(result.applied_jobs.reverse()); 
      }
    });
  }, []);

  const exportToCSV = () => {
    if (jobs.length === 0) {
      alert("No jobs to export yet!");
      return;
    }

    // Convert JSON array to CSV string
    const csv = Papa.unparse(jobs);
    
    // Create a downloadable Blob
    const blob = new window.Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Programmatically click a hidden link to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Job_Applications_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Application History</h2>
          <p className="text-sm text-gray-500">You have applied to {jobs.length} jobs.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          📊 Export to CSV
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No applications tracked yet. Start applying!</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs">
                    {job.roleAndCompany}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.dateApplied}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a href={job.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-900 font-medium">
                      View Posting ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}