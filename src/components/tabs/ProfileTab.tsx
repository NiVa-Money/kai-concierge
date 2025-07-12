import React, { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import { getUserInfo } from "../../api";
import {
  User,
  Clock,
  Star,
  Activity,
  Settings,
  LogOut,
  Instagram,
  Linkedin,
  Twitter,
  Award,
  Target,
  Zap,
} from "lucide-react";

const ProfileTab: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { messages, tickets } = useChat();

  // Fetch full user data if persona is missing
  useEffect(() => {
    const fetchFullUser = async () => {
      const storedId = localStorage.getItem("userId");
      if (storedId) {
        try {
          const response = await getUserInfo(storedId);

          // Response is assumed to be the user object from backend
          updateUser(response.data);
        } catch (err) {
          console.error("Failed to fetch full user info:", err);
        }
      }
    };

    // Always try to hydrate user if not fully loaded
    if (!user || !user.name || !user.email) {
      fetchFullUser();
    }
  }, [user, updateUser]);

  const stats = {
    totalRequests: messages.filter((m) => m.sender === "user").length,
    completedTasks: tickets.filter((t) => t.status === "completed").length,
    avgResponseTime: "2.3 min",
    satisfactionScore: 4.9,
  };

  const recentActivity = [
    {
      id: "1",
      action: "Booked private jet to Aspen",
      time: "2 hours ago",
      status: "completed",
    },
    {
      id: "2",
      action: "Reserved table at Le Bernardin",
      time: "1 day ago",
      status: "completed",
    },
    {
      id: "3",
      action: "Arranged yacht charter in Monaco",
      time: "3 days ago",
      status: "completed",
    },
    {
      id: "4",
      action: "Scheduled wellness retreat",
      time: "1 week ago",
      status: "in_progress",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "in_progress":
        return "text-yellow-400";
      case "pending":
        return "text-blue-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✓";
      case "in_progress":
        return "⏳";
      case "pending":
        return "⏸";
      default:
        return "•";
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-20 h-20 rounded-full border-2 border-amber-400"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-light text-white mb-1">
                {user?.name}
              </h2>
              <p className="text-slate-400 mb-3">{user?.email}</p>
              <div className="flex flex-wrap gap-2">
                {user?.persona?.preferences?.map((pref, index) => (
                  <span
                    key={index}
                    className="bg-amber-400/20 text-amber-400 px-3 py-1 rounded-full text-sm"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-slate-400" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Requests",
              value: stats.totalRequests,
              icon: <Target className="w-5 h-5 text-blue-400" />,
              bg: "bg-blue-500/20",
            },
            {
              label: "Completed",
              value: stats.completedTasks,
              icon: <Award className="w-5 h-5 text-green-400" />,
              bg: "bg-green-500/20",
            },
            {
              label: "Avg Response",
              value: stats.avgResponseTime,
              icon: <Zap className="w-5 h-5 text-yellow-400" />,
              bg: "bg-yellow-500/20",
            },
            {
              label: "Satisfaction",
              value: stats.satisfactionScore,
              icon: <Star className="w-5 h-5 text-purple-400" />,
              bg: "bg-purple-500/20",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{item.label}</p>
                  <p className="text-2xl font-semibold text-white">
                    {item.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${item.bg}`}>{item.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Persona */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-amber-400" />
              AI Persona Profile
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-slate-300 font-medium mb-2">Style</h4>
                <p className="text-slate-400 text-sm">{user?.persona?.style}</p>
              </div>

              <div>
                <h4 className="text-slate-300 font-medium mb-2">Profession</h4>
                <p className="text-slate-400 text-sm">
                  {user?.persona?.profession}
                </p>
              </div>

              <div>
                <h4 className="text-slate-300 font-medium mb-2">Lifestyle</h4>
                <div className="flex flex-wrap gap-2">
                  {user?.persona?.lifestyle?.map((item, index) => (
                    <span
                      key={index}
                      className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-slate-300 font-medium mb-2">
                  Communication Tone
                </h4>
                <p className="text-slate-400 text-sm">{user?.persona?.tone}</p>
              </div>
            </div>
          </div>

          {/* Social Connections */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-amber-400" />
              Connected Accounts
            </h3>

            <div className="space-y-3">
              {user?.socialHandles?.instagram && (
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Instagram className="w-5 h-5 text-pink-400" />
                    <span className="text-white">Instagram</span>
                  </div>
                  <span className="text-slate-400 text-sm">
                    {user.socialHandles.instagram}
                  </span>
                </div>
              )}

              {user?.socialHandles?.linkedin && (
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Linkedin className="w-5 h-5 text-blue-400" />
                    <span className="text-white">LinkedIn</span>
                  </div>
                  <span className="text-slate-400 text-sm">
                    {user.socialHandles.linkedin}
                  </span>
                </div>
              )}

              {user?.socialHandles?.twitter && (
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Twitter className="w-5 h-5 text-sky-400" />
                    <span className="text-white">Twitter</span>
                  </div>
                  <span className="text-slate-400 text-sm">
                    {user.socialHandles.twitter}
                  </span>
                </div>
              )}

              {!user?.socialHandles?.instagram &&
                !user?.socialHandles?.linkedin &&
                !user?.socialHandles?.twitter && (
                  <p className="text-slate-400 text-sm text-center py-4">
                    No social accounts connected
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-amber-400" />
            Recent Activity
          </h3>

          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-lg ${getStatusColor(activity.status)}`}
                  >
                    {getStatusIcon(activity.status)}
                  </span>
                  <span className="text-white">{activity.action}</span>
                </div>
                <span className="text-slate-400 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
