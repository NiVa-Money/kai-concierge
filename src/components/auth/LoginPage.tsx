// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState } from "react";
// import { useAuth } from "../../contexts/AuthContext";
// import { Chrome } from "lucide-react";
// import { getUserInfo, handleGoogleAuth, login } from "../../api";
// import { useNavigate } from "react-router-dom";

// const LoginPage: React.FC = () => {
//   const { isLoading, updateUser } = useAuth();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleGoogleLogin = async () => {
//     setError("");
//     try {
//       const result = await handleGoogleAuth();
//       localStorage.setItem("userId", result.user_id);
//       updateUser({
//         user_id: result.user_id,
//         name: result.name,
//         email: result.email,
//       });

//       if (result.type === "login") {
//         navigate("/chat"); // Old user
//       } else if (result.type === "signup") {
//         navigate("/signup", {
//           state: { name: result.name, email: result.email },
//         }); // New Google user
//       }
//     } catch (err: any) {
//       console.error("Google login error:", err);
//       setError("Google login failed. Please try again.");
//     }
//   };

//   const handleEmailLogin = async (e?: React.FormEvent) => {
//     if (e) e.preventDefault(); // prevent page reload
//     setLoading(true);
//     setError("");
//     try {
//       const response = await login({ email, password });
//       const userId = response.data.data.user_id;
//       localStorage.setItem("userId", userId);

//       const profile = await getUserInfo(userId);
//       updateUser(profile.data.data);

//       const aiPersona = localStorage.getItem("aiPersona");
//       if (aiPersona) {
//         navigate("/chat"); // Old user
//       } else {
//         navigate("/social-setup"); // New user
//       }
//     } catch (err: any) {
//       console.error(err);
//       setError("Invalid email or password");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-light text-white mb-2">
//             kai<span className="text-amber-400">°</span>
//           </h1>
//           <p className="text-slate-400 text-sm">
//             Ultra-premium concierge service
//           </p>
//         </div>

//         <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-8 shadow-2xl">
//           <form onSubmit={handleEmailLogin} className="space-y-6">
//             <div>
//               <label className="block text-slate-300 text-sm font-medium mb-2">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 autoComplete="username"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
//                 placeholder="Enter your email"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-slate-300 text-sm font-medium mb-2">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 autoComplete="current-password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
//                 placeholder="Enter your password"
//                 required
//               />
//             </div>

//             {error && (
//               <p className="text-red-500 text-sm text-center">{error}</p>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
//             >
//               {loading ? "Signing in..." : "Continue with Email"}
//             </button>
//           </form>

//           <div className="flex items-center justify-center gap-2 my-6">
//             <hr className="w-full border-slate-600" />
//             <span className="text-slate-400 text-sm">or</span>
//             <hr className="w-full border-slate-600" />
//           </div>

//           <button
//             onClick={handleGoogleLogin}
//             disabled={isLoading}
//             className="w-full bg-white hover:bg-gray-100 text-slate-900 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
//           >
//             <Chrome className="w-5 h-5" />
//             <span>Continue with Google</span>
//           </button>

//           <button
//             onClick={() => (window.location.href = "/signup")}
//             className="w-full border border-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 mt-4"
//           >
//             Create an Account
//           </button>

//           <div className="text-center mt-4">
//             <p className="text-slate-400 text-sm">
//               Exclusive access for verified members
//             </p>
//           </div>
//         </div>

//         <div className="mt-8 text-center text-slate-500 text-xs">
//           <p>
//             By continuing, you agree to our Terms of Service and Privacy Policy
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Chrome } from "lucide-react";
import { getUserInfo, handleGoogleAuth, login } from "../../api";
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
      const result = await handleGoogleAuth();
      localStorage.setItem("userId", result.user_id);
      updateUser({
        user_id: result.user_id,
        name: result.name,
        email: result.email,
      });

      if (result.type === "login") {
        // Old user -> go directly to chat
        navigate("/chat");
      } else if (result.type === "signup") {
        // New Google user -> Signup with prefilled fields
        navigate("/signup", {
          state: { fromGoogle: true, name: result.name, email: result.email },
        });
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(
        "Google login failed. Please try again. If the issue persists, try a different method."
      );
    }
  };

  const handleEmailLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await login({ email, password });
      const userId = response.data.data.user_id;
      localStorage.setItem("userId", userId);

      const profile = await getUserInfo(userId);
      updateUser(profile.data.data);

      const aiPersona = localStorage.getItem("aiPersona");
      if (aiPersona) {
        navigate("/chat");
      } else {
        navigate("/social-setup");
      }
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
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Continue with Email"}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 my-6">
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
            className="w-full border border-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 mt-4"
          >
            Create an Account
          </button>

          <div className="text-center mt-4">
            <p className="text-slate-400 text-sm">
              Exclusive access for verified members
            </p>
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
