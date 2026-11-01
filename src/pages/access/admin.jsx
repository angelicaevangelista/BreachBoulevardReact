import React from 'react';
import AppShell, { Icon, Mascot } from '../../components/Interface';
import useAdmin from '../../hooks/useAdmin';
export default function Admin() {
  const admin = useAdmin();
  const localNow = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  function formatExpiry(value) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isFinite(date.getTime())
      ? date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
      : value;
  }
  return (
    <AppShell active="admin" title="Admin console" admin>
      <div className="bb-page-heading">
        <div>
          <span className="bb-eyebrow">
            <Icon name="shield" size={14} /> YOUR TEACHING TOOLKIT
          </span>
          <h1>
            Admin Dashboard<span className="bb-orange">.</span>
          </h1>
          <p>Open the door to learning. Manage your course access codes in one place.</p>
        </div>
        <span className="bb-tag bb-tag-orange">Administrator access</span>
      </div>
      <section className="bb-panel bb-admin-hero">
        <div>
          <span className="bb-eyebrow">A LITTLE KEY TO A BIG DISCOVERY</span>
          <h2 className="bb-challenge-title">Help your learners get started.</h2>
          <p className="bb-admin-note">
            Generate a course code, share it with your learners, and keep your active codes
            organized.
          </p>
        </div>
        <Mascot compact />
      </section>
      <div className="bb-stats">
        <section className="bb-stat">
          <span className="bb-stat-icon">
            <Icon name="key" />
          </span>
          <div>
            <small>Codes in this view</small>
            <strong>{admin.codes === null ? '—' : admin.codes.length}</strong>
            <p>{admin.codes === null ? 'Load your codes below' : 'From your latest refresh'}</p>
          </div>
        </section>
        <section className="bb-stat">
          <span className="bb-stat-icon">
            <Icon name="shield" />
          </span>
          <div>
            <small>Secure administration</small>
            <strong>Protected</strong>
            <p>Server-verified admin session</p>
          </div>
        </section>
        <section className="bb-stat">
          <span className="bb-stat-icon">
            <Icon name="flask" />
          </span>
          <div>
            <small>Guided practice</small>
            <strong>6</strong>
            <p>Labs ready for your learners</p>
          </div>
        </section>
      </div>
      <div className="bb-admin-grid">
        <section className="bb-panel">
          <span className="bb-stat-icon">
            <Icon name="key" />
          </span>
          <h2 className="bb-section-title">Generate Access Code</h2>
          <p className="bb-admin-note">
            Choose how long access lasts, then create a random code or make it your own.
          </p>
          <form id="generateForm" className="bb-form bb-code-generator" onSubmit={admin.generate}>
            <div className="bb-field">
              <label htmlFor="codeDuration">Access expires after</label>
              <select
                id="codeDuration"
                value={admin.duration}
                onChange={(event) => admin.setDuration(event.target.value)}
                disabled={admin.pending}
              >
                <option value="1-day">1 day</option>
                <option value="7-days">7 days</option>
                <option value="1-month">1 month</option>
                <option value="6-months">6 months</option>
                <option value="1-year">1 year</option>
                <option value="custom">Custom date & time</option>
              </select>
            </div>
            {admin.duration === 'custom' && (
              <div className="bb-field">
                <label htmlFor="codeExpiry">Expiration date & time</label>
                <input
                  id="codeExpiry"
                  type="datetime-local"
                  required
                  min={localNow}
                  value={admin.customExpiry}
                  onChange={(event) => admin.setCustomExpiry(event.target.value)}
                  disabled={admin.pending}
                />
                <p className="bb-field-help">
                  Shown in your local time. The code stops working at this exact time.
                </p>
              </div>
            )}
            <fieldset className="bb-code-choice">
              <legend>Choose your code</legend>
              <div>
                {[
                  ['random', 'Random code', 'A fresh 8-character code'],
                  ['custom', 'Custom code', 'Something your learners recognize'],
                ].map(([value, label, note]) => (
                  <label key={value} className={admin.codeMode === value ? 'is-selected' : ''}>
                    <input
                      type="radio"
                      name="codeMode"
                      value={value}
                      checked={admin.codeMode === value}
                      onChange={() => admin.setCodeMode(value)}
                      disabled={admin.pending}
                    />
                    <span>
                      <strong>{label}</strong>
                      <small>{note}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {admin.codeMode === 'custom' && (
              <div className="bb-field">
                <label htmlFor="customAccessCode">Your custom access code</label>
                <input
                  id="customAccessCode"
                  autoComplete="off"
                  placeholder="e.g. CYBER-CLASS-2026"
                  required
                  minLength={3}
                  maxLength={64}
                  pattern="[A-Za-z0-9_\-]{3,64}"
                  title="Use 3–64 letters, numbers, hyphens, or underscores."
                  value={admin.customCode}
                  onChange={(event) => admin.setCustomCode(event.target.value)}
                  disabled={admin.pending}
                />
                <p className="bb-field-help">
                  3–64 letters, numbers, hyphens, or underscores. Codes are case-sensitive.
                </p>
              </div>
            )}
            <button className="bb-button bb-button-primary" disabled={admin.pending}>
              {admin.pending ? 'Creating…' : 'Generate Code'}
              <Icon name="arrow" size={16} />
            </button>
          </form>
          {admin.message && (
            <p className="bb-notice" role="alert">
              {admin.message}
            </p>
          )}
          {admin.generated && (
            <div className="bb-code-result" role="status">
              <span>Your access code is ready to share</span>
              <code>{admin.generated.code}</code>
              <p>Expires: {formatExpiry(admin.generated.expiresAt)}</p>
            </div>
          )}
        </section>
        <section className="bb-panel">
          <span className="bb-stat-icon">
            <Icon name="trash" />
          </span>
          <h2 className="bb-section-title">Cleanup Expired Codes</h2>
          <p className="bb-admin-note">
            Clear expired access codes from the database and keep your course workspace tidy.
          </p>
          <button
            id="cleanupBtn"
            className="bb-button bb-button-secondary"
            style={{ marginTop: 20 }}
            onClick={admin.cleanup}
          >
            Cleanup Codes
            <Icon name="trash" size={16} />
          </button>
        </section>
      </div>
      <section className="bb-panel" style={{ marginTop: 22 }}>
        <div className="bb-panel-heading">
          <h2>Generated Access Codes</h2>
          <button id="viewCodesBtn" className="bb-button bb-button-soft" onClick={admin.viewCodes}>
            <Icon name="refresh" size={16} /> View Codes
          </button>
        </div>
        {admin.codes === null ? (
          <div className="bb-empty">
            <Icon name="key" size={30} />
            <p style={{ marginTop: 12 }}>Load your codes to see their expiration times.</p>
          </div>
        ) : (
          <div id="codesListContainer" className="bb-table-wrap">
            <table id="codesList" className="bb-code-table">
              <thead>
                <tr>
                  <th>Access code</th>
                  <th>Expires at</th>
                </tr>
              </thead>
              <tbody>
                {admin.codes.length ? (
                  admin.codes.map((item) => (
                    <tr key={item.code}>
                      <td>
                        <code>{item.code}</code>
                      </td>
                      <td>
                        <time dateTime={item.expires_at}>{formatExpiry(item.expires_at)}</time>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2}>No codes found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
