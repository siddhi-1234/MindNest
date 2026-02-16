import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import {
  Menu,
  X,
  Play,
  Pause,
  Wind,
  Moon,
  Heart,
  Leaf,
  Headphones,
  ArrowRight,
  Clock,
  Music,
  Quote,
} from "lucide-react";

const Resources = () => {
  const navigate = useNavigate(); // 2. Initialize navigation hook
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Resources");

  // === VIDEO STATE ===
  const [playingVideo, setPlayingVideo] = useState(null);

  // === ARTICLE STATE ===
  const [activeArticle, setActiveArticle] = useState(null);

  // === AUDIO STATE ===
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Handle Audio Play/Pause
  useEffect(() => {
    if (currentSong && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentSong, isPlaying]);

  const handleSongClick = (song) => {
    if (currentSong?.title === song.title) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  // === DATA WITH PATHS ===
  // 3. Added 'path' to each category to link to your other pages
  const categories = [
    { name: "All Resources", icon: null, path: "/Resources" },
    { name: "Breathing & Meditation", icon: Wind, path: "/BreathMed" }, // Links to BreathMed.jsx
    { name: "Tips for Good Health", icon: Heart, path: "/TipsForHealth" },
    { name: "Tips for Better Sleep", icon: Moon, path: "/SleepTips" },
    { name: "Stress Management", icon: Leaf, path: "/StressRelief" },
  ];

  const videos = [
    {
      id: 1,
      title: "5-Minute Desk Yoga",
      desc: "A quick routine to stretch your body during study breaks.",
      duration: "06:35",
      embedId: "jOfshreyu4w",
      image: "https://img.youtube.com/vi/jOfshreyu4w/maxresdefault.jpg",
    },
    {
      id: 2,
      title: "Guided Meditation for Anxiety",
      desc: "Let go of stress and find your center with this soothing voice guide.",
      duration: "10:00",
      embedId: "VpHz8Mb13_Y",
      image: "https://img.youtube.com/vi/VpHz8Mb13_Y/maxresdefault.jpg",
    },
  ];

  const songs = [
    {
      title: "Weightless",
      artist: "Marconi Union",
      time: "8:00",
      cover:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=100&q=80",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      title: "Rainy Day Comfort",
      artist: "Nature Sounds",
      time: "3:45",
      cover:
        "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=100&q=80",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
    {
      title: "Here Comes The Sun",
      artist: "Acoustic Cover",
      time: "2:50",
      cover:
        "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=100&q=80",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    },
    {
      title: "River Flows in You",
      artist: "Yiruma",
      time: "4:12",
      cover:
        "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=100&q=80",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    },
  ];

  const articles = [
    {
      id: 1,
      tag: "STRESS FREE TIPS",
      readTime: "5 min read",
      title: "Quick Ways to reduces stress!",
      desc: "Taking care of your long-term mental and physical health is an important part of stress management",
      image: "https://mithaahara.com/wp-content/uploads/2024/11/stress.png",
      content: `
        <h3 class="text-xl font-bold mb-2">Ways to Reduce Stress</h3>
        <p class="mb-4">A stress-free life involves managing challenges through physical wellness, mental practices, and lifestyle adjustments.</p>
        <ul class="list-disc pl-5 mb-4 space-y-2">
          <li>Slow, deep breaths can help lower blood pressure and heart rate.</li>
          <li>Sometimes belting out the lyrics to a favorite tune makes everything seem all right.</li>
          <li>Go for a quick stroll around the block.</li>
          <li>Standing up for a quick stretch can relieve muscle tension.</li>
          <li>Five minutes of peace is all it takes to reap the benefits of meditation.</li>
          <li>Laughter is one of the sillier ways to beat stress.</li>
          <li>Putting our emotions on paper can make them seem less intimidating. Try journaling.</li>
        </ul>
      `,
    },
    {
      id: 2,
      tag: "SLEEP HYGIENE",
      readTime: "5 min read",
      title:
        "Facing Sleep Challenges? Here’s How to Improve Your Sleep Hygiene",
      desc: "Good sleep hygiene is important because of how crucial getting good sleep is for your mental and physical health.",
      image:
        "https://images.squarespace-cdn.com/content/v1/5df960f9ecb4023606059a33/1608653250735-7J9MVLC3HUEFY9LOFS6S/QI+%288%29.png",
      content: `
        <h3 class="text-xl font-bold mb-2">Sleep Cycles</h3>
        <p class="mb-4">If you don’t sleep well, you can take several steps to improve your sleep!</p>
        <ul class="list-disc pl-5 mb-4 space-y-2">
        <li>Keep a consistent sleep schedule</li>
        <li>Turn off electronic devices before you go to sleep</li>
        <li>Limit your caffeine intake</li>
        <li>Optimize your sleep environment</li>
        <li>Avoid large meals late at night</li>
        </ul>
      `,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-gray-200 font-sans relative">
      {/* ================= HIDDEN AUDIO PLAYER ================= */}
      <audio
        ref={audioRef}
        src={currentSong?.audio}
        onEnded={() => setIsPlaying(false)}
      />

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
          <a href="/EmergencyPage" className="hover:text-white transition">
            Emergency
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
          <div className="absolute top-full left-0 w-full bg-[#1E293B] border-b border-gray-700 md:hidden flex flex-col shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
            <a
              href="/Dashboard"
              className="text-gray-300 hover:text-white hover:bg-gray-700/50 px-6 py-4 border-b border-gray-700/50"
            >
              Dashboard
            </a>
            <a
              href="/Resources"
              className="text-gray-300 hover:text-white hover:bg-gray-700/50 px-6 py-4 border-b border-gray-700/50"
            >
              Resources
            </a>
            <a
              href="/Journal"
              className="text-gray-300 hover:text-white hover:bg-gray-700/50 px-6 py-4 border-b border-gray-700/50"
            >
              Journal
            </a>
            <a
              href="/Counselling"
              className="text-gray-300 hover:text-white hover:bg-gray-700/50 px-6 py-4 border-b border-gray-700/50"
            >
              Counselling
            </a>
            <a
              href="/EmergencyPage"
              className="text-gray-300 hover:text-white hover:bg-gray-700/50 px-6 py-4 border-b border-gray-700/50"
            >
              Emergency
            </a>
          </div>
        )}
      </nav>

      {/* ================= HERO SECTION ================= */}
      <div className="relative bg-gradient-to-b from-[#1e293b] to-[#0F172A] py-12 md:py-20 px-4 md:px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 relative z-10 glow-pulse">
          Wellness Library
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-base md:text-lg px-2 relative z-10 zen-rise">
          Curated resources for your mind and body. Find peace, support, and
          tools to navigate your day.
        </p>

        <div className="max-w-2xl mx-auto relative group">
          <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl transition-all duration-500 hover:bg-white/10 hover:border-blue-400/30">
            <div className="absolute -top-4 -left-2 text-blue-400/30 transform -scale-x-100">
              <Quote size={40} className="fill-current" />
            </div>
            <div className="flex flex-col items-center">
              <p className="text-xl md:text-2xl font-serif italic text-blue-100/90 leading-relaxed tracking-wide animate-in fade-in duration-1000">
                "In the midst of movement and chaos, keep stillness inside of
                you."
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
                <span className="text-blue-400/80 text-xs font-bold uppercase tracking-[0.2em]">
                  Daily Reflection
                </span>
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-2 text-blue-400/30">
              <Quote size={40} className="fill-current" />
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-400/5 rounded-2xl blur-xl animate-pulse -z-10"></div>
        </div>
      </div>

      {/* ================= CATEGORY TABS (UPDATED) ================= */}
      <div className="px-4 md:px-12 py-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 md:gap-4 min-w-max md:w-max md:mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setActiveCategory(cat.name);
                navigate(cat.path); // 4. Navigate to the path on click
              }}
              className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeCategory === cat.name
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                  : "bg-[#1E293B] text-gray-300 hover:bg-gray-700 border border-gray-700"
              }`}
            >
              {cat.icon && <cat.icon className="w-4 h-4" />}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* === LEFT COLUMN === */}
        <div className="lg:col-span-8 space-y-8 md:space-y-12">
          {/* Watch & Relax */}
          <section>
            <div className="flex justify-between items-end mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Watch & Relax
              </h2>
              <a
                href="#"
                className="text-blue-400 text-sm hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((video) => (
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
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition duration-300">
                            <Play className="w-5 h-5 text-white fill-current ml-0.5" />
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
                  <p className="text-gray-400 text-sm mt-1">{video.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tips Section */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
              Tips for Stress-Free Living
            </h2>
            <div className="space-y-6">
              {articles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setActiveArticle(article)}
                  className="bg-[#1E293B] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 md:gap-6 border border-gray-700 hover:border-blue-500/50 transition group cursor-pointer"
                >
                  <div className="w-full sm:w-48 h-40 sm:h-32 shrink-0 rounded-xl overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-3 text-xs mb-2">
                        <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded font-bold tracking-wider">
                          {article.tag}
                        </span>
                        <span className="text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {article.readTime}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-100 mb-2 group-hover:text-blue-400 transition">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {article.desc}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center text-blue-400 text-sm font-medium gap-1 group-hover:gap-2 transition-all">
                      Read Article <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* === RIGHT COLUMN (Music Widget) === */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          <div className="bg-[#1E293B] rounded-2xl p-6 border border-gray-700 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div
                className={`p-2 rounded-lg transition-colors ${
                  isPlaying
                    ? "bg-green-500/20 text-green-400"
                    : "bg-blue-600/20 text-blue-500"
                }`}
              >
                {isPlaying ? (
                  <Music className="w-6 h-6 animate-pulse" />
                ) : (
                  <Headphones className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  {currentSong ? "Now Playing" : "Uplifting Tunes"}
                </h3>
                <p className="text-xs text-gray-400">
                  {currentSong ? currentSong.title : "Songs for difficult days"}
                </p>
              </div>
            </div>
            <div className="space-y-4 relative z-10">
              {songs.map((song, i) => (
                <div
                  key={i}
                  onClick={() => handleSongClick(song)}
                  className={`flex items-center gap-3 group cursor-pointer p-2 rounded-lg transition border ${
                    currentSong?.title === song.title
                      ? "bg-blue-600/20 border-blue-500/50"
                      : "hover:bg-gray-700/50 border-transparent"
                  }`}
                >
                  <div className="relative w-10 h-10 shrink-0">
                    <img
                      src={song.cover}
                      alt="cover"
                      className="w-full h-full rounded-md object-cover"
                    />
                    {currentSong?.title === song.title && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md">
                        {isPlaying ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-sm font-bold truncate ${
                        currentSong?.title === song.title
                          ? "text-blue-400"
                          : "text-gray-200"
                      }`}
                    >
                      {song.title}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {song.artist}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {song.time}
                  </span>
                </div>
              ))}
            </div>
            {isPlaying && (
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/20 to-transparent pointer-events-none"></div>
            )}
          </div>

          <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-900 to-[#1E293B] border border-blue-800/50">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">
                  Feeling Overwhelmed?
                </h3>
                <Wind className="w-8 h-8 text-blue-300 opacity-50" />
              </div>
              <p className="text-sm text-blue-100 mb-6 leading-relaxed">
                Take a moment to breathe. Follow the circle to reset your
                nervous system.
              </p>
              <button
                onClick={() => navigate("/BreathMed")}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition shadow-lg shadow-blue-900/50"
              >
                Start breathing
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-xs md:text-sm px-4">
        <p>
          &copy; 2023 MindNest. All rights reserved.{" "}
          <br className="md:hidden" /> Privacy Policy &nbsp;|&nbsp; Crisis
          Support
        </p>
      </footer>
    </div>
  );
};

export default Resources;
