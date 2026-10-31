import React, { useState } from 'react';
import { Link } from '../../routing';
import { assetUrl } from '../../routing';
import useAccess from '../../hooks/useAccess';
import { routePaths } from '../../routing';

export default function Page() {
  const access = useAccess();
  return (
    <>
      <nav className={'bg-orange-500 p-4 shadow-md rounded-lg mb-6'}>
        <div className={'container mx-auto flex items-center justify-between'}>
          <a href={'#'} className={'flex items-center space-x-2'}>
            <img
              src={assetUrl('access/BBLOGO.png')}
              alt={'Breach Boulevard Logo'}
              className={'h-8 w-8'}
            />

            <span className={'text-white text-2xl font-semibold'}>{'Breach Boulevard'}</span>
          </a>

          <ul className={'flex space-x-6 text-white'}>
            <li>
              <Link className={'hover:underline'} to={routePaths['testcopy2.html']}>
                {'Home'}
              </Link>
            </li>

            <li>
              <a href={'#'} className={'hover:underline'}>
                {'About'}
              </a>
            </li>

            <li>
              <Link to="/practice" className={'hover:underline'}>{'Labs'}</Link>
            </li>

            <li>
              <a href={'#'} className={'hover:underline'}>
                {'Contact'}
              </a>
            </li>

            <li>
              <Link className={'hover:underline'} to={routePaths['access/access.html']}>
                {'Get Started'}
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className={'bg-gray-100 flex items-center justify-center min-h-screen'}>
        <div className={'bg-white shadow-lg rounded-lg p-8 w-full max-w-md'}>
          <h1 className={'text-2xl font-bold text-center text-gray-800'}>{'Enter Access Code'}</h1>

          <form id={'accessForm'} className={'mt-6'} onSubmit={access.submit}>
            <div className={'mb-4'}>
              <input
                type={'text'}
                id={'accessCode'}
                className={
                  'w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500'
                }
                placeholder={'Enter your access code'}
                required
                value={access.code}
                onChange={(event) => access.setCode(event.target.value)}
              />
            </div>

            <button
              type={'submit'}
              className={
                'w-full bg-orange-500 text-white py-3 rounded hover:bg-orange-600 transition duration-300'
              }
              disabled={access.pending}
            >
              {'\n                Submit\n            '}
            </button>
          </form>

          <div
            id={'message'}
            className={'mt-4 text-center text-lg'}
            style={{ color: access.message ? 'red' : undefined }}
          >
            {access.message}
          </div>
        </div>
      </div>
    </>
  );
}
