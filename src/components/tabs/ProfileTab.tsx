/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import {
  deleteUserById,
  getUserDashboard,
  // getUserInfo,
  updateUserById,
  UserResponse,
} from "../../api";
import {
  Star,
  Activity,
  LogOut,
  Instagram,
  Linkedin,
  Clock,
  Twitter,
  Award,
  Target,
  Zap,
  Edit,
  Trash2,
  Mail,
  Phone,
  User,
  Crown,
} from "lucide-react";

const ProfileTab: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  useChat();

  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserResponse>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const maleAvatar =
    "https://static.vecteezy.com/system/resources/previews/024/183/525/non_2x/avatar-of-a-man-portrait-of-a-young-guy-illustration-of-male-character-in-modern-color-style-vector.jpg";
  const femaleAvatar =
    "https://t4.ftcdn.net/jpg/11/66/06/77/360_F_1166067709_2SooAuPWXp20XkGev7oOT7nuK1VThCsN.jpg";

  const isLikelyFemale = (name: string): boolean => {
    const femaleNames = ["emma", "olivia", "ava", "mia", "sophia", "sj"];
    return femaleNames.includes(name.toLowerCase());
  };

  const fetchDashboard = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (userId) {
        const response = await getUserDashboard(userId);
        setDashboard(response.data);
        console.log(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = {
    totalRequests: dashboard?.data?.total_requests ?? 0,
    completedRequests: dashboard?.data?.completed_requests ?? 0,
    avgResponse: dashboard?.data?.avg_response_minutes ?? 0,
    satisfaction: dashboard?.data?.satisfaction ?? 0,
  };

  const handleUpdateUser = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    setUpdating(true);
    try {
      const response = await updateUserById(userId, editForm);
      updateUser(response.data.data);
      await fetchDashboard(); // <-- Add this to refresh UI
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Failed to update user details.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm("Are you sure you want to delete your account?"))
      return;
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      await deleteUserById(userId);
      logout();
      window.location.href = "/login";
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user.");
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const SocialRow = ({
    icon,
    label,
    value,
  }: {
    icon: JSX.Element;
    label: string;
    value: string;
  }) => (
    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div className="flex items-center space-x-3">
        {icon}
        <span className="text-white font-medium">{label}</span>
      </div>
      <span className="text-slate-400 text-sm font-mono">{value}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="relative">
              <img
                src={
                  user?.avatar ||
                  (user?.name
                    ? isLikelyFemale(user.name)
                      ? femaleAvatar
                      : maleAvatar
                    : maleAvatar)
                }
                alt={user?.name}
                className="w-24 h-24 rounded-2xl border-2 border-amber-400/50 shadow-lg"
              />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                <Crown className="w-4 h-4 text-slate-900" />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {dashboard?.data?.profile?.name || "Elite Member"}
                </h1>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="px-3 py-1 bg-amber-400/20 text-amber-400 rounded-full text-sm font-medium">
                    Premium Member
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 text-slate-300">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span className="font-medium">{dashboard?.data?.profile?.email || "-"}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span className="font-medium">{dashboard?.data?.profile?.phone || "-"}</span>
                </div>
                {dashboard?.data?.profile?.age && (
                  <div className="flex items-center space-x-3 text-slate-300">
                    <User className="w-4 h-4 text-amber-400" />
                    <span className="font-medium">Age: {dashboard.data.profile.age}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-colors border border-slate-600/50"
              >
                <Edit className="w-5 h-5 text-amber-400" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors border border-red-500/30"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
              </button>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-colors border border-slate-600/50"
              >
                <LogOut className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Total Requests",
              value: stats.totalRequests,
              icon: <Target className="w-6 h-6 text-blue-400" />,
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
            },
            {
              label: "Completed",
              value: stats.completedRequests,
              icon: <Award className="w-6 h-6 text-green-400" />,
              bg: "bg-green-500/10",
              border: "border-green-500/20",
            },
            {
              label: "Avg Response",
              value: `${stats.avgResponse}m`,
              icon: <Zap className="w-6 h-6 text-yellow-400" />,
              bg: "bg-yellow-500/10",
              border: "border-yellow-500/20",
            },
            {
              label: "Satisfaction",
              value: `${stats.satisfaction}%`,
              icon: <Star className="w-6 h-6 text-purple-400" />,
              bg: "bg-purple-500/10",
              border: "border-purple-500/20",
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`bg-slate-800/30 backdrop-blur-lg border ${item.border} rounded-2xl p-6 hover:scale-105 transition-all duration-200`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${item.bg}`}>
                  {item.icon}
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-1">
                  {item.value}
                </p>
                <p className="text-slate-400 text-sm font-medium">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connected Accounts */}
          <div className="bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-amber-400/20 rounded-lg">
                <Activity className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Connected Accounts</h3>
            </div>

            <div className="space-y-3">
              {user?.socialHandles?.instagram && (
                <SocialRow
                  icon={<Instagram className="w-5 h-5 text-pink-400" />}
                  label="Instagram"
                  value={user.socialHandles.instagram}
                />
              )}

              {user?.socialHandles?.linkedin && (
                <SocialRow
                  icon={<Linkedin className="w-5 h-5 text-blue-400" />}
                  label="LinkedIn"
                  value={user.socialHandles.linkedin}
                />
              )}

              {user?.socialHandles?.twitter && (
                <SocialRow
                  icon={<Twitter className="w-5 h-5 text-sky-400" />}
                  label="Twitter"
                  value={user.socialHandles.twitter}
                />
              )}

              {!user?.socialHandles?.instagram &&
                !user?.socialHandles?.linkedin &&
                !user?.socialHandles?.twitter && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-slate-400 font-medium">No social accounts connected</p>
                    <p className="text-slate-500 text-sm mt-1">Connect your social media accounts</p>
                  </div>
                )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-amber-400/20 rounded-lg">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Recent Activity</h3>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {dashboard?.data?.recent_activity?.length > 0 ? (
                dashboard.data.recent_activity.map(
                  (activity: any, idx: number) => (
                    <div
                      key={activity._id || idx}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">
                          {activity.client_message || "Unknown Service"}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <span>Ticket: {activity.ticket_id || "-"}</span>
                          <span>Status: {activity.status || "N/A"}</span>
                        </div>
                      </div>
                      <span className="text-slate-400 text-sm font-mono">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )
                )
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-400 font-medium">No recent activity</p>
                  <p className="text-slate-500 text-sm mt-1">Your activity will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-slate-800 rounded-2xl p-8 w-96 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Delete Account?</h2>
              <p className="text-slate-300 mb-6">
                Are you sure you want to delete your account? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-slate-800 rounded-2xl p-8 w-96 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Logout?</h2>
              <p className="text-slate-300 mb-6">
                Are you sure you want to log out of your account?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-slate-800 rounded-2xl p-8 w-96 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    defaultValue={dashboard?.data?.profile?.name || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    defaultValue={dashboard?.data?.profile?.email || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
                  <input
                    type="number"
                    placeholder="Enter your age"
                    defaultValue={dashboard?.data?.profile?.age || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        age: Number(e.target.value),
                      }))
                    }
                    className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    defaultValue={dashboard?.data?.profile?.phone || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
                  disabled={updating}
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTab;
