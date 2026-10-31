import React, { useState } from 'react';
import { Link } from '../routing';
import { assetUrl } from '../routing';

export default function Page() {
  return (
    <>
      <h1>{'Welcome to the Vulnerable Website'}</h1>

      <p>{'This page is vulnerable to Cross-Site Scripting (XSS).'}</p>

      <form action={assetUrl('api/labs/reflected-xss')} method={'post'}>
        <label htmlFor={'name'}>{'Enter your name:'}</label>

        <input type={'text'} id={'name'} name={'name'} />

        <input type={'submit'} defaultValue={'Submit'} />
      </form>
    </>
  );
}
