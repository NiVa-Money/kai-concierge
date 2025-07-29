import { useState } from "react";
import { User, Bell, Shield, Users, Globe, Database } from "lucide-react";

/* ------------------------------------------------------------------ */
/*                     SIMPLE TAB HANDLING                            */
/* ------------------------------------------------------------------ */
const tabs = [
  "general",
  "notifications",
  "security",
  "team",
  "integrations",
  "billing",
] as const;
type Tab = (typeof tabs)[number];

export default function SettingsView() {
  const [tab, setTab] = useState<Tab>("general");

  return (
    <div className="space-y-6">
      {/* ▸ Header ---------------------------------------------------- */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400">
          Manage your account and application preferences
        </p>
      </div>

      {/* ▸ Tab Nav --------------------------------------------------- */}
      <div className="flex gap-6 border-b border-slate-700">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 capitalize text-sm ${
              tab === t
                ? "text-amber-400 border-b-2 border-amber-500"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ▸ Tab Content ---------------------------------------------- */}
      {tab === "general" && <GeneralTab />}
      {tab === "notifications" && <NotificationsTab />}
      {tab === "security" && <SecurityTab />}
      {tab === "team" && <TeamTab />}
      {tab === "integrations" && <IntegrationsTab />}
      {tab === "billing" && <BillingTab />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                       INDIVIDUAL TAB BODIES                        */
/* ------------------------------------------------------------------ */
function GeneralTab() {
  return (
    <div className="space-y-6">
      {/* Profile */}
      <Section
        title="Profile"
        icon={<User className="h-5 w-5 text-amber-400" />}
      >
        <Input label="First Name" defaultValue="Sneha" />
        <Input label="Last Name" defaultValue="Jhaveri" />
        <Input
          label="Email"
          type="email"
          defaultValue="sneha@kaiconcierge.ai"
        />
        <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </Section>

      {/* Organization */}
      <Section
        title="Organization"
        icon={<Globe className="h-5 w-5 text-amber-400" />}
      >
        <Input label="Organization Name" defaultValue="kai° Operations" />
        <Select label="Timezone" options={["UTC", "IST", "EST", "PST"]} />
        <Select
          label="Language"
          options={["English", "Spanish", "French", "German"]}
        />
        <Select label="Currency" options={["USD", "EUR", "GBP", "INR"]} />
      </Section>
    </div>
  );
}

function NotificationsTab() {
  const items = [
    "New Ticket Created",
    "Ticket Status Changed",
    "High-Priority Tickets",
    "Customer Messages",
    "Team Mentions",
    "Daily Summary",
  ];
  return (
    <Section
      title="Notification Preferences"
      icon={<Bell className="h-5 w-5 text-amber-400" />}
    >
      {items.map((txt) => (
        <label
          key={txt}
          className="flex items-center justify-between text-white mb-2"
        >
          {txt}
          <input type="checkbox" defaultChecked className="accent-amber-500" />
        </label>
      ))}
    </Section>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-6">
      <Section
        title="Security"
        icon={<Shield className="h-5 w-5 text-amber-400" />}
      >
        <Input type="password" label="Current Password" />
        <Input type="password" label="New Password" />
        <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded">
          Update Password
        </button>
      </Section>
    </div>
  );
}

function TeamTab() {
  const members = [
    {
      name: "Sneha Jhaveri",
      email: "sneha@kaiconcierge.ai",
      role: "Admin",
      status: "Active",
    },
    {
      name: "Rahul Patel",
      email: "rahul@kaiconcierge.ai",
      role: "Manager",
      status: "Active",
    },
    {
      name: "Priya Singh",
      email: "priya@kaiconcierge.ai",
      role: "Agent",
      status: "Active",
    },
    {
      name: "Michael Chen",
      email: "michael@kaiconcierge.ai",
      role: "Agent",
      status: "Pending",
    },
  ];
  return (
    <Section
      title="Team Members"
      icon={<Users className="h-5 w-5 text-amber-400" />}
      actionText="Invite Member"
    >
      {members.map((m) => (
        <div
          key={m.email}
          className="flex items-center justify-between p-4 bg-slate-700 rounded mb-2"
        >
          <div>
            <p className="text-white">{m.name}</p>
            <p className="text-xs text-slate-400">{m.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{m.role}</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                m.status === "Active"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              {m.status}
            </span>
          </div>
        </div>
      ))}
    </Section>
  );
}

function IntegrationsTab() {
  const items = [
    { name: "Slack", desc: "Get notifications in Slack", connected: true },
    { name: "Zendesk", desc: "Sync customer data", connected: false },
    { name: "Salesforce", desc: "CRM integration", connected: true },
    { name: "WhatsApp", desc: "Customer messaging", connected: false },
    { name: "Stripe", desc: "Payment processing", connected: true },
    { name: "Google Calendar", desc: "Event scheduling", connected: false },
  ];
  return (
    <Section
      title="Integrations"
      icon={<Globe className="h-5 w-5 text-amber-400" />}
    >
      {items.map((i) => (
        <div
          key={i.name}
          className="flex items-center justify-between p-4 bg-slate-700 rounded mb-2"
        >
          <div>
            <p className="text-white">{i.name}</p>
            <p className="text-xs text-slate-400">{i.desc}</p>
          </div>
          <button
            className={`px-3 py-1 text-xs rounded border ${
              i.connected
                ? "border-slate-500 text-slate-300 hover:bg-slate-600"
                : "border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white"
            }`}
          >
            {i.connected ? "Disconnect" : "Connect"}
          </button>
        </div>
      ))}
    </Section>
  );
}

function BillingTab() {
  return (
    <Section
      title="Billing & Usage"
      icon={<Database className="h-5 w-5 text-amber-400" />}
    >
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Current Plan" value="Enterprise" sub="$299 / month" />
        <StatCard
          label="Tickets This Month"
          value="1 247"
          sub="of 5 000 limit"
        />
        <StatCard label="Next Billing" value="15 Aug 2025" />
      </div>

      <Input
        label="Payment method (masked)"
        defaultValue="•••• •••• •••• 4242"
      />
      <Input label="Billing email" defaultValue="billing@kaiconcierge.ai" />
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*                       SMALL PRESENTATIONAL                         */
/* ------------------------------------------------------------------ */
function Section({
  title,
  icon,
  children,
  actionText,
}: {
  title: string;
  icon: JSX.Element;
  children: React.ReactNode;
  actionText?: string;
}) {
  return (
    <div className="p-6 bg-slate-800 rounded border border-slate-700 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        {actionText && (
          <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded text-sm">
            {actionText}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Input({
  label,
  defaultValue = "",
  type = "text",
}: {
  label: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-slate-400">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder:text-slate-500"
      />
    </div>
  );
}

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-slate-400">{label}</label>
      <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="p-4 bg-slate-700 rounded">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
