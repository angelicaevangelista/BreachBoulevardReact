import React, { useState } from 'react';
import { Link } from '../routing';
import { assetUrl } from '../routing';
import QuizTerminal from '../components/QuizTerminal';

export default function Page() {
  return (
    <>
      <div className={'flex flex-col items-center justify-center min-h-screen px-4'}>
        <header className={'w-full max-w-4xl text-center'}>
          <h1 className={'text-4xl font-bold text-gray-800'}>
            {'\n                Welcome to the '}
            <span className={'text-green-500'}>{'Vulnerable Testing'}</span>
            {' Portal\n            '}
          </h1>

          <p className={'mt-4 text-lg text-gray-600'}>
            {
              '\n                Learn, explore, and enhance your skills in a secure testing environment.\n            '
            }
          </p>
        </header>

        <main className={'mt-8 w-full max-w-3xl'}>
          <div className={'grid gap-6 sm:grid-cols-2'}>
            <div className={'p-6 bg-white rounded-lg shadow-md'}>
              <h2 className={'text-2xl font-semibold text-gray-700'}>
                {'What is Vulnerable Testing?'}
              </h2>

              <p className={'mt-2 text-gray-600'}>
                {
                  '\n                        Vulnerable testing is a practice to identify and mitigate weaknesses in software systems. Dive into hands-on exercises to learn more.\n                    '
                }
              </p>
            </div>

            <div className={'p-6 bg-white rounded-lg shadow-md'}>
              <h2 className={'text-2xl font-semibold text-gray-700'}>
                {'Why Learn Vulnerable Testing?'}
              </h2>

              <p className={'mt-2 text-gray-600'}>
                {
                  '\n                        Understand the importance of secure software development and improve your technical skills for a safer digital world.\n                    '
                }
              </p>
            </div>
          </div>

          <section className={'mt-12 flex flex-col items-center'}>
            <h2 className={'text-2xl font-bold text-gray-800'}>{'Interactive Hacking Terminal'}</h2>

            <QuizTerminal
              id="terminal"
              className={'terminal mt-4'}
              tabIndex={0}
              autoFocus={false}
              welcome={<>{'Welcome to the hacking terminal. Type "help" to get started.'}</>}
            />
          </section>
        </main>

        <footer className={'mt-12 text-center'}>
          <p className={'text-gray-500'}>{'© 2024 Vulnerable Testing. All rights reserved.'}</p>
        </footer>
      </div>
    </>
  );
}
