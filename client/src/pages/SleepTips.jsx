import React, { useState } from "react";
import {
  Menu,
  X,
  Play,
  Clock,
  ArrowRight,
  Coffee,
  Smartphone,
  Thermometer,
  Moon,
  BookOpen,
  Headphones,
  Info,
} from "lucide-react";

const SleepTips = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // === INTERACTIVE STATES ===
  const [activeArticle, setActiveArticle] = useState(null); // For reading guides
  const [playingVideo, setPlayingVideo] = useState(null); // For playing videos

  // === DATA: QUICK TIPS ===
  const quickTips = [
    {
      icon: Coffee,
      title: "Limit Caffeine",
      desc: "Avoid coffee and energy drinks after 2 PM. Caffeine has a half-life of 5-6 hours.",
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    {
      icon: Smartphone,
      title: "Screen Curfew",
      desc: "Put devices away 1 hour before bed to reduce blue light exposure which blocks melatonin.",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      icon: Clock,
      title: "Consistent Routine",
      desc: "Wake up and go to bed at the same time every day, even on weekends, to set your clock.",
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      icon: Thermometer,
      title: "Cool Room",
      desc: "Keep your bedroom cool (around 65°F/18°C) for optimal deep sleep cycles.",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
  ];

  // === DATA: SLEEP ARTICLES ===
  const guides = [
    {
      id: 1,
      category: "ARTICLE",
      readTime: "5 min read",
      title: "Building the Perfect Evening Routine",
      desc: "Learn step-by-step how to decompress after a long day of classes and prepare your body for rest.",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLpp3fJJ8NmdpUgH_sc-1WJvdhjRQ7lzAOuw&s",
      content: `
        <h3 class="text-xl font-bold mb-3 text-white">The 3-2-1 Rule</h3>
        <p class="mb-4 text-gray-300">A simple framework to structure your evening:</p>
        <ul class="list-disc pl-5 mb-6 space-y-2 text-gray-300">
          <li><strong>3 hours before bed:</strong> Stop eating large meals.</li>
          <li><strong>2 hours before bed:</strong> Stop studying or working.</li>
          <li><strong>1 hour before bed:</strong> No screens (phones, laptops, TV).</li>
        </ul>
        <h3 class="text-xl font-bold mb-3 text-white">Create a "Wind Down" Trigger</h3>
        <p class="text-gray-300">Train your brain to recognize it's sleep time. This could be drinking chamomile tea, doing 5 minutes of stretching, or reading a fiction book.</p>
      `,
    },
    {
      id: 2,
      category: "SCIENCE",
      readTime: "8 min read",
      title: "Understanding REM Cycles",
      desc: "Why do we dream? Understand the stages of sleep and how they impact your memory retention.",
      image:
        "https://thosetwogirlspr.wordpress.com/wp-content/uploads/2010/04/girlongrass.jpg",
      content: `
        <h3 class="text-xl font-bold mb-3 text-white">The Architecture of Sleep</h3>
        <p class="mb-4 text-gray-300">Sleep isn't just one long state of unconsciousness. It cycles through 4 stages every 90 minutes.</p>
        <ul class="list-disc pl-5 mb-6 space-y-2 text-gray-300">
          <li><strong>Stages 1 & 2 (Light Sleep):</strong> Transition periods.</li>
          <li><strong>Stage 3 (Deep Sleep):</strong> Physical restoration and growth hormone release.</li>
          <li><strong>REM (Rapid Eye Movement):</strong> Where dreaming happens and memory consolidation occurs.</li>
        </ul>
        <h3 class="text-xl font-bold mb-3 text-white">Why Cramming Doesn't Work</h3>
        <p class="text-gray-300">REM sleep is crucial for converting short-term memories (what you studied) into long-term memories. Skipping sleep to study actually erases your effort.</p>
      `,
    },
    {
      id: 3,
      category: "HYGIENE",
      readTime: "7 min read",
      title: "Sleep hygiene tips",
      desc: "Paving the way for a better sleep may simply be a matter of adjusting our habits. Our bodies aren’t meant to stay amped up and then drop into sleep like a stone — they’re meant to gradually unwind. That's where sleep hygiene comes in.",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpy9wwvR5qEXay27AvPxqTKT-1yP1kdwIS9Q&s",
      content: `
        <h3 class="text-xl font-bold mb-3 text-white">Pause, let go, and reset</h3>
        <p class="mb-4 text-gray-300">Good quality sleep can also improve your mood and even your memory.</p>
        <ul class="list-disc pl-5 mb-6 space-y-2 text-gray-300">
          <li>Set a consistent sleep schedule</li>
          <li>Create a relaxing bedtime/pre-bedtime routine.</li>
          <li>Keep your room cool and comfortable.</li>
          <li>Dim the lights after dark.</li>
          <li>Avoid foods that can disrupt sleep.</li>
          <li>Get regular exercise.</li>
          <li>Limit or avoid naps during the day.</li>
        </ul>
      `,
    },
    {
      id: 4,
      category: "EXERCISE",
      readTime: "6 min read",
      title: "Exercise for Better Sleep",
      desc: "Explore 8 expert-recommended exercises for improving sleep",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS24Cb059vGFXUwUXlhiz1mgCDCODQEMpOOhg&s",
      content: `
        <h3 class="text-xl font-bold mb-3 text-white">Physical activity is undeniably one of the most effective ways to ensure a restful night</h3>
        <p class="mb-4 text-gray-300">Here's a comprehensive list of eight activities that can effectively improve your sleep quality:</p>
        <ul class="list-disc pl-5 mb-6 space-y-2 text-gray-300">
          <li><strong>Yoga</strong> combines physical postures with breath control and meditation, fostering relaxation and stress relief.</li>
          <li>The rhythmic nature of <strong>walking</strong>, particularly in natural environments like parks or by the beach, can be therapeutic, easing the transition into a restful night.</li>
          <li>Often referred to as "meditation in motion," <strong>Tai Chi</strong> is a series of slow, deliberate movements paired with deep breathing. This practice can alleviate stress and anxiety</li>
          <li>Like yoga,<strong> Pilates</strong> emphasizes breath-control while performing movements. It also focuses on core strength and flexibility</li>
          <li>Activities such as <strong>cycling, running, or swimming</strong> increase heart rate and induce the release of feel-good chemicals from the brain.</li>
          <li><strong>Progressive Muscle Relaxation</strong> involves tensing and then relaxing different muscle groups sequentially.</li>
          <li> Incorporating <strong>resistance exercises</strong> can improve sleep quality and reduce symptoms of anxiety and depression. </li>
          <li><strong>Deep breathing techniques</strong>, like diaphragmatic breathing or the “4-7-8” method, can trigger the relaxation response in the body, paving the way for sound sleep.</li>
          </ul>
      `,
    },
  ];

  // === DATA: RELAXATION TOOLS (VIDEOS) ===
  const tools = [
    {
      id: 1,
      type: "Audio",
      title: "Rain Sounds for Focus",
      author: "Natural White Noise",
      duration: "10:00",
      embedId: "mPZkdNFkNps", // Rain sounds ID
      image:
        "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      type: "Video",
      title: "POWERFUL SHIVA mantra to remove negative energy",
      author: "Mahakatha",
      duration: "11:06",
      embedId: "Jy5o66NXgVs", // Guided sleep meditation ID
      image: "https://img.youtube.com/vi/Jy5o66NXgVs/maxresdefault.jpg",
    },
    {
      id: 3,
      type: "Video",
      title: "4-7-8 Breathing Technique",
      author: "Relaxation",
      duration: "05:00",
      embedId: "gz4G31LGyog", // Breathing technique ID
      image:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      type: "Video",
      title: "15 Minute Healing Meditation Music",
      author: "Deep Breath",
      duration: "15:14",
      embedId: "IaDWJbCGbX0", // Breathing technique ID
      image: "https://img.youtube.com/vi/IaDWJbCGbX0/maxresdefault.jpg",
    },
    {
      id: 5,
      type: "Video",
      title: "5 Minute Meditation Before Sleep",
      author: "Great Meditation",
      duration: "5:27",
      embedId: "2K4T9HmEhWE", // Breathing technique ID
      image: "https://img.youtube.com/vi/2K4T9HmEhWE/maxresdefault.jpg",
    },
    {
      id: 6,
      type: "Video",
      title: "Soothing Flute Meditation Music",
      author: "Creative Mind",
      duration: "14:22",
      embedId: "ahx-j9bi_cA", // Breathing technique ID
      image: "https://img.youtube.com/vi/ahx-j9bi_cA/maxresdefault.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-gray-200 font-sans relative">
      {/* ================= ARTICLE MODAL ================= */}
      {activeArticle && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1E293B] w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative border border-gray-700">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="h-64 shrink-0 relative">
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] to-transparent"></div>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block">
                  {activeArticle.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {activeArticle.title}
                </h2>
              </div>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto text-gray-300 leading-relaxed text-lg">
              <div
                dangerouslySetInnerHTML={{ __html: activeArticle.content }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= NAVBAR ================= */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 bg-[#0F172A] border-b border-gray-800 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="MindNest"
            className="w-9 h-8 md:w-10 md:h-10 object-contain logo-hover"
          />
          <h1 className="text-[#6bdfb2] text-lg md:text-xl font-bold tracking-wide logo-hover">
            MindNest
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="/Dashboard" className="hover:text-white transition">
            Dashboard
          </a>
          <a href="/Resources" className="hover:text-white transition">
            Resources
          </a>
          <a href="/Journal" className="hover:text-white transition">
            Journal
          </a>
          <a href="/Counselling" className="hover:text-white transition">
            Counselling
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="md:hidden text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#1E293B] border-b border-gray-700 md:hidden flex flex-col shadow-xl z-50">
            <a
              href="/Dashboard"
              className="text-gray-300 p-4 border-b border-gray-700"
            >
              Dashboard
            </a>
            <a
              href="/Resources"
              className="text-gray-300 p-4 border-b border-gray-700"
            >
              Resources
            </a>
            <a
              href="/Journal"
              className="text-gray-300 p-4 border-b border-gray-700"
            >
              Journal
            </a>
            <a
              href="/Counselling"
              className="text-gray-300 p-4 border-b border-gray-700"
            >
              Counselling
            </a>
          </div>
        )}
      </nav>

      {/* ================= HERO SECTION ================= */}
      <div className="bg-[#0F172A] py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto bg-[#1E293B] rounded-3xl overflow-hidden border border-gray-700/50 shadow-2xl flex flex-col md:flex-row">
          {/* Left Content */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 w-max border border-blue-500/20">
              <Moon className="w-3 h-3 fill-current" /> Better Sleep
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight glow-pulse">
              Rest Your Mind, <br />{" "}
              <span className="text-blue-400">Recharge Your Future</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed zen-rise">
              Quality sleep is the foundation of mental health and academic
              success. Discover techniques, sounds, and routines to help you
              drift off peacefully.
            </p>
          </div>

          {/* Right Image */}
          <div className="md:w-1/2 relative min-h-[300px]">
            <img
              src="https://images.unsplash.com/photo-1532009877282-3340270e0529?auto=format&fit=crop&w=1200&q=80"
              alt="Sleeping on clouds"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B] to-transparent"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16 space-y-16">
        {/* ================= QUICK TIPS SECTION ================= */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Info className="w-5 h-5 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Quick Sleep Tips</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickTips.map((tip, index) => (
              <div
                key={index}
                className="bg-[#1E293B] p-6 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${tip.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition`}
                >
                  <tip.icon className={`w-6 h-6 ${tip.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {tip.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= ARTICLES SECTION ================= */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">
                Sleep Hygiene Guides
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {guides.map((guide) => (
              <div
                key={guide.id}
                onClick={() => setActiveArticle(guide)}
                className="bg-[#1E293B] rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition cursor-pointer group flex flex-col sm:flex-row gap-6 items-center"
              >
                <div className="w-full sm:w-32 h-32 shrink-0 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    {guide.category} <span className="text-gray-600">•</span>{" "}
                    <span className="text-gray-500 normal-case">
                      {guide.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                    {guide.desc}
                  </p>
                  <div className="flex items-center text-blue-400 text-sm font-bold gap-1 group-hover:gap-2 transition-all">
                    Read Guide <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= VIDEOS SECTION ================= */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Headphones className="w-5 h-5 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Relaxation Tools</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div key={tool.id} className="group cursor-pointer">
                <div className="relative rounded-2xl overflow-hidden aspect-video mb-4 border border-gray-700 shadow-lg bg-black">
                  {playingVideo === tool.id ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${tool.embedId}?autoplay=1`}
                      title={tool.title}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  ) : (
                    <div
                      onClick={() => setPlayingVideo(tool.id)}
                      className="w-full h-full relative"
                    >
                      <img
                        src={tool.image}
                        alt={tool.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition duration-300">
                          <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono border border-white/10">
                        {tool.duration}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition mb-1">
                  {tool.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{tool.type}</span>
                  <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                  <span>{tool.author}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 text-center">
        <p className="text-gray-600 text-xs">
          &copy; 2023 MindNest. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default SleepTips;
