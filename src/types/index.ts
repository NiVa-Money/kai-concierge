import { PersonaResponse } from "../api/persona";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  user_id: string;
  id?: string;
  name?: string;
  age?: number | null;
  email?: string;
  avatar?: string;
  social_handles?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  persona?: {
    style?: string;
    preferences?: string[];
    profession?: string;
    lifestyle?: string[];
    tone?: string;
  };
  personaReport?: PersonaResponse; // ✅ full AI analysis here

  isOpsTeam?: boolean;

  instagramData?: any[];
  linkedinData?: any[];
  twitterData?: any[];
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: "user" | "ai";
  type: "text" | "clarification" | "confirmation";
}

export interface Ticket {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: "travel" | "dining" | "events" | "sourcing" | "scheduling" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "new" | "in_progress" | "completed" | "cancelled";
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  notes: string[];
  aiSummary: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: Message[];
  ticketId?: string;
  isActive: boolean;
  createdAt: Date;
}
