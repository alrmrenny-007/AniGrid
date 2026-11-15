# Anime Hub
1. `npm i`
2. Vercel → Storage → add Neon Postgres, then `vercel env pull .env.local`; add `AUTH_SECRET`.
3. `npm run dev`, visit `/api/setup` once (creates tables + seeds quizzes, bracket, debates).
