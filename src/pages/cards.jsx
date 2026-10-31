import React, { useState } from 'react';
import { Link } from '../routing';
import { assetUrl } from '../routing';

export default function Page() {
  return (
    <>
      {'html\nRun\nCopy code\n\n \n  '}
      <meta charset={'utf-8'} />

      <meta content={'width=device-width, initial-scale=1.0'} name={'viewport'} />

      <title>{'\n   Vulnerable Website Labs\n  '}</title>

      <header className={'bg-orange-600 text-white p-4'}>
        <div className={'container mx-auto flex justify-between items-center'}>
          <h1 className={'text-2xl font-bold'}>{'\n     Vulnerable Website Labs\n    '}</h1>

          <nav>
            <ul className={'flex space-x-4'}>
              <li>
                <a className={'hover:underline'} href={'#'}>
                  {'\n        Home\n       '}
                </a>
              </li>

              <li>
                <a className={'hover:underline'} href={'#'}>
                  {'\n        Labs\n       '}
                </a>
              </li>

              <li>
                <a className={'hover:underline'} href={'#'}>
                  {'\n        About\n       '}
                </a>
              </li>

              <li>
                <a className={'hover:underline'} href={'#'}>
                  {'\n        Contact\n       '}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className={'container mx-auto p-4'}>
        <section className={'mb-8'}>
          <h2 className={'text-xl font-bold mb-4'}>{'\n     Latest News\n    '}</h2>

          <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
            <a className={'block bg-white p-4 rounded shadow hover:bg-orange-100'} href={'#'}>
              <img
                alt={'A detailed description of the first news image'}
                className={'w-full h-48 object-cover rounded mb-4'}
                height={'400'}
                src={
                  'https://storage.googleapis.com/a1aa/image/oeTrMYJoBORrFC663V8KDQou7rYQQ8v9ldQobqGFXzL4K08JA.jpg'
                }
                width={'600'}
              />

              <h3 className={'text-lg font-bold mb-2'}>{'\n       News Item 1\n      '}</h3>

              <p className={'text-gray-700'}>
                {
                  '\n       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.\n      '
                }
              </p>
            </a>

            <a className={'block bg-white p-4 rounded shadow hover:bg-orange-100'} href={'#'}>
              <img
                alt={'A detailed description of the second news image'}
                className={'w-full h-48 object-cover rounded mb-4'}
                height={'400'}
                src={
                  'https://storage.googleapis.com/a1aa/image/8EA8qi6YOLqzNVgAX0IOA6OS26ImHQHXQ8ZdQ8B0pIccFaeJA.jpg'
                }
                width={'600'}
              />

              <h3 className={'text-lg font-bold mb-2'}>{'\n       News Item 2\n      '}</h3>

              <p className={'text-gray-700'}>
                {
                  '\n       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.\n      '
                }
              </p>
            </a>

            <a className={'block bg-white p-4 rounded shadow hover:bg-orange-100'} href={'#'}>
              <img
                alt={'A detailed description of the third news image'}
                className={'w-full h-48 object-cover rounded mb-4'}
                height={'400'}
                src={
                  'https://storage.googleapis.com/a1aa/image/Jj99ZEhofXTKOKDBERMRX9kNp62iIm648X9WdEezd7u3Vo5TA.jpg'
                }
                width={'600'}
              />

              <h3 className={'text-lg font-bold mb-2'}>{'\n       News Item 3\n      '}</h3>

              <p className={'text-gray-700'}>
                {
                  '\n       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.\n      '
                }
              </p>
            </a>

            <a className={'block bg-white p-4 rounded shadow hover:bg-orange-100'} href={'#'}>
              <img
                alt={'A detailed description of the fourth news image'}
                className={'w-full h-48 object-cover rounded mb-4'}
                height={'400'}
                src={
                  'https://storage.googleapis.com/a1aa/image/QhpILhBCDRoYCd6GDL1JCKZwuIZQ9uUu9o1VCqUtW6IeK08JA.jpg'
                }
                width={'600'}
              />

              <h3 className={'text-lg font-bold mb-2'}>{'\n       News Item 4\n      '}</h3>

              <p className={'text-gray-700'}>
                {
                  '\n       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.\n      '
                }
              </p>
            </a>

            <a className={'block bg-white p-4 rounded shadow hover:bg-orange-100'} href={'#'}>
              <img
                alt={'A detailed description of the fifth news image'}
                className={'w-full h-48 object-cover rounded mb-4'}
                height={'400'}
                src={
                  'https://storage.googleapis.com/a1aa/image/ZoEvabpi0FJFCVMfFJ1w4kQfpDkQTV5s8BBNX4vfNIhsrQznA.jpg'
                }
                width={'600'}
              />

              <h3 className={'text-lg font-bold mb-2'}>{'\n       News Item 5\n      '}</h3>

              <p className={'text-gray-700'}>
                {
                  '\n       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.\n      '
                }
              </p>
            </a>

            <a className={'block bg-white p-4 rounded shadow hover:bg-orange-100'} href={'#'}>
              <img
                alt={'A detailed description of the sixth news image'}
                className={'w-full h-48 object-cover rounded mb-4'}
                height={'400'}
                src={
                  'https://storage.googleapis.com/a1aa/image/IKk8j7oC9c7oHVeALmG4hr10LwsrnA04EEy2bX8LxLl2K08JA.jpg'
                }
                width={'600'}
              />

              <h3 className={'text-lg font-bold mb-2'}>{'\n       News Item 6\n      '}</h3>

              <p className={'text-gray-700'}>
                {
                  '\n       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.\n      '
                }
              </p>
            </a>
          </div>
        </section>

        <section>
          <h2 className={'text-xl font-bold mb-4'}>{'\n     Labs\n    '}</h2>

          <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
            <a className={'block bg-white p-4 rounded shadow hover:bg-orange-100'} href={'#'}>
              <img
                alt={'A detailed description of the first lab image'}
                className={'w-full h-48 object-cover rounded mb-4'}
                height={'400'}
                src={
                  'https://storage.googleapis.com/a1aa/image/5w6bEWJLnfTBfUc3Ohr9Vl3jWB2x4tJIflqInZwGrBcfWhmPB.jpg'
                }
                width={'600'}
              />

              <h3 className={'text-lg font-bold mb-2'}>{'\n       Lab 1\n      '}</h3>

              <p className={'text-gray-700'}>
                {
                  '\n       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.\n      '
                }
              </p>
            </a>

            <a className={'block bg-white p-4 rounded shadow hover:bg-orange-100'} href={'#'}>
              <img
                alt={'A detailed description of the second lab image'}
                className={'w-full h-48 object-cover rounded mb-4'}
                height={'400'}
                src={
                  'https://storage.googleapis.com/a1aa/image/AVHzvW9cF0LEL9a1mqxxux41EvaPaa5QznfYECnNhxG3K08JA.jpg'
                }
                width={'600'}
              />

              <h3 className={'text-lg font-bold mb-2'}>{'\n       Lab 2\n      '}</h3>

              <p className={'text-gray-700'}>
                {
                  '\n       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.\n      '
                }
              </p>
            </a>

            <a className={'block bg-white p-4 rounded shadow hover:bg-orange-100'} href={'#'}>
              <img
                alt={'A detailed description of the third lab image'}
                className={'w-full h-48 object-cover rounded mb-4'}
                height={'400'}
                src={
                  'https://storage.googleapis.com/a1aa/image/xCUzLgim21otKdq3Ay2qYBiJUv9lfMoeeeqggyhsOw6NXhmPB.jpg'
                }
                width={'600'}
              />

              <h3 className={'text-lg font-bold mb-2'}>{'\n       Lab 3\n      '}</h3>

              <p className={'text-gray-700'}>
                {
                  '\n       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.\n      '
                }
              </p>
            </a>

            <a className={'block bg-white p-4 rounded shadow hover:bg-orange-100'} href={'#'}>
              <img
                alt={'A detailed description of the fourth lab image'}
                className={'w-full h-48 object-cover rounded mb-4'}
                height={'400'}
                src={
                  'https://storage.googleapis.com/a1aa/image/dlghGKZRpk7iOx3eCpeGmgvrUefccBIlQ3wDQ0hRaPLSXhmPB.jpg'
                }
                width={'600'}
              />

              <h3 className={'text-lg font-bold mb-2'}>{'\n       Lab 4\n      '}</h3>

              <p className={'text-gray-700'}>
                {
                  '\n       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.\n      '
                }
              </p>
            </a>

            <a className={'block bg-white p-4 rounded shadow hover:bg-orange-100'} href={'#'}>
              <img
                alt={'A detailed description of the fifth lab image'}
                className={'w-full h-48 object-cover rounded mb-4'}
                height={'400'}
                src={
                  'https://storage.googleapis.com/a1aa/image/qxT2ovZYZrIPBtSY7sAqi4qI2dM4VCnK0no134yW3bgcFaeJA.jpg'
                }
                width={'600'}
              />

              <h3 className={'text-lg font-bold mb-2'}>{'\n       Lab 5\n      '}</h3>

              <p className={'text-gray-700'}>
                {
                  '\n       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.\n      '
                }
              </p>
            </a>

            <a className={'block bg-white p-4 rounded shadow hover:bg-orange-100'} href={'#'}>
              <img
                alt={'A detailed description of the sixth lab image'}
                className={'w-full h-48 object-cover rounded mb-4'}
                height={'400'}
                src={
                  'https://storage.googleapis.com/a1aa/image/3hK8cSEFAPpQB5evp9sfwPvp6tteLJAEEVNx3MxFOISXrQznA.jpg'
                }
                width={'600'}
              />

              <h3 className={'text-lg font-bold mb-2'}>{'\n       Lab 6\n      '}</h3>

              <p className={'text-gray-700'}>
                {
                  '\n       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.\n      '
                }
              </p>
            </a>
          </div>
        </section>
      </main>

      <footer className={'bg-orange-600 text-white p-4 mt-8'}>
        <div className={'container mx-auto text-center'}>
          <p>{'\n     © 2023 Vulnerable Website Labs. All rights reserved.\n    '}</p>
        </div>
      </footer>
    </>
  );
}
