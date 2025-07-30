import React, { useState } from "react";
import { Menu, X, ChevronRight, MessageSquare, Brain, User, History } from "lucide-react";
import TabNavigation from "../ui/TabNavigation";
import PredictiveTab from "../tabs/PredictiveTab";
import ChatTab from "../tabs/ChatTab";
import ProfileTab from "../tabs/ProfileTab";
import SessionsTab from "../tabs/SessionsTab";

const TabbedChatInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return window.location.pathname === "/chat" ? "chat" : "chat";
  });

  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case "predictive":
        return <PredictiveTab />;
      case "chat":
        return <ChatTab />;
      case "sessions":
        return <SessionsTab />;
      case "profile":
        return <ProfileTab />;
      default:
        return <ChatTab />;
    }
  };

  const sidebarTabs = [
    { id: 'chat', icon: <MessageSquare className="w-5 h-5" />, label: 'Chat' },
    { id: 'sessions', icon: <History className="w-5 h-5" />, label: 'Sessions' },
    { id: 'predictive', icon: <Brain className="w-5 h-5" />, label: 'Predictive' },
    { id: 'profile', icon: <User className="w-5 h-5" />, label: 'Profile' }
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Professional Expandable Sidebar */}
      <div className={`${sidebarExpanded ? 'w-64' : 'w-16'} transition-all duration-300 bg-slate-800/50 backdrop-blur-lg border-r border-slate-700 flex flex-col`}>
        <div className="flex-1 p-2.5 pt-6">
          <div className="space-y-4">
            {sidebarTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center ${sidebarExpanded ? 'justify-start pl-6 space-x-3' : 'justify-center'} p-3 rounded-full transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30 shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50 border border-transparent hover:border-slate-600'
                }`}
              >
                <div className="flex-shrink-0">
                  {tab.icon}
                </div>
                {sidebarExpanded && <span className="text-sm font-medium">{tab.label}</span>}
              </button>
            ))}
          </div>
        </div>
        
        {/* User Profile Section with Arrow */}
        <div className="p-4">
          {sidebarExpanded ? (
            // Extended state - arrow in flex row
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-slate-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Elite Member</p>
                <p className="text-xs text-slate-400">Premium</p>
              </div>
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="w-8 h-8 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-full flex items-center justify-center transition-all duration-200 border border-slate-600 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 group flex-shrink-0"
              >
                <ChevronRight className="w-4 h-4 text-slate-300 transition-all duration-200 group-hover:text-white rotate-180" />
              </button>
            </div>
          ) : (
            // Collapsed state - arrow at bottom
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-900" />
              </div>
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="w-8 h-8 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-full flex items-center justify-center transition-all duration-200 border border-slate-600 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 group"
              >
                <ChevronRight className="w-4 h-4 text-slate-300 transition-all duration-200 group-hover:text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-800/50 backdrop-blur-lg border-b border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-400" />
              </button>
              <h1 className="text-xl font-light text-white">
                kai<span className="text-amber-400">°</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col lg:pb-0 pb-20">
          {renderTabContent()}
        </div>

        {/* Mobile Bottom Tab Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-lg border-t border-slate-700">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            layout="bottom"
          />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50">
          <div className="w-80 h-full bg-slate-800/95 backdrop-blur-lg border-r border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-light text-white">
                  kai<span className="text-amber-400">°</span>
                </h1>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <p className="text-slate-400 text-sm">Ultra-premium concierge</p>
            </div>

            <div className="p-4">
              <TabNavigation
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  setShowSidebar(false);
                }}
                layout="sidebar"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabbedChatInterface;
