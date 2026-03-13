import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import Calendar from "./components/Calendar";
import FeaturePopup from "./components/FeaturePopup";
import { useChatContext } from "./context/ChatContext";

function App() {
  const { activePage, showChatWindow } = useChatContext();
  const [showFeaturePopup, setShowFeaturePopup] = useState(false);

  useEffect(() => {
    // Show popup immediately for recruiters every time they visit
    const timer = window.setTimeout(() => {
      setShowFeaturePopup(true);
    }, 450);

    return () => window.clearTimeout(timer);
  }, []);

  const closeFeaturePopup = () => {
    setShowFeaturePopup(false);
    sessionStorage.setItem("chatapp_feature_popup_dismissed", "1");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-100 to-pink-100 dark:from-gray-900 dark:to-gray-950 p-0 md:p-4 lg:p-8 font-sans transition-colors duration-300">
      <div className="flex flex-col md:flex-row w-full h-full max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-none md:rounded-3xl shadow-2xl overflow-hidden border-0 md:border border-gray-100 dark:border-gray-700 transition-colors duration-300 pb-14 md:pb-0">
        <Sidebar />

        {activePage === "chat" && (
          <>
            {/* Mobile: show only one panel at a time */}
            <div
              className={`${showChatWindow ? "hidden" : "flex"} md:flex flex-col flex-1 min-h-0 w-full md:w-auto md:flex-none`}
            >
              <ChatList />
            </div>
            <div
              className={`${showChatWindow ? "flex" : "hidden"} md:flex flex-col flex-1 min-w-0 min-h-0`}
            >
              <ChatWindow />
            </div>
          </>
        )}

        {activePage === "calendar" && <Calendar />}
      </div>

      {!showFeaturePopup && (
        <button
          onClick={() => setShowFeaturePopup(true)}
          className="absolute right-4 md:right-8 bottom-20 md:bottom-8 z-30 rounded-full border border-white/40 dark:border-gray-600 bg-gray-900/80 dark:bg-gray-800/90 backdrop-blur-md px-4 py-2.5 text-xs md:text-sm font-semibold text-white shadow-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Technical Highlights
        </button>
      )}

      <FeaturePopup isOpen={showFeaturePopup} onClose={closeFeaturePopup} />
    </div>
  );
}

export default App;
