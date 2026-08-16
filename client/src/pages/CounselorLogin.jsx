import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Calendar,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Mail,
  Lock,
  Briefcase,
  Loader2,
} from "lucide-react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import axios from "axios";

// Single source of truth for the API base URL.
// IMPORTANT: On Vercel, set REACT_APP_API_URL in the project's Environment
// Variables (Settings > Environment Variables) to your deployed backend URL
// (e.g. https://your-backend.onrender.com). If it's not set, the deployed
// site will silently try to call localhost:5000, which cannot work in
// production and will look exactly like "login/signup isn't working".
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CounselorLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Converts a Firebase / Axios / generic error into a readable message.
  const resolveErrorMessage = (err) => {
    // Axios error with a response from the server (4xx/5xx)
    if (err?.response) {
      return (
        err.response.data?.msg ||
        err.response.data?.message ||
        `Server error (${err.response.status}). Please try again.`
      );
    }
    // Axios error with no response at all -> network/CORS/unreachable backend
    if (err?.request) {
      return "Could not reach the server. Please check your internet connection, or the server may be temporarily unavailable.";
    }
    // Firebase Auth errors carry a "code" like auth/wrong-password
    if (err?.code) {
      return (err.message || "Authentication error.").replace(
        "Firebase: ",
        "",
      );
    }
    return err?.message || "Something went wrong. Please try again.";
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError(
        "Please enter your email address first to reset your password.",
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, formData.email);
      alert(`Password reset email sent to ${formData.email}.`);
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Tracks a Firebase user created during THIS submit, so we can roll it
    // back if the follow-up MongoDB save fails. Without this, a failed
    // signup permanently "consumes" the email in Firebase Auth while
    // leaving no counselor profile in the DB - the account becomes stuck
    // (can't sign up again with that email, can't log in either).
    let createdFirebaseUser = null;

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password,
        );
        const user = userCredential.user;

        // Fetch Profile from DB to check status
        const res = await axios.get(`${API_URL}/api/counselors`);
        const counselor = res.data.find((c) => c.uid === user.uid);

        if (!counselor) {
          await signOut(auth);
          setError(
            "Counselor profile not found. If you just signed up and this " +
              "keeps happening, try signing up again - your previous " +
              "attempt may not have finished saving your profile.",
          );
          setLoading(false);
          return;
        }

        // SECURITY CHECK: Prevent login if not Verified
        if (counselor.status !== "Verified") {
          await signOut(auth);
          if (counselor.status === "Pending") {
            setError(
              "Your account is still pending verification by an administrator.",
            );
          } else {
            setError("Your account verification was rejected.");
          }
          setLoading(false);
          return;
        }

        navigate("/CounselorDashboard");
      } else {
        // --- SIGNUP LOGIC ---
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password,
        );
        createdFirebaseUser = userCredential.user;

        const newCounselor = {
          uid: createdFirebaseUser.uid,
          name: formData.name,
          title: formData.title,
          email: formData.email,
          image: `https://i.pravatar.cc/150?u=${createdFirebaseUser.uid}`,
          tags: ["New", "General Support"],
          description:
            "Dedicated professional ready to help students succeed.",
          role: "counselor",
          status: "Pending",
        };

        await axios.post(`${API_URL}/api/counselors`, newCounselor);

        // Success: sign out immediately and alert user
        await signOut(auth);
        alert(
          "Account created successfully! Please wait for admin verification before logging in.",
        );
        setIsLogin(true);
        setFormData({ name: "", title: "", email: "", password: "" });
      }
    } catch (err) {
      console.error(err);

      // Rollback: if we created a Firebase Auth user in THIS attempt but
      // the MongoDB profile save failed, delete the Firebase user so the
      // email is free to try again instead of being permanently stuck.
      if (createdFirebaseUser) {
        try {
          await createdFirebaseUser.delete();
        } catch (rollbackErr) {
          // If rollback itself fails (e.g. Firebase requires a recent
          // login to delete), sign out at least, and warn clearly.
          console.error("Rollback failed to delete orphaned user:", rollbackErr);
          try {
            await signOut(auth);
          } catch (_) {}
          setError(
            "Signup could not be completed and we couldn't automatically " +
              "clean up the partial account. Please contact support with " +
              "this email address before trying again.",
          );
          setLoading(false);
          return;
        }
      }

      setError(resolveErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#240046] flex flex-col font-sans text-slate-800">
      <header className="px-6 py-4 bg-[#5a189a] border-b border-gray-100 relative z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="MindNest Logo"
              className="w-10 h-10 object-contain logo-hover"
            />
            <span className="font-bold text-lg tracking-tight text-[#b5e48c] logo-hover">
              MindNest{" "}
              <span className="text-[#b5e48c] font-medium text-sm ml-1 uppercase tracking-wider">
                Counselor Portal
              </span>
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-w-5xl w-full min-h-[600px]">
          {/* Brand Info (Left) */}
          <div className="md:w-1/2 bg-[#2C807F] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
                Restoring balance through professional care.
              </h1>
              <p className="text-teal-100 text-base md:text-lg leading-relaxed">
                Welcome to your dedicated workspace. Join our network of
                certified professionals providing essential mental health
                support.
              </p>
            </div>
            <div className="space-y-6 relative z-10 mt-12 hidden md:block">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-teal-100" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">HIPAA Compliant</h3>
                  <p className="text-teal-200 text-sm">
                    Secure & private session management.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-teal-100" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Smart Scheduling</h3>
                  <p className="text-teal-200 text-sm">
                    Flexible hours that respect your time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form (Right) */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Professional Login and Registration
              </h2>
              <p className="text-slate-500 text-sm md:text-base">
                Please enter your credentials to access your dashboard.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4 border border-red-100">
                {error}
              </div>
            )}

            <div className="bg-slate-100 p-1 rounded-xl flex mb-8">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Dr. Jane Doe"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Title
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Clinical Psychologist"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@university.edu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-teal-600 font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-12 text-slate-700 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2C807F] hover:bg-[#236665] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Access Portal" : "Complete Registration"}{" "}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 leading-relaxed">
                Authorized personnel only. By logging in, you agree to
                MindNest's agreement.
              </p>
            </div>
            <div className="mt-4 text-center">
              <Link
                to="/"
                className="text-sm font-medium text-slate-500 hover:text-teal-600 flex items-center justify-center gap-2"
              >
                ← Back to student site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorLogin;
