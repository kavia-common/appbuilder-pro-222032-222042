"use client";

import React from "react";
import type { ChatMessage } from "@/types/chat";

/**
 * PUBLIC_INTERFACE
 * MessageList renders a list of chat messages.
 */
export default function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="space-y-3">
      {messages.map((m, idx) => (
        <div
          key={idx}
          className={`rounded-md p-3 whitespace-pre-wrap ${
            m.role === "user" ? "bg-blue-50 border border-blue-100" : "bg-gray-50 border border-gray-100"
          }`}
        >
          <div className="text-xs mb-1 text-gray-500">{m.role === "user" ? "You" : "Assistant"}</div>
          <div className="text-sm text-gray-800">{m.content}</div>
        </div>
      ))}
    </div>
  );
}
