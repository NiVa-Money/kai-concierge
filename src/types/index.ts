export interface User {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  socialHandles?: {
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
  isOpsTeam?: boolean;
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
