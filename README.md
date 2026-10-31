# Breach Boulevard — React + Node.js + Supabase

For the GitHub/Vercel deployment, see [DEPLOYMENT.md](DEPLOYMENT.md).

The frontend and backend are JavaScript. The app runs on Node.js 22 or newer;
PHP, XAMPP, and MySQL are not required. The original colors, page layouts,
images, text, React interactions, and access-code behavior are retained.

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
server, and configuration template, with no runtime npm dependencies. Real
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
stored in the current browser; the practice API does not require Supabase access.
