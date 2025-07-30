/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Message, Ticket, ChatSession } from "../types";

interface ChatContextType {
  currentSession: ChatSession | null;
  messages: Message[];
  tickets: Ticket[];
  sendMessage: (content: string) => void;
  createTicket: (title: string, description: string, type: string) => void;
  updateTicketStatus: (ticketId: string, status: string) => void;
  isTyping: boolean;
  setCurrentSession: (session: ChatSession | null) => void;
  loadSessionMessages: (sessionMessages: any[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Function to load messages from a session
  const loadSessionMessages = (sessionMessages: any[]) => {
    // Convert the session messages to the Message format
    const formattedMessages = sessionMessages.map((msg) => ({
      id: msg.id || Date.now().toString() + Math.random().toString(),
      content: msg.content,
      timestamp: new Date(msg.timestamp || Date.now()),
      sender:
        msg.role === "user" || msg.sender === "user"
          ? ("user" as const)
          : ("ai" as const),
      type: "text" as const,
    }));

    setMessages(formattedMessages);
  };

  const sendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      sender: "user",
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(content),
        timestamp: new Date(),
        sender: "ai",
        type: "text",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes("restaurant") ||
      lowerMessage.includes("dining")
    ) {
      return "I'd be delighted to help you find the perfect dining experience. To ensure I recommend something that matches your preferences, could you tell me:\n\n• What type of cuisine are you in the mood for?\n• What city or area?\n• Any dietary restrictions or preferences?\n• Preferred date and time?\n• How many guests?";
    } else if (
      lowerMessage.includes("hotel") ||
      lowerMessage.includes("accommodation")
    ) {
      return "I'll help you secure exceptional accommodation. To provide the best options, please share:\n\n• Your destination?\n• Check-in and check-out dates?\n• Number of guests?\n• Any specific amenities or preferences?\n• Budget considerations?";
    } else if (
      lowerMessage.includes("yacht") ||
      lowerMessage.includes("boat")
    ) {
      return "Excellent choice for a maritime experience. To arrange the perfect charter, I'll need:\n\n• Preferred location/waters?\n• Dates and duration?\n• Number of guests?\n• Any specific activities or amenities?\n• Crew requirements?";
    } else if (
      lowerMessage.includes("travel") ||
      lowerMessage.includes("flight")
    ) {
      return "I'll arrange your travel seamlessly. Please provide:\n\n• Departure and destination cities?\n• Travel dates?\n• Number of passengers?\n• Preferred class of service?\n• Any airline preferences?";
    } else {
      return "I understand you need assistance with that. To ensure I provide the most suitable solution, could you share a bit more detail about what you're looking for? I'm here to handle any request, no matter how unique or complex.";
    }
  };

  const createTicket = (title: string, description: string, type: string) => {
    const newTicket: Ticket = {
      id: Date.now().toString(),
      userId: "1",
      title,
      description,
      type: type as any,
      priority: "medium",
      status: "new",
      messages: messages.slice(),
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: [],
      aiSummary: `Client request: ${title}. ${description}`,
    };

    setTickets((prev) => [...prev, newTicket]);
  };

  const updateTicketStatus = (ticketId: string, status: string) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, status: status as any, updatedAt: new Date() }
          : ticket
      )
    );
  };

  return (
    <ChatContext.Provider
      value={{
        currentSession,
        messages,
        tickets,
        sendMessage,
        createTicket,
        updateTicketStatus,
        isTyping,
        setCurrentSession,
        loadSessionMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
