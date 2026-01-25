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

// ================= SUB-COMPONENTS =================

const SidebarItem = ({ student, isSelected, onClick }) => (
  <div
    onClick={() => onClick(student)}
    className={`flex items-start gap-3 p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
      isSelected ? "bg-cyan-50/50 border-l-4 border-l-cyan-500" : ""
    }`}
  >
    <img
      src={student.image || "https://i.pravatar.cc/150?img=12"}
      alt={student.name}
      className="w-10 h-10 rounded-full object-cover"
    />
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline mb-1">
        <h4
          className={`text-sm font-bold truncate ${
            isSelected ? "text-cyan-900" : "text-gray-800"
          }`}
        >
          {student.name}
        </h4>
        <span className="text-xs text-gray-400">
          {student.lastAppointmentDate || "New"}
        </span>
      </div>
      <p className="text-xs text-gray-500 truncate mb-2">
        {student.concern || "General Checkup"}
      </p>
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

// ================= NOTE EDITOR COMPONENT =================
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

      <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-start group"
          >
            <div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {note.text}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                {new Date(note.date).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
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

// ================= MAIN PAGE COMPONENT =================

const StudentsPage = () => {
  const [activeTab, setActiveTab] = useState("Session Notes");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentMoods, setStudentMoods] = useState([]);
  const [journalCount, setJournalCount] = useState(0);
  const [isListOpen, setIsListOpen] = useState(false); // Mobile sidebar toggle

  // State for Notes/Prescriptions/Treatments
  const [sessionNotes, setSessionNotes] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Fetch Students & Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apptRes = await axios.get(
          "http://localhost:5000/api/appointments",
        );
        const uniqueStudentsMap = new Map();

        apptRes.data.forEach((appt) => {
          // In real app, filter by logged in counselor ID here
          if (!uniqueStudentsMap.has(appt.studentName)) {
            uniqueStudentsMap.set(appt.studentName, {
              id: appt._id,
              name: appt.studentName || "Student",
              concern: appt.concern || "General",
              lastAppointmentDate: appt.date,
              image: `https://i.pravatar.cc/150?u=${appt.studentName}`,
            });
          }
        });

        const studentList = Array.from(uniqueStudentsMap.values());
        setStudents(studentList);

        if (studentList.length > 0) {
          setSelectedStudent(studentList[0]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // Fetch Student Specific Details
  useEffect(() => {
    if (!selectedStudent) return;

    // Simulate Fetching Data
    const mockMoods = Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString(),
      score: Math.floor(Math.random() * 5) + 1,
    }));
    setStudentMoods(mockMoods);
    setJournalCount(Math.floor(Math.random() * 20) + 1);

    setSessionNotes([]);
    setPrescriptions([]);
    setTreatmentPlans([]);
    setUploadedFiles([]);

    // Close sidebar on mobile when student selected
    setIsListOpen(false);
  }, [selectedStudent]);

  // Handlers
  const handleSaveNote = (type, text, id) => {
    const newNote = {
      id: id || Date.now(),
      text,
      date: new Date().toISOString(),
    };
    if (type === "notes")
      setSessionNotes((prev) =>
        id ? prev.map((n) => (n.id === id ? newNote : n)) : [...prev, newNote],
      );
    else if (type === "rx")
      setPrescriptions((prev) =>
        id ? prev.map((n) => (n.id === id ? newNote : n)) : [...prev, newNote],
      );
    else if (type === "plan")
      setTreatmentPlans((prev) =>
        id ? prev.map((n) => (n.id === id ? newNote : n)) : [...prev, newNote],
      );
  };

  const handleDeleteNote = (type, id) => {
    if (type === "notes")
      setSessionNotes((prev) => prev.filter((n) => n.id !== id));
    else if (type === "rx")
      setPrescriptions((prev) => prev.filter((n) => n.id !== id));
    else if (type === "plan")
      setTreatmentPlans((prev) => prev.filter((n) => n.id !== id));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFiles((prev) => [
        ...prev,
        { name: file.name, url: URL.createObjectURL(file) },
      ]);
      alert(`File "${file.name}" uploaded and sent to student email!`);
    }
  };

  const handleDiscard = () => {
    if (window.confirm("Are you sure? This will clear unsaved changes.")) {
      alert("Changes discarded.");
    }
  };

  const handleSaveAll = () => {
    alert("All session data saved successfully!");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col h-screen overflow-hidden">
      {/* --- 1. HEADER --- */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 h-16 flex items-center justify-between shrink-0 z-30 relative">
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Toggle */}
          <button
            className="md:hidden text-gray-500 hover:text-cyan-600"
            onClick={() => setIsListOpen(!isListOpen)}
          >
            <Users size={24} />
          </button>

          <img
            src="/logo.png"
            alt="MindNest"
            className="w-8 h-8 object-contain"
          />
          <span className="text-lg font-bold text-gray-900 tracking-tight hidden sm:block">
            MindNest Counselor Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
          >
            <LogOut size={18} />{" "}
            <span className="hidden sm:inline">Logout</span>
          </Link>
        </div>
      </header>

      {/* --- 2. MAIN LAYOUT --- */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* --- STUDENT LIST SIDEBAR (Responsive) --- */}
        {/* Overlay for mobile */}
        {isListOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsListOpen(false)}
          ></div>
        )}

        <aside
          className={`
          fixed md:relative inset-y-0 left-0 z-30 w-72 md:w-80 bg-white border-r border-gray-200 flex flex-col 
          transform transition-transform duration-300 ease-in-out md:translate-x-0
          ${isListOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <div className="p-5 border-b border-gray-100 flex-none">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg">Active Cases</h2>
              <span className="bg-cyan-100 text-cyan-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {students.length}
              </span>
            </div>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {students.map((student) => (
              <SidebarItem
                key={student.id}
                student={student}
                isSelected={selectedStudent?.id === student.id}
                onClick={setSelectedStudent}
              />
            ))}
          </div>
        </aside>

        {/* --- RIGHT CONTENT (PROFILE & NOTES) --- */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 md:p-8">
          {selectedStudent ? (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Student Header Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
                  <div className="relative">
                    <img
                      src={selectedStudent.image}
                      alt={selectedStudent.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-cyan-50"
                    />
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedStudent.name}
                    </h1>
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="text-cyan-600">🎓</span> Student
                      </span>
                      <span className="hidden md:inline">•</span>
                      <span>Active Case</span>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-auto">
                  <button className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all">
                    <Calendar size={18} /> Schedule Next Session
                  </button>
                </div>
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* --- LEFT COLUMN (STATS) --- */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Mood Chart */}
                  <MoodChartWidget moodData={studentMoods} />

                  {/* Engagement Stats */}
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

                  {/* Student Queries Section */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <MessageCircle size={18} className="text-cyan-600" />{" "}
                      Student Queries
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-900 border border-blue-100">
                        "How do I manage panic attacks during exams?"
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-900 border border-blue-100">
                        "Is it normal to feel tired all the time?"
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- RIGHT COLUMN (NOTES & FORM) --- */}
                <div className="lg:col-span-7">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
                    {/* Tab Header (Scrollable on mobile) */}
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

                    {/* Form Content */}
                    <div className="p-4 md:p-6 space-y-6 flex-1 overflow-y-auto">
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

                      {/* Resources Upload */}
                      <div className="pt-6 border-t border-gray-100">
                        <label className="block text-xs font-bold text-cyan-700 uppercase tracking-wider mb-3">
                          Digital Resources & Assignments
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
                          <Paperclip size={16} /> Attach New Resource
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.jpg,.png"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Footer Actions */}
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
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
              <Users size={48} className="mb-4 opacity-20" />
              <p>Select a student from the sidebar to view details.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentsPage;
