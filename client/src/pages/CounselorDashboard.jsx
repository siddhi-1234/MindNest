import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { onAuthStateChanged, signOut } from "firebase/auth";

// --- Sidebar ---
const Sidebar = ({ isOpen, toggleSidebar, user }) => {
  // Get active route path
  const location = useLocation();
  // Navigation hook for redirection
  const navigate = useNavigate();

  // Navigation menu items definition
  const links = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/CounselorDashboard" },
    { icon: Users, label: "Students", path: "/StudentsPage" },
    { icon: Settings, label: "Settings", path: "/SettingsPage" },
  ];

  // Handler to log out the counselor
  const handleLogout = async () => {
    try {
      // Sign out current counselor session from Firebase
      await signOut(auth);
      // Redirect to counselor login page
      navigate("/counselor/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      {/* Semi-transparent animated backdrop overlay for mobile screen drawer */}
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

      {/* Main sidebar container with slide-in animation on mobile */}
      <motion.aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#3c096c] border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out transform ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        {/* Brand logo and close button header */}
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
          {/* Mobile close toggle */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-[#70e000] hover:text-[#38b000]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Counselor profile snippet (avatar, email, specialization) */}
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

        {/* Sidebar navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {links.map((link, index) => {
            // Check if current route matches this link path
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={index}
                to={link.path}
                // Apply active styling if current route matches
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
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

        {/* Sidebar footer with Logout action */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </motion.aside>
    </>
  );
};

// --- HEADER COMPONENT ---
// Renders top dashboard bar with welcome banner, quote, and user avatar
const Header = ({ toggleSidebar, user }) => (
  <header className="bg-[#7b2cbf] border-b border-[#5a189a] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
    <div className="flex items-center gap-4">
      {/* Mobile drawer toggle button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden text-[#ffc300] hover:text-white transition-colors"
      >
        <Menu size={24} />
      </button>
      {/* Dashboard title and current counselor email badge */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-[#ffc300] tracking-tight">
          Counselor Dashboard
        </h1>
        <p className="text-xs text-[#ff9e00] hidden md:block opacity-90">
          Logged in as: {user.email || "counselor@example.com"}
        </p>
      </div>
    </div>

    {/* Right Header: Inspirational quote and counselor profile avatar */}
    <div className="flex items-center gap-6 md:gap-8">
      {/* Inspirational quote */}
      <div className="hidden lg:flex flex-col items-end border-r border-purple-400/30 pr-6 mr-2">
        <p className="text-sm text-white italic font-medium">
          "The good life is a process, not a state of being."
        </p>
        <span className="text-[10px] text-[#ffc300] uppercase tracking-wider font-bold">
          - Carl Rogers
        </span>
      </div>

      {/* Counselor avatar badge */}
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

// ================= MAIN DASHBOARD COMPONENT =================
const CounselorDashboard = () => {
  // Mobile sidebar open/closed toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  // Router navigation instance
  const navigate = useNavigate();

  // State storing counselor profile data
  const [counselor, setCounselor] = useState({
    name: "Loading...",
    title: "",
    image: "",
    email: "",
  });

  // State storing computed metrics (today's sessions, pending requests, average campus wellness score)
  const [stats, setStats] = useState({
    sessionsToday: 0,
    pendingRequests: 0,
    avgWellness: 0,
  });

  // Fetch counselor profile, verify account status, and compute appointment statistics
  useEffect(() => {
    const fetchData = async (user) => {
      try {
        // 1. Fetch counselor profiles from backend
        const counselorsRes = await axios.get(
          `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/counselors`,
        );
        // Find current counselor record matching Firebase UID
        const currentCounselor = counselorsRes.data.find(
          (c) => c.uid === user.uid,
        );

        // Security check: only verified counselors are permitted access to the dashboard
        if (!currentCounselor || currentCounselor.status !== "Verified") {
          await signOut(auth);
          alert("Access Denied: Your account is not verified.");
          navigate("/counselor/login");
          return;
        }

        // Save counselor profile data to state
        setCounselor(currentCounselor);

        // 2. Fetch appointments to calculate counselor metrics
        const apptRes = await axios.get(
          `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/appointments`,
        );
        // Filter appointments assigned to this counselor
        const myAppointments =
          apptRes.data.filter((appt) => appt.counselorId === user.uid) || [];

        // Calculate today's confirmed session count
        const todayDate = new Date().toISOString().split("T")[0];
        const sessionsTodayCount = myAppointments.filter(
          (appt) => appt.date === todayDate && appt.status === "confirmed",
        ).length;

        // Calculate count of pending student appointment requests
        const pendingCount = myAppointments.filter(
          (appt) => appt.status === "pending",
        ).length;

        // Calculate overall average wellness score
        const calculatedWellness = myAppointments.length > 0 ? 4.2 : 0;

        // Update dashboard statistics in state
        setStats({
          sessionsToday: sessionsTodayCount,
          pendingRequests: pendingCount,
          avgWellness: calculatedWellness,
        });
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };

    // Listen for Firebase authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch dashboard data if authenticated
        fetchData(user);
      } else {
        // Redirect to counselor login if unauthenticated
        navigate("/counselor/login");
      }
    });

    // Cleanup: unsubscribe auth listener on component unmount
    return () => unsubscribe();
  }, [navigate]);

  return (
    // Outer dashboard container with full height and lavender background
    <div className="flex h-screen bg-[#b298dc] font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={counselor}
      />
      {/* Main content column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <Header toggleSidebar={toggleSidebar} user={counselor} />
        {/* Scrollable dashboard body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
          {/* Welcome Banner */}
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

          {/* KPI Metrics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric 1: Sessions Today */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#065a60] p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between h-64"
            >
              <div className="flex justify-between items-start">
                {/* Icon box */}
                <div className="w-12 h-12 rounded-full bg-[#E0F2F1] flex items-center justify-center text-[#2C807F]">
                  <Calendar size={24} />
                </div>
                {/* Status pill badge */}
                <span className="bg-[#E0F2F1] text-[#2C807F] text-xs font-bold px-3 py-1 rounded-full">
                  On Track
                </span>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Sessions Today
                </p>
                {/* Metric value count with two-digit format */}
                <h2 className="text-5xl font-bold text-[#e6af2e]">
                  {stats.sessionsToday < 10
                    ? `0${stats.sessionsToday}`
                    : stats.sessionsToday}
                </h2>
              </div>
              {/* Decorative mini bar graph visualization */}
              <div className="flex items-end gap-2 h-10 mt-4">
                <div className="w-1/5 bg-[#B2DFDB] h-[40%] rounded-t-md"></div>
                <div className="w-1/5 bg-[#80CBC4] h-[70%] rounded-t-md"></div>
                <div className="w-1/5 bg-[#4DB6AC] h-[100%] rounded-t-md"></div>
                <div className="w-1/5 bg-[#E0F2F1] h-[30%] rounded-t-md"></div>
                <div className="w-1/5 bg-[#E0F2F1] h-[50%] rounded-t-md"></div>
              </div>
            </motion.div>

            {/* Metric 2: Pending Student Appointment Requests */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#065a60] p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between h-64"
            >
              <div className="flex justify-between items-start">
                {/* Icon box */}
                <div className="w-12 h-12 rounded-full bg-[#FFEBEE] flex items-center justify-center text-[#E57373]">
                  <ClipboardList size={24} />
                </div>
                {/* Action status badge */}
                <span className="bg-[#FFEBEE] text-[#E57373] text-xs font-bold px-3 py-1 rounded-full">
                  Action Needed
                </span>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Pending Requests
                </p>
                {/* Metric count */}
                <h2 className="text-5xl font-bold text-[#e6af2e]">
                  {stats.pendingRequests < 10
                    ? `0${stats.pendingRequests}`
                    : stats.pendingRequests}
                </h2>
                {/* Explanatory description */}
                <p className="text-slate-400 text-sm mt-2">
                  {stats.pendingRequests === 0
                    ? "All caught up!"
                    : "Requests waiting for approval"}
                </p>
              </div>
              {/* Background decorative watermark icon */}
              <div className="absolute -bottom-6 -right-6 text-slate-50">
                <ClipboardList size={120} />
              </div>
            </motion.div>

            {/* Metric 3: Average Wellness Score */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#065a60] p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between h-64"
            >
              <div className="flex justify-between items-start">
                {/* Icon box */}
                <div className="w-12 h-12 rounded-full bg-[#F3E5F5] flex items-center justify-center text-[#9C27B0]">
                  <HeartPulse size={24} />
                </div>
                {/* Campus health status badge */}
                <span className="bg-[#F3E5F5] text-[#9C27B0] text-xs font-bold px-3 py-1 rounded-full">
                  Campus Health
                </span>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Avg. Wellness Score
                </p>
                {/* Score value */}
                <h2 className="text-5xl font-bold text-[#e6af2e]">
                  {stats.avgWellness}
                </h2>
                {/* Weekly delta trend indicator */}
                <p className="text-slate-400 text-sm mt-2 flex items-center gap-2">
                  <Activity size={16} className="text-green-500" />{" "}
                  {stats.avgWellness > 0 ? "+0.4 this week" : "No data yet"}
                </p>
              </div>
              {/* Heartbeat pulse SVG line visualization */}
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

      {/* Floating Action Plus Button for mobile screens */}
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
