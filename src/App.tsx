import Sidebar from "./components/Sidebar";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import Calendar from "./components/Calendar";
import { useChatContext } from "./context/ChatContext";

function App() {
  const { activePage, showChatWindow } = useChatContext();

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
    </div>
  );
}

export default App;
