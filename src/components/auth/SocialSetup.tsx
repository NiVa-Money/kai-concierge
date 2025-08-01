/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * SocialSetup Component
 * 
 * This component handles social media profile connection and AI persona generation.
 * 
 * Background Persona Generation Flow:
 * 1. User enters social media handles and clicks "Continue to Kai"
 * 2. User is immediately redirected to the chat interface
 * 3. Persona generation starts in the background
 * 4. User sees a status indicator in the chat interface
 * 5. When complete, user gets a notification and the status clears
 * 
 * Status Management:
 * - Uses localStorage to track generation status ('generating', 'completed', 'failed')
 * - Status is checked every 3 seconds in the chat interface
 * - Status automatically clears after 10 seconds when completed/failed
 * 
 * Notifications:
 * - Immediate notification when redirecting
 * - Success notification when persona is ready
 * - Error notification if generation fails
 */

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  scrapeInstagram,
  scrapeLinkedIn,
  scrapeTwitter,
  generatePersona,
} from "../../api/persona";
import { storePersona } from "../../api";
import { Instagram, Linkedin, Twitter, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { User } from "../../types";

// Utility functions for persona generation
const clearPersonaStatus = () => {
  localStorage.removeItem('personaGenerationStatus');
  localStorage.removeItem('personaGenerationTime');
};

// Simple notification system
const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    'bg-amber-500 text-slate-900'
  }`;
  notification.textContent = message;
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notification.classList.add('translate-x-full');
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
  userId: string
) => {
  try {
    console.log("🔄 Starting background persona generation...");
    
    // Set generation status in localStorage
    localStorage.setItem('personaGenerationStatus', 'generating');
    
    const aiPersona = await generatePersona(platform, username, profileData);
    console.log("✅ AI Persona generated:", aiPersona);
    
    // Store in localStorage
    localStorage.setItem("aiPersona", JSON.stringify(aiPersona));
    
    // Store persona in API
    await storePersona({
      userId: userId,
      platform: platform,
      username: username,
      profileData: aiPersona,
    });
    
    console.log("✅ Persona stored in API successfully");
    
    // Update generation status
    localStorage.setItem('personaGenerationStatus', 'completed');
    localStorage.setItem('personaGenerationTime', new Date().toISOString());
    
    // Show success notification
    showNotification('🎉 Your AI persona is ready! Your experience is now personalized.', 'success');
    
    // Clear status after 10 seconds
    setTimeout(() => {
      clearPersonaStatus();
    }, 10000);
    
  } catch (err) {
    console.error("❌ Failed to generate persona:", err);
    localStorage.setItem('personaGenerationStatus', 'failed');
    showNotification('❌ Failed to generate persona. You can try again later.', 'error');
    
    // Clear status after 10 seconds
    setTimeout(() => {
      clearPersonaStatus();
    }, 10000);
  }
};

const SocialSetup: React.FC = () => {
  const { user, updateUser, isLoading } = useAuth();
  const [handles, setHandles] = useState({
    instagram: "",
    linkedin: "",
    twitter: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingPlatform, setLoadingPlatform] = useState<null | string>(null);
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  
  // Effect to handle user state changes and prevent race conditions
  React.useEffect(() => {
    if (!isLoading && !user) {
      console.log("SocialSetup - No user found after loading, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [isLoading, user, navigate]);
  
  // Debug: Log user state
  console.log("SocialSetup - User state:", user);
      console.log("SocialSetup - User social handles:", user?.social_handles);
  
  // Show loading state while user is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user after loading, show loading while useEffect handles redirect
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Redirecting...</p>
        </div>
      </div>
    );
  }
  const handleConnect = async (
    platform: "instagram" | "linkedin" | "twitter"
  ) => {
    const handleValue = handles[platform];
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

      updateUser({
        [`${platform}Data`]: data,
      });

      setConnected((prev) => ({ ...prev, [platform]: true })); // ✅ set as connected
    } catch (err) {
      console.error(`❌ Error scraping ${platform}:`, err);
    } finally {
      setLoadingPlatform(null);
    }
  };

  const handleSubmit = async () => {
    setIsGenerating(true);

    try {
      const platform = handles.instagram
        ? "Instagram"
        : handles.linkedin
        ? "LinkedIn"
        : "Twitter";

      const username =
        handles.instagram || handles.linkedin || handles.twitter || "";

      const dataKey = `${platform.toLowerCase()}Data` as keyof User;
      const profileData = (user?.[dataKey] as any[]) ?? [];

                // Update user with social handles immediately
          await updateUser({
            social_handles: handles,
          });

      // Show immediate notification
      showNotification('🚀 Redirecting you to Kai while we generate your personalized AI persona...', 'info');

      // Start background persona generation
      if (user?.user_id) {
        generatePersonaInBackground(platform, username, profileData, user.user_id);
      }

      // Immediately redirect to chat
      navigate("/chat", { replace: true });
    } catch (err) {
      console.error("❌ Failed to start persona generation:", err);
      setIsGenerating(false);
      showNotification('❌ Failed to start persona generation. Please try again.', 'error');
    }
  };

  // Only redirect if user has completed social setup and has a persona
  if (
          user?.social_handles?.instagram ||
        user?.social_handles?.linkedin ||
        user?.social_handles?.twitter
  ) {
    // Check if user already has a persona, if so redirect to chat
    const aiPersona = localStorage.getItem("aiPersona");
    if (aiPersona) {
      // Clear any pending persona generation status
      clearPersonaStatus();
      navigate("/chat", { replace: true });
      return null;
    }
  }

  const inputStyle =
    "w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all";

  const connectBtnStyle =
    "ml-3 px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 rounded-lg text-slate-900 font-semibold transition disabled:opacity-50";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-white mb-2">
            Welcome to kai<span className="text-amber-400">°</span>
          </h1>
          <p className="text-slate-400">
            Let's personalize your experience by connecting your social profiles
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-8 shadow-2xl">
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
                  value={handles.instagram}
                  onChange={(e) =>
                    setHandles({ ...handles, instagram: e.target.value })
                  }
                  className={inputStyle}
                  placeholder="@yourusername"
                />
                <button
                  className={connectBtnStyle}
                  onClick={() => handleConnect("instagram")}
                  disabled={
                    !handles.instagram || loadingPlatform === "instagram"
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
                  value={handles.linkedin}
                  onChange={(e) =>
                    setHandles({ ...handles, linkedin: e.target.value })
                  }
                  className={inputStyle}
                  placeholder="linkedin.com/in/yourprofile"
                />
                <button
                  className={connectBtnStyle}
                  onClick={() => handleConnect("linkedin")}
                  disabled={!handles.linkedin || loadingPlatform === "linkedin"}
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
                  value={handles.twitter}
                  onChange={(e) =>
                    setHandles({ ...handles, twitter: e.target.value })
                  }
                  className={inputStyle}
                  placeholder="@yourusername"
                />
                <button
                  className={connectBtnStyle}
                  onClick={() => handleConnect("twitter")}
                  disabled={!handles.twitter || loadingPlatform === "twitter"}
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
                <span className="text-amber-400">AI Persona Generation:</span>{" "}
                We'll analyze your public profiles to understand your style,
                preferences, and lifestyle to provide hyper-personalized
                recommendations.
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                  <span>Generating your AI persona...</span>
                </>
              ) : (
                <>
                  <span>Continue to Kai</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Skip */}
            {/* <div className="text-center">
              <button
                onClick={() => navigate("/chat")}
                className="text-slate-400 text-sm hover:text-white transition-colors"
              >
                Skip for now
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialSetup;
