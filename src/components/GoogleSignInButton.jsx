import React from 'react';

export default function GoogleSignInButton({ onClick, pending, googleEnabled }) {
  return (
    <div className="rounded-xl bg-orange-500/10 p-3 ring-2 ring-orange-500 shadow-lg shadow-orange-500/20">
      <p className="mb-3 text-center">
        <span className="inline-block rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
          Recommended
        </span>
      </p>
      <button
        type="button"
        onClick={onClick}
        disabled={pending || googleEnabled === false}
        aria-busy={pending}
        className="w-full border border-[#747775] bg-white text-[#1f1f1f] rounded-lg px-4 py-3 font-semibold hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400 disabled:opacity-75 disabled:cursor-wait flex items-center justify-center gap-3 transition-colors"
      >
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.73-.06-1.42-.19-2.09H12v3.96h5.92c-.26 1.28-1.03 2.36-2.17 3.08v2.56h3.51c2.05-1.89 3.3-4.67 3.3-7.51z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.51-2.56c-.98.66-2.23 1.06-3.77 1.06-2.87 0-5.31-1.94-6.18-4.56H2.2v2.64C4.01 20.52 7.72 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.82 14.28c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08V7.48H2.2A10.95 10.95 0 0 0 1 12.2c0 1.78.43 3.47 1.2 4.72l3.62-2.64z"
          />
          <path
            fill="#EA4335"
            d="M12 5.56c1.62 0 3.07.56 4.21 1.66l3.15-3.15C17.45 2.29 14.97 1.2 12 1.2c-4.28 0-7.99 2.48-9.8 6.28l3.62 2.64C6.69 7.5 9.13 5.56 12 5.56z"
          />
        </svg>
        Continue with Google
      </button>
      {googleEnabled === false && (
        <p className="text-orange-300 text-xs text-center mt-3">
          Google sign-in is temporarily unavailable.
        </p>
      )}
    </div>
  );
}
