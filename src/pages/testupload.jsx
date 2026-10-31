import React, { useState } from 'react';
import { Link } from '../routing';
import { assetUrl } from '../routing';

export default function Page() {
  return (
    <>
      <h1>{'Upload File'}</h1>

      <form method={'POST'} encType={'multipart/form-data'} action={assetUrl('api/labs/file-upload')}>
        <input type={'file'} name={'uploaded_file'} required />

        <button type={'submit'}>{'Upload'}</button>
      </form>
    </>
  );
}
