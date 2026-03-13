import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faServer,
  faLayerGroup,
  faCheck,
  faCodeBranch,
} from "@fortawesome/free-solid-svg-icons";

interface FeaturePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  {
    title: "AI Integration via Groq REST API",
    description: "Built a reactive chatbot system using Groq's LLMs. Implemented custom context windowing to maintain conversation history and persona-based prompt engineering without heavy SDKs.",
    icon: faRobot,
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-500/20",
  },
  {
    title: "Robust State Management",
    description: "Engineered complex local persistence combining React state and localStorage. Handles unread badges, active threads, and cross-tab synchronization with optimistic UI updates.",
    icon: faServer,
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-500/20",
  },
  {
    title: "Data Control & Performance",
    description: "Optimized rendering via lazy loading of message histories. Implemented strict dependency arrays, memoization strategies, and controlled re-renders to maintain 60fps snappy interactions.",
    icon: faLayerGroup,
    color: "text-purple-500 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-500/20",
  },
];

const FeaturePopup = ({ isOpen, onClose }: FeaturePopupProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with click-outside */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/20 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 shadow-2xl z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header section */}
            <div className="bg-slate-50 dark:bg-gray-800/50 px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 mb-3">
                  <FontAwesomeIcon icon={faCodeBranch} className="text-[11px]" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    Project Architecture
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  Technical Implementation Highlights
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                  A high-performance frontend demonstrating React architecture, state persistence, and AI API integration.
                </p>
              </div>
            </div>

            {/* Features section */}
            <div className="px-6 py-5 space-y-4">
              {features.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  className="flex items-start gap-4"
                >
                  <div className={`mt-0.5 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg ${item.bg} ${item.color}`}>
                    <FontAwesomeIcon icon={item.icon} className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer action */}
            <div className="bg-slate-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-white transition-colors active:scale-[0.98]"
              >
                <FontAwesomeIcon icon={faCheck} />
                <span>Explore Application</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FeaturePopup;
