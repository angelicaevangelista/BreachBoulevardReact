import React from 'react';
import AppShell, { Icon, Mascot } from '../../components/Interface';
import useAdmin from '../../hooks/useAdmin';
export default function Admin() {
  const admin = useAdmin();
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
            Create a fresh course access code. Your existing expiration rules still apply.
          </p>
          <form id="generateForm" onSubmit={admin.generate}>
            <button className="bb-button bb-button-primary" style={{ marginTop: 20 }}>
              Generate Code
              <Icon name="arrow" size={16} />
            </button>
          </form>
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
                      <td>{item.expires_at}</td>
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
