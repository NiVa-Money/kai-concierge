 
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { createOrUpdateSession, endSession, getSessionDetails } from "../../api";
import {
  Send,
  Plane,
  Car,
  Utensils,
  Calendar,
  Star,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatTab: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = localStorage.getItem("userId");
  const aiPersona = JSON.parse(localStorage.getItem("aiPersona") || "{}");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
    script.async = true;
    script.type = "text/javascript";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  
  // Load existing session if available
  useEffect(() => {
    const loadExistingSession = async () => {
      const savedSessionId = localStorage.getItem('currentSessionId');
      if (savedSessionId && userId) {
        try {
          const response = await getSessionDetails(savedSessionId, userId);
          const sessionData = response.data.data;
          setSessionId(sessionData.session_id);
          
          // Load messages if available
          if (sessionData.messages && sessionData.messages.length > 0) {
            const formattedMessages = sessionData.messages.map((msg: any) => ({
              id: msg.id || Date.now().toString() + Math.random().toString(),
              sender: msg.role === 'user' ? 'user' : 'agent',
              content: msg.content,
              timestamp: new Date(msg.timestamp),
            }));
            setMessages(formattedMessages);
          }
        } catch (error) {
          console.error('Error loading saved session:', error);
          // Clear invalid session
          localStorage.removeItem('currentSessionId');
        }
      }
    };
    
    loadExistingSession();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !userId) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await createOrUpdateSession({
        userId,
        sessionId: sessionId ?? undefined,
        question: input,
        persona: JSON.stringify(aiPersona),
      });

      const agentMsg = {
        id: Date.now().toString() + "-agent",
        sender: "agent",
        content: res.data.data.content || "I've processed your request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMsg]);
      setSessionId(res.data.data.session_id);
      setIsTyping(false);

      // Store session in localStorage for persistence
      localStorage.setItem('currentSessionId', res.data.data.session_id);

      if (res.data.data.status === 'completed') {
        console.log("Session ended. Ticket ID:", res.data.data.ticketId);
      }
    } catch (error: any) {
      console.error("API error:", error?.response?.data || error.message);
      setIsTyping(false);
    }
  };

  const handleEndSession = async () => {
    if (!userId || !sessionId) return;
    try {
      await endSession(sessionId, {
        userId,
        reason: "User ended chat manually",
      });
      setSessionId(null);
      setMessages([]);
      localStorage.removeItem('currentSessionId');
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  const formatMessage = (content: string) => {
    return content.split("\n").map((line, index) =>
      line.startsWith("•") ? (
        <li key={index} className="ml-4 text-slate-300">
          {line.substring(1).trim()}
        </li>
      ) : (
        <p key={index} className="mb-2 last:mb-0">
          {line}
        </p>
      )
    );
  };

  const eliteServices = [
    {
      icon: <Plane className="w-4 h-4" />,
      label: "Aviation",
      color: "text-blue-400",
      description: "Private flights",
      prompt:
        "I need assistance with private aviation services. Can you help me arrange a charter flight for a business trip next week?",
    },
    {
      icon: <Car className="w-4 h-4" />,
      label: "Transport",
      color: "text-purple-400",
      description: "Luxury vehicles",
      prompt:
        "I'm looking for luxury transportation services. Can you arrange a limousine service for an important client meeting?",
    },
    {
      icon: <Utensils className="w-4 h-4" />,
      label: "Dining",
      color: "text-amber-400",
      description: "Fine cuisine",
      prompt:
        "I need help with fine dining reservations. Can you recommend and book a Michelin-starred restaurant for a special occasion?",
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: "Events",
      color: "text-emerald-400",
      description: "Exclusive planning",
      prompt:
        "I'm planning an exclusive corporate event. Can you help me organize a high-end event with premium services?",
    },
  ];

  const handleServiceClick = async (prompt: string) => {
    if (!userId) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      content: prompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await createOrUpdateSession({
        userId,
        sessionId: sessionId ?? undefined,
        question: prompt,
        persona: JSON.stringify(aiPersona),
      });

      const agentMsg = {
        id: Date.now().toString() + "-agent",
        sender: "agent",
        content: res.data.data.content || "I've processed your request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMsg]);
      setSessionId(res.data.data.session_id);
      setIsTyping(false);
      
      // Store session in localStorage for persistence
      localStorage.setItem('currentSessionId', res.data.data.session_id);

      if (res.data.data.status === 'completed') {
        console.log("Session ended.");
      }
    } catch (error: any) {
      console.error("API error:", error?.response?.data || error.message);
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/30 backdrop-blur-lg border-b border-slate-700/50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-light text-white">
              kai<span className="text-amber-400">°</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                {/* Minimal Welcome */}
                <div className="mb-8">
                  <div className="flex items-center justify-center mb-6">
                    <Crown className="w-8 h-8 text-amber-400" />
                  </div>
                  <h2 className="text-2xl font-light text-white mb-2">
                    Welcome to <span className="text-amber-400">kai°</span>
                  </h2>
                  <p className="text-slate-300 text-base">
                    Your exclusive AI-powered concierge
                  </p>
                </div>

                {/* Minimal Services */}
                <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-md">
                  {eliteServices.map((service, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleServiceClick(service.prompt)}
                      className={`flex flex-col items-center space-y-2 p-4 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all duration-200 bg-slate-800/30 backdrop-blur-lg cursor-pointer hover:bg-slate-800/50`}
                    >
                      <div className={`${service.color}`}>{service.icon}</div>
                      <span className="text-sm font-medium text-white">
                        {service.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {service.description}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Minimal Features */}
                <div className="bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 rounded-lg p-4 w-full max-w-md">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center justify-center">
                    <Star className="w-4 h-4 text-amber-400 mr-2" />
                    Premium Features
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                      <span className="text-slate-300">Personal Concierge</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                      <span className="text-slate-300">Priority Access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                      <span className="text-slate-300">Global Network</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                      <span className="text-slate-300">Discrete Service</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-2xl p-4 rounded-xl ${
                        msg.sender === "user"
                          ? "bg-amber-400/10 text-amber-300 border border-amber-400/20"
                          : "bg-slate-800/50 text-white border border-slate-700"
                      }`}
                    >
                      {formatMessage(msg.content)}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-slate-400 text-sm">
                          Your concierge is attending...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating End Session Button */}
        {messages.length > 0 && (
          <div className="flex justify-center mb-4">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEndSession}
              className="px-4 py-2 text-sm font-medium text-red-300 hover:text-red-200 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-400/40 backdrop-blur-lg shadow-lg"
            >
              End Session
            </motion.button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-8 bg-slate-800/30 backdrop-blur-lg">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="flex items-center space-x-3 bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 hover:border-slate-600 transition-colors">
                {/* <button
                  type="button"
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <Mic className="w-6 h-6 text-slate-400" />
                </button> */}

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="How may I assist you today?"
                  className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 bg-amber-400 hover:bg-amber-500 disabled:bg-slate-700/50 disabled:text-slate-400 rounded-lg transition-colors"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </form>

          {/* ElevenLabs Widget */}
          <div className="mt-3">
            <elevenlabs-convai agent-id="agent_01k0peh8sbfg0vmp2zmt3emk36"></elevenlabs-convai>
            <script
              src="https://unpkg.com/@elevenlabs/convai-widget-embed"
              async
              type="text/javascript"
            ></script>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
