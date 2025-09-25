import React, { useState } from "react";
import { Menu, MessageSquare, Brain, History } from "lucide-react";
import PredictiveTab from "../tabs/PredictiveTab";
import ChatTab from "../tabs/ChatTab";
import ProfileTab from "../tabs/ProfileTab";
import SessionsTab from "../tabs/SessionsTab";

const TabbedChatInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState(() => "chat");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case "chat":
        return <ChatTab goToProfile={() => setActiveTab("profile")} />;
      case "sessions":
        return <SessionsTab />;
      case "predictive":
        return <PredictiveTab />;
      case "profile":
        return <ProfileTab />;
      default:
        return <ChatTab goToProfile={() => setActiveTab("profile")} />;
    }
  };

  const sidebarTabs = [
    {
      id: "chat",
      icon: <MessageSquare className="w-5 h-5" />,
      label: "New Chat",
    },
    { id: "sessions", icon: <History className="w-5 h-5" />, label: "History" },
    {
      id: "predictive",
      icon: <Brain className="w-5 h-5" />,
      label: "Kai Predictions",
    },
  ];

  return (
    <div className="h-screen bg-[#222323] flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarExpanded ? "w-64" : "w-16"
        } bg-[#222323] transition-all duration-300 flex flex-col`}
      >
        {/* Menu button pinned at the very top-left */}
        <div className="p-4 flex justify-start">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="w-8 h-8 bg-[#2c2c2c] hover:bg-[#3a3a3a] active:bg-[#444] rounded-full flex items-center justify-center transition-all duration-200 border border-[#3a3a3a] shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 group"
          >
            <Menu
              className={`w-4 h-4 text-gray-300 transition-all duration-200 group-hover:text-white ${
                sidebarExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Sidebar Tabs */}
        <div className="flex-1 p-2.5">
          <div className="space-y-4">
            {sidebarTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center ${
                  sidebarExpanded
                    ? "justify-start pl-6 space-x-3"
                    : "justify-center"
                } p-3 rounded-full transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white text-black shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-[#2c2c2c] border border-transparent hover:border-[#3a3a3a]"
                }`}
              >
                <div className="flex-shrink-0">{tab.icon}</div>
                {sidebarExpanded && (
                  <span className="text-sm font-medium">{tab.label}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default TabbedChatInterface;
