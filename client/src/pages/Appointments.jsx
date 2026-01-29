import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  Calendar,
  Clock,
  User,
  Check,
  Loader2,
  LogOut,
  Menu,
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
  const isActive = (path) =>
    location.pathname.toLowerCase().startsWith(path.toLowerCase())
      ? "text-[#6bdfb2] font-bold"
      : "text-gray-400 hover:text-gray-200";

  const topRef = useRef(null);
  const historyRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [history, setHistory] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Data States
  const [counselors, setCounselors] = useState([]);
  const [loadingCounselors, setLoadingCounselors] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Availability States
  const [generatedDates, setGeneratedDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    counselorId: null,
    date: null,
    displayDate: null,
    time: null,
    sessionType: "Video Call (Remote)",
    concern: "Academic Stress",
    note: "",
  });

  // --- 1. Init & Auth & Date Generation ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchHistory(user.uid);
      }
    });

    // ✅ FIXED: Generate dates using LOCAL Time to avoid timezone mismatch
    const days = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);

      // Create YYYY-MM-DD string using local time components
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const fullDate = `${year}-${month}-${day}`;

      const dayName = d
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase();
      const dateNum = d.getDate();
      const isWeekend = dayName === "SAT" || dayName === "SUN";

      days.push({
        dayName,
        dateNum,
        fullDate,
        status: isWeekend ? "disabled" : "available",
      });
    }
    setGeneratedDates(days);

    return () => unsubscribe();
  }, []);

  // --- 2. Fetch Counselors (With Schedule) ---
  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/counselors");
        if (res.data) {
          const formattedData = res.data.map((c) => ({
            id: c.uid,
            dbId: c._id,
            name: c.name,
            title: c.title,
            image: c.image || "https://i.pravatar.cc/150",
            tags: c.tags || ["General"],
            description: c.description,
            schedule: c.schedule || {}, // Capture availability schedule
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

  // --- 3. Availability Logic (The Fix) ---
  useEffect(() => {
    const fetchAvailability = async () => {
      // Only run if both counselor and date are picked
      if (!formData.counselorId || !formData.date) return;

      setLoadingSlots(true);
      try {
        // A. Get Counselor's "Base" Availability for this specific date
        const selectedCounselor = counselors.find(
          (c) => c.id === formData.counselorId,
        );

        let baseSlots = STANDARD_TIME_SLOTS; // Default to all slots

        // If counselor has set availability for this date, use it
        // Check if schedule exists AND if the array for this date is defined
        if (
          selectedCounselor?.schedule &&
          Array.isArray(selectedCounselor.schedule[formData.date])
        ) {
          baseSlots = selectedCounselor.schedule[formData.date];
        }

        // B. Get "Booked" Appointments from Backend
        const res = await axios.get("http://localhost:5000/api/appointments");

        const bookedAppointments = res.data.filter(
          (appt) =>
            appt.counselorId === formData.counselorId &&
            appt.date === formData.date &&
            appt.status !== "cancelled",
        );

        const bookedTimes = bookedAppointments.map((appt) => appt.time);

        // C. Calculate Final Free Slots
        // (Base Slots - Booked Slots)
        const finalSlots = baseSlots.filter(
          (slot) => !bookedTimes.includes(slot),
        );

        setAvailableSlots(finalSlots);
      } catch (err) {
        console.error("Error calculating availability:", err);
        setAvailableSlots(STANDARD_TIME_SLOTS); // Fail-safe: show standard slots
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [formData.counselorId, formData.date, counselors]);

  // --- 4. Fetch History ---
  const fetchHistory = async (studentUid) => {
    try {
      const res = await axios.get("http://localhost:5000/api/appointments");
      const myAppointments = res.data.filter(
        (appt) => appt.studentUid === studentUid,
      );

      setHistory(
        myAppointments.reverse().map((appt) => ({
          id: appt._id,
          counselorId: appt.counselorId,
          counselorName: appt.counselorName,
          date: `${appt.date} • ${appt.time}`,
          // Status is now dynamic from backend
          status: appt.status || "pending",
          type: appt.type,
          img: appt.counselorImage || "https://i.pravatar.cc/150",
        })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  // --- Form Actions ---
  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateSelect = (dateObj) => {
    if (dateObj.status === "disabled") return;
    setFormData((prev) => ({
      ...prev,
      date: dateObj.fullDate,
      displayDate: dateObj.dateNum,
      time: null, // Reset time on date change
    }));
  };

  const handleNextStep = () => {
    if (currentStep === 1 && formData.counselorId) setCurrentStep(2);
    if (currentStep === 2 && formData.date && formData.time) setCurrentStep(3);
  };

  const handleConfirmBooking = async () => {
    if (!currentUser) return alert("Please log in.");
    setIsBooking(true);
    try {
      const selectedCounselor = counselors.find(
        (c) => c.id === formData.counselorId,
      );
      await axios.post("http://localhost:5000/api/appointments", {
        studentUid: currentUser.uid,
        studentName: currentUser.displayName || currentUser.email.split("@")[0],
        studentEmail: currentUser.email,
        counselorId: selectedCounselor.id,
        counselorName: selectedCounselor.name,
        counselorImage: selectedCounselor.image,
        date: formData.date, // YYYY-MM-DD
        time: formData.time,
        type: formData.sessionType,
        concern: formData.concern,
        note: formData.note,
        status: "pending",
        createdAt: new Date().toISOString(),
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
          note: "",
        });
        scrollToHistory();
      }, 2500);
    } catch (error) {
      console.error(error);
      setIsBooking(false);
      alert("Failed to book.");
    }
  };

  const handleCancel = (id) => {
    if (window.confirm("Cancel this appointment?")) {
      // Add axios.delete logic here if needed
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
    <div className="min-h-screen bg-[#0F172A] text-gray-200 font-sans flex flex-col">
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0F172A] px-6 py-4 border-b border-gray-800 shadow-md">
        <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-4">
            {currentUser && (
              <span className="hidden lg:block text-xs text-gray-400 mr-2">
                {currentUser.email}
              </span>
            )}
            <Link
              to="/settings"
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6bdfb2] to-blue-500 p-[2px]"
            >
              <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center">
                <User className="w-5 h-5 text-gray-300" />
              </div>
            </Link>
            <button
              className="md:hidden text-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu />
            </button>
          </div>
        </div>
      </nav>

      <div
        ref={topRef}
        className="pt-24 md:pt-36 p-4 md:p-12 lg:px-24 pb-32 flex-1"
      >
        {showSuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-[#1E293B] p-8 rounded-3xl border border-[#6bdfb2] shadow-2xl text-center w-full max-w-sm">
              <Check className="w-8 h-8 text-[#6bdfb2] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Booking Confirmed!
              </h2>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 flex items-center gap-3">
            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-[#6bdfb2]" /> Book
            Appointment
          </h1>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* STEP 1: COUNSELOR LIST */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h2 className="text-xl font-bold text-white">Choose Counselor</h2>
            </div>
            <div className="flex flex-col gap-4">
              {loadingCounselors ? (
                <div className="text-center py-4 text-gray-400">
                  <Loader2 className="animate-spin inline mr-2" /> Loading...
                </div>
              ) : (
                counselors.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      updateForm("counselorId", c.id);
                      setTimeout(handleNextStep, 300);
                    }}
                    className={`bg-[#1E293B] p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.counselorId === c.id ? "border-[#6bdfb2] bg-blue-900/20" : "border-gray-800"}`}
                  >
                    <div className="flex gap-4 items-center">
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-white">{c.name}</h3>
                        <p className="text-[#6bdfb2] text-xs">{c.title}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* STEP 2 & 3 */}
          <div className="lg:col-span-8 space-y-8">
            <div
              className={`transition-all duration-500 ${currentStep < 2 ? "opacity-50 pointer-events-none" : "opacity-100"}`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-xl font-bold text-white">
                  Select Availability
                </h2>
              </div>
              <div className="bg-[#1E293B] p-6 rounded-3xl border border-gray-800">
                {/* Date Grid */}
                <div className="grid grid-cols-7 gap-2 mb-8 text-center">
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                    (d) => (
                      <div
                        key={d}
                        className="text-xs font-bold text-gray-500 mb-2"
                      >
                        {d}
                      </div>
                    ),
                  )}
                  {generatedDates.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => handleDateSelect(item)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center border-2 cursor-pointer transition-all ${item.status === "disabled" ? "opacity-30 cursor-not-allowed border-transparent" : formData.displayDate === item.dateNum ? "bg-blue-600 border-blue-400 text-white scale-105" : "bg-[#0F172A] border-transparent text-cyan-300 hover:border-cyan-500"}`}
                    >
                      <span className="text-[10px] opacity-70">
                        {item.dayName}
                      </span>
                      {item.dateNum}
                    </div>
                  ))}
                </div>

                {/* Slot Grid */}
                <h3 className="font-bold text-white mb-4">
                  Available Slots{" "}
                  {formData.date && (
                    <span className="text-[#6bdfb2] font-normal ml-2">
                      ({formData.date})
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {loadingSlots ? (
                    <div className="col-span-full text-center py-4 text-gray-400">
                      <Loader2 className="animate-spin inline" /> Checking...
                    </div>
                  ) : availableSlots.length > 0 ? (
                    availableSlots.map((time, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          updateForm("time", time);
                          handleNextStep();
                        }}
                        className={`py-3 rounded-xl text-sm font-medium border-2 transition-all ${formData.time === time ? "bg-blue-600 border-blue-400 text-white" : "bg-[#0F172A] border-gray-700 text-gray-300 hover:border-[#6bdfb2]"}`}
                      >
                        {time}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-4 text-gray-500">
                      No slots available for this date.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3 Form - Simplified for brevity but logic retained */}
            <div
              className={`transition-all duration-500 ${currentStep < 3 ? "opacity-50 pointer-events-none" : "opacity-100"}`}
            >
              <div className="bg-[#1E293B] p-6 rounded-3xl border border-gray-800 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">
                      Session Type
                    </label>
                    <select
                      className="w-full bg-[#0F172A] border border-gray-700 rounded-xl p-3 text-white"
                      onChange={(e) =>
                        updateForm("sessionType", e.target.value)
                      }
                    >
                      <option>Video Call</option>
                      <option>Audio Call</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">
                      Concern
                    </label>
                    <select
                      className="w-full bg-[#0F172A] border border-gray-700 rounded-xl p-3 text-white"
                      onChange={(e) => updateForm("concern", e.target.value)}
                    >
                      <option>Academic Stress</option>
                      <option>Anxiety</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 rounded-xl text-gray-400 hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isBooking}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2"
                  >
                    {isBooking ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Check />
                    )}{" "}
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div
          ref={historyRef}
          className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-800"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Clock className="text-[#6bdfb2]" /> History
          </h2>
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-[#1E293B] p-4 rounded-2xl border border-gray-800 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <img src={item.img} className="w-12 h-12 rounded-full" />
                  <div className="text-white font-bold">
                    {item.counselorName}
                    <p className="text-xs text-[#6bdfb2] font-normal">
                      {item.date}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-900/30 text-green-400 border border-green-500/50">
                  {item.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
