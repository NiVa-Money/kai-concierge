/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../contexts/firebaseConfig";

// Base Axios instance
const API_BASE_URL = "http://localhost:5001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =======================
// Types
// =======================

export interface SignupPayload {
  name: string;
  age?: number;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SessionPayload {
  userId: string;
  sessionId?: string;
  question: string;
  aiPersona?: string;
  persona:string;
}

export interface EndSessionPayload {
  userId: string;
  reason: string;
}

export interface UserResponse {
  name: string;
  age: number;
  email: string;
  userId: string;
}

export interface Ticket {
  _id: string;
  ticket_id: string;
  client_message: string;
  service_type: string;
  client_contact: Record<string, any>;
  priority: string;
  status: string;
  created_at: string;
  session_chat: string;
  client_preferences: Record<string, any>;
  estimated_budget: string;
  timeline: string;
  special_instructions: string;
  assigned_concierge: string | null;
  estimated_completion: string | null;
  smart_suggestions: string;
}

export interface UpdateTicketPayload {
  status?: "pending" | "in_progress" | "completed";
  priority?: "low" | "medium" | "high";
  client_message?: string;
  timeline?: string;
  estimated_budget?: string;
  special_instructions?: string;
  assigned_concierge?: string;
  client_contact?: {
    name: string;
    phone: string;
    email?: string;
  };
  estimated_completion?: string; // ISO string or null
}



export interface GoogleSignInPayload {
  name: string;
  email: string;
}

export interface GoogleSignInResponse {
  type: "login" | "signup";
  userId: string;
}

// =======================
// API Functions
// =======================

// Auth
export const signup = (data: SignupPayload) =>
  api.post<{ userId: string }>("/signup", data);

export const login = (data: LoginPayload) =>
  api.post<{ userId: string }>("/login", data);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Signed in as:", user.email);
    return user;
  } catch (err) {
    console.error("Google sign-in error:", err);
    throw err;
  }
};

export const googleSignin = (data: GoogleSignInPayload) =>
  api.post<GoogleSignInResponse>("/google-signin", data);

export const handleGoogleAuth = async (): Promise<{
  type: "login" | "signup";
  userId: string;
  name: string;
  email: string;
}> => {
  try {
    const firebaseUser = await signInWithGoogle();

    if (!firebaseUser.email || !firebaseUser.displayName) {
      throw new Error("Missing Google account information.");
    }

    const payload: GoogleSignInPayload = {
      name: firebaseUser.displayName,
      email: firebaseUser.email,
    };

    const response = await googleSignin(payload);

    return {
      type: response.data.type,
      userId: response.data.userId,
      name: firebaseUser.displayName,
      email: firebaseUser.email,
    };
  } catch (error) {
    console.error("Error during Google auth handling:", error);
    throw error;
  }
};

// User
export const getUserInfo = (userId: string) =>
  api.get<UserResponse>(`/user/${userId}`);

// Session
export const createOrUpdateSession = (data: SessionPayload) =>
  api.post("/session", data);

export const endSession = (sessionId: string, data: EndSessionPayload) =>
  api.post(`/session/${sessionId}/end`, data);

// Tickets
export const getAllTickets = () => api.get<{ tickets: Ticket[] }>("/tickets");

export const updateTicket = (ticketId: string, data: UpdateTicketPayload) =>
  api.patch<{ success: boolean }>(`/tickets/${ticketId}`, data);

// Auth Token Handling
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};
