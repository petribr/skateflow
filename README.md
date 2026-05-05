# Skateflow — MVP

A platform for skateboarders to find people to skate with. Users create **rolês** (sessions): a place + a time, and others jump in.

> Stack: **Next.js 14 (App Router) · TypeScript · Supabase (Postgres + Auth + RLS) · Tailwind · Leaflet (OpenStreetMap)**

---

## 1. Architecture

```
┌──────────────────────────┐         ┌────────────────────────┐
│  Next.js 14 (App Router) │  HTTPS  │       Supabase         │
│  - RSC pages             │ ──────► │  - Postgres            │
│  - Server Actions        │         │  - Auth (Google OAuth) │
│  - Middleware (auth)     │ ◄────── │  - Row-Level Security  │
│  - Tailwind + Leaflet    │ realtime│  - Realtime (comments) │
└──────────────────────────┘         └────────────────────────┘
```

**Why this stack**
- Postgres > Firestore for relational data (sessions ↔ attendance ↔ comments). Real foreign keys, joins, aggregates.
- Supabase Auth ships Google OAuth out of the box. Instagram is mocked via username field on the profile (Instagram's Basic Display API is deprecated; full Graph API needs business review — out of scope for MVP).
- RLS lets us push authorization into the DB instead of writing it twice.
- Server Actions remove the need for a hand-rolled REST layer for the MVP. We get type safety end-to-end.
- Leaflet + OpenStreetMap = no API key, no billing setup. Swap to Mapbox/Google later.

**Folder structure**

```
skateflow/
├─ app/
│  ├─ (auth)/login/page.tsx        # Login (Google + IG-username)
│  ├─ (app)/
│  │  ├─ layout.tsx                # Authenticated shell
│  │  ├─ feed/page.tsx             # Sessions feed (list + map)
│  │  ├─ sessions/new/page.tsx     # Create session
│  │  └─ sessions/[id]/page.tsx    # Session details + comments
│  ├─ auth/callback/route.ts       # Supabase OAuth callback
│  ├─ layout.tsx
│  └─ page.tsx                     # Redirects to /feed or /login
├─ components/
│  ├─ SessionCard.tsx
│  ├─ JoinButton.tsx
│  ├─ CommentSection.tsx
│  ├─ MapView.tsx
│  ├─ ReportButton.tsx
│  └─ Avatar.tsx
├─ lib/
│  ├─ supabase/{client,server,middleware}.ts
│  ├─ actions/{sessions,comments,reports,profile}.ts
│  └─ types.ts
├─ supabase/migrations/0001_init.sql
├─ middleware.ts
├─ tailwind.config.ts
├─ next.config.mjs
├─ package.json
└─ .env.example
```

---

## 2. Database schema

See [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) for the canonical version. Summary:

| Table        | Key columns                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| `profiles`   | `id` (FK→auth.users), `name`, `username`, `avatar_url`, `skill_level`, `city`, `instagram`, `flagged`    |
| `sessions`   | `id`, `creator_id`, `title`, `description`, `location_name`, `lat`, `lng`, `starts_at`, `type`, `max_participants`, `recurring_weekly` |
| `attendance` | `(session_id, user_id)` composite PK, `joined_at`                                                        |
| `comments`   | `id`, `session_id`, `user_id`, `body`, `created_at`                                                      |
| `reports`    | `id`, `reporter_id`, `target_type`, `target_id`, `reason`, `details`, `created_at`                       |

**Enums**
- `skill_level`: `beginner | intermediate | advanced`
- `session_type`: `casual | training | class`
- `report_reason`: `spam | harassment | inappropriate | other`

**Key invariants enforced in DB**
- A user can attend a session only once (PK on attendance).
- Reports auto-increment `profiles.flagged` via trigger; ≥3 flags surfaces in moderation queue.
- RLS: anyone signed-in can read sessions/comments; only the creator can edit/delete their own; reports are insert-only and visible only to admins.

---

## 3. API design

We use **Next.js Server Actions** instead of REST for the MVP. Each action is a typed function in `lib/actions/*` and is called directly from RSC components.

If/when a mobile app or third-party integration is added, mirror these as REST under `/api/v1`:

| Action / Route                  | Method | Purpose                                |
| ------------------------------- | ------ | -------------------------------------- |
| `createSession(input)`          | POST   | Create a rolê                          |
| `joinSession(sessionId)`        | POST   | Mark current user as attending         |
| `leaveSession(sessionId)`       | DELETE | Cancel attendance                      |
| `listSessions({city,from,to})`  | GET    | Feed query                             |
| `getSession(id)`                | GET    | Detail + attendees + comments          |
| `addComment(sessionId, body)`   | POST   | Post a comment                         |
| `reportTarget(input)`           | POST   | File a report                          |
| `updateProfile(input)`          | PATCH  | Edit profile                           |

---

## 4. Frontend pages

| Route                    | Purpose                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `/login`                 | Google OAuth + Instagram username capture                        |
| `/feed`                  | Upcoming sessions sorted by `starts_at`, list + map toggle       |
| `/sessions/new`          | Create rolê form (with map picker)                               |
| `/sessions/[id]`         | Details, attendees, "I'm in" button, comments, report            |
| `/profile`               | Edit name, username, skill, city, IG handle (post-MVP polish)    |

---

## 5. UI components

- **SessionCard** — date pill, title, location, type tag, attendee count
- **MapView** — Leaflet wrapper, marker per session, optional click-to-pick mode
- **JoinButton** — optimistic toggle, shows participant count
- **CommentSection** — list + composer, realtime via Supabase channel
- **ReportButton** — modal with reason enum
- **Avatar** — fallback initials, skill-level dot

---

## 6. Implementation plan (build in this order)

1. **Setup** — `npm i`, configure `.env`, run migration, enable Google OAuth in Supabase dashboard.
2. **Auth + profile bootstrap** — login page, callback route, trigger that auto-creates a `profiles` row from `auth.users`.
3. **Create session** — form + server action + map picker. (Most valuable feature; ship first.)
4. **Feed** — list view sorted by date. Filter by city derived from profile.
5. **Session detail + Join** — attendance toggle, attendees list.
6. **Comments** — composer + list. Realtime subscription as polish.
7. **Reports** — modal + insert. Moderation queue is just a SQL view.
8. **Recurring weekly** — flag on session; nightly cron clones next week's instance (Supabase scheduled function — post-MVP if time-boxed).
9. **Mobile polish** — bottom nav, large tap targets, install as PWA.

A solo dev can land 1–6 in ~3–5 days.

---

## 7. Getting started

```bash
npm install
cp .env.example .env.local
# fill SUPABASE_URL, SUPABASE_ANON_KEY
npx supabase db push   # or run migrations/0001_init.sql in the SQL editor
npm run dev
```

Enable Google OAuth: Supabase dashboard → Auth → Providers → Google. Add `http://localhost:3000/auth/callback` to redirect URLs.

---

## 8. Validating the MVP with real users

- **Seed one local scene first.** Pick one city/spot, recruit 10–20 skaters from a WhatsApp/IG group. Don't go wide.
- **Manual concierge.** For week one, the founder posts the first sessions personally and tags the group. The product only needs to be good enough that *joining* feels worth it.
- **One metric: filled sessions / week.** Not signups, not DAU. A session with ≥3 attendees who showed up = 1 win.
- **Weekly retro.** Talk to 3 users every Friday. Ask: "what stopped you from going to a rolê this week?"
- **Kill features that don't move the metric.** If comments aren't used, hide them.

---

## 9. Post-MVP roadmap

- Push notifications (web + native) for "session near you" and "your session starts in 1h".
- Skill-level matching ("only show advanced sessions").
- Verified social-project organizers + a separate "classes" tab.
- Session photos/videos after the fact (lightweight feed).
- Friends/follow graph — only if it serves coordination, not for its own sake.
- Native app (Expo) once web traction is real.
- Sponsorship / shop integration for organizers.
- Proper moderation panel + automated abuse signals.
