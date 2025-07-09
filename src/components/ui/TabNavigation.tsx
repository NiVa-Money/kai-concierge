import React from 'react';
import { Brain, MessageSquare, User } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  layout?: 'bottom' | 'sidebar';
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  layout = 'bottom' 
}) => {
  const tabs: Tab[] = [
    { id: 'predictive', label: 'Predictive', icon: <Brain className="w-5 h-5" /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> }
  ];

  if (layout === 'sidebar') {
    return (
      <div className="space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-all duration-200 relative ${
            activeTab === tab.id
              ? 'text-amber-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="mb-1">
            {tab.icon}
          </div>
          <span>{tab.label}</span>
          {activeTab === tab.id && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-amber-400 rounded-full"></div>
          )}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;