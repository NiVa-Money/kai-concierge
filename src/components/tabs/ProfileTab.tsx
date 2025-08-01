/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import {
  deleteUserById,
  getUserDashboard,
  updateUserById,
  updateUserSocialHandlesDirect,
  UserResponse,
  storePersona,
  deleteUserPersonas,
} from "../../api";
import {
  generatePersona,
  scrapeInstagram,
  scrapeLinkedIn,
  scrapeTwitter,
} from "../../api/persona";
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
  X,
  Mail,
  Phone,
  Trash2,
  User,
  Crown,
  Plus,
} from "lucide-react";

// Utility functions for persona generation
const clearPersonaStatus = () => {
  localStorage.removeItem("personaGenerationStatus");
  localStorage.removeItem("personaGenerationTime");
};

// Retry mechanism for failed API calls

// Simple notification system
const showNotification = (
  message: string,
  type: "success" | "info" | "error" = "info"
) => {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full ${
    type === "success"
      ? "bg-green-500 text-white"
      : type === "error"
      ? "bg-red-500 text-white"
      : "bg-amber-500 text-slate-900"
  }`;
  notification.textContent = message;

  // Add to DOM
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.classList.remove("translate-x-full");
  }, 100);

  // Remove after 5 seconds
  setTimeout(() => {
    notification.classList.add("translate-x-full");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 5000);
};

// Background persona generation function
const generatePersonaInBackground = async (
  platform: "LinkedIn" | "Twitter" | "Instagram",
  username: string,
  profileData: any[],
  userId: string,
  onComplete?: () => void
) => {
  try {
    console.log("🔄 Starting background persona generation...");

    // Set generation status in localStorage
    localStorage.setItem("personaGenerationStatus", "generating");

    // Step 1: Generate AI Persona
    const aiPersona = await generatePersona(platform, username, profileData);
    console.log("✅ AI Persona generated:", aiPersona);

    // Store in localStorage immediately (this always works)
    localStorage.setItem("aiPersona", JSON.stringify(aiPersona));
    console.log("✅ Persona stored in localStorage");

    // Step 2: Try to store persona in API (with retry logic)
    let apiStored = false;
    try {
      await storePersona({
        userId: userId,
        platform: platform,
        username: username,
        profileData: aiPersona,
      });
      console.log("✅ Persona stored in API successfully");
      apiStored = true;
    } catch (apiError) {
      console.warn(
        "⚠️ Failed to store persona in API, but persona is available locally:",
        apiError
      );

      // Try alternative API call format
      try {
        await storePersona({
          userId: userId,
          platform: platform.toLowerCase(),
          username: username,
          profileData: aiPersona,
        });
        console.log("✅ Persona stored in API with alternative format");
        apiStored = true;
      } catch (retryError) {
        console.warn("⚠️ Alternative API call also failed:", retryError);
      }
    }

    // Update generation status
    localStorage.setItem(
      "personaGenerationStatus",
      apiStored ? "completed" : "completed_local"
    );
    localStorage.setItem("personaGenerationTime", new Date().toISOString());

    // Show appropriate notification
    if (apiStored) {
      showNotification(
        "🎉 Your AI persona is ready! Your experience is now personalized.",
        "success"
      );
    } else {
      showNotification(
        "🎉 AI persona generated locally! (Backend storage pending)",
        "info"
      );
    }

    // Call completion callback to refresh dashboard
    if (onComplete) {
      onComplete();
    }

    // Clear status after 10 seconds
    setTimeout(() => {
      clearPersonaStatus();
    }, 10000);
  } catch (err) {
    console.error("❌ Failed to generate persona:", err);
    localStorage.setItem("personaGenerationStatus", "failed");
    showNotification(
      "❌ Failed to generate persona. You can try again later.",
      "error"
    );

    // Call completion callback even on error to refresh dashboard
    if (onComplete) {
      onComplete();
    }

    // Clear status after 10 seconds
    setTimeout(() => {
      clearPersonaStatus();
    }, 10000);
  }
};

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
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialHandles, setSocialHandles] = useState({
    instagram: "",
    linkedin: "",
    twitter: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingPlatform, setLoadingPlatform] = useState<null | string>(null);
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [platformData, setPlatformData] = useState<Record<string, any[]>>({});

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

  // Periodically check for persona generation status and refresh dashboard
  useEffect(() => {
    const checkPersonaStatus = () => {
      const status = localStorage.getItem("personaGenerationStatus");
      if (
        status === "completed" ||
        status === "completed_local" ||
        status === "failed"
      ) {
        // Refresh dashboard to show updated social handles
        fetchDashboard();
        // Clear the status after a short delay
        setTimeout(() => {
          clearPersonaStatus();
        }, 2000);
      }
    };

    // Check immediately
    checkPersonaStatus();

    // Set up interval to check every 3 seconds
    const interval = setInterval(checkPersonaStatus, 3000);

    return () => clearInterval(interval);
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
      await fetchDashboard(); // Refresh dashboard data
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

  const handleConnect = async (
    platform: "instagram" | "linkedin" | "twitter"
  ) => {
    const handleValue = socialHandles[platform];
    if (!handleValue) return;

    try {
      setLoadingPlatform(platform);

      let data: any[] = [];

      if (platform === "instagram") {
        data = await scrapeInstagram(handleValue);
      } else if (platform === "linkedin") {
        data = await scrapeLinkedIn(handleValue);
      } else if (platform === "twitter") {
        data = await scrapeTwitter(handleValue);
      }

      console.log(`✅ ${platform} scrape result:`, data);

      // Store platform data
      setPlatformData((prev) => ({ ...prev, [platform]: data }));

      setConnected((prev) => ({ ...prev, [platform]: true }));
    } catch (err) {
      console.error(`❌ Error scraping ${platform}:`, err);
      showNotification(
        `❌ Failed to connect ${platform}. Please check the username and try again.`,
        "error"
      );
    } finally {
      setLoadingPlatform(null);
    }
  };

  const handleGeneratePersona = async () => {
    setIsGenerating(true);

    try {
      const platform = socialHandles.instagram
        ? "Instagram"
        : socialHandles.linkedin
        ? "LinkedIn"
        : "Twitter";

      const username =
        socialHandles.instagram ||
        socialHandles.linkedin ||
        socialHandles.twitter ||
        "";

      const profileData = platformData[platform.toLowerCase()] || [];

      // Update user with social handles immediately
      await updateUser({
        social_handles: socialHandles,
      });

      // Show immediate notification
      showNotification(
        "🚀 Generating your personalized AI persona in the background...",
        "info"
      );

      // Start background persona generation
      if (user?.user_id) {
        generatePersonaInBackground(
          platform,
          username,
          profileData,
          user.user_id,
          fetchDashboard
        );
      }

      // Close modal immediately
      setShowSocialModal(false);
      setSocialHandles({ instagram: "", linkedin: "", twitter: "" });
      setConnected({});
      setPlatformData({});

      // Refresh dashboard data
      await fetchDashboard();
    } catch (err) {
      console.error("❌ Failed to start persona generation:", err);
      showNotification(
        "❌ Failed to start persona generation. Please try again.",
        "error"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteSocial = async (platform: string) => {
    try {
      // Get current social handles from dashboard
      const currentHandles = dashboard?.data?.profile?.social_handles || {};
      const updatedHandles = { ...currentHandles };

      // Get the username for the platform being deleted
      const deletedUsername =
        currentHandles[platform as keyof typeof currentHandles];

      // Remove the specific platform
      delete updatedHandles[platform as keyof typeof updatedHandles];

      // If no social handles left, set to null or empty object based on server preference
      const finalHandles =
        Object.keys(updatedHandles).length === 0 ? null : updatedHandles;

      // Get user ID
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      console.log("🔄 Deleting social handle:", {
        userId,
        platform,
        deletedUsername,
        finalHandles,
      });

      // Step 1: Delete persona for this platform if username exists
      let personaDeleted = false;
      if (deletedUsername) {
        try {
          const personaResponse = await deleteUserPersonas(userId, platform);
          console.log("✅ Persona deletion response:", personaResponse.data);

          // Check if personas were actually deleted (0 is okay if no personas existed)
          if (personaResponse.data.success) {
            personaDeleted = true;
            console.log("✅ Persona deletion successful");
          } else {
            console.warn("⚠️ No personas found to delete for this platform");
          }
        } catch (personaError) {
          console.warn(
            "⚠️ Failed to delete persona, continuing with social handles update:",
            personaError
          );
        }
      }

      // Step 2: Update user's social handles
      let response;
      try {
        // Try direct database update first (bypasses Pydantic validation)
        const socialHandlesData =
          finalHandles === null
            ? {}
            : {
                instagram: finalHandles.instagram || null,
                linkedin: finalHandles.linkedin || null,
                twitter: finalHandles.twitter || null,
              };

        response = await updateUserSocialHandlesDirect(
          userId,
          socialHandlesData
        );
        console.log("✅ Social handles updated successfully:", response.data);
      } catch (apiError) {
        console.error("❌ Direct update failed:", apiError);

        // Try the general user update endpoint
        try {
          const updateData =
            finalHandles === null
              ? {}
              : {
                  social_handles: {
                    instagram: finalHandles.instagram || null,
                    linkedin: finalHandles.linkedin || null,
                    twitter: finalHandles.twitter || null,
                  },
                };

          response = await updateUserById(userId, updateData);
          console.log("✅ General endpoint successful:", response.data);
        } catch (fallbackError) {
          console.error("❌ General endpoint also failed:", fallbackError);

          // Try with empty social handles
          try {
            response = await updateUserById(userId, {
              social_handles: {},
            });
            console.log(
              "✅ Empty social handles update successful:",
              response.data
            );
          } catch (finalError) {
            console.error("❌ All attempts failed:", finalError);

            // TEMPORARY WORKAROUND: Update local state only
            console.log(
              "⚠️ Using temporary local-only update due to backend issue"
            );

            // Update local user state with the new social handles
            const currentUser = user || {};
            const updatedUser = {
              ...currentUser,
              social_handles: finalHandles,
            };

            // Update local state
            updateUser(updatedUser);

            // Force refresh dashboard data to reflect changes
            await fetchDashboard();

            // Also update the dashboard state directly to ensure UI updates
            if (dashboard?.data?.profile) {
              setDashboard((prev: any) => ({
                ...prev,
                data: {
                  ...prev.data,
                  profile: {
                    ...prev.data.profile,
                    social_handles: finalHandles,
                  },
                },
              }));
            } else {
              // If dashboard data isn't available, force a re-render
              setTimeout(() => {
                fetchDashboard();
              }, 100);
            }

            // Show warning notification
            showNotification(
              `⚠️ ${platform} removed locally (backend update pending)`,
              "info"
            );

            // Force a re-render to ensure UI updates
            setTimeout(() => {
              fetchDashboard();
            }, 500);

            return; // Exit early since we handled it locally
          }
        }
      }

      // Update local user state if successful
      if (response.data.data) {
        updateUser(response.data.data);
      }

      // Show success notification
      const successMessage = personaDeleted
        ? `✅ ${platform} account and persona removed successfully`
        : `✅ ${platform} account removed successfully (no persona found)`;
      showNotification(successMessage, "success");

      // Refresh dashboard to show updated data
      await fetchDashboard();

      // Force UI update by updating dashboard state directly
      if (dashboard?.data?.profile) {
        setDashboard((prev: any) => ({
          ...prev,
          data: {
            ...prev.data,
            profile: {
              ...prev.data.profile,
              social_handles: finalHandles,
            },
          },
        }));
      }
    } catch (err) {
      console.error("❌ Failed to delete social handle:", err);
      showNotification(
        `❌ Failed to remove ${platform} account. Please try again.`,
        "error"
      );
    }
  };

  const SocialRow = ({
    icon,
    label,
    value,
    platform,
    onDelete,
  }: {
    icon: JSX.Element;
    label: string;
    value: string;
    platform: string;
    onDelete: (platform: string) => void;
  }) => (
    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div className="flex items-center space-x-3">
        {icon}
        <span className="text-white font-medium">{label}</span>
      </div>
      <div className="flex items-center space-x-3">
        <span className="text-slate-400 text-sm font-mono">{value}</span>
        <button
          onClick={() => onDelete(platform)}
          className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors"
          title={`Delete ${label} account`}
        >
          <Trash2 className="w-3 h-3 text-red-400" />
        </button>
      </div>
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
                  <span className="font-medium">
                    {dashboard?.data?.profile?.email || "-"}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span className="font-medium">
                    {dashboard?.data?.profile.country_code}{" "}
                    {dashboard?.data?.profile?.phone || "-"}
                  </span>
                </div>
                {dashboard?.data?.profile?.age && (
                  <div className="flex items-center space-x-3 text-slate-300">
                    <User className="w-4 h-4 text-amber-400" />
                    <span className="font-medium">
                      Age: {dashboard.data.profile.age}
                    </span>
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
                <div className={`p-3 rounded-xl ${item.bg}`}>{item.icon}</div>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-1">
                  {item.value}
                </p>
                <p className="text-slate-400 text-sm font-medium">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connected Accounts */}
          <div className="bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-400/20 rounded-lg">
                  <Activity className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Connected Accounts
                </h3>
              </div>
              <button
                onClick={() => setShowSocialModal(true)}
                className="p-2 bg-amber-400/20 hover:bg-amber-400/30 rounded-lg transition-colors border border-amber-400/30"
                title="Add social account"
              >
                <Plus className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            <div className="space-y-3">
              {dashboard?.data?.profile?.social_handles?.instagram && (
                <SocialRow
                  icon={<Instagram className="w-5 h-5 text-pink-400" />}
                  label="Instagram"
                  value={dashboard.data.profile.social_handles.instagram}
                  platform="instagram"
                  onDelete={handleDeleteSocial}
                />
              )}

              {dashboard?.data?.profile?.social_handles?.linkedin && (
                <SocialRow
                  icon={<Linkedin className="w-5 h-5 text-blue-400" />}
                  label="LinkedIn"
                  value={dashboard.data.profile.social_handles.linkedin}
                  platform="linkedin"
                  onDelete={handleDeleteSocial}
                />
              )}

              {dashboard?.data?.profile?.social_handles?.twitter && (
                <SocialRow
                  icon={<Twitter className="w-5 h-5 text-sky-400" />}
                  label="Twitter"
                  value={dashboard.data.profile.social_handles.twitter}
                  platform="twitter"
                  onDelete={handleDeleteSocial}
                />
              )}

              {!dashboard?.data?.profile?.social_handles?.instagram &&
                !dashboard?.data?.profile?.social_handles?.linkedin &&
                !dashboard?.data?.profile?.social_handles?.twitter && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-slate-400 font-medium">
                      No social accounts connected
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                      Connect your social media accounts
                    </p>
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
              <h3 className="text-xl font-bold text-white">Recent Tickets</h3>
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
                  <p className="text-slate-400 font-medium">
                    No recent activity
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                    Your activity will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-slate-800 rounded-2xl p-8 w-96 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">
                Delete Account?
              </h2>
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
              <h2 className="text-xl font-bold text-white mb-6">
                Edit Profile
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Name
                  </label>
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    defaultValue={dashboard?.data?.profile?.email || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Age
                  </label>
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    defaultValue={`${
                      dashboard?.data?.profile?.country_code || ""
                    }${dashboard?.data?.profile?.phone || ""}`}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
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

        {/* Social Setup Modal */}
        {showSocialModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-slate-800 rounded-2xl p-8 w-96 border border-slate-700 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Connect Social Account
                </h2>
                <button
                  onClick={() => {
                    setShowSocialModal(false);
                    // Reset modal state when closing
                    setSocialHandles({
                      instagram: "",
                      linkedin: "",
                      twitter: "",
                    });
                    setConnected({});
                    setPlatformData({});
                  }}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Instagram */}
                <div>
                  <label className="flex items-center text-slate-300 text-sm font-medium mb-3">
                    <Instagram className="w-5 h-5 mr-2 text-pink-400" />
                    Instagram Handle
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={socialHandles.instagram}
                      onChange={(e) =>
                        setSocialHandles((prev) => ({
                          ...prev,
                          instagram: e.target.value,
                        }))
                      }
                      className="flex-1 p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                      placeholder="@yourusername"
                    />
                    <button
                      className="ml-3 px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 rounded-lg text-slate-900 font-semibold transition disabled:opacity-50"
                      onClick={() => handleConnect("instagram")}
                      disabled={
                        !socialHandles.instagram ||
                        loadingPlatform === "instagram"
                      }
                    >
                      {connected.instagram
                        ? "Connected"
                        : loadingPlatform === "instagram"
                        ? "Connecting..."
                        : "Connect"}
                    </button>
                  </div>
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="flex items-center text-slate-300 text-sm font-medium mb-3">
                    <Linkedin className="w-5 h-5 mr-2 text-blue-400" />
                    LinkedIn Profile
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={socialHandles.linkedin}
                      onChange={(e) =>
                        setSocialHandles((prev) => ({
                          ...prev,
                          linkedin: e.target.value,
                        }))
                      }
                      className="flex-1 p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                      placeholder="linkedin.com/in/yourprofile"
                    />
                    <button
                      className="ml-3 px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 rounded-lg text-slate-900 font-semibold transition disabled:opacity-50"
                      onClick={() => handleConnect("linkedin")}
                      disabled={
                        !socialHandles.linkedin ||
                        loadingPlatform === "linkedin"
                      }
                    >
                      {connected.linkedin
                        ? "Connected"
                        : loadingPlatform === "linkedin"
                        ? "Connecting..."
                        : "Connect"}
                    </button>
                  </div>
                </div>

                {/* Twitter */}
                <div>
                  <label className="flex items-center text-slate-300 text-sm font-medium mb-3">
                    <Twitter className="w-5 h-5 mr-2 text-sky-400" />
                    Twitter Handle
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={socialHandles.twitter}
                      onChange={(e) =>
                        setSocialHandles((prev) => ({
                          ...prev,
                          twitter: e.target.value,
                        }))
                      }
                      className="flex-1 p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                      placeholder="@yourusername"
                    />
                    <button
                      className="ml-3 px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 rounded-lg text-slate-900 font-semibold transition disabled:opacity-50"
                      onClick={() => handleConnect("twitter")}
                      disabled={
                        !socialHandles.twitter || loadingPlatform === "twitter"
                      }
                    >
                      {connected.twitter
                        ? "Connected"
                        : loadingPlatform === "twitter"
                        ? "Connecting..."
                        : "Connect"}
                    </button>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-slate-900/30 border border-slate-600 rounded-lg p-4">
                  <p className="text-slate-300 text-sm">
                    <span className="text-amber-400">
                      AI Persona Generation:
                    </span>{" "}
                    We'll analyze your public profiles to understand your style,
                    preferences, and lifestyle to provide hyper-personalized
                    recommendations.
                  </p>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGeneratePersona}
                  disabled={
                    isGenerating ||
                    (!socialHandles.instagram &&
                      !socialHandles.linkedin &&
                      !socialHandles.twitter)
                  }
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                      <span>Generating your AI persona...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Persona</span>
                    </>
                  )}
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
