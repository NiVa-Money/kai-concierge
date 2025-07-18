import React, { useState } from "react";
import { ChevronDown, ChevronUp, Clock, User, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import { Ticket } from "../../api";

interface TicketProgressProps {
  ticket: Ticket;
  hideHeader?: boolean;
  disableInternalScroll?: boolean;
}

interface ProgressSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  timestamp: string;
  status: "completed" | "in_progress" | "pending" | "hidden";
}

const TicketProgress: React.FC<TicketProgressProps> = ({ ticket, hideHeader = false, disableInternalScroll = false }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
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
  const getProgressStageTitle = (stage: { name?: string; stageId?: string }) => {
    return stage.name || stage.stageId || "Unknown Stage";
  };

  const getProgressStageIcon = (stage: { name?: string }) => {
    const stageName = stage.name?.toLowerCase() || "";
    
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

  const getProgressStageContent = (stage: { description?: string; name?: string; stageId?: string }) => {
    return stage.description || `Stage: ${stage.name || stage.stageId}`;
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
    if (ticket.stages && ticket.stages.length > 0) {
      // Use dynamic stages from ticket
      return ticket.stages
        .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
        .map((stage: { stageId: string; name?: string; description?: string; status?: string }): ProgressSection => ({
          id: stage.stageId,
          title: getProgressStageTitle(stage),
          icon: getProgressStageIcon(stage),
          content: getProgressStageContent(stage),
          timestamp: new Date(ticket.created_at).toLocaleString(), // Use creation time as fallback
          status: getProgressStageStatus(stage)
        }));
    } else {
      // Fallback to basic stages for tickets without dynamic stages
      const basicStages: ProgressSection[] = [
        {
          id: "created",
          title: "Ticket Created",
          icon: <Clock className="w-4 h-4" />,
          content: `Ticket ${ticket.ticket_id} was created with the following request: "${ticket.client_message}"`,
          timestamp: new Date(ticket.created_at).toLocaleString(),
          status: "completed"
        }
      ];
      
      // Add current stage if it's not "created"
      const currentStage = ticket.current_stage || "created";
      if (currentStage !== "created") {
        basicStages.push({
          id: currentStage,
          title: currentStage.charAt(0).toUpperCase() + currentStage.slice(1),
          icon: <CheckCircle className="w-4 h-4" />,
          content: `Current stage: ${currentStage}`,
          timestamp: new Date(ticket.created_at).toLocaleString(),
          status: (ticket.status === "completed" ? "completed" : "in_progress") as "completed" | "in_progress"
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

  return (
    <div className={hideHeader ? "" : "bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4"}>
      {!hideHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Ticket Progress</h3>
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
      )}
      
      <div className={`space-y-4 ${!expandedSections.has("ticket_progress") && !disableInternalScroll ? "max-h-48 overflow-hidden" : ""}`}>
      
      {progressSections.map((section, index) => {
        const isExpanded = expandedSections.has(section.id);
        const hasMoreContent = hasMultipleLines(section.content);
        
        // Skip hidden sections
        if (section.status === "hidden") {
          return null;
        }
        
        return (
          <div key={section.id} className="relative">
            {/* Progress Line */}
            {index < progressSections.length - 1 && (
              <div className="absolute left-6 top-8 w-0.5 h-8 bg-slate-600"></div>
            )}
            
            <div className="flex items-start space-x-4">
              {/* Status Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                {getStatusIcon(section.status)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-white">{section.title}</h4>
                  <span className="text-xs text-slate-400">{section.timestamp}</span>
                </div>
                
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
                </div>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};

export default TicketProgress; 