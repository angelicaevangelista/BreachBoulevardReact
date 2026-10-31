import React, { useState } from 'react';
import { Link } from '../routing';
import { assetUrl } from '../routing';

export default function Page() {
  return (
    <>
      <div className={'container'}>
        <h1>{'Upload Profile Picture'}</h1>

        <form action={assetUrl('api/uploads')} method={'post'} encType={'multipart/form-data'}>
          <label htmlFor={'file'}>{'Select a file to upload:'}</label>

          <input type={'file'} id={'file'} name={'file'} />

          <input type={'submit'} defaultValue={'Upload'} />
        </form>
      </div>
    </>
  );
}
