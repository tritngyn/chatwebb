import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useChatData } from "../hooks/useChatData";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("useChatData", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("initializes with default rooms and first room active", () => {
    const { result } = renderHook(() => useChatData());

    expect(result.current.rooms.length).toBeGreaterThan(0);
    expect(result.current.activeRoom).toBeDefined();
    expect(result.current.activeRoom.isActive).toBe(true);
  });

  it("selects a room and loads its messages", () => {
    const { result } = renderHook(() => useChatData());

    act(() => {
      result.current.selectRoom(2);
    });

    const room2 = result.current.rooms.find((r) => r.id === 2);
    expect(room2?.isActive).toBe(true);
    expect(result.current.activeRoom.id).toBe(2);
  });

  it("sends a message with optimistic 'sending' status", () => {
    const { result } = renderHook(() => useChatData());

    act(() => {
      result.current.sendMessage("Hello world");
    });

    const lastMsg = result.current.messages[result.current.messages.length - 1];
    expect(lastMsg.text).toBe("Hello world");
    expect(lastMsg.senderId).toBe("me");
    expect(lastMsg.status).toBe("sending");
  });

  it("toggles emoji reaction on a message", () => {
    const { result } = renderHook(() => useChatData());

    // Get first message id
    const msgId = result.current.messages[0]?.id;
    if (msgId == null) return;

    act(() => {
      result.current.toggleReaction(msgId, "👍");
    });

    const msg = result.current.messages.find((m) => m.id === msgId);
    expect(msg?.reactions).toContain("👍");

    // Toggle off
    act(() => {
      result.current.toggleReaction(msgId, "👍");
    });

    const msg2 = result.current.messages.find((m) => m.id === msgId);
    expect(msg2?.reactions).not.toContain("👍");
  });

  it("does not send empty messages", () => {
    const { result } = renderHook(() => useChatData());
    const countBefore = result.current.messages.length;

    act(() => {
      result.current.sendMessage("   ");
    });

    expect(result.current.messages.length).toBe(countBefore);
  });
});
