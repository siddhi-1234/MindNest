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
// ✅ Added sendPasswordResetEmail to imports
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ New Function: Handle Forgot Password
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent! Please check your email inbox.");
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Reset Password Error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No admin account found with this email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;

      // Use the email Firebase considers authoritative for this account
      // (userCredential.user.email) rather than the raw typed input, so a
      // stray capital letter or trailing space in the login form can't
      // cause a mismatch against what's stored in MongoDB.
      const accountEmail = userCredential.user.email;

      // 2. Check Admin Status in MongoDB
      // The email is passed as a query param so the backend can self-heal
      // a stale/mismatched uid for this account if needed (see adminRoutes.js).
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await axios.get(
        `${API_URL}/api/admin/${uid}?email=${encodeURIComponent(accountEmail)}`,
      );
      const adminData = res.data;

      // Basic Role Check (Safety)
      if (adminData.role !== "admin") {
        setError("Access denied. You are not an administrator.");
        await auth.signOut();
        return;
      }

      // ✅ REMOVED: The check for "Pending" status.
      // Now, even pending admins proceed directly to dashboard.

      if (adminData.status === "Rejected") {
        setError("Your account request has been rejected.");
        await auth.signOut();
        return;
      }

      // 3. Success - Redirect to Dashboard
      navigate("/admin");
    } catch (err) {
      console.error("Login Error:", err);
      if (err.response && err.response.status === 404) {
        setError(
          "Admin profile not found in database. If you're sure you've " +
            "signed up before, try again - the account link is repaired " +
            "automatically on a successful login.",
        );
      } else if (err.request && !err.response) {
        // Firebase auth succeeded but the backend was unreachable
        setError(
          "Could not reach the server to verify your admin status. Please check your connection and try again.",
        );
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "Failed to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4 font-sans bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="bg-white w-full max-w-[1100px] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        {/* ================= LEFT SIDE: BRANDING ================= */}
        <div className="md:w-1/2 bg-[#f8fafc] p-12 flex flex-col items-center justify-center text-center relative border-r border-gray-100">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck size={40} className="text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
            MindNest Admin
          </h1>

          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-10">
            Protecting the well-being of higher education students through
            secure and compassionate psychological support management.
          </p>

          <div className="w-64 h-40 bg-gray-400 rounded-xl mb-10 overflow-hidden relative shadow-inner">
            <img
              src="https://img.freepik.com/free-vector/business-user-shield_78370-7029.jpg"
              alt="Secure Network"
              className="w-full h-full object-cover opacity-60 grayscale"
            />
          </div>

          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-xs font-semibold text-gray-600">
              End-to-end Encryption Active
            </span>
          </div>
        </div>

        {/* ================= RIGHT SIDE: LOGIN FORM ================= */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center bg-white relative">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Secure Login
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Please enter your credentials to access the administrative
              dashboard.
            </p>

            {/* ERROR ALERT */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Administrator ID / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
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

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>

                  {/* ✅ UPDATED: Forgot Password Button */}
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 tracking-widest"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Shield size={18} /> {loading ? "Verifying..." : "Secure Login"}
              </button>
            </form>

            {/* Footer Notice */}
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

          <div className="absolute bottom-4 right-6 text-[10px] text-gray-300">
            v2.4.1 Build-712 (Admin v.S2)
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
