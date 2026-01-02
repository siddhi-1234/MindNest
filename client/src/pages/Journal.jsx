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

const JournalDashboard = () => {
  // === STATE MANAGEMENT ===
  const [title, setTitle] = useState(""); // Title of the journal entry
  const [content, setContent] = useState(""); // Content of the journal entry
  const [mood, setMood] = useState("neutral"); // Mood: happy, neutral, sad
  const [currentTime, setCurrentTime] = useState(new Date()); // Current date and time
  const [showHistory, setShowHistory] = useState(false); // Show/Hide history modal
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile menu toggle

  // Dummy Data for Journal Entries
  const [entries, setEntries] = useState([
    {
      id: 1,
      title: "Feeling Overwhelmed",
      content:
        "Today was harder than expected. I had too many assignments due and I felt like I couldn't catch up. I need to break things down into smaller tasks.",
      excerpt: "Today was harder than expected...",
      date: "Oct 23",
      mood: "sad",
    },
    {
      id: 2,
      title: "A Good Walk",
      content:
        "Took a break from studying and went for a walk in the park. The fresh air really helped clear my mind. I saw a cute dog!",
      excerpt: "Took a break from studying...",
      date: "Oct 21",
      mood: "happy",
    },
    {
      id: 3,
      title: "Exam Anxiety",
      content:
        "I can't seem to focus on my revision. Every time I open the book I get anxious. I should try the Pomodoro technique.",
      excerpt: "I can't seem to focus on my...",
      date: "Oct 18",
      mood: "neutral",
    },
    {
      id: 4,
      title: "Coffee Break",
      content:
        "Found a nice cafe today called 'The Bean'. Had a great latte and read a book for 30 mins.",
      excerpt: "Found a nice cafe today...",
      date: "Oct 15",
      mood: "happy",
    },
  ]);

  // === EFFECTS ===
  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // === HANDLERS ===

  // Format date and time for display
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

  // Save journal entry to Backend
  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    // 1. Prepare the data for the Backend
    const journalData = {
      uid: "test-user-123", // Replace with actual user UID from Auth
      content: content,
      date: new Date().toISOString().split("T")[0], // Formats as "2023-10-27"
    };

    try {
      // 2. Send POST request to your Backend
      const response = await fetch("http://localhost:5000/api/Journals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(journalData),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. If Backend accepts it, update Frontend UI
        const newEntry = {
          id: data._id, // Use the real ID from MongoDB
          title: title || "Untitled Entry",
          content: data.content,
          excerpt: data.content.slice(0, 30) + "...",
          date: new Date(data.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          mood: mood,
        };

        setEntries([newEntry, ...entries]);
        handleDiscard(); // Clear the form
        alert("Saved to Database successfully!");
      } else {
        // Handle "Journal already exists for today" error
        alert("Error: " + data.message);
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

  const handleDelete = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  // NEW: Function to Open/View an entry in the editor
  const handleOpenEntry = (entry) => {
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setShowHistory(false); // Close the modal
    // Scroll to top to see the editor
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

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* Open Button */}
                      <button
                        onClick={() => handleOpenEntry(entry)}
                        title="Open Entry"
                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-full transition"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {/* Delete Button */}
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
          <a href="#" className="hover:text-white transition">
            Counselling
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
            <a href="#" className="text-gray-300">
              Counselling
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
                      {entry.date.split(" ")[0]}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {entry.date.split(" ")[1]}
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
                Unsaved changes...
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
