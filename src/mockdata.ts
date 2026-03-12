// src/mockData.js
import type { User, ChatRoom, Message } from "./types/types";
// Thông tin người dùng hiện tại (Hiển thị ở Sidebar)
export const currentUser: User = {
  id: "me",
  name: "Nguyễn Triết",
  avatar: "https://i.pravatar.cc/150?u=triet",
};

// Danh sách các cuộc hội thoại (Hiển thị ở ChatList)
export const chatRooms: ChatRoom[] = [
  {
    id: 1,
    name: "Trần Minh Khôi",
    lastMessage: "Tối nay họp nhóm nhé, 8h đúng nha!",
    time: "10:30",
    unread: 2,
    avatar: "https://i.pravatar.cc/150?u=khoi",
    isActive: true,
  },
  {
    id: 2,
    name: "Lê Thị Mai Anh",
    lastMessage: "Gửi bạn file thiết kế mới nè",
    time: "09:30",
    unread: 1,
    avatar: "https://i.pravatar.cc/150?u=maianh",
    isActive: false,
  },
  {
    id: 3,
    name: "Phạm Hoàng Long",
    lastMessage: "Ok bạn, mình đã merge PR rồi",
    time: "Hôm qua",
    unread: 0,
    avatar: "https://i.pravatar.cc/150?u=hoanglong",
    isActive: false,
  },
  {
    id: 4,
    name: "Võ Ngọc Hân",
    lastMessage: "Cuối tuần đi cafe không?",
    time: "Hôm qua",
    unread: 0,
    avatar: "https://i.pravatar.cc/150?u=ngochan",
    isActive: false,
  },
  {
    id: 5,
    name: "Đặng Quốc Bảo",
    lastMessage: "Deploy thành công rồi nha 🎉",
    time: "Hôm qua",
    unread: 0,
    avatar: "https://i.pravatar.cc/150?u=quocbao",
    isActive: false,
  },
  {
    id: 6,
    name: "Ngô Thanh Tùng",
    lastMessage: "Anh xem lại API giúp em với",
    time: "Thứ 2",
    unread: 0,
    avatar: "https://i.pravatar.cc/150?u=thanhtung",
    isActive: false,
  },
  {
    id: 7,
    name: "Bùi Khánh Linh",
    lastMessage: "Chị ơi cho em hỏi cái này...",
    time: "Thứ 2",
    unread: 3,
    avatar: "https://i.pravatar.cc/150?u=khanhlinh",
    isActive: false,
  },
  {
    id: 8,
    name: "Huỳnh Đức Huy",
    lastMessage: "Meeting sáng mai bị dời lại 10h",
    time: "Thứ 7",
    unread: 0,
    avatar: "https://i.pravatar.cc/150?u=duchuy",
    isActive: false,
  },
  {
    id: 9,
    name: "Trương Thùy Dương",
    lastMessage: "Cảm ơn bạn nhiều nha! 😊",
    time: "Thứ 6",
    unread: 0,
    avatar: "https://i.pravatar.cc/150?u=thuyduong",
    isActive: false,
  },
  {
    id: 10,
    name: "Lý Văn Tâm",
    lastMessage: "Bug đã fix xong, test lại giúp mình",
    time: "Thứ 5",
    unread: 1,
    avatar: "https://i.pravatar.cc/150?u=vantam",
    isActive: false,
  },
];

// Chi tiết các tin nhắn trong cuộc trò chuyện với Trần Minh Khôi
export const currentMessages: Message[] = [
  {
    id: 1,
    senderId: 1,
    text: "Ê, tối nay họp nhóm nhé!",
    time: "10:30",
  },
  {
    id: 2,
    senderId: "me",
    text: "Ok bạn, 8h đúng ha?",
    time: "10:32",
  },
  {
    id: 3,
    senderId: 1,
    text: "Ừ, 8h đúng nha. Nhớ chuẩn bị slide demo nữa!",
    time: "10:33",
  },
  {
    id: 4,
    senderId: "me",
    text: "Rồi, mình làm gần xong rồi. Gửi trước cho bạn review nhé",
    time: "10:35",
  },
  {
    id: 5,
    senderId: 1,
    text: "Tốt lắm! Gửi qua drive luôn nha 👍",
    time: "10:37",
  },
];
