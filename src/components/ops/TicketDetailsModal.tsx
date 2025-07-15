import React, { useEffect, useState } from "react";
import { X, Calendar, Phone, Mail, User } from "lucide-react";
import { Ticket } from "../../api";

type Props = {
  ticket: Ticket | null;
  onClose: () => void;
};

const TicketDetailsModal: React.FC<Props> = ({ ticket, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 10);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeModal = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={closeModal}
        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sliding Panel */}
      <div
        className={`relative z-50 w-full max-w-md bg-slate-900 text-white h-full p-6 overflow-y-auto shadow-lg transition-transform duration-300 transform ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ticket #{ticket.ticket_id}</h2>
          <button onClick={closeModal}>
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Ticket Info */}
        <div className="mb-4">
          <p className="text-sm text-slate-400">
            Status: <span className="text-white">{ticket.status}</span>
          </p>
          <p className="text-sm text-slate-400">
            Priority: <span className="text-white">{ticket.priority}</span>
          </p>
          <p className="mt-4 text-slate-300 whitespace-pre-line">
            {ticket.client_message}
          </p>
        </div>

        {/* Client Info */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Client Info</h3>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <User className="w-4 h-4" />
            {ticket.client_contact.name}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Phone className="w-4 h-4" />
            {ticket.client_contact.phone}
          </div>
          {ticket.client_contact.email && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Mail className="w-4 h-4" />
              {ticket.client_contact.email}
            </div>
          )}
        </div>

        {/* Creation Date */}
        <div className="mb-4 text-sm text-slate-400 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Created: {new Date(ticket.created_at).toLocaleString()}
        </div>

        {/* Client Preferences */}
        {ticket.client_preferences &&
          Object.keys(ticket.client_preferences).length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Client Preferences</h3>
              <ul className="text-sm text-slate-400 list-disc list-inside">
                {Object.entries(ticket.client_preferences).map(
                  ([key, value]) => (
                    <li key={key}>
                      <span className="capitalize">{key}</span>:{" "}
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

        {/* Additional Info */}
        {ticket.timeline && (
          <div className="mb-2 text-sm text-slate-400">
            <strong>Timeline:</strong> {ticket.timeline}
          </div>
        )}
        {ticket.estimated_budget && (
          <div className="mb-2 text-sm text-slate-400">
            <strong>Estimated Budget:</strong> {ticket.estimated_budget}
          </div>
        )}
        {ticket.special_instructions && (
          <div className="mb-2 text-sm text-slate-400">
            <strong>Special Instructions:</strong> {ticket.special_instructions}
          </div>
        )}
        {ticket.assigned_concierge && (
          <div className="mb-2 text-sm text-slate-400">
            <strong>Assigned Concierge:</strong> {ticket.assigned_concierge}
          </div>
        )}
        {ticket.estimated_completion && (
          <div className="mb-2 text-sm text-slate-400">
            <strong>Estimated Completion:</strong>{" "}
            {new Date(ticket.estimated_completion).toLocaleString()}
          </div>
        )}

        {/* Session Chat */}
        {/* {ticket.session_chat && (
          <div className="mt-4 text-sm text-slate-400">
            <h3 className="text-sm font-medium mb-1">Session Chat</h3>
            <div className="bg-slate-800 p-3 rounded text-xs whitespace-pre-line max-h-60 overflow-y-auto border border-slate-700">
              {ticket.session_chat}
            </div>
          </div>
        )} */}

        {/* Smart Suggestions */}
        {ticket.smart_suggestions && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2 text-slate-300">
              Smart Suggestions
            </h3>
            <div className="space-y-4 text-sm text-slate-400">
              {typeof ticket.smart_suggestions === "string" &&
                ticket.smart_suggestions
                  .split("#### ")
                  .slice(1) // Skip intro
                  .map((block: string, idx: number) => {
                    const [titleLine, ...rest] = block.trim().split("\n");
                    const contentLines = rest
                      .join("\n")
                      .split("- ")
                      .filter(Boolean);

                    // Helper to convert **bold** to <strong>bold</strong>
                    const renderWithBold = (text: string) => {
                      const parts = text.split(/(\*\*[^*]+\*\*)/g); // Split by **bold**
                      return parts.map((part, i) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                          return (
                            <strong
                              key={i}
                              className="text-white font-semibold"
                            >
                              {part.slice(2, -2)}
                            </strong>
                          );
                        }
                        return <span key={i}>{part}</span>;
                      });
                    };

                    return (
                      <div key={idx} className="mb-4">
                        <h4 className="font-semibold text-white mb-1">
                          {titleLine}
                        </h4>
                        <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                          {contentLines.map((line: string, i: number) => (
                            <li key={i}>{renderWithBold(line.trim())}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetailsModal;
