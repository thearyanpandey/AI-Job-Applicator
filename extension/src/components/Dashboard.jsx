import React from 'react';

export default function Dashboard({ jobs, profileName }) {
  return (
    <div className="w-full px-6 md:px-16 pt-12 pb-24">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="max-w-2xl">
          <span className="label-md uppercase tracking-[0.1em] text-primary font-bold mb-4 block">Dashboard</span>
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-[-0.04em] text-on-background leading-tight">
            The Tracker
          </h2>
          <p className="text-secondary text-lg mt-6 max-w-xl leading-relaxed">
            Concierge is actively managing 12 open sequences. Sit back while we negotiate the silence for you.
          </p>
        </div>
        
        {/* Profile Preview Card */}
        <div className="bg-surface-container-lowest rounded-xl p-8 cinematic-shadow flex items-center gap-6 max-w-sm">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container">
            {/* Dynamically updating the avatar initials and background */}
            <img 
              alt="User Profile" 
              className="w-full h-full object-cover" 
              src={`https://ui-avatars.com/api/?name=${profileName || 'User'}&background=4f46e5&color=fff`} 
            />
          </div>
          <div>
            {/* Dynamically updating the name */}
            <h4 className="font-bold text-lg text-on-surface">{profileName || 'User'}</h4>
            <p className="text-sm text-secondary mb-2">Full-Stack Engineer</p>
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">React</span>
              <span className="text-[10px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Rust</span>
              <span className="text-[10px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Node.js</span>
            </div>
          </div>
        </div>
      </header>

      {/* Kanban View */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Column: Applied */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-secondary">Applied</h3>
            <span className="text-xs bg-surface-container text-secondary px-2 py-1 rounded-full font-bold">02</span>
          </div>
          <div className="flex flex-col gap-4">
            <JobCard company="Anthropic" role="Senior Design Lead" status="Applied" time="2 days ago" icon="A" />
            <JobCard company="Vercel" role="Experience Architect" status="Applied" time="3 days ago" icon="V" />
          </div>
        </div>

        {/* Column: Pending */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-secondary">Pending</h3>
            <span className="text-xs bg-surface-container text-secondary px-2 py-1 rounded-full font-bold">01</span>
          </div>
          <div className="flex flex-col gap-4">
             <JobCard company="Stripe" role="Creative Technologist" status="Pending" time="Waiting for agent" icon="S" type="pending" />
          </div>
        </div>

        {/* Column: Interviewing */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-secondary">Interviewing</h3>
            <span className="text-xs bg-surface-container text-secondary px-2 py-1 rounded-full font-bold">01</span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-surface-container-lowest p-6 rounded-lg border-2 border-primary/10 shadow-[0px_24px_48px_rgba(53,37,205,0.08)] group hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center font-black text-primary text-xs">L</div>
                <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">Next Round</span>
              </div>
              <h4 className="font-bold text-on-surface">Principal AI Designer</h4>
              <p className="text-sm text-secondary mt-1">Linear</p>
              <div className="mt-6 p-4 bg-surface-container-low rounded-xl">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Tomorrow • 10:00 AM</p>
                <p className="text-xs text-secondary leading-relaxed">Technical deep-dive with Head of Design.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Column: Rejected */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-secondary">Rejected</h3>
            <span className="text-xs bg-surface-container text-secondary px-2 py-1 rounded-full font-bold">01</span>
          </div>
          <div className="flex flex-col gap-4 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
             <JobCard company="Meta" role="Product Designer" status="Closed" time="" icon="M" type="rejected" />
          </div>
        </div>

      </section>

      {/* Stats Bento Grid */}
      <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-surface-container-low rounded-xl p-10 flex flex-col justify-between aspect-square md:aspect-auto md:h-80">
          <div>
            <h5 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-4">Automation Health</h5>
            <p className="text-4xl font-extrabold tracking-tight">98.4%</p>
          </div>
          <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[98.4%]"></div>
          </div>
          <p className="text-sm text-secondary">Your Concierge is operating at peak efficiency across 4 networks.</p>
        </div>
        
        <div className="vibrant-gradient rounded-xl p-10 flex flex-col justify-between aspect-square md:aspect-auto md:h-80 text-white shadow-xl">
          <div>
            <span className="material-symbols-outlined text-4xl mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <h5 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Concierge Insight</h5>
            <p className="text-2xl font-bold leading-tight">Companies like Anthropic are looking for your "Rust" skill set.</p>
          </div>
          <button className="text-xs font-bold uppercase tracking-widest bg-white/20 hover:bg-white/30 backdrop-blur-md py-3 px-6 rounded-full w-fit transition-colors">
            Tailor CV
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-10 flex flex-col justify-between aspect-square md:aspect-auto md:h-80 cinematic-shadow">
          <div>
            <h5 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-4">Market Position</h5>
            <div className="flex items-center gap-4">
              <p className="text-4xl font-extrabold tracking-tight">Top 5%</p>
              <span className="material-symbols-outlined text-emerald-500">trending_up</span>
            </div>
          </div>
          <p className="text-sm text-secondary leading-relaxed">Compared to 1,200 other candidates in the engineering segment.</p>
        </div>
      </section>
    </div>
  );
}

// Micro-component for clean mapping
function JobCard({ company, role, status, time, icon, type = "applied" }) {
  const getBadgeStyle = () => {
    if(type === 'pending') return "bg-amber-50 text-amber-600";
    if(type === 'rejected') return "bg-zinc-100 text-zinc-500";
    return "bg-indigo-50 text-indigo-600";
  }

  return (
    <div className="bg-surface-container-lowest p-6 rounded-lg shadow-[0px_24px_48px_rgba(25,28,29,0.02)] group hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center font-black text-xs">{icon}</div>
        <span className={`${getBadgeStyle()} text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded`}>{status}</span>
      </div>
      <h4 className="font-bold text-on-surface">{role}</h4>
      <p className="text-sm text-secondary mt-1">{company}</p>
      {time && (
        <div className="mt-6 flex items-center gap-2 text-xs text-zinc-400">
          <span className="material-symbols-outlined text-sm">calendar_today</span>
          <span>{time}</span>
        </div>
      )}
    </div>
  );
}