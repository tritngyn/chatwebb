import { useState, useCallback, useEffect, useRef } from "react";
import { chatRooms, roomMessages } from "../mockdata";
import type { ChatRoom, Message } from "../types/types";
import { generateFakeUserReply } from "../services/fakeUserBot";

// --- LocalStorage helpers ---
const SEND_DELAY_MS = 500;
const BOT_REPLY_DELAY_MS = 900;
const ROOMS_META_KEY = "chat_rooms_meta";
const MAX_CONTEXT_MESSAGES = 12;
const INITIAL_VISIBLE_MESSAGES = 30;
const LOAD_MORE_MESSAGES = 40;
const LOAD_MORE_DELAY_MS = 250;
const STARTUP_AI_MESSAGE_START_DELAYS = [500, 1700] as const;
const STARTUP_AI_TYPING_RANGE = [1200, 2200] as const;
const STARTUP_AI_MESSAGE_COUNT = 2;
const STARTUP_AI_MESSAGES = [
  "Hey, just checking in before the next meeting.",
  "I left you a quick update in case you were offline.",
  "Can you take a look when you have a minute?",
  "Small update from my side, nothing urgent.",
  "I have a follow-up for you when you're back.",
  "Quick ping, I just sent over the latest context.",
] as const;

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

const getRoomMessages = (roomId: number): Message[] => {
  const savedMessages = getMessagesFromStorage(roomId);
  const seededMessages = roomMessages[roomId] ?? [];

  if (!savedMessages || savedMessages.length === 0) {
    return seededMessages;
  }

  // Migrate older local data so lazy-load still has a long history to work with.
  if (savedMessages.length < seededMessages.length) {
    return seededMessages;
  }

  return savedMessages;
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
  const msgs = getRoomMessages(roomId);
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
  const startupSimulationRanRef = useRef(false);
  const startupTimersRef = useRef<number[]>([]);

  const activeRoom = rooms.find((r) => r.isActive) ?? rooms[0];
  const activeRoomId = activeRoom?.id;
  const activeRoomIdRef = useRef<number | undefined>(activeRoomId);

  // Load messages for initial active room
  const [allMessages, setAllMessages] = useState<Message[]>(() => {
    if (!activeRoom) return [];
    return getRoomMessages(activeRoom.id);
  });
  const [visibleCounts, setVisibleCounts] = useState<Record<number, number>>(
    () =>
      activeRoom?.id != null
        ? { [activeRoom.id]: INITIAL_VISIBLE_MESSAGES }
        : {},
  );
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const loadOlderTimeoutRef = useRef<number | null>(null);

  const activeVisibleCount =
    activeRoomId == null
      ? INITIAL_VISIBLE_MESSAGES
      : visibleCounts[activeRoomId] ?? INITIAL_VISIBLE_MESSAGES;
  const messages =
    activeVisibleCount >= allMessages.length
      ? allMessages
      : allMessages.slice(-activeVisibleCount);
  const hasMoreMessages = allMessages.length > messages.length;

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (activeRoomId == null) return;
    saveMessagesToStorage(activeRoomId, allMessages);
  }, [allMessages, activeRoomId]);

  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(
    () => () => {
      if (loadOlderTimeoutRef.current != null) {
        window.clearTimeout(loadOlderTimeoutRef.current);
      }
      startupTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  // Save room metadata (order, active, unread) whenever rooms change
  useEffect(() => {
    // Skip saving on initial mount to avoid overwriting with stale enriched data
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveRoomsMetaToStorage(rooms);
  }, [rooms]);

  // --- Intro sequence ---
  useEffect(() => {
    if (localStorage.getItem("intro_bots_fired")) return;

    const sendIntro = (roomId: number, text: string) => {
      const newMsg: Message = {
        id: Date.now() + Math.random(),
        senderId: roomId,
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const currentRoomMessages = getMessagesFromStorage(roomId) ?? roomMessages[roomId] ?? [];
      const updatedMessages = [...currentRoomMessages, newMsg];
      saveMessagesToStorage(roomId, updatedMessages);

      if (activeRoomIdRef.current === roomId) {
        setAllMessages(updatedMessages);
      }

      setRooms((prev) => {
        const withUnread = prev.map((room) => {
          if (room.id !== roomId) return room;
          if (room.isActive) return room;
          return { ...room, unread: room.unread + 1 };
        });
        return moveRoomToTop(buildEnrichedRooms(withUnread), roomId);
      });
    };

    // First bot message at 5s
    const timer1 = setTimeout(() => {
      sendIntro(2, "Hey there! Welcome to the new chat interface. It looks really clean.");
    }, 5000);

    // Second bot message at 8.5s
    const timer2 = setTimeout(() => {
      sendIntro(4, "This frontend is snappy! The local persistence works flawlessly. 🚀");
      localStorage.setItem("intro_bots_fired", "1");
    }, 8500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

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
          setAllMessages(updatedMessages);
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
          isTyping: room.id === roomId ? false : room.isTyping,
          hasNewMessage: room.id === roomId ? false : room.hasNewMessage,
        })),
      ),
    );
    // Load messages for the newly selected room
    setAllMessages(getRoomMessages(roomId));
    setVisibleCounts((prev) => ({
      ...prev,
      [roomId]: prev[roomId] ?? INITIAL_VISIBLE_MESSAGES,
    }));
    setIsLoadingOlderMessages(false);
  }, []);

  const addIncomingMessage = useCallback(
    (roomId: number, text: string) => {
      const incomingMessage: Message = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        senderId: roomId,
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: Date.now(),
      };

      const currentMessages = getRoomMessages(roomId);
      const nextMessages = [...currentMessages, incomingMessage];

      saveMessagesToStorage(roomId, nextMessages);
      if (activeRoomIdRef.current === roomId) {
        setAllMessages(nextMessages);
      }

      setRooms((prev) => {
        const next = prev.map((room) => {
          if (room.id !== roomId) return room;
          return {
            ...room,
            isTyping: false,
            hasNewMessage: !room.isActive,
            unread: room.isActive ? 0 : room.unread + 1,
          };
        });
        return moveRoomToTop(buildEnrichedRooms(next), roomId);
      });
    },
    [],
  );

  const setRoomTyping = useCallback((roomId: number, isTyping: boolean) => {
    setRooms((prev) =>
      moveRoomToTop(
        prev.map((room) =>
          room.id === roomId
            ? {
                ...room,
                isTyping,
                hasNewMessage: isTyping ? false : room.hasNewMessage,
              }
            : room,
        ),
        roomId,
      ),
    );
  }, []);

  const loadOlderMessages = useCallback(() => {
    if (activeRoomId == null || isLoadingOlderMessages) return;

    const totalMessages = getRoomMessages(activeRoomId).length;
    const currentVisible = visibleCounts[activeRoomId] ?? INITIAL_VISIBLE_MESSAGES;
    if (currentVisible >= totalMessages) return;

    setIsLoadingOlderMessages(true);
    loadOlderTimeoutRef.current = window.setTimeout(() => {
      setVisibleCounts((prev) => ({
        ...prev,
        [activeRoomId]: Math.min(
          (prev[activeRoomId] ?? INITIAL_VISIBLE_MESSAGES) + LOAD_MORE_MESSAGES,
          totalMessages,
        ),
      }));
      setIsLoadingOlderMessages(false);
      loadOlderTimeoutRef.current = null;
    }, LOAD_MORE_DELAY_MS);
  }, [activeRoomId, allMessages.length, isLoadingOlderMessages, visibleCounts]);

  useEffect(() => {
    if (startupSimulationRanRef.current || rooms.length === 0) return;
    startupSimulationRanRef.current = true;

    const inactiveRoomIds = rooms.filter((room) => !room.isActive).map((room) => room.id);
    if (inactiveRoomIds.length === 0) return;

    const shuffledRoomIds = [...inactiveRoomIds].sort(() => Math.random() - 0.5);
    const totalIncomingMessages = Math.min(
      shuffledRoomIds.length,
      STARTUP_AI_MESSAGE_COUNT,
    );

    shuffledRoomIds.slice(0, totalIncomingMessages).forEach((roomId, index) => {
      const startDelay =
        STARTUP_AI_MESSAGE_START_DELAYS[index] ??
        STARTUP_AI_MESSAGE_START_DELAYS[
          STARTUP_AI_MESSAGE_START_DELAYS.length - 1
        ] +
          index * 900;
      const typingDuration =
        STARTUP_AI_TYPING_RANGE[0] +
        Math.floor(
          Math.random() *
            (STARTUP_AI_TYPING_RANGE[1] - STARTUP_AI_TYPING_RANGE[0]),
        );
      const messageText =
        STARTUP_AI_MESSAGES[
          Math.floor(Math.random() * STARTUP_AI_MESSAGES.length)
        ];

      const typingTimer = window.setTimeout(() => {
        setRoomTyping(roomId, true);
      }, startDelay);

      const messageTimer = window.setTimeout(() => {
        addIncomingMessage(roomId, messageText);
      }, startDelay + typingDuration);

      startupTimersRef.current.push(typingTimer, messageTimer);
    });
  }, [addIncomingMessage, rooms, setRoomTyping]);

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
        timestamp: Date.now(),
        status: "sending",
      };

      const baseMessages = getRoomMessages(roomId);
      const optimisticMessages = [...baseMessages, newMsg];

      saveMessagesToStorage(roomId, optimisticMessages);
      setVisibleCounts((prev) => ({
        ...prev,
        [roomId]: Math.max(
          prev[roomId] ?? INITIAL_VISIBLE_MESSAGES,
          INITIAL_VISIBLE_MESSAGES,
        ),
      }));
      if (activeRoomIdRef.current === roomId) {
        setAllMessages(optimisticMessages);
      }
      setRooms((prev) => moveRoomToTop(buildEnrichedRooms(prev), roomId));

      // Simulate network delay → flip status to "sent"
      setTimeout(() => {
        const latestMessages = getRoomMessages(roomId) ?? optimisticMessages;
        const confirmedMessages: Message[] = latestMessages.map((m) =>
          m.id === newMsg.id ? { ...m, status: "sent" as const } : m,
        );

        saveMessagesToStorage(roomId, confirmedMessages);
        if (activeRoomIdRef.current === roomId) {
          setAllMessages(confirmedMessages);
        }
        setRooms((prev) => moveRoomToTop(buildEnrichedRooms(prev), roomId));

        const contextMessages = confirmedMessages.slice(-MAX_CONTEXT_MESSAGES);
        setTimeout(async () => {
          setRoomTyping(roomId, true);
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
            timestamp: Date.now() + 1,
          };

          const currentRoomMessages = getRoomMessages(roomId) ?? confirmedMessages;
          const withBotReply: Message[] = [...currentRoomMessages, botMessage];

          saveMessagesToStorage(roomId, withBotReply);
          if (activeRoomIdRef.current === roomId) {
            setAllMessages(withBotReply);
          }

          setRooms((prev) => {
            const withUnread = prev.map((room) => {
              if (room.id !== roomId) return room;
              if (room.isActive) {
                return {
                  ...room,
                  isTyping: false,
                  hasNewMessage: false,
                };
              }
              return {
                ...room,
                unread: room.unread + 1,
                isTyping: false,
                hasNewMessage: true,
              };
            });
            return moveRoomToTop(buildEnrichedRooms(withUnread), roomId);
          });
        }, BOT_REPLY_DELAY_MS);
      }, SEND_DELAY_MS);
    },
    [activeRoomId, rooms, setRoomTyping],
  );

  const toggleReaction = useCallback((msgId: number, emoji: string) => {
    setAllMessages((prev) =>
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
    hasMoreMessages,
    isLoadingOlderMessages,
    loadOlderMessages,
    toggleReaction,
  };
};
