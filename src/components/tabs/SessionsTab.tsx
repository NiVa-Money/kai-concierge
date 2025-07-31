/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from "react";
import {
  getUserSessions,
  getSessionDetails,
  createOrUpdateSession,
  endSession,
  SessionResponse,
} from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import {
  Clock,
  MessageSquare,
  Bot,
  Send,
  Calendar,
  User as UserIcon,
  History,
  Search,
  Square,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SessionsTab: React.FC = () => {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] =
    useState<SessionResponse | null>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { setCurrentSession, loadSessionMessages } = useChat();

  const userId = localStorage.getItem("userId");
  const aiPersona = JSON.parse(localStorage.getItem("aiPersona") || "{}");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessionDetails]);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.user_id) return;

      try {
        setLoading(true);
        const response = await getUserSessions(user.user_id);
        const mappedSessions = (
          response.data.data.sessions as SessionResponse[]
        )
          .filter((s) => s.sessionId && s.userId && s.sessionStartAt)
          .map((s) => ({
            session_id: s.sessionId!,
            user_id: s.userId!,
            question:
              s.chats && s.chats.length > 0
                ? s.chats[0].question
                : "No question",
            status: s.isSessionEnd ? ("ended" as const) : ("active" as const),
            created_at: s.sessionStartAt!,
          })) as SessionResponse[];
        setSessions(mappedSessions);
        setError(null);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError("Failed to load sessions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  const handleSessionClick = async (sessionId: string) => {
    try {
      setLoadingDetails(true);
      const userId = user?.user_id || localStorage.getItem("userId");
      console.log("Fetching session details with userId:", userId);
      const response = await getSessionDetails(sessionId, userId || undefined);
      const sessionData = response.data.data;

      setSessionDetails(sessionData);
      setSelectedSession(
        sessions.find((s) => s.session_id === sessionId) || null
      );

      // Convert chats to messages for the chat context
      const messages = (sessionData.chats ?? []).flatMap((chat: any) => [
        {
          id: chat.id,
          content: chat.question,
          timestamp: new Date(chat.time),
          sender: "user",
          type: "text",
        } as const,
        {
          id: `${chat.id}-response`,
          content: chat.agent_response,
          timestamp: new Date(chat.time),
          sender: "ai",
          type: "text",
        } as const,
      ]);

      setCurrentSession({
        id: sessionData.sessionId ?? "",
        userId: sessionData.userId ?? "",
        messages,
        isActive: !sessionData.isSessionEnd,
        createdAt: new Date(
          sessionData.sessionStartAt ?? sessionData.created_at ?? Date.now()
        ),
      });

      loadSessionMessages(messages);
      setShowHistory(false);
    } catch (err) {
      console.error("Error loading session details:", err);
      setError("Failed to load session details. Please try again.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId || !selectedSession) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      content: input,
      timestamp: new Date(),
    };

    // Add user message to session details
    if (sessionDetails) {
      setSessionDetails((prev: any) => ({
        ...prev,
        chats: [
          ...(prev.chats || []),
          {
            id: userMsg.id,
            question: input,
            agent_response: "",
            time: new Date().toISOString(),
          },
        ],
      }));
    }

    setInput("");
    setIsTyping(true);

    try {
      const res = await createOrUpdateSession({
        userId,
        sessionId: selectedSession.session_id,
        question: input,
        persona: JSON.stringify(aiPersona),
      });

      const agentResponse =
        res?.data?.agentResponse || "I've processed your request.";

      // Add AI response to session details
      if (sessionDetails) {
        setSessionDetails((prev: any) => ({
          ...prev,
          chats: prev.chats.map((chat: any, index: number) =>
            index === prev.chats.length - 1
              ? { ...chat, agent_response: agentResponse }
              : chat
          ),
        }));
      }

      setIsTyping(false);
    } catch (err) {
      console.error("Error sending message:", err);
      setIsTyping(false);
    }
  };

  const handleEndSession = async () => {
    if (!selectedSession?.session_id || !userId) return;

    try {
      await endSession(selectedSession.session_id, {
        userId,
        reason: "User manually ended session",
      });

      // Update session details to reflect ended status
      setSessionDetails((prev: any) => ({
        ...prev,
        isSessionEnd: true,
        status: "ended",
      }));

      // Update the session in the sessions list
      setSessions((prev) =>
        prev.map((session) =>
          session.session_id === selectedSession.session_id
            ? { ...session, status: "ended" as const }
            : session
        )
      );

      setShowEndSessionConfirm(false);
      console.log("Session ended successfully");
    } catch (err) {
      console.error("Error ending session:", err);
      setError("Failed to end session. Please try again.");
    }
  };

  const confirmEndSession = () => {
    setShowEndSessionConfirm(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const formatMessage = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("•")) {
        return (
          <li key={index} className="ml-4 text-slate-300">
            {line.substring(1).trim()}
          </li>
        );
      }
      return (
        <p key={index} className="mb-2 last:mb-0">
          {line}
        </p>
      );
    });
  };

  const filteredSessions = sessions.filter((session) =>
    (session.question || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  // Error state
  if (error && sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="text-red-400 mb-4">⚠️</div>
        <p className="text-slate-300 mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg text-sm font-medium hover:bg-amber-400 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-slate-900">
      {/* Grok-style Left Sidebar */}
      <div className="w-80 bg-slate-800/50 border-r border-slate-700 flex flex-col h-full">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-700 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* History Section */}
        <div className="overflow-y-auto max-h-[calc(100vh-80px)] custom-scrollbar">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <History className="w-5 h-5 text-amber-400" />
              <h3 className="text-white font-medium">History</h3>
            </div>

            {filteredSessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No sessions found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSessions.map((session) => (
                  <button
                    key={session.session_id}
                    onClick={() =>
                      session.session_id &&
                      handleSessionClick(session.session_id)
                    }
                    className={`w-full text-left p-3 rounded-lg hover:bg-slate-700/50 transition-colors ${
                      selectedSession?.session_id === session.session_id
                        ? "bg-amber-400/10 border border-amber-400/20"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-white truncate flex-1 text-sm">
                        {session.question && session.question.length > 40
                          ? session.question.substring(0, 40) + "..."
                          : session.question ?? ""}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ml-2 ${
                          session.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-600/50 text-slate-400"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-slate-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {session.created_at ? formatDate(session.created_at) : ""}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area - Grok Style */}
      <div className="flex-1 flex flex-col">
        {selectedSession && sessionDetails ? (
          <>
            {/* Chat Messages */}
            <div
              className="flex-1 overflow-y-auto p-6 custom-scrollbar min-h-0"
              style={{ maxHeight: "calc(100vh - 200px)" }}
            >
              <AnimatePresence>
                {loadingDetails ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                  </div>
                ) : sessionDetails.chats && sessionDetails.chats.length > 0 ? (
                  <div className="max-w-4xl mx-auto space-y-6">
                    {sessionDetails.chats.map((chat: any) => (
                      <div key={chat.id} className="space-y-8">
                        {/* User Message */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-end"
                        >
                          <div className="max-w-2xl bg-amber-400/10 border border-amber-400/20 rounded-2xl px-4 py-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <UserIcon className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-medium text-amber-400">
                                You
                              </span>
                            </div>
                            <div className="text-white text-sm leading-relaxed">
                              {formatMessage(chat.question)}
                            </div>
                            <div className="text-xs text-slate-400 mt-2">
                              {formatDate(chat.time)}
                            </div>
                          </div>
                        </motion.div>

                        {/* AI Response */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="max-w-2xl bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Bot className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-medium text-amber-400">
                                AI Assistant
                              </span>
                            </div>
                            <div className="text-white text-sm leading-relaxed">
                              {formatMessage(chat.agent_response)}
                            </div>
                            <div className="text-xs text-slate-400 mt-2">
                              {formatDate(chat.time)}
                            </div>
                          </div>
                        </motion.div>
                      </div>
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
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <MessageSquare className="w-12 h-12 text-slate-500 mb-4" />
                    <p className="text-slate-300 mb-2">
                      No messages in this session
                    </p>
                    <p className="text-slate-400 text-sm">
                      This session doesn't contain any chat messages
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Area - Only show for active sessions */}
            {!sessionDetails.isSessionEnd && (
              <div className="p-8 bg-slate-800/30 backdrop-blur-lg flex-shrink-0">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                  <div className="relative">
                    <div className="flex items-center space-x-3 bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 hover:border-slate-600 transition-colors">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Continue the conversation..."
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
              </div>
            )}

            {/* Session Info Footer */}
            <div className="bg-slate-800/30 border-t border-slate-700 p-4 flex-shrink-0">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">Session: </span>
                      <span className="text-white font-mono text-xs">
                        {sessionDetails.sessionId}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">Status: </span>
                      <span
                        className={`${
                          sessionDetails.isSessionEnd
                            ? "text-slate-400"
                            : "text-green-400"
                        }`}
                      >
                        {sessionDetails.isSessionEnd ? "Ended" : "Active"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400">
                        {formatDate(sessionDetails.sessionStartAt)}
                      </span>
                    </div>
                  </div>

                  {/* End Session Button - Only show for active sessions */}
                  {!sessionDetails.isSessionEnd && (
                    <button
                      onClick={confirmEndSession}
                      className="flex items-center space-x-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all duration-200"
                      title="End this session"
                    >
                      <Square className="w-4 h-4" />
                      <span>End Session</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          // Default state when no session is selected - Grok style
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-2xl mx-auto px-8">
              <div className="w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-2xl font-medium text-white mb-4">
                Welcome to Your Chat History
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Select a conversation from the history to continue where you
                left off, or start a new chat to begin a fresh conversation.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Active sessions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Ended sessions</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* End Session Confirmation Modal */}
      {showEndSessionConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                <Square className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">End Session</h3>
                <p className="text-slate-400 text-sm">
                  Are you sure you want to end this session?
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-sm mb-6">
              This action cannot be undone. The session will be marked as ended
              and you won't be able to continue the conversation.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowEndSessionConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEndSession}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsTab;
