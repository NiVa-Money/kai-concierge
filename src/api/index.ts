/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../contexts/firebaseConfig";

// Base Axios instance
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://kai-fullstack-alb-1564110476.us-west-2.elb.amazonaws.com";

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
  persona: string;
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
  user_id: string;
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
  session_chat?: string;
  client_preferences?: Record<string, any>;
  estimated_budget?: string;
  timeline?: string;
  special_instructions?: string;
  assigned_concierge?: string | null;
  estimated_completion?: string | null;
  smart_suggestions?: string;
  progress?: Array<{
    stage: string;
    timestamp: string;
    meta: Record<string, any>;
  }>;
  current_stage?: string;
  currentStage?: string;
  stages?: Array<{
    stageId: string;
    name: string;
    description: string;
    order: number;
    status: string;
    estimated_duration: string;
    dependencies: string[];
  }>;
  totalStages?: number;
}

export interface UpdateTicketPayload {
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  client_message: string;
  timeline: string;
  estimated_budget: string;
  special_instructions: string;
  assigned_concierge: string;
  estimated_completion: string | null;
  smart_suggestions: string;
}

export interface GoogleSignInPayload {
  name: string;
  email: string;
}

export interface GoogleSignInResponse {
  type: "login" | "signup";
  user_id: string;
}

// =======================
// API Functions
// =======================

// Auth
export const signup = (data: SignupPayload) =>
  api.post<{ data: { user_id: string } }>("/api/v1/users/signup", data);

export const login = (data: LoginPayload) =>
  api.post<{
    user_id: any;
    data: { user_id: string };
  }>("/api/v1/users/login", data);

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
  api.post<{ data: GoogleSignInResponse }>("/api/v1/users/google-signin", data);

export const handleGoogleAuth = async (): Promise<{
  type: "login" | "signup";
  name: string;
  email: string;
  user_id: string;
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
      type: response.data.data.type,
      user_id: response.data.data.user_id,
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
  api.get<{ data: UserResponse }>(`/api/v1/users/${userId}/`);

// Session
export const createOrUpdateSession = (data: SessionPayload) =>
  api.post("/api/v1/sessions/", data);

export const endSession = (sessionId: string, data: EndSessionPayload) =>
  api.post(`/api/v1/sessions/${sessionId}/end/`, data);

// Tickets
export const getAllTickets = () =>
  api.get<{ success: boolean; message: string; data: { tickets: Ticket[] } }>(
    "/api/v1/tickets/"
  );

export const updateTicket = (ticketId: string, data: UpdateTicketPayload) =>
  api.put<{ data: { ticket_id: string } }>(
    `/api/v1/tickets/${ticketId}/`,
    data
  );

export const getTicket = (ticketId: string) =>
  api.get<{ data: Ticket }>(`/api/v1/tickets/${ticketId}/`);

export const createTicket = (ticketData: any) =>
  api.post<{ data: { ticket_id: string } }>("/api/v1/tickets/", ticketData);

export const deleteTicket = (ticketId: string) =>
  api.delete<{ data: { ticket_id: string } }>(`/api/v1/tickets/${ticketId}/`);

export const getTicketProgress = (ticketId: string) =>
  api.get<{ data: { progress: any[] } }>(
    `/api/v1/tickets/${ticketId}/progress`
  );

export const addTicketProgress = (ticketId: string, progressData: any) =>
  api.patch<{ data: { ticket_id: string } }>(
    `/api/v1/tickets/${ticketId}/progress`,
    progressData
  );

export const getSmartSuggestions = (ticketId: string) =>
  api.get<{ data: any }>(`/api/v1/tickets/${ticketId}/smart-suggestions`);

// API Documentation
export const getApiInfo = () => api.get<{ data: any }>("/api/v1/docs/");

export const getApiHealth = () => api.get<{ data: any }>("/api/v1/docs/health");

// Auth Token Handling
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};
