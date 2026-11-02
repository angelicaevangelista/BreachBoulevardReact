# Breach Boulevard — React + Node.js + Supabase

For the GitHub/Vercel deployment, see [DEPLOYMENT.md](DEPLOYMENT.md).

The frontend and backend are JavaScript. The app runs on Node.js 22 or newer;
PHP, XAMPP, and MySQL are not required. The interface uses the original orange
and navy palette with a friendly mascot, responsive cards, and shared navigation.
Existing authentication, training simulations, and access-code behavior are retained.

## Learning workspace

- `/access`: Google or email sign-in, followed by the existing course access-code step.
- `/dashboard`: account-backed lab completions and the next incomplete challenge.
- `/practice` and `/labs`: 21 simulated websites: six guided labs plus 15 CTFs, with search and progress filters.
- `/practice/:id`: interactive challenges, progressive hints, feedback, and saved completions.
- `/courses`: topic cards with clickable links to working labs and tutorials.
- `/admin`: protected code management with random or custom codes and configurable expiry.
- `/community`: a 3D Boulevard with six clickable landmarks leading to community streets.

Loading screens show Honey, the security buddy. Motion respects the device's
reduced-motion setting. Course dialogs support keyboard focus, Escape, and Tab.
Honey uses the shared orange mascot with two antennas, wings, and bee stripes.
Signed-in learners and admins can open Honey from the bottom-right corner.
The helper uses the current lab for progressive hints and is also available to
signed-in learners on public pages. The landing page uses the 2D character and
has no inline chat or 3D Honey model.
The map supports keyboard-accessible street markers, an illustrated fallback,
and a pause control; reduced-motion preferences stop its ambient animation.

## Access-code settings

Admins can choose 1 day, 7 days, 1 month, 6 months, 1 year, or a custom date/time.
The date picker uses the admin's local time and sends an absolute UTC timestamp.
Month/year presets use calendar arithmetic with month-end clamping. The default
remains a random eight-character code valid for one day.

Custom codes are case-sensitive, unique, and accept 3–64 letters, numbers,
hyphens, or underscores. The server validates all settings, rejects past expiry
dates, and returns a conflict for duplicate codes. Expiry is saved in the existing
`breach_access_codes.expires_at` column and checked against database time; no
access-code schema migration is needed.

The admin list loads automatically after sign-in and updates immediately when a
code is generated, extended, deleted, or cleaned up. Each code has Extend and
Delete controls. Extensions add time to the current expiry of an active code,
or start from now for an expired code. Custom extensions must be later than the
current expiry. Updates use an expiry comparison to avoid overwriting a newer
change from another administrator. Deleted codes fail subsequent validation.

## Run locally

```powershell
npm install
npm run dev
```

Open **http://127.0.0.1:5173/**. React and the API share one Node server.
The existing Supabase project and `.env.server` configuration continue to work.

```powershell
npm run db:check
```

The database adapter reads the Supabase server key only on the backend. It
never sends that key to React. See [database setup](supabase/README.md) for
configuration and the migration already used by this project.

## Build and run production

```powershell
npm run build
npm start
```

The Node server serves `dist/`, handles clean-route refreshes and API requests,
and stores new uploads in `.data/uploads/`. Uploaded files survive restarts;
back up that directory if you move the server. Existing images and original
uploaded assets remain in `public/` and are included in the build.

`PORT` changes the default port 5173. For deployment under a subdirectory,
set `VITE_BASE_PATH` before building and set `BASE_PATH` to the same path when
starting the production server. The default deployment is the domain root.

```powershell
npm run package
```

This creates a standalone Node runtime folder in
`release/BreachBoulevardReact-Node/`. It includes the built frontend, JavaScript
server, and configuration template, with the official Supabase Auth runtime packages. Real
credentials, development files, and old PHP sources are excluded.

## API

| Route | Method | Behavior |
| --- | --- | --- |
| `/api/health` | GET | Verify the Node runtime and Supabase connection |
| `/api/access-codes` | GET / POST | List codes / generate an eight-character code |
| `/api/access-codes/validate` | POST | Validate a code and its expiry |
| `/api/access-codes/check` | POST | Compatibility check without expiry |
| `/api/access-codes/cleanup` | POST | Delete expired codes |
| `/api/uploads` | POST | Save multipart uploads and return a download link |
| `/api/uploads/avatar` | POST | Image upload response for avatar forms |
| `/api/uploads/:id/:filename` | GET | Retrieve an uploaded file |
| `/api/labs/file-upload` | POST | Upload lab with simulated script output |
| `/api/labs/reflected-xss` | POST | Original reflected-HTML teaching response |
| `/api/labs/csrf` | POST | Original empty CSRF example response |
| `/api/download` | GET | Original cloud-folder redirect |

All frontend forms and hooks use the new API paths. Database JSON response
shapes and user-visible messages are preserved. New uploads accept the original
`avatar`, `file`, and `uploaded_file` field names. The upload limit is 10 MB.

The one PHP-specific behavior is now a simulation: uploaded PHP code is never
executed on the server. The lab shows recognizable literal output and a clear
simulation label; the original uploaded file can still be downloaded. This
keeps the teaching flow usable on a JavaScript-only runtime. The reflected-XSS
and DOM-XSS examples retain their intentional browser-side teaching behavior.

## Source

- `src/pages/`, `src/components/`, `src/hooks/`: React layouts and state.
- `src/routing.jsx`: client routing and original HTML URL compatibility.
- `server/supabase.mjs`: server-side database adapter using native fetch.
- `server/api.mjs`: database, upload, and teaching-lab handlers.
- `server/uploads.mjs`: persistent file storage and explicit lab simulation.
- `server/index.mjs`: production HTTP server and React route fallback.
- `scripts/start.mjs`: development server with Vite middleware.
- `supabase/`: PostgreSQL migration and database documentation.

```powershell
npm test
```

Tests cover React lifecycle/interaction behavior, the Node API against a mock
Supabase service, file uploads/downloads, validation, expiry, cleanup, and static
routing. They require no PHP installation and do not modify the live database.

Superseded PHP files and XAMPP build artifacts are preserved in the ignored
`.legacy-php/` archive. They are outside the active app and are not packaged.
The original `C:/xampp/htdocs/BreachBoulevardFinal/` folder is untouched.

Practice labs are available at `/practice`: SQL injection, XSS, default-password
authentication, IDOR, path traversal, and debug-data exposure. Each exercise
includes hints, a response inspector, completion feedback, and a prevention lesson.
These exercises simulate vulnerabilities against fictional data. Completion is
stored in the signed-in Supabase account. The practice API requires a verified
learner session. Get Started shows Google (recommended) and email/password sign-in
before the original access-code step. See [Auth setup](supabase/AUTH_SETUP.md) for
Google, confirmation email, password reset, and production configuration.

## CTF practice

The CTF collection contains five Easy, five Medium, and five Hard challenges.
Each lab has its own fictional brand and website, including social feeds, meeting
lobbies, shopping, streaming, banking, design tools, and developer pipelines.
Use the website controls, then inspect and adjust requests in the mission panel.
Recover a flag and submit it separately to record progress in the signed-in
Supabase account. Flags are validated on the server and scoped to the account.
Hard labs require a signed discovery ticket, valid for 30 minutes, before the
second stage. Expired tickets can be renewed by repeating discovery.

Training responses model vulnerabilities without executing supplied HTML,
modifying JavaScript prototypes, reading server files, or making outbound requests.
Meeting controls do not access cameras or microphones. The race-condition lab
uses a deterministic shared-snapshot model. These are educational simulations.
The dark homepage walkthrough demonstrates cursor movement, typing, request
inspection, and flag capture; it has pause/replay controls and respects reduced
motion. Its demo flag is illustrative and cannot complete a CTF.

The expanded catalog uses the existing account progress mechanism; no new
database migration or environment variable is required.

## Honey’s streak garden

The dashboard shows a daily practice garden, current and best streaks, a weekly
flower trail, a honey-jar goal, and milestones at 3, 7, 14, 30, 60 and 100 days.
A successful guided lab or a submitted CTF flag records a practice day. Replays
count; repeated completions on the same day do not add extra days. Merely logging
in, sending an unsuccessful attempt, or pressing Honey’s high-five button does
not earn a day. Completed labs show a garden reward linking to the dashboard.

The server uses its own clock and the account’s stored timezone. The browser’s
IANA timezone is saved on the first successful completion; UTC is the fallback.
A streak remains active through the day after the last practice day. Missing
that day resets the current streak while preserving the best and earned badges.
The dashboard refreshes its daily state when the date changes or the tab resumes.

Activity dates use the existing Supabase user-metadata mechanism, alongside lab
progress. They are personal motivation data, never authorization or access
control. No migration or additional environment variable is needed. Existing
completions without dates are retained, but historical streak days are not
invented. Motion respects reduced-motion preferences; the week and badge
controls work with a keyboard.

Honey also supports simple, built-in small talk: greetings, how her day is going,
her fictional favorite color/place/snack/lab, hobbies, thanks, encouragement,
celebrations, goodbyes, and a bee joke. Replies connect back to Breach Boulevard
and the Streak Garden. Conversation starters are available in her chat panel.
Casual chat preserves the current hint index; explicit requests for a lab hint
still take priority. Honey does not infer account activity or record a completion
from chat messages. No external language-model service or extra key is needed.
