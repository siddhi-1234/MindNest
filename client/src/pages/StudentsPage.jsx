import React, { useState } from "react";
import {
  Search,
  Bell,
  Settings,
  MoreVertical,
  Video,
  Calendar,
  Printer,
  Share2,
  Plus,
  CheckCircle,
  FileText,
  X,
  Paperclip,
  ChevronDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ================= MOCK DATA =================

const STUDENTS_LIST = [
  {
    id: 1,
    name: "Aria Montgomery",
    issue: "Anxiety management",
    date: "Oct 24",
    img: "https://i.pravatar.cc/150?img=5",
    priority: "High",
    isActive: true,
  },
  {
    id: 2,
    name: "Ethan Brooks",
    issue: "Exam stress",
    date: "Oct 22",
    img: "https://i.pravatar.cc/150?img=11",
    priority: "Medium",
    isActive: false,
  },
  {
    id: 3,
    name: "Chloe Zhao",
    issue: "Social adjustment",
    date: "Oct 20",
    img: "https://i.pravatar.cc/150?img=9",
    priority: "Low",
    isActive: false,
  },
  {
    id: 4,
    name: "Marcus Thompson",
    issue: "Sleep disturbances",
    date: "Oct 19",
    img: "https://i.pravatar.cc/150?img=3",
    priority: "Low",
    isActive: false,
  },
];

const MOOD_DATA = [
  { day: "MON", value: 4 },
  { day: "WED", value: 6 },
  { day: "FRI", value: 5 },
  { day: "SUN", value: 3 },
  { day: "TUE", value: 7 },
  { day: "THU", value: 8 },
  { day: "TODAY", value: 9 }, // Highlighted
];

const JOURNAL_KEYWORDS = [
  { text: "Deadlines", color: "bg-yellow-100 text-yellow-700" },
  { text: "Social Anxiety", color: "bg-blue-100 text-blue-700" },
  { text: "Progress", color: "bg-green-100 text-green-700" },
  { text: "Lack of Sleep", color: "bg-red-100 text-red-700" },
];

const COPING_STRATEGIES = [
  {
    id: 1,
    text: "4-7-8 Breathing Technique for acute anxiety attacks",
    checked: true,
  },
  {
    id: 2,
    text: "Sleep hygiene: No screens 60 mins before bed",
    checked: true,
  },
  { id: 3, text: "Add a new suggestion...", checked: false },
];

// ================= SUB-COMPONENTS =================

const SidebarItem = ({ student }) => (
  <div
    className={`flex items-start gap-3 p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
      student.isActive ? "bg-cyan-50/50 border-l-4 border-l-cyan-500" : ""
    }`}
  >
    <img
      src={student.img}
      alt={student.name}
      className="w-10 h-10 rounded-full object-cover"
    />
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline mb-1">
        <h4
          className={`text-sm font-bold truncate ${student.isActive ? "text-cyan-900" : "text-gray-800"}`}
        >
          {student.name}
        </h4>
        <span className="text-xs text-gray-400">{student.date}</span>
      </div>
      <p className="text-xs text-gray-500 truncate mb-2">{student.issue}</p>
      {student.priority === "High" && (
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wide">
          Priority
        </span>
      )}
    </div>
  </div>
);

const MoodChartWidget = () => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-gray-800">Mood Trends</h3>
      <button className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
        Last 14 days <ChevronDown size={14} />
      </button>
    </div>
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={MOOD_DATA} barSize={32}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
            dy={10}
          />
          <Tooltip
            cursor={{ fill: "#F3F4F6" }}
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 4, 4]}>
            {MOOD_DATA.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.day === "TODAY" ? "#22D3EE" : "#BAE6FD"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// ================= MAIN PAGE COMPONENT =================

const StudentsPage = () => {
  const [activeTab, setActiveTab] = useState("Notes");

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col h-screen overflow-hidden">
      {/* --- 1. HEADER --- */}
      <header className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            {/* Logo Placeholder */}
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white transform rotate-45"></div>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              MindNest Counselor
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <a
              href="/dashboard"
              className="hover:text-cyan-600 transition-colors"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-cyan-600 border-b-2 border-cyan-600 pb-5 pt-5"
            >
              Students
            </a>
            <a href="#" className="hover:text-cyan-600 transition-colors">
              Schedule
            </a>
            <a href="#" className="hover:text-cyan-600 transition-colors">
              Reports
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <Bell size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <Settings size={20} />
          </button>
          <img
            src="https://i.pravatar.cc/150?img=68"
            alt="Profile"
            className="w-9 h-9 rounded-full border border-gray-200 cursor-pointer"
          />
        </div>
      </header>

      {/* --- 2. MAIN LAYOUT --- */}
      <div className="flex flex-1 overflow-hidden">
        {/* --- LEFT SIDEBAR (STUDENT LIST) --- */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col z-10">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg">Active Cases</h2>
              <span className="bg-cyan-100 text-cyan-700 text-xs font-bold px-2.5 py-1 rounded-full">
                12 Active
              </span>
            </div>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search students..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {STUDENTS_LIST.map((student) => (
              <SidebarItem key={student.id} student={student} />
            ))}
          </div>
        </aside>

        {/* --- RIGHT CONTENT (PROFILE & NOTES) --- */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Student Header Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img
                    src="https://i.pravatar.cc/150?img=5"
                    alt="Aria"
                    className="w-20 h-20 rounded-full object-cover border-4 border-cyan-50"
                  />
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Aria Montgomery
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="text-cyan-600">🎓</span> 3rd Year
                      Psychology Student
                    </span>
                    <span>•</span>
                    <span>Age: 21</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  <Video size={18} /> Start Call
                </button>
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all">
                  <Calendar size={18} /> Schedule Next Session
                </button>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* --- LEFT COLUMN (STATS) --- */}
              <div className="lg:col-span-5 space-y-6">
                {/* Mood Chart */}
                <MoodChartWidget />

                {/* Engagement Stats */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">
                    Engagement & Journaling
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                      <span className="block text-3xl font-bold text-cyan-600 mb-1">
                        12
                      </span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Journal Entries
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                      <span className="block text-3xl font-bold text-cyan-600 mb-1">
                        85%
                      </span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Self-Care Streak
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-3">
                      Recent Keywords from Journals:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {JOURNAL_KEYWORDS.map((k, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1 rounded-md text-xs font-bold ${k.color}`}
                        >
                          {k.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* --- RIGHT COLUMN (NOTES & FORM) --- */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
                  {/* Tab Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex gap-6">
                      {[
                        "Session Notes",
                        "Digital Prescription",
                        "Treatment Plan",
                      ].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`text-sm font-bold pb-4 -mb-4 border-b-2 transition-colors ${
                            activeTab === tab
                              ? "text-cyan-600 border-cyan-500"
                              : "text-gray-400 border-transparent hover:text-gray-600"
                          }`}
                        >
                          {tab === "Session Notes" ? "Session Notes" : tab}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 text-gray-400">
                      <button className="hover:text-gray-600 p-1">
                        <Printer size={18} />
                      </button>
                      <button className="hover:text-gray-600 p-1">
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="p-6 space-y-6 flex-1">
                    {/* Clinical Notes */}
                    <div>
                      <label className="block text-xs font-bold text-cyan-700 uppercase tracking-wider mb-3">
                        Internal Clinical Notes
                      </label>
                      <textarea
                        className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500/20 focus:bg-white transition-all resize-none h-32"
                        placeholder="Enter clinical observations, internal remarks, and progress evaluation..."
                      ></textarea>
                    </div>

                    {/* Coping Strategies */}
                    <div>
                      <label className="block text-xs font-bold text-cyan-700 uppercase tracking-wider mb-3">
                        Coping Strategies (Shared with Student)
                      </label>
                      <div className="bg-cyan-50/50 rounded-xl p-4 border border-cyan-100/50 space-y-3">
                        {COPING_STRATEGIES.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 group cursor-pointer"
                          >
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${item.checked ? "bg-cyan-500" : "bg-gray-200 group-hover:bg-gray-300"}`}
                            >
                              {item.checked ? (
                                <CheckCircle size={14} className="text-white" />
                              ) : (
                                <Plus size={14} className="text-gray-500" />
                              )}
                            </div>
                            <span
                              className={`text-sm ${item.checked ? "text-gray-800" : "text-gray-400 italic"}`}
                            >
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    <div>
                      <label className="block text-xs font-bold text-cyan-700 uppercase tracking-wider mb-3">
                        Digital Resources & Assignments
                      </label>
                      <div className="flex items-center justify-between bg-white border border-dashed border-gray-300 rounded-xl p-3 hover:border-cyan-400 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                            <FileText size={20} />
                          </div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-700">
                            Anxiety_Workbook.pdf
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      <button className="mt-3 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-cyan-600 transition-colors px-1">
                        <Paperclip size={16} /> Attach New Resource
                      </button>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
                    <button className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200/50 hover:text-gray-700 transition-colors text-sm">
                      Discard
                    </button>
                    <button className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all text-sm">
                      Save Session Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentsPage;
