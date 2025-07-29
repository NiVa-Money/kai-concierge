// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState } from "react";
// import { signup } from "../../api";
// import { useNavigate, useLocation } from "react-router-dom";

// const SignupPage: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   React.useEffect(() => {
//     if (location.state) {
//       setForm((prev) => ({
//         ...prev,
//         name: location.state.name || "",
//         email: location.state.email || "",
//       }));
//     }
//   }, [location.state]);
//   const [form, setForm] = useState({
//     name: "",
//     age: "",
//     phone: "",
//     country_code: "+971",
//     email: "",
//     password: "",
//   });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async () => {
//     setError("");
//     setLoading(true);
//     try {
//       await signup({
//         name: form.name,
//         age: form.age ? parseInt(form.age) : undefined,
//         phone: form.phone || undefined,
//         country_code: form.country_code, // Send separately
//         email: form.email,
//         password: form.password,
//       });
//       navigate("/social-setup"); // redirect after signup
//     } catch (err: any) {
//       setError("Signup failed. Email might already be registered.");
//       console.error(err);
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
//           <p className="text-slate-400 text-sm">Sign up for concierge access</p>
//         </div>

//         <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-8 shadow-2xl">
//           <div className="space-y-5">
//             <input
//               type="text"
//               name="name"
//               placeholder="Full Name"
//               value={form.name}
//               onChange={handleChange}
//               className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
//             />
//             <input
//               type="number"
//               name="age"
//               placeholder="Age (optional)"
//               value={form.age}
//               onChange={handleChange}
//               className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
//             />
//             <input
//               type="text"
//               name="countryCode"
//               placeholder="+1"
//               value={form.country_code}
//               onChange={handleChange}
//               className="w-20 bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
//             />
//             <input
//               type="text"
//               name="phone"
//               placeholder="Phone Number"
//               value={form.phone}
//               onChange={handleChange}
//               className="flex-1 bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
//             />

//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               value={form.email}
//               onChange={handleChange}
//               className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
//             />
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               value={form.password}
//               onChange={handleChange}
//               className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
//             />

//             {error && (
//               <p className="text-red-500 text-sm text-center">{error}</p>
//             )}

//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
//             >
//               {loading ? "Creating account..." : "Sign Up"}
//             </button>
//           </div>
//         </div>

//         <div className="mt-6 text-center text-slate-400 text-sm">
//           <p>
//             Already have an account?{" "}
//             <a href="/login" className="text-amber-400 hover:underline">
//               Log in
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignupPage;

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { signup } from "../../api";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();
  const isGoogleSignup = Boolean(location.state?.fromGoogle);

  const [form, setForm] = useState({
    name: location.state?.name || "",
    age: "",
    phone: "",
    country_code: "+971",
    email: location.state?.email || "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await signup({
        name: form.name,
        age: form.age ? parseInt(form.age) : undefined,
        phone: form.phone || undefined,
        country_code: form.country_code,
        email: form.email,
        password: isGoogleSignup ? "" : form.password,
      });

      const userId = res.data?.data?.user_id;
      if (userId) {
        localStorage.setItem("userId", userId);

        // Update AuthContext user
        updateUser({
          user_id: userId,
          name: form.name,
          email: form.email,
        });
      }

      navigate("/social-setup");
    } catch (err: any) {
      setError("Signup failed. Email might already be registered.");
      console.error(err);
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
          <p className="text-slate-400 text-sm">Sign up for concierge access</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="space-y-5">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              type="number"
              name="age"
              placeholder="Age (optional)"
              value={form.age}
              onChange={handleChange}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              type="text"
              name="country_code"
              placeholder="+1"
              value={form.country_code}
              onChange={handleChange}
              className="w-20 bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="flex-1 bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            {!isGoogleSignup && (
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            )}

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-slate-400 text-sm">
          <p>
            Already have an account?{" "}
            <a href="/login" className="text-amber-400 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
