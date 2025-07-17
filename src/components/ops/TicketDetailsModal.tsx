// import React, { useEffect, useState } from "react";
// import { X, Calendar, Phone, Mail, User } from "lucide-react";
// import { Ticket } from "../../api";

// type Props = {
//   ticket: Ticket | null;
//   onClose: () => void;
// };

// const TicketDetailsModal: React.FC<Props> = ({ ticket, onClose }) => {
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     const timeout = setTimeout(() => setIsVisible(true), 10);

//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") closeModal();
//     };

//     document.addEventListener("keydown", handleKeyDown);

//     return () => {
//       clearTimeout(timeout);
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, []);

//   const closeModal = () => {
//     setIsVisible(false);
//     setTimeout(onClose, 300); // Wait for animation
//   };

//   if (!ticket) return null;

//   return (
//     <div className="fixed inset-0 z-40 flex justify-end">
//       {/* Backdrop */}
//       <div
//         onClick={closeModal}
//         className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${
//           isVisible ? "opacity-100" : "opacity-0"
//         }`}
//       />

//       {/* Sliding Panel */}
//       <div
//         className={`relative z-50 w-full max-w-md bg-slate-900 text-white h-full p-6 overflow-y-auto shadow-lg transition-transform duration-300 transform ${
//           isVisible ? "translate-x-0" : "translate-x-full"
//         }`}
//       >
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">Ticket #{ticket.ticket_id}</h2>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => alert("Edit functionality goes here")}
//               className="text-sm px-3 py-1 bg-amber-500 text-black rounded hover:bg-amber-400 transition-colors"
//             >
//               Edit
//             </button>
//             <button onClick={closeModal}>
//               <X className="w-5 h-5 text-slate-400 hover:text-white" />
//             </button>
//           </div>
//         </div>

//         {/* Ticket Info */}
//         <div className="mb-4">
//           <p className="text-sm text-slate-400">
//             Status: <span className="text-white">{ticket.status}</span>
//           </p>
//           <p className="text-sm text-slate-400">
//             Priority: <span className="text-white">{ticket.priority}</span>
//           </p>
//           <p className="mt-4 text-slate-300 whitespace-pre-line">
//             {ticket.client_message}
//           </p>
//         </div>

//         {/* Client Info */}
//         <div className="mb-4">
//           <h3 className="text-sm font-medium mb-2">Client Info</h3>
//           <div className="flex items-center gap-2 text-sm text-slate-400">
//             <User className="w-4 h-4" />
//             {ticket.client_contact.name}
//           </div>
//           <div className="flex items-center gap-2 text-sm text-slate-400">
//             <Phone className="w-4 h-4" />
//             {ticket.client_contact.phone}
//           </div>
//           {ticket.client_contact.email && (
//             <div className="flex items-center gap-2 text-sm text-slate-400">
//               <Mail className="w-4 h-4" />
//               {ticket.client_contact.email}
//             </div>
//           )}
//         </div>

//         {/* Creation Date */}
//         <div className="mb-4 text-sm text-slate-400 flex items-center gap-2">
//           <Calendar className="w-4 h-4" />
//           Created: {new Date(ticket.created_at).toLocaleString()}
//         </div>

//         {/* Client Preferences */}
//         {ticket.client_preferences &&
//           Object.keys(ticket.client_preferences).length > 0 && (
//             <div className="mb-4">
//               <h3 className="text-sm font-medium mb-2">Client Preferences</h3>
//               <ul className="text-sm text-slate-400 list-disc list-inside">
//                 {Object.entries(ticket.client_preferences).map(
//                   ([key, value]) => (
//                     <li key={key}>
//                       <span className="capitalize">{key}</span>:{" "}
//                       {Array.isArray(value) ? value.join(", ") : String(value)}
//                     </li>
//                   )
//                 )}
//               </ul>
//             </div>
//           )}

//         {/* Additional Info */}
//         {ticket.timeline && (
//           <div className="mb-2 text-sm text-slate-400">
//             <strong>Timeline:</strong> {ticket.timeline}
//           </div>
//         )}
//         {ticket.estimated_budget && (
//           <div className="mb-2 text-sm text-slate-400">
//             <strong>Estimated Budget:</strong> {ticket.estimated_budget}
//           </div>
//         )}
//         {ticket.special_instructions && (
//           <div className="mb-2 text-sm text-slate-400">
//             <strong>Special Instructions:</strong> {ticket.special_instructions}
//           </div>
//         )}
//         {ticket.assigned_concierge && (
//           <div className="mb-2 text-sm text-slate-400">
//             <strong>Assigned Concierge:</strong> {ticket.assigned_concierge}
//           </div>
//         )}
//         {ticket.estimated_completion && (
//           <div className="mb-2 text-sm text-slate-400">
//             <strong>Estimated Completion:</strong>{" "}
//             {new Date(ticket.estimated_completion).toLocaleString()}
//           </div>
//         )}

//         {/* Session Chat */}
//         {/* {ticket.session_chat && (
//           <div className="mt-4 text-sm text-slate-400">
//             <h3 className="text-sm font-medium mb-1">Session Chat</h3>
//             <div className="bg-slate-800 p-3 rounded text-xs whitespace-pre-line max-h-60 overflow-y-auto border border-slate-700">
//               {ticket.session_chat}
//             </div>
//           </div>
//         )} */}

// {/* Smart Suggestions */}
// {ticket.smart_suggestions && (
//   <div className="mt-6">
//     <h3 className="text-sm font-medium mb-2 text-slate-300">
//       Smart Suggestions
//     </h3>
//     <div className="space-y-4 text-sm text-slate-400">
//       {typeof ticket.smart_suggestions === "string" &&
//         ticket.smart_suggestions
//           .split("#### ")
//           .slice(1) // Skip intro
//           .map((block: string, idx: number) => {
//             const [titleLine, ...rest] = block.trim().split("\n");
//             const contentLines = rest
//               .join("\n")
//               .split("- ")
//               .filter(Boolean);

//             // Helper to convert **bold** to <strong>bold</strong>
//             const renderWithBold = (text: string) => {
//               const parts = text.split(/(\*\*[^*]+\*\*)/g); // Split by **bold**
//               return parts.map((part, i) => {
//                 if (part.startsWith("**") && part.endsWith("**")) {
//                   return (
//                     <strong
//                       key={i}
//                       className="text-white font-semibold"
//                     >
//                       {part.slice(2, -2)}
//                     </strong>
//                   );
//                 }
//                 return <span key={i}>{part}</span>;
//               });
//             };

//             return (
//               <div key={idx} className="mb-4">
//                 <h4 className="font-semibold text-white mb-1">
//                   {titleLine}
//                 </h4>
//                 <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
//                   {contentLines.map((line: string, i: number) => (
//                     <li key={i}>{renderWithBold(line.trim())}</li>
//                   ))}
//                 </ul>
//               </div>
//             );
//           })}
//     </div>
//   </div>
// )}
//       </div>
//     </div>
//   );
// };

// export default TicketDetailsModal;

import React, { useEffect, useState } from "react";
import { X, Calendar, Phone, Mail, User } from "lucide-react";
import { updateTicket, Ticket } from "../../api";

type Props = {
  ticket: Ticket | null;
  onClose: () => void;
  onUpdate?: () => void;
};

const TicketDetailsModal: React.FC<Props> = ({ ticket, onClose, onUpdate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ticketData, setTicketData] = useState<Ticket>(ticket!);

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
    setTimeout(onClose, 300);
  };

  if (!ticket) return null;

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const payload = {
        status: ticketData.status as "pending" | "in_progress",
        priority: ticketData.priority as "low" | "medium" | "high",
        client_message: ticketData.client_message ?? "",
        timeline: ticketData.timeline ?? "",
        estimated_budget: ticketData.estimated_budget ?? "",
        special_instructions: ticketData.special_instructions ?? "",
        assigned_concierge: ticketData.assigned_concierge ?? "",
        estimated_completion: ticketData.estimated_completion ?? "",
        smart_suggestions: ticketData.smart_suggestions ?? "",
      };

      await updateTicket(ticket.ticket_id, payload);
      setEditMode(false);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update ticket:", error);
      alert("Failed to update ticket.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        onClick={closeModal}
        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative z-50 w-full max-w-md bg-slate-900 text-white h-full p-6 overflow-y-auto shadow-lg transition-transform duration-300 transform ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Ticket #{ticketData.ticket_id}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditMode((prev) => !prev)}
              className="text-sm px-3 py-1 bg-amber-500 text-black rounded hover:bg-amber-400 transition-colors"
            >
              {editMode ? "Cancel" : "Edit"}
            </button>
            {editMode && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="text-sm px-3 py-1 bg-green-500 text-black rounded hover:bg-green-400 transition-colors"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            )}
            <button onClick={closeModal}>
              <X className="w-5 h-5 text-slate-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="text-sm text-slate-400 space-y-2 mb-4">
          <div>
            Status:{" "}
            {editMode ? (
              <select
                value={ticketData.status}
                onChange={(e) =>
                  setTicketData((prev) => ({
                    ...prev,
                    status: e.target.value as
                      | "pending"
                      | "in_progress"
                      | "completed",
                  }))
                }
                className="ml-2 bg-slate-800 text-white border border-slate-600 rounded px-2 py-1"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            ) : (
              <span className="text-white">{ticketData.status}</span>
            )}
          </div>

          <div>
            Priority:{" "}
            {editMode ? (
              <select
                value={ticketData.priority}
                onChange={(e) =>
                  setTicketData((prev) => ({
                    ...prev,
                    priority: e.target.value as "low" | "medium" | "high",
                  }))
                }
                className="ml-2 bg-slate-800 text-white border border-slate-600 rounded px-2 py-1"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            ) : (
              <span className="text-white">{ticketData.priority}</span>
            )}
          </div>

          <div>
            Client Message:
            {editMode ? (
              <textarea
                value={ticketData.client_message}
                onChange={(e) =>
                  setTicketData((prev) => ({
                    ...prev,
                    client_message: e.target.value,
                  }))
                }
                className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white"
              />
            ) : (
              <p className="text-slate-300 whitespace-pre-line mt-1">
                {ticketData.client_message}
              </p>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Client Info</h3>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <User className="w-4 h-4" />
            {ticketData.client_contact.name}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Phone className="w-4 h-4" />
            {ticketData.client_contact.phone}
          </div>
          {ticketData.client_contact.email && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Mail className="w-4 h-4" />
              {ticketData.client_contact.email}
            </div>
          )}
        </div>

        {/* Creation Date */}
        <div className="mb-4 text-sm text-slate-400 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Created: {new Date(ticketData.created_at).toLocaleString()}
        </div>

        {/* Timeline */}
        {ticketData.timeline && (
          <div className="mb-2 text-sm text-slate-400">
            <strong>Timeline:</strong>{" "}
            {editMode ? (
              <input
                type="text"
                value={ticketData.timeline}
                onChange={(e) =>
                  setTicketData((prev) => ({
                    ...prev,
                    timeline: e.target.value,
                  }))
                }
                className="ml-2 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white"
              />
            ) : (
              ticketData.timeline
            )}
          </div>
        )}

        {/* Estimated Budget */}
        {ticketData.estimated_budget && (
          <div className="mb-2 text-sm text-slate-400">
            <strong>Estimated Budget:</strong>{" "}
            {editMode ? (
              <input
                type="text"
                value={ticketData.estimated_budget}
                onChange={(e) =>
                  setTicketData((prev) => ({
                    ...prev,
                    estimated_budget: e.target.value,
                  }))
                }
                className="ml-2 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white"
              />
            ) : (
              ticketData.estimated_budget
            )}
          </div>
        )}

        {/* Special Instructions */}
        {ticketData.special_instructions && (
          <div className="mb-2 text-sm text-slate-400">
            <strong>Special Instructions:</strong>{" "}
            {editMode ? (
              <input
                type="text"
                value={ticketData.special_instructions}
                onChange={(e) =>
                  setTicketData((prev) => ({
                    ...prev,
                    special_instructions: e.target.value,
                  }))
                }
                className="ml-2 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white"
              />
            ) : (
              ticketData.special_instructions
            )}
          </div>
        )}

        {/* Assigned Concierge */}
        {ticketData.assigned_concierge && (
          <div className="mb-2 text-sm text-slate-400">
            <strong>Assigned Concierge:</strong>{" "}
            {editMode ? (
              <input
                type="text"
                value={ticketData.assigned_concierge}
                onChange={(e) =>
                  setTicketData((prev) => ({
                    ...prev,
                    assigned_concierge: e.target.value,
                  }))
                }
                className="ml-2 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white"
              />
            ) : (
              ticketData.assigned_concierge
            )}
          </div>
        )}

        {/* Estimated Completion */}
        {ticketData.estimated_completion && (
          <div className="mb-2 text-sm text-slate-400">
            <strong>Estimated Completion:</strong>{" "}
            {new Date(ticketData.estimated_completion).toLocaleString()}
          </div>
        )}

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
