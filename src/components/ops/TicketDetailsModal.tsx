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
import { X, Calendar, Phone, Mail, User, ChevronDown, ChevronUp } from "lucide-react";
import { updateTicket, Ticket } from "../../api";
import TicketProgress from "./TicketProgress";

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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([
    'ticket_details',
    'client_info', 
    'service_details',
    'assignment_completion'
  ]));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

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
        className={`relative z-50 w-full max-w-md bg-slate-900 text-white h-full shadow-lg transition-transform duration-300 transform ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold">
            Ticket #{ticketData.ticket_id.length > 20 ? `${ticketData.ticket_id.substring(0, 20)}...` : ticketData.ticket_id}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditMode((prev) => !prev)}
              className="p-2 rounded-full hover:bg-slate-700 transition-colors"
              title={editMode ? "Cancel Edit" : "Edit Ticket"}
            >
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button onClick={closeModal}>
              <X className="w-5 h-5 text-slate-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 pb-20 overflow-y-auto" style={{ height: 'calc(100vh - 20px)' }}>

        {/* Ticket Details - Glassmorphism Container */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Ticket Details</h3>
            <button
              onClick={() => toggleSection("ticket_details")}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              {expandedSections.has("ticket_details") ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Show more
                </>
              )}
            </button>
          </div>
          {expandedSections.has("ticket_details") ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-400">
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
                      className="ml-2 bg-slate-700 text-white border border-slate-600 rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    <span className="text-white">{ticketData.status}</span>
                  )}
                </div>

                <div className="text-sm text-slate-400">
                  Priority:{" "}
                  {editMode ? (
                    <select
                      value={ticketData.priority}
                      onChange={(e) =>
                        setTicketData((prev) => (
                          { ...prev, priority: e.target.value as "low" | "medium" | "high" }
                        ))
                      }
                      className="ml-2 bg-slate-700 text-white border border-slate-600 rounded px-2 py-1"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  ) : (
                    <span className="text-white">{ticketData.priority}</span>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2">
                  <span className="text-sm text-slate-400">Client Message:</span>
                </div>
                {editMode ? (
                  <textarea
                    value={ticketData.client_message}
                    onChange={(e) =>
                      setTicketData((prev) => ({
                        ...prev,
                        client_message: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                    rows={3}
                  />
                ) : (
                  <div className="text-slate-300 text-sm whitespace-pre-line">
                    {ticketData.client_message}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-sm mt-2">
              Click "Show more" to view ticket details...
            </div>
          )}
        </div>

        {/* Client Info - Glassmorphism Container */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Client Info</h3>
            <button
              onClick={() => toggleSection("client_info")}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              {expandedSections.has("client_info") ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Show more
                </>
              )}
            </button>
          </div>
          {expandedSections.has("client_info") ? (
            <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <User className="w-4 h-4" />
              <span className="text-white">{ticketData.client_contact?.name || 'Unknown'}</span>
            </div>
            {ticketData.client_contact?.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="w-4 h-4" />
                <a 
                  href={`tel:${ticketData.client_contact.phone}`}
                  className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  {ticketData.client_contact.phone}
                </a>
              </div>
            )}
            {ticketData.client_contact?.email && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="w-4 h-4" />
                <a 
                  href={`mailto:${ticketData.client_contact.email}`}
                  className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  {ticketData.client_contact.email}
                </a>
              </div>
            )}
            {/* Creation Date */}
        <div className="mb-4 text-sm text-slate-400 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Created: {new Date(ticketData.created_at).toLocaleString()}
        </div>
            </div>
          ) : (
            <div className="text-slate-400 text-sm mt-2">
              Click "Show more" to view client information...
            </div>
          )}
        </div>

        

        {/* Service Details - Glassmorphism Container */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Service Details</h3>
            <button
              onClick={() => toggleSection("service_details")}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              {expandedSections.has("service_details") ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Show more
                </>
              )}
            </button>
          </div>
          {expandedSections.has("service_details") ? (
            <div className="space-y-2 text-sm">
            {ticketData.timeline && (
              <div className="text-slate-400">
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
                    className="ml-2 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
                  />
                ) : (
                  <span className="text-white">{ticketData.timeline}</span>
                )}
              </div>
            )}

            {ticketData.service_type && (
              <div className="text-slate-400">
                <strong>Service Type:</strong>{" "}
                {editMode ? (
                  <input
                    type="text"
                    value={ticketData.service_type}
                    onChange={(e) =>
                      setTicketData((prev) => ({
                        ...prev,
                        service_type: e.target.value,
                      }))
                    }
                    className="ml-2 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
                  />
                ) : (
                  <span className="text-white">{ticketData.service_type}</span>
                )}
              </div>
            )}

            {ticketData.special_instructions && (
              <div className="text-slate-400">
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
                    className="ml-2 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
                  />
                ) : (
                  <span className="text-white">{ticketData.special_instructions}</span>
                )}
              </div>
            )}

            {ticketData.estimated_budget && (
              <div className="text-slate-400">
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
                    className="ml-2 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
                  />
                ) : (
                  <span className="text-white">{ticketData.estimated_budget}</span>
                )}
              </div>
            )}
            </div>
          ) : (
            <div className="text-slate-400 text-sm mt-2">
              Click "Show more" to view service details...
            </div>
          )}
        </div>

        {/* Assignment & Completion - Glassmorphism Container */}
        {(ticketData.assigned_concierge || ticketData.estimated_completion) && (
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Assignment & Completion</h3>
              <button
                onClick={() => toggleSection("assignment_completion")}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {expandedSections.has("assignment_completion") ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Show more
                  </>
                )}
              </button>
            </div>
            {expandedSections.has("assignment_completion") ? (
              <div className="space-y-2">
                {/* Assigned Concierge */}
                {ticketData.assigned_concierge && (
                  <div className="text-sm text-slate-400">
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
                  <div className="text-sm text-slate-400">
                    <strong>Estimated Completion:</strong>{" "}
                    {new Date(ticketData.estimated_completion).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-400 text-sm mt-2">
                Click "Show more" to view assignment details...
              </div>
            )}
          </div>
        )}

        {/* Smart Suggestions - Glassmorphism Container */}
        {ticketData.smart_suggestions && (
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Smart Suggestions</h3>
              {!editMode && (
                <button
                  onClick={() => toggleSection("smart_suggestions")}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {expandedSections.has("smart_suggestions") ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      Show more
                    </>
                  )}
                </button>
              )}
            </div>
            {editMode ? (
              <textarea
                value={ticketData.smart_suggestions}
                onChange={(e) =>
                  setTicketData((prev) => ({
                    ...prev,
                    smart_suggestions: e.target.value,
                  }))
                }
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                rows={4}
                placeholder="Enter smart suggestions with HTML links..."
              />
            ) : (
              <div>
                {expandedSections.has("smart_suggestions") ? (
                  <div 
                    className="space-y-2 text-sm text-slate-300 smart-suggestions"
                    dangerouslySetInnerHTML={{ 
                      __html: ticketData.smart_suggestions
                        .split(/\d+\.\s+/) // Split on "1. ", "2. ", etc.
                        .filter((s) => s.trim() !== "")
                        .map((line, i) => `<div class="mb-2"><strong>${i + 1}.</strong> ${line.trim()}</div>`)
                        .join('')
                    }}
                  />
                ) : (
                  <div>
                    <div 
                      className="space-y-2 text-sm text-slate-300 smart-suggestions max-h-16 overflow-hidden"
                      dangerouslySetInnerHTML={{ 
                        __html: ticketData.smart_suggestions
                          .split(/\d+\.\s+/) // Split on "1. ", "2. ", etc.
                          .filter((s) => s.trim() !== "")
                          .slice(0, 1) // Show only first suggestion
                          .map((line, i) => `<div class="mb-2"><strong>${i + 1}.</strong> ${line.trim()}</div>`)
                          .join('')
                      }}
                    />
                    <div className="text-slate-400 text-sm mt-2">
                      Click "Show more" to view all smart suggestions...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Ticket Progress */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4 mb-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Ticket Progress</h3>
            <button
              onClick={() => toggleSection("ticket_progress")}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              {expandedSections.has("ticket_progress") ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Show more
                </>
              )}
            </button>
          </div>
          {expandedSections.has("ticket_progress") ? (
            <div className="mt-2 max-h-96 overflow-y-auto">
              <TicketProgress ticket={ticketData} hideHeader={true} disableInternalScroll={true} />
            </div>
          ) : (
            <div className="text-slate-400 text-sm mt-2">
              Click "Show more" to view ticket progress...
            </div>
          )}
        </div>
        </div>

        {/* Floating Action Buttons - Fixed at bottom */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-60">
          <div className="flex justify-center space-x-3">
            {/* Cancel Button (only in edit mode) */}
            {editMode && (
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-full shadow-lg hover:bg-slate-500 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-medium">Cancel</span>
              </button>
            )}

            {/* Save Button (only in edit mode) */}
            {editMode && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black rounded-full shadow-lg hover:bg-green-400 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">{isSaving ? "Saving..." : "Save"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;
