import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Menu, X } from "lucide-react";
import TabNavigation from "../ui/TabNavigation";
import PredictiveTab from "../tabs/PredictiveTab";
import ChatTab from "../tabs/ChatTab";
import ProfileTab from "../tabs/ProfileTab";

const TabbedChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("predictive");
  const [showSidebar, setShowSidebar] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case "predictive":
        return <PredictiveTab />;
      case "chat":
        return <ChatTab />;
      case "profile":
        return <ProfileTab />;
      default:
        return <PredictiveTab />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-800/50 backdrop-blur-lg border-r border-slate-700">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-light text-white mb-1">
            kai<span className="text-amber-400">°</span>
          </h1>
          <p className="text-slate-400 text-sm">Ultra-premium concierge</p>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="flex-1 p-4">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            layout="sidebar"
          />
        </div>

        {/* User Profile in Sidebar */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.name}
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-slate-400">Always available</span>
              </div>
            </div>
          </div>
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
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-slate-400">Live</span>
              </div>
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full border border-slate-600"
              />
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

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
              <div className="flex items-center space-x-3">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full border border-slate-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {user?.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-slate-400">
                      Always available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabbedChatInterface;
