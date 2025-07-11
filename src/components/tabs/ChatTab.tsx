// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useEffect, useRef, useState } from "react";
// import { createOrUpdateSession, endSession } from "../../api";
// import { Send } from "lucide-react";
// import { useAuth } from "../../contexts/AuthContext";

// const ChatTab: React.FC = () => {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState<any[]>([]);
//   const [sessionId, setSessionId] = useState<string | null>(null);
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const { user } = useAuth();

//   const userId = localStorage.getItem("userId");

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, isTyping]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!input.trim() || !userId) return;

//     const userMsg = {
//       id: Date.now().toString(),
//       sender: "user",
//       content: input,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMsg]);
//     setInput("");
//     setIsTyping(true);

//     try {
//       const res = await createOrUpdateSession({
//         userId,
//         sessionId: sessionId ?? undefined,
//         question: input,
//       });

//       const agentMsg = {
//         id: Date.now().toString() + "-agent",
//         sender: "agent",
//         content: res.data.agentResponse,
//         timestamp: new Date(),
//       };

//       setMessages((prev) => [...prev, agentMsg]);
//       setSessionId(res.data.sessionId);
//       setIsTyping(false);

//       if (res.data.sessionEnd) {
//         console.log("Session ended. Ticket ID:", res.data.ticketId);
//       }
//     } catch (error: any) {
//       console.error("API error:", error?.response?.data || error.message);
//       setIsTyping(false);
//     }
//   };

//   const handleEndSession = async () => {
//     if (!userId || !sessionId) return;
//     try {
//       await endSession(sessionId, {
//         userId,
//         reason: "User ended chat manually",
//       });
//       setSessionId(null);
//       setMessages([]);
//     } catch (error) {
//       console.error("Error ending session:", error);
//     }
//   };

//   const formatMessage = (content: string) => {
//     return content.split("\n").map((line, index) =>
//       line.startsWith("•") ? (
//         <li key={index} className="ml-4 text-slate-300">
//           {line.substring(1).trim()}
//         </li>
//       ) : (
//         <p key={index} className="mb-2 last:mb-0">
//           {line}
//         </p>
//       )
//     );
//   };

//   return (
//     <div className="flex flex-col h-full">
//       {/* Chat Header with Greeting */}
//       <div className="bg-slate-800/30 border-b border-slate-700 px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-lg font-medium text-white">Kai Concierge</h2>
//             <div className="flex items-center space-x-2 mt-1">
//               <div className="w-2 h-2 bg-green-400 rounded-full"></div>
//               <span className="text-sm text-slate-400">Always available</span>
//             </div>
//           </div>
//         </div>

//         {/* Greeting */}
//         <div className="mt-4 text-center">
//           <div className="flex items-center justify-center space-x-2 mb-2">
//             <div className="text-4xl animate-bounce">👋</div>
//             <h3 className="text-xl text-white">
//               Good evening, {user?.name?.split(" ")[0]}
//             </h3>
//           </div>

//           <p className="text-slate-400">How may I assist you today?</p>
//         </div>
//       </div>

//       {/* Messages with fixed height and scroll */}
//       <div className="p-4 space-y-4 overflow-y-auto" style={{ height: "60vh" }}>
//         {messages.map((msg) => (
//           <div
//             key={msg.id}
//             className={`flex ${
//               msg.sender === "user" ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`max-w-xl p-3 rounded-lg ${
//                 msg.sender === "user"
//                   ? "bg-amber-400/10 text-amber-300 text-right"
//                   : "bg-slate-800/50 text-white text-left"
//               }`}
//             >
//               {formatMessage(msg.content)}
//             </div>
//           </div>
//         ))}

//         {isTyping && (
//           <div className="text-sm text-slate-500 italic">
//             Agent is typing...
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {sessionId && (
//         <div className="text-center mt-2">
//           <button
//             onClick={handleEndSession}
//             className="text-sm text-amber-400 hover:underline"
//           >
//             End Session
//           </button>
//         </div>
//       )}

//       {/* Quick Suggestions */}
//       {/* <div className="px-4 pt-2 pb-3 border-t border-slate-700 bg-slate-900 overflow-x-auto">
//         <div className="text-sm text-slate-400 mb-2">Quick requests:</div>
//         <div className="flex gap-2 whitespace-nowrap">
//           {[
//             "Book me a flight to Tokyo next week",
//             "Find me a yacht charter in the Mediterranean",
//             "Arrange a private shopping experience",
//             "Schedule a wellness retreat this month",
//           ].map((text, idx) => (
//             <button
//               key={idx}
//               type="button"
//               onClick={() => setInput(text)}
//               className="bg-slate-800 hover:bg-slate-700 text-white text-sm px-4 py-2 rounded border border-slate-600 transition-all"
//             >
//               {text}
//             </button>
//           ))}
//         </div>
//       </div> */}

//       {/* Input */}
//       <form
//         onSubmit={handleSubmit}
//         className="p-4 border-t border-slate-700 bg-slate-900 flex space-x-2"
//       >
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Ask anything..."
//           className="flex-1 bg-slate-800 rounded px-3 py-2 text-white focus:outline-none"
//         />
//         <button
//           type="submit"
//           className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-4 py-2 rounded"
//         >
//           <Send className="w-5 h-5" />
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ChatTab;

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
        </form>
      )}
    </div>
  );
};

export default ChatTab;
