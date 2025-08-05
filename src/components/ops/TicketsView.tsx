import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Clock,
  User,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  MessageSquare,
  Phone,
  Mail,
  Edit,
} from "lucide-react";
import { getAllTickets, filterTickets, searchTickets, Ticket } from "../../api";
import TicketDetailsModal from "./TicketDetailsModal";

const OpsDashboard: React.FC = () => {
  // const { updateTicketStatus } = useChat();
  useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  // Add state for API metadata
  const [apiMetadata, setApiMetadata] = useState<{
    total_tickets: number;
    new: number;
    in_progress: number;
    pending: number;
    completed: number;
    cancelled: number;
  } | null>(null);

  const sortTicketsByDate = (tickets: Ticket[]) =>
    tickets.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );


  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await getAllTickets();

      // Check if the response has the expected structure
      if (res.data && res.data.data && res.data.data.tickets) {
        const tickets = res.data.data.tickets;
        const metadata = res.data.data.metadata;

        const safeTickets = tickets.filter((t: Ticket) => {
          return (
            typeof t.ticket_id === "string" &&
            typeof t.client_message === "string"
          );
        });

      setTickets(sortTicketsByDate(safeTickets));


        // Set API metadata for stats
        if (metadata) {
          setApiMetadata(metadata);
          console.log("📊 API Metadata:", metadata);
        }
      } else {
        console.error("Unexpected API response structure:", res.data);
        setTickets([]);
        setApiMetadata(null);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      setTickets([]);
      setApiMetadata(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      await fetchTickets();
      return;
    }

    try {
      setIsLoading(true);
      const response = await searchTickets({
        query: query.trim(),
        fields: ["ticket_id", "client_message", "client_name", "client_email"],
        limit: 50,
        offset: 0,
      });

      if (response.data && response.data.data) {
        const searchResults = response.data.data.tickets;
        const safeTickets = searchResults.filter((t: Ticket) => {
          return (
            typeof t.ticket_id === "string" &&
            typeof t.client_message === "string"
          );
        });
       setTickets(sortTicketsByDate(safeTickets));

      }
    } catch (error) {
      console.error("Failed to search tickets:", error);
      await fetchTickets(); // Fallback to all tickets
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = async () => {
    // Build filter object based on current filter states
    const filterData: {
      limit: number;
      offset: number;
      status?: string;
      priority?: string;
      category?: string;
      assigned_concierge?: string | null;
      createdAtFrom?: string;
      createdAtTo?: string;
    } = {
      limit: 50,
      offset: 0,
    };

    // Add filters only if they're not "all"
    if (filter !== "all") {
      filterData.status = filter;
    }

    if (priorityFilter !== "all") filterData.priority = priorityFilter;
    if (serviceTypeFilter !== "all") filterData.category = serviceTypeFilter;

    // Always include assigned_concierge as null (as per working payload)
    filterData.assigned_concierge = null;

    // Format dates properly for API - using the exact working format
    if (dateFromFilter) {
      try {
        // Use the exact format from the working payload: "2025-07-20T00:00:00Z"
        const fromDate = new Date(dateFromFilter);
        if (!isNaN(fromDate.getTime())) {
          // Format as YYYY-MM-DDTHH:mm:ssZ (without milliseconds)
          const year = fromDate.getFullYear();
          const month = String(fromDate.getMonth() + 1).padStart(2, "0");
          const day = String(fromDate.getDate()).padStart(2, "0");
          filterData.createdAtFrom = `${year}-${month}-${day}T00:00:00Z`;
          console.log(
            "Date filter - From:",
            dateFromFilter,
            "→",
            filterData.createdAtFrom
          );
        }
      } catch {
        console.error("Invalid from date:", dateFromFilter);
      }
    }
    if (dateToFilter) {
      try {
        // Use the exact format from the working payload: "2025-09-25T23:59:59Z"
        const toDate = new Date(dateToFilter);
        if (!isNaN(toDate.getTime())) {
          // Format as YYYY-MM-DDTHH:mm:ssZ (without milliseconds)
          const year = toDate.getFullYear();
          const month = String(toDate.getMonth() + 1).padStart(2, "0");
          const day = String(toDate.getDate()).padStart(2, "0");
          filterData.createdAtTo = `${year}-${month}-${day}T23:59:59Z`;
          console.log(
            "Date filter - To:",
            dateToFilter,
            "→",
            filterData.createdAtTo
          );
        }
      } catch {
        console.error("Invalid to date:", dateToFilter);
      }
    }

    // Validate date range
    if (filterData.createdAtFrom && filterData.createdAtTo) {
      const fromDate = new Date(filterData.createdAtFrom);
      const toDate = new Date(filterData.createdAtTo);
      if (fromDate > toDate) {
        console.warn("From date is after to date, swapping dates");
        [filterData.createdAtFrom, filterData.createdAtTo] = [
          filterData.createdAtTo,
          filterData.createdAtFrom,
        ];
      }
    }

    // If no filters are applied, fetch all tickets
    if (Object.keys(filterData).length === 3) {
      // Only has limit, offset, and assigned_concierge
      await fetchTickets();
      return;
    }

    try {
      setIsLoading(true);
      console.log("Sending filter data:", filterData);
      const response = await filterTickets(filterData);

      if (response.data && response.data.data) {
        const filterResults = response.data.data.tickets;
        const safeTickets = filterResults.filter((t: Ticket) => {
          return (
            typeof t.ticket_id === "string" &&
            typeof t.client_message === "string"
          );
        });

       setTickets(sortTicketsByDate(safeTickets));

      }
    } catch (error) {
      console.error("Failed to filter tickets:", error);
      await fetchTickets(); // Fallback to all tickets
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle filter changes
  useEffect(() => {
    handleFilter();
  }, [filter, priorityFilter, serviceTypeFilter, dateFromFilter, dateToFilter]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const clearAllFilters = () => {
    setFilter("all");
    setPriorityFilter("all");
    setServiceTypeFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
    setSearchTerm("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500";
      case "in_progress":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const calculateProgress = (ticket: Ticket) => {
    // Use dynamic stages from ticket if available
    if (ticket.stages && ticket.stages.length > 0) {
      const completedStages = ticket.stages.filter(
        (stage: { status: string }) => stage.status === "completed"
      ).length;
      const totalStages = ticket.stages.length;

      // Calculate progress based on completed stages
      const progressPercentage = (completedStages / totalStages) * 100;

      return Math.min(progressPercentage, 100);
    }

    // Fallback to old logic for tickets without stages
    const currentStage = ticket.current_stage || "created";
    const allStages = [
      "created",
      "assigned",
      "research",
      "execution",
      "completed",
    ];
    const currentIndex = allStages.indexOf(currentStage);

    // Calculate progress percentage
    const progressPercentage = ((currentIndex + 1) / allStages.length) * 100;

    return Math.min(progressPercentage, 100);
  };

  const getCurrentStageName = (ticket: Ticket) => {
    // Debug logging to see what data we have
    console.log("🔍 Getting stage name for ticket:", ticket.ticket_id, {
      currentStage: ticket.currentStage,
      current_stage: ticket.current_stage,
      stages: ticket.stages,
      progress: ticket.progress,
      status: ticket.status,
    });

    // First, try to get stage name from progress array (most reliable)
    if (ticket.progress && ticket.progress.length > 0) {
      // Find the current stage from progress array
      const currentProgress = ticket.progress.find(
        (item) => item.status === "in_progress" || item.status === "active"
      );

      if (currentProgress && currentProgress.stageName) {
        console.log(
          "✅ Found current stage from progress:",
          currentProgress.stageName
        );
        return currentProgress.stageName;
      }

      // If no active stage in progress, find the next stage after completed ones
      const completedProgress = ticket.progress.filter(
        (item) => item.status === "completed"
      );

      if (completedProgress.length > 0) {
        // Find the next stage after the last completed stage
        const lastCompleted = completedProgress[completedProgress.length - 1];
        const nextStage = ticket.progress.find(
          (item) => item.stageId === getNextStageId(lastCompleted.stageId)
        );

        if (nextStage && nextStage.stageName) {
          console.log(
            "✅ Found next stage after completed:",
            nextStage.stageName
          );
          return nextStage.stageName;
        }
      }

      // If still not found, use the last stage in progress array
      const lastProgress = ticket.progress[ticket.progress.length - 1];
      if (lastProgress && lastProgress.stageName) {
        console.log(
          "✅ Using last stage from progress:",
          lastProgress.stageName
        );
        return lastProgress.stageName;
      }
    }

    // Fallback to stages array
    if (ticket.stages && ticket.stages.length > 0) {
      // Try to find the current stage by stageId
      if (ticket.currentStage) {
        const currentStage = ticket.stages.find(
          (stage: { stageId: string }) => stage.stageId === ticket.currentStage
        );

        if (currentStage && currentStage.name) {
          console.log("✅ Found current stage by stageId:", currentStage.name);
          return currentStage.name;
        }
      }

      // If not found by stageId, find the active/in-progress stage
      const activeStage = ticket.stages.find(
        (stage: { status: string }) =>
          stage.status === "in_progress" || stage.status === "active"
      );

      if (activeStage && activeStage.name) {
        console.log("✅ Found active stage:", activeStage.name);
        return activeStage.name;
      }

      // If no active stage, find the next stage after completed ones
      const completedStages = ticket.stages.filter(
        (stage: { status: string }) => stage.status === "completed"
      );

      if (completedStages.length > 0) {
        // Find the next stage after the last completed stage
        const lastCompletedStage = completedStages[completedStages.length - 1];
        const nextStage = ticket.stages.find(
          (stage: { order: number }) =>
            stage.order === lastCompletedStage.order + 1
        );

        if (nextStage && nextStage.name) {
          console.log("✅ Found next stage after completed:", nextStage.name);
          return nextStage.name;
        }
      }

      // If still not found, return the first stage name
      if (ticket.stages[0] && ticket.stages[0].name) {
        console.log("✅ Using first stage:", ticket.stages[0].name);
        return ticket.stages[0].name;
      }
    }

    // Fallback based on ticket status - only for tickets without stages
    switch (ticket.status) {
      case "new":
        return "New Request";
      case "pending":
        return "Pending Review";
      case "in_progress":
        return "Processing"; // More generic than "In Progress"
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Initial Stage";
    }
  };

  // Helper function to get next stage ID
  const getNextStageId = (currentStageId: string) => {
    const stageMap: { [key: string]: string } = {
      stage_1: "stage_2",
      stage_2: "stage_3",
      stage_3: "stage_4",
      stage_4: "stage_5",
      stage_5: "stage_6",
    };
    return stageMap[currentStageId] || currentStageId;
  };

  const statusCounts = {
    new: apiMetadata?.new || 0,
    pending: apiMetadata?.pending || 0, // Using pending directly
    in_progress: apiMetadata?.in_progress || 0,
    completed: apiMetadata?.completed || 0,
    cancelled: apiMetadata?.cancelled || 0,
  };

  // Debug logging for status counts
  console.log("📊 API Metadata:", apiMetadata);
  console.log("📊 Status Counts (from API):", statusCounts);
  console.log(
    "📋 All tickets statuses:",
    tickets.map((t) => ({
      id: t.ticket_id,
      status: t.status, // Assuming status is directly available on the ticket object
      currentStage: t.currentStage,
      stages: t.stages?.length || 0,
    }))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tickets</h1>
          <p className="text-slate-400">Concierge operations overview</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Filters</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200"
              >
                <Filter className="w-4 h-4" />
                <span>{showAdvancedFilters ? "Hide" : "Advanced"} Filters</span>
              </button>
              <button
                onClick={clearAllFilters}
                className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-all duration-200"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Basic Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900/50 border border-slate-600 rounded px-3 py-1 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-900/50 border border-slate-600 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-sm">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-900/50 border border-slate-600 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t border-slate-700 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 text-sm">Service Type:</span>
                  <select
                    value={serviceTypeFilter}
                    onChange={(e) => setServiceTypeFilter(e.target.value)}
                    className="bg-slate-900/50 border border-slate-600 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 flex-1"
                  >
                    <option value="all">All Services</option>
                    <option value="travel">Travel</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="dining">Dining</option>
                    <option value="shopping">Shopping</option>
                    <option value="health">Health & Wellness</option>
                    <option value="events">Events</option>
                    <option value="transportation">Transportation</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 text-sm">From:</span>
                  <input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    className="bg-slate-900/50 border border-slate-600 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 text-sm">To:</span>
                  <input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                    className="bg-slate-900/50 border border-slate-600 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl text-white mb-2">Loading tickets...</h3>
              <p className="text-slate-400">
                Please wait while we fetch the data.
              </p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl text-white mb-2">No tickets found</h3>
              <p className="text-slate-400">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search terms or filters"
                  : "New client requests will appear here"}
              </p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket._id}
                className={`backdrop-blur-lg border rounded-lg p-4 hover:border-amber-400/50 transition-colors cursor-pointer ${
                  ticket.status === "completed"
                    ? "bg-green-900/30 border-green-600/50 hover:border-green-500/50"
                    : "bg-slate-800/50 border-slate-700"
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        ticket.status
                      )}`}
                    ></div>
                    <span
                      className={`font-medium ${
                        ticket.status === "completed"
                          ? "text-green-400"
                          : "text-white"
                      }`}
                    >
                      {ticket.ticket_id}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-medium ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority.toUpperCase()}
                    </span>
                    <button className="text-slate-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Progress</span>
                    <span className="text-xs text-green-400 font-medium">
                      {Math.round(calculateProgress(ticket))}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${calculateProgress(ticket)}%` }}
                    ></div>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-slate-400 font-medium">
                      {(() => {
                        const stageName = getCurrentStageName(ticket);
                        console.log(
                          "🎯 Stage name for ticket",
                          ticket.ticket_id,
                          ":",
                          stageName
                        );
                        return stageName;
                      })()}
                    </span>
                  </div>
                </div>

                <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                  {ticket.client_message}
                </p>

                <div className="text-xs text-slate-400 mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-3 h-3" />
                    <span>{ticket.client_contact?.name || "Unknown"}</span>
                  </div>
                  {ticket.client_contact?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3" />
                      <span>{ticket.client_contact.phone}</span>
                    </div>
                  )}
                  {ticket.client_contact?.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3 h-3" />
                      <span>{ticket.client_contact.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Created:{" "}
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-3 h-3" />
                    <span>{ticket.session_chat ? 1 : 0}</span>
                  </div>
                </div>

                {/* Updated Date - Always show if updated_at exists */}
                {ticket.updated_at && (
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Edit className="w-3 h-3" />
                      <span>
                        Updated:{" "}
                        {new Date(ticket.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(ticket.updated_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Fallback: Show created date as updated if no updated_at */}
                {!ticket.updated_at && (
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Edit className="w-3 h-3" />
                      <span>
                        Updated:{" "}
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(ticket.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* <div className="mt-3 pt-3 border-t border-slate-600">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">Status:</span>
                    <select
                      value={ticket.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateTicketStatus(ticket._id, e.target.value);
                      }}
                      className="bg-slate-900/50 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div> */}
              </div>
            ))
          )}
        </div>

        {selectedTicket && (
          <TicketDetailsModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onUpdate={fetchTickets}
          />
        )}
      </div>
    </div>
  );
};

export default OpsDashboard;
