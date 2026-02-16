import { useState } from "react";
import { FiMail, FiLock } from "react-icons/fi";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async () => {
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/Login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundImage: "url('/bg.jpeg')" }}
    >
      <div className="w-full max-w-sm bg-[#0f1d16]/80 backdrop-blur-xl rounded-2xl p-5 md:p-6 border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="MindNest"
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-2xl font-bold text-white tracking-wide">
              MindNest
            </h1>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            Create your safe space account.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 mb-3 text-center">
            <p className="text-red-200 text-xs">{error}</p>
          </div>
        )}

        {/* Inputs Group */}
        <div className="space-y-3">
          <div>
            <label className="text-gray-400 text-xs ml-1 font-medium">
              Email
            </label>
            <div className="mt-1 flex items-center bg-[#111f18] border border-white/5 rounded-lg px-3 h-10 transition-colors focus-within:border-green-500/50">
              <FiMail className="text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ml-3 w-full bg-transparent outline-none text-sm text-gray-200 placeholder-gray-600"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs ml-1 font-medium">
              Password
            </label>
            <div className="mt-1 flex items-center bg-[#111f18] border border-white/5 rounded-lg px-3 h-10 transition-colors focus-within:border-green-500/50">
              <FiLock className="text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ml-3 w-full bg-transparent outline-none text-sm text-gray-200 placeholder-gray-600"
                placeholder="Create password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <HiEyeOff /> : <HiEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs ml-1 font-medium">
              Confirm Password
            </label>
            <div className="mt-1 flex items-center bg-[#111f18] border border-white/5 rounded-lg px-3 h-10 transition-colors focus-within:border-green-500/50">
              <FiLock className="text-gray-500" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="ml-3 w-full bg-transparent outline-none text-sm text-gray-200 placeholder-gray-600"
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                {showConfirm ? <HiEyeOff /> : <HiEye />}
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-5">
          <button
            onClick={handleSignUp}
            className="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] text-black font-bold py-2.5 rounded-lg transition-all text-sm shadow-lg shadow-green-500/20"
          >
            Sign Up
          </button>

          <p className="text-center text-xs mt-3 text-gray-400">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/Login")}
              className="text-green-400 cursor-pointer hover:text-green-300 font-medium transition-colors"
            >
              Log In
            </span>
          </p>
        </div>

        {/* Provider Links */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2 text-center">
          <Link
            to="/counselor/login"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-green-500/80 hover:text-green-400 transition-colors bg-green-500/10 px-3 py-1.5 rounded-full"
          >
            Are you a professional?{" "}
            <span className="underline">Access Counsellor Portal</span>
          </Link>

          <Link
            to="/admin/login"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-blue-400/80 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-full"
          >
            Are you an administrator?{" "}
            <span className="underline">Access Admin Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
