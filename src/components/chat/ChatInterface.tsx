/* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState, useRef, useEffect } from "react";
// import { useChat } from "../../contexts/ChatContext";
// import { useAuth } from "../../contexts/AuthContext";
// import { Send, Menu } from "lucide-react";

// const ChatInterface: React.FC = () => {
//   const { messages, sendMessage, isTyping } = useChat();
//   const { user } = useAuth();
//   const [input, setInput] = useState("");
//   const [showProfile, setShowProfile] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, isTyping]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (input.trim()) {
//       sendMessage(input);
//       setInput("");
//     }
//   };

//   const formatMessage = (content: string) => {
//     return content.split("\n").map((line, index) => {
//       if (line.startsWith("•")) {
//         return (
//           <li key={index} className="ml-4 text-slate-300">
//             {line.substring(1).trim()}
//           </li>
//         );
//       }
//       return (
//         <p key={index} className="mb-2 last:mb-0">
//           {line}
//         </p>
//       );
//     });
//   };

//   return (
//     <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
//       {/* Header */}
//       <div className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700 px-4 py-3">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <button
//               onClick={() => setShowProfile(!showProfile)}
//               className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
//             >
//               <Menu className="w-5 h-5 text-slate-400" />
//             </button>
//             <h1 className="text-xl font-light text-white">
//               kai<span className="text-amber-400">°</span>
//             </h1>
//           </div>
//           <div className="flex items-center space-x-2">
//             <div className="w-2 h-2 bg-green-400 rounded-full"></div>
//             <span className="text-sm text-slate-400">Always available</span>
//           </div>
//         </div>
//       </div>

//       {/* Profile Sidebar */}
//       {showProfile && (
//         <div className="absolute inset-y-0 left-0 w-80 bg-slate-800/95 backdrop-blur-lg border-r border-slate-700 z-10">
//           <div className="p-6">
//             <div className="flex items-center space-x-3 mb-6">
//               <img
//                 src={user?.avatar}
//                 alt={user?.name}
//                 className="w-12 h-12 rounded-full"
//               />
//               <div>
//                 <h3 className="text-white font-medium">{user?.name}</h3>
//                 <p className="text-slate-400 text-sm">{user?.email}</p>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <h4 className="text-slate-300 font-medium mb-2">AI Persona</h4>
//                 <p className="text-slate-400 text-sm">{user?.persona.style}</p>
//               </div>

//               <div>
//                 <h4 className="text-slate-300 font-medium mb-2">Preferences</h4>
//                 <div className="flex flex-wrap gap-2">
//                   {user?.persona.preferences.map((pref, index) => (
//                     <span
//                       key={index}
//                       className="bg-amber-400/20 text-amber-400 px-2 py-1 rounded text-xs"
//                     >
//                       {pref}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.length === 0 && (
//           <div className="text-center py-12">
//             <div className="text-4xl mb-4">👋</div>
//             <h2 className="text-xl text-white mb-2">
//               Good evening, {user?.name?.split(" ")[0]}
//             </h2>
//             <p className="text-slate-400">How may I assist you today?</p>
//           </div>
//         )}

//         {messages.map((message) => (
//           <div
//             key={message.id}
//             className={`flex ${
//               message.sender === "user" ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
//                 message.sender === "user"
//                   ? "bg-amber-400 text-slate-900"
//                   : "bg-slate-800 text-white"
//               }`}
//             >
//               <div className="text-sm">{formatMessage(message.content)}</div>
//             </div>
//           </div>
//         ))}

//         {isTyping && (
//           <div className="flex justify-start">
//             <div className="bg-slate-800 text-white px-4 py-2 rounded-2xl">
//               <div className="flex space-x-1">
//                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
//                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-100"></div>
//                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-200"></div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input */}
//       <div className="bg-slate-800/50 backdrop-blur-lg border-t border-slate-700 p-4">
//         <form onSubmit={handleSubmit} className="flex space-x-2">
//           <input
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Type your request..."
//             className="flex-1 bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
//           />
//           <button
//             type="submit"
//             disabled={!input.trim()}
//             className="bg-amber-400 hover:bg-amber-500 text-slate-900 p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <Send className="w-5 h-5" />
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ChatInterface;

import React, { useState, useRef, useEffect } from "react";
import { Send, Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createOrUpdateSession, endSession } from "../../api";

const ChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [personaStatus, setPersonaStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = localStorage.getItem("userId");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Check persona generation status
  useEffect(() => {
    const checkPersonaStatus = () => {
      const status = localStorage.getItem('personaGenerationStatus');
      setPersonaStatus(status);
      
      // If persona is completed, clear the status
      if (status === 'completed') {
        setTimeout(() => {
          localStorage.removeItem('personaGenerationStatus');
          setPersonaStatus(null);
        }, 10000); // Clear after 10 seconds
      }
    };

    // Check immediately
    checkPersonaStatus();
    
    // Check every 3 seconds
    const interval = setInterval(checkPersonaStatus, 3000);
    
    return () => clearInterval(interval);
  }, []);

  if (!userId) {
    return (
      <div className="h-screen bg-slate-900 text-white flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-2xl mb-2">Unauthorized Access</h1>
          <p className="text-slate-400">
            You must be logged in to use the AI concierge chat.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || !userId) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await createOrUpdateSession({
        userId,
        sessionId: sessionId ?? undefined,
        question,
        persona: ""
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

      if (res.data.data?.isSessionEnd) {
        console.log("Session ended. Ticket ID:", res.data.data.ticketId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
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
      line.startsWith("\u2022") ? (
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
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-400" />
            </button>
            <h1 className="text-xl font-light text-white">
              kai<span className="text-amber-400">&deg;</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-sm text-slate-400">Always available</span>
          </div>
        </div>
      </div>

      {/* Persona Generation Status */}
      {personaStatus === 'generating' && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400"></div>
            <span className="text-amber-400 text-sm font-medium">
              Generating your AI persona... This will take a moment.
            </span>
          </div>
        </div>
      )}
      
      {personaStatus === 'completed' && (
        <div className="bg-green-500/20 border-b border-green-500/30 px-4 py-3">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-green-400 text-sm font-medium">
              ✅ Your AI persona is ready! Your experience is now personalized.
            </span>
          </div>
        </div>
      )}
      
      {personaStatus === 'failed' && (
        <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-3">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-red-400 text-sm font-medium">
              ❌ Persona generation failed. You can try again later.
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👋</div>
            <h2 className="text-xl text-white mb-2">
              Good evening, {user?.name?.split(" ")[0]}
            </h2>
            <p className="text-slate-400">How may I assist you today?</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === "user"
                  ? "bg-amber-400 text-slate-900"
                  : "bg-slate-800 text-white"
              }`}
            >
              <div className="text-sm">{formatMessage(message.content)}</div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-white px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-100" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-slate-800/50 backdrop-blur-lg border-t border-slate-700 p-4">
        {!userId && (
          <p className="text-red-400 text-center text-sm mb-2">
            Please log in to start a chat session.
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your request..."
            disabled={!userId}
            className={`flex-1 bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all ${
              !userId ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim() || !userId}
            className="bg-amber-400 hover:bg-amber-500 text-slate-900 p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        {sessionId && (
          <div className="text-center mt-3">
            <button
              onClick={handleEndSession}
              className="text-sm text-amber-400 hover:underline"
            >
              End Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
