import { useState } from "react";
import { FiMail, FiLock } from "react-icons/fi";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth"; //firebase functions for signing in
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
      await signInWithEmailAndPassword(auth, email, password); //Calls Firebase Authentication
      navigate("/dashboard"); //Redirects user to dashboard upon successful login
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymously(auth); //Calls Firebase Authentication for anonymous sign-in
      navigate("/dashboard"); //Redirects user to dashboard upon successful anonymous login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 w-full h-full bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/bg.jpeg')" }}
    >
      <div className="w-full max-w-md bg-[#0f1d16]/70 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-3xl font-bold text-white">MindNest</h1>
          <p className="text-white text-sm mt-3">
            Welcome back! Please login to continue.
          </p>
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
        )}

        {/* Email */}
        <div className="mb-5 flex items-center bg-[#111f18] rounded-xl px-3 h-12">
          <FiMail className="text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ml-3 w-full bg-transparent outline-none text-gray-200"
            placeholder="Email"
          />
        </div>

        {/* Password */}
        <div className="mb-6 flex items-center bg-[#111f18] rounded-xl px-3 h-12">
          <FiLock className="text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ml-3 w-full bg-transparent outline-none text-gray-200"
            placeholder="Password"
          />
          <button onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <HiEyeOff /> : <HiEye />}
          </button>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-green-500 py-3 rounded-xl font-semibold mb-4"
        >
          Log In
        </button>

        <button
          onClick={handleAnonymousLogin}
          className="w-full bg-[#1c2e26] py-3 rounded-xl border"
        >
          Log in Anonymously
        </button>

        <p className="text-center text-sm mt-6">
          <span
            onClick={() => navigate("/SignUp")}
            className="text-green-400 cursor-pointer hover:underline"
          >
            Don’t have an account? Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}
