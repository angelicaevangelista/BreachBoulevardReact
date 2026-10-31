import React, { useRef, useState } from 'react';
export default function useSqlDemo() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const usernameRef = useRef(null);
  const checkLogin = () =>
    setResult({
      success: username.includes("'") || password.includes("'"),
      query: `SELECT * FROM users WHERE username = '${username}' AND password = '${password}';`,
    });
  return {
    username,
    password,
    setUsername,
    setPassword,
    usernameRef,
    checkLogin,
    scrollToInput: () => usernameRef.current?.scrollIntoView({ behavior: 'smooth' }),
    output: result
      ? result.success
        ? 'Login Successful! (Simulated SQL Injection)'
        : 'Login Failed!'
      : '',
    info: result?.success ? (
      <>
        <strong>Explanation:</strong> Input was interpreted as part of SQL query:
        <br />
        <code>{result.query}</code>
      </>
    ) : null,
  };
}
