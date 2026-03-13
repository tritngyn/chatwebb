import type { Message } from "../types/types";

interface GenerateFakeUserReplyParams {
  roomName: string;
  userMessage: string;
  conversation: Message[];
}

const FALLBACK_REPLY = "Noted. Tell me a bit more so I can respond better.";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.3-70b-versatile";

const buildSystemPrompt = (roomName: string) =>
  [
    `You are roleplaying as ${roomName} in a private chat app.`,
    "Reply naturally as this persona.",
    "Rules:",
    "- Keep reply short: 1 to 2 sentences.",
    "- Match the user's language when possible.",
    "- Do not mention you are an AI or model.",
    "- No markdown and no bullet points.",
    "- Write only the next reply message.",
  ].join("\n");

const formatMessages = (conversation: Message[], systemPrompt: string) => {
  const msgs: { role: string; content: string }[] = [
    { role: "system", content: systemPrompt },
  ];

  for (const msg of conversation.slice(-8)) {
    msgs.push({
      role: msg.senderId === "me" ? "user" : "assistant",
      content: msg.text,
    });
  }

  return msgs;
};

export const generateFakeUserReply = async ({
  roomName,
  userMessage,
  conversation,
}: GenerateFakeUserReplyParams): Promise<string> => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    return "Missing VITE_GROQ_API_KEY. Add it to your .env file to enable AI replies.";
  }

  const systemPrompt = buildSystemPrompt(roomName);
  const messages = formatMessages(conversation, systemPrompt);

  // Ensure the latest user message is included
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg || lastMsg.content !== userMessage) {
    messages.push({ role: "user", content: userMessage });
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages,
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("[fakeUserBot] Groq API error:", response.status, errorData);
      return FALLBACK_REPLY;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || FALLBACK_REPLY;
  } catch (error) {
    console.error("[fakeUserBot] Groq API error:", error);
    return FALLBACK_REPLY;
  }
};
