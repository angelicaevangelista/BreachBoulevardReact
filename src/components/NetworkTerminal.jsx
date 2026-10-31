import React, { useEffect, useRef, useState } from 'react';

const nmapOutput = `
Starting Nmap 7.93 ( https://nmap.org ) at 2024-12-14 12:00 UTC
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00012s latency).
Not shown: 999 closed ports
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
443/tcp open https

Nmap done: 1 IP address (1 host up) scanned in 0.10 seconds`;
async function lookup(command, signal) {
  try {
    const domain = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(command);
    const ip = /^\d{1,3}(\.\d{1,3}){3}$/.test(command);
    if (!domain && !ip) return 'Invalid input. Please enter a valid IP address or domain.';
    const url = domain
      ? `https://corsproxy.io/?https://sonar.omnisint.io/subdomains/${command}`
      : `https://corsproxy.io/?https://ipinfo.io/${command}/json`;
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    const data = await response.json();
    return domain
      ? Array.isArray(data) && data.length
        ? `Subdomains for ${command}:\n${data.join('\n')}`
        : `No subdomains found for ${command}.`
      : JSON.stringify(data, null, 2);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    return `Error fetching data: ${error.message}`;
  }
}
export default function NetworkTerminal() {
  const [input, setInput] = useState('');
  const [lines, setLines] = useState([]);
  const terminal = useRef(null);
  const requests = useRef(new Set());
  useEffect(
    () => () => {
      for (const controller of requests.current) controller.abort();
    },
    []
  );
  useEffect(() => {
    terminal.current.scrollTop = terminal.current.scrollHeight;
  }, [lines]);
  async function submit(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const command = input.trim();
    setInput('');
    setLines((value) => [...value, { kind: 'p', text: `$ ${command}` }]);
    const controller = new AbortController();
    requests.current.add(controller);
    try {
      const text = command === 'nmap' ? nmapOutput : await lookup(command, controller.signal);
      setLines((value) => [...value, { kind: 'pre', text }]);
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    } finally {
      requests.current.delete(controller);
    }
  }
  return (
    <div
      id="terminal"
      ref={terminal}
      className="p-4 bg-gray-900 rounded-lg shadow-lg h-96 overflow-y-auto"
    >
      <div id="output">
        <p>
          Type an IP address or domain to fetch information (e.g.,{' '}
          <span className="text-blue-500">8.8.8.8</span> or{' '}
          <span className="text-blue-500">example.com</span>).
        </p>
        {lines.map((line, index) => React.createElement(line.kind, { key: index }, line.text))}
      </div>
      <div className="flex mt-2">
        <span className="pr-2">$</span>
        <input
          id="commandInput"
          aria-label="Network command"
          type="text"
          className="bg-transparent border-none focus:outline-none flex-1 text-green-500"
          autoComplete="off"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={submit}
        />
      </div>
    </div>
  );
}
