import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  MessageSquare,
  Phone,
  Mail,
} from "lucide-react";
import { getAllTickets, filterTickets, searchTickets, Ticket } from "../../api";
import TicketDetailsModal from "./TicketDetailsModal";

const OpsDashboard: React.FC = () => {
  // const { updateTicketStatus } = useChat();
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalTickets, setTotalTickets] = useState(0);
  
  // Additional filter states
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await getAllTickets();

      // Check if the response has the expected structure
      if (res.data && res.data.data && res.data.data.tickets) {
        const tickets = res.data.data.tickets;

        const safeTickets = tickets.filter((t: Ticket) => {
          return (
            typeof t.ticket_id === "string" &&
            typeof t.client_message === "string"
          );
        });
        setTickets(safeTickets);
        setTotalTickets(safeTickets.length);
      } else {
        console.error("Unexpected API response structure:", res.data);
        setTickets([]);
        setTotalTickets(0);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      setTickets([]);
      setTotalTickets(0);
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
        offset: 0
      });

      if (response.data && response.data.data) {
        const searchResults = response.data.data.tickets;
        const safeTickets = searchResults.filter((t: Ticket) => {
          return (
            typeof t.ticket_id === "string" &&
            typeof t.client_message === "string"
          );
        });
        setTickets(safeTickets);
        setTotalTickets(response.data.data.total);
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
      service_type?: string;
      date_from?: string;
      date_to?: string;
    } = {
      limit: 50,
      offset: 0
    };

    // Add filters only if they're not "all"
    if (filter !== "all") filterData.status = filter;
    if (priorityFilter !== "all") filterData.priority = priorityFilter;
    if (serviceTypeFilter !== "all") filterData.service_type = serviceTypeFilter;
    if (dateFromFilter) filterData.date_from = dateFromFilter;
    if (dateToFilter) filterData.date_to = dateToFilter;

    // If no filters are applied, fetch all tickets
    if (Object.keys(filterData).length === 2) { // Only has limit and offset
      await fetchTickets();
      return;
    }

    try {
      setIsLoading(true);
      const response = await filterTickets(filterData);

      if (response.data && response.data.data) {
        const filterResults = response.data.data.tickets;
        const safeTickets = filterResults.filter((t: Ticket) => {
          return (
            typeof t.ticket_id === "string" &&
            typeof t.client_message === "string"
          );
        });
        setTickets(safeTickets);
        setTotalTickets(response.data.data.total);
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
    if (ticket.stages && ticket.stages.length > 0) {
      const currentStage = ticket.stages.find(
        (stage: { stageId: string }) => stage.stageId === ticket.currentStage
      );
      return currentStage?.name || "Initial Stage";
    }
    return "Ticket Created";
  };
  const statusCounts = {
    new: tickets.filter((t) => t.status === "new").length,
    created: tickets.filter((t) => t.status === "created").length, // Add this line
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    completed: tickets.filter((t) => t.status === "completed").length,
    cancelled: tickets.filter((t) => t.status === "cancelled").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-white">
              kai<span className="text-amber-400">°</span> Operations
            </h1>
            <p className="text-slate-400 text-sm">Concierge Team Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-slate-400">Live</span>
            </div>
            <div className="flex items-center space-x-2">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-white text-sm">{user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">New Requests</p>
                <p className="text-2xl font-semibold text-white">
                  {statusCounts.new}
                </p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">In Progress</p>
                <p className="text-2xl font-semibold text-white">
                  {statusCounts.in_progress}
                </p>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Created</p>
                <p className="text-2xl font-semibold text-white">
                  {statusCounts.created}
                </p>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Completed</p>
                <p className="text-2xl font-semibold text-white">
                  {statusCounts.completed}
                </p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Tickets</p>
                <p className="text-2xl font-semibold text-white">
                  {totalTickets}
                </p>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <User className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

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
                <option value="new">New</option>
                <option value="created">Created</option>
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
              <p className="text-slate-400">Please wait while we fetch the data.</p>
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
                className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4 hover:border-amber-400/50 transition-colors cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        ticket.status
                      )}`}
                    ></div>
                    <span className="text-white font-medium">
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
                    <span className="text-xs text-slate-500">
                      {getCurrentStageName(ticket)}
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

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-3 h-3" />
                    <span>{ticket.session_chat ? 1 : 0}</span>
                  </div>
                </div>

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
