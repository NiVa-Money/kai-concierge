import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import LoginPage from "./components/auth/LoginPage";
import SocialSetup from "./components/auth/SocialSetup";
import TabbedChatInterface from "./components/chat/TabbedChatInterface";
import OpsDashboard from "./components/ops/OpsDashboard";
import SignupPage from "./components/auth/SignupPage";

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white">Loading kai...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {user ? (
        <>
          {/* Redirect to social setup if required */}
          {!user.socialHandles?.instagram &&
          !user.socialHandles?.linkedin &&
          !user.socialHandles?.twitter ? (
            <>
              <Route path="/social-setup" element={<SocialSetup />} />
              <Route
                path="*"
                element={<Navigate to="/social-setup" replace />}
              />
            </>
          ) : (
            <>
              <Route
                path="/"
                element={
                  user.isOpsTeam ? <OpsDashboard /> : <TabbedChatInterface />
                }
              />
              <Route path="/ops" element={<OpsDashboard />} />
              <Route path="/chat" element={<TabbedChatInterface />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <AppContent />
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
