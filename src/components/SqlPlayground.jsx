import React from 'react';
import useSqlDemo from '../hooks/useSqlDemo';

export default function SqlPlayground() {
  const sql = useSqlDemo();
  return (
    <section className="bb-panel bb-sql-demo" aria-labelledby="sql-demo-title">
      <div className="bb-panel-heading">
        <h3 id="sql-demo-title">A sneaky little login</h3>
        <span className="bb-tag bb-tag-orange">SQL demo</span>
      </div>
      <p className="bb-muted">Think you can get in? Try it and see what happens.</p>
      <p className="bb-sql-safety">A local simulation. Use fictional details only.</p>
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
      <div
        id="output"
        role="status"
        className={sql.result ? `bb-sql-result ${sql.result.success ? 'is-success' : 'is-failure'}` : ''}
      >
        {sql.result && (sql.result.success ? 'Login Successful!' : 'Login Failed!')}
      </div>
    </section>
  );
}
