import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  ShieldCheck,
  FileText,
  Activity,
  Settings,
  Search,
  Bell,
  Download,
  AlertCircle,
  LogOut,
  Menu,
  X,
  Check,
  Trash2,
  Eye,
} from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Cell,
  XAxis,
  Tooltip,
} from "recharts";
// Import Firebase authentication instance
import { auth } from "../firebase";
// Import Firebase auth methods for checking login state and logging out
import { onAuthStateChanged, signOut } from "firebase/auth";

import axios from "axios";


// Mock 24-hour traffic dataset used to render the bar chart in System Health
const trafficData = [
  { name: "00", value: 400 },
  { name: "04", value: 300 },
  { name: "08", value: 200 },
  { name: "12", value: 278 },
  { name: "16", value: 189 },
  { name: "20", value: 239 },
  { name: "24", value: 349 },
  { name: "28", value: 200 },
  { name: "32", value: 278 },
  { name: "36", value: 189 },
];


// Renders individual sidebar navigation links with active state styling
const SidebarItem = ({ icon: Icon, label, path, onClick }) => {

  const location = useLocation();  // Get current browser URL path

  // Check if current route matches this item's target path
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      onClick={onClick}
      // Apply active styling (blue background/text) if current route matches
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${isActive
        ? "bg-blue-50 text-blue-600 font-medium shadow-sm"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        }`}
    >
      <Icon size={20} />
      <span className="text-sm">{label}</span>
    </Link>
  );
};


// Reusable KPI card to display key dashboard metrics (title, value, icon, change badge)
const StatCard = ({
  icon: Icon,
  label,
  value,
  badge,
  badgeColor,
  iconColor,
}) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow duration-300">
    <div className="flex justify-between items-start">

      <div className={`p-3 rounded-xl ${iconColor}`}>
        <Icon size={24} />
      </div>

      {badge && (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${badgeColor}`}
        >
          {badge}
        </span>
      )}
    </div>
    <div>
      {/* Metric label title */}
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      {/* Metric count or percentage value */}
      <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

// --- COUNSELOR DETAILS MODAL ---
// Modal popup to view detailed information of a selected counselor application
const CounselorModal = ({ counselor, onClose }) => {
  // If no counselor is selected, do not render anything
  if (!counselor) return null;

  return (

    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="bg-blue-600 p-6 flex justify-between items-start">
          <div className="flex items-center gap-4">
            {/* Counselor Initial Avatar */}
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30">
              {counselor.name?.charAt(0).toUpperCase()}
            </div>
            {/* Counselor Name and Email */}
            <div>
              <h2 className="text-xl font-bold text-white">{counselor.name}</h2>
              <p className="text-blue-100 text-sm">{counselor.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Specialization & Status */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                Specialization
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {counselor.specialization || "N/A"}
              </p>
            </div>
            {/* Verification Status Badge */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                Status
              </p>
              <span
                className={`text-xs font-bold px-2 py-1 rounded inline-block ${counselor.status === "Verified"
                  ? "bg-green-100 text-green-700"
                  : counselor.status === "Rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                  }`}
              >
                {counselor.status}
              </span>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">

            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN ADMIN DASHBOARD COMPONENT ---
const AdminDashboard = () => {
  // Store the authenticated Firebase user object
  const [currentUser, setCurrentUser] = useState(null);
  // Store the admin profile data (display name and role)
  const [adminProfile, setAdminProfile] = useState({
    name: "Loading...",
    role: "",
  });
  // State to toggle responsive mobile sidebar open/close
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // State to store real dashboard counts (active students, verified counselors, crisis alerts)
  const [stats, setStats] = useState({ students: 0, counselors: 0, crisis: 0 });

  // State to hold the list of counselor applications fetched from the server
  const [counselors, setCounselors] = useState([]);

  // State to track which counselor's details are open in the modal (null if none)
  const [selectedCounselor, setSelectedCounselor] = useState(null);

  // Loading flag while initial API data is being fetched
  const [loading, setLoading] = useState(true);

  // Fetch dashboard statistics and listen for user auth changes on component mount
  useEffect(() => {
    // Async function to fetch dashboard metrics and counselor applications concurrently
    const fetchData = async () => {
      try {

        const [statsRes, counselorsRes] = await Promise.all([
          // Request overall system stats from the backend
          axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/stats`),
          // Request all counselor applications from the backend
          axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/counselors`),
        ]);
        // Update stats state with received data (total students, verified counselors, crisis alerts)
        setStats(statsRes.data);

        setCounselors(counselorsRes.data);
      } catch (error) {

        console.error("Error fetching dashboard data:", error);
      } finally {
        // Set loading to false once the API requests finish
        setLoading(false);
      }
    };

    // Trigger initial data load
    fetchData();

    // Set up Firebase authentication state change listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Save logged-in Firebase user into state
        setCurrentUser(user);
        try {
          // Fetch additional admin user profile info using their unique UID
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/${user.uid}`,
          );
          // Set admin name and role from backend response
          setAdminProfile({
            name: res.data.name,
            role: "System Administrator",
          });
        } catch (error) {
          // Fallback admin details if profile fetch fails
          setAdminProfile({ name: "Admin", role: "Administrator" });
        }
      } else {
        // Optional: Redirect to login if user is not authenticated
        // navigate("/admin/login");
      }
    });

    // Cleanup: unsubscribe auth listener when component unmounts to prevent memory leaks
    return () => unsubscribe();
  }, [navigate]);

  // Handler to approve or reject a counselor's application
  const handleUpdateStatus = async (id, status) => {
    try {
      // Send PUT request to backend to update counselor verification status
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/counselor/${id}/status`,
        { status },
      );
      // Update the counselor list locally with the updated record from the server
      setCounselors((prev) => prev.map((c) => (c._id === id ? res.data : c)));
      // Increment verified counselors count in local stats if status changed to Verified
      if (status === "Verified")
        setStats((prev) => ({ ...prev, counselors: prev.counselors + 1 }));
    } catch (error) {

      alert("Failed to update status");
    }
  };

  // Handler to delete/remove a counselor application
  const handleDelete = async (id) => {
    // Show confirmation dialog before deleting
    if (!window.confirm("Are you sure you want to remove this counselor?"))
      return;
    try {
      // Send DELETE request to backend to remove the counselor record
      await axios.delete(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/counselor/${id}`);
      // Remove the deleted counselor from local state
      setCounselors((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {

      alert("Failed to delete");
    }
  };

  // Handler to sign out the admin user
  const handleLogout = async () => {
    // Confirm logout with the user
    if (window.confirm("Are you sure you want to log out?")) {
      // Sign out current user from Firebase authentication
      await signOut(auth);
      navigate("/admin/login");
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fc] font-sans text-gray-800 overflow-hidden">
      {/* Modal dialog showing full details when a counselor is clicked */}
      <CounselorModal
        counselor={selectedCounselor}
        onClose={() => setSelectedCounselor(null)}
      />


      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      {/* Responsive sidebar navigation bar */}
      <aside
        className={`fixed md:relative z-30 w-72 bg-white border-r border-gray-200 flex flex-col h-full transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen
          ? "translate-x-0"
          : "-translate-x-full md:translate-x-0"
          }`}
      >
        {/* Brand / Logo header section */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="MindNest"
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              MindNest
            </span>
          </div>
          {/* Close button for mobile sidebar view */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Sidebar navigation links */}
        <div className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">

          <SidebarItem
            icon={LayoutGrid}
            label="Overview"
            path="/admin"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          <SidebarItem
            icon={Settings}
            label="Settings"
            path="/admin/settings"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        </div>

        {/* Admin profile snippet & logout button at sidebar bottom */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
            {/* User avatar initial */}
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {adminProfile.name.charAt(0).toUpperCase()}
            </div>
            {/* User name & role info */}
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {adminProfile.name}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {adminProfile.role}
              </p>
            </div>
            {/* Logout button */}
            <button onClick={handleLogout} title="Log Out">
              <LogOut
                size={18}
                className="text-gray-400 hover:text-red-500 transition-colors"
              />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        <header className="h-16 md:h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Hamburger menu button to open sidebar on mobile screens */}
            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
          </div>
        </header>


        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">

          <div className="animate-fade-in-up">
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Overview
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Monitoring MindNest student welfare and system performance.
            </p>
          </div>

          {/* Stats Grid - Displays key metrics (Students, Counselors, Crisis Alerts, Engagement) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up animation-delay-100">
            {/* Total Active Students metric card */}
            <StatCard
              icon={Users}
              iconColor="bg-blue-100 text-blue-600"
              label="Total Active Students"
              value={loading ? "..." : stats.students}
              badge="+12%"
              badgeColor="bg-green-100 text-green-700"
            />
            {/* Verified Counselors metric card */}
            <StatCard
              icon={ShieldCheck}
              iconColor="bg-purple-100 text-purple-600"
              label="Verified Counselors"
              value={loading ? "..." : stats.counselors}
              badge="+4.2%"
              badgeColor="bg-green-100 text-green-700"
            />
            {/* Active Crisis Alerts metric card */}
            <StatCard
              icon={AlertCircle}
              iconColor="bg-red-100 text-red-600"
              label="Active Crisis Alerts"
              value={loading ? "..." : stats.crisis}
              badge={null}
              badgeColor=""
            />
            {/* Resource Engagement metric card */}
            <StatCard
              icon={Activity}
              iconColor="bg-yellow-100 text-yellow-600"
              label="Resource Engagement"
              value="84.5%"
              badge="Weekly"
              badgeColor="bg-gray-100 text-gray-600"
            />
          </div>

          {/* Middle Section: Counselor Applications Table and System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up animation-delay-200">
            {/* Left Column: Counselor Applications Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-900">
                  Counselor Applications
                </h3>
              </div>
              <div className="overflow-x-auto flex-1">
                {/* Fallback message when there are no applications */}
                {counselors.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">
                    No applications found.
                  </div>
                ) : (
                  <table className="w-full text-left min-w-[600px]">
                    {/* Table column headers */}
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <th className="pb-4 pl-2">Applicant</th>
                        <th className="pb-4">Specialization</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    {/* Table row list for each counselor application */}
                    <tbody className="text-sm">
                      {counselors.map((app) => (
                        <tr
                          key={app._id}
                          className="group hover:bg-gray-50 transition-colors"
                        >
                          {/* Applicant avatar, name, and email */}
                          <td className="py-4 pl-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">
                                {app.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">
                                  {app.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {app.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          {/* Applicant Specialization area */}
                          <td className="py-4 text-gray-600">
                            {app.specialization || "General"}
                          </td>
                          {/* Application Status badge */}
                          <td className="py-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${app.status === "Verified"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : app.status === "Rejected"
                                  ? "bg-red-100 text-red-700 border border-red-200"
                                  : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                                }`}
                            >
                              {app.status || "Pending"}
                            </span>
                          </td>
                          {/* Action buttons: View info, Accept, Reject, Delete */}
                          <td className="py-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* View Counselor Modal button */}
                              <button
                                onClick={() => setSelectedCounselor(app)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Info"
                              >
                                <Eye size={16} />
                              </button>

                              {/* Status Action Buttons (only visible if application status is Pending) */}
                              {app.status === "Pending" && (
                                <>
                                  {/* Accept/Verify counselor button */}
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(app._id, "Verified")
                                    }
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Accept"
                                  >
                                    <Check size={16} />
                                  </button>
                                  {/* Reject counselor button */}
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(app._id, "Rejected")
                                    }
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Reject"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              )}

                              {/* Delete / Remove counselor record button */}
                              <button
                                onClick={() => handleDelete(app._id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right Column: System Health & Traffic Bar Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
              {/* Header with operational status badge */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-900">
                  System Health
                </h3>
                <span className="flex items-center gap-1.5 text-[10px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded-full uppercase tracking-wider border border-green-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Operational
                </span>
              </div>
              {/* Health Metrics: Server Uptime and API Latency indicators */}
              <div className="space-y-6 mb-8">
                {/* Server Uptime bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    <span>Server Uptime</span>
                    <span className="text-gray-900">99.98%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[99.9%] rounded-full"></div>
                  </div>
                </div>
                {/* API Latency bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    <span>API Latency</span>
                    <span className="text-gray-900">42ms</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-[15%] rounded-full"></div>
                  </div>
                </div>
              </div>
              {/* 24h Traffic Bar Chart visualization */}
              <div className="flex-1 min-h-[150px] relative">
                <p className="text-xs font-bold text-gray-400 mb-2 uppercase">
                  Traffic Trend (24h)
                </p>
                {/* Responsive container automatically sizes chart to parent container */}
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trafficData}>
                    {/* X-Axis mapping mock time hours */}
                    <XAxis dataKey="name" hide />
                    {/* Tooltip displaying traffic volume on hover */}
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    {/* Bar visualization with active peak highlight */}
                    <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                      {trafficData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 6 ? "#2563EB" : "#DBEAFE"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
