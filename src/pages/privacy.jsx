import React from 'react';
import { Link } from '../routing';

const sections = [
  [
    'Information used by the website',
    [
      'Account information includes your account ID, email address, and authentication-provider information. When you use Google, Supabase Auth can receive your basic profile, including your name and profile picture.',
      'Completed practice lab IDs, practice dates, and your streak timezone are saved with your account. Practice inputs are processed to produce training responses. Some demonstrations keep their state only in your browser.',
      'Files you choose to upload are stored with their filename, content type, and an account ID used to restrict access. Avoid submitting confidential or personal files to training labs.',
      'Requests to the website, hosting, and authentication services can include IP addresses, browser information, timestamps, and diagnostic or security logs.',
    ],
  ],
  [
    'Google sign-in',
    [
      'Google account details identify your account, sign you in, and associate learning progress and uploads with your account. The flow requests basic identity scopes: OpenID, email, and profile. It does not request permission to read Gmail messages, Drive files, or contacts.',
      'Your Google password is entered with Google; Breach Boulevard does not receive it. You can revoke the connection in your Google Account settings. Revoking it does not automatically delete your existing Breach Boulevard account or uploads.',
    ],
  ],
  [
    'Service providers',
    [
      'Vercel hosts the website and API. Supabase provides authentication, the account database, and private cloud upload storage. These providers process information needed to deliver their services. Google processes information when you choose Google sign-in.',
      'For email and password accounts, Supabase Auth manages password hashes. Passwords supplied to the sign-in API are forwarded to Supabase for authentication; they are not saved as plain text in application tables.',
    ],
  ],
  [
    'Cookies and browser storage',
    [
      'Authentication cookies keep you signed in. Production account cookies use HttpOnly, Secure, and SameSite attributes. Authentication tokens are not returned to application JavaScript or stored by this app in local storage. Some training demonstrations use browser storage for local state.',
      'Signing out clears this browser’s active application session. Clearing cookies or browser storage can remove local sessions and demonstration state; it does not delete information already saved in Supabase.',
      'Your light or dark appearance preference is saved in this browser’s local storage. It does not contain account credentials.',
      'Security throttling stores keyed hashes of client network addresses with short-lived request counters in Supabase. These counters do not store the original network address or your messages. Expired counters are removed during subsequent requests.',
    ],
  ],
  [
    'Retention and deletion',
    [
      'Account details and saved learning progress remain in the account database until removed. Uploads are stored separately and may remain until they are removed as well. Signing out does not delete these records. Hosting and authentication providers maintain logs and backups under their own retention practices.',
      'For account, progress, or uploaded-file deletion requests, contact the address below using your account email. Do not send passwords, authentication codes, or API keys. Identity may need to be verified before an account-related request can be carried out.',
    ],
  ],
];
export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white">
      <nav className="bg-orange-500 px-6 py-4 flex flex-wrap justify-between gap-4">
        <Link to="/" className="text-xl font-bold">
          Breach Boulevard
        </Link>
        <Link to="/access" className="hover:underline">
          Sign in
        </Link>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <header>
          <p className="text-orange-400 text-sm font-semibold">Breach Boulevard</p>
          <h1 className="text-4xl font-bold mt-3">Privacy notice</h1>
          <p className="text-gray-400 mt-3">Last updated: 1 November 2026</p>
          <p className="text-gray-300 mt-5">
            This notice describes how this cybersecurity learning website handles accounts, saved
            lab progress, and files you submit.
          </p>
        </header>
        {sections.map(([title, paragraphs]) => (
          <section key={title} className="space-y-4 text-gray-300 leading-relaxed">
            <h2 className="text-xl font-bold text-orange-400">{title}</h2>
            {paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </section>
        ))}
        <section className="space-y-4 text-gray-300">
          <h2 className="text-xl font-bold text-orange-400">Provider information</h2>
          <p>
            <a
              className="text-orange-400 underline"
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noreferrer"
            >
              Vercel privacy policy
            </a>{' '}
            ·{' '}
            <a
              className="text-orange-400 underline"
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noreferrer"
            >
              Supabase privacy policy
            </a>{' '}
            ·{' '}
            <a
              className="text-orange-400 underline"
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
            >
              Google privacy policy
            </a>
          </p>
        </section>
        <section className="space-y-4 text-gray-300">
          <h2 className="text-xl font-bold text-orange-400">Contact</h2>
          <p>
            For questions about this website’s handling of your information, contact{' '}
            <a
              href="mailto:angelicaevangelista04@gmail.com"
              className="text-orange-400 underline break-all"
            >
              angelicaevangelista04@gmail.com
            </a>
            .
          </p>
        </section>
        <footer className="border-t border-gray-700 pt-6">
          <Link to="/" className="text-orange-400 hover:underline">
            Back to Breach Boulevard
          </Link>
        </footer>
      </main>
    </div>
  );
}
