import { useState, useCallback, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import Calendar from "./components/Calendar";
import { chatRooms } from "./mockdata";
import type { ChatRoom } from "./types/types";

// Đọc lastMessage và time từ localStorage cho mỗi phòng chat
const getLastMessageFromStorage = (
  roomId: number,
  fallbackMessage: string,
  fallbackTime: string,
): { lastMessage: string; time: string } => {
  try {
    const saved = localStorage.getItem(`chat_messages_${roomId}`);
    if (saved) {
      const msgs = JSON.parse(saved);
      if (msgs.length > 0) {
        const last = msgs[msgs.length - 1];
        return { lastMessage: last.text, time: last.time };
      }
    }
  } catch (e) {
    // Nếu parse lỗi thì dùng fallback
  }
  return { lastMessage: fallbackMessage, time: fallbackTime };
};

// Tạo danh sách rooms đã được enrich từ localStorage
const buildEnrichedRooms = (baseRooms: ChatRoom[]): ChatRoom[] => {
  return baseRooms.map((room) => {
    const { lastMessage, time } = getLastMessageFromStorage(
      room.id,
      room.lastMessage,
      room.time,
    );
    return { ...room, lastMessage, time };
  });
};

function App() {
  const [activePage, setActivePage] = useState("chat");

  // Dark mode state — đọc từ localStorage hoặc mặc định light
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // Toggle class "dark" trên <html> và lưu vào localStorage
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  // Quản lý danh sách các phòng chat bằng State
  const [rooms, setRooms] = useState(() => buildEnrichedRooms(chatRooms));

  // Hàm xử lý khi click vào một nhóm chat
  const handleSelectRoom = (roomId: number) => {
    setRooms((prev) =>
      buildEnrichedRooms(
        prev.map((room) => ({
          ...room,
          isActive: room.id === roomId,
          unread: room.id === roomId ? 0 : room.unread,
        })),
      ),
    );
  };

  // Callback khi ChatWindow cập nhật tin nhắn → cập nhật lại lastMessage + đẩy phòng active lên đầu
  const handleMessagesUpdate = useCallback(() => {
    setRooms((prev) => {
      const enriched = buildEnrichedRooms(prev);
      const activeIndex = enriched.findIndex((r) => r.isActive);
      if (activeIndex > 0) {
        const [activeRoom] = enriched.splice(activeIndex, 1);
        enriched.unshift(activeRoom);
      }
      return enriched;
    });
  }, []);

  // Tìm phòng chat đang được active để truyền sang ChatWindow
  const activeRoom = rooms.find((room) => room.isActive) || rooms[0];

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-100 to-pink-100 dark:from-gray-900 dark:to-gray-950 p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="flex w-full h-full max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <Sidebar
          activePage={activePage}
          onPageChange={setActivePage}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(!darkMode)}
        />

        {activePage === "chat" && (
          <>
            <ChatList rooms={rooms} onSelectRoom={handleSelectRoom} />
            <ChatWindow
              activeRoom={activeRoom}
              onMessagesUpdate={handleMessagesUpdate}
            />
          </>
        )}

        {activePage === "calendar" && <Calendar />}
      </div>
    </div>
  );
}

export default App;
