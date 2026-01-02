import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Play,
  Pause,
  Wind,
  ArrowRight,
  Clock,
  Quote,
} from "lucide-react";

const Resources = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // === BREATHING EXERCISE STATE ===
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathText, setBreathText] = useState("Ready?");

  // === VIDEO & ARTICLE STATE ===
  const [playingVideo, setPlayingVideo] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);

  // === BREATHING LOGIC ===
  useEffect(() => {
    let interval;
    if (isBreathing) {
      setBreathText("Inhale...");
      // Simple 4-4-4 Box Breathing simulation for UI text
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
  }, [isBreathing]);

  // === 1. BREATHING VIDEOS DATA ===
  const breathingVideos = [
    {
      id: 1,
      title: "10-Minute Box Breathing",
      desc: "Reset your nervous system with this powerful box breathing technique.",
      duration: "10:18",
      embedId: "tEmt1Znux58",
      image: "https://img.youtube.com/vi/tEmt1Znux58/maxresdefault.jpg",
    },
    {
      id: 2,
      title: "Equal Breathing Exercise for Sleep",
      desc: "Prepare your body and mind for sleep with this breathing exercise to calm your nervous system.",
      duration: "20:00",
      embedId: "4wEDoKm40Yc",
      image: "https://img.youtube.com/vi/4wEDoKm40Yc/maxresdefault.jpg",
    },
    {
      id: 3,
      title: "15 Minute Deep Breathing Exercise",
      desc: "Deep Breathing exercises help reduce anxiety, stress, fatigue, restlessness, difficulty sleeping and physical discomfort.",
      duration: "13:56",
      embedId: "F28MGLlpP90",
      image: "https://img.youtube.com/vi/F28MGLlpP90/maxresdefault.jpg",
    },
    {
      id: 4,
      title: "Daily Pranayama under 15-Minutes | Breathing Exercises & Yoga",
      desc: "Pranayam, the art of breath control, is not just an ancient practice; it’s a pathway to enhancing your physical, mental, and spiritual well-being",
      duration: "13:28",
      embedId: "I77hh5I69gA",
      image: "https://img.youtube.com/vi/I77hh5I69gA/maxresdefault.jpg",
    },
    {
      id: 5,
      title: "478 Breathing Exercise 10 Minutes",
      desc: "4-7-8 breathing is a simple yet powerful breathing technique that can help to reduce stress, anxiety, and insomnia. It is based on the ancient yogic practice of pranayama, which involves controlling the breath to achieve a state of relaxation",
      duration: "10:00",
      embedId: "9Fp9AW57tYg",
      image: "https://img.youtube.com/vi/9Fp9AW57tYg/maxresdefault.jpg",
    },
    {
      id: 6,
      title: "Ultimate Relaxation: Wim Hof Alternative Breathing Exercise",
      desc: "The breathing exercise has a profound effect and should be practiced in the way it is explained. Always do the breathing exercise in a safe environment",
      duration: "21:29",
      embedId: "CcFJRFTSgzU",
      image: "https://img.youtube.com/vi/CcFJRFTSgzU/maxresdefault.jpg",
    },
  ];

  // === 2. MEDITATION VIDEOS DATA ===
  const meditationVideos = [
    {
      id: 7,
      title: "Mindfulness for Beginners",
      desc: "Learn the basics of mindfulness meditation to reduce stress and improve focus.",
      duration: "15:00",
      embedId: "ssss7V1_eyA",
      image: "https://img.youtube.com/vi/ssss7V1_eyA/maxresdefault.jpg",
    },
    {
      id: 8,
      title: "Deep Sleep Release",
      desc: "Guided body scan to help you detach from the day and drift off.",
      duration: "20:00",
      embedId: "aEqlQvczMJQ",
      image: "https://img.youtube.com/vi/aEqlQvczMJQ/maxresdefault.jpg",
    },
    {
      id: 9,
      title:
        "5 Minute Meditation Music - with Earth Resonance Frequency for Deeper Relaxation",
      desc: "Five minutes of quietly observing your breath and your inner body motions. This music was created specifically for you to use to feel a deep state of calm. ",
      duration: "05:07",
      embedId: "nkqnuxKj8Dk",
      image: "https://img.youtube.com/vi/nkqnuxKj8Dk/maxresdefault.jpg",
    },
    {
      id: 10,
      title:
        "5 Minute Calming Chakra Healing Meditation, Positive Energy Vibration, Aura Cleansing Meditation",
      desc: "Meditation music with positive energy vibration for chakra healing, aura cleansing",
      duration: "05:00",
      embedId: "ErT_5RblmEQ",
      image: "https://img.youtube.com/vi/ErT_5RblmEQ/maxresdefault.jpg",
    },
    {
      id: 11,
      title: "10 Minute Guided Breathing Meditation",
      desc: "This Original 10 minute guided meditation recorded by us, will bring you into a peaceful state with just you and your breath.  Within just a few moments, with a focus on your breathing can heighten your mindfulness and clarity of the mind.  Enjoy!",
      duration: "10:15",
      embedId: "VUjiXcfKBn8",
      image: "https://img.youtube.com/vi/VUjiXcfKBn8/maxresdefault.jpg",
    },
    {
      id: 12,
      title:
        "15 Minute Healing Meditation Music, Sound Healing For Deep Relaxation & Stress Relief",
      desc: "Practice meditation for anxiety relief to improve focus, stay in the present moment and let go of anxious feelings. ",
      duration: "15:14",
      embedId: "vPvIxwh9N2w",
      image: "https://img.youtube.com/vi/vPvIxwh9N2w/maxresdefault.jpg",
    },
  ];

  const articles = [
    {
      id: 1,
      tag: "TECHNIQUE",
      readTime: "4 min read",
      title: "The 4-7-8 Breathing Method",
      desc: "Dr. Andrew Weil's famous technique for falling asleep in under 60 seconds.",
      image:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      content: `
        <h3 class="text-xl font-bold mb-2">How to do it</h3>
        <ol class="list-decimal pl-5 mb-4 space-y-2">
          <li>Exhale completely through your mouth, making a whoosh sound.</li>
          <li>Close your mouth and inhale quietly through your nose to a mental count of <strong>4</strong>.</li>
          <li>Hold your breath for a count of <strong>7</strong>.</li>
          <li>Exhale completely through your mouth, making a whoosh sound to a count of <strong>8</strong>.</li>
        </ol>
        <p>This is one breath. Now inhale again and repeat the cycle three more times for a total of four breaths.</p>
      `,
    },
    {
      id: 2,
      tag: "SCIENCE",
      readTime: "6 min read",
      title: "Why Deep Breathing Calms You",
      desc: "Understanding the Vagus Nerve and how your breath acts as a remote control for your brain.",
      image:
        "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80",
      content: `
        <h3 class="text-xl font-bold mb-2">The Vagus Nerve</h3>
        <p class="mb-4">Your Vagus nerve is the commander of your "Rest and Digest" system. When you breathe deeply and slowly, you physically stimulate this nerve.</p>
        <p>This sends a signal to your brain that says "We are safe," causing your heart rate to slow down and cortisol levels to drop immediately.</p>
      `,
    },
    {
      id: 3,
      tag: "BREATHING",
      readTime: "6 min read",
      title: "Breathing exercises for stress",
      desc: "This calming breathing technique for stress, anxiety and panic takes just a few minutes and can be done anywhere.",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR31YDZGNZZ_VCt16pzEQyk24MFokEa_wrVCg&s",
      content: `
        <h3 class="text-xl font-bold mb-2">JUST RELAX!!!</h3>
        <p class="mb-4">You will get the most benefit if you do it regularly, as part of your daily routine.You can do it standing up, sitting in a chair that supports your back, or lying on a bed or yoga mat on the floor.</p>
        <ol class="list-decimal pl-5 mb-4 space-y-2">
          <li>If you're sitting, place your arms on the chair arms.</li>
          <li>Let your breath flow as deep down into your belly as is comfortable, without forcing it.</li>
          <li>Breathe in gently and regularly. Some people find it helpful to count steadily from 1 to 5. You may not be able to reach 5 at first</li>
          <li>let it flow out gently, counting from 1 to 5 again, if you find this helpful.</li>
        </ol>
      `,
    },
    {
      id: 4,
      tag: "MEDITATION",
      readTime: "7 min read",
      title: "3-minute mindful body",
      desc: "Try the 3-minute mindful body scan meditation for yourself",
      image:
        "https://ahead-app.com/_next/image?url=https%3A%2F%2Fstorage.googleapis.com%2Fweb-api-media-uploads%2Fmedia%2Ftmp5cm4qg6m_0935ad9a35%2Ftmp5cm4qg6m_0935ad9a35.png&w=3840&q=75",
      content: `
        <h3 class="text-xl font-bold mb-2">Meditation for stress free</h3>
        <p class="mb-4">Body scan meditation works by bringing your attention to various parts of your body in turn.</p>
        <ol class="list-decimal pl-5 mb-4 space-y-2">
          <li>Sit or lie down comfortably in a chair or on the bed. Close your eyes and take a few deep breaths</li>
          <li>Focus on your breathing. Notice how the air feels drawing into your body, then let the breath flow out again naturally.</li>
          <li>Shift your attention slowly down your arms and into your hands. Relax your arms and let them feel heavy by your sides.</li>
          <li>Bring your awareness to your chest and stomach. Feel your breath fill your chest, deep into your diaphragm.</li>
          <li>Focus on your back, starting at the upper back, let your attention drift down to your lower back. If you notice any areas of tension, relax the muscles and feel them soften.</li> 
          <li>Take a moment to feel your whole body. Notice the sensation of relaxing against the chair or bed. Allow a sense of calm to wash over you.</li>
          </ol>
      `,
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
      <div className="relative bg-gradient-to-b from-[#1e293b] to-[#0F172A] py-12 md:py-20 px-4 md:px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 relative z-10 glow-pulse">
          Wellness Library
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-base md:text-lg px-2 relative z-10 zen-rise">
          Curated resources to help you breathe, focus, and find your center.
        </p>

        {/* Quote Card */}
        <div className="max-w-2xl mx-auto relative group">
          <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl transition-all duration-500 hover:bg-white/10">
            <Quote
              size={40}
              className="absolute -top-4 -left-2 text-blue-400/30 transform -scale-x-100 fill-current"
            />
            <div className="flex flex-col items-center">
              <p className="text-xl md:text-2xl font-serif italic text-blue-100/90 leading-relaxed tracking-wide">
                "Breath is the bridge which connects life to consciousness."
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
                <span className="text-blue-400/80 text-xs font-bold uppercase tracking-[0.2em]">
                  Daily Wisdom
                </span>
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
              </div>
            </div>
            <Quote
              size={40}
              className="absolute -bottom-4 -right-2 text-blue-400/30 fill-current"
            />
          </div>
        </div>
      </div>

      {/* ================= BREATHE & CENTER SECTION ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-16">
        <div className="relative bg-[#1E293B] rounded-3xl p-8 md:p-12 overflow-hidden border border-gray-700/50 shadow-2xl">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-0"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-0"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Left: Text & CTA */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-500/20">
                <Wind className="w-4 h-4" /> Featured Tool
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Breathe & Center
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-lg">
                Feeling overwhelmed? Take a moment to pause. Follow our guided
                breathing pacer to reduce cortisol levels instantly.
              </p>
              <button
                onClick={() => setIsBreathing(!isBreathing)}
                className={`px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3 mx-auto md:mx-0 ${
                  isBreathing
                    ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
                    : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/30"
                }`}
              >
                {isBreathing ? (
                  <>
                    Stop Exercise <Pause className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Start Exercise <Play className="w-5 h-5 fill-current" />
                  </>
                )}
              </button>
            </div>

            {/* Right: The Animation Circle */}
            <div className="flex-1 flex justify-center items-center">
              {/* Outer Rings */}
              <div
                className={`relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-blue-500/20 transition-all duration-[4000ms] ease-in-out ${
                  isBreathing ? "scale-110" : "scale-100"
                }`}
              >
                <div
                  className={`absolute inset-0 rounded-full border-2 border-blue-500/10 transition-all duration-[4000ms] ease-in-out ${
                    isBreathing ? "scale-150 opacity-50" : "scale-100 opacity-0"
                  }`}
                ></div>

                {/* The Core Circle */}
                <div
                  className={`w-48 h-48 md:w-60 md:h-60 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_50px_rgba(59,130,246,0.4)] flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${
                    isBreathing ? "scale-110" : "scale-100"
                  }`}
                >
                  <span className="text-2xl font-bold text-white tracking-widest animate-pulse">
                    {isBreathing ? breathText : "START"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12 space-y-16">
        {/* === SECTION 1: BREATHING EXERCISES === */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Breathing Exercises
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {breathingVideos.map((video) => (
              <div key={video.id} className="group cursor-pointer">
                <div className="relative rounded-xl overflow-hidden aspect-video mb-4 border border-gray-700 shadow-lg bg-black">
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
                <h3 className="font-bold text-xl text-gray-100 group-hover:text-blue-400 transition mb-1">
                  {video.title}
                </h3>
                <p className="text-gray-400 text-sm">{video.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* === SECTION 2: GUIDED MEDITATIONS === */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Guided Meditations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {meditationVideos.map((video) => (
              <div key={video.id} className="group cursor-pointer">
                <div className="relative rounded-xl overflow-hidden aspect-video mb-4 border border-gray-700 shadow-lg bg-black">
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
                <h3 className="font-bold text-xl text-gray-100 group-hover:text-blue-400 transition mb-1">
                  {video.title}
                </h3>
                <p className="text-gray-400 text-sm">{video.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reading Section (Kept as is) */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Reads for Calmness
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => setActiveArticle(article)}
                className="bg-[#1E293B] rounded-2xl p-6 flex flex-col sm:flex-row gap-6 border border-gray-700 hover:border-blue-500/50 transition group cursor-pointer"
              >
                <div className="w-full sm:w-40 h-40 shrink-0 rounded-xl overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center gap-3 text-xs mb-3">
                      <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded font-bold tracking-wider">
                        {article.tag}
                      </span>
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {article.readTime}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-100 mb-2 group-hover:text-blue-400 transition leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {article.desc}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-blue-400 text-sm font-medium gap-1 group-hover:gap-2 transition-all">
                    Read Article <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-xs md:text-sm px-4">
        <p>&copy; 2023 MindNest. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Resources;
