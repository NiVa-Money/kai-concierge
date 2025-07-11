/* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { Instagram, Linkedin, Twitter, ArrowRight } from 'lucide-react';

// const SocialSetup: React.FC = () => {
//   const { user, updateUser } = useAuth();
//   const [handles, setHandles] = useState({
//     instagram: '',
//     linkedin: '',
//     twitter: ''
//   });
//   const [isGenerating, setIsGenerating] = useState(false);

//   const handleSubmit = async () => {
//     setIsGenerating(true);

//     // Simulate AI persona generation
//     setTimeout(() => {
//       const aiPersona = {
//         style: 'Sophisticated, minimalist with modern luxury preferences',
//         preferences: ['Fine dining', 'Luxury travel', 'Art collecting', 'Private events'],
//         profession: 'Executive/Entrepreneur',
//         lifestyle: ['Health-conscious', 'Tech-savvy', 'Philanthropic', 'Travel enthusiast'],
//         tone: 'Professional yet approachable, values discretion'
//       };

//       updateUser({
//         socialHandles: handles,
//         persona: aiPersona
//       });

//       setIsGenerating(false);
//     }, 2000);
//   };

//   if (user?.socialHandles?.instagram || user?.socialHandles?.linkedin || user?.socialHandles?.twitter) {
//     return null; // User already completed setup
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
//       <div className="w-full max-w-lg">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-light text-white mb-2">
//             Welcome to kai<span className="text-amber-400">°</span>
//           </h1>
//           <p className="text-slate-400">
//             Let's personalize your experience by connecting your social profiles
//           </p>
//         </div>

//         <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-8 shadow-2xl">
//           <div className="space-y-6">
//             <div>
//               <label className="flex items-center text-slate-300 text-sm font-medium mb-3">
//                 <Instagram className="w-5 h-5 mr-2 text-pink-400" />
//                 Instagram Handle
//               </label>
//               <input
//                 type="text"
//                 value={handles.instagram}
//                 onChange={(e) => setHandles({...handles, instagram: e.target.value})}
//                 className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
//                 placeholder="@yourusername"
//               />
//             </div>

//             <div>
//               <label className="flex items-center text-slate-300 text-sm font-medium mb-3">
//                 <Linkedin className="w-5 h-5 mr-2 text-blue-400" />
//                 LinkedIn Profile
//               </label>
//               <input
//                 type="text"
//                 value={handles.linkedin}
//                 onChange={(e) => setHandles({...handles, linkedin: e.target.value})}
//                 className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
//                 placeholder="linkedin.com/in/yourprofile"
//               />
//             </div>

//             <div>
//               <label className="flex items-center text-slate-300 text-sm font-medium mb-3">
//                 <Twitter className="w-5 h-5 mr-2 text-sky-400" />
//                 Twitter Handle
//               </label>
//               <input
//                 type="text"
//                 value={handles.twitter}
//                 onChange={(e) => setHandles({...handles, twitter: e.target.value})}
//                 className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
//                 placeholder="@yourusername"
//               />
//             </div>

//             <div className="bg-slate-900/30 border border-slate-600 rounded-lg p-4">
//               <p className="text-slate-300 text-sm">
//                 <span className="text-amber-400">AI Persona Generation:</span> We'll analyze your public profiles to understand your style, preferences, and lifestyle to provide hyper-personalized recommendations.
//               </p>
//             </div>

//             <button
//               onClick={handleSubmit}
//               disabled={isGenerating}
//               className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
//             >
//               {isGenerating ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
//                   <span>Generating your AI persona...</span>
//                 </>
//               ) : (
//                 <>
//                   <span>Continue to Kai</span>
//                   <ArrowRight className="w-5 h-5" />
//                 </>
//               )}
//             </button>

//             <div className="text-center">
//               <button
//                 onClick={() => updateUser({ socialHandles: {} })}
//                 className="text-slate-400 text-sm hover:text-white transition-colors"
//               >
//                 Skip for now
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SocialSetup;

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  scrapeInstagram,
  scrapeLinkedIn,
  scrapeTwitter,
  generatePersona,
} from "../../api/persona";
import { Instagram, Linkedin, Twitter, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SocialSetup: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [handles, setHandles] = useState({
    instagram: "",
    linkedin: "",
    twitter: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingPlatform, setLoadingPlatform] = useState<null | string>(null);

  const navigate = useNavigate();
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

      const profileData = user?.[`${platform.toLowerCase()}Data`] ?? [];

      const aiPersona = await generatePersona(platform, username, profileData);

      updateUser({
        socialHandles: handles,
        persona: aiPersona,
      });

      navigate("/", { replace: true });
    } catch (err) {
      console.error("❌ Failed to generate persona:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (
    user?.socialHandles?.instagram ||
    user?.socialHandles?.linkedin ||
    user?.socialHandles?.twitter
  ) {
    return null;
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
                  {loadingPlatform === "instagram"
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
                  {loadingPlatform === "linkedin" ? "Connecting..." : "Connect"}
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
                  {loadingPlatform === "twitter" ? "Connecting..." : "Connect"}
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
            <div className="text-center">
              <button
                onClick={() => updateUser({ socialHandles: {} })}
                className="text-slate-400 text-sm hover:text-white transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialSetup;
