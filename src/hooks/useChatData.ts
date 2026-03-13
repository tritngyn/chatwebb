import { useState, useCallback, useEffect } from "react";
import { chatRooms, roomMessages } from "../mockdata";
import type { ChatRoom, Message } from "../types/types";

// --- LocalStorage helpers ---
const SEND_DELAY_MS = 500;

const getMessagesFromStorage = (roomId: number): Message[] | null => {
  try {
    const saved = localStorage.getItem(`chat_messages_${roomId}`);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const saveMessagesToStorage = (roomId: number, messages: Message[]) => {
  localStorage.setItem(`chat_messages_${roomId}`, JSON.stringify(messages));
};

const getLastMessageFromStorage = (
  roomId: number,
  fallbackMessage: string,
  fallbackTime: string,
): { lastMessage: string; time: string } => {
  const msgs = getMessagesFromStorage(roomId);
  if (msgs && msgs.length > 0) {
    const last = msgs[msgs.length - 1];
    return { lastMessage: last.text, time: last.time };
  }
  return { lastMessage: fallbackMessage, time: fallbackTime };
};

const buildEnrichedRooms = (baseRooms: ChatRoom[]): ChatRoom[] =>
  baseRooms.map((room) => {
    const { lastMessage, time } = getLastMessageFromStorage(room.id, room.lastMessage, room.time);
    return { ...room, lastMessage, time };
  });

// --- Custom Hook: useChatData ---
export const useChatData = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>(() => buildEnrichedRooms(chatRooms));

  const activeRoom = rooms.find((r) => r.isActive) ?? rooms[0];
  const activeRoomId = activeRoom?.id;

  // Load messages for initial active room
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!activeRoom) return [];
    return getMessagesFromStorage(activeRoom.id) ?? roomMessages[activeRoom.id] ?? [];
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (activeRoomId == null) return;
    saveMessagesToStorage(activeRoomId, messages);
  }, [messages, activeRoomId]);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;

      // Sync messages for the active room
      if (activeRoomId != null && e.key === `chat_messages_${activeRoomId}` && e.newValue) {
        try {
          const updatedMessages: Message[] = JSON.parse(e.newValue);
          setMessages(updatedMessages);
        } catch {
          // ignore parse errors from other tabs
        }
      }

      // Sync any room's lastMessage update
      if (e.key.startsWith("chat_messages_")) {
        setRooms((prev) => buildEnrichedRooms(prev));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [activeRoomId]);

  const selectRoom = useCallback((roomId: number) => {
    setRooms((prev) =>
      buildEnrichedRooms(
        prev.map((room) => ({
          ...room,
          isActive: room.id === roomId,
          unread: room.id === roomId ? 0 : room.unread,
        })),
      ),
    );
    // Load messages for the newly selected room
    const saved = getMessagesFromStorage(roomId);
    setMessages(saved ?? roomMessages[roomId] ?? []);
  }, []);

  // Optimistic UI: send message with "sending" status, then confirm after delay
  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || activeRoomId == null) return;

      const newMsg: Message = {
        id: Date.now(),
        senderId: "me",
        text: text.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "sending",
      };

      setMessages((prev) => [...prev, newMsg]);

      // Simulate network delay → flip status to "sent"
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === newMsg.id ? { ...m, status: "sent" } : m)),
        );
        // Update room list order: push active room to top
        setRooms((prev) => {
          const enriched = buildEnrichedRooms(prev);
          const activeIdx = enriched.findIndex((r) => r.isActive);
          if (activeIdx > 0) {
            const [active] = enriched.splice(activeIdx, 1);
            enriched.unshift(active);
          }
          return enriched;
        });
      }, SEND_DELAY_MS);
    },
    [activeRoomId],
  );

  const toggleReaction = useCallback((msgId: number, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== msgId) return msg;
        const current = msg.reactions ?? [];
        const exists = current.includes(emoji);
        return {
          ...msg,
          reactions: exists ? current.filter((e) => e !== emoji) : [...current, emoji],
        };
      }),
    );
  }, []);

  return {
    rooms,
    activeRoom,
    messages,
    selectRoom,
    sendMessage,
    toggleReaction,
  };
};
