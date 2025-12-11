export type ChatMessage = {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
};

export type GenerationEvent =
  | { type: "status"; data: string }
  | { type: "token"; data: string }
  | { type: "file_diff"; data: { path: string; diff: string } }
  | { type: "error"; data: string }
  | { type: "end"; data: string };
