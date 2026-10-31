import React, { useEffect, useRef, useState } from 'react';

export default function LinuxTerminal() {
  const [input, setInput] = useState('');
  const [lines, setLines] = useState([]);
  const terminal = useRef(null);
  const requests = useRef(new Set());
  const [cleared, setCleared] = useState(false);
  useEffect(
    () => () => {
      for (const controller of requests.current) controller.abort();
    },
    []
  );
  useEffect(() => {
    terminal.current.scrollTop = terminal.current.scrollHeight;
  }, [lines]);
  async function command(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const text = input;
    setInput('');
    const [name, ...args] = text.trim().split(' ');
    const append = (message) => setLines((value) => [...value, { text: message }]);
    setLines((value) => [...value, { text: `user@linux:~$ ${text}`, command: true }]);
    switch (name.toLowerCase()) {
      case 'clear':
        setLines([]);
        setCleared(true);
        break;
      case 'help':
        append(
          '\nAvailable Commands:\n- help: Show all commands\n- info <IP>: Get information about a specific IP (e.g., info 8.8.8.8)\n- clear: Clear the terminal\n    '
        );
        break;
      case 'info': {
        if (!args.length) {
          append('Usage: info <IP>');
          break;
        }
        const controller = new AbortController();
        requests.current.add(controller);
        try {
          const response = await fetch(`https://ipinfo.io/${args[0]}/json?token=YOUR_API_KEY`, {
            signal: controller.signal,
          });
          if (!response.ok) {
            append(`Error: Unable to fetch IP information for ${args[0]}`);
            break;
          }
          const data = await response.json();
          append(
            `IP Information for ${args[0]}:\n- City: ${data.city || 'N/A'}\n- Region: ${data.region || 'N/A'}\n- Country: ${data.country || 'N/A'}\n- ISP: ${data.org || 'N/A'}\n`
          );
        } catch (error) {
          if (error.name !== 'AbortError') append('Error: Unable to fetch IP information.');
        } finally {
          requests.current.delete(controller);
        }
        break;
      }
      default:
        append(`Unknown command: ${name}. Type 'help' for a list of commands.`);
    }
  }
  return (
    <div
      id="terminal-container"
      ref={terminal}
      className="w-full h-full overflow-y-auto p-4 font-mono text-sm"
    >
      <div id="output">
        {!cleared && (
          <>
            <p>Welcome to the Linux-like Terminal</p>
            <p>
              Type <span className="text-green-400">help</span> for a list of commands.
            </p>
          </>
        )}
        {lines.map((line, index) => (
          <p key={index} className={line.command ? 'text-green-400' : ''}>
            {line.text}
          </p>
        ))}
      </div>
      <div id="current-line" className="flex">
        <span className="text-green-400">user@linux:~$</span>{' '}
        <input
          id="user-input"
          aria-label="Linux command"
          className="bg-transparent border-none focus:outline-none flex-1 text-white"
          autoComplete="off"
          autoFocus
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={command}
        />
      </div>
    </div>
  );
}
