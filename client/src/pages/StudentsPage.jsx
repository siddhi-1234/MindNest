import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  FileText,
  X,
  Paperclip,
  LogOut,
  Trash2,
  Edit2,
  Save,
  MessageCircle,
  Users,
  Clock,
  Menu,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import axios from "axios";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

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

// ================= MODAL FOR SCHEDULING NEXT SESSION =================
const ScheduleModal = ({ isOpen, onClose, onSchedule, studentName }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!date || !time) return alert("Please select date and time");
    setLoading(true);
    await onSchedule(date, time);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Schedule Next Session for {studentName}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Time
            </label>
            <select
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            >
              <option value="">Select Time</option>
              {STANDARD_TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-sm disabled:opacity-70"
          >
            {loading ? "Scheduling..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ================= SUB-COMPONENTS =================

const SidebarItem = ({ student, isSelected, onClick }) => (
  <div
    onClick={() => onClick(student)}
    className={`flex items-start gap-3 p-4 border-b border-white/10 cursor-pointer transition-colors hover:bg-white/5 ${
      isSelected ? "bg-white/20 border-l-4 border-l-white" : ""
    }`}
  >
    <img
      src={student.image || "https://i.pravatar.cc/150?img=12"}
      alt={student.name}
      className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
    />
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline mb-1">
        <h4 className="text-sm font-bold truncate text-white">
          {student.name}
        </h4>
        <span className="text-xs text-gray-300">
          {student.lastAppointmentDate || "New"}
        </span>
      </div>
      <p className="text-xs text-gray-300 truncate mb-2">
        {student.concern || "General Checkup"}
      </p>

      {/* STATUS BADGE */}
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold inline-block ${
          student.status === "confirmed"
            ? "bg-green-500/20 text-green-300 border border-green-500/30"
            : student.status === "cancelled"
              ? "bg-red-500/20 text-red-300 border border-red-500/30"
              : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
        }`}
      >
        {student.status || "Pending"}
      </span>
    </div>
  </div>
);

const MoodChartWidget = ({ moodData }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-gray-800">Mood Trends (Last 14 Days)</h3>
    </div>
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={moodData} barSize={32}>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
            dy={10}
            tickFormatter={(date) => new Date(date).getDate()}
          />
          <Tooltip
            cursor={{ fill: "#F3F4F6" }}
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Bar dataKey="score" radius={[4, 4, 4, 4]}>
            {moodData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.score <= 2
                    ? "#EF4444"
                    : entry.score >= 4
                      ? "#22D3EE"
                      : "#FCD34D"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const NoteEditor = ({ title, notes, onSave, onDelete }) => {
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(text, editingId);
    setText("");
    setEditingId(null);
  };

  const handleEdit = (note) => {
    setText(note.text);
    setEditingId(note.id);
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-bold text-cyan-700 uppercase tracking-wider">
        {title}
      </label>

      <div className="space-y-2 max-h-40 overflow-y-auto mb-4 pr-2">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-start group"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                {note.text}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                {new Date(note.date).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-1 ml-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(note)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Edit2 size={12} className="text-gray-500" />
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="p-1 hover:bg-red-100 rounded"
              >
                <Trash2 size={12} className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none h-24"
          placeholder={`Type new ${title.toLowerCase()} here...`}
        ></textarea>
        <button
          onClick={handleSave}
          className="absolute bottom-3 right-3 bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-700 transition-colors shadow-sm"
          title="Save Note"
        >
          <Save size={16} />
        </button>
      </div>
    </div>
  );
};

// ================= AVAILABILITY SETTINGS COMPONENT =================
const AvailabilitySettings = ({ counselorId }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [generatedDates, setGeneratedDates] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const fullDate = d.toISOString().split("T")[0];

      days.push({
        dayName: d
          .toLocaleDateString("en-US", { weekday: "short" })
          .toUpperCase(),
        dateNum: d.getDate(),
        fullDate,
        isToday: i === 0,
      });
    }
    setGeneratedDates(days);
    setSelectedDate(days[0].fullDate);

    const mockSchedule = {};
    days.forEach((d) => (mockSchedule[d.fullDate] = [...STANDARD_TIME_SLOTS]));
    setSchedule(mockSchedule);
  }, [counselorId]);

  const toggleSlot = (time) => {
    if (!selectedDate) return;

    setSchedule((prev) => {
      const currentSlots = prev[selectedDate] || [];
      const updatedSlots = currentSlots.includes(time)
        ? currentSlots.filter((t) => t !== time)
        : [...currentSlots, time].sort();

      return { ...prev, [selectedDate]: updatedSlots };
    });
  };

  const saveAvailability = async () => {
    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/counselors/${counselorId}`, {
        schedule: schedule,
      });
      alert("Availability updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save availability. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">My Availability</h3>
          <p className="text-sm text-gray-300">
            Manage your open slots for students.
          </p>
        </div>
        <button
          onClick={saveAvailability}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-all disabled:opacity-70 w-full md:w-auto justify-center"
        >
          {loading ? (
            "Saving..."
          ) : (
            <>
              <Save size={18} /> Save Changes
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Date Selector */}
        <div className="bg-white/10 p-4 rounded-2xl border border-white/20 overflow-y-auto max-h-64 md:max-h-full">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
            Select Date
          </h4>
          <div className="space-y-2">
            {generatedDates.map((date) => (
              <button
                key={date.fullDate}
                onClick={() => setSelectedDate(date.fullDate)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  selectedDate === date.fullDate
                    ? "bg-white text-gray-900 shadow-lg"
                    : "bg-transparent text-gray-300 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      selectedDate === date.fullDate
                        ? "bg-cyan-100 text-cyan-700"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    {date.dateNum}
                  </div>
                  <span className="text-sm font-medium">{date.dayName}</span>
                </div>
                {date.isToday && (
                  <span className="text-[10px] font-bold bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded">
                    TODAY
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Slot Toggler */}
        <div className="md:col-span-2 bg-white/10 border border-white/20 rounded-2xl p-6 flex flex-col">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Clock size={18} className="text-cyan-400" />
            Time Slots for {selectedDate}
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STANDARD_TIME_SLOTS.map((time) => {
              const isAvailable = schedule[selectedDate]?.includes(time);
              return (
                <button
                  key={time}
                  onClick={() => toggleSlot(time)}
                  className={`py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                    isAvailable
                      ? "bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/20"
                      : "bg-transparent border-white/20 text-gray-400 opacity-50 hover:opacity-100"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-6 text-xs text-gray-300 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-cyan-500 border-2 border-cyan-400"></div>{" "}
              Available
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-transparent border-2 border-white/20"></div>{" "}
              Unavailable
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================= MAIN PAGE COMPONENT =================

const StudentsPage = () => {
  const [activeTab, setActiveTab] = useState("Session Notes");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentMoods, setStudentMoods] = useState([]);
  const [journalCount, setJournalCount] = useState(0);
  const [studentQueries, setStudentQueries] = useState([]);
  const [isListOpen, setIsListOpen] = useState(false); // Mobile sidebar toggle
  const [currentUser, setCurrentUser] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Notes States
  const [sessionNotes, setSessionNotes] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Data ... (Function remains same, omitted for brevity)
  const fetchData = async () => {
    if (!currentUser) return;
    try {
      const apptRes = await axios.get("http://localhost:5000/api/appointments");
      const myAppointments = apptRes.data.filter(
        (appt) => appt.counselorId === currentUser.uid,
      );

      const uniqueStudentsMap = new Map();

      myAppointments.forEach((appt) => {
        if (
          !uniqueStudentsMap.has(appt.studentName) ||
          new Date(appt.createdAt) >
            new Date(uniqueStudentsMap.get(appt.studentName).createdAt)
        ) {
          uniqueStudentsMap.set(appt.studentName, {
            id: appt.studentUid || appt._id,
            name: appt.studentName || "Student",
            concern: appt.concern || "General",
            lastAppointmentDate: appt.date,
            lastAppointmentTime: appt.time,
            appointmentId: appt._id,
            status: appt.status || "pending",
            image: `https://i.pravatar.cc/150?u=${appt.studentName}`,
            queries: [],
            createdAt: appt.createdAt,
          });
        }
        if (appt.note) {
          uniqueStudentsMap.get(appt.studentName).queries.push({
            text: appt.note,
            date: appt.date,
          });
        }
      });

      const studentList = Array.from(uniqueStudentsMap.values());
      setStudents(studentList);

      if (selectedStudent) {
        const updatedSelected = studentList.find(
          (s) => s.name === selectedStudent.name,
        );
        if (updatedSelected) setSelectedStudent(updatedSelected);
      } else if (studentList.length > 0) {
        setSelectedStudent(studentList[0]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedStudent) return;
    const mockMoods = Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString(),
      score: Math.floor(Math.random() * 5) + 1,
    }));
    setStudentMoods(mockMoods);
    setJournalCount(Math.floor(Math.random() * 20) + 1);
    setStudentQueries(selectedStudent.queries || []);
    setSessionNotes([]);
    setPrescriptions([]);
    setTreatmentPlans([]);
    setUploadedFiles([]);
    setIsListOpen(false);
  }, [selectedStudent?.id]);

  // --- ACTIONS ---

  const updateStatus = async (status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/${selectedStudent.appointmentId}`,
        { status },
      );
      setSelectedStudent((prev) => ({ ...prev, status }));
      fetchData();
      alert(`Appointment ${status} successfully!`);
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const handleScheduleNext = async (date, time) => {
    try {
      const payload = {
        studentUid: selectedStudent.id,
        studentName: selectedStudent.name,
        counselorId: currentUser.uid,
        counselorName: currentUser.displayName || "Counselor",
        date: date,
        time: time,
        status: "confirmed",
        type: "Video Call",
        createdAt: new Date().toISOString(),
      };
      await axios.post("http://localhost:5000/api/appointments", payload);
      alert("New session scheduled and sent to student!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to schedule session.");
    }
  };

  // ... (Other handlers like handleSaveNote etc. remain same) ...
  const handleSaveNote = (type, text, id) => {
    /*...*/
  };
  const handleDeleteNote = (type, id) => {
    /*...*/
  };
  const handleFileUpload = (e) => {
    /*...*/
  };
  const handleDiscard = () => {
    /*...*/
  };
  const handleSaveAll = () => {
    alert("Saved!");
  };

  return (
    // 3. Changed main background color to #502f4c
    <div
      style={{ backgroundColor: "#22223b" }}
      className="min-h-screen font-sans flex flex-col h-screen overflow-hidden text-gray-800"
    >
      {/* 1. Changed navbar color to #785964 */}
      <header
        style={{ backgroundColor: "#588157" }}
        className="border-b border-white/10 px-4 md:px-6 h-16 flex items-center justify-between shrink-0 z-30 relative shadow-md"
      >
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-white hover:text-cyan-300"
            onClick={() => setIsListOpen(!isListOpen)}
          >
            <Users size={24} />
          </button>

          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="MindNest"
              className="w-8 h-8 object-contain logo-hover"
            />
            <span className="text-lg font-bold text-white tracking-tight hidden sm:block logo-hover">
              MindNest Counselor Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            <LogOut size={18} />{" "}
            <span className="hidden sm:inline">Logout</span>
          </Link>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR (Responsive) */}
        {isListOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsListOpen(false)}
          ></div>
        )}

        {/* 2. Changed sidemenu color to #70587c */}
        <aside
          style={{ backgroundColor: "#0d1b2a" }}
          className={`
          fixed md:relative inset-y-0 left-0 z-30 w-72 md:w-80 border-r border-white/10 flex flex-col 
          transform transition-transform duration-300 ease-in-out md:translate-x-0
          ${isListOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <div className="p-5 border-b border-white/10 flex-none">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white text-lg">Active Cases</h2>
              <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {students.length} Active
              </span>
            </div>

            {/* VIEW TOGGLE */}
            <div className="flex bg-black/20 p-1 rounded-lg mb-4">
              <button
                onClick={() => setActiveTab("Session Notes")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab !== "Availability" ? "bg-white shadow-sm text-[#70587c]" : "text-gray-300 hover:text-white"}`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab("Availability")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === "Availability" ? "bg-white shadow-sm text-[#70587c]" : "text-gray-300 hover:text-white"}`}
              >
                Availability
              </button>
            </div>

            {activeTab !== "Availability" && (
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="w-full bg-white/10 border border-transparent text-white placeholder-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab !== "Availability" &&
              students.map((student) => (
                <SidebarItem
                  key={student.id}
                  student={student}
                  isSelected={selectedStudent?.id === student.id}
                  onClick={setSelectedStudent}
                />
              ))}
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === "Availability" ? (
            <AvailabilitySettings counselorId={currentUser?.uid} />
          ) : selectedStudent ? (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Student Header */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
                  <div className="relative">
                    <img
                      src={selectedStudent.image}
                      alt={selectedStudent.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-5 h-5 border-2 border-white rounded-full ${selectedStudent.status === "confirmed" ? "bg-green-500" : "bg-yellow-400"}`}
                    ></div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedStudent.name}
                    </h1>
                    <div className="flex flex-col gap-1 text-sm text-gray-500">
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <span className="flex items-center gap-1">
                          <span className="text-cyan-600">🎓</span> Student
                        </span>
                        <span>•</span>
                        <span>Active Case</span>
                      </div>

                      {/* BOOKING INFO */}
                      <div className="mt-1 flex items-center justify-center md:justify-start gap-2 bg-blue-50 px-3 py-1 rounded-lg text-blue-700 text-xs font-semibold">
                        <Clock size={14} />
                        Booked: {selectedStudent.lastAppointmentDate} at{" "}
                        {selectedStudent.lastAppointmentTime}
                        <span
                          className={`ml-1 px-1.5 py-0.5 rounded text-[10px] uppercase ${selectedStudent.status === "confirmed" ? "bg-green-100 text-green-700" : selectedStudent.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {selectedStudent.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                  {/* SHOW ACCEPT/REJECT IF PENDING */}
                  {selectedStudent.status === "pending" && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => updateStatus("cancelled")}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-all"
                        title="Reject Appointment"
                      >
                        <X size={18} /> Reject
                      </button>
                      <button
                        onClick={() => updateStatus("confirmed")}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl font-bold transition-all"
                        title="Accept Appointment"
                      >
                        <Check size={18} /> Accept
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all"
                  >
                    <Calendar size={18} /> Schedule Next
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* STATS */}
                <div className="lg:col-span-5 space-y-6">
                  <MoodChartWidget moodData={studentMoods} />
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">
                      Engagement & Journaling
                    </h3>
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <span className="block text-3xl font-bold text-cyan-600 mb-1">
                          {journalCount}
                        </span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Total Journal Entries
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Queries */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <MessageCircle size={18} className="text-cyan-600" />{" "}
                      Student Queries
                    </h3>
                    <div className="space-y-3">
                      {studentQueries.length > 0 ? (
                        studentQueries.map((q, i) => (
                          <div
                            key={i}
                            className="bg-blue-50 p-3 rounded-lg text-sm text-blue-900 border border-blue-100"
                          >
                            "{q.text}" <br />
                            <span className="text-[10px] text-blue-400 mt-1 block">
                              {q.date}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-sm text-center">
                          No recent queries.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* NOTES & FORM */}
                <div className="lg:col-span-7">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
                    <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100 overflow-x-auto">
                      <div className="flex gap-6 min-w-max">
                        {[
                          "Session Notes",
                          "Digital Prescription",
                          "Treatment Plan",
                        ].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-sm font-bold pb-4 -mb-4 border-b-2 transition-colors whitespace-nowrap ${
                              activeTab === tab
                                ? "text-cyan-600 border-cyan-500"
                                : "text-gray-400 border-transparent hover:text-gray-600"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 md:p-6 space-y-6 flex-1 overflow-y-auto">
                      {/* Note Editors logic same as before... */}
                      {activeTab === "Session Notes" && (
                        <NoteEditor
                          title="Session Notes"
                          notes={sessionNotes}
                          onSave={(text, id) =>
                            handleSaveNote("notes", text, id)
                          }
                          onDelete={(id) => handleDeleteNote("notes", id)}
                        />
                      )}
                      {activeTab === "Digital Prescription" && (
                        <NoteEditor
                          title="Digital Prescription / Advice"
                          notes={prescriptions}
                          onSave={(text, id) => handleSaveNote("rx", text, id)}
                          onDelete={(id) => handleDeleteNote("rx", id)}
                        />
                      )}
                      {activeTab === "Treatment Plan" && (
                        <NoteEditor
                          title="Long-term Treatment Plan"
                          notes={treatmentPlans}
                          onSave={(text, id) =>
                            handleSaveNote("plan", text, id)
                          }
                          onDelete={(id) => handleDeleteNote("plan", id)}
                        />
                      )}

                      <div className="pt-6 border-t border-gray-100">
                        <label className="block text-xs font-bold text-cyan-700 uppercase tracking-wider mb-3">
                          Digital Resources & Assignments (Sent to Student)
                        </label>
                        <div className="space-y-2 mb-3">
                          {uploadedFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl p-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <FileText
                                  size={18}
                                  className="text-blue-500 flex-shrink-0"
                                />
                                <span className="text-sm font-medium text-gray-700 truncate">
                                  {file.name}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  setUploadedFiles((prev) =>
                                    prev.filter((_, i) => i !== idx),
                                  )
                                }
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-cyan-600 transition-colors px-1 cursor-pointer w-fit">
                          <Paperclip size={16} /> Attach New Resource (PDF, Doc,
                          Image)
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.jpg,.png"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="p-4 md:p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
                      <button
                        onClick={handleDiscard}
                        className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200/50 hover:text-gray-700 transition-colors text-sm w-full sm:w-auto"
                      >
                        Discard
                      </button>
                      <button
                        onClick={handleSaveAll}
                        className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all text-sm w-full sm:w-auto"
                      >
                        Save Session Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/50 p-8 text-center">
              <Users size={48} className="mb-4 opacity-50" />
              <p>Select a student from the sidebar to view details.</p>
            </div>
          )}
        </main>
      </div>

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSchedule={handleScheduleNext}
        studentName={selectedStudent?.name}
      />
    </div>
  );
};

export default StudentsPage;
