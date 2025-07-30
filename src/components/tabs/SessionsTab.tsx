/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { getUserSessions, getSessionDetails, SessionResponse } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import { Clock, MessageSquare } from "lucide-react";

const SessionsTab: React.FC = () => {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      setLoading(true);
      const response = await getSessionDetails(sessionId);
      const s = response.data.data;

      // Convert chats to messages for the chat context
      const messages = (s.chats ?? []).flatMap((chat: any) => [
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
        id: s.sessionId ?? "",
        userId: s.userId ?? "",
        messages,
        isActive: !s.isSessionEnd,
        createdAt: new Date(s.sessionStartAt ?? s.created_at ?? Date.now()),
      });

      loadSessionMessages(messages);
    } catch (err) {
      console.error("Error loading session details:", err);
      setError("Failed to load session details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

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
    <div className="h-full flex flex-col bg-slate-800/50 backdrop-blur-lg">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Your Sessions</h2>
        <p className="text-sm text-slate-400">
          Select a session to view details
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sessions.map((session) => (
          <button
            key={session.session_id}
            onClick={() =>
              session.session_id && handleSessionClick(session.session_id)
            }
            className="w-full text-left p-4 border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
          >
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
          </button>
        ))}
      </div>
    </div>
  );
};

export default SessionsTab;
