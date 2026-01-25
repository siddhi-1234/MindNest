import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  Video,
  MessageSquare,
  X,
  ChevronRight,
  Check,
  Loader2,
  Search,
  LogOut,
  Menu,
} from "lucide-react";

// ================= Calendar & History Dummy Data (Kept for UI Structure) =================

const AVAILABLE_DATES = [
  { day: "MON", date: 28, status: "disabled" },
  { day: "TUE", date: 29, status: "disabled" },
  { day: "WED", date: 30, status: "disabled" },
  { day: "THU", date: 1, status: "available" },
  { day: "FRI", date: 2, status: "available" },
  { day: "SAT", date: 3, status: "available" },
  { day: "SUN", date: 4, status: "available" },
  { day: "MON", date: 5, status: "available" },
  { day: "TUE", date: 6, status: "selected" },
  { day: "WED", date: 7, status: "available" },
  { day: "THU", date: 8, status: "available" },
  { day: "FRI", date: 9, status: "available" },
  { day: "SAT", date: 10, status: "available" },
  { day: "SUN", date: 11, status: "available" },
];

const AVAILABLE_TIMES = ["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM"];

const INITIAL_HISTORY = [
  {
    id: 101,
    counselorId: "mock_id_1",
    counselorName: "Dr. Sarah Jenkins", // Placeholder history
    date: "Oct 12 • 11:00 AM",
    status: "confirmed",
    img: "https://i.pravatar.cc/150?img=47",
    type: "Video Call",
  },
];

// ================= Main Component =================

const Appointments = () => {
  // --- Navbar Logic ---
  const location = useLocation();
  const isActive = (path) =>
    location.pathname.toLowerCase().startsWith(path.toLowerCase())
      ? "text-[#6bdfb2] font-bold"
      : "text-gray-400 hover:text-gray-200";

  // --- Refs & State ---
  const topRef = useRef(null);
  const historyRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // === NEW: Counselors State (Starts Empty) ===
  const [counselors, setCounselors] = useState([]);
  const [loadingCounselors, setLoadingCounselors] = useState(true); // Loading state

  // === NEW: Fetch Counselors from Backend ===
  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        // Fetch from your Node/MongoDB backend
        const res = await axios.get("http://localhost:5000/api/counselors");

        if (res.data) {
          // Map MongoDB data to match UI structure
          const formattedData = res.data.map((c) => ({
            id: c._id, // Use MongoDB _id
            name: c.name,
            title: c.title,
            image: c.image || "https://i.pravatar.cc/150", // Fallback image if null
            tags: c.tags || ["General"],
            description: c.description,
          }));
          setCounselors(formattedData);
        }
      } catch (err) {
        console.error("Failed to fetch counselors:", err);
      } finally {
        setLoadingCounselors(false);
      }
    };
    fetchCounselors();
  }, []);

  // Form Data State
  const [formData, setFormData] = useState({
    counselorId: null,
    date: 6,
    time: null,
    sessionType: "Video Call (Remote)",
    concern: "Academic Stress",
    note: "",
  });

  // --- Actions ---

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep === 1 && formData.counselorId) setCurrentStep(2);
    if (currentStep === 2 && formData.date && formData.time) setCurrentStep(3);
  };

  const handleConfirmBooking = () => {
    setIsBooking(true);
    setTimeout(() => {
      // Find the selected counselor object from state
      const selectedCounselor = counselors.find(
        (c) => c.id === formData.counselorId,
      );

      if (!selectedCounselor) {
        setIsBooking(false);
        return;
      }

      const newAppointment = {
        id: Date.now(),
        counselorId: selectedCounselor.id,
        counselorName: selectedCounselor.name,
        date: `Oct ${formData.date} • ${formData.time}`,
        status: "confirmed",
        img: selectedCounselor.image,
        type: formData.sessionType,
      };

      setHistory([newAppointment, ...history]);
      setIsBooking(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setCurrentStep(1);
        setFormData((prev) => ({ ...prev, time: null, note: "" }));
        scrollToHistory();
      }, 2500);
    }, 1500);
  };

  const handleCancel = (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      setHistory(history.filter((item) => item.id !== id));
    }
  };

  const handleBookAgain = (counselorId) => {
    updateForm("counselorId", counselorId);
    setCurrentStep(2);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHistory = () =>
    historyRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToTop = () =>
    topRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-[#0F172A] text-gray-200 font-sans">
      {/* ================= FIXED NAVBAR ================= */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0F172A] px-6 py-4 border-b border-gray-800 shadow-md">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
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

          {/* Middle: Links (Visible on Desktop) */}
          <div className="hidden md:flex items-center gap-8 text-sm transition-all">
            <Link
              to="/dashboard"
              className={`transition-colors ${isActive("/dashboard")}`}
            >
              Dashboard
            </Link>
            <Link
              to="/Resources"
              className={`transition-colors ${isActive("/Resources")}`}
            >
              Resources
            </Link>
            <Link
              to="/journal"
              className={`transition-colors ${isActive("/journal")}`}
            >
              Journal
            </Link>
            <Link
              to="/counselling"
              className={`transition-colors ${isActive("/counselling")}`}
            >
              Counselling
            </Link>
          </div>

          {/* Right: Search & Profile & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 md:border-l border-gray-800">
              <Link
                to="/settings"
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6bdfb2] to-blue-500 p-[2px] cursor-pointer hover:scale-105 transition-all shadow-lg shadow-blue-900/20"
              >
                <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-300" />
                </div>
              </Link>
              <Link
                to="/login"
                title="Logout"
                className="text-gray-500 hover:text-red-400 transition-colors hidden md:block"
              >
                <LogOut className="w-5 h-5" />
              </Link>
              {/* Mobile Hamburger */}
              <button
                className="md:hidden text-gray-300 hover:text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#1E293B] border-t border-gray-800 shadow-xl py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-5">
            <Link
              to="/dashboard"
              className="text-gray-300 hover:text-[#6bdfb2]"
            >
              Dashboard
            </Link>
            <Link
              to="/Resources"
              className="text-gray-300 hover:text-[#6bdfb2]"
            >
              Resources
            </Link>
            <Link to="/journal" className="text-gray-300 hover:text-[#6bdfb2]">
              Journal
            </Link>
            <Link
              to="/counselling"
              className="text-gray-300 hover:text-[#6bdfb2]"
            >
              Counselling
            </Link>
          </div>
        )}
      </nav>
      {/* ================= END NAVBAR ================= */}

      {/* ================= MAIN CONTENT ================= */}
      <div
        ref={topRef}
        className="pt-36 p-4 md:p-12 lg:px-24 pb-32 animate-in fade-in duration-700 relative"
      >
        {/* Success Overlay Modal */}
        {showSuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#1E293B] p-8 rounded-3xl border border-[#6bdfb2] shadow-2xl text-center max-w-sm mx-4 transform animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-[#6bdfb2]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-[#6bdfb2]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Booking Confirmed!
              </h2>
              <p className="text-gray-400">
                Your session has been scheduled. You can view it in your
                history.
              </p>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="max-w-6xl mx-auto mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 flex items-center gap-3">
            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-[#030831]" />
          </h1>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 flex items-center gap-3">
            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-[#6bdfb2]" />
            Book Appointment
          </h1>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 mt-8 border-b border-gray-800 pb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <button
              onClick={scrollToTop}
              className={`flex items-center gap-2 font-semibold pb-4 -mb-4 text-sm md:text-base transition-all ${currentStep < 4 ? "text-[#6bdfb2] border-b-2 border-[#6bdfb2]" : "text-gray-500 hover:text-gray-300"}`}
            >
              <User className="w-4 h-4 md:w-5 md:h-5" /> Find a Counselor
            </button>
            <button
              onClick={scrollToHistory}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-all pb-4 -mb-4 text-sm md:text-base"
            >
              <Clock className="w-4 h-4 md:w-5 md:h-5" /> History
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ================= LEFT COLUMN (Step 1: LIST COUNSELORS) ================= */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-8 h-8 min-w-[2rem] rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 1 ? "bg-blue-600 text-white shadow-blue-glow" : "bg-gray-700 text-gray-400"}`}
              >
                1
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white">
                Choose a Counselor
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {/* LOADING STATE */}
              {loadingCounselors && (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading
                  counselors...
                </div>
              )}

              {/* EMPTY STATE */}
              {!loadingCounselors && counselors.length === 0 && (
                <div className="bg-[#1E293B] p-6 rounded-2xl border border-gray-800 text-center text-gray-400">
                  <User className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>No counselors available yet.</p>
                </div>
              )}

              {/* REAL DATA MAPPING */}
              {!loadingCounselors &&
                counselors.map((counselor) => (
                  <div
                    key={counselor.id}
                    onClick={() => {
                      updateForm("counselorId", counselor.id);
                      setTimeout(handleNextStep, 300);
                    }}
                    className={`bg-[#1E293B] p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group hover:scale-[1.02]
                    ${
                      formData.counselorId === counselor.id
                        ? "border-[#6bdfb2] bg-blue-900/20"
                        : "border-gray-800 hover:border-[#6bdfb2]/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={counselor.image}
                        alt={counselor.name}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-[#6bdfb2]/30"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-base md:text-lg text-white flex items-center gap-2">
                          {counselor.name}
                          {formData.counselorId === counselor.id && (
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-[#6bdfb2]" />
                          )}
                        </h3>
                        <p className="text-[#6bdfb2] text-xs md:text-sm font-medium mb-2">
                          {counselor.title}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {counselor.tags.slice(0, 2).map((tag, i) => (
                            <span
                              key={i}
                              className="text-[10px] md:text-xs bg-[#0F172A] text-gray-300 px-2 py-1 rounded-md border border-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* ================= RIGHT COLUMN (Steps 2 & 3) ================= */}
          <div className="lg:col-span-8 space-y-8">
            {/* --- STEP 2: Date & Time --- */}
            <div
              className={`transition-all duration-500 ${currentStep < 2 ? "opacity-50 blur-[1px] pointer-events-none" : "opacity-100"}`}
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}`}
                >
                  2
                </div>
                <h2 className="text-lg md:text-xl font-bold text-white">
                  Select Availability
                </h2>

                {/* Responsive Legend */}
                <div className="w-full md:w-auto md:ml-auto flex gap-4 text-xs font-medium pt-2 md:pt-0">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    Available
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    Selected
                  </span>
                </div>
              </div>

              <div className="bg-[#1E293B] p-4 md:p-6 rounded-3xl border border-gray-800">
                <div className="grid grid-cols-7 gap-1 md:gap-2 text-center mb-6 md:mb-8">
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-[10px] md:text-xs font-bold text-gray-500 mb-2"
                      >
                        {day}
                      </div>
                    ),
                  )}
                  {AVAILABLE_DATES.map((item, index) => {
                    let dateStyles =
                      "bg-[#0F172A] text-gray-600 border-transparent opacity-50 cursor-not-allowed";
                    if (item.status === "available")
                      dateStyles =
                        "bg-cyan-900/30 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500 hover:text-white cursor-pointer";
                    if (
                      item.status === "selected" ||
                      formData.date === item.date
                    )
                      dateStyles =
                        "bg-blue-600 text-white border-blue-400 font-bold scale-105";

                    return (
                      <div
                        key={index}
                        onClick={() =>
                          item.status !== "disabled" &&
                          updateForm("date", item.date)
                        }
                        className={`aspect-square rounded-lg md:rounded-xl flex items-center justify-center border-2 transition-all duration-200 text-sm md:text-lg ${dateStyles}`}
                      >
                        {item.date}
                      </div>
                    );
                  })}
                </div>

                <h3 className="font-bold text-white mb-4 text-sm md:text-base">
                  Available Times
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AVAILABLE_TIMES.map((time, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        updateForm("time", time);
                        handleNextStep();
                      }}
                      className={`py-2 md:py-3 rounded-xl text-xs md:text-sm font-medium border-2 transition-all duration-300
                                  ${
                                    formData.time === time
                                      ? "bg-blue-600 border-blue-400 text-white"
                                      : "bg-[#0F172A] border-gray-700 text-gray-300 hover:border-[#6bdfb2]"
                                  }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* --- STEP 3: Details & Confirm --- */}
            <div
              className={`transition-all duration-500 delay-100 ${currentStep < 3 ? "opacity-50 blur-[1px] pointer-events-none" : "opacity-100"}`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}`}
                >
                  3
                </div>
                <h2 className="text-lg md:text-xl font-bold text-white">
                  Complete Booking
                </h2>
              </div>

              <div className="bg-[#1E293B] p-4 md:p-6 rounded-3xl border border-gray-800 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Session Type
                    </label>
                    <div className="relative">
                      <Video className="absolute left-4 top-3.5 w-5 h-5 text-[#6bdfb2]" />
                      <select
                        value={formData.sessionType}
                        onChange={(e) =>
                          updateForm("sessionType", e.target.value)
                        }
                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:border-[#6bdfb2] outline-none appearance-none cursor-pointer"
                      >
                        <option>Video Call (Remote)</option>
                        <option>Audio Call</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-3.5 w-5 h-5 text-gray-500 rotate-90" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Primary Concern
                    </label>
                    <select
                      value={formData.concern}
                      onChange={(e) => updateForm("concern", e.target.value)}
                      className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-[#6bdfb2] outline-none appearance-none cursor-pointer"
                    >
                      <option>Academic Stress</option>
                      <option>Anxiety</option>
                      <option>Relationship Issues</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Note for Counselor
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <textarea
                      value={formData.note}
                      onChange={(e) => updateForm("note", e.target.value)}
                      rows={3}
                      placeholder="Is there anything specific you'd like to talk about?"
                      className="w-full bg-[#0F172A] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:border-[#6bdfb2] outline-none resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isBooking}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isBooking ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    {isBooking ? "Confirming..." : "Confirm Booking"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= HISTORY SECTION ================= */}
        <div
          ref={historyRef}
          className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-800"
        >
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#6bdfb2]" />
            My Journey (History)
          </h2>

          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No appointments yet. Book your first one above!
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1E293B] p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.img}
                      alt={item.counselorName}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-700"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm md:text-lg">
                        {item.counselorName}
                      </h4>
                      <p className="text-[#6bdfb2] text-xs md:text-sm flex items-center gap-2">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />{" "}
                        {item.date}
                        <span className="text-gray-600">•</span>
                        <Video className="w-3 h-3 md:w-4 md:h-4" /> {item.type}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold border ${
                        item.status === "confirmed"
                          ? "bg-green-900/30 text-green-400 border-green-500/50"
                          : "bg-gray-800 text-gray-400 border-gray-700"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>

                    <div className="flex items-center gap-3">
                      {item.status !== "pending" && (
                        <button
                          onClick={() => handleBookAgain(item.counselorId)}
                          className="text-xs md:text-sm font-medium text-[#6bdfb2] hover:underline"
                        >
                          Book Again
                        </button>
                      )}
                      <button
                        onClick={() => handleCancel(item.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                        title="Cancel Appointment"
                      >
                        <X className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
