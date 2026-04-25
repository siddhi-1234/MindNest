import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Added useNavigate
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth"; // Added signOut
import {
  Calendar,
  Clock,
  User,
  Check,
  Loader2,
  LogOut,
  Menu,
  RotateCcw,
  Settings, // Added for dropdown
  X, // Added for mobile menu
  Menu as LucideMenu, // Added for mobile menu
} from "lucide-react";

// ================= Standard Working Hours =================
const STANDARD_TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

const Appointments = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const topRef = useRef(null);
  const historyRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [history, setHistory] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [open, setOpen] = useState(false); // Mobile menu state

  // Data States
  const [counselors, setCounselors] = useState([]);
  const [loadingCounselors, setLoadingCounselors] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Availability States
  const [generatedDates, setGeneratedDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Profile Dropdown State
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [formData, setFormData] = useState({
    counselorId: null,
    date: null,
    displayDate: null,
    time: null,
    sessionType: "Video Call (Remote)",
    concern: "Academic Stress",
    note: "",
  });

  // --- 1. Auth & Init ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchHistory(user.uid);
      }
    });

    // Date Generation
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dayName = d
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase();
      days.push({
        dayName,
        dateNum: d.getDate(),
        fullDate: `${year}-${month}-${day}`,
        status:
          dayName === "SAT" || dayName === "SUN" ? "disabled" : "available",
      });
    }
    setGeneratedDates(days);
    return () => unsubscribe();
  }, []);

  // --- 2. Fetch Counselors ---
  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/counselors`);
        if (res.data) {
          const validCounselors = res.data.filter(
            (c) => c.name && c.name.trim() !== "",
          );
          setCounselors(
            validCounselors.map((c) => ({
              id: c.uid,
              name: c.name,
              title: c.title,
              image: c.image || "https://i.pravatar.cc/150",
              schedule: c.schedule || {},
            })),
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCounselors(false);
      }
    };
    fetchCounselors();
  }, []);

  // --- 3. Availability Logic ---
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!formData.counselorId || !formData.date) return;
      setLoadingSlots(true);
      try {
        const selectedCounselor = counselors.find(
          (c) => c.id === formData.counselorId,
        );
        let baseSlots =
          selectedCounselor?.schedule &&
          Array.isArray(selectedCounselor.schedule[formData.date])
            ? selectedCounselor.schedule[formData.date]
            : STANDARD_TIME_SLOTS;

        const res = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/appointments`);
        const bookedTimes = res.data
          .filter(
            (appt) =>
              appt.counselorId === formData.counselorId &&
              appt.date === formData.date &&
              appt.status !== "cancelled",
          )
          .map((appt) => appt.time);

        setAvailableSlots(
          baseSlots.filter((slot) => !bookedTimes.includes(slot)),
        );
      } catch (err) {
        setAvailableSlots(STANDARD_TIME_SLOTS);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchAvailability();
  }, [formData.counselorId, formData.date, counselors]);

  const fetchHistory = async (studentUid) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/appointments`);
      const myAppointments = res.data.filter(
        (appt) => appt.studentUid === studentUid,
      );
      setHistory(
        myAppointments.reverse().map((appt) => ({
          id: appt._id,
          counselorId: appt.counselorId,
          counselorName: appt.counselorName,
          date: `${appt.date} • ${appt.time}`,
          status: appt.status || "pending",
          img: appt.counselorImage || "https://i.pravatar.cc/150",
        })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const updateForm = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleDateSelect = (dateObj) => {
    if (dateObj.status === "disabled") return;
    setFormData((prev) => ({
      ...prev,
      date: dateObj.fullDate,
      displayDate: dateObj.dateNum,
      time: null,
    }));
  };

  const handleConfirmBooking = async () => {
    if (!currentUser) return alert("Please log in.");
    setIsBooking(true);
    try {
      const selectedCounselor = counselors.find(
        (c) => c.id === formData.counselorId,
      );
      await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/appointments`, {
        studentUid: currentUser.uid,
        studentName: currentUser.displayName || currentUser.email.split("@")[0],
        studentEmail: currentUser.email,
        counselorId: selectedCounselor.id,
        counselorName: selectedCounselor.name,
        counselorImage: selectedCounselor.image,
        date: formData.date,
        time: formData.time,
        type: formData.sessionType,
        concern: formData.concern,
        status: "pending",
      });
      setIsBooking(false);
      setShowSuccess(true);
      fetchHistory(currentUser.uid);
      setTimeout(() => {
        setShowSuccess(false);
        setCurrentStep(1);
        setFormData({
          counselorId: null,
          date: null,
          displayDate: null,
          time: null,
          sessionType: "Video Call",
          concern: "Academic Stress",
        });
        historyRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 2500);
    } catch (error) {
      setIsBooking(false);
      alert("Failed to book.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-gray-200 font-sans relative overflow-x-hidden">
      {/* 1. AURORA BACKGROUND */}
      <div className="mesh-bg">
        <div className="aurora-orb orb-1"></div>
        <div className="aurora-orb orb-2"></div>
        <div className="aurora-orb orb-3"></div>
      </div>

      {/* 2. ENHANCED NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0F172A]/80 backdrop-blur-lg px-6 py-4 border-b border-white/5 flex items-center justify-between shadow-md">
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
            <Link to="/dashboard" className="hover:text-white transition">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/Resources" className="hover:text-white transition">
              Resources
            </Link>
          </li>
          <li>
            <Link to="/journal" className="hover:text-white transition">
              Journal
            </Link>
          </li>
          <li>
            <Link to="/counselling" className="text-white font-bold transition">
              Counseling
            </Link>
          </li>
          <li>
            <Link to="/EmergencyPage" className="hover:text-white transition">
              Emergency
            </Link>
          </li>
        </ul>

        {/* Profile Dropdown */}
        <div className="hidden md:block relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:bg-white/20 transition"
          >
            <User className="text-white" size={24} />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 top-12 w-56 bg-[#1E293B] border border-gray-700 rounded-xl shadow-2xl py-2 z-50 animate-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-gray-700">
                <p className="text-sm text-white font-bold">Student Account</p>
                <p className="text-xs text-gray-400 truncate">
                  {currentUser?.email}
                </p>
              </div>
              <div className="py-1">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <User size={16} /> My Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <Settings size={16} /> Settings
                </Link>
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

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-300"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* 3. MAIN CONTENT (Z-10 to stay above background) */}
      <div
        ref={topRef}
        className="max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-32 relative z-10"
      >
        {showSuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="glass-card p-8 rounded-3xl border border-[#6bdfb2] shadow-2xl text-center w-full max-w-sm">
              <Check className="w-12 h-12 text-[#6bdfb2] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Booking Confirmed!
              </h2>
            </div>
          </div>
        )}

        <header className="mb-10 welcome-text">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 tracking-tight glow-pulse flex items-center gap-4">
            <Calendar className="w-10 h-10 text-[#6bdfb2]" /> Book Appointment
          </h1>
          <p className="text-gray-400 text-lg opacity-80">
            Take the next step in your wellness journey.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* STEP 1: COUNSELORS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                1
              </div>
              <h2 className="text-xl font-bold text-white">Choose Counselor</h2>
            </div>
            <div className="space-y-4">
              {loadingCounselors ? (
                <div className="text-center py-4">
                  <Loader2 className="animate-spin inline mr-2" /> Loading...
                </div>
              ) : (
                counselors.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      updateForm("counselorId", c.id);
                      setCurrentStep(2);
                    }}
                    className={`glass-card p-5 rounded-3xl cursor-pointer border-2 transition-all ${formData.counselorId === c.id ? "border-[#6bdfb2] scale-105" : "border-transparent"}`}
                  >
                    <div className="flex gap-4 items-center">
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                      />
                      <div>
                        <h3 className="font-bold text-white">{c.name}</h3>
                        <p className="text-[#6bdfb2] text-xs font-semibold uppercase tracking-wider">
                          {c.title}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* STEP 2 & 3: CALENDAR & FORM */}
          <div
            className={`lg:col-span-8 space-y-8 transition-opacity duration-500 ${currentStep < 2 ? "opacity-40 pointer-events-none" : "opacity-100"}`}
          >
            <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <h2 className="text-xl font-bold text-white">
                  Select Availability
                </h2>
              </div>
              <div className="grid grid-cols-7 gap-3 mb-10">
                {generatedDates.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => handleDateSelect(item)}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 cursor-pointer transition-all ${item.status === "disabled" ? "opacity-20 cursor-not-allowed" : formData.displayDate === item.dateNum ? "bg-blue-600 border-blue-400 text-white scale-110 shadow-lg shadow-blue-900/40" : "bg-[#0F172A]/50 border-white/5 hover:border-[#6bdfb2]"}`}
                  >
                    <span className="text-[10px] font-bold opacity-60 mb-1">
                      {item.dayName}
                    </span>
                    <span className="text-lg font-black">{item.dateNum}</span>
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-white mb-5 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" /> Available Slots
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {loadingSlots ? (
                  <div className="col-span-full text-center py-4 text-gray-400">
                    <Loader2 className="animate-spin inline mr-2" /> Checking...
                  </div>
                ) : availableSlots.length > 0 ? (
                  availableSlots.map((time, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        updateForm("time", time);
                        setCurrentStep(3);
                      }}
                      className={`py-3 rounded-2xl text-sm font-bold border-2 transition-all ${formData.time === time ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/40" : "bg-[#0F172A]/50 border-white/5 hover:border-blue-500"}`}
                    >
                      {time}
                    </button>
                  ))
                ) : (
                  <div className="col-span-full text-center py-4 text-gray-500 italic">
                    No slots available for this date.
                  </div>
                )}
              </div>
            </div>

            {/* CONFIRMATION */}
            <div
              className={`transition-all duration-500 ${currentStep < 3 ? "opacity-40 pointer-events-none" : "opacity-100"}`}
            >
              <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1 mb-2 block">
                      Session Type
                    </label>
                    <select
                      className="w-full bg-[#0F172A]/80 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500"
                      onChange={(e) =>
                        updateForm("sessionType", e.target.value)
                      }
                    >
                      <option>Video Call (Remote)</option>
                      <option>Audio Call</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1 mb-2 block">
                      Concern
                    </label>
                    <select
                      className="w-full bg-[#0F172A]/80 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500"
                      onChange={(e) => updateForm("concern", e.target.value)}
                    >
                      <option>Academic Stress</option>
                      <option>Anxiety</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-8 py-4 rounded-2xl text-gray-400 hover:text-white font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isBooking}
                    className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-900/40"
                  >
                    {isBooking ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Check />
                    )}{" "}
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HISTORY SECTION */}
        <section
          ref={historyRef}
          className="mt-20 pt-10 border-t border-white/5"
        >
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
            <RotateCcw className="text-[#6bdfb2]" /> Appointment History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.map((item) => (
              <div
                key={item.id}
                className="glass-card p-6 rounded-[2rem] flex justify-between items-center group"
              >
                <div className="flex items-center gap-5">
                  <img
                    src={item.img}
                    className="w-16 h-16 rounded-2xl object-cover shadow-xl"
                  />
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      {item.counselorName}
                    </h3>
                    <p className="text-xs text-[#6bdfb2] font-black uppercase tracking-widest opacity-80">
                      {item.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
                    {item.status}
                  </span>
                  <button
                    onClick={() => {
                      updateForm("counselorId", item.counselorId);
                      setCurrentStep(2);
                      topRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Appointments;
