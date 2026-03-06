"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface ChatMessage {
  playerId: string;
  message: string;
  timestamp: number;
}

interface ChatOverlayProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  onFocusChange: (focused: boolean) => void;
}

const MAX_VISIBLE_MESSAGES = 50;

export function ChatOverlay({ messages, onSend, onFocusChange }: ChatOverlayProps) {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Toggle chat with Enter key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Enter" && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
        onFocusChange(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onFocusChange]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (trimmed.length === 0 || trimmed.length > 200) return;

      onSend(trimmed);
      setInput("");
      setIsOpen(false);
      onFocusChange(false);
      inputRef.current?.blur();
    },
    [input, onSend, onFocusChange],
  );

  const handleBlur = useCallback(() => {
    setIsOpen(false);
    onFocusChange(false);
  }, [onFocusChange]);

  const visibleMessages = messages.slice(-MAX_VISIBLE_MESSAGES);

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex w-80 flex-col gap-1">
      {/* Message list */}
      <div
        ref={listRef}
        className="pointer-events-auto max-h-40 overflow-y-auto rounded bg-black/40 p-2 backdrop-blur-sm"
      >
        {visibleMessages.length === 0 ? (
          <p className="text-xs text-slate-400">
            Pressione Enter para digitar...
          </p>
        ) : (
          visibleMessages.map((msg, i) => (
            <p key={`${msg.playerId}-${msg.timestamp}-${i}`} className="text-xs text-white">
              <span className="font-semibold text-sky-300">
                {msg.playerId.slice(0, 6)}:
              </span>{" "}
              {msg.message}
            </p>
          ))
        )}
      </div>

      {/* Input */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="pointer-events-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={handleBlur}
            maxLength={200}
            placeholder="Digite uma mensagem..."
            className="w-full rounded border border-slate-600 bg-black/70 px-3 py-1.5 text-sm text-white placeholder-slate-400 outline-none focus:border-sky-500"
          />
        </form>
      )}
    </div>
  );
}
