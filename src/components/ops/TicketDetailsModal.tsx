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
      if (e.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeModal = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for slide-out animation
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

      {/* Sliding panel */}
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

        {/* Modal Content */}
        <div className="mb-4">
          <p className="text-sm text-slate-400">
            Status: <span className="text-white">{ticket.status}</span>
          </p>
          <p className="text-sm text-slate-400">
            Priority: <span className="text-white">{ticket.priority}</span>
          </p>
          <p className="mt-4 text-slate-300">{ticket.client_message}</p>
        </div>

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

        <div className="text-sm text-slate-400 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Created: {new Date(ticket.created_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;
