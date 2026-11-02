import React, { useState } from 'react';
import { Link } from '../routing';
import { assetUrl } from '../routing';
import LabMarkup from '../components/LabMarkup';

export default function Page() {
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');
  return (
    <>
      <h1>{'Welcome to the Vulnerable Website'}</h1>

      <p>{'This page is vulnerable to DOM-based XSS.'}</p>

      <p>{'Enter your name:'}</p>

      <input
        type={'text'}
        id={'nameInput'}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <button onClick={() => setGreeting('Hello, ' + name + '!')}>{'Submit'}</button>

      <div id={'greeting'}>
        <LabMarkup html={greeting} title="Isolated DOM XSS preview" />
      </div>
    </>
  );
}
