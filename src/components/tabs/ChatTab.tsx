import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Settings, Zap, AlertTriangle } from 'lucide-react';

const ChatTab: React.FC = () => {
  const { messages, sendMessage, isTyping } = useChat();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [promptInjection, setPromptInjection] = useState('');
  const [showPromptInjection, setShowPromptInjection] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Combine user input with prompt injection if provided
      const finalMessage = promptInjection 
        ? `${input}\n\n[System Context: ${promptInjection}]`
        : input;
      
      sendMessage(finalMessage);
      setInput('');
    }
  };

  const formatMessage = (content: string) => {
    // Remove system context from display
    const displayContent = content.replace(/\n\n\[System Context:.*?\]$/, '');
    
    return displayContent.split('\n').map((line, index) => {
      if (line.startsWith('•')) {
        return (
          <li key={index} className="ml-4 text-slate-300">
            {line.substring(1).trim()}
          </li>
        );
      }
      return (
        <p key={index} className="mb-2 last:mb-0">
          {line}
        </p>
      );
    });
  };

  const quickPrompts = [
    "I need a last-minute reservation for tonight",
    "Book me a flight to Tokyo next week",
    "Find me a yacht charter in the Mediterranean",
    "Arrange a private shopping experience",
    "Schedule a wellness retreat this month"
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-slate-800/30 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-white">AI Concierge</h2>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-slate-400">Always available</span>
            </div>
          </div>
          <button
            onClick={() => setShowPromptInjection(!showPromptInjection)}
            className={`p-2 rounded-lg transition-colors ${
              showPromptInjection 
                ? 'bg-amber-400/20 text-amber-400' 
                : 'hover:bg-slate-700 text-slate-400'
            }`}
            title="Advanced Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Prompt Injection Panel */}
      {showPromptInjection && (
        <div className="bg-slate-800/50 border-b border-slate-700 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Prompt Injection</span>
          </div>
          <textarea
            value={promptInjection}
            onChange={(e) => setPromptInjection(e.target.value)}
            placeholder="Add system context or special instructions for the AI agent..."
            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-sm resize-none"
            rows={3}
          />
          <p className="text-xs text-slate-500 mt-2">
            This context will be sent with your message to influence AI behavior
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👋</div>
            <h3 className="text-xl text-white mb-2">Good evening, {user?.name?.split(' ')[0]}</h3>
            <p className="text-slate-400 mb-6">How may I assist you today?</p>
            
            {/* Quick Prompts */}
            <div className="max-w-md mx-auto">
              <p className="text-sm text-slate-400 mb-3">Quick requests:</p>
              <div className="space-y-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className="w-full text-left bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-300 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-slate-800 text-white'
                }`}
              >
                <div className="text-sm">
                  {formatMessage(message.content)}
                </div>
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-white px-4 py-3 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-slate-800/50 backdrop-blur-lg border-t border-slate-700 p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your request..."
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              />
              {promptInjection && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Zap className="w-4 h-4 text-amber-400" title="Prompt injection active" />
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatTab;