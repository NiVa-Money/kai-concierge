/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Plus,
  Send,
  Calendar,
  Phone,
  Ticket,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getAllTickets } from "../../api";

const customerInsights = [
  {
    title: "Daily Active Users",
    value: "47",
    change: "+12%",
    trend: "up",
    icon: Users,
    description: "vs. yesterday",
  },
  {
    title: "Customer Satisfaction",
    value: "4.8",
    change: "+0.2",
    trend: "up",
    icon: TrendingUp,
    description: "/5.0 rating",
  },
  {
    title: "Avg. Ticket Value",
    value: "$2,847",
    change: "+8%",
    trend: "up",
    icon: Clock,
    description: "vs. last week",
  },
  {
    title: "Completion Rate",
    value: "94%",
    change: "-2%",
    trend: "down",
    icon: CheckCircle,
    description: "this month",
  },
];

const quickActions = [
  {
    title: "New Ticket",
    icon: Plus,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    title: "Send Message",
    icon: Send,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    title: "Schedule Call",
    icon: Calendar,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    title: "Quick Call",
    icon: Phone,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
];

export interface Ticket {
  _id: string;
  ticket_id: string;
  client_message: string;
  service_type: string;
  client_contact: Record<string, any>;
  priority: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  session_chat?: string;
  client_preferences?: Record<string, any>;
  estimated_budget?: string;
  timeline?: string;
  special_instructions?: string;
  assigned_concierge?: string | null;
  estimated_completion?: string | null;
  smart_suggestions?: string;
  progress?: Array<{
    stageId: string;
    stageName: string;
    description: string;
    timestamp: string;
    status: string;
    meta?: Record<string, any>;
  }>;
  current_stage?: string;
  currentStage?: string;
  stages?: Array<{
    stageId: string;
    name: string;
    description: string;
    order: number;
    status: string;
    estimated_duration: string;
    dependencies: string[];
  }>;
  totalStages?: number;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return "bg-orange-500 text-white";
    case "MEDIUM":
      return "bg-yellow-500 text-white";
    default:
      return "bg-green-500 text-white";
  }
};

export default function DashboardView() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiMetadata, setApiMetadata] = useState<{
    total_tickets: number;
    new: number;
    in_progress: number;
    pending: number;
    completed: number;
    cancelled: number;
  } | null>(null);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await getAllTickets();

      if (res.data && res.data.data && res.data.data.tickets) {
        const tickets = res.data.data.tickets;
        const metadata = res.data.data.metadata;

        const safeTickets = tickets.filter((t: Ticket) => {
          return (
            typeof t.ticket_id === "string" &&
            typeof t.client_message === "string"
          );
        });

        setTickets(safeTickets);
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

  useEffect(() => {
    fetchTickets();
  }, []);

  const statusCounts = {
    new: apiMetadata?.new || 0,
    pending: apiMetadata?.pending || 0,
    in_progress: apiMetadata?.in_progress || 0,
    completed: apiMetadata?.completed || 0,
    cancelled: apiMetadata?.cancelled || 0,
  };

  const recentTickets = tickets.filter(
    (ticket) => ticket.status.toLowerCase() === "pending"
  );

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="text-center text-white font-semibold">
          Loading tickets...
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Concierge operations overview</p>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">New Requests</p>
                <p className="text-2xl font-semibold text-white">
                  {statusCounts.new} / {apiMetadata?.total_tickets || 0}
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
                <p className="text-slate-400 text-sm">Pending</p>
                <p className="text-2xl font-semibold text-white">
                  {statusCounts.pending} / {apiMetadata?.total_tickets || 0}
                </p>
              </div>
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">In Progress</p>
                <p className="text-2xl font-semibold text-white">
                  {statusCounts.in_progress} / {apiMetadata?.total_tickets || 0}
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
                  {statusCounts.completed} / {apiMetadata?.total_tickets || 0}
                </p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Customer Insights */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">
            Customer Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {customerInsights.map((insight) => (
              <div
                key={insight.title}
                className="p-6 bg-slate-800 rounded-md border border-slate-700 shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-slate-700 rounded-lg">
                    <insight.icon className="h-5 w-5 text-amber-400" />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      insight.trend === "up" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {insight.change}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{insight.title}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">
                    {insight.value}
                  </span>
                  <span className="text-sm text-slate-400">
                    {insight.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tickets */}
          <div className="lg:col-span-2 bg-slate-800 rounded-md border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Recent Tickets
              </h2>
              <span className="text-sm text-slate-400">
                {recentTickets.length} Active
              </span>
            </div>

            <div className="space-y-4">
              {recentTickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.ticket_id}
                  className="p-4 bg-slate-700 rounded-md hover:bg-slate-600 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-mono text-blue-400">
                        {ticket.ticket_id}
                      </h3>
                      <p className="text-white font-medium mt-1">
                        {ticket.client_message}
                      </p>

                      <div className="flex items-center text-xs text-slate-400 mt-1">
                        <User className="h-3 w-3 mr-1" />
                        {ticket.client_contact?.name}
                      </div>

                      <div className="mt-2">
                        <span className="text-xs text-slate-400">
                          Progress:{" "}
                          <span className="text-blue-400">
                            {ticket.progress?.stageId}%
                          </span>
                        </span>
                        <div className="w-full bg-slate-600 h-1 rounded mt-1">
                          <div
                            className="h-1 bg-blue-400 rounded transition-all"
                            style={{ width: `${ticket.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs text-slate-400">
                      <p>
                        {new Date(ticket.createdAt ?? "").toLocaleTimeString()}
                      </p>
                      <p>
                        {new Date(ticket.updatedAt ?? "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center space-x-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority}
                    </span>
                    <span className="text-xs text-slate-400">
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-slate-800 rounded-md border border-slate-700 p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Quick Stats
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-700 p-3 rounded">
                  <div className="flex items-center space-x-2">
                    <Ticket className="text-blue-400 h-5 w-5" />
                    <p className="text-slate-300">Total Tickets</p>
                  </div>
                  <p className="text-white">18</p>
                </div>
                <div className="flex items-center justify-between bg-slate-700 p-3 rounded">
                  <div className="flex items-center space-x-2">
                    <Users className="text-blue-400 h-5 w-5" />
                    <p className="text-slate-300">Active Customers</p>
                  </div>
                  <p className="text-white">156</p>
                </div>
                <div className="flex items-center justify-between bg-slate-700 p-3 rounded">
                  <div className="flex items-center space-x-2">
                    <Clock className="text-green-400 h-5 w-5" />
                    <p className="text-slate-300">Avg. Response Time</p>
                  </div>
                  <p className="text-white">12m</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800 rounded-md border border-slate-700 p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    className="flex flex-col items-center p-4 bg-slate-700 rounded-md hover:bg-slate-600 transition"
                  >
                    <div className={`p-2 rounded-lg ${action.bg}`}>
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <span className="text-sm mt-2 text-white">
                      {action.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
