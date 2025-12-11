export type LoginResponse =
  | { token: string }
  | { access_token: string }
  | string;

export interface Project {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  description?: string;
}
