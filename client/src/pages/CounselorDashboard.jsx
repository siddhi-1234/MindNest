import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar as CalendarIcon,
  BarChart,
  Settings,
  Menu,
  LogOut,
  Calendar,
  ClipboardList,
  Plus,
  X,
  Activity,
  HeartPulse,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

// --- Sidebar (Updated with Navigation Links) ---

const Sidebar = ({ isOpen, toggleSidebar, user }) => {
  const location = useLocation();

  const links = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/CounselorDashboard" },
    { icon: Users, label: "Students", path: "/StudentsPage" },
    { icon: Settings, label: "Settings", path: "/SettingsPage" },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#3c096c] border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="MindNest"
              className="w-9 h-8 logo-hover"
            />
            <span className="text-xl font-bold text-[#70e000] logo-hover">
              MindNest
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden text-[#70e000] hover:text-[#38b000]"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <img
            src={user.image || "https://i.pravatar.cc/150?img=47"}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="min-w-0">
            <h4
              className="text-sm font-semibold text-[#70e000] truncate max-w-[140px]"
              title={user.email}
            >
              {user.email || "counselor@example.com"}
            </h4>
            <p className="text-xs text-[#38b000]">
              {user.title || "Specialist"}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {links.map((link, index) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={index}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-teal-50 text-[#240046]"
                    : "text-[#70e000] hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <link.icon size={20} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </motion.aside>
    </>
  );
};

// --- Header (Dynamic User Props) ---

const Header = ({ toggleSidebar, user }) => (
  <header className="bg-[#7b2cbf] border-b border-[#5a189a] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
    <div className="flex items-center gap-4">
      <button
        onClick={toggleSidebar}
        className="md:hidden text-[#ffc300] hover:text-white transition-colors"
      >
        <Menu size={24} />
      </button>
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-[#ffc300] tracking-tight">
          Counselor Dashboard
        </h1>
        <p className="text-xs text-[#ff9e00] hidden md:block opacity-90">
          Logged in as: {user.email || "counselor@example.com"}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-6 md:gap-8">
      <div className="hidden lg:flex flex-col items-end border-r border-purple-400/30 pr-6 mr-2">
        <p className="text-sm text-white italic font-medium">
          "The good life is a process, not a state of being."
        </p>
        <span className="text-[10px] text-[#ffc300] uppercase tracking-wider font-bold">
          - Carl Rogers
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#3c096c] border-2 border-[#ffc300] p-0.5 cursor-pointer hover:scale-105 transition-transform shadow-lg">
          <img
            src={user.image || "https://i.pravatar.cc/150?img=47"}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>
    </div>
  </header>
);

// ================= MAIN AREA =================

const CounselorDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // State for Dynamic Data
  const [counselor, setCounselor] = useState({
    name: "Loading...",
    title: "",
    image: "",
    email: "",
  });

  // ✅ FIX 1: Initialize stats to 0, not dummy numbers
  const [stats, setStats] = useState({
    sessionsToday: 0,
    pendingRequests: 0,
    avgWellness: 0, // Default to 0 or calculate dynamically if backend supports it
  });

  // Fetch Data Logic
  useEffect(() => {
    const fetchData = async (user) => {
      try {
        // 1. Fetch Counselor Profile
        const counselorsRes = await axios.get(
          "http://localhost:5000/api/counselors",
        );
        const currentCounselor =
          counselorsRes.data.find((c) => c.uid === user.uid) ||
          counselorsRes.data[0];

        if (currentCounselor) {
          setCounselor(currentCounselor);
        }

        // 2. Fetch Appointments for stats
        const apptRes = await axios.get(
          "http://localhost:5000/api/appointments",
        );

        // ✅ FIX 2: Filter appointments ONLY for the current counselor
        const myAppointments =
          apptRes.data.filter((appt) => appt.counselorId === user.uid) || [];

        const todayDate = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD to match
        // Or if you use "Oct 23" format, ensure you convert properly.
        // Assuming YYYY-MM-DD from previous fixes:

        const sessionsTodayCount = myAppointments.filter(
          (appt) => appt.date === todayDate && appt.status === "confirmed",
        ).length;

        const pendingCount = myAppointments.filter(
          (appt) => appt.status === "pending",
        ).length;

        // Note: avgWellness would require a separate calculation if you have that data field
        // For now, if no students, 0 is appropriate.
        const calculatedWellness = myAppointments.length > 0 ? 4.2 : 0;

        setStats({
          sessionsToday: sessionsTodayCount,
          pendingRequests: pendingCount,
          avgWellness: calculatedWellness,
        });
      } catch (error) {
        console.error("Error fetching dashboard data", error);
        setCounselor({
          name: "Counselor",
          title: "Specialist",
          email: user.email,
        });
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCounselor((prev) => ({ ...prev, email: user.email }));
        fetchData(user);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex h-screen bg-[#b298dc] font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={counselor}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} user={counselor} />

        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
          {/* 1. Hero Section */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h4 className="text-[#07042c] font-bold text-xs tracking-widest uppercase mb-3">
              ACCOUNT: {counselor.email || "Loading..."}
            </h4>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 leading-tight">
              Today is a new opportunity <br />
              to nurture{" "}
              <span className="text-[#a53860]">mental resilience.</span>
            </h1>
          </div>

          {/* 2. KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Sessions Today */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#065a60] p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between h-64"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-full bg-[#E0F2F1] flex items-center justify-center text-[#2C807F]">
                  <Calendar size={24} />
                </div>
                <span className="bg-[#E0F2F1] text-[#2C807F] text-xs font-bold px-3 py-1 rounded-full">
                  On Track
                </span>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Sessions Today
                </p>
                <h2 className="text-5xl font-bold text-[#e6af2e]">
                  {stats.sessionsToday < 10
                    ? `0${stats.sessionsToday}`
                    : stats.sessionsToday}
                </h2>
              </div>
              <div className="flex items-end gap-2 h-10 mt-4">
                <div className="w-1/5 bg-[#B2DFDB] h-[40%] rounded-t-md"></div>
                <div className="w-1/5 bg-[#80CBC4] h-[70%] rounded-t-md"></div>
                <div className="w-1/5 bg-[#4DB6AC] h-[100%] rounded-t-md"></div>
                <div className="w-1/5 bg-[#E0F2F1] h-[30%] rounded-t-md"></div>
                <div className="w-1/5 bg-[#E0F2F1] h-[50%] rounded-t-md"></div>
              </div>
            </motion.div>

            {/* Card 2: Pending Requests */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#065a60] p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between h-64"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-full bg-[#FFEBEE] flex items-center justify-center text-[#E57373]">
                  <ClipboardList size={24} />
                </div>
                <span className="bg-[#FFEBEE] text-[#E57373] text-xs font-bold px-3 py-1 rounded-full">
                  Action Needed
                </span>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Pending Requests
                </p>
                <h2 className="text-5xl font-bold text-[#e6af2e]">
                  {stats.pendingRequests < 10
                    ? `0${stats.pendingRequests}`
                    : stats.pendingRequests}
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  {stats.pendingRequests === 0
                    ? "All caught up!"
                    : "Requests waiting for approval"}
                </p>
              </div>
              <div className="absolute -bottom-6 -right-6 text-slate-50">
                <ClipboardList size={120} />
              </div>
            </motion.div>

            {/* Card 3: Average Wellness Score */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#065a60] p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between h-64"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-full bg-[#F3E5F5] flex items-center justify-center text-[#9C27B0]">
                  <HeartPulse size={24} />
                </div>
                <span className="bg-[#F3E5F5] text-[#9C27B0] text-xs font-bold px-3 py-1 rounded-full">
                  Campus Health
                </span>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Avg. Wellness Score
                </p>
                <h2 className="text-5xl font-bold text-[#e6af2e]">
                  {stats.avgWellness}
                </h2>
                <p className="text-slate-400 text-sm mt-2 flex items-center gap-2">
                  <Activity size={16} className="text-green-500" />{" "}
                  {stats.avgWellness > 0 ? "+0.4 this week" : "No data yet"}
                </p>
              </div>
              <div className="flex items-center gap-1 h-12 mt-2 opacity-50">
                <div className="w-full h-px bg-white relative">
                  <svg
                    viewBox="0 0 500 100"
                    className="absolute bottom-0 left-0 w-full h-16 text-white fill-none stroke-current stroke-2"
                  >
                    <path d="M0,50 L40,50 L60,20 L80,80 L100,50 L150,50 L170,20 L190,80 L210,50 L500,50" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-teal-700 transition-colors md:hidden z-50"
      >
        <Plus size={28} />
      </motion.button>
    </div>
  );
};

export default CounselorDashboard;
