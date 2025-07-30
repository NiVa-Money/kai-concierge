/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { getUserSessions, getSessionDetails, SessionResponse } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import { 
  Clock, 
  MessageSquare, 
  ArrowLeft, 
  User, 
  Bot, 
  ChevronLeft,
  ChevronRight,
  Calendar,
  Ticket,
  User as UserIcon,
  CheckCircle,
  XCircle
} from "lucide-react";

const SessionsTab: React.FC = () => {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionResponse | null>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const { setCurrentSession, loadSessionMessages } = useChat();

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.user_id) return;

      try {
        setLoading(true);
        const response = await getUserSessions(user.user_id);
        // response.data.data.sessions is SessionResponse[]
        const mappedSessions = (response.data.data.sessions as SessionResponse[])
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
      setSelectedSession(sessions.find(s => s.session_id === sessionId) || null);

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
        createdAt: new Date(sessionData.sessionStartAt ?? sessionData.created_at ?? Date.now()),
      });

      loadSessionMessages(messages);
    } catch (err) {
      console.error("Error loading session details:", err);
      setError("Failed to load session details. Please try again.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleBackToSessions = () => {
    setSelectedSession(null);
    setSessionDetails(null);
    setCurrentSession(null);
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

  // Grok-style Chat Interface
  if (selectedSession && sessionDetails) {
    return (
      <div className="h-full flex bg-slate-900">
        {/* Collapsible Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 bg-slate-800/50 border-r border-slate-700 flex flex-col`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            {!sidebarCollapsed && (
              <h3 className="text-white font-medium">Sessions</h3>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto">
            {sessions.map((session) => (
              <button
                key={session.session_id}
                onClick={() => session.session_id && handleSessionClick(session.session_id)}
                className={`w-full text-left p-3 border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                  selectedSession?.session_id === session.session_id ? 'bg-amber-400/10 border-amber-400/20' : ''
                }`}
              >
                {sidebarCollapsed ? (
                  <div className="flex justify-center">
                    <MessageSquare className="w-5 h-5 text-slate-400" />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-white truncate flex-1 text-sm">
                        {session.question && session.question.length > 30
                          ? session.question.substring(0, 30) + "..."
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
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-slate-800/50 border-b border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToSessions}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-400" />
                </button>
                <div>
                  <h2 className="text-lg font-medium text-white">Session Chat</h2>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <span>ID: {sessionDetails.sessionId}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      sessionDetails.isSessionEnd 
                        ? "bg-slate-600/50 text-slate-400" 
                        : "bg-green-500/20 text-green-400"
                    }`}>
                      {sessionDetails.isSessionEnd ? "Ended" : "Active"}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Session Metadata */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">
                    {formatDate(sessionDetails.sessionStartAt)}
                  </span>
                </div>
                {sessionDetails.sessionEndAt && (
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">
                      {formatDate(sessionDetails.sessionEndAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {loadingDetails ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
              </div>
            ) : sessionDetails.chats && sessionDetails.chats.length > 0 ? (
              <div className="max-w-4xl mx-auto space-y-6">
                {sessionDetails.chats.map((chat: any) => (
                  <div key={chat.id} className="space-y-4">
                    {/* User Message - Grok Style */}
                    <div className="flex justify-end">
                      <div className="max-w-2xl bg-amber-400/10 border border-amber-400/20 rounded-2xl px-4 py-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <UserIcon className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-medium text-amber-400">You</span>
                        </div>
                        <div className="text-white text-sm leading-relaxed">
                          {formatMessage(chat.question)}
                        </div>
                        <div className="text-xs text-slate-400 mt-2">
                          {formatDate(chat.time)}
                        </div>
                      </div>
                    </div>

                    {/* AI Response - Grok Style */}
                    <div className="flex justify-start">
                      <div className="max-w-2xl bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Bot className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-medium text-amber-400">AI Assistant</span>
                        </div>
                        <div className="text-white text-sm leading-relaxed">
                          {formatMessage(chat.agent_response)}
                        </div>
                        <div className="text-xs text-slate-400 mt-2">
                          {formatDate(chat.time)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <MessageSquare className="w-12 h-12 text-slate-500 mb-4" />
                <p className="text-slate-300 mb-2">No messages in this session</p>
                <p className="text-slate-400 text-sm">
                  This session doesn't contain any chat messages
                </p>
              </div>
            )}
          </div>

          {/* Session Info Footer */}
          <div className="bg-slate-800/30 border-t border-slate-700 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">User: </span>
                  <span className="text-white">{sessionDetails.user || "Unknown"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Ticket className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">Ticket: </span>
                  <span className={`${sessionDetails.isTicketCreated ? 'text-green-400' : 'text-slate-400'}`}>
                    {sessionDetails.isTicketCreated ? (
                      <span className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Created
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <XCircle className="w-4 h-4 mr-1" />
                        Not Created
                      </span>
                    )}
                  </span>
                </div>
                {sessionDetails.ticketId && (
                  <div className="flex items-center space-x-2">
                    <Ticket className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Ticket ID: </span>
                    <span className="text-white font-mono text-xs">{sessionDetails.ticketId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sessions List View
  if (loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

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

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <MessageSquare className="w-12 h-12 text-slate-500 mb-4" />
        <p className="text-slate-300 mb-2">No sessions found</p>
        <p className="text-slate-400 text-sm">
          Start a new chat to create a session
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-slate-900">
      {/* Collapsible Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 bg-slate-800/50 border-r border-slate-700 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {!sidebarCollapsed && (
            <h3 className="text-white font-medium">Your Sessions</h3>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {sessions.map((session) => (
            <button
              key={session.session_id}
              onClick={() =>
                session.session_id && handleSessionClick(session.session_id)
              }
              className="w-full text-left p-4 border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
            >
              {sidebarCollapsed ? (
                <div className="flex justify-center">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white truncate flex-1">
                      {session.question && session.question.length > 50
                        ? session.question.substring(0, 50) + "..."
                        : session.question ?? ""}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
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
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-8 flex items-center justify-center h-full">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-slate-500 mb-4 mx-auto" />
            <h2 className="text-xl font-medium text-white mb-2">Select a Session</h2>
            <p className="text-slate-400">
              Choose a session from the sidebar to view the conversation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsTab;
