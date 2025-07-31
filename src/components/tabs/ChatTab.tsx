/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import {
  createOrUpdateSession,
  endSession,
  getPersonaRecommendations,
  getSessionDetails,
} from "../../api";
import { Send, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatTab: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

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

  useEffect(() => {
    const loadExistingSession = async () => {
      const savedSessionId = localStorage.getItem("currentSessionId");
      if (savedSessionId && userId) {
        try {
          const response = await getSessionDetails(savedSessionId, userId);
          const sessionData = response.data.data;
          if (sessionData.sessionId) {
            setSessionId(sessionData.sessionId);
          }
          if (sessionData.messages && sessionData.messages.length > 0) {
            const formattedMessages = sessionData.messages.map((msg: any) => ({
              id: msg.id || Date.now().toString() + Math.random().toString(),
              sender: msg.role === "user" ? "user" : "agent",
              content: msg.content,
              timestamp: new Date(msg.timestamp),
            }));
            setMessages(formattedMessages);
          }
        } catch (error) {
          console.error("Error loading saved session:", error);
          localStorage.removeItem("currentSessionId");
        }
      }
    };

    loadExistingSession();
  }, [userId]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userId || messages.length > 0) return;

      setIsTyping(true);

      try {
        const res = await getPersonaRecommendations(userId);
        const recos = res.data?.data?.recommendations || [];
        setRecommendations(recos);
      } catch (err) {
        console.error("Failed to get recommendations", err);
      } finally {
        setIsTyping(false); // stop loader
      }
    };

    fetchRecommendations();
  }, [userId, messages.length]);

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

      const agentResponse =
        res?.data?.agentResponse || "I've processed your request.";

      const agentMsg = {
        id: Date.now().toString() + "-agent",
        sender: "agent",
        content: agentResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMsg]);
      if (res?.data?.sessionId) {
        setSessionId(res.data.sessionId);
        localStorage.setItem("currentSessionId", res.data.sessionId);
      }
      setIsTyping(false);

      if (res?.data?.status === "ended") {
        console.log("Session ended. Ticket ID:", res.data.ticketId);
      }
    } catch (error: any) {
      console.error(
        "API error:",
        error,
        error?.response?.data || error.message
      );
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
      localStorage.removeItem("currentSessionId");
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
                className="flex flex-col items-center justify-start text-center h-full"
              >
                {/* Welcome */}
                <div className="mt-8 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <Crown className="w-7 h-7 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-light text-white mb-1">
                    Welcome to <span className="text-amber-400">kai°</span>
                  </h2>
                  <p className="text-slate-300 text-sm">
                    Your exclusive AI-powered concierge
                  </p>
                </div>

                {/* Cards */}
                {isTyping ? (
                  <div className="mt-6 text-slate-300 text-sm">
                    Generating recommendations for you...
                  </div>
                ) : (
                  recommendations.length > 0 && (
                    <div className="w-full max-w-7xl px-4 flex flex-wrap justify-center gap-4">
                      {recommendations.slice(0, 6).map((r, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex flex-col w-[300px] bg-slate-800 border border-slate-700 rounded-xl p-4 shadow hover:shadow-amber-500/20 transition-all"
                        >
                          <h3 className="text-base font-semibold text-white mb-1">
                            {r.title}
                          </h3>

                          <p className="text-sm text-slate-400 mb-2">
                            {r.reasoning}
                          </p>

                          <div className="text-xs text-slate-400 space-y-1 mb-2">
                            <p>
                              <strong>Cost:</strong> {r.estimated_cost}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                )}
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
