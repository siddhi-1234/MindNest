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
  // Controlled input for the journal entry title
  const [title, setTitle] = useState("");
  // Controlled textarea input for journal entry body text
  const [content, setContent] = useState("");
  // Tagged mood accompanying the entry ("happy", "neutral", "sad")
  const [mood, setMood] = useState("neutral");
  // Active clock time updated every second
  const [currentTime, setCurrentTime] = useState(new Date());
  // Controls visibility of the full journal entries history modal
  const [showHistory, setShowHistory] = useState(false);
  // Controls visibility of the mobile navigation menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Authenticated Firebase student user instance
  const [currentUser, setCurrentUser] = useState(null);

  // Stored list of past journal entries fetched from the backend
  const [entries, setEntries] = useState([]);

  // === EFFECTS ===

  // 1. Monitor Authentication State on component mount
  useEffect(() => {
    // Listen for Firebase login status changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Save authenticated user and fetch their saved journal entries
        setCurrentUser(user);
        fetchUserEntries(user.uid);
      } else {
        // Clear user state and journal list upon logout
        setCurrentUser(null);
        setEntries([]);
      }
    });
    // Unsubscribe from auth listener when component unmounts
    return () => unsubscribe();
  }, []);

  // 2. Fetch User's Saved Journal Entries from Backend Database
  const fetchUserEntries = async (uid) => {
    try {
      // Query journal entries for the specific student UID
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/Journals?uid=${uid}`,
      );
      if (response.ok) {
        const data = await response.json();

        // Filter and map database records into component's entry format
        const userEntries = data
          .filter((entry) => entry.uid === uid)
          .map((entry) => ({
            id: entry._id,
            title: entry.title || "Untitled",
            content: entry.content,
            excerpt: entry.content.substring(0, 30) + "...",
            date: new Date(entry.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            fullDate: entry.date,
            mood: entry.mood || "neutral",
          }));

        // Sort entries in reverse chronological order (newest first)
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

  // 3. Real-Time Clock Timer (Updates timestamp display every second)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    // Cleanup: clear active timer interval on unmount
    return () => clearInterval(timer);
  }, []);

  // === DATE & TIME FORMATTERS ===
  // Human-readable formatted date string (e.g., "November 3, 2026")
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  // Human-readable formatted time string (e.g., "12:05 PM")
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  // === ACTION HANDLERS ===

  // Saves a new journal entry to the database
  const handleSave = async () => {
    // Validate that either title or content is present and student is logged in
    if ((!title.trim() && !content.trim()) || !currentUser) return;

    // Build journal payload object
    const journalData = {
      uid: currentUser.uid,
      title: title,
      content: content,
      mood: mood,
      date: new Date().toISOString(),
    };

    try {
      // POST new journal entry to backend endpoint
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/Journals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(journalData),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh entries list directly from server to ensure sync
        fetchUserEntries(currentUser.uid);
        // Clear editor fields
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

  // Clears editor inputs back to empty defaults
  const handleDiscard = () => {
    setTitle("");
    setContent("");
    setMood("neutral");
  };

  // Deletes an entry with optimistic UI update and server synchronization
  const handleDelete = async (id) => {
    // Store backup copy of entries in case deletion fails
    const previousEntries = [...entries];
    // Remove entry immediately from local UI state
    setEntries(entries.filter((entry) => entry.id !== id));

    try {
      // Send DELETE request to backend endpoint
      await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/Journals/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Delete failed", err);
      // Revert local state if server request fails
      setEntries(previousEntries);
      alert("Failed to delete entry.");
    }
  };

  // Loads an existing entry into the main editor for viewing or continuing
  const handleOpenEntry = (entry) => {
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    // Dismiss the history popup modal
    setShowHistory(false);
    // Smooth scroll back to top editor
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Applies markdown syntax formatting (Bold, Italic, Underline) to selected text in textarea
  const applyFormat = (type) => {
    const textarea = document.getElementById("journal-textarea");
    if (!textarea) return;

    // Detect character indices of highlighted text selection
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let wrapper = "";

    // Determine markdown delimiter based on format type
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

    // Wrap highlighted text and replace within content string
    const formatted = `${wrapper}${selectedText}${wrapper}`;
    const newText = content.substring(0, start) + formatted + content.substring(end);
    setContent(newText);
  };

  return (
    // Outer page container with dark slate background
    <div className="min-h-screen bg-[#0F172A] text-gray-200 font-sans relative">
      {/* ================= HISTORY MODAL ================= */}
      {/* Full journal entries modal popup */}
      {showHistory && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-[#1E293B] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-700 flex flex-col max-h-[80vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                All Journal Entries
              </h2>
              {/* Close modal button */}
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Modal Scrollable Entries List */}
            <div className="p-6 overflow-y-auto space-y-4">
              {entries.length === 0 ? (
                <p className="text-center text-gray-500">No entries yet.</p>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center bg-[#0F172A] p-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition"
                  >
                    {/* Entry title, date, and preview excerpt */}
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{entry.title}</h4>
                      <p className="text-sm text-gray-400">
                        {entry.date} • {entry.excerpt}
                      </p>
                    </div>

                    {/* Entry action buttons (Open into editor & Delete) */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* View / Open Entry button */}
                      <button
                        onClick={() => handleOpenEntry(entry)}
                        title="Open Entry"
                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-full transition"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {/* Delete Entry button */}
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
      {/* Top navigation header */}
      <nav className="flex items-center justify-between z-50 px-4 md:px-8 py-4 bg-[#0F172A] border-b border-gray-800 relative">
        {/* Brand logo & portal title */}
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

        {/* Centered navigation links for desktop */}
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

        {/* Mobile menu toggle button */}
        <button
          className="md:hidden text-gray-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile menu navigation drawer */}
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
          {/* Daily reflection prompt card */}
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

          {/* Recent entries sidebar list */}
          <div className="bg-[#1E293B] p-6 rounded-2xl border border-gray-700/50 shadow-lg">
            <h3 className="text-white font-bold mb-4">Recent Entries</h3>
            <div className="space-y-4">
              {/* Display top 4 recent entries */}
              {entries.slice(0, 4).map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => handleOpenEntry(entry)}
                  className="flex gap-4 group cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition"
                >
                  {/* Date badge with month and day number */}
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
                  {/* Title and preview excerpt */}
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
              {/* Fallback empty state */}
              {entries.length === 0 && (
                <p className="text-xs text-gray-500 italic">
                  Your recent thoughts will appear here.
                </p>
              )}
            </div>

            {/* Button to open full history modal */}
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
          {/* Editor Header */}
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

          {/* Journal Editor Box */}
          <div className="bg-[#1E293B] rounded-2xl border border-gray-700/50 shadow-lg overflow-hidden flex flex-col h-[600px]">
            {/* Meta Bar: Timestamp and Mood Selector */}
            <div className="px-6 py-4 border-b border-gray-700/50 flex flex-col md:flex-row justify-between md:items-center gap-4">
              {/* Live current date & time display */}
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

              {/* Mood picker buttons */}
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

            {/* Formatting Toolbar (Bold, Italic, Underline) */}
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

            {/* Editor Input Area */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto">
              {/* Entry title input */}
              <input
                type="text"
                placeholder="Entry Title..."
                className="w-full bg-transparent text-2xl md:text-3xl font-bold text-white placeholder-gray-600 border-none outline-none mb-4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {/* Journal body textarea */}
              <textarea
                id="journal-textarea"
                placeholder="How are you feeling right now?"
                className="w-full h-full bg-transparent text-gray-300 text-base md:text-lg leading-relaxed placeholder-gray-600 border-none outline-none resize-none font-mono"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {/* Editor Footer: Save and Discard Actions */}
            <div className="px-6 py-4 bg-[#182235] border-t border-gray-700/50 flex justify-between items-center">
              {/* Status hint text */}
              <span className="text-xs text-gray-500 italic hidden md:inline">
                {title || content ? "Unsaved changes..." : "Ready to write"}
              </span>
              {/* Action buttons */}
              <div className="flex gap-3 w-full md:w-auto justify-end">
                {/* Discard button */}
                <button
                  onClick={handleDiscard}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-full transition shadow-lg shadow-blue-600/20"
                >
                  Discard
                </button>
                {/* Save entry button */}
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
