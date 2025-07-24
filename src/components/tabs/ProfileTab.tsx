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

  useEffect(() => {
    // const fetchUserData = async () => {
    //   try {
    //     const storedId = localStorage.getItem("userId");
    //     if (storedId && (!user || !user.name || !user.email)) {
    //       const response = await getUserInfo(storedId);
    //       updateUser(response.data.data);
    //     }
    //   } catch (err) {
    //     console.error("Failed to fetch user info:", err);
    //     setError("Unable to load user information.");
    //   }
    // };

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

    // fetchUserData();
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
    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
      <div className="flex items-center space-x-3">
        {icon}
        <span className="text-white">{label}</span>
      </div>
      <span className="text-slate-400 text-sm">{value}</span>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
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
              className="w-20 h-20 rounded-full border-2 border-amber-400"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-light text-white mb-1">
                {dashboard?.data?.profile?.name || "-"}
              </h2>
              <p className="text-slate-400 mb-1">
                {dashboard?.data?.profile?.email || "-"}
              </p>
              <p className="text-slate-400 mb-1">
                Phone: {dashboard?.data?.profile?.phone || "-"}
              </p>

              {dashboard?.data?.profile?.age && (
                <p className="text-slate-500 text-sm mb-1">
                  Age: {dashboard.data.profile.age}
                </p>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5 text-slate-400" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-white"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowLogoutConfirm(true)}
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
              value: stats.completedRequests,
              icon: <Award className="w-5 h-5 text-green-400" />,
              bg: "bg-green-500/20",
            },
            {
              label: "Avg Response",
              value: stats.avgResponse,
              icon: <Zap className="w-5 h-5 text-yellow-400" />,
              bg: "bg-yellow-500/20",
            },
            {
              label: "Satisfaction",
              value: stats.satisfaction,
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

        {/* Social Connections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Persona */}
          {/* ... unchanged AI persona content ... */}

          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-amber-400" />
              Connected Accounts
            </h3>

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
                  <p className="text-slate-400 text-sm text-center py-4">
                    No social accounts connected
                  </p>
                )}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-amber-400" />
            Recent Activity
          </h3>

          <div className="space-y-3">
            {dashboard?.data?.recent_activity?.length > 0 ? (
              dashboard.data.recent_activity.map(
                (activity: any, idx: number) => (
                  <div
                    key={activity._id || idx}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-white font-medium">
                        {activity.client_message || "Unknown Service"}
                      </span>
                      <span className="text-slate-400 text-sm">
                        Ticket: {activity.ticket_id || "-"} | Status:{" "}
                        {activity.status || "N/A"}
                      </span>
                    </div>
                    <span className="text-slate-400 text-sm">
                      {new Date(activity.created_at).toLocaleString()}
                    </span>
                  </div>
                )
              )
            ) : (
              <p className="text-slate-400 text-sm text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
            <div className="bg-slate-800 rounded-lg p-6 w-96">
              <h2 className="text-lg text-white mb-4">Delete Account?</h2>
              <p className="text-slate-300 mb-4">
                Are you sure you want to delete your account? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-2 bg-slate-600 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-3 py-2 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
            <div className="bg-slate-800 rounded-lg p-6 w-96">
              <h2 className="text-lg text-white mb-4">Logout?</h2>
              <p className="text-slate-300 mb-4">
                Are you sure you want to log out of your account?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-3 py-2 bg-slate-600 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 bg-red-500 text-white rounded"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
            <div className="bg-slate-800 rounded-lg p-6 w-96">
              <h2 className="text-lg text-white mb-4">Edit Profile</h2>
              <input
                type="text"
                placeholder="Name"
                defaultValue={dashboard?.data?.profile?.name || ""}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full p-2 mb-3 rounded bg-slate-700 text-white"
              />
              <input
                type="text"
                placeholder="Email"
                defaultValue={dashboard?.data?.profile?.email || ""}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full p-2 mb-3 rounded bg-slate-700 text-white"
              />
              <input
                type="number"
                placeholder="Age"
                defaultValue={dashboard?.data?.profile?.age || ""}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    age: Number(e.target.value),
                  }))
                }
                className="w-full p-2 mb-3 rounded bg-slate-700 text-white"
              />
              <input
                type="text"
                placeholder="Phone Number"
                defaultValue={dashboard?.data?.profile?.phone || ""}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full p-2 mb-3 rounded bg-slate-700 text-white"
              />

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-2 bg-slate-600 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  className="px-3 py-2 bg-amber-500 text-black rounded"
                  disabled={updating}
                >
                  {updating ? "Saving..." : "Save"}
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
