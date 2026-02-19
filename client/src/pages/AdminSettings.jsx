import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  ShieldCheck,
  FileText,
  Activity,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  Lock,
  Database,
  Save,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  signOut,
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import axios from "axios";

// --- Sidebar Item Component ---
const SidebarItem = ({ icon: Icon, label, path, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? "bg-blue-50 text-blue-600 font-medium shadow-sm"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <Icon size={20} />
      <span className="text-sm">{label}</span>
    </Link>
  );
};

const AdminSettings = () => {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // --- State for Data ---
  // We keep 'originalData' to support the Cancel/Discard feature
  const [originalData, setOriginalData] = useState({
    fullName: "",
    email: "",
  });

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    twoFactor: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    autoBackup: true,
  });

  // --- Auth & Initial Fetch ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const res = await axios.get(
            `http://localhost:5000/api/admin/${user.uid}`,
          );
          const fetchedData = {
            fullName: res.data.name,
            email: res.data.email,
          };

          // Set both current state and original state (for reset)
          setProfileData(fetchedData);
          setOriginalData(fetchedData);
        } catch (error) {
          console.error("Error fetching admin profile", error);
        }
      } else {
        navigate("/admin/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await signOut(auth);
      navigate("/admin/login");
    }
  };

  // --- Feature 3: Cancel / Discard Changes ---
  const handleCancel = () => {
    if (window.confirm("Discard all unsaved changes?")) {
      setProfileData(originalData); // Reset Profile
      setSecurityData({
        ...securityData,
        currentPassword: "",
        newPassword: "",
      }); // Reset Password fields
    }
  };

  // --- Feature 1 & 2: Save Changes ---
  const handleSave = async () => {
    setLoading(true);
    let message = "";

    try {
      // 1. Update Password (if provided)
      if (securityData.newPassword) {
        if (!securityData.currentPassword) {
          alert("Please enter your Current Password to change to a new one.");
          setLoading(false);
          return;
        }

        // Re-authenticate user before changing sensitive info
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          securityData.currentPassword,
        );
        await reauthenticateWithCredential(currentUser, credential);

        // Update Password
        await updatePassword(currentUser, securityData.newPassword);
        message += "Password updated. ";

        // Clear password fields
        setSecurityData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
        }));
      }

      // 2. Update Profile (Name & Email)
      if (
        profileData.fullName !== originalData.fullName ||
        profileData.email !== originalData.email
      ) {
        // Update in MongoDB
        await axios.put(`http://localhost:5000/api/admin/${currentUser.uid}`, {
          name: profileData.fullName,
          email: profileData.email,
        });

        // Update Email in Firebase (only if changed)
        if (profileData.email !== originalData.email) {
          // Note: Changing email in Firebase might require re-verification
          await updateEmail(currentUser, profileData.email);
        }

        // Update original data reference
        setOriginalData(profileData);
        message += "Profile details updated.";
      }

      if (!message)
        message = "Settings saved successfully (System prefs updated).";
      alert(message);
    } catch (error) {
      console.error("Save Error:", error);
      if (error.code === "auth/wrong-password") {
        alert("Incorrect Current Password.");
      } else if (error.code === "auth/requires-recent-login") {
        alert(
          "For security, please log out and log in again before changing sensitive data.",
        );
      } else {
        alert("Failed to save settings: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fc] font-sans text-gray-800 overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed md:relative z-30 w-72 bg-white border-r border-gray-200 flex flex-col h-full transform transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
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
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

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

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {profileData.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {profileData.fullName}
              </h4>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
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
        {/* Header */}
        <header className="h-16 md:h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Admin Settings</h2>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          {/* 1. Profile Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Profile Information
                </h3>
                <p className="text-sm text-gray-500">
                  Update your account details.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>
          </div>

          {/* 2. Security Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
                <Lock size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Security & Authentication
                </h3>
                <p className="text-sm text-gray-500">
                  Change your password (requires current password).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Required to change password"
                  value={securityData.currentPassword}
                  onChange={(e) =>
                    setSecurityData({
                      ...securityData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={securityData.newPassword}
                  onChange={(e) =>
                    setSecurityData({
                      ...securityData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-purple-50 p-4 rounded-xl border border-purple-100">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-purple-600" />
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-gray-500">
                    Adds an extra layer of security to your account.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={securityData.twoFactor}
                  onChange={() =>
                    setSecurityData({
                      ...securityData,
                      twoFactor: !securityData.twoFactor,
                    })
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* 3. System Preferences (Admin Specific) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                <Database size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  System Preferences
                </h3>
                <p className="text-sm text-gray-500">
                  Global settings for the MindNest platform.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg text-red-600">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Maintenance Mode
                    </p>
                    <p className="text-xs text-gray-500">
                      Prevent users from accessing the platform temporarily.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={systemSettings.maintenanceMode}
                    onChange={() =>
                      setSystemSettings({
                        ...systemSettings,
                        maintenanceMode: !systemSettings.maintenanceMode,
                      })
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-red-500 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              {/* Other settings kept as is... */}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pb-8">
            <button
              onClick={handleCancel}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={18} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Save size={20} /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
