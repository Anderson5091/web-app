import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/auth.store";
import {
  ArrowLeft, Send, Paperclip, Check, CheckCheck, Phone, MoreVertical
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
  status?: "sending" | "sent" | "read";
}

const AGENT = {
  name: "Maya",
  role: "Support Agent",
  avatar: "M",
};

const BOT_REPLIES: Record<string, string> = {
  default: "Thanks for reaching out! I'm looking into that for you right now. Could you provide any additional details so I can assist you better?",
  transfer: "I can see your transfer records in our system. Transfer issues are usually resolved within 1–3 business days. Would you like me to escalate this to our payments team?",
  kyc: "KYC verifications typically take 24–48 hours. Our compliance team reviews documents manually to ensure accuracy. You'll receive an email once your verification is complete.",
  balance: "Your balance is managed in our secure internal ledger. Deposits are credited after network confirmation, which can take 10–30 minutes depending on the network.",
  fee: "Our fees vary by destination country and payout method. Bank transfers generally carry a 1–2% fee, while mobile wallet transfers have a flat rate. You can always review fees in the Send Money flow before confirming.",
  refund: "If a transfer fails compliance review, funds are automatically refunded to your wallet within 24 hours. If you haven't received your refund, I'll flag this as urgent for our team.",
  password: "To reset your password, please go to Settings → Security → Change Password. If you're locked out, I can trigger a password reset email to your registered address.",
  hi: "Hi there! Great to connect with you. How can I help you today? You can ask me about transfers, KYC verification, wallet balance, fees, or anything else!",
  hello: "Hello! Welcome to Quick Send support. I'm Maya and I'm here to help. What can I assist you with today?",
  thanks: "You're very welcome! Is there anything else I can help you with? I'm always here if you need support.",
  help: "Of course! I'm here to help. You can ask about:\n• Transfer status and delays\n• KYC verification progress\n• Wallet balance and deposits\n• Fee structure\n• Refunds and failed transfers\n• Account security\n\nWhat would you like to know?",
};

const QUICK_REPLIES = [
  { label: "Transfer status", key: "transfer" },
  { label: "KYC help", key: "kyc" },
  { label: "Fee info", key: "fee" },
  { label: "Refund request", key: "refund" },
];

function getReply(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("transfer") || lower.includes("send") || lower.includes("payment")) return BOT_REPLIES.transfer;
  if (lower.includes("kyc") || lower.includes("verif") || lower.includes("document") || lower.includes("id")) return BOT_REPLIES.kyc;
  if (lower.includes("balance") || lower.includes("wallet") || lower.includes("deposit")) return BOT_REPLIES.balance;
  if (lower.includes("fee") || lower.includes("cost") || lower.includes("charge")) return BOT_REPLIES.fee;
  if (lower.includes("refund") || lower.includes("return") || lower.includes("fail")) return BOT_REPLIES.refund;
  if (lower.includes("password") || lower.includes("login") || lower.includes("access")) return BOT_REPLIES.password;
  if (lower.includes("hi") || lower.includes("hey")) return BOT_REPLIES.hi;
  if (lower.includes("hello")) return BOT_REPLIES.hello;
  if (lower.includes("thank")) return BOT_REPLIES.thanks;
  if (lower.includes("help")) return BOT_REPLIES.help;
  return BOT_REPLIES.default;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatDate(date: Date): string {
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  if (isToday) return "Today";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function shouldShowDate(index: number, messages: Message[]): boolean {
  if (index === 0) return true;
  return formatDate(messages[index].timestamp) !== formatDate(messages[index - 1].timestamp);
}

export default function Chat() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: `Hi ${user?.fullName?.split(" ")[0] || "there"}! 👋 I'm Maya from the Quick Send support team. I'm here to help you with any questions or issues. How can I assist you today?`,
      sender: "agent",
      timestamp: new Date(Date.now() - 60000),
    },
  ]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      const userMsg: Message = {
        id: `msg_${Date.now()}`,
        text: text.trim(),
        sender: "user",
        timestamp: new Date(),
        status: "sending",
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText("");

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMsg.id ? { ...m, status: "sent" as const } : m))
        );
      }, 400);

      setTimeout(() => {
        setIsTyping(true);
      }, 600);

      const replyDelay = 1500 + Math.random() * 1000;
      setTimeout(() => {
        setIsTyping(false);
        const agentMsg: Message = {
          id: `msg_agent_${Date.now()}`,
          text: getReply(text),
          sender: "agent",
          timestamp: new Date(),
        };
        setMessages((prev) => [
          ...prev.map((m) => (m.id === userMsg.id ? { ...m, status: "read" as const } : m)),
          agentMsg,
        ]);
      }, replyDelay + 600);
    },
    []
  );

  return (
    <div className="h-screen flex flex-col bg-app-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border shrink-0">
        <button
          onClick={() => navigate("/settings/support")}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center shrink-0 hover:border-primary/30 transition-colors"
        >
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <div className="flex items-center gap-3 flex-1 relative">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00D6A3] to-[#0084FF] flex items-center justify-center">
              <span className="text-white text-base font-bold">{AGENT.avatar}</span>
            </div>
            <div className="absolute -bottom-0.5 left-7 w-3 h-3 rounded-full bg-primary border-2 border-app-bg" />
          </div>
          <div>
            <p className="text-text-primary text-sm font-semibold">{AGENT.name}</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-primary text-xs">Online · {AGENT.role}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 rounded-full bg-card flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
            <Phone size={18} />
          </button>
          <button className="w-9 h-9 rounded-full bg-card flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((msg, i) => {
          const isUser = msg.sender === "user";
          const showDateLabel = shouldShowDate(i, messages);
          return (
            <div key={msg.id}>
              {showDateLabel && (
                <div className="flex justify-center my-3">
                  <span className="text-text-subtle text-[10px] bg-card px-3 py-1 rounded-full border border-border">
                    {formatDate(msg.timestamp)}
                  </span>
                </div>
              )}
              <div className={`flex items-end gap-2 mb-1.5 ${isUser ? "flex-row-reverse" : ""}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-primary-dim border border-primary-border flex items-center justify-center shrink-0">
                    <span className="text-primary text-xs font-bold">{AGENT.avatar}</span>
                  </div>
                )}
                <div className={`max-w-[75%] ${isUser ? "items-end" : ""}`}>
                  {isUser ? (
                    <div className="bg-gradient-to-r from-[#00D6A3] to-[#0084FF] rounded-2xl rounded-br-sm px-4 py-2.5">
                      <p className="text-white text-sm leading-6 whitespace-pre-line">{msg.text}</p>
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-2.5">
                      <p className="text-text-primary text-sm leading-6 whitespace-pre-line">{msg.text}</p>
                    </div>
                  )}
                  <div className={`flex items-center gap-1 mt-0.5 ${isUser ? "justify-end" : ""}`}>
                    <span className="text-text-subtle text-[9px]">{formatTime(msg.timestamp)}</span>
                    {isUser && msg.status === "read" && <CheckCheck size={11} className="text-primary" />}
                    {isUser && msg.status === "sent" && <CheckCheck size={11} className="text-text-subtle" />}
                    {isUser && msg.status === "sending" && <Check size={11} className="text-text-subtle" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-primary-dim border border-primary-border flex items-center justify-center shrink-0">
              <span className="text-primary text-xs font-bold">{AGENT.avatar}</span>
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-text-subtle"
                    style={{ opacity: 0.4 + i * 0.3 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick replies */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 shrink-0">
          <p className="text-text-subtle text-[10px] mb-1 tracking-wide">Quick topics</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr.key}
                onClick={() => sendMessage(qr.label)}
                className="px-3 py-1.5 rounded-full bg-primary-dim border border-primary-border text-primary text-xs font-medium hover:opacity-80 transition-opacity"
              >
                {qr.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-end gap-2 px-4 py-2.5 border-t border-border shrink-0">
        <button className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-text-subtle hover:text-text-secondary transition-colors shrink-0">
          <Paperclip size={18} />
        </button>
        <div className="flex-1 bg-card border border-border rounded-2xl px-3.5 flex items-center min-h-[44px] max-h-[120px]">
          <input
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(inputText);
              }
            }}
            placeholder="Type a message..."
            className="w-full bg-transparent text-text-primary text-sm outline-none placeholder-text-subtle py-2.5"
          />
        </div>
        <button
          onClick={() => sendMessage(inputText)}
          disabled={!inputText.trim()}
          className="shrink-0"
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              inputText.trim()
                ? "bg-gradient-to-r from-[#00D6A3] to-[#0084FF]"
                : "bg-card-alt"
            }`}
          >
            <Send size={18} className={inputText.trim() ? "text-white" : "text-text-subtle"} />
          </div>
        </button>
      </div>
    </div>
  );
}
