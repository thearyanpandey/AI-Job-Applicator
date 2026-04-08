import React, { useEffect } from 'react';

export default function Landing({ onUploadSuccess }) {
  // Handle the scroll animations and navbar shifting using React's useEffect
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add a slight delay based on index for a staggered effect
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 50);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach((el) => observer.observe(el));

    // Nav background shift on scroll
    const handleScroll = () => {
      const nav = document.getElementById('main-nav');
      if (nav) {
        if (window.scrollY > 50) {
          nav.classList.add('py-2');
          nav.classList.remove('h-24');
          nav.classList.add('h-20');
        } else {
          nav.classList.remove('py-2');
          nav.classList.add('h-24');
          nav.classList.remove('h-20');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="bg-surface text-on-surface min-h-screen selection:bg-primary-container selection:text-white overflow-x-hidden">
      {/* TopNavBar */}
      <nav id="main-nav" className="fixed top-0 w-full z-50 glass-nav cinematic-shadow transition-all duration-300 h-24">
        <div className="flex justify-between items-center max-w-[1440px] mx-auto px-12 h-full">
          <div className="text-2xl font-black tracking-tighter text-zinc-900">Concierge AI</div>
          <div className="hidden md:flex gap-12 items-center">
            <a className="text-zinc-900 font-semibold transition-colors duration-200" href="#">Platform</a>
            <a className="text-zinc-500 hover:text-primary transition-colors duration-200" href="#">The Intelligence</a>
            <a className="text-zinc-500 hover:text-primary transition-colors duration-200" href="#">Success Stories</a>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-sm font-semibold text-zinc-500 hover:text-primary transition-colors">Sign In</button>
            <button className="vibrant-gradient text-white px-8 py-3 rounded-full text-sm font-bold cinematic-shadow transition-all active:scale-95 hover:shadow-lg hover:brightness-110 duration-200">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-32">
        {/* Hero Section */}
        <section className="max-w-[1440px] mx-auto px-12 pt-24 pb-12 text-center reveal-on-scroll">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-[3.5rem] md:text-[5.5rem] font-extrabold tracking-[-0.04em] leading-[1.05] text-on-background">
              The ultimate <span className="text-primary">cheat code</span> for your job search.
            </h1>
            <p className="text-xl md:text-2xl text-secondary max-w-2xl mx-auto font-medium leading-relaxed">
              Experience the silent power of an invisible concierge. Automate applications, refine presence, and secure offers—all while you sleep.
            </p>
            <div className="pt-12 animate-scale-up">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden cinematic-shadow bg-surface-container-low group">
                <div className="w-full h-full bg-indigo-900/20 transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center cursor-pointer hover:scale-110 hover:bg-white/30 transition-all duration-300">
                    <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee Section */}
        <section className="py-20 overflow-hidden reveal-on-scroll">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-zinc-400 tracking-[0.2em] uppercase">Seamlessly integrates with 50+ job boards</span>
          </div>
          <div className="marquee-container relative flex overflow-x-hidden">
            <div className="flex animate-marquee whitespace-nowrap gap-20 py-4 grayscale opacity-40 hover:opacity-80 transition-opacity">
              {/* Using text for logos to keep it clean, replace with actual SVG paths/images */}
              <div className="flex items-center gap-20 font-black text-2xl tracking-tighter">
                <span>Google</span>
                <span>Meta</span>
                <span>Amazon</span>
                <span>Netflix</span>
                <span>Apple</span>
                <span>LinkedIn</span>
                <span>Microsoft</span>
                <span>Tesla</span>
              </div>
              <div className="flex items-center gap-20 font-black text-2xl tracking-tighter">
                <span>Google</span>
                <span>Meta</span>
                <span>Amazon</span>
                <span>Netflix</span>
                <span>Apple</span>
                <span>LinkedIn</span>
                <span>Microsoft</span>
                <span>Tesla</span>
              </div>
            </div>
          </div>
        </section>

        {/* Onboarding Section */}
        <section className="bg-surface-container-low py-40">
          <div className="max-w-[1440px] mx-auto px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12 reveal-on-scroll">
                <div className="space-y-4">
                  <span className="label-md font-bold text-primary tracking-widest uppercase">The Onboarding</span>
                  <h2 className="text-6xl font-extrabold tracking-tight text-on-background">It starts with your story.</h2>
                  <p className="text-xl text-secondary leading-relaxed max-w-lg">
                    Our intelligence layer analyzes your career trajectory to build a custom automation profile. Drop your resume to begin the transformation.
                  </p>
                </div>
                
                <div className="space-y-10">
                  <div className="flex items-center gap-8 group">
                    <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center cinematic-shadow overflow-hidden p-2">
                       <span className="material-symbols-outlined text-primary text-4xl opacity-80 group-hover:opacity-100 transition-opacity">memory</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-on-surface">Neural Keyword Extraction</h4>
                      <p className="text-secondary text-sm">Deep semantic analysis of your expertise.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 group">
                    <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center cinematic-shadow overflow-hidden p-2">
                       <span className="material-symbols-outlined text-primary text-4xl opacity-80 group-hover:opacity-100 transition-opacity">radar</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-on-surface">Instant Market Matching</h4>
                      <p className="text-secondary text-sm">Real-time correlation with live job signals.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drag & Drop Zone */}
              <div className="space-y-8 reveal-on-scroll">
                <div 
                  onClick={onUploadSuccess} // Triggers the state change in your App.jsx
                  className="bg-surface-container-lowest p-16 rounded-[2rem] border-2 border-dashed border-outline-variant/30 cinematic-shadow group hover:border-primary hover:shadow-2xl transition-all duration-500 cursor-pointer text-center space-y-8 relative overflow-hidden"
                >
                  <div className="w-24 h-24 bg-primary/5 rounded-full mx-auto flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                    <span className="material-symbols-outlined text-primary text-4xl">upload_file</span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-extrabold tracking-tight">Upload Resume</h3>
                    <p className="text-lg text-secondary">Drag and drop your PDF or click to browse</p>
                  </div>
                  <div className="text-xs text-outline font-bold tracking-[0.15em] uppercase">Max file size: 10MB</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Insights */}
        <section className="max-w-[1440px] mx-auto px-12 py-40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Bento Item 1 */}
            <div className="md:col-span-2 bg-surface-container-lowest p-14 rounded-[2.5rem] cinematic-shadow flex flex-col justify-between h-[600px] reveal-on-scroll">
              <div className="space-y-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-4xl">query_stats</span>
                </div>
                <h3 className="text-5xl font-extrabold tracking-tight leading-[1.1]">The intelligence of a thousand recruiters.</h3>
                <p className="text-xl text-secondary max-w-lg leading-relaxed">Concierge AI monitors 2,400+ job boards in real-time, mapping your skills to hidden opportunities before they're even indexed.</p>
              </div>
              <div className="w-full h-56 bg-surface-container-low rounded-2xl overflow-hidden mt-8 border border-outline-variant/10">
                <div className="w-full h-full bg-gradient-to-tr from-indigo-100 to-indigo-50" />
              </div>
            </div>

            {/* Bento Item 2 */}
            <div className="bg-primary text-white p-14 rounded-[2.5rem] cinematic-shadow flex flex-col justify-between h-[600px] vibrant-gradient reveal-on-scroll">
              <div className="space-y-8">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-4xl">shield</span>
                </div>
                <h3 className="text-5xl font-extrabold tracking-tight leading-tight">Private by design.</h3>
              </div>
              <p className="text-primary-container text-xl font-medium leading-relaxed">Your data is never sold. Our invisible hand works only for you, encrypted at the edge and deleted on request.</p>
            </div>

            {/* Bento Item 3 */}
            <div className="bg-white p-14 rounded-[2.5rem] cinematic-shadow h-[450px] flex flex-col items-center justify-center text-center space-y-8 border border-zinc-50 reveal-on-scroll">
              <div className="w-28 h-28 rounded-full bg-primary/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-5xl">schedule</span>
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight">24/7 Silent Monitoring</h3>
              <p className="text-lg text-secondary">Automated applications dispatched while you're offline.</p>
            </div>

            {/* Bento Item 4 */}
            <div className="md:col-span-2 bg-zinc-50 p-14 rounded-[2.5rem] flex items-center justify-between h-[450px] overflow-hidden reveal-on-scroll">
              <div className="space-y-8 max-w-sm">
                <h3 className="text-5xl font-extrabold tracking-tight leading-[1.1]">Optimized Identity.</h3>
                <p className="text-xl text-secondary">We rewrite your profiles to match algorithmic biases of ATS systems.</p>
                <button className="text-primary font-extrabold flex items-center gap-3 group text-lg">
                  Explore Profile Engine 
                  <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                </button>
              </div>
              <div className="hidden lg:flex w-80 h-80 bg-white rounded-full cinematic-shadow -mr-28 flex-shrink-0 items-center justify-center border border-outline-variant/5">
                <span className="material-symbols-outlined text-primary text-[10rem] opacity-10">person_search</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-32 bg-white">
        <div className="flex flex-col items-center justify-center gap-16 max-w-[1440px] mx-auto reveal-on-scroll">
          <div className="text-4xl font-black tracking-tighter text-zinc-900">Concierge</div>
          <div className="flex gap-20">
            <a className="text-sm font-bold tracking-[0.2em] uppercase text-zinc-400 hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="text-sm font-bold tracking-[0.2em] uppercase text-zinc-400 hover:text-primary transition-colors" href="#">Terms</a>
            <a className="text-sm font-bold tracking-[0.2em] uppercase text-zinc-400 hover:text-primary transition-colors" href="#">API</a>
            <a className="text-sm font-bold tracking-[0.2em] uppercase text-zinc-400 hover:text-primary transition-colors" href="#">LinkedIn</a>
          </div>
          <div className="text-sm font-medium tracking-[0.1em] text-zinc-400 text-center opacity-70">
            © 2024 Concierge Intelligence. Private. Powerful. Silent.
          </div>
        </div>
      </footer>

      {/* BottomNavBar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full glass-nav shadow-[0px_-24px_48px_rgba(25,28,29,0.04)] px-6 py-5 flex justify-around items-center z-50 rounded-t-[2rem]">
        <div className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="text-[10px] font-extrabold uppercase tracking-tighter">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-zinc-400">
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[10px] font-extrabold uppercase tracking-tighter">Explore</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-zinc-400">
          <span className="material-symbols-outlined">stacks</span>
          <span className="text-[10px] font-extrabold uppercase tracking-tighter">Tracker</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-zinc-400">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-extrabold uppercase tracking-tighter">Profile</span>
        </div>
      </div>
    </div>
  );
}