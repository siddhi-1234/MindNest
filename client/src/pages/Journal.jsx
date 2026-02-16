import React, { useState, useEffect } from "react";
import {
  Bell,
  User,
  Lightbulb,
  Clock,
  Bold,
  Italic,
  Underline,
  List,
  Image as ImageIcon,
  Smile,
  Frown,
  Meh,
  Calendar,
  Trash2,
  X,
  Menu,
  Eye,
} from "lucide-react";
import { auth } from "../firebase"; // Import Auth
import { onAuthStateChanged } from "firebase/auth";

const JournalDashboard = () => {
  // === STATE MANAGEMENT ===
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("neutral");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Track logged-in user

  // Initialize with empty array, NOT dummy data
  const [entries, setEntries] = useState([]);

  // === EFFECTS ===

  // 1. Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchUserEntries(user.uid); // Fetch entries when user is confirmed
      } else {
        setCurrentUser(null);
        setEntries([]); // Clear entries on logout
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Entries from Backend
  const fetchUserEntries = async (uid) => {
    try {
      // Assuming your backend supports filtering by UID query param
      // If your API returns ALL journals, we filter on client side (shown below)
      const response = await fetch(
        `http://localhost:5000/api/Journals?uid=${uid}`,
      );
      if (response.ok) {
        const data = await response.json();

        // Filter specifically for this user just in case the backend returns all
        const userEntries = data
          .filter((entry) => entry.uid === uid)
          .map((entry) => ({
            id: entry._id,
            title: entry.title || "Untitled", // Ensure title exists in your DB schema or handle it
            content: entry.content,
            excerpt: entry.content.substring(0, 30) + "...",
            date: new Date(entry.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            fullDate: entry.date, // Keep for sorting
            mood: entry.mood || "neutral", // Ensure mood exists in DB schema
          }));

        // Sort by newest first (optional)
        setEntries(
          userEntries.sort(
            (a, b) => new Date(b.fullDate) - new Date(a.fullDate),
          ),
        );
      }
    } catch (error) {
      console.error("Failed to fetch journals:", error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // === HANDLERS ===

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const handleSave = async () => {
    if ((!title.trim() && !content.trim()) || !currentUser) return;

    const journalData = {
      uid: currentUser.uid, // Use actual UID
      title: title, // Add title to backend schema if not present
      content: content,
      mood: mood, // Add mood to backend schema if not present
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:5000/api/Journals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(journalData),
      });

      const data = await response.json();

      if (response.ok) {
        const newEntry = {
          id: data._id,
          title: title || "Untitled Entry",
          content: data.content,
          excerpt: data.content.slice(0, 30) + "...",
          date: new Date(data.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          mood: mood,
        };

        // Add new entry and re-fetch to ensure sync
        fetchUserEntries(currentUser.uid);

        handleDiscard();
        alert("Saved successfully!");
      } else {
        alert("Error: " + (data.message || "Could not save"));
      }
    } catch (error) {
      console.error("Error saving journal:", error);
      alert("Failed to connect to server.");
    }
  };

  const handleDiscard = () => {
    setTitle("");
    setContent("");
    setMood("neutral");
  };

  const handleDelete = async (id) => {
    // Optimistic delete
    const previousEntries = [...entries];
    setEntries(entries.filter((entry) => entry.id !== id));

    // Call backend to delete (Optional implementation)
    try {
      await fetch(`http://localhost:5000/api/Journals/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Delete failed", err);
      setEntries(previousEntries); // Revert on failure
      alert("Failed to delete entry.");
    }
  };

  const handleOpenEntry = (entry) => {
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applyFormat = (type) => {
    const textarea = document.getElementById("journal-textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = content;
    let wrapper = "";

    switch (type) {
      case "bold":
        wrapper = "**";
        break;
      case "italic":
        wrapper = "*";
        break;
      case "underline":
        wrapper = "__";
        break;
      default:
        return;
    }

    const formatted = `${wrapper}${selectedText}${wrapper}`;
    newText = content.substring(0, start) + formatted + content.substring(end);
    setContent(newText);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-gray-200 font-sans relative">
      {/* ================= HISTORY MODAL ================= */}
      {showHistory && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-[#1E293B] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-700 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                All Journal Entries
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {entries.length === 0 ? (
                <p className="text-center text-gray-500">No entries yet.</p>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center bg-[#0F172A] p-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{entry.title}</h4>
                      <p className="text-sm text-gray-400">
                        {entry.date} • {entry.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleOpenEntry(entry)}
                        title="Open Entry"
                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-full transition"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDelete(entry.id)}
                        title="Delete Entry"
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-full transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= NAVBAR ================= */}
      <nav className="flex items-center justify-between z-50 px-4 md:px-8 py-4 bg-[#0F172A] border-b border-gray-800 relative">
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/logo.png"
            alt="MindNest"
            className="w-15 h-10 object-contain logo-hover"
          />
          <h1 className="text-[#6bdfb2] text-xl font-bold tracking-wide sm:block logo-hover">
            MindNest
          </h1>
        </div>

        <div className="hidden md:flex items-center justify-center flex-1 gap-8 text-sm font-medium text-gray-400">
          <a href="/Dashboard" className="hover:text-white transition">
            Dashboard
          </a>
          <a href="/Resources" className="hover:text-white transition">
            Resources
          </a>
          <a href="/Journal" className="hover:text-white transition">
            Journal
          </a>
          <a href="/counselling" className="hover:text-white transition">
            Counselling
          </a>
          <a href="/EmergencyPage" className="hover:text-white transition">
            Emergency
          </a>
        </div>

        <button
          className="md:hidden text-gray-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#1E293B] border-b border-gray-700 md:hidden flex flex-col p-4 gap-4 shadow-xl z-50">
            <a href="/Dashboard" className="text-gray-300">
              Dashboard
            </a>
            <a href="/Resources" className="text-gray-300">
              Resources
            </a>
            <a href="/Journal" className="text-gray-300">
              Journal
            </a>
            <a href="/counselling" className="text-gray-300">
              Counselling
            </a>
            <a href="/EmergencyPage" className="text-gray-300">
              Emergency
            </a>
          </div>
        )}
      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
        {/* === LEFT SIDEBAR === */}
        <div className="col-span-1 md:col-span-4 lg:col-span-3 space-y-6">
          <div className="bg-[#1E293B] p-6 rounded-2xl border border-gray-700/50 shadow-lg">
            <div className="flex items-center gap-2 text-blue-400 mb-3">
              <Lightbulb className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                We are here to listen you...
              </span>
            </div>
            <p className="text-white font-medium leading-relaxed mb-4 logo-hover">
              "What is one small victory you experienced today, no matter how
              minor it seems?"
            </p>
          </div>

          <div className="bg-[#1E293B] p-6 rounded-2xl border border-gray-700/50 shadow-lg">
            <h3 className="text-white font-bold mb-4">Recent Entries</h3>
            <div className="space-y-4">
              {/* Only show up to 4 recent entries */}
              {entries.slice(0, 4).map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => handleOpenEntry(entry)}
                  className="flex gap-4 group cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition"
                >
                  <div
                    className={`flex flex-col items-center justify-center rounded-lg w-12 h-12 shrink-0 bg-gray-700/30 text-gray-400`}
                  >
                    <span className="text-[10px] font-bold uppercase">
                      {entry.date ? entry.date.split(" ")[0] : "N/A"}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {entry.date ? entry.date.split(" ")[1] : ""}
                    </span>
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-gray-200 font-semibold truncate group-hover:text-blue-400 transition">
                      {entry.title}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {entry.excerpt}
                    </p>
                  </div>
                </div>
              ))}
              {entries.length === 0 && (
                <p className="text-xs text-gray-500 italic">
                  Your recent thoughts will appear here.
                </p>
              )}
            </div>

            <button
              onClick={() => setShowHistory(true)}
              className="w-full mt-6 py-2 rounded-lg border border-gray-600 text-sm text-gray-300 hover:bg-gray-700 transition"
            >
              View All History
            </button>
          </div>
        </div>

        {/* === MAIN EDITOR === */}
        <div className="col-span-1 md:col-span-8 lg:col-span-9">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                My Daily Journal
              </h1>
              <p className="text-gray-400 text-sm md:text-base logo-hover">
                Reflect on your day, clear your mind.
              </p>
            </div>
          </div>

          <div className="bg-[#1E293B] rounded-2xl border border-gray-700/50 shadow-lg overflow-hidden flex flex-col h-[600px]">
            {/* Meta Bar */}
            <div className="px-6 py-4 border-b border-gray-700/50 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="hidden md:block h-4 w-[1px] bg-gray-600"></div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formattedTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">
                  Mood:
                </span>
                {[
                  { icon: Smile, label: "happy", color: "text-green-400" },
                  { icon: Meh, label: "neutral", color: "text-blue-400" },
                  { icon: Frown, label: "sad", color: "text-yellow-400" },
                ].map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setMood(m.label)}
                    className={`p-1.5 rounded-full transition ${
                      mood === m.label
                        ? "bg-gray-700 " + m.color
                        : "text-gray-500 hover:bg-gray-700"
                    }`}
                  >
                    <m.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Toolbar */}
            <div className="px-6 py-3 border-b border-gray-700/50 flex gap-1 overflow-x-auto">
              <button
                onClick={() => applyFormat("bold")}
                className="p-2 text-gray-400 hover:bg-gray-700 rounded-md transition"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFormat("italic")}
                className="p-2 text-gray-400 hover:bg-gray-700 rounded-md transition"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFormat("underline")}
                className="p-2 text-gray-400 hover:bg-gray-700 rounded-md transition"
              >
                <Underline className="w-4 h-4" />
              </button>
            </div>

            {/* Editor */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto">
              <input
                type="text"
                placeholder="Entry Title..."
                className="w-full bg-transparent text-2xl md:text-3xl font-bold text-white placeholder-gray-600 border-none outline-none mb-4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                id="journal-textarea"
                placeholder="How are you feeling right now?"
                className="w-full h-full bg-transparent text-gray-300 text-base md:text-lg leading-relaxed placeholder-gray-600 border-none outline-none resize-none font-mono"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#182235] border-t border-gray-700/50 flex justify-between items-center">
              <span className="text-xs text-gray-500 italic hidden md:inline">
                {title || content ? "Unsaved changes..." : "Ready to write"}
              </span>
              <div className="flex gap-3 w-full md:w-auto justify-end">
                <button
                  onClick={handleDiscard}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-full transition shadow-lg shadow-blue-600/20"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-full transition shadow-lg shadow-blue-600/20"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalDashboard;
