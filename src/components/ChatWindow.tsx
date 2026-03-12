import React, { useState, useEffect, useRef } from "react";
import { currentMessages } from "../mockdata"; // Đã xóa import chatRooms
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { faBell, faFaceSmile } from "@fortawesome/free-regular-svg-icons";
import { motion } from "framer-motion";
const ChatWindow = ({ activeRoom, onMessagesUpdate }) => {
  // Nhận activeRoom từ props
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("chat_messages");
    if (savedMessages) {
      return JSON.parse(savedMessages);
    }
    // Gắn thêm mảng reactions rỗng cho dữ liệu mẫu nếu chưa có
    return currentMessages.map((msg) => ({
      ...msg,
      reactions: msg.reactions || [],
    }));
  });

  const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  // State quản lý việc hiển thị Popup chọn Emoji (lưu ID của tin nhắn đang được click)
  const [activeReactionId, setActiveReactionId] = useState(null);
  const [showInputEmoji, setShowInputEmoji] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Đóng popup khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveReactionId(null);
      setShowInputEmoji(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Tải lịch sử chat khi đổi người chat (đổi activeRoom)
  useEffect(() => {
    if (!activeRoom) return;
    const savedMessages = localStorage.getItem(
      `chat_messages_${activeRoom.id}`,
    );
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Dữ liệu mẫu (mock data) cho user id = 1, các user khác rỗng
      setMessages(activeRoom.id === 1 ? currentMessages : []);
    }
  }, [activeRoom?.id]);

  // Lưu lịch sử chat mỗi khi có tin nhắn mới hoặc đổi phòng
  useEffect(() => {
    if (!activeRoom) return;
    localStorage.setItem(
      `chat_messages_${activeRoom.id}`,
      JSON.stringify(messages),
    );
    scrollToBottom();
  }, [messages, activeRoom?.id]);

  const handleSend = () => {
    if (inputText.trim() === "") return;

    const newMessage = {
      id: Date.now(),
      senderId: "me",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputText("");
    // Cập nhật lastMessage trong ChatList sau khi gửi tin nhắn
    onMessagesUpdate?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // Hàm xử lý khi click chọn 1 emoji
  const handleToggleReaction = (msgId, emoji) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === msgId) {
          const currentReactions = msg.reactions || [];
          // Nếu đã thả icon này rồi thì nhấn lại sẽ xóa đi (toggle)
          const isExist = currentReactions.includes(emoji);
          const newReactions = isExist
            ? currentReactions.filter((e) => e !== emoji)
            : [...currentReactions, emoji];

          return { ...msg, reactions: newReactions };
        }
        return msg;
      }),
    );
    // Ẩn popup sau khi chọn
    setActiveReactionId(null);
  };

  return (
    <div className="flex-1 bg-[#f8f9fe] flex flex-col relative rounded-r-3xl">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-pink via-blue-50 to-blue-300 rounded-tr-3xl">
        <div className="w-24"></div>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold text-gray-800">Gold Coast </h2>
          {/* Tên sẽ tự động thay đổi theo người bạn click */}
          <p className="text-xs text-gray-400">Reply from {activeRoom?.name}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500 w-24 justify-end">
          <FontAwesomeIcon
            icon={faBell}
            className="cursor-pointer hover:text-gray-700 text-lg"
          />
        </div>
      </div>

      {/* Khu vực hiển thị tin nhắn */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <div className="text-center text-xs text-gray-400 mb-4">
          Today, 10:30 AM
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === "me";
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 25,
              }} // Hiệu ứng nảy nhẹ (spring)
              className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}
            >
              {!isMe && (
                <img
                  src={activeRoom?.avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover mb-4 shadow-sm"
                />
              )}
              <div
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="relative group">
                  {/* Nút Emoji */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveReactionId(
                        activeReactionId === msg.id ? null : msg.id,
                      );
                    }}
                    className={`absolute top-1/2 -translate-y-1/2 hidden group-hover:flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs transition-all ${isMe ? "-left-8" : "-right-8"}`}
                  >
                    <FontAwesomeIcon icon={faFaceSmile} />
                  </button>

                  {/* Popup Emoji */}
                  {activeReactionId === msg.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute bottom-full mb-2 flex gap-2 bg-white px-3 py-2 rounded-full shadow-lg border border-gray-100 z-10 ${isMe ? "right-0" : "left-0"}`}
                    >
                      {EMOJIS.map((emoji) => (
                        <span
                          key={emoji}
                          onClick={() => handleToggleReaction(msg.id, emoji)}
                          className={`cursor-pointer text-lg hover:scale-125 transition-transform ${msg.reactions?.includes(emoji) ? "bg-blue-50 rounded-full" : ""}`}
                        >
                          {emoji}
                        </span>
                      ))}
                    </motion.div>
                  )}

                  {/* Bong bóng tin nhắn */}
                  <div
                    className={`relative px-5 py-3 rounded-2xl max-w-md ${
                      isMe
                        ? "bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-br-sm shadow-md shadow-blue-200"
                        : "bg-white text-gray-700 rounded-bl-sm shadow-sm border border-gray-50"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div
                        className={`absolute -bottom-3 ${isMe ? "right-2" : "left-2"} flex items-center bg-white border border-gray-100 shadow-sm rounded-full px-1.5 py-0.5 text-xs`}
                      >
                        {msg.reactions.join("")}
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-gray-400 mt-1 mx-1">
                  {msg.time}
                </span>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Khu vực nhập liệu */}
      <div className="p-6 bg-white rounded-br-3xl">
        <div className="relative flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          {/* Nút mở Emoji Picker cho input */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <FontAwesomeIcon
              icon={faFaceSmile}
              className="text-gray-400 text-xl cursor-pointer hover:text-gray-600 mr-3"
              onClick={() => setShowInputEmoji(!showInputEmoji)}
            />
            {showInputEmoji && (
              <div className="absolute bottom-full mb-3 left-0 flex gap-2 bg-white px-3 py-2 rounded-full shadow-[0_4px_15px_rgb(0,0,0,0.1)] border border-gray-100 z-10">
                {EMOJIS.map((emoji) => (
                  <span
                    key={emoji}
                    onClick={() => {
                      setInputText((prev) => prev + emoji);
                      setShowInputEmoji(false);
                    }}
                    className="cursor-pointer text-lg hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 py-1"
          />

          <button
            onClick={handleSend}
            className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 shadow-md shadow-blue-200 transition-colors ml-2 z-0"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="z-10" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
