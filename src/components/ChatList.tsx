import { useState } from "react";
import { motion } from "framer-motion";
import type { ChatRoom } from "../types/types";

interface ChatListProps {
  rooms: ChatRoom[];
  onSelectRoom: (roomId: number) => void;
}

const ChatList = ({ rooms, onSelectRoom }: ChatListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  return (
    <div className="w-72 md:w-80 bg-gradient-to-b from-white to-blue-50/30 dark:from-gray-800 dark:to-gray-850 border-r border-gray-100 dark:border-gray-700 flex flex-col relative z-10 transition-colors duration-300">
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">ChatApp</h1>
        <div className="relative group">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm group-focus-within:text-blue-500 transition-colors"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-white dark:bg-gray-700 shadow-sm hover:shadow-md text-sm rounded-full py-2.5 pl-10 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {filteredRooms.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <i className="fa-solid fa-magnifying-glass text-2xl mb-2"></i>
            <p className="text-sm">No results for "{searchQuery}"</p>
          </div>
        )}

        {filteredRooms.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onSelectRoom(room.id)}
            className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
              room.isActive
                ? "bg-white dark:bg-gray-700 shadow-[0_8px_20px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_20px_rgb(0,0,0,0.3)] border border-gray-50 dark:border-gray-600 scale-105 my-2 z-10 relative"
                : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <img
              src={room.avatar}
              alt={room.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">
                  {room.name}
                </h4>
                <span className="text-[11px] text-gray-400">{room.time}</span>
              </div>
              <p
                className={`text-xs truncate ${room.isActive ? "text-gray-600 dark:text-gray-300" : "text-gray-400"}`}
              >
                {room.lastMessage}
              </p>
            </div>
            {room.unread > 0 && !room.isActive && (
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
