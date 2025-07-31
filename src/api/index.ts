/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../contexts/firebaseConfig";


// Base Axios instance 
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5002";


// const PORT = import.meta.env.VITE_API_PORT || 5002;

// const API_BASE_URL = `${BASE_URL}:${PORT}`;

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
  phone?: string;
  country_code?: string;
  email: string;
  password?: string; // Make password optional for Google auth
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

export interface SessionResponse {
  _id?: string;              // From API
  sessionId?: string;        // From API
  session_id?: string;       // Alternative name (if needed)
  userId?: string;           // From API
  user_id?: string;          // Alternative name
  isSessionEnd?: boolean;    // From API
  isTicketCreated?: boolean; // From API
  ticketId?: string | null;  // From API
  agentResponse?: string;    // From API
  status?: 'active' | 'ended';
  
  // Chat messages
  chats?: Array<{
    time: string;
    id: string;
    question: string;
    agent_response: string;
  }>;
  
  messages?: Array<{
    role: 'user' | 'ai';
    content: string;
    timestamp: string;
  }>;

  question?: string;
  persona?: string;
  ai_persona?: string;
  sessionStartAt?: string;
  sessionEndAt?: string;
  created_at?: string;
  updated_at?: string;
  user?: string;
}



export interface UserResponse {
  name: string;
  age: number;
  email: string;
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
  updated_at?: string;
  session_chat?: string;
  client_preferences?: Record<string, any>;
  estimated_budget?: string;
  timeline?: string;
  special_instructions?: string;
  assigned_concierge?: string | null;
  estimated_completion?: string | null;
  smart_suggestions?: string;
  progress?: Array<{
    stageId: string;
    stageName: string;
    description: string;
    timestamp: string;
    status: string;
    meta?: Record<string, any>;
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
  estimated_budget?: string | null;
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

export interface StorePersonaPayload {
  userId: string;
  platform: string;
  username: string;
  profileData: any;
}

// =======================
// API Functions
// =======================

// Auth
export const signup = (data: SignupPayload) => {
  // Remove password field if it's empty or undefined for Google auth
  const cleanData = { ...data };
  if (!cleanData.password) {
    delete cleanData.password;
  }
  return api.post<{ data: { user_id: string } }>("/api/v1/users/signup", cleanData);
};

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

// Session
export const createOrUpdateSession = (data: SessionPayload) =>
  api.post<{
    agentResponse: string;
    sessionId: any;
    status: string;
    ticketId(arg0: string, ticketId: any): unknown; data: SessionResponse 
}>("/api/v1/sessions/", data);

export const endSession = (sessionId: string, data: EndSessionPayload) =>
  api.post<{ data: SessionResponse }>(`/api/v1/sessions/${sessionId}/end/`, data);

export const getSessionDetails = (sessionId: string, userId?: string) => {
  const params = userId ? { user_id: userId } : {};
  console.log("getSessionDetails called with:", { sessionId, userId, params });
  return api.get<{ data: SessionResponse }>(`/api/v1/sessions/${sessionId}`, { params });
};

export const getUserSessions = (userId: string) =>
  api.get<{ 
    data: { 
      sessions: SessionResponse[];
      count: number;
      total_count: number;
      has_more: boolean;
    }
  }>(`/api/v1/sessions/user/${userId}`);

// Tickets
export const getAllTickets = () =>
  api.get<{
    success: boolean;
    message: string;
    data: {
      tickets: Ticket[];
      metadata?: {
        total_tickets: number;
        new: number;
        in_progress: number;
        pending: number;
        completed: number;
        cancelled: number;
      };
    };
  }>("/api/v1/tickets/");

// export const updateTicket = (ticketId: string, data: UpdateTicketPayload) =>
//   api.put<{ data: { ticket_id: string } }>(
//     `/api/v1/tickets/${ticketId}/`,
//     data
//   );

export const updateTicket = (ticketId: string, data: UpdateTicketPayload) => {
  // Clean numeric fields
  const cleanedData = { ...data };
  if (cleanedData.estimated_budget === "") {
    cleanedData.estimated_budget = null; // or: delete cleanedData.estimated_budget;
  }
  return api.put<{ data: { ticket_id: string } }>(
    `/api/v1/tickets/${ticketId}/`,
    cleanedData
  );
};

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

export const updateTicketStage = (
  ticketId: string,
  stageData: {
    stageId: string;
    stageName: string;
    description: string;
    status: string;
    notes?: string;
  }
) => {
  // Ensure clean payload structure
  const cleanPayload = {
    stageId: stageData.stageId,
    stageName: stageData.stageName,
    description: stageData.description,
    status: stageData.status,
    notes: stageData.notes || "",
  };

  return api.patch<{
    success: boolean;
    message: string;
    data: {
      ticket_id: string;
      stage_id: string;
    };
    timestamp: string;
  }>(`/api/v1/tickets/${ticketId}/stage`, cleanPayload);
};

export const filterTickets = (filterData: {
  status?: string;
  priority?: string;
  category?: string;
  assigned_concierge?: string | null;
  createdAtFrom?: string;
  createdAtTo?: string;
  limit?: number;
  offset?: number;
}) => {
  return api.post<{
    success: boolean;
    message: string;
    data: {
      tickets: Ticket[];
      total?: number;
      total_count?: number;
      limit?: number;
      offset?: number;
    };
    timestamp: string;
  }>("/api/v1/tickets/filter", filterData);
};

export const searchTickets = (searchData: {
  query: string;
  fields?: string[];
  limit?: number;
  offset?: number;
}) => {
  return api.post<{
    success: boolean;
    message: string;
    data: {
      tickets: Ticket[];
      total: number;
      limit: number;
      offset: number;
    };
    timestamp: string;
  }>("/api/v1/tickets/search", searchData);
};

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

// Profile APIs
export const getUserInfo = (userId: string) =>
  api.get<{ data: UserResponse }>(`/api/v1/users/${userId}/`);

export const updateUserById = (
  userId: string,
  updatedData: Partial<UserResponse>
) => api.put<{ data: UserResponse }>(`/api/v1/users/${userId}`, updatedData);

export const deleteUserById = (userId: string) =>
  api.delete<{ success: boolean }>(`/api/v1/users/${userId}`);

export const getUserDashboard = (userId: string) =>
  api.get<{ data: any }>(`/api/v1/users/${userId}/dashboard`);

// Store Persona API
export const storePersona = (data: StorePersonaPayload) =>
  api.post<{ data: { persona_id: string } }>("/api/v1/personas/", data);
