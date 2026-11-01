# Learner accounts

The app uses Supabase Auth for its account database. Users and password hashes
live in Supabase's managed `auth.users` schema; passwords are never stored in
application tables. No additional SQL migration is needed for authentication.
Completed practice lab IDs are stored in the user's `raw_user_meta_data` through
the authenticated Auth API. This metadata is for learning progress only and is
never used to grant privileges. Admin access stays separate from learner accounts.

## Supabase dashboard configuration

In Authentication → URL Configuration:

- Site URL: `https://breachboulevard.vercel.app`
- Redirect allowlist: `https://breachboulevard.vercel.app/api/auth/callback`
- Recovery redirect: `https://breachboulevard.vercel.app/api/auth/callback?flow=recovery`
- For local testing only, add the corresponding callbacks on
  `http://127.0.0.1:5173` and `http://localhost:5173` if needed.

Keep email confirmation enabled. Configure a custom SMTP provider before opening
email registration to the public. The built-in Supabase mail service is limited
to project team addresses and is not intended for production email delivery.
Configure authentication rate limits and, when available for the project, leaked
password protection. The application requires 12–128 characters on new passwords;
configure Supabase's password policy too so direct Auth API requests follow it.

## Google

1. Create/configure the Google Cloud OAuth consent screen. Request only `openid`,
   `email`, and `profile`. Add test users if the app is in testing mode, or publish
   the OAuth app when it is ready for public use.
2. Create an OAuth Client ID with type **Web application**.
3. Authorized JavaScript origin: `https://breachboulevard.vercel.app`.
4. Authorized redirect URI:
   `https://bbcdeqxdfcqggacmkftj.supabase.co/auth/v1/callback`.
5. Enable Google in Supabase Authentication → Sign In / Providers. Enter the
   Google Client ID and Client Secret directly in Supabase, and save.

No Google secret belongs in the browser, source repository, or chat. The website
checks whether Google is enabled; its recommended Google button becomes available
after the provider is configured. Google OAuth is not testable end to end until
the account owner completes provider configuration and signs in interactively.

## Session and request protection

- The official `@supabase/ssr` SDK manages PKCE and refresh-token rotation.
- Only the Node API uses the Supabase SDK and keys. The existing server secret
  supports these server-side Auth calls. An optional `SUPABASE_PUBLISHABLE_KEY`
  can be configured for Auth, independently of the secret used by admin APIs.
- Cookies are HttpOnly, SameSite=Lax and host-only, with Secure and the `__Host-`
  prefix on HTTPS. Tokens are not sent in JSON or kept in browser storage.
- Every learner API request verifies the current user with Supabase `getUser()`
  and requires a confirmed email. React gates are not the authorization boundary.
- State-changing API requests must have a same-origin Origin header. Auth
  submissions must also be JSON. OAuth callbacks exchange a PKCE-bound code and
  use fixed local destinations rather than a caller-supplied redirect URL.
- Training HTML is confined to sandboxed, opaque-origin frames/responses, with
  network access restricted by CSP. It cannot read the account page or cookies.
- Upload metadata includes the verified owner ID. Authenticated download routes
  reject other users, and the Supabase storage bucket remains private. Old files
  without an owner are not exposed through authenticated download routes.
- Supabase Auth applies server-side rate limits. With a server proxy, clients
  share the server IP quota unless end-user IP forwarding is configured in
  Supabase. No untrusted browser IP header is forwarded by this app.

## Verification

Test a confirmed email account: login → access-code page → courses → solve a lab
→ reload and confirm saved progress → logout → verify protected API calls return
401. Test confirmation, Google sign-in and password-reset links in the browser
that initiated the flow (PKCE verifier cookies bind links to that browser).

References: [Supabase server-side Auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client),
[Google setup](https://supabase.com/docs/guides/auth/social-sign-in/auth-google),
[custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp),
[rate limits](https://supabase.com/docs/guides/auth/rate-limits).
