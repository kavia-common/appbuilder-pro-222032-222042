# Lovable Frontend App

Next.js frontend for onboarding, chat-driven requirements, live preview, editing, versioning, export and deploy actions.

Ports
- Frontend: 3000
- Backend (paired): 3001
- Database (paired): 5000 (logical)

Setup
1) Copy env:
   cp .env.example .env

2) Install and run:
   npm install
   npm run dev

Environment variables
- NEXT_PUBLIC_BACKEND_URL: Backend HTTP base (e.g., http://localhost:3001)
- (Optional) NEXT_PUBLIC_WS_URL: WebSocket base if different from BACKEND_URL, e.g., ws://localhost:3001

End-to-end (UI)
1) Login with your email to obtain a token (dev dummy).
2) Create a project from the dashboard.
3) Start a chat session and request generation.
4) Watch live token stream and diffs; open preview; make edits; snapshot versions.
5) Export or Deploy from the project actions.

Notes
- Ensure CORS/FRONTEND_ORIGIN in backend allows http://localhost:3000 for local dev.
- Keep NEXT_PUBLIC_BACKEND_URL in sync with your backend host/port.
