import React, { useState } from 'react';
import { Link } from '../../routing';
import { assetUrl } from '../../routing';
import useAdmin from '../../hooks/useAdmin';

export default function Page() {
  const admin = useAdmin();
  return (
    <>
      <header className={'bg-orange-500 text-white p-6 text-center'}>
        <h1 className={'text-3xl font-bold'}>{'Admin Dashboard'}</h1>
      </header>

      <main className={'flex-grow p-4'}>
        <div className={'grid grid-cols-1 md:grid-cols-3 gap-6'}>
          <div
            className={
              'bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300'
            }
          >
            <h3 className={'text-xl font-semibold text-orange-500'}>{'Generate Access Code'}</h3>

            <p className={'text-gray-600 mt-2'}>
              {'Click the button to generate a new access code.'}
            </p>

            <form id={'generateForm'} className={'mt-4'} onSubmit={admin.generate}>
              <button
                type={'submit'}
                className={
                  'bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition-colors duration-300'
                }
              >
                {'\n                        Generate Code\n                    '}
              </button>
            </form>
          </div>

          <div
            className={
              'bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300'
            }
          >
            <h3 className={'text-xl font-semibold text-orange-500'}>{'Generated Codes'}</h3>

            <p className={'text-gray-600 mt-2'}>
              {'View all generated access codes and their expiration times.'}
            </p>

            <button
              id={'viewCodesBtn'}
              className={
                'bg-orange-500 text-white py-2 px-4 rounded mt-4 hover:bg-orange-600 transition-colors duration-300'
              }
              onClick={admin.viewCodes}
            >
              {'\n                    View Codes\n                '}
            </button>
          </div>

          <div
            className={
              'bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300'
            }
          >
            <h3 className={'text-xl font-semibold text-orange-500'}>{'Cleanup Expired Codes'}</h3>

            <p className={'text-gray-600 mt-2'}>
              {'Remove all expired access codes from the database.'}
            </p>

            <button
              id={'cleanupBtn'}
              className={
                'bg-orange-500 text-white py-2 px-4 rounded mt-4 hover:bg-orange-600 transition-colors duration-300'
              }
              onClick={admin.cleanup}
            >
              {'\n                    Cleanup Codes\n                '}
            </button>
          </div>
        </div>

        <div id={'codesListContainer'} className={admin.codes === null ? 'mt-8 hidden' : 'mt-8 '}>
          <h2 className={'text-2xl font-semibold text-gray-800'}>{'Generated Access Codes'}</h2>

          <ul
            id={'codesList'}
            className={'mt-4 list-disc list-inside bg-white p-4 rounded-lg shadow-lg'}
          >
            {admin.codes?.length ? (
              admin.codes.map((item) => (
                <li key={item.code}>
                  Code: {item.code} - Expires At: {item.expires_at}
                </li>
              ))
            ) : (
              <li>No codes found.</li>
            )}
          </ul>
        </div>
      </main>

      <footer className={'bg-black text-white text-center py-4'}>
        <p className={'text-sm'}>{'Admin Dashboard'}</p>
      </footer>
    </>
  );
}
