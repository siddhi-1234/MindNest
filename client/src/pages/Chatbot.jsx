import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  MessageCircle,
  X,
  Send,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ACCEPT PROPS FOR EXTERNAL CONTROL
const Chatbot = ({ isOpenProp, setIsOpenProp, autoSendQuery }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Determine if controlled by parent (Dashboard) or self
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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Handle Auto-send from Dashboard triggers
  useEffect(() => {
    if (isOpen && autoSendQuery && !hasAutoSent.current) {
      handleSend(autoSendQuery);
      hasAutoSent.current = true;
    }
    if (!isOpen) {
      hasAutoSent.current = false;
    }
  }, [isOpen, autoSendQuery]);

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim()) return;

    const userMessage = { text: textToSend, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        text: textToSend,
        sessionId: "user-session-123",
      });

      const data = response.data;
      let botMessages = [{ text: data.reply, isBot: true }];

      if (data.payload && data.payload.length > 0) {
        data.payload.forEach((msg) => {
          if (msg.payload && msg.payload.mindnest) {
            const customData = msg.payload.mindnest;
            botMessages.push({
              isBot: true,
              type: customData.type,
              options: customData.options || [],
              link: customData.link || "",
              alertText: customData.text || "",
            });
          }
        });
      }

      setMessages((prev) => [...prev, ...botMessages]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "I'm having trouble connecting. Please try again.",
          isBot: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSpecialContent = (msg) => {
    if (msg.type === "suggestion_chips") {
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {msg.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                if (opt.link) navigate(opt.link);
                else handleSend(opt.text);
              }}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-full transition flex items-center gap-1 shadow-sm"
            >
              {opt.text} <ChevronRight className="w-3 h-3" />
            </button>
          ))}
        </div>
      );
    }
    if (msg.type === "crisis_alert") {
      return (
        <div className="mt-2 bg-red-50 border border-red-200 p-3 rounded-xl">
          <div className="flex items-center gap-2 text-red-600 font-bold mb-1">
            <AlertTriangle className="w-4 h-4" /> Crisis Support
          </div>
          <p className="text-xs text-red-700 mb-2">{msg.alertText}</p>
          <button
            onClick={() => navigate(msg.link)}
            className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 rounded-lg transition shadow-sm"
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
      {/* === TOGGLE BUTTON === */}
      {/* Hidden when chat is open to avoid clutter */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl transition-all z-50 hover:scale-110 ${
          isOpen ? "hidden" : "flex"
        }`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* === CHAT WINDOW === */}
      {isOpen && (
        <div
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 
                     w-[90vw] max-w-[380px] h-[550px] max-h-[80vh] 
                     bg-[#1E293B] border border-gray-700 rounded-2xl shadow-2xl 
                     flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 font-sans"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-blue-600 absolute right-0 bottom-0"></div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                  AI
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">
                  MindNest Assistant
                </h3>
                <span className="text-blue-100 text-xs">
                  Always here to listen
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0F172A] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.isBot ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.isBot
                      ? "bg-[#1E293B] text-gray-200 rounded-tl-none border border-gray-700"
                      : "bg-blue-600 text-white rounded-tr-none"
                  }`}
                >
                  {msg.text}
                  {msg.type && renderSpecialContent(msg)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#1E293B] p-4 rounded-2xl rounded-tl-none border border-gray-700">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#1E293B] border-t border-gray-700 flex gap-2 shrink-0">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-[#0F172A] text-white text-sm rounded-full px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 transition placeholder-gray-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white w-11 h-11 flex items-center justify-center rounded-full transition shadow-lg"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
