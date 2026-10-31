import React, { useState } from 'react';
import { Link } from '../routing';
import { assetUrl } from '../routing';

export default function Page() {
  return (
    <>
      <h1>{'CSRF Form Example'}</h1>

      <form action={assetUrl('api/labs/csrf')} method={'post'}>
        <input type={'hidden'} name={'action'} defaultValue={'transfer_funds'} />

        <input type={'hidden'} name={'amount'} defaultValue={'100'} />

        <input type={'submit'} defaultValue={'Transfer Funds'} />
      </form>
    </>
  );
}
