import { currentUser } from "../mockdata.ts";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChatContext } from "../context/ChatContext";
import type { AppPage } from "../types/types";

const menuItems: { icon: string; label: string; page: AppPage }[] = [
  { icon: "fa-solid fa-border-all", label: "Dashboard", page: "dashboard" },
  { icon: "fa-regular fa-comment-dots", label: "Chat", page: "chat" },
  { icon: "fa-regular fa-calendar", label: "Calendar", page: "calendar" },
  { icon: "fa-solid fa-gear", label: "Settings", page: "settings" },
];

const Sidebar = () => {
  const { activePage, setActivePage, darkMode, toggleDarkMode } =
    useChatContext();

  return (
    <>
      {/* ── Desktop / Tablet: vertical sidebar ── */}
      <div className="hidden md:flex md:w-16 lg:w-60 bg-gradient-to-b from-[#f3f4fc] to-[#e8e9f6] dark:from-gray-900 dark:to-gray-800 border-r border-gray-100 dark:border-gray-700 flex-col py-6 px-2 lg:px-4 items-center lg:items-start transition-colors duration-300 flex-shrink-0">
        <div className="flex flex-col lg:flex-row items-center w-full mb-8 gap-3 cursor-pointer">
          <img
            src={currentUser.avatar}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover shadow-sm"
          />
          <div className="hidden lg:block flex-1">
            <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">
              {currentUser.name}{" "}
              <i className="fa-solid fa-chevron-down text-xs ml-1 text-gray-400"></i>
            </h3>
          </div>
        </div>

        <div className="flex flex-col w-full gap-2">
          {menuItems.map((item) => (
            <div
              key={item.page}
              onClick={() => setActivePage(item.page)}
              className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-colors ${
                activePage === item.page
                  ? "bg-white dark:bg-gray-700 shadow-sm text-blue-500"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
              }`}
            >
              <i className={`${item.icon} text-lg w-6 text-center`}></i>
              <span className="hidden lg:block font-medium text-sm">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center justify-start gap-3 p-3 rounded-full w-full cursor-pointer transition-all text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
        >
          <FontAwesomeIcon
            icon={darkMode ? faSun : faMoon}
            className="text-lg w-6"
          />
          <span className="hidden lg:block font-medium text-sm">
            {darkMode ? "Light Mode" : "Dark Mode"}
          </span>
        </button>
      </div>

      {/* ── Mobile: fixed bottom tab bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 h-14 px-2 transition-colors duration-300">
        {menuItems.map((item) => (
          <button
            key={item.page}
            onClick={() => setActivePage(item.page)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full cursor-pointer transition-colors ${
              activePage === item.page
                ? "text-blue-500"
                : "text-gray-400 active:text-gray-600 dark:active:text-gray-200"
            }`}
          >
            <i className={`${item.icon} text-lg`}></i>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        <button
          onClick={toggleDarkMode}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full cursor-pointer transition-colors text-gray-400 active:text-gray-600 dark:active:text-gray-200"
        >
          <FontAwesomeIcon
            icon={darkMode ? faSun : faMoon}
            className="text-lg"
          />
          <span className="text-[10px] font-medium">
            {darkMode ? "Light" : "Dark"}
          </span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
