import { useState } from "react"; //used to store component data
import { FiMail, FiLock } from "react-icons/fi"; //mail icon and lock icon
import { HiEye, HiEyeOff } from "react-icons/hi"; //eye icons for toggling password visibility
import { useNavigate } from "react-router-dom"; //to navigate between routes
import { createUserWithEmailAndPassword } from "firebase/auth"; //firebase function to create user with email and password
import { auth } from "../firebase"; //importing firebase auth instance

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false); //state to toggle password visibility
  const [showConfirm, setShowConfirm] = useState(false); //state to toggle confirm password visibility
  const [email, setEmail] = useState(""); //state to store email input
  const [password, setPassword] = useState(""); //state to store password input
  const [confirmPassword, setConfirmPassword] = useState(""); //state to store confirm password input
  const [error, setError] = useState(""); //state to store error messages
  const navigate = useNavigate(); //hook to navigate between routes

  const handleSignUp = async () => {
    setError(""); //Resets any previous error message

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return; //Prevents Firebase from creating the user
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password); //Calls Firebase Authentication Parameters: auth → Firebase auth instance, email → user’s email, password → user’s password
      navigate("/Login"); //Redirects user to the login page upon successful sign-up
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/bg.jpeg')" }}
    >
      <div className="w-full max-w-md bg-[#0f1d16]/70 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MindNest" className="w-15 h-12" />
            <h1 className="text-3xl font-bold text-white">MindNest</h1>
          </div>
          <p className="text-white text-sm mt-3">
            A safe space for your well-being starts here.
          </p>
        </div>

        {/*Only show this paragraph if there is an error*/}
        {error && (
          <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
        )}

        {/* Email */}
        <label className="text-gray-300 text-sm">Email</label>
        <div className="mt-2 mb-5 flex items-center bg-[#111f18] rounded-xl px-3 h-12">
          <FiMail className="text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ml-3 w-full bg-transparent outline-none text-gray-200"
            placeholder="Enter your email address"
          />
        </div>

        {/* Password */}
        <label className="text-gray-300 text-sm">Password</label>
        <div className="mt-2 flex items-center bg-[#111f18] rounded-xl px-3 h-12">
          <FiLock className="text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ml-3 w-full bg-transparent outline-none text-gray-200"
            placeholder="Create a password"
          />
          <button onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <HiEyeOff /> : <HiEye />}
          </button>
        </div>

        {/* Confirm Password */}
        <label className="mt-5 block text-gray-300 text-sm">
          Confirm Password
        </label>
        <div className="mt-2 mb-6 flex items-center bg-[#111f18] rounded-xl px-3 h-12">
          <FiLock className="text-gray-400" />
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="ml-3 w-full bg-transparent outline-none text-gray-200"
            placeholder="Confirm your password"
          />
          <button onClick={() => setShowConfirm(!showConfirm)}>
            {showConfirm ? <HiEyeOff /> : <HiEye />}
          </button>
        </div>

        <button
          onClick={handleSignUp}
          className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-xl"
        >
          Sign Up
        </button>

        <p className="text-center text-sm mt-4">
          <span
            onClick={() => navigate("/Login")}
            className="text-green-400 cursor-pointer hover:underline"
          >
            Already have an account? Log In
          </span>
        </p>
      </div>
    </div>
  );
}
