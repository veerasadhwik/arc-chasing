"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { StorageRepository } from "@/lib/storage/repository";
import { Profile, DirectMessage } from "@/types/database";
import { Send, X, MessageSquare, Flame, CheckCheck, Smile } from "lucide-react";

interface DirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: Profile | null;
}

export function DirectChatModal({ isOpen, onClose, friend }: DirectChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = () => {
    if (!user || !friend) return;
    const list = StorageRepository.getDirectMessages(user.id, friend.id);
    setMessages(list);
    StorageRepository.markDirectMessagesAsRead(friend.id, user.id);
  };

  useEffect(() => {
    if (!isOpen || !user || !friend) return;
    loadMessages();
    const interval = setInterval(loadMessages, 2500);
    return () => clearInterval(interval);
  }, [isOpen, user, friend]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen || !friend || !user) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    StorageRepository.sendDirectMessage(user.id, friend.id, text.trim());
    setText("");
    loadMessages();
  };

  const handleQuickCheer = (cheer: string) => {
    StorageRepository.sendDirectMessage(user.id, friend.id, cheer);
    loadMessages();
  };

  const quickCheers = [
    "🔥 Keep the streak unbroken!",
    "⚡ 100% Locked in today!",
    "👊 Relentless execution!",
    "❄️ Winter Arc discipline!",
  ];

  const formatMsgTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0E121A] border border-white/[0.1] rounded-3xl shadow-2xl flex flex-col h-[580px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 px-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 overflow-hidden shrink-0">
              <img
                src={friend.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${friend.username}`}
                alt={friend.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F5F7FA]">
                {friend.display_name || friend.username}
              </h4>
              <p className="text-[11px] text-[#8ED8FF] font-medium">@{friend.username}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8D95A5] hover:text-[#F5F7FA] hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#080A0F]/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-1">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h5 className="text-sm font-bold text-[#F5F7FA]">Direct Accountability Chat</h5>
              <p className="text-xs text-[#8D95A5] max-w-xs">
                Encourage {friend.display_name || friend.username}, celebrate discipline streaks, and hold each other relentlessly accountable.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.sender_id === user.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm break-words ${
                      isMine
                        ? "bg-[#8ED8FF] text-[#080A0F] font-medium rounded-tr-none"
                        : "bg-[#151922] text-[#F5F7FA] border border-white/[0.08] rounded-tl-none"
                    }`}
                  >
                    {m.message}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-[#8D95A5]">
                      {formatMsgTime(m.created_at)}
                    </span>
                    {isMine && m.is_read && (
                      <CheckCheck className="w-3 h-3 text-[#8ED8FF]" />
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Cheers */}
        <div className="px-4 py-2 bg-white/[0.01] border-t border-white/[0.06] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickCheers.map((cheer, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickCheer(cheer)}
              className="px-2.5 py-1 rounded-xl bg-[#151922] hover:bg-white/[0.08] border border-white/[0.06] text-[10px] font-medium text-[#8D95A5] hover:text-[#F5F7FA] whitespace-nowrap transition-colors"
            >
              {cheer}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-[#0E121A] border-t border-white/[0.08] flex items-center gap-2"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${friend.display_name || friend.username}...`}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-[#151922] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#8D95A5] focus:outline-none focus:border-[#8ED8FF]/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-2.5 rounded-2xl bg-[#8ED8FF] hover:bg-[#A6E2FF] disabled:opacity-40 text-[#080A0F] font-bold transition-all shadow-sm flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
