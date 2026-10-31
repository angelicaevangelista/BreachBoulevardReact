# Supabase setup

Breach Boulevard uses Supabase PostgreSQL through its Node.js API. React keeps
the same access-code screens, messages, and design. No PHP server is needed.

The configured project is `bbcdeqxdfcqggacmkftj`. Its schema is defined by
`migrations/202610310001_access_codes.sql`. The existing table and functions
continue to work; this runtime migration does not recreate or clear them.

For a new installation, apply that SQL migration in the project's SQL Editor,
then copy `.env.server.example` to `.env.server` in the project/runtime root:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=sb_secret_YOUR_SERVER_KEY
```

Alternatively, set those server environment variables. An external environment
file can be selected with `SUPABASE_CONFIG_FILE`. Legacy service-role JWTs are
supported through `SUPABASE_SERVICE_ROLE_KEY`.

`.env.server` is excluded from Git and from production packages. The Node
server reads it outside the static document root. No secret belongs in a
`VITE_` variable. New secret keys use the `apikey` header; legacy JWTs also use
`Authorization`. The database adapter sanitizes upstream failures.

```powershell
npm run db:check
npm run dev
```

The first command performs a read-only connection check. The app uses
`public.breach_access_codes` with Row Level Security enabled. Only the server
role can read or modify the table or call its validation/cleanup functions.
New codes expire after one day using database time. Existing data is preserved.
Admin management requires a password-backed session in production. SQL/XSS exercises remain
teaching simulations separate from application database records.

`npm test` runs mock database integration checks without cloud writes. Live
checks can be run separately with disposable records and scoped cleanup.

References: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys),
[Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security),
[database functions](https://supabase.com/docs/guides/database/functions).
