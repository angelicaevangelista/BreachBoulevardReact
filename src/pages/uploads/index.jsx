import React, { useState } from 'react';
import { Link } from '../../routing';
import { assetUrl } from '../../routing';

export default function Page() {
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');
  return (
    <>
      <h1>{'Welcome to the Vulnerable Website'}</h1>

      <p>{'This page is vulnerable to Cross-Site Scripting (XSS).'}</p>

      <form action={assetUrl('api/labs/reflected-xss')} method={'post'}>
        <label htmlFor={'name'}>{'Enter your name:'}</label>

        <input type={'text'} id={'name'} name={'name'} />

        <input type={'submit'} defaultValue={'Submit'} />
      </form>

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

      <div id={'greeting'} dangerouslySetInnerHTML={{ __html: greeting }} />
    </>
  );
}
