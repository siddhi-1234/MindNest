import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";

const AdminLogin = () => {
  // State to toggle password visibility between plain text and masked characters
  const [showPassword, setShowPassword] = useState(false);

  // States to store administrator email and password input values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State to hold and display authentication error messages
  const [error, setError] = useState("");

  // State to track network request status and disable buttons while processing
  const [loading, setLoading] = useState(false);

  // Initialize router navigation hook
  const navigate = useNavigate();

  // Handler to trigger Firebase password reset email
  const handleForgotPassword = async () => {
    // Validate that an email has been typed before initiating reset
    if (!email) {
      setError("Please enter your email address first to reset your password.");
      return;
    }
    try {
      // Send password reset link to the provided email address via Firebase
      await sendPasswordResetEmail(auth, email);
      // Notify the administrator that the link was dispatched
      alert("Password reset link sent! Please check your email inbox.");
      // Clear any previous error messages
      setError("");
    } catch (err) {

      console.error("Reset Password Error:", err);
      // Provide user-friendly feedback based on Firebase error code
      if (err.code === "auth/user-not-found") {
        setError("No admin account found with this email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    }
  };

  // Handler for administrator login form submission
  const handleLogin = async (e) => {

    e.preventDefault();
    // Reset any previous error state
    setError("");
    // Set loading indicator to true while authenticating
    setLoading(true);

    try {
      // 1. Authenticate administrator credentials with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      // Extract the authenticated user's unique Firebase UID
      const uid = userCredential.user.uid;

      // Extract the authoritative email from the Firebase account object
      const accountEmail = userCredential.user.email;

      // 2. Verify administrator record and role in the MongoDB backend
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      // Send GET request to verify administrator privileges and synchronize UID/email
      const res = await axios.get(
        `${API_URL}/api/admin/${uid}?email=${encodeURIComponent(accountEmail)}`,
      );
      const adminData = res.data;

      // Ensure the authenticated user has administrative role rights
      if (adminData.role !== "admin") {
        setError("Access denied. You are not an administrator.");
        // Sign out unauthorized user from Firebase session
        await auth.signOut();
        return;
      }

      // Check if administrator's access request has been marked as Rejected
      if (adminData.status === "Rejected") {
        setError("Your account request has been rejected.");
        // Sign out rejected user from Firebase session
        await auth.signOut();
        return;
      }

      // 3. On successful authentication and authorization, navigate to Admin Dashboard
      navigate("/admin");
    } catch (err) {

      console.error("Login Error:", err);
      // Handle missing admin record in backend database
      if (err.response && err.response.status === 404) {
        setError(
          "Admin profile not found in database. If you're sure you've " +
          "signed up before, try again - the account link is repaired " +
          "automatically on a successful login.",
        );
      } else if (err.request && !err.response) {
        // Handle scenario where backend server is unreachable
        setError(
          "Could not reach the server to verify your admin status. Please check your connection and try again.",
        );
      } else if (err.code === "auth/invalid-credential") {
        // Handle incorrect email or password from Firebase
        setError("Invalid email or password.");
      } else {
        // Generic fallback error message
        setError(err.message || "Failed to login. Please try again.");
      }
    } finally {
      // Re-enable form inputs and submit button after operation finishes
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4 font-sans bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      {/* Main card container holding both branding and login form sections */}
      <div className="bg-white w-full max-w-[1100px] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        {/* ================= LEFT SIDE: BRANDING ================= */}
        {/* Left column displaying MindNest branding and security compliance info */}
        <div className="md:w-1/2 bg-[#f8fafc] p-12 flex flex-col items-center justify-center text-center relative border-r border-gray-100">
          {/* Security badge icon */}
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck size={40} className="text-blue-600" />
          </div>

          {/* Portal Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
            MindNest Admin
          </h1>

          {/* Portal Mission Statement */}
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-10">
            Protecting the well-being of higher education students through
            secure and compassionate psychological support management.
          </p>

          {/* Decorative security graphic */}
          <div className="w-64 h-40 bg-gray-400 rounded-xl mb-10 overflow-hidden relative shadow-inner">
            <img
              src="https://img.freepik.com/free-vector/business-user-shield_78370-7029.jpg"
              alt="Secure Network"
              className="w-full h-full object-cover opacity-60 grayscale"
            />
          </div>

          {/* Active encryption status pill */}
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-xs font-semibold text-gray-600">
              End-to-end Encryption Active
            </span>
          </div>
        </div>

        {/* ================= RIGHT SIDE: LOGIN FORM ================= */}
        {/* Right column containing the credentials input form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center bg-white relative">
          <div className="max-w-md mx-auto w-full">
            {/* Header titles */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Secure Login
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Please enter your credentials to access the administrative
              dashboard.
            </p>

            {/* Error banner displayed when an error message is set */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Login credentials form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email / Administrator ID input field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Administrator ID / Email
                </label>
                <div className="relative">
                  {/* Input field icon */}
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  {/* Controlled email input element */}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                    placeholder="admin@mindnest.edu"
                    required
                  />
                </div>
              </div>

              {/* Password input field with visibility toggle and reset link */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>

                  {/* Trigger button for password recovery */}
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  {/* Password lock icon */}
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  {/* Controlled password input element (toggles text/password type) */}
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 tracking-widest"
                    placeholder="••••••••"
                    required
                  />
                  {/* Toggle button to switch password visibility between hidden and revealed */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit button to execute authentication */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Shield size={18} /> {loading ? "Verifying..." : "Secure Login"}
              </button>
            </form>

            {/* Footer security compliance notice */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Security Policy Notice
              </p>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Authorized personnel only. All access attempts and activity are
                logged and monitored under HIPAA and FERPA compliance standards.
              </p>
            </div>
          </div>

          {/* Software build version badge */}
          <div className="absolute bottom-4 right-6 text-[10px] text-gray-300">
            v2.4.1 Build-712 (Admin v.S2)
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
