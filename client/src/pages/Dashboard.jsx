import React, { useState, useEffect } from "react";
import "../App.css";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { HiMenu, HiX } from "react-icons/hi";
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
  LogOut, // New Icon
  Settings, // New Icon
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
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [last7Moods, setLast7Moods] = useState([]);
  const [alreadyLoggedToday, setAlreadyLoggedToday] = useState(false);

  // === CHATBOT STATE ===
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [startMessage, setStartMessage] = useState("");

  // === NEW: PROFILE DROPDOWN STATE ===
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const API_URL = "http://localhost:5000/api/mood";

  // === HANDLE LOGOUT ===
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      window.location.href = "/"; // Redirect to login/home after logout
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
      } else {
        // Optional: Redirect if not logged in
        // window.location.href = "/";
      }
    });
  }, []);

  const logMood = async () => {
    if (!selectedMood || !user) {
      alert("Please select a mood");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          mood: selectedMood,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
        return;
      }
      setSelectedMood(null);
      setNote("");
      fetchLast7Days(user.uid);
    } catch (err) {
      console.error("Error logging mood:", err);
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
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
    },
    {
      id: 2,
      category: "MINDFULNESS",
      title: "Guide to Mindful Walking",
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop",
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
    <div className="min-h-screen bg-[#0F172A] font-sans text-gray-200 pt-20 md:pt-24 relative overflow-x-hidden">
      {/* === CHATBOT INTEGRATION === */}
      <Chatbot
        isOpenProp={isChatOpen}
        setIsOpenProp={setIsChatOpen}
        autoSendQuery={startMessage}
      />

      {/* ===================== NAVBAR ===================== */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0F172A] px-6 py-4 border-b border-gray-800 flex items-center justify-between">
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

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-300 text-2xl focus:outline-none"
          onClick={() => setOpen(!open)}
        >
          {open ? <HiX /> : <HiMenu />}
        </button>

        {/* Desktop Menu */}
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

        {/* === INTERACTIVE PROFILE DROPDOWN === */}
        <div className="hidden md:block relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:bg-white/20 transition focus:outline-none"
          >
            <User className="text-white" size={24} />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-12 w-56 bg-[#1E293B] border border-gray-700 rounded-xl shadow-2xl py-2 z-50 animate-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-gray-700">
                <p className="text-sm text-white font-bold">Student Account</p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email || "Loading..."}
                </p>
              </div>

              <div className="py-1">
                <a
                  href="/Dashboard"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                >
                  <User size={16} /> My Profile
                </a>
                <a
                  href="/Settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                >
                  <Settings size={16} /> Settings
                </a>
              </div>

              <div className="border-t border-gray-700 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition text-left"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Dropdown Menu (Navbar Links) */}
        {open && (
          <div className="absolute top-full left-0 w-full bg-[#1E293B] border-b border-gray-700 md:hidden flex flex-col shadow-xl z-50 animate-in slide-in-from-top-5">
            <a
              href="/dashboard"
              className="text-gray-300 p-4 border-b border-gray-700 hover:bg-gray-700"
            >
              Dashboard
            </a>
            <a
              href="/Resources"
              className="text-gray-300 p-4 border-b border-gray-700 hover:bg-gray-700"
            >
              Resources
            </a>
            <a
              href="/journal"
              className="text-gray-300 p-4 border-b border-gray-700 hover:bg-gray-700"
            >
              Journal
            </a>
            <a
              href="/counselling"
              className="text-gray-300 p-4 border-b border-gray-700 hover:bg-gray-700"
            >
              Counseling
            </a>
            <a
              href="/EmergencyPage"
              className="text-gray-300 p-4 border-b border-gray-700 hover:bg-gray-700"
            >
              Emergency
            </a>
            <a
              href="/Settings"
              className="text-gray-300 p-4 border-b border-gray-700 hover:bg-gray-700"
            >
              Settings
            </a>

            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              className="text-red-400 p-4 text-left hover:bg-gray-700 flex items-center gap-2"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        )}
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 glow-pulse">
            Hello, Student 👋
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            "The best way to predict the future is to create it." - Peter
            Drucker
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-2 space-y-8">
            {/* MOOD CHECK-IN */}
            <div className="bg-[#1E293B] p-6 rounded-3xl shadow-lg border border-gray-700">
              <h3 className="font-bold text-lg text-white mb-6">
                How are you feeling today?
              </h3>

              <div className="flex flex-col gap-6">
                <div className="flex justify-between md:justify-start md:gap-8 overflow-x-auto pb-2">
                  {moodOptions.map((mood, i) => {
                    const Icon = mood.icon;
                    const isSelected = selectedMood === mood.value;
                    return (
                      <div
                        key={i}
                        onClick={() =>
                          !alreadyLoggedToday && setSelectedMood(mood.value)
                        }
                        className={`cursor-pointer flex flex-col items-center gap-2 transition-all duration-200 min-w-[60px] 
                          ${
                            alreadyLoggedToday
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:scale-110"
                          }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 border-2
                            ${
                              isSelected
                                ? "bg-blue-600/20 border-blue-500 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                : "bg-[#0F172A] border-gray-700 hover:border-gray-500"
                            }`}
                        >
                          <Icon size={26} className={mood.color} />
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            isSelected ? "text-white" : "text-gray-500"
                          }`}
                        >
                          {mood.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <textarea
                    className="w-full bg-[#0F172A] text-gray-200 rounded-xl p-4 text-sm resize-none border border-gray-700 focus:border-blue-500 focus:outline-none transition"
                    rows="3"
                    placeholder="Add an optional note about your day..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <button
                    onClick={logMood}
                    disabled={alreadyLoggedToday}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-8 py-2.5 rounded-full font-bold transition shadow-lg shadow-blue-900/20"
                  >
                    {alreadyLoggedToday ? "Mood Logged ✅" : "Log Mood"}
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK ACCESS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                className="bg-[#1E293B] p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-800 transition border border-gray-700 group"
              >
                <div className="p-3 bg-blue-500/10 rounded-full group-hover:scale-110 transition">
                  <MessageCircle size={24} className="text-blue-400" />
                </div>
                <span className="font-bold text-xs md:text-sm text-gray-300 text-center">
                  AI Chat
                </span>
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

              <div className="bg-red-900/20 p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center gap-3 border border-red-500/30 cursor-pointer hover:bg-red-900/30 transition">
                <Shield size={24} className="text-red-500" />
                <span className="font-bold text-xs md:text-sm text-red-400">
                  Crisis Help
                </span>
              </div>
            </div>

            {/* WELLNESS RESOURCES */}
            <div>
              <h3 className="font-bold text-lg text-white mb-4">
                Recommended for You
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {resources.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#1E293B] rounded-2xl p-3 border border-gray-700 hover:border-gray-600 transition cursor-pointer group"
                  >
                    <div className="h-32 w-full overflow-hidden rounded-xl mb-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>
                    <p className="text-[10px] font-bold text-blue-400 tracking-wider mb-1">
                      {item.category}
                    </p>
                    <h4 className="font-bold text-sm text-gray-200 line-clamp-1">
                      {item.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
          <div className="space-y-6">
            {/* AI Assistant Widget */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl shadow-xl text-center text-white">
              <h3 className="font-bold text-lg mb-1">AI Assistant</h3>
              <p className="text-xs text-blue-100 mb-6">
                I'm here to listen. How are you feeling?
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
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
                className="w-full bg-white text-blue-700 py-3 rounded-xl font-bold shadow-md hover:bg-gray-100 transition"
              >
                Chat Now
              </button>
            </div>

            {/* Last 7 Days Moods */}
            <div className="bg-[#1E293B] p-6 rounded-3xl shadow-sm border border-gray-700">
              <h3 className="font-bold text-white mb-4">Mood History</h3>
              {last7Moods.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No data yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {last7Moods.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center text-sm p-2 bg-[#0F172A] rounded-lg"
                    >
                      <span className="text-gray-400 text-xs flex items-center gap-2">
                        <Clock size={14} /> {item.date}
                      </span>
                      <span
                        className={`font-bold px-2 py-1 rounded text-xs
                        ${
                          item.mood === "Great"
                            ? "text-green-400 bg-green-400/10"
                            : item.mood === "Bad"
                              ? "text-orange-400 bg-orange-400/10"
                              : "text-blue-400 bg-blue-400/10"
                        }`}
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

// Component for Quick Action Cards
const QuickActionCard = ({ icon, label, color, bg, link }) => (
  <a
    href={link || "#"}
    className="bg-[#1E293B] p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-800 transition border border-gray-700 group text-decoration-none"
  >
    <div
      className={`p-3 rounded-full transition group-hover:scale-110 ${bg} ${color}`}
    >
      {React.cloneElement(icon, { className: color })}
    </div>
    <span className="font-bold text-xs md:text-sm text-gray-300 text-center">
      {label}
    </span>
  </a>
);

// Component for Assistant Chips
const Chip = ({ label, onClick }) => (
  <span
    onClick={onClick}
    className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-xs font-medium text-white cursor-pointer border border-white/10 transition"
  >
    {label}
  </span>
);

export default Dashboard;
