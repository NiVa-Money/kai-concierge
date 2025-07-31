/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  getUserDashboard,
  getAllUsers,
  getUserPersonas,
  getPersonaRecommendations,
} from "../../api";
import {
  Star,
  DollarSign,
  Ticket,
  MessageSquare,
  Search,
  Users,
  Heart,
  X,
} from "lucide-react";

export default function CustomersView() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "prefs" | "activity" | "ai"
  >("overview");
  const [selected, setSelected] = useState<(typeof customers)[0] | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [personaData, setPersonaData] = useState<any[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);

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
        const userId = selected._id;
        if (!userId) {
          setError("User ID not found in selected user");
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

  useEffect(() => {
    const fetchDashboardDataAndPersonas = async () => {
      if (!selected?._id) return;

      setLoading(true);
      setError(null);

      try {
        const userId = selected._id;

        const [dashboardRes, personaRes, recoRes] = await Promise.all([
          getUserDashboard(userId),
          getUserPersonas(userId),
          getPersonaRecommendations(userId),
        ]);

        setDashboardData(dashboardRes.data.data);

        const personas = personaRes.data?.data?.personas || [];
        setPersonaData(personas);

        const recommendations = recoRes.data?.data?.recommendations || [];
        setAiRecommendations(recommendations);
      } catch (err: any) {
        console.error("Error fetching customer data:", err);
        setError("Failed to load customer data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardDataAndPersonas();
  }, [selected]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getAllUsers();
        const transformed = res.data.data.users.map((user: any, i: number) => ({
          ...user,
          id: user.user_id || `user-${i}`,
          name: user.name || "Unnamed",
          email: user.email || "N/A",
          phone: user.phone || "N/A",
          location: user.location || "—",
          tier: "Gold",
          totalSpent: "$0",
          activeTickets: 0,
          satisfaction: 0,
          interactions: 0,
          lastInteraction: "—",
          aiRecommendations: [],
          preferences: {
            likes: [],
            dislikes: [],
          },
          recentActivity: [],
        }));
        setCustomers(transformed);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    fetchCustomers();
  }, []);

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

        {/* <button className="bg-amber-500 px-4 py-2 rounded hover:bg-amber-600 text-white">
          Add New Customer
        </button> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ▸ List ---------------------------------------------------- */}
        <div className="space-y-4 h-[calc(100vh-210px)] overflow-y-auto pr-1 custom-scrollbar">
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
                {/* <button className="p-2 rounded hover:bg-slate-700">
                  <MoreHorizontal className="h-4 w-4 text-slate-400" />
                </button> */}
              </div>

              {/* Tabs (simple) */}
              <div className="flex gap-6 border-b border-slate-700">
                {[
                  ["overview", "Overview"],
                  ["prefs", "Persona"],
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
                        value={`$${
                          dashboardData.total_spent?.toLocaleString() || "0"
                        }`}
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
                        icon={
                          <MessageSquare className="h-4 w-4 text-purple-400" />
                        }
                        label="Interactions"
                        value={selected.interactions}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === "prefs" && (
                <div className="max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                  {loading ? (
                    <div className="text-slate-400">Loading persona...</div>
                  ) : personaData.length === 0 ? (
                    <p className="text-slate-400">No persona available.</p>
                  ) : (
                    <div className="space-y-6">
                      {personaData.map((persona, i) => {
                        const slides = persona?.profileData?.slides || {};

                        const likes: string[] =
                          slides.interests_habits?.points || [];
                        const preferences: string[] =
                          slides.shopping_persona?.points || [];
                        const dislikesAvoid: string[] =
                          slides.personality_type?.points || [];

                        return (
                          <div
                            key={persona._id || i}
                            className="bg-slate-700 rounded p-4 space-y-4"
                          >
                            <h3 className="text-lg font-semibold text-white">
                              {persona.platform} - @{persona.username}
                            </h3>

                            {/* Likes */}
                            <PrefCard
                              title="Likes"
                              icon={
                                <Heart className="h-4 w-4 text-green-400" />
                              }
                            >
                              {likes.length > 0 ? (
                                likes.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-green-500/10 text-green-300 text-xs px-2 py-1 rounded mr-2 mb-2 inline-block"
                                  >
                                    {item}
                                  </span>
                                ))
                              ) : (
                                <p className="text-slate-400 text-sm">
                                  No likes found.
                                </p>
                              )}
                            </PrefCard>

                            {/* Preferences */}
                            <PrefCard
                              title="Preferences"
                              icon={<Heart className="h-4 w-4 text-blue-400" />}
                            >
                              {preferences.length > 0 ? (
                                preferences.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-blue-500/10 text-blue-300 text-xs px-2 py-1 rounded mr-2 mb-2 inline-block"
                                  >
                                    {item}
                                  </span>
                                ))
                              ) : (
                                <p className="text-slate-400 text-sm">
                                  No preferences available.
                                </p>
                              )}
                            </PrefCard>

                            {/* Dislikes & Avoid */}
                            <PrefCard
                              title="Dislikes & Avoid"
                              icon={<X className="h-4 w-4 text-red-400" />}
                            >
                              {dislikesAvoid.length > 0 ? (
                                dislikesAvoid.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-red-500/10 text-red-300 text-xs px-2 py-1 rounded mr-2 mb-2 inline-block"
                                  >
                                    {item}
                                  </span>
                                ))
                              ) : (
                                <p className="text-slate-400 text-sm">
                                  No dislikes or avoid data found.
                                </p>
                              )}
                            </PrefCard>

                            <div className="text-xs text-slate-400">
                              Last Updated:{" "}
                              {new Date(persona.updatedAt).toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                      {dashboardData.recent_activity
                        .slice(0, 4)
                        .map((activity: any, i: number) => (
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
                                  {new Date(
                                    activity.created_at
                                  ).toLocaleDateString()}{" "}
                                  {new Date(
                                    activity.created_at
                                  ).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                activity.status === "in_progress" ||
                                activity.status === "active"
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
                <div className="max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                    </div>
                  ) : aiRecommendations.length === 0 ? (
                    <p className="text-slate-400">
                      No AI recommendations available.
                    </p>
                  ) : (
                    aiRecommendations.map((r, i) => (
                      <div
                        key={i}
                        className="p-4 bg-slate-700 rounded space-y-2 border border-slate-600"
                      >
                        <h3 className="text-lg text-white font-semibold">
                          {r.title}
                        </h3>
                        <p className="text-slate-300 text-sm">
                          {r.description}
                        </p>
                        <div className="text-xs text-slate-400">
                          <p>
                            <strong>Category:</strong> {r.category}
                          </p>

                          <p>
                            <strong>Cost:</strong> {r.estimated_cost}
                          </p>

                          <p>
                            <strong>Confidence:</strong>{" "}
                            {(r.confidence_score * 100).toFixed(1)}%
                          </p>
                        </div>
                        <p className="text-amber-400 text-sm italic">
                          {r.reasoning}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {r.tags.map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="bg-amber-500/10 text-amber-400 text-xs px-2 py-1 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
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
