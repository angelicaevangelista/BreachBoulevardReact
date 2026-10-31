import React, { useState } from 'react';
import { Link } from '../routing';
import { assetUrl } from '../routing';
import useProfile from '../hooks/useProfile';

export default function Page() {
  const profile = useProfile(
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      bio: 'This is a bio.',
      avatar: 'https://via.placeholder.com/128?text=Avatar',
    },
    false
  );
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

          <div className={'text-center mb-6'}>
            <div className={'w-32 h-32 mx-auto mb-4'}>
              <img
                id={'avatarPreview'}
                alt={'User Avatar'}
                className={'w-full h-full rounded-full shadow-md object-cover'}
                src={profile.profile.avatar}
              />
            </div>
          </div>

          <div id={'profileDisplay'} className={profile.editing ? 'hidden' : undefined}>
            <p>
              <strong>{'Name:'}</strong> <span id={'displayName'}>{profile.profile.name}</span>
            </p>

            <p>
              <strong>{'Email:'}</strong> <span id={'displayEmail'}>{profile.profile.email}</span>
            </p>

            <p>
              <strong>{'Bio:'}</strong> <span id={'displayBio'}>{profile.profile.bio}</span>
            </p>

            <button
              id={'editButton'}
              className={
                'mt-4 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition'
              }
              onClick={profile.edit}
            >
              {'\n          Edit\n        '}
            </button>
          </div>

          <form
            id={'profileForm'}
            encType={'multipart/form-data'}
            action={assetUrl('api/uploads/avatar')}
            method={'POST'}
            className={profile.editing ? 'space-y-4' : 'hidden space-y-4'}
            onSubmit={profile.save}
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
                value={profile.draft.name}
                onChange={profile.field('name').onChange}
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
                value={profile.draft.email}
                onChange={profile.field('email').onChange}
              />
            </div>

            <div>
              <label htmlFor={'bio'} className={'block text-sm font-medium text-gray-700 mb-2'}>
                {'Bio:'}
              </label>

              <textarea
                id={'bio'}
                name={'bio'}
                rows={'4'}
                className={
                  'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                }
                value={profile.draft.bio}
                onChange={profile.field('bio').onChange}
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
                onChange={(event) => profile.setFile(event.target.files[0] || null)}
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
