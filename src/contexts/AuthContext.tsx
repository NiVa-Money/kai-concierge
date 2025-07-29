// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";
// import { User } from "../types";
// import { login as loginApi, getUserInfo } from "../api";

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
//   updateUser: (user: Partial<User>) => void;
//   isLoading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // Load user from localStorage on initial load
//   useEffect(() => {
//     const storedUserId = localStorage.getItem("userId");
//     if (storedUserId) {
//       getUserInfo(storedUserId)
//         .then((res) => setUser(res.data.data))
//         .catch((err) => console.error("Failed to restore user:", err))
//         .finally(() => setIsLoading(false));
//     } else {
//       setIsLoading(false);
//     }
//   }, []);

//   // Login function
//   const login = async (email: string, password: string) => {
//     setIsLoading(true);
//     try {
//       const res = await loginApi({ email, password });
//       const userId = res.data.data.user_id; // ✅ Correct property from API response
//       localStorage.setItem("userId", userId);

//       const profileRes = await getUserInfo(userId);
//       const userData = profileRes.data.data as User; // Cast to User

//       if (!userData.user_id) {
//         userData.user_id = userId; // Ensure user_id is present
//       }

//       setUser(userData);
//     } catch (err) {
//       console.error("Login error:", err);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Logout function
//   const logout = () => {
//     setUser(null);

//     localStorage.removeItem("userId");
//   };

//   // Update user function
//   const updateUser = (updates: Partial<User>) => {
//     const merged = { ...(user || {}), ...updates };

//     // Auto-fill user_id from localStorage if missing
//     if (!merged.user_id) {
//       const storedUserId = localStorage.getItem("userId");
//       if (storedUserId) {
//         merged.user_id = storedUserId;
//       }
//     }

//     if (merged.user_id) {
//       setUser(merged as User);
//     } else {
//       console.warn("Incomplete user data, not updating:", merged);
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         login,
//         logout,
//         updateUser,
//         isLoading,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../types";
import { login as loginApi, getUserInfo } from "../api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUserId = localStorage.getItem("userId");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoading(false);
        return;
      } catch (err) {
        console.warn("Failed to parse stored user:", err);
      }
    }

    if (storedUserId) {
      // Fetch user profile if we only have userId
      getUserInfo(storedUserId)
        .then((res) => {
          const userData = res.data.data as User;
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        })
        .catch((err) => {
          console.error("Failed to restore user:", err);
          localStorage.removeItem("userId");
          localStorage.removeItem("user");
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await loginApi({ email, password });
      const userId = res.data.data.user_id;
      localStorage.setItem("userId", userId);

      const profileRes = await getUserInfo(userId);
      const userData = profileRes.data.data as User;

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
  };

  // Update user function
  const updateUser = (updates: Partial<User>) => {
    const merged = { ...(user || {}), ...updates };

    if (!merged.user_id) {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        merged.user_id = storedUserId;
      }
    }

    if (merged.user_id) {
      setUser(merged as User);
      localStorage.setItem("user", JSON.stringify(merged));
    } else {
      console.warn("Incomplete user data, not updating:", merged);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
