import React, { useState } from 'react';
import { Link } from '../routing';
import { assetUrl } from '../routing';
import PostBoard from '../components/PostBoard';

export default function Page() {
  return (
    <>
      <aside className={'bg-gray-800 w-64 py-6 px-4 flex flex-col space-y-6'}>
        <h2 className={'text-2xl font-bold text-orange-500'}>{'ReadIT'}</h2>

        <nav>
          <ul className={'space-y-4'}>
            <li>
              <a href={'#'} className={'flex items-center text-gray-300 hover:text-white'}>
                <i className={'fas fa-home mr-3'}></i>
                {' Home\n          '}
              </a>
            </li>

            <li>
              <a href={'#'} className={'flex items-center text-gray-300 hover:text-white'}>
                <i className={'fas fa-fire-alt mr-3'}></i>
                {' Popular\n          '}
              </a>
            </li>

            <li>
              <a href={'#'} className={'flex items-center text-gray-300 hover:text-white'}>
                <i className={'fas fa-compass mr-3'}></i>
                {' Explore\n          '}
              </a>
            </li>

            <li>
              <a href={'#'} className={'flex items-center text-gray-300 hover:text-white'}>
                <i className={'fas fa-plus-circle mr-3'}></i>
                {' Create Community\n          '}
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <main className={'flex-1 p-6'}>
        <PostBoard />
      </main>
    </>
  );
}
