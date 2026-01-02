import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Play,
  Clock,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Trees, // Icon for Nature section
} from "lucide-react";

const StressRelief = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [activeArticle, setActiveArticle] = useState(null);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [breathText, setBreathText] = useState("Ready?");

  // === NEW: VIDEO PLAYER STATE ===
  const [playingVideo, setPlayingVideo] = useState(null);

  // === BREATHING LOGIC ===
  useEffect(() => {
    let interval;
    if (isBreathingModalOpen) {
      setBreathText("Inhale...");
      const cycle = () => {
        setTimeout(() => setBreathText("Hold..."), 4000);
        setTimeout(() => setBreathText("Exhale..."), 8000);
        setTimeout(() => setBreathText("Inhale..."), 12000);
      };
      cycle();
      interval = setInterval(cycle, 12000);
    } else {
      setBreathText("Ready?");
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isBreathingModalOpen]);

  // === DATA: ARTICLES ===
  const articles = [
    {
      id: 1,
      tag: "GUIDE",
      readTime: "5 min read",
      title: "The Science of Academic Burnout",
      desc: "Learn to distinguish between healthy stress (eustress) and burnout symptoms before they impact your grades.",
      image:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      content: `
        <h3 class="text-xl font-bold mb-3 text-white">What is Burnout?</h3>
        <p class="mb-4 text-gray-300">Burnout isn't just "working hard." It is a state of emotional, physical, and mental exhaustion caused by excessive and prolonged stress.</p>
        <h3 class="text-xl font-bold mb-3 text-white">The 3 Signs</h3>
        <ul class="list-disc pl-5 mb-6 space-y-2 text-gray-300">
          <li><strong>Exhaustion:</strong> Feeling drained even after sleep.</li>
          <li><strong>Cynicism:</strong> Feeling detached or negative about your studies.</li>
          <li><strong>Inefficacy:</strong> Feeling like you can't accomplish anything.</li>
        </ul>
      `,
    },
    {
      id: 2,
      tag: "TIPS",
      readTime: "3 min read",
      title: "Identifying Your Stress Triggers",
      desc: "A practical approach to journaling and self-reflection to pinpoint exactly what sets off your anxiety.",
      image:
        "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=80",
      content: `
        <h3 class="text-xl font-bold mb-3 text-white">The 'Stress Log' Method</h3>
        <p class="mb-4 text-gray-300">For one week, keep a notepad. Every time you feel your heart race or mood drop, write down:</p>
        <ol class="list-decimal pl-5 mb-6 space-y-2 text-gray-300">
          <li>What time is it?</li>
          <li>Who are you with?</li>
          <li>What were you doing?</li>
        </ol>
        <p class="text-gray-300">You will likely find a pattern (e.g., "Always right before Chem Lab" or "After scrolling social media").</p>
      `,
    },
  ];

  // === DATA: NATURE VIDEOS ===
  const natureVideos = [
    {
      id: 1,
      title: "Forest Rain Relaxation",
      duration: "10:00",
      embedId: "mPZkdNFkNps", // Rain sounds
      image:
        "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "Ocean Waves at Sunset",
      duration: "15:00",
      embedId: "bn9F19Hi1Lk", // Ocean waves
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Beautiful Nature Water fall sound",
      duration: "1:00:00",
      embedId: "xRcWlA1I9z0", // Ocean waves
      image: "https://img.youtube.com/vi/xRcWlA1I9z0/maxresdefault.jpg",
    },
    {
      id: 4,
      title: "Forest Sounds",
      duration: "28:03",
      embedId: "eNUpTV9BGac", // Ocean waves
      image: "https://img.youtube.com/vi/eNUpTV9BGac/maxresdefault.jpg",
    },
  ];

  // === DATA: SAVED TOOLS ===
  const savedTools = [
    { title: "Time & Boundaries", desc: "Setting limits on study hours." },
    { title: "The Pomodoro Technique", desc: "25m work / 5m break." },
    {
      title: "Music",
      desc: "Play calming or favorite music to shift your mood",
    },
    {
      title: "Laughter",
      desc: "Watch something funny or spend time with lighthearted people",
    },
    {
      title: "Deep Breathing",
      desc: "Focus on slow, deep breaths for a few minutes to lower cortisol",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-gray-200 font-sans relative">
      {/* ================= BREATHING MODAL ================= */}
      {isBreathingModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex justify-center items-center p-4 animate-in fade-in duration-300">
          <div className="relative flex flex-col items-center">
            <button
              onClick={() => setIsBreathingModalOpen(false)}
              className="absolute -top-16 right-0 text-gray-400 hover:text-white"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="relative flex items-center justify-center w-72 h-72 md:w-96 md:h-96 rounded-full border-4 border-blue-500/20 animate-pulse">
              <div className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_60px_rgba(59,130,246,0.6)] flex items-center justify-center">
                <span className="text-3xl font-bold text-white tracking-widest">
                  {breathText}
                </span>
              </div>
            </div>
            <p className="mt-8 text-xl text-blue-200 font-medium">
              Follow the rhythm. Relax your shoulders.
            </p>
          </div>
        </div>
      )}

      {/* ================= ARTICLE READER MODAL ================= */}
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
                  {activeArticle.tag}
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
            onClick={() => navigate("/Counselling")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-bold transition hidden sm:block"
          >
            Get Help Now
          </button>
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
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
        <div className="bg-[#1E293B] rounded-3xl overflow-hidden border border-gray-700/50 shadow-2xl flex flex-col md:flex-row">
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center animate-in slide-in-from-left duration-700">
            <div className="inline-block px-3 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 w-max border border-blue-500/20">
              Stress Management
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight glow-pulse">
              Find Your Calm <br />{" "}
              <span className="text-blue-500">In The Chaos</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed zen-rise">
              Explore curated resources, practical strategies, and mindfulness
              exercises designed to help you manage academic pressure and find
              balance.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsBreathingModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold transition shadow-lg shadow-blue-600/20 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Start Breathing
              </button>
            </div>
          </div>
          <div className="md:w-1/2 relative min-h-[300px] animate-in fade-in duration-1000">
            <img
              src="https://st2.depositphotos.com/3501059/5476/i/450/depositphotos_54765917-stress-free-zone-sign.jpg"
              alt="Meditation Silhouette"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B] via-[#1E293B]/50 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* ================= CONTENT GRID ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* === LEFT COLUMN (Col-8) === */}
          <div className="lg:col-span-8 space-y-10">
            {/* 1. Understanding Stress Section */}
            <section>
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-500" /> Understanding
                  Stress
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => setActiveArticle(article)}
                    className="bg-[#1E293B] rounded-2xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition group cursor-pointer flex flex-col h-full"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">
                          {article.tag}
                        </span>
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {article.readTime}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-blue-400 transition">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                        {article.desc}
                      </p>
                      <div className="flex items-center text-gray-500 text-sm group-hover:text-white transition font-medium">
                        Read Article <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. NEW SECTION: Nature for Stress Relief */}
            <section>
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trees className="w-6 h-6 text-green-500" /> Nature for Stress
                  Relief
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {natureVideos.map((video) => (
                  <div key={video.id} className="group cursor-pointer">
                    <div className="relative rounded-xl overflow-hidden aspect-video mb-3 border border-gray-700 shadow-lg bg-black">
                      {playingVideo === video.id ? (
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${video.embedId}?autoplay=1`}
                          title={video.title}
                          frameBorder="0"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div
                          onClick={() => setPlayingVideo(video.id)}
                          className="w-full h-full relative"
                        >
                          <img
                            src={video.image}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition duration-300">
                              <Play className="w-6 h-6 text-white fill-current ml-1" />
                            </div>
                          </div>
                          <span className="absolute bottom-2 right-2 bg-black/70 text-xs px-2 py-1 rounded text-white font-mono">
                            {video.duration}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-100 group-hover:text-blue-400 transition">
                      {video.title}
                    </h3>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* === RIGHT COLUMN: TOOLKIT (Col-4) === */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#FFF8F0] rounded-3xl p-6 border border-gray-200 sticky top-24">
              <div className="flex items-center gap-3 mb-4 text-gray-800">
                <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Short Stress Free Tips</h3>
              </div>
              <div className="space-y-4">
                {savedTools.map((tool, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start p-2 hover:bg-black/5 rounded-lg transition cursor-pointer"
                  >
                    <div className="mt-1 w-2 h-2 rounded-full bg-yellow-500 shrink-0"></div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">
                        {tool.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {tool.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-xs md:text-sm px-4 mt-12">
        <p>&copy; 2023 MindNest. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default StressRelief;
