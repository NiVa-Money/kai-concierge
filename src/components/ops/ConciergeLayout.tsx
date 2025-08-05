// import { useState } from "react";
// import { Outlet, useNavigate, useLocation } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Ticket,
//   Users,
//   Settings,
//   Menu,
//   X,
//   Search,
//   User,
// } from "lucide-react";

// const navigationItems = [
//   {
//     title: "Dashboard",
//     icon: LayoutDashboard,
//     href: "/ops/dashboard",
//     id: "dashboard",
//   },
//   { title: "Tickets", icon: Ticket, href: "/ops/tickets", id: "tickets" },
//   { title: "Customers", icon: Users, href: "/ops/customers", id: "customers" },
//   { title: "Settings", icon: Settings, href: "/ops/settings", id: "settings" },
// ];

// function ConciergeLayout() {
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const activeSection =
//     navigationItems.find((item) => location.pathname.startsWith(item.href))
//       ?.id || "dashboard";

//   return (
//     <div className="min-h-screen bg-slate-900 text-white flex">
//       {/* Sidebar */}
//       <aside
//         className={`fixed top-0 left-0 h-screen bg-slate-800 border-r border-slate-700 shadow-lg transition-all duration-300
//         ${sidebarCollapsed ? "w-16" : "w-64"}`}
//       >
//         {/* Sidebar Header */}
//         <div className="p-4 border-b border-slate-700 flex items-center justify-between">
//           {!sidebarCollapsed && (
//             <div>
//               <h1 className="text-xl font-bold text-white">
//                 kai<span className="text-amber-400">°</span> Ops
//               </h1>
//               <p className="text-sm text-slate-400">Concierge Dashboard</p>
//             </div>
//           )}
//           <button
//             onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//             className="p-1 rounded hover:bg-slate-700 text-slate-300"
//           >
//             {sidebarCollapsed ? (
//               <Menu className="h-4 w-4" />
//             ) : (
//               <X className="h-4 w-4" />
//             )}
//           </button>
//         </div>

//         {/* Navigation */}
//         <nav className="p-4 space-y-2">
//           {navigationItems.map((item) => {
//             const isActive = activeSection === item.id;
//             return (
//               <button
//                 key={item.id}
//                 onClick={() => navigate(item.href)}
//                 className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg transition
//                 ${
//                   isActive
//                     ? "bg-amber-500/20 text-amber-400"
//                     : "text-slate-300 hover:bg-slate-700 hover:text-white"
//                 }
//                 ${sidebarCollapsed ? "justify-center" : ""}`}
//               >
//                 <item.icon className="h-5 w-5" />
//                 {!sidebarCollapsed && (
//                   <span className="font-medium">{item.title}</span>
//                 )}
//               </button>
//             );
//           })}
//         </nav>

//         {/* User Info */}
//         {!sidebarCollapsed && (
//           <div className="absolute bottom-4 left-4 right-4 bg-slate-700 rounded-lg p-3 border border-slate-600">
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
//                 <User className="h-4 w-4 text-white" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium">Sneha Jhaveri</p>
//                 <p className="text-xs text-slate-400">Live</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </aside>

//       {/* Main Content */}
//       <div
//         className={`flex-1 transition-all duration-300 ${
//           sidebarCollapsed ? "ml-16" : "ml-64"
//         }`}
//       >
//         {/* Header */}
//         <header className="bg-slate-800 border-b border-slate-700 shadow-md">
//           <div className="px-6 py-4 flex items-center justify-between">
//             <div className="relative w-96">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
//               <input
//                 type="text"
//                 placeholder="Search tickets, customers..."
//                 className="pl-10 w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none"
//               />
//             </div>
//             {/* <button className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md">
//               <Bell className="h-4 w-4" />
//               <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//             </button> */}
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="p-6">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }

// export default ConciergeLayout;


import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  Menu,
  X,
  Search,
  User,
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/ops/dashboard",
    id: "dashboard",
  },
  { title: "Tickets", icon: Ticket, href: "/ops/tickets", id: "tickets" },
  { title: "Customers", icon: Users, href: "/ops/customers", id: "customers" },
  { title: "Settings", icon: Settings, href: "/ops/settings", id: "settings" },
];

function ConciergeLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Collapse sidebar by default on small screens to improve mobile usability
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  }, []);
  const navigate = useNavigate();
  const location = useLocation();

  const activeSection =
    navigationItems.find((item) => location.pathname.startsWith(item.href))
      ?.id || "dashboard";

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-slate-800 border-r border-slate-700 shadow-lg transition-all duration-300 
        ${sidebarCollapsed ? "w-16" : "w-64"}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-white">
                kai<span className="text-amber-400">°</span> Ops
              </h1>
              <p className="text-sm text-slate-400">Concierge Dashboard</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded hover:bg-slate-700 text-slate-300"
          >
            {sidebarCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.href)}
                className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg transition 
                ${
                  isActive
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                } 
                ${sidebarCollapsed ? "justify-center" : ""}`}
              >
                <item.icon className="h-5 w-5" />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.title}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-700 rounded-lg p-3 border border-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Sneha Jhaveri</p>
                <p className="text-xs text-slate-400">Live</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 shadow-md">
          {/* Wrap header contents on small screens */}
          <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search tickets, customers..."
                className="pl-10 w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none"
              />
            </div>
            {/* <button className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button> */}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ConciergeLayout;
