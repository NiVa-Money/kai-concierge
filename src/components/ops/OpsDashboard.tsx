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
import { getAllTickets, Ticket } from "../../api";
import TicketDetailsModal from "./TicketDetailsModal";

const OpsDashboard: React.FC = () => {
  // const { updateTicketStatus } = useChat();
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const fetchTickets = async () => {
    try {
      const res = await getAllTickets();
      const safeTickets = res.data.tickets.filter(
        (t: Ticket) =>
          typeof t.ticket_id === "string" &&
          typeof t.client_message === "string"
      );
      setTickets(safeTickets);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesFilter = filter === "all" || ticket.status === filter;
    const matchesSearch =
      ticket.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.client_message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

  const statusCounts = {
    new: tickets.filter((t) => t.status === "new").length,
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
                  {tickets.length}
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
          <div className="flex flex-wrap items-center gap-4">
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
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => (
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

              <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                {ticket.client_message}
              </p>

              <div className="text-xs text-slate-400 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-3 h-3" />
                  <span>{ticket.client_contact.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3 h-3" />
                  <span>{ticket.client_contact.phone}</span>
                </div>
                {ticket.client_contact.email && (
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
          ))}
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl text-white mb-2">No tickets found</h3>
            <p className="text-slate-400">
              {searchTerm
                ? "Try adjusting your search terms"
                : "New client requests will appear here"}
            </p>
          </div>
        )}

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
