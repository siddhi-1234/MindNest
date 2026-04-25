import React, { useState, useEffect } from "react";
import {
  User,
  Bell,
  Shield,
  BookOpen,
  Headphones,
  LogOut,
  Camera,
  Menu,
  Lock,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  signOut,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import axios from "axios";

// ================= REUSABLE COMPONENTS =================
const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? "bg-cyan-600" : "bg-gray-400"}`}
  >
    <span
      className={`${enabled ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
    />
  </button>
);

// ... (ChangePasswordModal & TechSupportModal remain exactly the same) ...
const ChangePasswordModal = ({ isOpen, onClose, onSave, loading }) => {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (newPass !== confirmPass) return alert("New passwords do not match.");
    if (newPass.length < 6)
      return alert("Password must be at least 6 characters.");
    onSave(currentPass, newPass);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Change Password
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Current Password
            </label>
            <input
              type="password"
              className="w-full p-3 border rounded-xl"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full p-3 border rounded-xl"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full p-3 border rounded-xl"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

const TechSupportModal = ({ isOpen, onClose, onSend, loading }) => {
  const [issue, setIssue] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Report a Bug</h3>
        <p className="text-sm text-gray-500 mb-4">
          Describe the issue you are facing. We will send this directly to the
          admin team.
        </p>
        <textarea
          className="w-full p-3 border rounded-xl h-32 resize-none focus:ring-2 focus:ring-cyan-500 outline-none"
          placeholder="I clicked on the calendar and..."
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
        ></textarea>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-bold"
          >
            Cancel
          </button>
          <button
            onClick={() => onSend(issue)}
            disabled={loading || !issue.trim()}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? "Sending..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const navigate = useNavigate(); // ✅ Initialize Navigation Hook
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTechModal, setShowTechModal] = useState(false);

  const [profile, setProfile] = useState({
    name: "Loading...",
    role: "Counselor",
    specialty: "",
    license: "",
    bio: "",
    image: "https://i.pravatar.cc/150?img=12",
  });

  const [preferences, setPreferences] = useState({
    sessionTypes: { video: true, chat: true, phone: false },
    duration: 30,
  });

  const [notifications, setNotifications] = useState({
    appointmentRequests: true,
    studentMessages: true,
    emergencyAlerts: true,
  });

  const fetchSettings = async (user) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/counselors`);
      const counselorData = response.data.find((c) => c.uid === user.uid);

      if (counselorData) {
        setProfile({
          name: counselorData.name || user.displayName || "Counselor",
          role: counselorData.title || "Mental Health Professional",
          specialty: counselorData.tags ? counselorData.tags.join(", ") : "",
          license: counselorData.license || "",
          bio: counselorData.description || "",
          image: counselorData.image || "https://i.pravatar.cc/150?img=12",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchSettings(user);
      } else {
        // Optional: Auto-redirect if not logged in
        // navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSaveAll = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/counselors/${currentUser.uid}`,
        {
          name: profile.name,
          title: profile.role,
          license: profile.license,
          description: profile.bio,
          tags: profile.specialty.split(",").map((s) => s.trim()),
        },
      );
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (
      window.confirm(
        "Discard unsaved changes? This will reload your saved profile.",
      )
    ) {
      fetchSettings(currentUser);
    }
  };

  const handlePasswordUpdate = async (currentPass, newPass) => {
    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPass,
      );
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPass);

      await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/send-email`, {
        email: currentUser.email,
        subject: "Security Alert: Password Changed",
        message: `Hello ${profile.name},\n\nYour MindNest account password was successfully changed just now.\n\nIf this wasn't you, please contact support immediately.`,
      });

      alert("Password updated successfully! Notification sent.");
      setShowPasswordModal(false);
    } catch (error) {
      console.error(error);
      alert("Failed to update password. Check your current password.");
    } finally {
      setLoading(false);
    }
  };

  const handleTechSupportSubmit = async (issue) => {
    setLoading(true);
    try {
      const ADMIN_EMAIL = "patilsiddhi2709@gmail.com";
      await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/send-email`, {
        email: ADMIN_EMAIL,
        subject: `🐛 Bug Report from ${profile.name}`,
        message: `BUG REPORT\n----------\nReporter: ${profile.name}\nRole: ${profile.role}\nUID: ${currentUser.uid}\nEmail: ${currentUser.email}\n\nISSUE:\n${issue}`,
      });

      alert(`Report sent to ${ADMIN_EMAIL}`);
      setShowTechModal(false);
    } catch (error) {
      console.error(error);
      alert("Failed to send report.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED LOGOUT HANDLER
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await signOut(auth);
      navigate("/counselor/login"); // Redirects to Login Page
    }
  };

  const openHandbook = () => {
    window.open(
      "https://www.google.com/search?q=counselor+handbook+guidelines+pdf",
      "_blank",
    );
  };

  return (
    <div
      style={{ backgroundColor: "#04151f" }}
      className="min-h-screen font-sans flex flex-col h-screen overflow-hidden text-gray-800"
    >
      {/* HEADER */}
      <header
        style={{ backgroundColor: "#214e34" }}
        className="border-b border-white/10 px-4 md:px-6 h-16 flex items-center justify-between shrink-0 z-30 shadow-md"
      >
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-white hover:text-cyan-300"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="MindNest"
              className="w-9 h-9 object-contain"
            />
            <span className="text-lg font-bold text-white tracking-tight">
              Counselor Portal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            <LogOut size={18} />{" "}
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <aside
          style={{ backgroundColor: "#1b263b" }}
          className={`fixed md:relative inset-y-0 left-0 z-30 w-64 border-r border-white/10 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <img
                src={profile.image}
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-cyan-500 object-cover"
              />
              <div className="overflow-hidden">
                <h3 className="text-white font-bold truncate text-sm">
                  {profile.name}
                </h3>
                <p className="text-cyan-400 text-xs truncate">{profile.role}</p>
              </div>
            </div>
            <nav className="space-y-2">
              <Link
                to="/CounselorDashboard"
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/10 rounded-xl transition-colors"
              >
                <div className="w-5">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </div>
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                to="/StudentsPage"
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/10 rounded-xl transition-colors"
              >
                <div className="w-5">
                  <User size={20} />
                </div>
                <span className="font-medium">Students</span>
              </Link>
              <div className="flex items-center gap-3 px-4 py-3 bg-cyan-600/20 text-cyan-300 rounded-xl border border-cyan-500/30">
                <div className="w-5">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <span className="font-medium">Settings</span>
              </div>
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
              <p className="text-gray-400">
                Manage your professional profile, preferences, and security.
              </p>
            </div>

            {/* PROFESSIONAL PROFILE */}
            <div className="bg-[#d8e2dc] rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <User className="text-cyan-700" size={20} /> Professional
                  Profile
                </h2>
                <button
                  onClick={handleSaveAll}
                  disabled={loading}
                  className="text-sm text-cyan-700 font-bold hover:underline"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={profile.image}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <button className="absolute bottom-0 right-0 p-1.5 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors">
                      <Camera size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {profile.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-sm text-gray-600 font-bold">
                        {profile.specialty}
                      </span>
                      <span className="text-sm text-gray-500">
                        • {profile.role}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded">
                        Verified Professional
                      </span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">
                        Profile Public
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Primary Specialty (Read Only)
                      </label>
                      <input
                        type="text"
                        value={profile.specialty}
                        readOnly
                        className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 focus:outline-none text-sm font-medium cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        License Number
                      </label>
                      <input
                        type="text"
                        value={profile.license}
                        placeholder="Enter unique License ID"
                        onChange={(e) =>
                          setProfile({ ...profile, license: e.target.value })
                        }
                        className="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Professional Bio
                    </label>
                    <textarea
                      rows={3}
                      value={profile.bio}
                      placeholder="Write a brief bio..."
                      onChange={(e) =>
                        setProfile({ ...profile, bio: e.target.value })
                      }
                      className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-cyan-500 outline-none text-sm text-gray-700 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* WORK PREFERENCES */}
            <div className="bg-[#d8e2dc] rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                <Calendar className="text-cyan-700" size={20} /> Work
                Preferences
              </h2>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-300">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Session Types
                    </h4>
                    <p className="text-xs text-gray-500">
                      Enable methods students can use to reach you.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    {[
                      { id: "video", label: "Video" },
                      { id: "chat", label: "Chat" },
                      { id: "phone", label: "Phone" },
                    ].map((type) => (
                      <label
                        key={type.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={preferences.sessionTypes[type.id]}
                          onChange={() =>
                            setPreferences({
                              ...preferences,
                              sessionTypes: {
                                ...preferences.sessionTypes,
                                [type.id]: !preferences.sessionTypes[type.id],
                              },
                            })
                          }
                          className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h4 className="text-sm font-bold text-gray-900">
                    Default Session Duration
                  </h4>
                  <div className="flex rounded-lg bg-gray-200 p-1 w-full md:w-auto">
                    {[30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() =>
                          setPreferences({ ...preferences, duration: mins })
                        }
                        className={`flex-1 md:w-32 py-1.5 text-sm font-bold rounded-md transition-all ${preferences.duration === mins ? "bg-white text-cyan-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        {mins} Minutes
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* NOTIFICATION CONTROL */}
            <div className="bg-[#d8e2dc] rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                <Bell className="text-cyan-700" size={20} /> Notification
                Control
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-300">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Appointment Requests
                    </h4>
                    <p className="text-xs text-gray-500">
                      Get notified when a student books a new session.
                    </p>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.appointmentRequests}
                    onChange={(val) =>
                      setNotifications({
                        ...notifications,
                        appointmentRequests: val,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* SECURITY */}
            <div className="bg-[#d8e2dc] rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                <Shield className="text-cyan-700" size={20} /> Security &
                Privacy
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                      <Lock size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        Password Management
                      </h4>
                      <p className="text-xs text-gray-500">
                        Secure your account
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-200 transition"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            {/* FOOTER CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={openHandbook}
                className="bg-[#d8e2dc] p-6 rounded-2xl border border-gray-200 text-left hover:bg-[#c9d6cf] transition group relative"
              >
                <BookOpen className="text-gray-500 mb-3" size={24} />
                <h4 className="font-bold text-gray-900">Counselor Handbook</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Guidelines & best practices.
                </p>
                <ExternalLink
                  size={16}
                  className="absolute top-6 right-6 text-gray-400 group-hover:text-gray-600"
                />
              </button>
              <button
                onClick={() => setShowTechModal(true)}
                className="bg-[#d8e2dc] p-6 rounded-2xl border border-gray-200 text-left hover:bg-[#c9d6cf] transition group relative"
              >
                <Headphones className="text-gray-500 mb-3" size={24} />
                <h4 className="font-bold text-gray-900">Technical Support</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Report bugs or get help.
                </p>
                <ExternalLink
                  size={16}
                  className="absolute top-6 right-6 text-gray-400 group-hover:text-gray-600"
                />
              </button>
            </div>

            {/* GLOBAL ACTIONS */}
            <div className="flex flex-col-reverse md:flex-row justify-between items-center pt-8 pb-12 gap-4">
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 font-medium flex items-center gap-2 text-sm"
              >
                <LogOut size={16} /> Log out of all devices
              </button>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button
                  onClick={handleDiscard}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-gray-400 hover:bg-white/10 transition text-sm"
                >
                  Discard changes
                </button>
                <button
                  onClick={handleSaveAll}
                  disabled={loading}
                  className="flex-1 md:flex-none px-8 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {loading ? "Saving..." : "Save all settings"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSave={handlePasswordUpdate}
        loading={loading}
      />
      <TechSupportModal
        isOpen={showTechModal}
        onClose={() => setShowTechModal(false)}
        onSend={handleTechSupportSubmit}
        loading={loading}
      />
    </div>
  );
};

export default SettingsPage;
