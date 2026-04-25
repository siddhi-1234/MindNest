import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  MessageCircle,
  X,
  Send,
  AlertTriangle,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Chatbot = ({ isOpenProp, setIsOpenProp, autoSendQuery }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = isOpenProp !== undefined;
  const isOpen = isControlled ? isOpenProp : internalIsOpen;
  const setIsOpen = isControlled ? setIsOpenProp : setInternalIsOpen;

  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm MindNest AI. I'm here to listen. How are you feeling today?",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const hasAutoSent = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && autoSendQuery && !hasAutoSent.current) {
      handleSend(autoSendQuery);
      hasAutoSent.current = true;
    }
    if (!isOpen) hasAutoSent.current = false;
  }, [isOpen, autoSendQuery]);

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { text: textToSend, isBot: false }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/chat`, {
        text: textToSend,
        sessionId: "user-session-123",
      });

      console.log("👉 RAW RESPONSE:", res.data); // Keep this for debugging

      const botMessages = [];

      // 1. Add Text Reply
      if (res.data.reply) {
        botMessages.push({ text: res.data.reply, isBot: true });
      }

      // 2. Add Buttons (The "Universal Unwrapper")
      if (res.data.payload) {
        const payloads = Array.isArray(res.data.payload)
          ? res.data.payload
          : [res.data.payload];

        payloads.forEach((item) => {
          // STRATEGY: Look for 'mindnest' data everywhere
          let data = null;

          // Case A: Direct match
          if (item.mindnest) data = item.mindnest;
          // Case B: Inside 'payload'
          else if (item.payload && item.payload.mindnest)
            data = item.payload.mindnest;
          // Case C: Inside 'text' (Dialogflow glitch)
          else if (item.text && item.text.mindnest) data = item.text.mindnest;

          // If we found valid button data, add it
          if (data && data.options) {
            botMessages.push({
              isBot: true,
              type: data.type || "suggestion_chips",
              options: data.options,
              link: data.link,
              alertText: data.text || res.data.reply,
            });
          }
        });
      }

      setMessages((prev) => [...prev, ...botMessages]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { text: "Connection error. Please try again.", isBot: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSpecialContent = (msg) => {
    // 🟢 SUGGESTION CHIPS (Buttons)
    if (msg.type === "suggestion_chips" && msg.options?.length) {
      return (
        <div className="flex flex-wrap gap-2 mt-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {msg.options.map((opt, i) => (
            <button
              key={i}
              onClick={() =>
                opt.link ? navigate(opt.link) : handleSend(opt.text)
              }
              className="group flex items-center gap-1.5 text-xs font-semibold bg-white text-blue-600 border border-blue-100 hover:bg-blue-50 hover:border-blue-300 px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md"
            >
              {opt.text}
              <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      );
    }

    // 🔴 CRISIS ALERT
    if (msg.type === "crisis_alert") {
      return (
        <div className="mt-3 bg-red-50/90 border border-red-200 p-4 rounded-xl shadow-sm animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-1">
            <AlertTriangle className="w-4 h-4" /> Crisis Support
          </div>
          <p className="text-xs text-red-800 mb-3 leading-relaxed">
            {msg.alertText}
          </p>
          <button
            onClick={() => navigate(msg.link)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            Get Help Immediately
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* === FLOATING TOGGLE BUTTON === */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-50 bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen
            ? "bg-gray-800 text-white rotate-90 opacity-0 pointer-events-none"
            : "bg-blue-600 text-white hover:bg-blue-700 opacity-100"
        }`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* === CHAT WINDOW === */}
      {/* RESPONSIVE CLASSES EXPLAINED:
          - fixed bottom-0 right-0 w-full h-[100dvh]: On mobile, it covers the whole screen.
          - sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[600px]: On desktop/tablet, it floats.
          - sm:max-h-[85vh]: Ensures it never gets too tall for small laptops.
      */}
      <div
        className={`fixed z-50 flex flex-col bg-[#0F172A] shadow-2xl overflow-hidden transition-all duration-300 ease-in-out border border-gray-800
        ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-12 pointer-events-none"
        }
        bottom-0 right-0 w-full h-[100dvh] rounded-none 
        sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[600px] sm:max-h-[85vh] sm:rounded-2xl
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">MindNest AI</h3>
              <p className="text-blue-100 text-xs">Always here to listen</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.isBot
                    ? "bg-[#1E293B] text-gray-200 rounded-tl-none border border-gray-700/50"
                    : "bg-blue-600 text-white rounded-tr-none"
                }`}
              >
                {msg.text && <p>{msg.text}</p>}
                {msg.isBot && renderSpecialContent(msg)}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#1E293B] px-4 py-3 rounded-2xl rounded-tl-none border border-gray-700/50 flex items-center gap-2 text-gray-400 text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-[#0F172A] border-t border-gray-800 shrink-0">
          <div className="flex gap-2 bg-[#1E293B] p-1.5 rounded-full border border-gray-700 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-transparent text-white px-4 py-2 text-sm focus:outline-none placeholder-gray-500"
              placeholder="Type your message..."
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
