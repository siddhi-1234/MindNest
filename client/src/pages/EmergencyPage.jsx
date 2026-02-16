import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Phone,
  MessageSquare,
  MapPin,
  Wind,
  Globe,
  Menu,
  X,
  Shield,
  Clock,
  MessageCircle,
} from "lucide-react";
import axios from "axios";

const EmergencyPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ 1. Defined recordCrisis at component level so it is accessible everywhere
  const recordCrisis = async (type) => {
    try {
      // Ensure your backend is running on port 5000
      await axios.post("http://localhost:5000/api/crisis", { type });
      console.log(`Crisis recorded: ${type}`);
    } catch (e) {
      console.error("Failed to log crisis:", e);
    }
  };

  // ✅ 2. Updated handler to navigate AND record
  const handleQuickCalm = () => {
    recordCrisis("Quick_Calm");
    navigate("/BreathMed");
  };

  const handleShowMap = () => {
    window.open("https://maps.google.com", "_blank");
  };

  return (
    <div
      style={{ backgroundColor: "#04151f" }}
      className="min-h-screen font-sans text-gray-800 flex flex-col"
    >
      {/* ================= HEADER ================= */}
      <header
        style={{ backgroundColor: "#214e34" }}
        className="border-b border-white/10 sticky top-0 z-50 shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative">
          {/* Logo (Left) */}
          <Link to="/" className="flex items-center gap-2 z-10">
            <img
              src="/logo.png"
              alt="MindNest"
              className="w-9 h-9 object-contain logo-hover"
            />
            <span className="text-xl font-bold text-white tracking-tight logo-hover">
              MindNest
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Link
              to="/Dashboard"
              className="text-sm font-medium text-white/80 hover:text-white transition"
            >
              Dashboard
            </Link>
            <Link
              to="/counselling"
              className="text-sm font-medium text-white/80 hover:text-white transition"
            >
              Counseling
            </Link>
            <Link
              to="/Resources"
              className="text-sm font-medium text-white/80 hover:text-white transition"
            >
              Resources
            </Link>
            <Link
              to="/journal"
              className="text-sm font-medium text-white/80 hover:text-white transition"
            >
              Journal
            </Link>
            <Link
              to="/EmergencyPage"
              className="text-sm font-medium text-white/80 hover:text-white transition"
            >
              Emergency
            </Link>
          </div>

          {/* Mobile Menu Toggle (Right) */}
          <button
            className="md:hidden text-white z-10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div
            style={{ backgroundColor: "#1b263b" }}
            className="md:hidden border-t border-white/10 p-4 space-y-4 shadow-lg absolute w-full left-0 z-50"
          >
            <Link
              to="/dashboard"
              className="block text-sm font-medium text-white/90 py-2 hover:text-cyan-400 transition"
            >
              Dashboard
            </Link>
            <Link
              to="/counseling"
              className="block text-sm font-medium text-white/90 py-2 hover:text-cyan-400 transition"
            >
              Counseling
            </Link>
            <Link
              to="/resources"
              className="block text-sm font-medium text-white/90 py-2 hover:text-cyan-400 transition"
            >
              Resources
            </Link>
            <Link
              to="/journal"
              className="block text-sm font-medium text-white/90 py-2 hover:text-cyan-400 transition"
            >
              Journal
            </Link>
          </div>
        )}
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-12 flex-grow">
        {/* HERO SECTION */}
        <div className="text-center space-y-4">
          <span className="inline-block bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Urgent Support Available
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Emergency Help & Crisis Resources
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            You are not alone. Please reach out to one of the resources below.
            Support is confidential and available 24/7.
          </p>
        </div>

        {/* PRIMARY EMERGENCY ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 911 Card */}
          <a
            href="tel:14416"
            onClick={() => recordCrisis("Tele-MANAS_Call")} // ✅ Correctly calls function
            className="bg-red-600 rounded-2xl p-6 md:p-8 flex items-center justify-between shadow-xl shadow-red-600/20 text-white hover:scale-[1.02] transition-transform cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-white/20 p-1.5 rounded-full">
                  <Shield size={14} className="text-white" />
                </div>
                <span className="text-[10px] md:text-xs font-bold uppercase text-red-100 tracking-wider">
                  Tele-MANAS
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight group-hover:underline decoration-red-400 decoration-2 underline-offset-4">
                CALL 14416
              </h2>
            </div>
            <div className="bg-white/20 p-4 rounded-2xl">
              <Phone size={32} className="text-white" fill="currentColor" />
            </div>
          </a>

          {/* 988 Card */}
          <a
            href="tel:18005990019"
            onClick={() => recordCrisis("KIRAN_Call")} // ✅ Correctly calls function
            className="bg-blue-600 rounded-2xl p-6 md:p-8 flex items-center justify-between shadow-xl shadow-blue-600/20 text-white hover:scale-[1.02] transition-transform cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-white/20 p-1.5 rounded-full">
                  <MessageSquare size={14} className="text-white" />
                </div>
                <span className="text-[10px] md:text-xs font-bold uppercase text-blue-100 tracking-wider">
                  KIRAN Rehabilitation Helpline
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight group-hover:underline decoration-blue-400 decoration-2 underline-offset-4">
                DIAL 1800-599-0019
              </h2>
            </div>
            <div className="bg-white/20 p-4 rounded-2xl">
              <Phone size={32} className="text-white" fill="currentColor" />
            </div>
          </a>
        </div>

        {/* QUICK CALM CARD */}
        <div className="bg-[#d8e2dc] rounded-2xl p-6 md:p-8 border border-gray-200/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Feeling overwhelmed?
            </h3>
            <p className="text-gray-600 text-sm max-w-lg">
              Take a moment to ground yourself. Our guided breathing exercise
              can help calm your nervous system in just 60 seconds.
            </p>
          </div>
          <button
            onClick={handleQuickCalm} // ✅ Now simply calls the fixed handler
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-cyan-900/10"
          >
            <Wind size={20} /> Start Quick Calm
          </button>
        </div>

        {/* RESOURCES GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COL: HELPLINES */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Phone size={20} className="text-cyan-400" /> Helplines
            </h3>

            <div className="space-y-4">
              {/* Card 1 */}
              <div className="bg-[#d8e2dc] p-5 rounded-2xl border border-gray-200/50 shadow-sm flex items-center justify-between hover:border-cyan-300 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    National Institute of Mental Health (NIMHANS)
                  </h4>
                  <a
                    href="tel:080-46110007"
                    className="text-cyan-800 font-mono font-medium mt-1 block hover:underline"
                  >
                    080-46110007
                  </a>
                </div>
                <a
                  href="tel:080-46110007"
                  className="p-3 bg-white/50 text-cyan-800 rounded-full hover:bg-white transition"
                >
                  <Phone size={20} />
                </a>
              </div>

              {/* Card 2 */}
              <div className="bg-[#d8e2dc] p-5 rounded-2xl border border-gray-200/50 shadow-sm flex items-center justify-between hover:border-cyan-300 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    Jeevan Aastha Helpline
                  </h4>
                  <a
                    href="tel:18002333330"
                    className="text-cyan-800 font-mono font-medium mt-1 block hover:underline"
                  >
                    1800 233 3330
                  </a>
                </div>
                <a
                  href="tel:18002333330"
                  className="p-3 bg-white/50 text-cyan-800 rounded-full hover:bg-white transition"
                >
                  <Phone size={20} />
                </a>
              </div>

              {/* Card 3 */}
              <div className="bg-[#d8e2dc] p-5 rounded-2xl border border-gray-200/50 shadow-sm flex items-center justify-between hover:border-cyan-300 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    Psycho-social First-aid
                  </h4>
                  <a
                    href="tel:8448844845"
                    className="text-cyan-800 font-mono font-medium mt-1 block hover:underline"
                  >
                    8448-8448-45
                  </a>
                </div>
                <a
                  href="tel:8448844845"
                  className="p-3 bg-white/50 text-cyan-800 rounded-full hover:bg-white transition"
                >
                  <Phone size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT COL: CAMPUS RESOURCES */}
          <div className="space-y-6">
            {/* Clinic Info */}
            <div className="bg-blue-900/40 p-6 rounded-2xl border border-blue-500/30 text-blue-100">
              <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-cyan-300">
                <Clock size={16} /> Contact Counsellors
              </h4>
              <p className="text-sm opacity-90 leading-relaxed">
                You can book counsellors and they will help you to recover back!
                Don't worry we are always there with you.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 mt-12 py-8 bg-[#031119]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>
            © 2024 MindNest Student Support System. All helplines are
            third-party services.
          </p>
          <div className="flex gap-6">
            <Link to="/Dashboard" className="hover:text-gray-300 transition">
              Dashboard
            </Link>
            <Link to="/Resources" className="hover:text-gray-300 transition">
              Resources
            </Link>
            <Link to="/counselling" className="hover:text-gray-300 transition">
              Counselling
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EmergencyPage;
