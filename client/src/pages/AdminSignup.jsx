import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Lock } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Ensure path is correct
import axios from "axios";

const AdminSignup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Basic Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // 2. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;

      // 3. Save Admin Profile to MongoDB
      // Ensure your backend is running on port 5000
      await axios.post("http://localhost:5000/api/admin/signup", {
        uid,
        name,
        email,
      });

      // 4. Success & Redirect
      alert("Request submitted successfully! Please wait for approval.");
      navigate("/admin/login");
    } catch (err) {
      console.error("Signup Error:", err);
      // Handle Firebase specific errors or Backend errors
      if (err.code === "auth/email-already-in-use") {
        setError("Email is already registered.");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to create account. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans text-gray-800 relative overflow-hidden flex flex-col">
      {/* Background Gradient Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/40 rounded-full blur-[120px]"></div>
      </div>

      {/* ================= HEADER ================= */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
              MindNest
            </h1>
            <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">
              Admin Portal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/admin/login"
            className="px-5 py-2 rounded-full border border-gray-300 text-sm font-bold text-gray-700 hover:bg-white hover:shadow-sm transition"
          >
            Log In
          </Link>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {/* Title Section */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-blue-100 shadow-sm">
            <ShieldCheck size={14} className="text-blue-600" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              Secure Registration
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Join the{" "}
            <span className="text-blue-600 italic">Circle of Care.</span>
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Register as an administrator to manage student wellness and support
            resources.
          </p>
        </div>

        {/* Signup Card */}
        <div className="w-full max-w-4xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-12">
          {/* Error Message Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-8">
            {/* Row 1: Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Professional Email
                </label>
                <input
                  type="email"
                  placeholder="name@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Row 2: Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Create Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  ></button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  ></button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <ShieldCheck size={20} />
              {loading ? "Processing..." : "Request Access"}
            </button>
          </form>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <span>© 2024 MindNest Digital Health System</span>
          <div className="flex gap-4"></div>
        </div>

        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
          <Lock size={12} className="text-blue-600" />
          <span className="font-bold text-gray-600 tracking-wider">
            END-TO-END ENCRYPTED
          </span>
        </div>
      </footer>
    </div>
  );
};

export default AdminSignup;
