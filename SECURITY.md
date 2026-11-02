# Security review — 2 November 2026

This review covers the repository, a local production build, and the connected
Supabase project. It is a focused code review and verification, not a guarantee
against every attack or an independent penetration test. Application changes
must be pushed and deployed before they protect the public Vercel site.

## Changes made

- Replaced direct `window.eval` in the legacy DOM-XSS demonstration. All user
  markup previews now load a dedicated sandboxed response. They have an opaque
  origin, no same-origin sandbox permission, no network access, no form actions,
  and cannot read parent DOM, account cookies, or browser storage.
- Added an application Content Security Policy: scripts and connections are
  restricted to this origin, inline event attributes and dynamic evaluation are
  blocked, objects and base tags are disabled, and the app cannot be framed.
  Inline styles remain allowed for React styles and the existing teaching UI.
  The intentionally executable training documents have a separate sandbox CSP;
  their relaxed script rule never applies to the main application.
- Moved the early theme bootstrap to a same-origin JavaScript file. Theme
  preference still applies before React and the stylesheet finish loading.
- Added server-side request limits to admin and account login, signup, password
  reset/change, Google sign-in initiation, code redemption, uploads, lab attempts,
  community writes, and Honey chat. Production Vercel instances share atomic
  PostgreSQL counters through a server-only Supabase function. Database failures
  fail closed. Development uses bounded local counters. Responses include
  `Retry-After` when throttled. These are application controls, not a replacement
  for the hosting platform's denial-of-service protections.
- Counters store HMAC identifiers, not raw client network addresses. Forwarded
  client addresses are trusted only behind Vercel. Expired rows are removed on
  subsequent requests; counter tables and functions are unavailable to browser
  roles. The new migration was applied and verified on the connected project.
- Added request/header timeouts and early rejection of oversized chunked bodies.
  Existing multipart, JSON, filename, ownership, same-origin and method checks
  remain in place. Uploads remain private and non-image uploads are downloads.
- Tightened admin token parsing and retained constant-time password/signature
  comparisons, expiration, HttpOnly and SameSite cookie protections.
- Updated Vite to 6.4.5 and PostCSS to 8.5.32. The complete dependency audit
  reported **zero known vulnerabilities** after these updates.
- Added HSTS for production, MIME sniffing protection, same-origin opener policy,
  restrictive permissions, and no-referrer behavior. The sandbox preview can be
  framed by this origin; the main app's CSP forbids framing altogether.
- Added shared route validation and a custom Honey 404. Unknown lab IDs and
  unknown URLs no longer return a misleading successful application response.
  Missing pages include noindex metadata and working routes back to the site.
- Fixed runtime packaging to include the data modules imported by the server.

## Existing boundaries verified

- Learner identity is verified with Supabase Auth before protected APIs; missing,
  forged and unconfirmed sessions are rejected. Account tokens are not exposed
  to app JavaScript, returned in API JSON, or placed in browser local storage.
- Admin code operations require the separate admin session. Production fails
  closed if the admin password is absent. Do not expose the local dev server.
- The connected access-code and community tables have RLS enabled and no
  `anon`/`authenticated` table access. Their no-policy advisory is intentional:
  data access occurs through server APIs with explicit checks. See the [RLS advisory explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- `breach-uploads` is a private bucket. Download access verifies ownership.
- CTF flags are checked on the server and scoped to the account. Hard-lab
  discovery proofs reject another account, another lab, tampering and expiry.
- No real file execution, prototype pollution, race exploitation, internal
  network fetch, camera access, or microphone access occurs in simulations.
- Private keys and admin credentials stay outside the static build and Git.

## Remaining hosted setting and operational boundaries

Supabase's advisor reports **leaked-password protection disabled**. Enabling it
requires the Supabase Auth dashboard; the connected management tools do not
expose this setting. Supabase currently offers it on Pro plans and above. No
subscription upgrade or paid change was made. See [password security settings](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

Learner progress, streaks, and rank are personal motivation data stored in
user-editable metadata, not authorization claims or tamper-proof certificates.
Training content is delivered in the frontend; it is not a secret or a paid
content protection boundary. Access-code screens do not make bundled lesson
source confidential. Admin access uses a password-backed, expiring session;
this review does not add administrator MFA or per-token server revocation.

Use the existing strong admin password, protect Supabase/Vercel/GitHub accounts,
keep dependency updates and security advisories under review, and rotate secrets
if they are ever disclosed. No secret rotation was needed or performed here.

## Verification

- Full regression suite: authentication, cookies, CSRF, ownership, admin APIs,
  404 responses, malformed URLs, request limits, body limits, and existing UI.
- Disposable-account browser flow: login, execute training script inside the
  sandbox, verify it cannot access parent/cookies/storage, complete a CTF and
  persist progress. Temporary account and rate-counter test records removed.
- Two independent limiter instances issued concurrent requests to the live
  Supabase function; only the configured number succeeded.
- Dark/light desktop/mobile 404 rendering and recovery navigation checked.
- Production browser flows ran without unexpected CSP violations or JS errors.

References: [OWASP CSP guidance](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html),
[Vercel request headers](https://vercel.com/docs/headers/request-headers),
[Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).
