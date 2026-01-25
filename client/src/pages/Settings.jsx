import React, { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  updateProfile,
  updateEmail,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";
import {
  User,
  Bell,
  Lock,
  LogOut,
  ChevronRight,
  Save,
  Shield,
  Mail,
  Smartphone,
  Menu,
  X,
  Settings as SettingsIcon,
  Loader2, // Added for loading spinner
} from "lucide-react";

import Chatbot from "../pages/Chatbot";

const Settings = () => {
  // === STATE ===
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingReset, setSendingReset] = useState(false); // NEW: Track reset email status
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
  });

  // Toggle States
  const [notifications, setNotifications] = useState({
    dailyCheckin: true,
    newResources: false,
    counselorMsg: true,
  });

  // === AUTH CHECK ===
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setFormData({
          displayName: currentUser.displayName || "Student Name",
          email: currentUser.email || "",
        });
      } else {
        // Redirect if not logged in
        window.location.href = "/";
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // === HANDLERS ===
  const handleToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 1. UPDATE PROFILE & EMAIL
  const handleSave = async () => {
    const auth = getAuth();
    if (!auth.currentUser) return;

    try {
      // Update Display Name
      if (formData.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName,
        });
      }

      // Update Email
      // NOTE: This might fail if the user hasn't signed in recently (Firebase security rule).
      if (formData.email !== user.email) {
        await updateEmail(auth.currentUser, formData.email);
      }

      alert("Settings saved successfully! ✅");

      // Force update local state
      setUser({
        ...auth.currentUser,
        displayName: formData.displayName,
        email: formData.email,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.code === "auth/requires-recent-login") {
        alert(
          "Security Alert: Please sign out and sign back in to change your email address."
        );
      } else {
        alert("Error updating profile: " + error.message);
      }
    }
  };

  // 2. CHANGE PASSWORD (REAL-TIME FEEDBACK)
  const handleChangePassword = async () => {
    const auth = getAuth();
    const emailToSend = formData.email || user?.email;

    if (!emailToSend) {
      alert("Error: No email address found for this account.");
      return;
    }

    const confirm = window.confirm(
      `Send a password reset email to ${emailToSend}?`
    );

    if (confirm) {
      try {
        setSendingReset(true); // Start loading UI
        await sendPasswordResetEmail(auth, emailToSend);

        // Success Message
        alert(
          `✅ Password reset email sent to ${emailToSend}!\n\nPlease check your Inbox and Spam folder.`
        );
      } catch (error) {
        console.error("Error sending reset email:", error);
        alert("Failed to send email: " + error.message);
      } finally {
        setSendingReset(false); // Stop loading UI
      }
    }
  };

  // 3. DELETE ACCOUNT
  const handleDeleteAccount = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    const confirm1 = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );

    if (confirm1) {
      const confirm2 = window.confirm(
        "Final warning: All your journal entries and data will be lost forever. Delete Account?"
      );

      if (confirm2) {
        try {
          await deleteUser(currentUser);
          alert("Account deleted. Goodbye.");
          window.location.href = "/";
        } catch (error) {
          console.error("Error deleting account:", error);
          if (error.code === "auth/requires-recent-login") {
            alert(
              "Security Alert: Please sign out and sign back in to confirm your identity before deleting your account."
            );
          } else {
            alert("Error deleting account: " + error.message);
          }
        }
      }
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    window.location.href = "/";
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0F172A] pt-20 text-white text-center flex items-center justify-center">
        <Loader2 className="animate-spin mr-2" /> Loading settings...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans text-gray-200 pt-20 relative">
      {/* === CHATBOT === */}
      <Chatbot />

      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0F172A] px-6 py-4 border-b border-gray-800 flex items-center justify-between">
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

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-300 text-2xl focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <li>
            <a href="/dashboard" className="hover:text-white transition">
              Dashboard
            </a>
          </li>
          <li>
            <a href="/Resources" className="hover:text-white transition">
              Resources
            </a>
          </li>
          <li>
            <a href="/journal" className="hover:text-white transition">
              Journal
            </a>
          </li>
          <li>
            <a href="/counselling" className="hover:text-white transition">
              Counseling
            </a>
          </li>
        </ul>

        {/* Profile Dropdown */}
        <div className="hidden md:block relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center border border-blue-400 hover:scale-105 transition"
          >
            <User className="text-white" size={24} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-12 w-56 bg-[#1E293B] border border-gray-700 rounded-xl shadow-2xl py-2 z-50 animate-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-gray-700">
                <p className="text-sm text-white font-bold">My Account</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition text-left"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Content */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#1E293B] border-b border-gray-700 md:hidden flex flex-col shadow-xl z-50 animate-in slide-in-from-top-5">
            <a
              href="/dashboard"
              className="text-gray-300 p-4 border-b border-gray-700"
            >
              Dashboard
            </a>
            <a
              href="/Resources"
              className="text-gray-300 p-4 border-b border-gray-700"
            >
              Resources
            </a>
            <a
              href="/Settings"
              className="text-white bg-gray-700/50 p-4 border-b border-gray-700"
            >
              Settings
            </a>
            <button
              onClick={handleLogout}
              className="text-red-400 p-4 text-left flex items-center gap-2 w-full"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        )}
      </nav>

      {/* ================= MAIN SETTINGS CONTENT ================= */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-500" /> Account Settings
          </h1>
          <p className="text-gray-400">
            Manage your profile, preferences, and security.
          </p>
        </div>

        <div className="space-y-8">
          {/* 1. PROFILE SECTION */}
          <section className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" /> Profile Information
              </h2>
            </div>

            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          displayName: e.target.value,
                        })
                      }
                      className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-lg shadow-blue-600/20"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 2. PREFERENCES SECTION */}
          <section className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-400" /> Notifications & App
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Daily Checkin Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Daily Check-in Reminder
                    </h4>
                    <p className="text-xs text-gray-400">
                      Receive a nudge at 8:00 PM to log your mood.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle("dailyCheckin")}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                    notifications.dailyCheckin ? "bg-blue-600" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                      notifications.dailyCheckin
                        ? "translate-x-6"
                        : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              {/* Counselor Messages Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Counselor Messages (Email)
                    </h4>
                    <p className="text-xs text-gray-400">
                      Get email alerts when a counselor replies.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle("counselorMsg")}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                    notifications.counselorMsg ? "bg-blue-600" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                      notifications.counselorMsg
                        ? "translate-x-6"
                        : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </section>

          {/* 3. SECURITY & DANGER ZONE */}
          <section className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" /> Security
              </h2>
            </div>
            <div className="p-6">
              {/* CHANGE PASSWORD BUTTON */}
              <button
                onClick={handleChangePassword}
                disabled={sendingReset}
                className="w-full flex items-center justify-between p-4 bg-[#0F172A] rounded-xl border border-gray-700 hover:border-gray-500 transition group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  {sendingReset ? (
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400 group-hover:text-white transition" />
                  )}
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition">
                    {sendingReset
                      ? "Sending Reset Email..."
                      : "Change Password"}
                  </span>
                </div>
                {!sendingReset && (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </button>

              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <h3 className="text-sm font-bold text-red-400 mb-2">
                  Danger Zone
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-6 py-2 rounded-lg text-sm font-bold transition"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-xs md:text-sm px-4 mt-12">
        <p>&copy; 2023 MindNest. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Settings;
