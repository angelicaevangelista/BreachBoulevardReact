import React, { useState } from 'react';
import { Link } from '../routing';
import { assetUrl } from '../routing';

export default function Page() {
  return (
    <>
      <header className={'bg-orange-600 p-4'}>
        <div className={'container mx-auto flex justify-between items-center'}>
          <h1 className={'text-3xl font-bold'}>{'ProfileApp'}</h1>

          <nav>
            <ul className={'flex space-x-6'}>
              <li>
                <a href={'#'} className={'hover:underline'}>
                  {'Home'}
                </a>
              </li>

              <li>
                <a href={'#'} className={'hover:underline'}>
                  {'Profile'}
                </a>
              </li>

              <li>
                <a href={'#'} className={'hover:underline'}>
                  {'Logout'}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className={'container mx-auto py-8'}>
        <div className={'bg-white text-[#0d1b2a] p-6 rounded-lg shadow-lg max-w-2xl mx-auto'}>
          <h3 className={'text-2xl font-bold mb-4 text-center text-orange-600'}>
            {'Your Profile'}
          </h3>

          <p className={'text-center mb-6'}>{'Upload your avatar and manage your profile.'}</p>

          <div className={'text-center mb-6'}>
            <div className={'w-32 h-32 mx-auto mb-4'}>
              <img
                id={'avatarPreview'}
                src={'https://via.placeholder.com/128?text=Avatar'}
                alt={'User Avatar'}
                className={'w-full h-full rounded-full shadow-md object-cover'}
              />
            </div>
          </div>

          <form
            id={'profileForm'}
            className={'space-y-4'}
            encType={'multipart/form-data'}
            action={assetUrl('api/uploads')}
            method={'POST'}
          >
            <div>
              <label htmlFor={'name'} className={'block text-sm font-medium text-gray-700 mb-2'}>
                {'Name:'}
              </label>

              <input
                type={'text'}
                id={'name'}
                name={'name'}
                className={
                  'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                }
              />
            </div>

            <div>
              <label htmlFor={'email'} className={'block text-sm font-medium text-gray-700 mb-2'}>
                {'Email:'}
              </label>

              <input
                type={'email'}
                id={'email'}
                name={'email'}
                className={
                  'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                }
              />
            </div>

            <div>
              <label htmlFor={'avatar'} className={'block text-sm font-medium text-gray-700 mb-2'}>
                {'Upload Avatar:'}
              </label>

              <input
                type={'file'}
                id={'avatar'}
                name={'avatar'}
                className={
                  'block w-full text-gray-700 p-2 rounded-lg border focus:ring-2 focus:ring-orange-500'
                }
              />
            </div>

            <button
              type={'submit'}
              className={
                'w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition'
              }
            >
              {'\n          Save\n        '}
            </button>
          </form>
        </div>
      </main>

      <footer className={'bg-gray-800 text-center py-4'}>
        <p>{'© 2025 ProfileApp. All rights reserved.'}</p>
      </footer>
    </>
  );
}
