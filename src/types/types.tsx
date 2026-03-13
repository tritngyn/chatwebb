export interface User {
  id: string | number;
  name: string;
  avatar: string;
}

export interface Message {
  id: number;
  senderId: string | number;
  text: string;
  time: string;
  reactions?: string[];
  status?: "sending" | "sent";
}

export interface ChatRoom {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  isActive: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  color: string;
  description?: string;
}

/** Utility types */
export type ChatRoomPreview = Pick<
  ChatRoom,
  "id" | "name" | "avatar" | "lastMessage" | "time" | "unread"
>;
export type MessageWithoutStatus = Omit<Message, "status">;

/** Page type for navigation */
export type AppPage = "dashboard" | "chat" | "calendar" | "settings";
