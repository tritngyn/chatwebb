import type { User, ChatRoom, Message } from "./types/types";

// Thông tin người dùng hiện tại
export const currentUser: User = {
  id: "me",
  name: "Triết Nguyễn",
  avatar: "https://i.pravatar.cc/150?u=triet",
};

// Danh sách các cuộc hội thoại
export const chatRooms: ChatRoom[] = [
  {
    id: 1,
    name: "Jensen Huang",
    lastMessage: "The new Blackwell GPU is ready for demo 🔥",
    time: "10:30",
    unread: 2,
    avatar: "https://unavatar.io/x/nvidia",
    isActive: true,
  },
  {
    id: 2,
    name: "Mark Zuckerberg",
    lastMessage: "Let's talk about the metaverse integration",
    time: "09:30",
    unread: 1,
    avatar: "https://unavatar.io/x/zaborella",
    isActive: false,
  },
  {
    id: 3,
    name: "Jeff Bezos",
    lastMessage: "AWS costs are optimized, check the dashboard",
    time: "Yesterday",
    unread: 0,
    avatar: "https://unavatar.io/x/JeffBezos",
    isActive: false,
  },
  {
    id: 4,
    name: "Elon Musk",
    lastMessage: "Starship launch is on schedule 🚀",
    time: "Yesterday",
    unread: 0,
    avatar: "https://unavatar.io/x/elonmusk",
    isActive: false,
  },
  {
    id: 5,
    name: "Tim Cook",
    lastMessage: "Vision Pro SDK update just dropped 🎉",
    time: "Yesterday",
    unread: 0,
    avatar: "https://unavatar.io/x/tim_cook",
    isActive: false,
  },
  {
    id: 6,
    name: "Satya Nadella",
    lastMessage: "Copilot integration is looking great",
    time: "Mon",
    unread: 0,
    avatar: "https://unavatar.io/x/sataborella",
    isActive: false,
  },
  {
    id: 7,
    name: "Sundar Pichai",
    lastMessage: "Gemini benchmark results are impressive 🧠",
    time: "Mon",
    unread: 3,
    avatar: "https://unavatar.io/x/sundarpichai",
    isActive: false,
  },
  {
    id: 8,
    name: "Sam Altman",
    lastMessage: "GPT-5 internal testing starts next week",
    time: "Sat",
    unread: 0,
    avatar: "https://unavatar.io/x/sama",
    isActive: false,
  },
  {
    id: 9,
    name: "Lisa Su",
    lastMessage: "New Ryzen chips are crushing benchmarks! 💪",
    time: "Fri",
    unread: 0,
    avatar: "https://unavatar.io/x/LisaSu",
    isActive: false,
  },
  {
    id: 10,
    name: "Bill Gates",
    lastMessage: "Climate tech report is ready for review",
    time: "Thu",
    unread: 1,
    avatar: "https://unavatar.io/x/BillGates",
    isActive: false,
  },
];

// Hội thoại mẫu cho từng phòng chat
export const roomMessages: Record<number, Message[]> = {
  // Jensen Huang - NVIDIA CEO
  1: [
    { id: 1, senderId: 1, text: "Hey! Have you seen the new Blackwell architecture specs?", time: "10:20" },
    { id: 2, senderId: "me", text: "Yes! The performance gains are insane. 4x over Hopper right?", time: "10:22" },
    { id: 3, senderId: 1, text: "Exactly. We're preparing the demo for GTC next week. Can you help with the AI inference benchmarks?", time: "10:25" },
    { id: 4, senderId: "me", text: "Absolutely, I'll run the tests on our cluster tonight and send the results", time: "10:27" },
    { id: 5, senderId: 1, text: "The new Blackwell GPU is ready for demo 🔥", time: "10:30" },
  ],

  // Mark Zuckerberg - Meta CEO
  2: [
    { id: 1, senderId: 2, text: "Hey, I wanted to discuss the new Horizon Worlds update", time: "09:00" },
    { id: 2, senderId: "me", text: "Sure! I saw the new avatar system, looks really impressive", time: "09:05" },
    { id: 3, senderId: 2, text: "Thanks! We're also working on haptic feedback for Quest 4", time: "09:10" },
    { id: 4, senderId: "me", text: "That would be a game changer for VR experiences", time: "09:15" },
    { id: 5, senderId: 2, text: "Exactly. Also, Llama 4 is showing great results on coding tasks", time: "09:20" },
    { id: 6, senderId: "me", text: "I'd love to test it. Can you give me early access?", time: "09:25" },
    { id: 7, senderId: 2, text: "Let's talk about the metaverse integration", time: "09:30" },
  ],

  // Jeff Bezos - Amazon founder
  3: [
    { id: 1, senderId: 3, text: "We need to optimize the cloud infrastructure costs", time: "08:00" },
    { id: 2, senderId: "me", text: "I've been looking at the AWS billing dashboard, there's room for improvement", time: "08:05" },
    { id: 3, senderId: 3, text: "Good. Customer obsession starts with efficient operations", time: "08:10" },
    { id: 4, senderId: "me", text: "I'll prepare a cost reduction proposal by EOD", time: "08:15" },
    { id: 5, senderId: 3, text: "Remember: It's always Day 1. Keep innovating while cutting waste", time: "08:20" },
    { id: 6, senderId: "me", text: "Got it. Also the Blue Origin update looks promising!", time: "08:30" },
    { id: 7, senderId: 3, text: "AWS costs are optimized, check the dashboard", time: "08:45" },
  ],

  // Elon Musk - Tesla/SpaceX CEO
  4: [
    { id: 1, senderId: 4, text: "The Raptor 3 engine tests were incredible last night 🚀", time: "11:00" },
    { id: 2, senderId: "me", text: "I saw the livestream! Full thrust achieved in under 2 seconds", time: "11:02" },
    { id: 3, senderId: 4, text: "We're targeting Mars orbit by 2028. Not joking this time lol", time: "11:05" },
    { id: 4, senderId: "me", text: "What about the Neuralink update? The brain-computer interface demo was wild", time: "11:08" },
    { id: 5, senderId: 4, text: "Patient 2 is playing chess using only thoughts now. Unreal.", time: "11:10" },
    { id: 6, senderId: "me", text: "The future is literally sci-fi at this point", time: "11:12" },
    { id: 7, senderId: 4, text: "Starship launch is on schedule 🚀", time: "11:15" },
  ],

  // Tim Cook - Apple CEO
  5: [
    { id: 1, senderId: 5, text: "The Vision Pro developer feedback has been overwhelmingly positive", time: "14:00" },
    { id: 2, senderId: "me", text: "I tried the spatial computing demo. It's magical ✨", time: "14:05" },
    { id: 3, senderId: 5, text: "We're releasing a new SDK with eye-tracking improvements", time: "14:10" },
    { id: 4, senderId: "me", text: "Will it support the new gesture recognition APIs?", time: "14:12" },
    { id: 5, senderId: 5, text: "Yes, and we're adding real-time object detection too", time: "14:15" },
    { id: 6, senderId: "me", text: "Can't wait to build something with it!", time: "14:18" },
    { id: 7, senderId: 5, text: "Vision Pro SDK update just dropped 🎉", time: "14:20" },
  ],

  // Satya Nadella - Microsoft CEO
  6: [
    { id: 1, senderId: 6, text: "The new Copilot features are shipping this quarter", time: "15:00" },
    { id: 2, senderId: "me", text: "The code completion accuracy has improved dramatically!", time: "15:05" },
    { id: 3, senderId: 6, text: "We trained it on 2x more data with Azure's new GPU cluster", time: "15:10" },
    { id: 4, senderId: "me", text: "How's the enterprise adoption looking?", time: "15:12" },
    { id: 5, senderId: 6, text: "Fortune 500 companies are lining up. Growth mindset wins 📈", time: "15:15" },
    { id: 6, senderId: "me", text: "That's amazing. Any plans for Copilot in Office mobile?", time: "15:18" },
    { id: 7, senderId: 6, text: "Copilot integration is looking great", time: "15:20" },
  ],

  // Sundar Pichai - Google CEO
  7: [
    { id: 1, senderId: 7, text: "Gemini Ultra just set a new record on MMLU benchmark", time: "16:00" },
    { id: 2, senderId: "me", text: "90.04%? That's the first model to surpass human experts!", time: "16:05" },
    { id: 3, senderId: 7, text: "And the multimodal capabilities are next level", time: "16:08" },
    { id: 4, senderId: "me", text: "I tested the video understanding feature — blown away", time: "16:10" },
    { id: 5, senderId: 7, text: "Wait till you see what's coming with Gemini 2.0 🤫", time: "16:12" },
    { id: 6, senderId: "me", text: "You can't just tease something like that!", time: "16:14" },
    { id: 7, senderId: 7, text: "Gemini benchmark results are impressive 🧠", time: "16:15" },
  ],

  // Sam Altman - OpenAI CEO
  8: [
    { id: 1, senderId: 8, text: "We're getting close to AGI. Closer than people think.", time: "20:00" },
    { id: 2, senderId: "me", text: "That's both exciting and terrifying at the same time", time: "20:05" },
    { id: 3, senderId: 8, text: "Safety is our #1 priority. We have 3 alignment teams now", time: "20:08" },
    { id: 4, senderId: "me", text: "How's GPT-5 development going?", time: "20:10" },
    { id: 5, senderId: 8, text: "It can reason about complex problems in ways that surprise even us", time: "20:12" },
    { id: 6, senderId: "me", text: "When can developers get access?", time: "20:15" },
    { id: 7, senderId: 8, text: "GPT-5 internal testing starts next week", time: "20:18" },
  ],

  // Lisa Su - AMD CEO
  9: [
    { id: 1, senderId: 9, text: "Just got back from the Ryzen 9000 launch event!", time: "17:00" },
    { id: 2, senderId: "me", text: "The single-threaded performance jump is crazy", time: "17:05" },
    { id: 3, senderId: 9, text: "Zen 5 architecture is a beast. 30% IPC improvement", time: "17:08" },
    { id: 4, senderId: "me", text: "Intel must be sweating right now 😅", time: "17:10" },
    { id: 5, senderId: 9, text: "Competition drives innovation. We stay focused on execution", time: "17:12" },
    { id: 6, senderId: "me", text: "Love that mindset. Also the MI300X is killing it in data centers", time: "17:15" },
    { id: 7, senderId: 9, text: "New Ryzen chips are crushing benchmarks! 💪", time: "17:18" },
  ],

  // Bill Gates - Microsoft co-founder
  10: [
    { id: 1, senderId: 10, text: "Have you read the latest climate innovation report?", time: "13:00" },
    { id: 2, senderId: "me", text: "Yes, the progress on carbon capture technology is promising", time: "13:05" },
    { id: 3, senderId: 10, text: "Breakthrough Energy Ventures just funded 3 new startups in that space", time: "13:08" },
    { id: 4, senderId: "me", text: "What about nuclear fusion? TerraPower making progress?", time: "13:10" },
    { id: 5, senderId: 10, text: "Our Natrium reactor design passed the final safety review ✅", time: "13:12" },
    { id: 6, senderId: "me", text: "That's incredible news for clean energy!", time: "13:15" },
    { id: 7, senderId: 10, text: "Climate tech report is ready for review", time: "13:18" },
  ],
};

// Backward-compatible: tin nhắn mặc định cho phòng 1
export const currentMessages: Message[] = roomMessages[1];
