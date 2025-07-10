// import React from "react";
// import {
//   Plane,
//   Utensils,
//   Calendar,
//   Car,
//   Sparkles,
//   Clock,
//   TrendingUp,
//   MapPin,
//   Brain,
// } from "lucide-react";

// interface PredictiveService {
//   id: string;
//   title: string;
//   description: string;
//   icon: React.ReactNode;
//   reason: string;
//   confidence: number;
//   category: string;
//   urgency: "low" | "medium" | "high";
// }

// const PredictiveTab: React.FC = () => {
//   const predictiveServices: PredictiveService[] = [
//     {
//       id: "1",
//       title: "Private Jet to Aspen",
//       description:
//         "Based on your travel patterns, you typically book ski trips in January",
//       icon: <Plane className="w-6 h-6" />,
//       reason: "Historical booking pattern + seasonal preference",
//       confidence: 92,
//       category: "Travel",
//       urgency: "high",
//     },
//     {
//       id: "2",
//       title: "Michelin Star Reservation",
//       description:
//         "New restaurant opening in your preferred neighborhood this weekend",
//       icon: <Utensils className="w-6 h-6" />,
//       reason: "Location preference + dining history",
//       confidence: 87,
//       category: "Dining",
//       urgency: "medium",
//     },
//     {
//       id: "4",
//       title: "Wellness Retreat Booking",
//       description:
//         "Quarterly wellness retreat based on your health-conscious lifestyle",
//       icon: <Calendar className="w-6 h-6" />,
//       reason: "Lifestyle pattern + quarterly schedule",
//       confidence: 85,
//       category: "Wellness",
//       urgency: "medium",
//     },
//     {
//       id: "5",
//       title: "Luxury Car Service",
//       description: "Pre-book transportation for your upcoming board meeting",
//       icon: <Car className="w-6 h-6" />,
//       reason: "Calendar integration + preference history",
//       confidence: 94,
//       category: "Transportation",
//       urgency: "high",
//     },
//   ];

//   const getUrgencyColor = (urgency: string) => {
//     switch (urgency) {
//       case "high":
//         return "bg-red-500/20 text-red-400 border-red-500/30";
//       case "medium":
//         return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
//       case "low":
//         return "bg-green-500/20 text-green-400 border-green-500/30";
//       default:
//         return "bg-gray-500/20 text-gray-400 border-gray-500/30";
//     }
//   };

//   const getCategoryIcon = (category: string) => {
//     switch (category) {
//       case "Travel":
//         return <Plane className="w-4 h-4" />;
//       case "Dining":
//         return <Utensils className="w-4 h-4" />;
//       case "Events":
//         return <Sparkles className="w-4 h-4" />;
//       case "Wellness":
//         return <Calendar className="w-4 h-4" />;
//       case "Transportation":
//         return <Car className="w-4 h-4" />;
//       default:
//         return <Clock className="w-4 h-4" />;
//     }
//   };

//   return (
//     <div className="flex-1 overflow-y-auto p-6">
//       <div className="max-w-6xl mx-auto">
//         <div className="mb-8">
//           <h2 className="text-2xl font-light text-white mb-2">
//             Predictive Services
//           </h2>
//           <p className="text-slate-400">
//             AI-curated recommendations based on your preferences and patterns
//           </p>
//         </div>

//         {/* Stats Overview */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//           <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-400 text-sm">Prediction Accuracy</p>
//                 <p className="text-2xl font-semibold text-white">94%</p>
//               </div>
//               <div className="p-2 bg-green-500/20 rounded-lg">
//                 <TrendingUp className="w-5 h-5 text-green-400" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-400 text-sm">Active Predictions</p>
//                 <p className="text-2xl font-semibold text-white">
//                   {predictiveServices.length}
//                 </p>
//               </div>
//               <div className="p-2 bg-amber-500/20 rounded-lg">
//                 <Brain className="w-5 h-5 text-amber-400" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-400 text-sm">Time Saved</p>
//                 <p className="text-2xl font-semibold text-white">12h</p>
//               </div>
//               <div className="p-2 bg-blue-500/20 rounded-lg">
//                 <Clock className="w-5 h-5 text-blue-400" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Predictive Services Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {predictiveServices.map((service) => (
//             <div
//               key={service.id}
//               className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-6 hover:border-amber-400/50 transition-all duration-200 cursor-pointer group"
//             >
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-amber-400/20 rounded-lg text-amber-400 group-hover:bg-amber-400/30 transition-colors">
//                     {service.icon}
//                   </div>
//                   <div>
//                     <h3 className="text-white font-medium">{service.title}</h3>
//                     <div className="flex items-center space-x-2 mt-1">
//                       <span className="text-xs text-slate-400 flex items-center space-x-1">
//                         {getCategoryIcon(service.category)}
//                         <span>{service.category}</span>
//                       </span>
//                       <span
//                         className={`text-xs px-2 py-1 rounded border ${getUrgencyColor(
//                           service.urgency
//                         )}`}
//                       >
//                         {service.urgency}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <div className="text-sm font-medium text-white">
//                     {service.confidence}%
//                   </div>
//                   <div className="text-xs text-slate-400">confidence</div>
//                 </div>
//               </div>

//               <p className="text-slate-300 text-sm mb-4">
//                 {service.description}
//               </p>

//               <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3 mb-4">
//                 <div className="flex items-center space-x-2 mb-2">
//                   <MapPin className="w-4 h-4 text-amber-400" />
//                   <span className="text-xs font-medium text-amber-400">
//                     AI Reasoning
//                   </span>
//                 </div>
//                 <p className="text-xs text-slate-400">{service.reason}</p>
//               </div>

//               <div className="flex space-x-2">
//                 <button className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
//                   Book Now
//                 </button>
//                 <button className="px-4 py-2 border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 rounded-lg transition-colors text-sm">
//                   Later
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PredictiveTab;

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
