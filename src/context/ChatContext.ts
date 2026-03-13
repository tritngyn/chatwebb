import { createContext, useContext } from "react";
import type { ChatRoom, Message, AppPage } from "../types/types";

export interface ChatContextValue {
  // Navigation
  activePage: AppPage;
  setActivePage: (page: AppPage) => void;

  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Chat data
  rooms: ChatRoom[];
  activeRoom: ChatRoom;
  messages: Message[];
  selectRoom: (roomId: number) => void;
  sendMessage: (text: string) => void;
  toggleReaction: (msgId: number, emoji: string) => void;

  // Mobile panel toggle
  showChatWindow: boolean;
  setShowChatWindow: (show: boolean) => void;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

export const useChatContext = (): ChatContextValue => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
};
