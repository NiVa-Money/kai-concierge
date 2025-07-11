/* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { Chrome } from 'lucide-react';

// const LoginPage: React.FC = () => {
//   const { loginWithGoogle, isLoading } = useAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleGoogleLogin = async () => {
//     await loginWithGoogle();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-light text-white mb-2">
//             kai<span className="text-amber-400">°</span>
//           </h1>
//           <p className="text-slate-400 text-sm">Ultra-premium concierge service</p>
//         </div>

//         <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-8 shadow-2xl">
//           <div className="space-y-6">
//             <div>
//               <label className="block text-slate-300 text-sm font-medium mb-2">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
//                 placeholder="Enter your email"
//               />
//             </div>

//             <div>
//               <label className="block text-slate-300 text-sm font-medium mb-2">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
//                 placeholder="Enter your password"
//               />
//             </div>

//             <button
//               onClick={handleGoogleLogin}
//               disabled={isLoading}
//               className="w-full bg-white hover:bg-gray-100 text-slate-900 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
//             >
//               <Chrome className="w-5 h-5" />
//               <span>Continue with Google</span>
//             </button>

//             <div className="text-center">
//               <p className="text-slate-400 text-sm">
//                 Exclusive access for verified members
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="mt-8 text-center text-slate-500 text-xs">
//           <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Chrome } from "lucide-react";
import { getUserInfo, login, signInWithGoogle } from "../../api";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const { isLoading, updateUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const firebaseUser = await signInWithGoogle();
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error("Google sign-in failed");
      }

      // Send Firebase user.email to backend to fetch user profile
      const userId = firebaseUser.uid;
      localStorage.setItem("userId", userId);

      const profile = await getUserInfo(userId);
      updateUser(profile.data);
      navigate("/social-setup");
    } catch (err: any) {
      console.error("Google login error:", err);
      setError("Google login failed. Please try again.");
    }
  };

  const handleEmailLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await login({ email, password });
      const userId = response.data.userId;
      localStorage.setItem("userId", userId);

      // Fetch complete user profile
      const profile = await getUserInfo(userId);
      updateUser(profile.data); // now matches Partial<User>

      navigate("/social-setup");
    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-white mb-2">
            kai<span className="text-amber-400">°</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Ultra-premium concierge service
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleEmailLogin}
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Continue with Email"}
            </button>

            <div className="flex items-center justify-center gap-2">
              <hr className="w-full border-slate-600" />
              <span className="text-slate-400 text-sm">or</span>
              <hr className="w-full border-slate-600" />
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-100 text-slate-900 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Chrome className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>

            <button
              onClick={() => (window.location.href = "/signup")}
              className="w-full border border-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
            >
              Create an Account
            </button>

            <div className="text-center">
              <p className="text-slate-400 text-sm">
                Exclusive access for verified members
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-500 text-xs">
          <p>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
