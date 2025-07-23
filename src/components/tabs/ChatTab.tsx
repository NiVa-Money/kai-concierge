/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { createOrUpdateSession, endSession } from "../../api";
import { Send } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const ChatTab: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

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
        content: res.data.agentResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMsg]);
      setSessionId(res.data.sessionId);
      setIsTyping(false);

      if (res.data.sessionEnd) {
        console.log("Session ended. Ticket ID:", res.data.ticketId);
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
    <div className="flex flex-col h-full relative">
      {/* Greeting Animation */}
      <AnimatePresence>
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-slate-900 to-slate-800 z-10"
          >
            <div className="text-6xl mb-4 animate-bounce">👋</div>
            <h3 className="text-2xl text-white mb-2 font-semibold">
              Good evening, {user?.name?.split(" ")[0]}
            </h3>
            <p className="text-slate-400 mb-4 text-lg">
              How may I assist you today?
            </p>

            <form
              onSubmit={handleSubmit}
              className="w-full max-w-xl flex space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 bg-slate-800 rounded px-3 py-2 text-white focus:outline-none"
              />
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-4 py-2 rounded"
              >
                <Send className="w-5 h-5" />
              </button>

              {/* ElevenLabs Widget */}
              <elevenlabs-convai agent-id="agent_01k0peh8sbfg0vmp2zmt3emk36"></elevenlabs-convai>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages with fixed height and scroll */}
      <div className="p-4 space-y-4 overflow-y-auto" style={{ height: "60vh" }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xl p-3 rounded-lg ${
                msg.sender === "user"
                  ? "bg-amber-400/10 text-amber-300 text-right"
                  : "bg-slate-800/50 text-white text-left"
              }`}
            >
              {formatMessage(msg.content)}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="text-sm text-slate-500 italic">
            Agent is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* End Session Button */}
      {sessionId && (
        <div className="text-center py-2 bg-slate-900 border-t border-slate-800">
          <button
            onClick={handleEndSession}
            className="text-sm text-amber-400 hover:underline"
          >
            End Session
          </button>
        </div>
      )}

      {/* Input */}
      {messages.length > 0 && (
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-slate-700 bg-slate-900 flex space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 bg-slate-800 rounded px-3 py-2 text-white focus:outline-none"
          />
          <button
            type="submit"
            className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-4 py-2 rounded"
          >
            <Send className="w-5 h-5" />
          </button>

          {/* ElevenLabs Widget */}
          <elevenlabs-convai agent-id="agent_01k0peh8sbfg0vmp2zmt3emk36"></elevenlabs-convai>
        </form>
      )}
    </div>
  );
};

export default ChatTab;
