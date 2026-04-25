import React, { useState, useEffect } from "react";
import "../App.css";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  User,
  Smile,
  Meh,
  Frown,
  BookOpen,
  MessageCircle,
  Calendar,
  Shield,
  PlayCircle,
  CloudRain,
  Clock,
  LogOut,
} from "lucide-react";

import Chatbot from "../pages/Chatbot";

const moodOptions = [
  { label: "Great", icon: Smile, color: "text-green-400", value: "Great" },
  { label: "Good", icon: Smile, color: "text-blue-400", value: "Good" },
  { label: "Okay", icon: Meh, color: "text-yellow-400", value: "Okay" },
  { label: "Bad", icon: Frown, color: "text-orange-400", value: "Bad" },
  { label: "Awful", icon: CloudRain, color: "text-gray-400", value: "Awful" },
];

const Dashboard = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [user, setUser] = useState(null);
  const [last7Moods, setLast7Moods] = useState([]);
  const [alreadyLoggedToday, setAlreadyLoggedToday] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [startMessage, setStartMessage] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const API_URL = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/mood`;

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const fetchLast7Days = async (uid) => {
    try {
      const res = await fetch(`${API_URL}/last7/${uid}`);
      const data = await res.json();
      setLast7Moods(data);
      const today = new Date().toISOString().split("T")[0];
      const loggedToday = data.some(
        (entry) => entry.date?.split("T")[0] === today,
      );
      setAlreadyLoggedToday(loggedToday);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchLast7Days(currentUser.uid);
      }
    });
  }, []);

  const logMood = async () => {
    if (!selectedMood || !user) return;
    try {
      const res = await fetch(`${API_URL}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, mood: selectedMood, note }),
      });
      if (res.ok) {
        setSelectedMood(null);
        setNote("");
        fetchLast7Days(user.uid);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openChatWithContext = (msg) => {
    setIsChatOpen(true);
    setStartMessage(msg);
  };

  const resources = [
    {
      id: 1,
      category: "MEDITATION",
      title: "5-Minute Breathing Exercise",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2073",
    },
    {
      id: 2,
      category: "MINDFULNESS",
      title: "Guide to Mindful Walking",
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2071",
    },
    {
      id: 3,
      category: "LIFESTYLE",
      title: "Tips for Better Sleep",
      image:
        "https://img.interiorcompany.com/interior/webproduct/165638663348135131171.png?aio=w-1200;",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans text-gray-200 relative overflow-x-hidden">
      {/* 1. BACKGROUND ORBS */}
      <div className="mesh-bg">
        <div className="aurora-orb orb-1"></div>
        <div className="aurora-orb orb-2"></div>
        <div className="aurora-orb orb-3"></div>
      </div>

      <Chatbot
        isOpenProp={isChatOpen}
        setIsOpenProp={setIsChatOpen}
        autoSendQuery={startMessage}
      />

      {/* 2. NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0F172A]/60 backdrop-blur-xl px-6 py-4 border-b border-white/5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="MindNest"
            className="w-10 h-10 object-contain logo-hover"
          />
          <h1 className="text-[#6bdfb2] text-xl font-bold tracking-wide">
            MindNest
          </h1>
        </div>

        <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <li>
            <a href="/dashboard" className="hover:text-white transition">
              Dashboard
            </a>
          </li>
          <li>
            <a href="/Resources" className="hover:text-white transition">
              Resources
            </a>
          </li>
          <li>
            <a href="/journal" className="hover:text-white transition">
              Journal
            </a>
          </li>
          <li>
            <a href="/counselling" className="hover:text-white transition">
              Counseling
            </a>
          </li>
          <li>
            <a href="/EmergencyPage" className="hover:text-white transition">
              Emergency
            </a>
          </li>
        </ul>

        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 hover:bg-white/20 transition"
          >
            <User className="text-white" size={24} />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 top-12 w-56 bg-[#1E293B] border border-white/5 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden backdrop-blur-3xl">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* 3. MAIN CONTENT LAYER */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-28 relative z-10">
        <header className="mb-10 welcome-text">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 tracking-tight glow-pulse">
            Hello, Student 👋
          </h1>
          <p className="text-gray-400 text-lg opacity-80">
            "The best way to predict the future is to create it."
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            {/* MOOD CHECK-IN */}
            <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl">
              <h3 className="font-bold text-xl text-white mb-8">
                How are you feeling today?
              </h3>
              <div className="flex flex-col gap-8">
                <div className="flex justify-between md:justify-start md:gap-10 overflow-x-auto pb-4">
                  {moodOptions.map((mood, i) => {
                    const Icon = mood.icon;
                    const isSelected = selectedMood === mood.value;
                    return (
                      <div
                        key={i}
                        onClick={() =>
                          !alreadyLoggedToday && setSelectedMood(mood.value)
                        }
                        className={`cursor-pointer flex flex-col items-center gap-3 transition-all duration-300 ${alreadyLoggedToday ? "opacity-40" : "hover:scale-110"}`}
                      >
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${isSelected ? "bg-blue-600/30 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-110" : "bg-[#0F172A] border-white/10"}`}
                        >
                          <Icon size={28} className={mood.color} />
                        </div>
                        <span
                          className={`text-xs font-bold ${isSelected ? "text-white" : "text-gray-500"}`}
                        >
                          {mood.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <textarea
                  className="w-full bg-[#0F172A]/50 text-white rounded-2xl p-5 border border-white/5 focus:border-blue-500 focus:outline-none transition-all"
                  rows="3"
                  placeholder="Add an optional note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button
                  onClick={logMood}
                  disabled={alreadyLoggedToday}
                  className="w-full md:w-max bg-blue-600 hover:bg-blue-500 text-white px-12 py-4 rounded-2xl font-bold transition shadow-xl disabled:bg-gray-800"
                >
                  {alreadyLoggedToday ? "Mood Logged ✅" : "Save Today's Mood"}
                </button>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <QuickActionCard
                icon={<Smile size={24} />}
                label="Mood Tracker"
                color="text-green-400"
                bg="bg-green-400/10"
              />
              <QuickActionCard
                icon={<BookOpen size={24} />}
                label="Journal"
                color="text-purple-400"
                bg="bg-purple-400/10"
                link="/journal"
              />
              <div
                onClick={() => setIsChatOpen(true)}
                className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition border border-white/5 group"
              >
                <div className="p-4 bg-blue-500/10 rounded-full group-hover:scale-110 transition">
                  <MessageCircle size={24} className="text-blue-400" />
                </div>
                <span className="font-bold text-sm text-gray-300">AI Chat</span>
              </div>
              <QuickActionCard
                icon={<PlayCircle size={24} />}
                label="Meditate"
                color="text-pink-400"
                bg="bg-pink-400/10"
                link="/Resources"
              />
              <QuickActionCard
                icon={<Calendar size={24} />}
                label="Counseling"
                color="text-orange-400"
                bg="bg-orange-400/10"
                link="/counselling"
              />
              <QuickActionCard
                icon={<Shield size={24} />}
                label="Crisis Help"
                color="text-red-400"
                bg="bg-red-400/10"
                link="/EmergencyPage"
              />
            </div>

            {/* RESOURCES GRID */}
            <div>
              <h3 className="font-bold text-xl text-white mb-6">
                Recommended for You
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {resources.map((item) => (
                  <div
                    key={item.id}
                    className="glass-card rounded-[2rem] p-4 hover:scale-[1.03] transition-all cursor-pointer group shadow-xl"
                  >
                    <div className="h-40 w-full overflow-hidden rounded-2xl mb-4 shadow-inner">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-110 transition duration-700"
                      />
                    </div>
                    <p className="text-[10px] font-black text-blue-400 tracking-widest mb-2 uppercase">
                      {item.category}
                    </p>
                    <h4 className="font-bold text-sm text-gray-100">
                      {item.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-600/90 to-blue-900/90 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 text-center text-white">
              <h3 className="font-black text-2xl mb-2 tracking-tight">
                AI Assistant
              </h3>
              <p className="text-xs text-blue-100 mb-8 opacity-80">
                I'm here to listen. How are you feeling?
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <Chip
                  label="I feel stressed"
                  onClick={() => openChatWithContext("I feel stressed")}
                />
                <Chip
                  label="I need advice"
                  onClick={() => openChatWithContext("I need advice")}
                />
                <Chip
                  label="Help me relax"
                  onClick={() => openChatWithContext("Help me relax")}
                />
              </div>
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full bg-white text-blue-700 py-4 rounded-2xl font-black shadow-xl hover:scale-[0.98] transition"
              >
                Chat Now
              </button>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem]">
              <h3 className="font-bold text-white mb-6 text-lg tracking-tight">
                Mood History
              </h3>
              {last7Moods.length === 0 ? (
                <div className="text-center py-10 opacity-40">
                  <p className="text-sm">No history found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {last7Moods.slice(0, 5).map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center p-4 bg-[#0F172A]/50 rounded-2xl border border-white/5 shadow-sm"
                    >
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter flex items-center gap-2">
                        <Clock size={12} /> {item.date}
                      </span>
                      <span
                        className={`font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-widest ${item.mood === "Great" ? "text-green-400 bg-green-400/10" : "text-blue-400 bg-blue-400/10"}`}
                      >
                        {item.mood}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ icon, label, color, bg, link }) => (
  <a
    href={link || "#"}
    className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-all border border-white/5 group shadow-lg"
  >
    <div
      className={`p-4 rounded-full transition group-hover:scale-110 ${bg} ${color}`}
    >
      {React.cloneElement(icon, { className: color })}
    </div>
    <span className="font-bold text-sm text-gray-300">{label}</span>
  </a>
);

const Chip = ({ label, onClick }) => (
  <span
    onClick={onClick}
    className="bg-white/10 hover:bg-white/25 px-4 py-2 rounded-full text-[10px] font-black text-white cursor-pointer border border-white/10 transition uppercase tracking-wider"
  >
    {label}
  </span>
);

export default Dashboard;
