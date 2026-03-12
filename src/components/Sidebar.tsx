import { currentUser } from "../mockdata";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

const Sidebar = ({ activePage, onPageChange, darkMode, onToggleDark }: SidebarProps) => {
  const menuItems = [
    { icon: "fa-solid fa-border-all", label: "Dashboard", page: "dashboard" },
    { icon: "fa-regular fa-comment-dots", label: "Chat", page: "chat" },
    { icon: "fa-regular fa-calendar", label: "Calendar", page: "calendar" },
    { icon: "fa-solid fa-gear", label: "Settings", page: "settings" },
  ];

  return (
    <div className="w-20 md:w-60 bg-gradient-to-b from-[#f3f4fc] to-[#e8e9f6] dark:from-gray-900 dark:to-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col py-6 px-4 items-center md:items-start transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-center w-full mb-8 gap-3 cursor-pointer">
        <img
          src={currentUser.avatar}
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover shadow-sm"
        />
        <div className="hidden md:block flex-1">
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
            onClick={() => onPageChange(item.page)}
            className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-colors ${
              activePage === item.page
                ? "bg-white dark:bg-gray-700 shadow-sm text-blue-500"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
            }`}
          >
            <i className={`${item.icon} text-lg w-6 text-center`}></i>
            <span className="hidden md:block font-medium text-sm">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Dark/Light Mode Toggle */}
      <button
        onClick={onToggleDark}
        className="flex items-center justify-start gap-3 p-3 rounded-full w-full cursor-pointer transition-all text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
      >
        <FontAwesomeIcon icon={darkMode ? faSun : faMoon} className="text-lg w-6" />
        <span className="hidden md:block font-medium text-sm">
          {darkMode ? "Light Mode" : "Dark Mode"}
        </span>
      </button>
    </div>
  );
};

export default Sidebar;
