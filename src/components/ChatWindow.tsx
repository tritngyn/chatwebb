import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faBell, faFaceSmile } from "@fortawesome/free-regular-svg-icons";
import { motion } from "framer-motion";
import { useChatContext } from "../context/ChatContext";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const ChatWindow = () => {
  const {
    activeRoom,
    messages,
    sendMessage,
    toggleReaction,
    setShowChatWindow,
  } = useChatContext();

  const [inputText, setInputText] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);
  const [activeReactionId, setActiveReactionId] = useState<number | null>(null);
  const [showInputEmoji, setShowInputEmoji] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveReactionId(null);
      setShowInputEmoji(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Keep scroll inside chat window only (avoid scrolling the full page)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, activeRoom?.id]);

  const handleSend = () => {
    const trimmedText = inputText.trim();
    if (!trimmedText || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    sendMessage(trimmedText);
    setInputText("");
    queueMicrotask(() => {
      isSubmittingRef.current = false;
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="flex-1 min-h-0 bg-[#f8f9fe] dark:bg-gray-900 flex flex-col relative rounded-none md:rounded-r-3xl transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center p-3 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-pink-50 via-blue-50 to-blue-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-750 md:rounded-tr-3xl transition-colors duration-300">
        {/* Back button (mobile only) + spacer */}
        <div className="w-16 md:w-24 flex items-center">
          <button
            onClick={() => setShowChatWindow(false)}
            className="flex md:hidden items-center justify-center w-8 h-8 rounded-full hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </div>
        <div className="flex flex-col items-center min-w-0">
          <h2 className="text-base md:text-xl font-bold text-gray-800 dark:text-gray-100 truncate">
            {activeRoom?.name}
          </h2>
          <p className="text-xs text-gray-400 truncate">
            Reply from {activeRoom?.name}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 w-16 md:w-24 justify-end">
          <FontAwesomeIcon
            icon={faBell}
            className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 text-lg"
          />
        </div>
      </div>

      {/* Khu vực hiển thị tin nhắn */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6 custom-scrollbar"
      >
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
              }}
              className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}
            >
              {!isMe && (
                <img
                  src={activeRoom?.avatar}
                  alt="avatar"
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover mb-4 shadow-sm flex-shrink-0"
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
                    className={`absolute top-1/2 -translate-y-1/2 group-hover:flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 text-xs transition-all ${isMe ? "-left-8" : "-right-8"}`}
                  >
                    <FontAwesomeIcon icon={faFaceSmile} />
                  </button>

                  {/* Popup Emoji */}
                  {activeReactionId === msg.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute bottom-full mb-2 flex gap-2 bg-white dark:bg-gray-700 px-3 py-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-600 z-10 ${isMe ? "right-0" : "left-0"}`}
                    >
                      {EMOJIS.map((emoji) => (
                        <span
                          key={emoji}
                          onClick={() => {
                            toggleReaction(msg.id, emoji);
                            setActiveReactionId(null);
                          }}
                          className={`cursor-pointer text-lg hover:scale-125 transition-transform ${msg.reactions?.includes(emoji) ? "bg-blue-50 dark:bg-blue-900/50 rounded-full" : ""}`}
                        >
                          {emoji}
                        </span>
                      ))}
                    </motion.div>
                  )}

                  {/* Bong bóng tin nhắn */}
                  <div
                    className={`relative px-4 py-2.5 md:px-5 md:py-3 rounded-2xl max-w-[75vw] md:max-w-md ${
                      isMe
                        ? "bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-br-sm shadow-md shadow-blue-200 dark:shadow-blue-900/30"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-bl-sm shadow-sm border border-gray-50 dark:border-gray-600"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div
                        className={`absolute -bottom-3 ${isMe ? "right-2" : "left-2"} flex items-center bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 shadow-sm rounded-full px-1.5 py-0.5 text-xs`}
                      >
                        {msg.reactions.join("")}
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-gray-400 mt-1 mx-1">
                  {msg.time}
                  {msg.status === "sending" && (
                    <span className="ml-1 italic text-blue-400">
                      Sending...
                    </span>
                  )}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Khu vực nhập liệu */}
      <form
        onSubmit={handleSubmit}
        className="p-3 md:p-6 bg-white dark:bg-gray-800 md:rounded-br-3xl transition-colors duration-300"
      >
        <div className="relative flex items-center bg-gray-50 dark:bg-gray-700 rounded-full px-3 md:px-4 py-2 border border-gray-100 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900 transition-all">
          {/* Nút mở Emoji Picker cho input */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <FontAwesomeIcon
              icon={faFaceSmile}
              className="text-gray-400 text-xl cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 mr-2 md:mr-3"
              onClick={() => setShowInputEmoji(!showInputEmoji)}
            />
            {showInputEmoji && (
              <div className="absolute bottom-full mb-3 left-0 flex gap-2 bg-white dark:bg-gray-700 px-3 py-2 rounded-full shadow-[0_4px_15px_rgb(0,0,0,0.1)] dark:shadow-[0_4px_15px_rgb(0,0,0,0.4)] border border-gray-100 dark:border-gray-600 z-10">
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
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 py-1"
          />

          <button
            type="submit"
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 shadow-md shadow-blue-200 dark:shadow-blue-900/30 transition-colors ml-2 z-0"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="z-10" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
