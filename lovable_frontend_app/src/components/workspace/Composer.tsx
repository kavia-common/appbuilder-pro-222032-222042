"use client";

import React, { useState } from "react";

/**
 * PUBLIC_INTERFACE
 * Composer provides an input and send button for chat.
 */
export default function Composer({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [text, setText] = useState("");

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <div className="flex items-center gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        disabled={disabled}
        placeholder="Describe changes or features to generate..."
        className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
      <button
        onClick={submit}
        disabled={disabled}
        className="rounded-md bg-blue-600 text-white text-sm px-3 py-2 hover:bg-blue-700 disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}
