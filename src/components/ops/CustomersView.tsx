/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { getUserDashboard } from "../../api";
import {
  MoreHorizontal,
  Star,
  DollarSign,
  Ticket,
  MessageSquare,
  Heart,
  X,
  Search,
  Filter,
  Clock,
  Users,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*                         DUMMY DATA (unchanged)                      */
/* ------------------------------------------------------------------ */
const customers = [
  {
    id: "CUST-001",
    name: "Naresh Jhawar",
    email: "naresh@botwot.io",
    phone: "9000090009",
    location: "Mumbai, India",
    tier: "Platinum",
    totalSpent: "$125,000",
    activeTickets: 6,
    joinDate: "Jan 2024",
    lastInteraction: "2 hours ago",
    satisfaction: 4.9,
    interactions: 47,
    preferences: {
      likes: [
        "Luxury Travel",
        "Fine Dining",
        "Concert Tickets",
        "Private Jets",
      ],
      dislikes: ["Crowded Places", "Budget Options", "Long Waits"],
    },
    aiRecommendations: [
      "Premium yacht charter for upcoming anniversary",
      "Michelin-star restaurant reservations in Tokyo",
      "VIP box seats for upcoming tennis tournaments",
    ],
    recentActivity: [
      {
        type: "ticket",
        title: "Book 2 tickets for The Weeknd",
        status: "active",
        time: "2 h ago",
      },
      {
        type: "ticket",
        title: "Boxing show in London",
        status: "active",
        time: "3 h ago",
      },
      {
        type: "interaction",
        title: "Called re: yacht charter",
        status: "done",
        time: "1 d ago",
      },
      {
        type: "ticket",
        title: "Private jet to Dubai",
        status: "done",
        time: "2 d ago",
      },
    ],
  },
  {
    id: "CUST-002",
    name: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    phone: "9876543210",
    location: "Delhi, India",
    tier: "Gold",
    totalSpent: "$75,000",
    activeTickets: 2,
    joinDate: "Mar 2024",
    lastInteraction: "1 day ago",
    satisfaction: 4.7,
    interactions: 23,
    preferences: {
      likes: [
        "Art Galleries",
        "Wine Tasting",
        "Spa Treatments",
        "Cultural Events",
      ],
      dislikes: ["Loud Music", "Spicy Food", "Late-night events"],
    },
    aiRecommendations: [
      "Private art-gallery tour in Paris",
      "Exclusive wine tasting in Tuscany",
      "Luxury spa retreat in Bali",
    ],
    recentActivity: [
      {
        type: "ticket",
        title: "Spa weekend booking",
        status: "active",
        time: "1 d ago",
      },
      {
        type: "interaction",
        title: "Asked about art auction",
        status: "done",
        time: "3 d ago",
      },
    ],
  },
  {
    id: "CUST-003",
    name: "Robert Chen",
    email: "robert.chen@techcorp.com",
    phone: "555-0123",
    location: "San Francisco, USA",
    tier: "Diamond",
    totalSpent: "$250,000",
    activeTickets: 1,
    joinDate: "Dec 2023",
    lastInteraction: "30 min ago",
    satisfaction: 5.0,
    interactions: 89,
    preferences: {
      likes: [
        "Tech Events",
        "Mountain Sports",
        "Craft Cocktails",
        "Modern Architecture",
      ],
      dislikes: [
        "Formal Dress Codes",
        "Traditional Cuisine",
        "Beach Vacations",
      ],
    },
    aiRecommendations: [
      "Exclusive tech-conference access in Vegas",
      "Helicopter skiing in Swiss Alps",
      "Private architectural tours in Barcelona",
    ],
    recentActivity: [
      {
        type: "ticket",
        title: "CES 2025 VIP access",
        status: "active",
        time: "30 m ago",
      },
      {
        type: "ticket",
        title: "Ski resort in Aspen",
        status: "done",
        time: "1 w ago",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*                               VIEW                                 */
/* ------------------------------------------------------------------ */
export default function CustomersView() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "prefs" | "activity" | "ai"
  >("overview");
  const [selected, setSelected] = useState<(typeof customers)[0] | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );
  
  // Fetch dashboard data when a customer is selected
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selected) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Use userId from localStorage
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setError("User ID not found in localStorage");
          return;
        }
        
        const response = await getUserDashboard(userId);
        setDashboardData(response.data.data);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load customer dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selected]);

  /* ---------------------------- RENDER ---------------------------- */
  return (
    <div className="space-y-6">
      {/* ▸ Header ---------------------------------------------------- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Customers</h1>
          <p className="text-slate-400">
            Manage customer details and preferences
          </p>
        </div>

        <button className="bg-amber-500 px-4 py-2 rounded hover:bg-amber-600 text-white">
          Add New Customer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ▸ List ---------------------------------------------------- */}
        <div className="space-y-4">
          {/* Search + Filter (simple) */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder:text-slate-500"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:border-amber-400">
              <Filter className="h-4 w-4" />
            </button>
          </div>

          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setSelected(c);
                setActiveTab("overview");
              }}
              className={`p-4 bg-slate-800 rounded border cursor-pointer hover:border-amber-400 ${
                selected?.id === c.id ? "border-amber-400" : "border-slate-700"
              }`}
            >
              <h3 className="text-white font-semibold">{c.name}</h3>
              <p className="text-sm text-slate-400">{c.email}</p>
              <div className="text-xs text-slate-500">
                {c.activeTickets} active tickets • {c.lastInteraction}
              </div>
            </div>
          ))}
        </div>

        {/* ▸ Details ------------------------------------------------- */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="p-6 bg-slate-800 rounded border border-slate-700 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selected.name}
                  </h2>
                  <p className="text-slate-400">{selected.email}</p>
                  <p className="text-slate-400">{selected.phone}</p>
                  <p className="text-slate-400">{selected.location}</p>
                </div>
                <button className="p-2 rounded hover:bg-slate-700">
                  <MoreHorizontal className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              {/* Tabs (simple) */}
              <div className="flex gap-6 border-b border-slate-700">
                {[
                  ["overview", "Overview"],
                  ["prefs", "Preferences"],
                  ["activity", "Activity"],
                  ["ai", "AI Insights"],
                ].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setActiveTab(val as any)}
                    className={`pb-2 text-sm ${
                      activeTab === val
                        ? "text-amber-400 border-b-2 border-amber-500"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === "overview" && (
                <div>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-red-400 mb-2">{error}</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg text-sm font-medium hover:bg-amber-400 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : dashboardData ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Metric
                        icon={<DollarSign className="h-4 w-4 text-green-400" />}
                        label="Total Spent"
                        value={`$${dashboardData.total_spent?.toLocaleString() || '0'}`}
                      />
                      <Metric
                        icon={<Ticket className="h-4 w-4 text-blue-400" />}
                        label="Active Tickets"
                        value={dashboardData.active_tickets || 0}
                      />
                      <Metric
                        icon={<Star className="h-4 w-4 text-yellow-400" />}
                        label="Satisfaction"
                        value={`${dashboardData.satisfaction || 0}/5`}
                      />
                      <Metric
                        icon={<Users className="h-4 w-4 text-purple-400" />}
                        label="Interactions"
                        value={dashboardData.total_sessions || 0}
                      />
                                         </div>
                   ) : (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {/* Fallback to dummy data if no API data */}
                       <Metric
                         icon={<DollarSign className="h-4 w-4 text-green-400" />}
                         label="Total Spent"
                         value={selected.totalSpent}
                       />
                       <Metric
                         icon={<Ticket className="h-4 w-4 text-blue-400" />}
                         label="Active Tickets"
                         value={selected.activeTickets}
                       />
                       <Metric
                         icon={<Star className="h-4 w-4 text-yellow-400" />}
                         label="Satisfaction"
                         value={`${selected.satisfaction}/5`}
                       />
                       <Metric
                         icon={<MessageSquare className="h-4 w-4 text-purple-400" />}
                         label="Interactions"
                         value={selected.interactions}
                       />
                     </div>
                   )}

                </div>
              )}

              {activeTab === "prefs" && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Likes */}
                  <PrefCard
                    title="Likes & Preferences"
                    icon={<Heart className="h-4 w-4 text-green-400" />}
                  >
                    {selected.preferences.likes.map((like) => (
                      <span
                        key={like}
                        className="bg-green-500/10 text-green-300 text-xs px-2 py-1 rounded mr-2 mb-2 inline-block"
                      >
                        {like}
                      </span>
                    ))}
                  </PrefCard>

                  {/* Dislikes */}
                  <PrefCard
                    title="Dislikes & Avoid"
                    icon={<X className="h-4 w-4 text-red-400" />}
                  >
                    {selected.preferences.dislikes.map((d) => (
                      <span
                        key={d}
                        className="bg-red-500/10 text-red-300 text-xs px-2 py-1 rounded mr-2 mb-2 inline-block"
                      >
                        {d}
                      </span>
                    ))}
                  </PrefCard>
                </div>
              )}

{activeTab === "activity" && (
  <div className="space-y-4">
    {loading ? (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    ) : error ? (
      <div className="text-center py-8">
        <p className="text-red-400 mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg text-sm font-medium hover:bg-amber-400 transition-colors"
        >
          Retry
        </button>
      </div>
    ) : dashboardData?.recent_activity ? (
      <div className="space-y-4">
        {dashboardData.recent_activity.slice(0, 4).map((activity: any, i: number) => (
          <div
            key={activity._id || i}
            className="flex items-center justify-between p-4 bg-slate-700 rounded"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-blue-400/10">
                <Ticket className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white">{activity.title}</p>
                <p className="text-xs text-slate-400">
                  {new Date(activity.created_at).toLocaleDateString()}{" "}
                  {new Date(activity.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                activity.status === "in_progress" || activity.status === "active"
                  ? "bg-amber-500/10 text-amber-400"
                  : activity.status === "pending"
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-slate-500/10 text-slate-300"
              }`}
            >
              {activity.status}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-slate-400">No recent activity found.</p>
    )}
  </div>
)}


              {activeTab === "ai" && (
                <div className="space-y-4">
                  {selected.aiRecommendations.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-slate-700 rounded"
                    >
                      <p className="text-white">{r}</p>
                      <button className="text-xs bg-transparent border border-amber-500 text-amber-400 px-3 py-1 rounded hover:bg-amber-500 hover:text-white transition">
                        Create Ticket
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 bg-slate-800 rounded border border-slate-700 text-center text-slate-400">
              Select a customer to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                     SMALL PRESENTATIONAL HELPERS                    */
/* ------------------------------------------------------------------ */
function Metric({
  icon,
  label,
  value,
}: {
  icon: JSX.Element;
  label: string;
  value: string | number;
}) {
  return (
    <div className="p-4 bg-slate-700 rounded flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function PrefCard({
  icon,
  title,
  children,
}: {
  icon: JSX.Element;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-slate-700 rounded">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}
