import { useState } from "react";
import { FiMail, FiLock, FiUser, FiShield } from "react-icons/fi";
import { HiEye, HiEyeOff, HiArrowRight } from "react-icons/hi";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";

export default function SignUp() {
  // === STATE MANAGEMENT ===
  // Password visibility toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Controlled form input states for student registration
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Error feedback state displayed on validation or API failure
  const [error, setError] = useState("");
  // Submission loading indicator disabling the button during registration
  const [loading, setLoading] = useState(false);

  // React Router hook for programmatic redirection
  const navigate = useNavigate();

  // === REGISTRATION SUBMISSION HANDLER ===
  const handleSignUp = async () => {
    // Clear any previous error message and enable loading state
    setError("");
    setLoading(true);

    // Validate that all required fields are filled out
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // Validate that password and confirmation password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // 1. Create student account in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // 2. Persist student profile record to backend MongoDB database
      await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/students`, {
        uid: user.uid,
        name: name,
        email: email,
      });

      // 3. Redirect to login page on successful account creation
      navigate("/Login");
    } catch (err) {
      // Display error message from Firebase or backend API
      setError(err.message);
    } finally {
      // Reset loading flag regardless of outcome
      setLoading(false);
    }
  };

  return (
    // Fullscreen themed background container
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-6 md:p-10"
      style={{ backgroundImage: "url('/screen.png')" }}
    >
      {/* Frosted glass registration card */}
      <div className="w-full max-w-[460px] bg-[#1e2532]/85 backdrop-blur-md rounded-[40px] p-8 md:p-12 border border-white/5 shadow-2xl my-6">
        {/* Welcome Branding & Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">
            Find your calm.
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed max-w-[320px]">
            Your mental sanctuary starts here. Join our community of students
            prioritizing well-being.
          </p>
        </div>

        {/* Error message banner */}
        {error && (
          <p className="text-red-400 text-[10px] mb-4 text-center uppercase tracking-wider">
            {error}
          </p>
        )}

        {/* Input Form Fields */}
        <div className="space-y-5">
          {/* Full Name Input Field */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-gray-400 ml-1 mb-2 block font-bold">
              Full Name
            </label>
            <div className="flex items-center bg-[#28303f]/60 border border-white/10 rounded-2xl px-4 h-12">
              <FiUser className="text-gray-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="ml-3 w-full bg-transparent outline-none text-white text-sm"
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* University Email Input Field */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-gray-400 ml-1 mb-2 block font-bold">
              University Email
            </label>
            <div className="flex items-center bg-[#28303f]/60 border border-white/10 rounded-2xl px-4 h-12">
              <FiMail className="text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ml-3 w-full bg-transparent outline-none text-white text-sm"
                placeholder="name@university.edu"
              />
            </div>
          </div>

          {/* Password & Confirm Password Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password Field */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-gray-400 ml-1 mb-2 block font-bold">
                Password
              </label>
              <div className="flex items-center bg-[#28303f]/60 border border-white/10 rounded-2xl px-4 h-12">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent outline-none text-white text-sm"
                  placeholder="Create"
                />
              </div>
            </div>
            {/* Confirm Password Field */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-gray-400 ml-1 mb-2 block font-bold">
                Confirm
              </label>
              <div className="flex items-center bg-[#28303f]/60 border border-white/10 rounded-2xl px-4 h-12">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent outline-none text-white text-sm"
                  placeholder="Repeat"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Primary Submit Button */}
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full bg-[#3d4ef3] hover:bg-[#3442d1] text-white py-4 rounded-2xl font-bold mt-10 mb-6 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {loading ? "Creating..." : "Start Your Journey"}{" "}
          <HiArrowRight size={18} />
        </button>

        {/* Link to Student Login Page */}
        <p className="text-center text-xs text-gray-400">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/Login")}
            className="text-blue-400 cursor-pointer font-bold hover:underline"
          >
            Log in
          </span>
        </p>

        {/* External Portal Navigation Links */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <Link
            to="/counselor/login"
            className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors tracking-wide"
          >
            Are you a professional?{" "}
            <span className="underline">Counselor Portal</span>
          </Link>
        </div>
        <div className="mt-2 pt-6 border-t border-white/5 text-center">
          <Link
            to="/admin/login"
            className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors tracking-wide"
          >
            Are you a admin? <span className="underline">Admin Portal</span>
          </Link>
        </div>
      </div>

      {/* Footer Security Badges */}
      <div className="mt-4 flex gap-8 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
        <div className="flex items-center gap-2">
          <FiShield className="text-xs" /> Encrypted
        </div>
        <div className="flex items-center gap-2">
          <FiShield className="text-xs" /> Confidential
        </div>
      </div>
    </div>
  );
}
