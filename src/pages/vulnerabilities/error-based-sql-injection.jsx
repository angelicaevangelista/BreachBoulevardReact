import React, { useState } from 'react';
import { Link } from '../../routing';
import { assetUrl } from '../../routing';

export default function Page() {
  return (
    <>
      <header className={'bg-[#0d1b2a] text-white p-4'}>
        <div className={'container mx-auto flex justify-between items-center'}>
          <h1 className={'text-3xl font-bold text-orange-500'}>{'ShopNow'}</h1>

          <nav className={'space-x-4'}>
            <a href={'#'} className={'hover:underline'}>
              {'Home'}
            </a>

            <a href={'#'} className={'hover:underline'}>
              {'Products'}
            </a>

            <a href={'#'} className={'hover:underline'}>
              {'Contact'}
            </a>

            <a href={'#'} className={'hover:underline'}>
              {'Cart'}
            </a>
          </nav>
        </div>
      </header>

      <section className={'bg-orange-500 text-white text-center py-8'}>
        <h2 className={'text-4xl font-bold'}>{'Welcome to ShopNow'}</h2>

        <p className={'mt-2'}>{'Find the best deals on electronics, gadgets, and more!'}</p>
      </section>

      <main className={'container mx-auto py-8'}>
        <div className={'bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto'}>
          <h3 className={'text-xl font-bold text-gray-800 mb-4'}>{'Search for Products'}</h3>

          <form id={'searchForm'} className={'flex items-center'}>
            <input
              type={'text'}
              id={'search'}
              name={'search'}
              className={
                'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
              }
              placeholder={'e.g., Laptop, Headphones, Smartphone'}
              required
            />

            <button
              type={'submit'}
              className={
                'ml-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition'
              }
            >
              {'\n          Search\n        '}
            </button>
          </form>
        </div>

        <div className={'max-w-6xl mx-auto mt-8'}>
          <h3 className={'text-2xl font-bold text-gray-800 mb-6'}>{'Our Products'}</h3>

          <div id={'results'} className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'}>
            <div className={'bg-white p-4 rounded-lg shadow-md flex flex-col items-center'}>
              <img
                src={'https://via.placeholder.com/300x200?text=Laptop'}
                alt={'Laptop'}
                className={'w-full h-40 object-cover mb-4 rounded-lg'}
              />

              <h3 className={'text-lg font-bold text-center'}>{'Laptop'}</h3>

              <p className={'font-bold text-orange-500 mt-2 text-center'}>{'$999'}</p>

              <button
                className={
                  'bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition mt-4 w-full'
                }
              >
                {'\n            Add to Cart\n          '}
              </button>
            </div>

            <div className={'bg-white p-4 rounded-lg shadow-md flex flex-col items-center'}>
              <img
                src={'https://via.placeholder.com/300x200?text=Headphones'}
                alt={'Headphones'}
                className={'w-full h-40 object-cover mb-4 rounded-lg'}
              />

              <h3 className={'text-lg font-bold text-center'}>{'Headphones'}</h3>

              <p className={'font-bold text-orange-500 mt-2 text-center'}>{'$199'}</p>

              <button
                className={
                  'bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition mt-4 w-full'
                }
              >
                {'\n            Add to Cart\n          '}
              </button>
            </div>

            <div className={'bg-white p-4 rounded-lg shadow-md flex flex-col items-center'}>
              <img
                src={'https://via.placeholder.com/300x200?text=Mouse'}
                alt={'Mouse'}
                className={'w-full h-40 object-cover mb-4 rounded-lg'}
              />

              <h3 className={'text-lg font-bold text-center'}>{'Mouse'}</h3>

              <p className={'font-bold text-orange-500 mt-2 text-center'}>{'$49'}</p>

              <button
                className={
                  'bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition mt-4 w-full'
                }
              >
                {'\n            Add to Cart\n          '}
              </button>
            </div>

            <div className={'bg-white p-4 rounded-lg shadow-md flex flex-col items-center'}>
              <img
                src={'https://via.placeholder.com/300x200?text=Smartphone'}
                alt={'Smartphone'}
                className={'w-full h-40 object-cover mb-4 rounded-lg'}
              />

              <h3 className={'text-lg font-bold text-center'}>{'Smartphone'}</h3>

              <p className={'font-bold text-orange-500 mt-2 text-center'}>{'$699'}</p>

              <button
                className={
                  'bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition mt-4 w-full'
                }
              >
                {'\n            Add to Cart\n          '}
              </button>
            </div>

            <div className={'bg-white p-4 rounded-lg shadow-md flex flex-col items-center'}>
              <img
                src={'https://via.placeholder.com/300x200?text=Keyboard'}
                alt={'Keyboard'}
                className={'w-full h-40 object-cover mb-4 rounded-lg'}
              />

              <h3 className={'text-lg font-bold text-center'}>{'Keyboard'}</h3>

              <p className={'font-bold text-orange-500 mt-2 text-center'}>{'$89'}</p>

              <button
                className={
                  'bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition mt-4 w-full'
                }
              >
                {'\n            Add to Cart\n          '}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className={'bg-[#0d1b2a] text-white text-center py-4'}>
        <p>{'© 2025 ShopNow. All rights reserved.'}</p>
      </footer>
    </>
  );
}
