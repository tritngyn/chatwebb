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
  reactions?: string[]; // Dấu ? nghĩa là có thể có hoặc không
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
