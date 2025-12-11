"use client";

import React, { useEffect, useRef, useState } from "react";
import { startGeneration } from "@/lib/workspaceApi";
import { connectGeneration } from "@/lib/workspaceWs";
import MessageList from "./MessageList";
import Composer from "./Composer";
import type { ChatMessage, GenerationEvent } from "@/types/chat";

/**
 * PUBLIC_INTERFACE
 * ChatPanel provides a simple chat UI to start a code generation task and stream events.
 */
export default function ChatPanel({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Describe what you want to build. I will generate or modify your project." },
  ]);
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight });
  }, [messages]);

  const onSend = async (text: string) => {
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setStreaming(true);
    setStatus("Starting generation...");

    try {
      const task = await startGeneration(projectId, text);
      const ws = connectGeneration(task.task_id);
      let assistantBuffer = "";

      ws.onopen = () => {
        setStatus("Connected. Generating...");
      };
      ws.onmessage = (evt: MessageEvent<string>) => {
        try {
          const data: GenerationEvent = JSON.parse(evt.data);
          if (data.type === "status") {
            setStatus(String(data.data));
          } else if (data.type === "token") {
            assistantBuffer += data.data;
            const existingAssistantIdx = messages.findIndex((m) => m.role === "assistant" && !m.id && m.content === "");
            if (existingAssistantIdx === -1) {
              setMessages((m) => [...m, { role: "assistant", content: assistantBuffer }]);
            } else {
              setMessages((m) =>
                m.map((msg, idx) => (idx === existingAssistantIdx ? { ...msg, content: assistantBuffer } : msg)),
              );
            }
          } else if (data.type === "file_diff") {
            // Append a diff summary line in the chat
            setMessages((m) => [
              ...m,
              { role: "assistant", content: `Updated file: ${data.data.path}\n\n\`\`\`diff\n${data.data.diff}\n\`\`\`` },
            ]);
          } else if (data.type === "error") {
            setStatus("Error");
            setMessages((m) => [...m, { role: "assistant", content: `Error: ${data.data}` }]);
            ws.close();
            setStreaming(false);
          } else if (data.type === "end") {
            if (assistantBuffer) {
              setMessages((m) => [...m, { role: "assistant", content: assistantBuffer }]);
              assistantBuffer = "";
            }
            setStatus("Done");
            setStreaming(false);
            ws.close();
          }
        } catch {
          // Non-JSON line or message
        }
      };
      ws.onerror = () => {
        setStatus("WebSocket error");
        setStreaming(false);
      };
      ws.onclose = () => {
        setStreaming(false);
      };
    } catch (e) {
      setStatus("Failed to start generation");
      setStreaming(false);
      const msg = e instanceof Error ? e.message : "unknown error";
      setMessages((m) => [...m, { role: "assistant", content: `Failed: ${msg}` }]);
    }
  };

  return (
    <div className="grid grid-rows-[1fr_auto] h-[calc(100vh-140px)] gap-3">
      <div ref={scrollerRef} className="rounded-lg border bg-white p-4 overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Chat</h2>
          <div className="text-xs text-gray-500">{streaming ? status || "Streaming..." : status || "Idle"}</div>
        </div>
        <MessageList messages={messages} />
      </div>
      <Composer onSend={onSend} disabled={streaming} />
    </div>
  );
}
