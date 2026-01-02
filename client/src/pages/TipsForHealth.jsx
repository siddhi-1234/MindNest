import React, { useState } from "react";
import {
  Menu,
  X,
  Play,
  Clock,
  Bookmark,
  Zap,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

const TipsForHealth = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // === NEW: ARTICLE MODAL STATE ===
  const [activeArticle, setActiveArticle] = useState(null);

  // === NEW: VIDEO STATE ===
  const [playingVideo, setPlayingVideo] = useState(null);

  const featuredArticle = {
    id: "feat-1",
    tag: "NUTRITION",
    readTime: "5 min read",
    title: "Managing Exam Stress Through Diet",
    desc: "Want some great advice on healthy meals and snacks that support your brain function and help you focus on your studies?",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
    content: `
      <h3 class="text-xl font-bold mb-3 text-white">Start your day</h3>
      <p class="mb-4">Start with a brisk walk around the block, along the beach or around your local park. Eat breakfast to kick start your metabolism:</p>
      <ul class="list-disc pl-5 mb-6 space-y-2">
        <li>whole grain cereals with milk and fruit</li>
        <li>poached eggs, whole grain toast and mushrooms</li>
        <li>yoghurt and berries</li>
        <li>green smoothie (1 cup spinach, blitz with ¼ avocado, 1 banana and 1.5 cups of water or coconut water)</li>
      </ul>
      <h3 class="text-xl font-bold mb-3 text-white">Lunch time favourites:</h3>
      <ul class="list-disc pl-5 mb-6 space-y-2">
        <li>microwaved potato with tuna/salmon/cheese and green leafy salad</li>
        <li>potato or pasta salad</li>
        <li>vegie burger in a whole grain bun full of leafy greens, sliced beetroot and tomato</li>
        <li>Aim for 2 fruits and 5 vegetables each day as a minimum.</li>
      </ul>
    `,
  };

  const guides = [
    {
      id: 1,
      tag: "HYDRATION",
      title: "The Science of Hydration & Focus",
      desc: "Even mild dehydration can impair cognitive performance. Learn simple tricks to keep your water intake up.",
      image:
        "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80",
      content: `
        <h3 class="text-xl font-bold mb-3 text-white">Why Water Matters</h3>
        <p class="mb-4">Your brain is 73% water. Even a 2% drop in hydration can lead to difficulty focusing, memory problems, and "brain fog."</p>
        <h3 class="text-xl font-bold mb-3 text-white">Hydration Hacks</h3>
        <p>If you hate the taste of plain water, try infusing it with lemon, cucumber, or mint. Keep a water bottle on your desk—visual cues help you remember to sip!</p>
      `,
    },
    {
      id: 2,
      tag: "ACTIVITY",
      title: "5-Minute Desk Stretches",
      desc: "Release tension in your neck and shoulders without leaving your study spot. Essential for marathon sessions.",
      image:
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
      content: `
        <h3 class="text-xl font-bold mb-3 text-white">Neck Rolls</h3>
        <p class="mb-4">Slowly roll your head in a circle, 5 times clockwise and 5 times counter-clockwise. This releases tension from looking down at textbooks.</p>
        <h3 class="text-xl font-bold mb-3 text-white">Seated Twist</h3>
        <p>Place your right hand on the back of your chair and gently twist your torso to the right. Hold for 15 seconds. Repeat on the left side.</p>
      `,
    },
    {
      id: 3,
      tag: "SLEEP",
      title: "Reclaiming Your Sleep Schedule",
      desc: "Pulling all-nighters actually hurts your GPA. Here is a realistic plan to reset your body clock this weekend.",
      image:
        "https://cdn.home-designing.com/wp-content/uploads/2018/10/luxury-bedroom-arched-interior-1024x1365.jpg",
      content: `
        <h3 class="text-xl font-bold mb-3 text-white">The "No-Screen" Rule</h3>
        <p class="mb-4">Blue light from phones suppresses melatonin. Try reading a physical book for 30 minutes before bed instead of scrolling.</p>
        <h3 class="text-xl font-bold mb-3 text-white">Consistency is Key</h3>
        <p>Wake up at the same time every day, even on weekends. This trains your body to feel tired at the right time at night.</p>
      `,
    },
    {
      id: 4,
      tag: "HABITS",
      title: "Morning Routines that Stick",
      desc: "Start your day with intention. A simple 10-minute routine can drastically improve your mood and productivity.",
      image:
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80",
      content: `
        <h3 class="text-xl font-bold mb-3 text-white">The 10-Minute Power Start</h3>
        <ul class="list-decimal pl-5 space-y-2">
          <li><strong>Minute 1-2:</strong> Drink a large glass of water.</li>
          <li><strong>Minute 3-7:</strong> Move your body (stretch or jumping jacks).</li>
          <li><strong>Minute 8-10:</strong> Write down your top 3 goals for the day.</li>
        </ul>
      `,
    },
  ];

  const energyBoosters = [
    {
      title: "The 20-20-20 Rule",
      desc: "Every 20 mins, look at something 20 feet away for 20 seconds to save your eyes.",
    },
    {
      title: "Power Nap Smart",
      desc: "Keep naps under 20 minutes to avoid sleep inertia and grogginess.",
    },
    {
      title: "Sunlight First",
      desc: "Get 10 minutes of daylight within an hour of waking up.",
    },
  ];

  // === UPDATED VIDEO DATA WITH YOUTUBE IDs ===
  const videos = [
    {
      id: 1,
      title: "Mindfulness for Beginners",
      duration: "3:45",
      embedId: "ZToicYcHIOU", // YouTube ID for Mindfulness
      image:
        "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "Quick Healthy Snacks",
      duration: "2:15",
      embedId: "tbFMoQGPsVg", // YouTube ID for Healthy Snacks
      image:
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Quick Healthy Salads",
      duration: "3:55",
      embedId: "Qb5Amsjdw5Q", // YouTube ID for Healthy Snacks
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR18wvA_qA_5fxq4JA-94F5RAzyOfCU0FbY3g&s",
    },
    {
      id: 4,
      title: "5 Easy Smoothie Recipes",
      duration: "4:50",
      embedId: "vFoSINFnFZo", // YouTube ID for Healthy Snacks
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZYULc4wSaayUQwo79_g4t6Yv8UB7NXvrunw&s",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-gray-200 font-sans relative">
      {/* ================= ARTICLE READER MODAL ================= */}
      {activeArticle && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1E293B] w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative border border-gray-700">
            {/* Close Button */}
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Image */}
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

            {/* Scrollable Content */}
            <div className="p-6 md:p-8 overflow-y-auto text-gray-300 leading-relaxed text-lg">
              <div
                dangerouslySetInnerHTML={{ __html: activeArticle.content }}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 bg-[#0F172A] flex justify-between items-center text-sm text-gray-500">
              <span>Wellness Team</span>
              <button
                onClick={() => setActiveArticle(null)}
                className="text-blue-400 hover:text-white transition font-medium"
              >
                Close Article
              </button>
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
      <div className="relative bg-gradient-to-b from-[#1e293b] to-[#0F172A] py-16 px-4 md:px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 glow-pulse">
          Nourish Your Mind & Body
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg zen-rise">
          Explore simple, science-backed habits to help you thrive this
          semester. Find balance in your daily routine.
        </p>
      </div>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* === LEFT COLUMN (Articles) === */}
        <div className="lg:col-span-8 space-y-12">
          {/* Featured Article */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-white">
                Student Essentials
              </h2>
            </div>

            {/* CLICKABLE FEATURED ARTICLE */}
            <div
              onClick={() => setActiveArticle(featuredArticle)}
              className="bg-[#1E293B] rounded-2xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition group flex flex-col md:flex-row cursor-pointer"
            >
              <div className="md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                <img
                  src={featuredArticle.image}
                  alt="Featured"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
              </div>
              <div className="p-8 md:w-1/2 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-xs mb-4">
                  <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded font-bold tracking-wider">
                    {featuredArticle.tag}
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {featuredArticle.readTime}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 leading-tight group-hover:text-blue-400 transition">
                  {featuredArticle.title}
                </h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-3">
                  {featuredArticle.desc}
                </p>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold w-max transition">
                  Read Article
                </button>
              </div>
            </div>
          </section>

          {/* Latest Guides Grid */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">
              Latest Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guides.map((guide) => (
                <div
                  key={guide.id}
                  onClick={() => setActiveArticle(guide)}
                  className="bg-[#1E293B] rounded-2xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition group flex flex-col h-full cursor-pointer"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={guide.image}
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-black/50 p-2 rounded-full backdrop-blur-sm hover:bg-blue-600 transition">
                      <Bookmark className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                      {guide.tag}
                    </span>
                    <h3 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-blue-400 transition">
                      {guide.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                      {guide.desc}
                    </p>
                    <div className="flex items-center text-gray-500 text-sm group-hover:text-white transition">
                      Read more <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* === RIGHT COLUMN (Sidebar Widgets) === */}
        <div className="lg:col-span-4 space-y-8">
          {/* Energy Boosters Widget */}
          <div className="bg-gradient-to-br from-blue-900/20 to-[#1E293B] rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <h3 className="font-bold text-white text-lg">Energy Boosters</h3>
            </div>

            <div className="space-y-4">
              {energyBoosters.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-1">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-200">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Watch & Learn Widget (UPDATED TO BE INTERACTIVE) */}
          <div className="bg-[#1E293B] rounded-2xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-lg">Watch & Learn</h3>
            </div>

            <div className="space-y-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="group cursor-pointer relative rounded-xl overflow-hidden aspect-video bg-black"
                >
                  {/* Conditional Rendering: Show Iframe if playing, else show Image */}
                  {playingVideo === video.id ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video.embedId}?autoplay=1`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  ) : (
                    <div
                      onClick={() => setPlayingVideo(video.id)}
                      className="w-full h-full relative"
                    >
                      <img
                        src={video.image}
                        alt={video.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition">
                          <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/90 to-transparent">
                        <h4 className="text-white text-sm font-bold line-clamp-1">
                          {video.title}
                        </h4>
                        <span className="text-xs text-gray-300 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {video.duration}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-xs md:text-sm px-4 mt-12">
        <p>&copy; 2023 MindNest. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default TipsForHealth;
