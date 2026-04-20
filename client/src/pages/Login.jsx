import { useState } from "react";
import { FiMail, FiLock, FiShield } from "react-icons/fi";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymously(auth);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-6 md:p-10"
      style={{ backgroundImage: "url('/screen.png')" }}
    >
      <div className="w-full max-w-[440px] bg-[#1e2532]/85 backdrop-blur-md rounded-[40px] p-8 md:p-12 border border-white/5 shadow-2xl overflow-hidden">
        <div className="flex flex-col items-center mb-10 text-center">
          <h1 className="text-3xl font-semibold text-white mb-3">
            Welcome back.
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed max-w-[280px]">
            Log in to continue your journey toward mental well-being.
          </p>
        </div>

        {error && (
          <p className="text-red-400 text-xs mb-4 text-center bg-red-500/10 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="space-y-6">
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-gray-400 ml-1 mb-2 block font-bold">
              Email Address
            </label>
            <div className="flex items-center bg-[#28303f]/60 border border-white/10 rounded-2xl px-4 h-14 focus-within:border-blue-500/50 transition-all">
              <FiMail className="text-gray-500 text-lg" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ml-3 w-full bg-transparent outline-none text-white placeholder-gray-600 text-sm"
                placeholder="name@university.edu"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-gray-400 ml-1 mb-2 block font-bold">
              Password
            </label>
            <div className="flex items-center bg-[#28303f]/60 border border-white/10 rounded-2xl px-4 h-14 focus-within:border-blue-500/50 transition-all">
              <FiLock className="text-gray-500 text-lg" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ml-3 w-full bg-transparent outline-none text-white placeholder-gray-600 text-sm"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-white"
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-[#3d4ef3] hover:bg-[#3442d1] text-white py-4 rounded-2xl font-bold mt-10 mb-4 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20"
        >
          Log In
        </button>

        <p className="text-center text-sm mt-8 text-gray-300">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/SignUp")}
            className="text-blue-400 font-bold cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>
      </div>

      {/* Footer Security Icons */}
      <div className="mt-8 flex gap-8 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
        <div className="flex items-center gap-2">
          <FiShield className="text-xs" /> Encrypted
        </div>
        <div className="flex items-center gap-2">
          <FiLock className="text-xs" /> Confidential
        </div>
      </div>
    </div>
  );
}
