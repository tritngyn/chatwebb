import { useState, useEffect, useCallback, type ReactNode } from "react";
import { ChatContext } from "./ChatContext";
import { useChatData } from "../hooks/useChatData";
import type { AppPage } from "../types/types";

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activePage, setActivePage] = useState<AppPage>("chat");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true",
  );
  const [showChatWindow, setShowChatWindow] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((prev) => !prev), []);

  const chatData = useChatData();

  return (
    <ChatContext
      value={{
        activePage,
        setActivePage,
        darkMode,
        toggleDarkMode,
        showChatWindow,
        setShowChatWindow,
        ...chatData,
      }}
    >
      {children}
    </ChatContext>
  );
};
