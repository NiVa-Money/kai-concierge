import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const PredictiveTab: React.FC = () => {
  const [visible, setVisible] = useState(false);

  // Delay visibility to trigger entrance animation
  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex items-center justify-center h-full w-full p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div
        className={`
          max-w-xl w-full border border-amber-500 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 
          text-amber-300 rounded-xl shadow-2xl p-6 flex space-x-4 items-start
          transition-all duration-700 ease-out transform
          ${
            visible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-6 scale-95"
          }
          hover:shadow-yellow-500/20 hover:scale-[1.02]
          backdrop-blur-xl
        `}
      >
        {/* Sparkles icon with animation */}
        <Sparkles className="w-6 h-6 mt-1 text-amber-400 animate-spin-slow" />

        {/* Message content */}
        <div className="animate-fadeIn">
          <p className="text-lg font-bold animate-bounce text-amber-300">
            AI is still learning about your data.
          </p>
          <p className="text-sm text-amber-400 mt-1 animate-pulse">
            Once done, you'll be able to access the Predictive Services page.
          </p>
        </div>
      </div>

      {/* Extra Tailwind keyframes (custom below) */}
      <style>{`
  @keyframes spin-slow {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .animate-spin-slow {
    animation: spin-slow 6s linear infinite;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-fadeIn {
    animation: fadeIn 1.2s ease-out forwards;
  }
`}</style>
    </div>
  );
};

export default PredictiveTab;
