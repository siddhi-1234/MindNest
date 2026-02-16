import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Resources from "./pages/Resources";
import BreathMed from "./pages/BreathMed";
import TipsForHealth from "./pages/TipsForHealth";
import SleepTips from "./pages/SleepTips";
import StressRelief from "./pages/StressRelief";
import Settings from "./pages/Settings";
import Chatbot from "./pages/Chatbot";
import Appointments from "./pages/Appointments";
import CounselorLogin from "./pages/CounselorLogin";
import CounselorDashboard from "./pages/CounselorDashboard";
import StudentsPage from "./pages/StudentsPage";
import SettingsPage from "./pages/SettingsPage";
import EmergencyPage from "./pages/EmergencyPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/Resources" element={<Resources />} />
        <Route path="/BreathMed" element={<BreathMed />} />
        <Route path="/TipsForHealth" element={<TipsForHealth />} />
        <Route path="/SleepTips" element={<SleepTips />} />
        <Route path="/StressRelief" element={<StressRelief />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/counselling" element={<Appointments />} />
        <Route path="/counselor/login" element={<CounselorLogin />} />
        <Route path="/CounselorDashboard" element={<CounselorDashboard />} />
        <Route path="/StudentsPage" element={<StudentsPage />} />
        <Route path="/SettingsPage" element={<SettingsPage />} />
        <Route path="/EmergencyPage" element={<EmergencyPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
      </Routes>
      <Chatbot />
    </Router>
  );
}

export default App;
