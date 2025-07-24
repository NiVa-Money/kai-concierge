import React, { useState } from "react";
import { ChevronDown, ChevronUp, Clock, User, MessageSquare, CheckCircle, AlertCircle, Play, Square, Edit3, X } from "lucide-react";
import { Ticket, updateTicketStage } from "../../api";

interface TicketProgressProps {
  ticket: Ticket;
  hideHeader?: boolean;
  disableInternalScroll?: boolean;
  onUpdate?: () => void;
}

interface ProgressSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  timestamp: string;
  status: "completed" | "in_progress" | "pending" | "hidden";
  stageId?: string;
  stageName?: string;
  description?: string;
}

interface NotePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
  stageName: string;
}

const NotePopup: React.FC<NotePopupProps> = ({ isOpen, onClose, onSubmit, stageName }) => {
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(note);
    setNote("");
    onClose();
  };

  const handleCancel = () => {
    setNote("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Complete Stage</h3>
              <p className="text-sm text-slate-400">{stageName}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Add a completion note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe what was completed, any important details, or next steps..."
              className="w-full h-32 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Stage</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TicketProgress: React.FC<TicketProgressProps> = ({ ticket, hideHeader = false, disableInternalScroll = false, onUpdate }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);
  const [ticketData, setTicketData] = useState<Ticket>(ticket);
  const [showNotePopup, setShowNotePopup] = useState(false);
  const [currentStageToNote, setCurrentStageToNote] = useState("");

  // Update local state when ticket prop changes
  React.useEffect(() => {
    setTicketData(ticket);
  }, [ticket]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const updateStage = async (stageId: string, stageName: string, description: string, status: string, notes?: string) => {
    try {
      setIsUpdating(true);
      
      // Ensure stageName is different from stageId and has a proper name
      const properStageName = stageName !== stageId ? stageName : `Stage ${stageId.replace('stage_', '')}`;
      
      const response = await updateTicketStage(ticket.ticket_id, {
        stageId,
        stageName: properStageName,
        description,
        status,
        notes: notes || ""
      });

      console.log('Stage updated successfully:', response.data);
      
      // Update local state to reflect the change immediately
      setTicketData(prevData => {
        if (!prevData) return prevData;
        
        return {
          ...prevData,
          stages: prevData.stages?.map(stage => {
            if (stage.stageId === stageId) {
              return {
                ...stage,
                status: status,
                description: notes ? `${description}\n\nNote: ${notes}` : description,
                updatedAt: new Date().toISOString()
              };
            }
            return stage;
          })
        };
      });
      
      // Call the update callback to refresh the ticket data
      onUpdate?.();
      
    } catch (error) {
      console.error('Failed to update ticket stage:', error);
      alert('Failed to update ticket stage. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteTicket = async () => {
    const stageId = "stage_5";
    const stageName = "Ticket Reservation and Hold";
    const description = "Place a hold or reservation on the identified F1 tickets to secure availability while awaiting client payment confirmation. Ensure all tickets are grouped together if possible.";
    const status = "completed";
    
    const note = prompt("Add a completion note (optional):");
    const notes = note || "";
    
    await updateStage(stageId, stageName, description, status, notes);
  };

  const handleStartProgress = async () => {
    const stageId = "stage_2";
    const stageName = "Research and Availability Check";
    const description = "Researching available options and checking availability for the requested service.";
    const status = "in_progress";
    
    await updateStage(stageId, stageName, description, status);
  };

  const handleUpdateStage = async (section: ProgressSection, newStatus: "completed" | "in_progress") => {
    if (!section.stageId || !section.stageName) return;
    
    const status = newStatus;
    const description = section.description || section.content;
    
    // If completing a stage, show note popup
    if (newStatus === "completed") {
      setCurrentStageToNote(section.stageName || section.title);
      setShowNotePopup(true);
      return; // Wait for popup to close and update
    }
    
    // For non-completion actions, update immediately
    await updateStage(section.stageId, section.stageName, description, status);
  };

  const handleNoteSubmit = async (note: string) => {
    // Find the section that was being completed
    const section = progressSections.find(s => s.stageName === currentStageToNote);
    if (section && section.stageId && section.stageName) {
      const description = section.description || section.content;
      await updateStage(section.stageId, section.stageName, description, "completed", note);
    }
    setShowNotePopup(false);
    setCurrentStageToNote("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "in_progress":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-slate-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  // Create progress sections based on dynamic stages from ticket
  const getProgressStageTitle = (stage: { name?: string; stageName?: string; stageId?: string }) => {
    return stage.stageName || stage.name || stage.stageId || "Unknown Stage";
  };

  const getProgressStageIcon = (stage: { name?: string; stageName?: string }) => {
    const stageName = (stage.stageName || stage.name || "").toLowerCase();
    
    if (stageName.includes("consultation") || stageName.includes("initial")) {
      return <Clock className="w-4 h-4" />;
    } else if (stageName.includes("research") || stageName.includes("availability")) {
      return <MessageSquare className="w-4 h-4" />;
    } else if (stageName.includes("review") || stageName.includes("selection")) {
      return <User className="w-4 h-4" />;
    } else if (stageName.includes("booking") || stageName.includes("confirmation")) {
      return <CheckCircle className="w-4 h-4" />;
    } else if (stageName.includes("coordination") || stageName.includes("support")) {
      return <CheckCircle className="w-4 h-4" />;
    } else {
      return <Clock className="w-4 h-4" />;
    }
  };

  const getProgressStageContent = (stage: { description?: string; name?: string; stageName?: string; stageId?: string }) => {
    return stage.description || `Stage: ${stage.stageName || stage.name || stage.stageId}`;
  };

  const getProgressStageStatus = (stage: { status?: string }): "completed" | "in_progress" | "pending" | "hidden" => {
    const status = stage.status || "pending";
    if (status === "completed" || status === "in_progress" || status === "pending" || status === "hidden") {
      return status;
    }
    return "pending";
  };

  // Get stages from ticket or fallback to basic stages
  const getStages = (): ProgressSection[] => {
    if (ticketData.stages && ticketData.stages.length > 0) {
      // Use dynamic stages from ticket
      return ticketData.stages
        .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
        .map((stage: { stageId: string; name?: string; stageName?: string; description?: string; status?: string }): ProgressSection => ({
          id: stage.stageId,
          title: getProgressStageTitle(stage),
          icon: getProgressStageIcon(stage),
          content: getProgressStageContent(stage),
          timestamp: new Date(ticketData.created_at).toLocaleString(),
          status: getProgressStageStatus(stage),
          stageId: stage.stageId,
          stageName: stage.stageName || stage.name || stage.stageId, // Prioritize stageName from API
          description: stage.description
        }));
    } else {
      // Fallback to basic stages for tickets without dynamic stages
      const basicStages: ProgressSection[] = [
        {
          id: "created",
          title: "Ticket Created",
          icon: <Clock className="w-4 h-4" />,
          content: `Ticket ${ticketData.ticket_id} was created with the following request: "${ticketData.client_message}"`,
          timestamp: new Date(ticketData.created_at).toLocaleString(),
          status: "completed",
          stageId: "stage_1",
          stageName: "Ticket Created",
          description: "Initial ticket creation and request processing"
        }
      ];
      
      // Add current stage if it's not "created"
      const currentStage = ticketData.current_stage || "created";
      if (currentStage !== "created") {
        basicStages.push({
          id: currentStage,
          title: currentStage.charAt(0).toUpperCase() + currentStage.slice(1),
          icon: <CheckCircle className="w-4 h-4" />,
          content: `Current stage: ${currentStage}`,
          timestamp: new Date(ticketData.created_at).toLocaleString(),
          status: (ticketData.status === "completed" ? "completed" : "in_progress") as "completed" | "in_progress",
          stageId: "stage_2",
          stageName: currentStage.charAt(0).toUpperCase() + currentStage.slice(1),
          description: `Processing ${currentStage} stage`
        });
      }
      
      return basicStages;
    }
  };
  
  // Create progress sections based on actual progress data
  const progressSections: ProgressSection[] = getStages();

  const hasMultipleLines = (content: string) => {
    return content.split('\n').length > 1;
  };

  const getFirstLine = (content: string) => {
    return content.split('\n')[0];
  };

  const isTicketCompleted = ticketData.status === "completed" || progressSections.some(section => section.status === "completed");

  return (
    <div className={`${disableInternalScroll ? '' : 'max-h-96 overflow-y-auto'}`}>
      {!hideHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Ticket Progress</h3>
          <div className="flex items-center space-x-2">
            {!isTicketCompleted && (
              <>
                <button
                  onClick={handleStartProgress}
                  disabled={isUpdating}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 rounded-lg transition-all duration-200 border border-blue-400/20 hover:border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-3 h-3" />
                  Start Progress
                </button>
                <button
                  onClick={handleCompleteTicket}
                  disabled={isUpdating}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-green-400 hover:text-green-300 bg-green-400/10 hover:bg-green-400/20 rounded-lg transition-all duration-200 border border-green-400/20 hover:border-green-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Square className="w-3 h-3" />
                  Complete Ticket
                </button>
              </>
            )}
            {isUpdating && (
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-amber-400"></div>
                <span>Updating...</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {progressSections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const hasMoreContent = hasMultipleLines(section.content);
          const hasNote = section.description || section.content; // Notes are now part of description or content

          return (
            <div
              key={section.id}
              className={`p-4 rounded-lg border ${
                section.status === "completed"
                  ? "bg-green-400/5 border-green-400/20"
                  : section.status === "in_progress"
                  ? "bg-yellow-400/5 border-yellow-400/20"
                  : "bg-slate-800/50 border-slate-700"
              }`}
            >
              {/* Stage Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getStatusIcon(section.status)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{section.title}</h4>
                    <span className="text-xs text-slate-400">{section.timestamp}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                {section.stageId && (
                  <div className="flex items-center space-x-1">
                    {section.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleUpdateStage(section, "in_progress")}
                          disabled={isUpdating}
                          className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-yellow-400 hover:text-yellow-300 bg-yellow-400/10 hover:bg-yellow-400/20 rounded transition-all duration-200 border border-yellow-400/20 hover:border-yellow-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Play className="w-2 h-2" />
                          Start
                        </button>
                        <button
                          onClick={() => handleUpdateStage(section, "completed")}
                          disabled={isUpdating}
                          className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-green-400 hover:text-green-300 bg-green-400/10 hover:bg-green-400/20 rounded transition-all duration-200 border border-green-400/20 hover:border-green-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="w-2 h-2" />
                          Complete
                        </button>
                      </>
                    )}
                    {section.status === "in_progress" && (
                      <button
                        onClick={() => handleUpdateStage(section, "completed")}
                        disabled={isUpdating}
                        className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-green-400 hover:text-green-300 bg-green-400/10 hover:bg-green-400/20 rounded transition-all duration-200 border border-green-400/20 hover:border-green-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-2 h-2" />
                        Complete
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Stage Content */}
              <div className="text-sm text-slate-300">
                {hasMoreContent ? (
                  <div>
                    <div className="mb-1">{getFirstLine(section.content)}</div>
                    {isExpanded && (
                      <div className="mt-2 text-slate-400 whitespace-pre-line">
                        {section.content.split('\n').slice(1).join('\n')}
                      </div>
                    )}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1"
                    >
                      {isExpanded ? (
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
                ) : (
                  <div className="whitespace-pre-line">{section.content}</div>
                )}
                
                {/* Stage Notes */}
                {hasNote && (
                  <div className="mt-3 p-2 bg-blue-400/10 border border-blue-400/20 rounded text-xs text-blue-300">
                    <div className="flex items-center space-x-1 mb-1">
                      <Edit3 className="w-3 h-3" />
                      <span className="font-medium">Note:</span>
                    </div>
                    <p className="whitespace-pre-line">{hasNote}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

             <NotePopup
         isOpen={showNotePopup}
         onClose={() => setShowNotePopup(false)}
         onSubmit={handleNoteSubmit}
         stageName={currentStageToNote}
       />
    </div>
  );
};

export default TicketProgress; 