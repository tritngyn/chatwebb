import { useState, useCallback, useEffect, useRef } from "react";
import { chatRooms, roomMessages } from "../mockdata";
import type { ChatRoom, Message } from "../types/types";
import { generateFakeUserReply } from "../services/fakeUserBot";

// --- LocalStorage helpers ---
const SEND_DELAY_MS = 500;
const BOT_REPLY_DELAY_MS = 900;
const ROOMS_META_KEY = "chat_rooms_meta";
const MAX_CONTEXT_MESSAGES = 12;

interface RoomMeta {
  id: number;
  isActive: boolean;
  unread: number;
}

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

const moveRoomToTop = (rooms: ChatRoom[], roomId: number): ChatRoom[] => {
  const roomIndex = rooms.findIndex((r) => r.id === roomId);
  if (roomIndex <= 0) return rooms;
  const next = [...rooms];
  const [target] = next.splice(roomIndex, 1);
  next.unshift(target);
  return next;
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
    const { lastMessage, time } = getLastMessageFromStorage(
      room.id,
      room.lastMessage,
      room.time,
    );
    return { ...room, lastMessage, time };
  });

// --- Room metadata persistence ---
const getRoomsMetaFromStorage = (): RoomMeta[] | null => {
  try {
    const saved = localStorage.getItem(ROOMS_META_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const saveRoomsMetaToStorage = (rooms: ChatRoom[]) => {
  const meta: RoomMeta[] = rooms.map((r) => ({
    id: r.id,
    isActive: r.isActive,
    unread: r.unread,
  }));
  localStorage.setItem(ROOMS_META_KEY, JSON.stringify(meta));
};

/**
 * Merge saved metadata (order, active, unread) with mockdata rooms.
 * - Rooms are ordered according to saved order
 * - New rooms from mockdata (not in saved) are appended at the end
 * - Rooms removed from mockdata are dropped
 */
const buildInitialRooms = (): ChatRoom[] => {
  const savedMeta = getRoomsMetaFromStorage();
  if (!savedMeta || savedMeta.length === 0) {
    return buildEnrichedRooms(chatRooms);
  }

  const mockMap = new Map(chatRooms.map((r) => [r.id, r]));
  const result: ChatRoom[] = [];
  const usedIds = new Set<number>();

  // Restore saved order + metadata
  for (const meta of savedMeta) {
    const base = mockMap.get(meta.id);
    if (!base) continue; // room deleted from mockdata
    result.push({ ...base, isActive: meta.isActive, unread: meta.unread });
    usedIds.add(meta.id);
  }

  // Append new rooms from mockdata
  for (const room of chatRooms) {
    if (!usedIds.has(room.id)) {
      result.push({ ...room, isActive: false });
    }
  }

  return buildEnrichedRooms(result);
};

// --- Custom Hook: useChatData ---
export const useChatData = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>(() => buildInitialRooms());
  const isInitialMount = useRef(true);

  const activeRoom = rooms.find((r) => r.isActive) ?? rooms[0];
  const activeRoomId = activeRoom?.id;
  const activeRoomIdRef = useRef<number | undefined>(activeRoomId);

  // Load messages for initial active room
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!activeRoom) return [];
    return (
      getMessagesFromStorage(activeRoom.id) ?? roomMessages[activeRoom.id] ?? []
    );
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (activeRoomId == null) return;
    saveMessagesToStorage(activeRoomId, messages);
  }, [messages, activeRoomId]);

  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  // Save room metadata (order, active, unread) whenever rooms change
  useEffect(() => {
    // Skip saving on initial mount to avoid overwriting with stale enriched data
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveRoomsMetaToStorage(rooms);
  }, [rooms]);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;

      // Sync messages for the active room
      if (
        activeRoomId != null &&
        e.key === `chat_messages_${activeRoomId}` &&
        e.newValue
      ) {
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

      // Sync room metadata from other tabs
      if (e.key === ROOMS_META_KEY && e.newValue) {
        try {
          const meta: RoomMeta[] = JSON.parse(e.newValue);
          setRooms((prev) => {
            const map = new Map(prev.map((r) => [r.id, r]));
            return buildEnrichedRooms(
              meta
                .filter((m) => map.has(m.id))
                .map((m) => ({
                  ...map.get(m.id)!,
                  isActive: m.isActive,
                  unread: m.unread,
                })),
            );
          });
        } catch {
          // ignore
        }
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

      const trimmedText = text.trim();
      const roomId = activeRoomId;
      const roomName =
        rooms.find((room) => room.id === roomId)?.name ?? "Unknown";

      const newMsg: Message = {
        id: Date.now(),
        senderId: "me",
        text: trimmedText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sending",
      };

      const baseMessages =
        getMessagesFromStorage(roomId) ?? roomMessages[roomId] ?? [];
      const optimisticMessages = [...baseMessages, newMsg];

      saveMessagesToStorage(roomId, optimisticMessages);
      if (activeRoomIdRef.current === roomId) {
        setMessages(optimisticMessages);
      }
      setRooms((prev) => moveRoomToTop(buildEnrichedRooms(prev), roomId));

      // Simulate network delay → flip status to "sent"
      setTimeout(() => {
        const latestMessages =
          getMessagesFromStorage(roomId) ?? optimisticMessages;
        const confirmedMessages: Message[] = latestMessages.map((m) =>
          m.id === newMsg.id ? { ...m, status: "sent" as const } : m,
        );

        saveMessagesToStorage(roomId, confirmedMessages);
        if (activeRoomIdRef.current === roomId) {
          setMessages(confirmedMessages);
        }
        setRooms((prev) => moveRoomToTop(buildEnrichedRooms(prev), roomId));

        const contextMessages = confirmedMessages.slice(-MAX_CONTEXT_MESSAGES);
        setTimeout(async () => {
          const botReplyText = await generateFakeUserReply({
            roomName,
            conversation: contextMessages,
            userMessage: trimmedText,
          });

          const botMessage: Message = {
            id: Date.now() + 1,
            senderId: roomId,
            text: botReplyText,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          const currentRoomMessages =
            getMessagesFromStorage(roomId) ?? confirmedMessages;
          const withBotReply: Message[] = [...currentRoomMessages, botMessage];

          saveMessagesToStorage(roomId, withBotReply);
          if (activeRoomIdRef.current === roomId) {
            setMessages(withBotReply);
          }

          setRooms((prev) => {
            const withUnread = prev.map((room) => {
              if (room.id !== roomId) return room;
              if (room.isActive) return room;
              return { ...room, unread: room.unread + 1 };
            });
            return moveRoomToTop(buildEnrichedRooms(withUnread), roomId);
          });
        }, BOT_REPLY_DELAY_MS);
      }, SEND_DELAY_MS);
    },
    [activeRoomId, rooms],
  );

  const toggleReaction = useCallback((msgId: number, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== msgId) return msg;
        const current = msg.reactions ?? [];
        const exists = current.includes(emoji);
        return {
          ...msg,
          reactions: exists
            ? current.filter((e) => e !== emoji)
            : [...current, emoji],
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
