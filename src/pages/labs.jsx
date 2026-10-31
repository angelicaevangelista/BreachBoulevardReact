import React, { useState } from 'react';
import { Link } from '../routing';
import { assetUrl } from '../routing';

export default function Page() {
  const [progress, setProgress] = useState([75, 50, 20]);
  return (
    <>
      <header className={'bg-blue-600 text-white py-4'}>
        <div className={'container mx-auto flex justify-between items-center'}>
          <h1 className={'text-xl font-bold'}>{'Course Tracker'}</h1>

          <nav>
            <ul className={'flex space-x-4'}>
              <li>
                <a href={'#'} className={'hover:underline'}>
                  {'Home'}
                </a>
              </li>

              <li>
                <a href={'#'} className={'hover:underline'}>
                  {'Courses'}
                </a>
              </li>

              <li>
                <a href={'#'} className={'hover:underline'}>
                  {'Profile'}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className={'container mx-auto py-8'}>
        <section className={'text-center mb-8'}>
          <h2 className={'text-2xl font-semibold'}>{'Welcome, [Student Name]'}</h2>

          <p className={'text-gray-700'}>
            {'Track your learning progress and achieve your goals!'}
          </p>
        </section>

        <section className={'bg-white shadow-md rounded-lg p-6'}>
          <h3 className={'text-lg font-bold mb-4'}>{'Your Progress'}</h3>

          <div className={'space-y-4'}>
            <div>
              <h4 className={'font-semibold'}>{'Module 1: Introduction to Cybersecurity'}</h4>

              <div className={'relative pt-1'}>
                <div className={'overflow-hidden h-4 mb-4 text-xs flex rounded bg-blue-200'}>
                  <div
                    id={'module1-progress'}
                    className={
                      'shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500'
                    }
                    style={{ width: progress[0] + '%' }}
                  ></div>
                </div>

                <p className={'text-sm text-gray-600'}>{progress[0]}% completed</p>

                <button
                  className={'mt-2 bg-green-600 text-white py-1 px-4 rounded hover:bg-green-700'}
                  onClick={() =>
                    setProgress((value) =>
                      value.map((item, index) => (index === 0 ? Math.min(100, item + 25) : item))
                    )
                  }
                >
                  {'Complete Lab'}
                </button>
              </div>
            </div>

            <div>
              <h4 className={'font-semibold'}>{'Module 2: Threat Analysis'}</h4>

              <div className={'relative pt-1'}>
                <div className={'overflow-hidden h-4 mb-4 text-xs flex rounded bg-green-200'}>
                  <div
                    id={'module2-progress'}
                    className={
                      'shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500'
                    }
                    style={{ width: progress[1] + '%' }}
                  ></div>
                </div>

                <p className={'text-sm text-gray-600'}>{progress[1]}% completed</p>

                <button
                  className={'mt-2 bg-green-600 text-white py-1 px-4 rounded hover:bg-green-700'}
                  onClick={() =>
                    setProgress((value) =>
                      value.map((item, index) => (index === 1 ? Math.min(100, item + 25) : item))
                    )
                  }
                >
                  {'Complete Lab'}
                </button>
              </div>
            </div>

            <div>
              <h4 className={'font-semibold'}>{'Module 3: Incident Response'}</h4>

              <div className={'relative pt-1'}>
                <div className={'overflow-hidden h-4 mb-4 text-xs flex rounded bg-red-200'}>
                  <div
                    id={'module3-progress'}
                    className={
                      'shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500'
                    }
                    style={{ width: progress[2] + '%' }}
                  ></div>
                </div>

                <p className={'text-sm text-gray-600'}>{progress[2]}% completed</p>

                <button
                  className={'mt-2 bg-green-600 text-white py-1 px-4 rounded hover:bg-green-700'}
                  onClick={() =>
                    setProgress((value) =>
                      value.map((item, index) => (index === 2 ? Math.min(100, item + 25) : item))
                    )
                  }
                >
                  {'Complete Lab'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={'mt-8'}>
          <h3 className={'text-lg font-bold mb-4'}>{'Available Courses'}</h3>

          <div className={'grid grid-cols-1 md:grid-cols-3 gap-4'}>
            <div className={'bg-white shadow-md rounded-lg p-4'}>
              <h4 className={'font-semibold text-blue-600'}>{'Advanced Pentesting'}</h4>

              <p className={'text-sm text-gray-700'}>
                {'Explore advanced techniques in penetration testing.'}
              </p>

              <button className={'mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700'}>
                {'Start Course'}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className={'bg-gray-800 text-white py-4'}>
        <div className={'container mx-auto text-center'}>
          <p>{'© 2024 Course Tracker. All rights reserved.'}</p>
        </div>
      </footer>
    </>
  );
}
