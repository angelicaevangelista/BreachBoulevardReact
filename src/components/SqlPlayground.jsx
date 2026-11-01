import React from 'react';
import useSqlDemo from '../hooks/useSqlDemo';

export default function SqlPlayground() {
  const sql = useSqlDemo();

  function useExample(username, password) {
    sql.setUsername(username);
    sql.setPassword(password);
    sql.usernameRef.current?.focus();
  }

  return (
    <section className="bb-panel bb-sql-demo" aria-labelledby="sql-demo-title">
      <div className="bb-panel-heading">
        <h3 id="sql-demo-title">A sneaky little login</h3>
        <span className="bb-tag bb-tag-orange">SQL demo</span>
      </div>
      <p className="bb-muted">See what can happen when input is mixed into a SQL query.</p>
      <p className="bb-sql-safety">
        A local simulation with fictional data. No database or real login is involved.
      </p>
      <div className="bb-sql-examples" aria-label="SQL example inputs">
        <span>Try an example:</span>
        <button type="button" onClick={() => useExample('student', 'practice')}>
          Ordinary input
        </button>
        <button type="button" onClick={() => useExample("' OR '1'='1", '')}>
          Injection example
        </button>
      </div>
      <form
        className="bb-form"
        onSubmit={(event) => {
          event.preventDefault();
          sql.checkLogin();
        }}
      >
        <div className="bb-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            ref={sql.usernameRef}
            value={sql.username}
            onChange={(event) => sql.setUsername(event.target.value)}
            autoComplete="off"
            placeholder="Try a username…"
          />
        </div>
        <div className="bb-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={sql.password}
            onChange={(event) => sql.setPassword(event.target.value)}
            autoComplete="off"
            placeholder="Use a fictional password"
          />
        </div>
        <button className="bb-button bb-button-primary" type="submit">
          Login
        </button>
      </form>
      <div id="output" role="status">
        {sql.output}
      </div>
      {sql.result && (
        <div className="bb-sql-explanation" id="info">
          <div className="bb-sql-step">
            <span>01 / THE QUERY</span>
            <p>The last submitted values were inserted directly into this example query:</p>
            <code>{sql.result.query}</code>
          </div>
          <div className="bb-sql-step">
            <span>02 / WHAT HAPPENED</span>
            <p>
              {sql.result.success
                ? 'This simplified demo marks any quote as a simulated bypass. A quote alone does not necessarily produce a working SQL injection in a real query.'
                : 'No quote was detected, so this simulated login failed. This demo does not check credentials or run SQL.'}
            </p>
          </div>
          <div className="bb-sql-step">
            <span>03 / A SAFER APPROACH</span>
            <p>Use parameterized queries so the database treats input as data, not SQL syntax.</p>
            <code>{'SELECT * FROM users WHERE username = ? AND password = ?;'}</code>
            <p>
              Bind the values separately; use password hashes and a secure authentication system.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
