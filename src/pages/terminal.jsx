import React, { useState } from 'react';
import { Link } from '../routing';
import { assetUrl } from '../routing';
import useSqlDemo from '../hooks/useSqlDemo';
import QuizTerminal from '../components/QuizTerminal';
import FaqItem from '../components/FaqItem';

export default function Page() {
  const sql = useSqlDemo();
  return (
    <>
      <div className={'flex flex-col items-center justify-center min-h-screen px-4'}>
        <header className={'w-full max-w-4xl text-center'}>
          <h1 className={'text-4xl font-bold text-gray-800'}>
            {'\n                Welcome to the '}
            <span className={'text-orange-500'}>{'Vulnerable Testing'}</span>
            {' Portal\n            '}
          </h1>

          <p className={'mt-4 text-lg text-gray-600'}>
            {
              '\n                Learn, explore, and enhance your skills in a secure testing environment.\n            '
            }
          </p>
        </header>

        <main className={'mt-8 w-full max-w-4xl'}>
          <section className={'mt-12 flex flex-col lg:flex-row items-center lg:items-start'}>
            <div className={'lg:w-1/2 lg:pr-6'}>
              <h2 className={'text-2xl font-bold text-gray-800'}>
                {'Interactive Hacking Terminal'}
              </h2>

              <p className={'mt-4 text-gray-600'}>
                {
                  'Use the terminal to practice your hacking skills in a safe environment. Type "help" to get started.'
                }
              </p>
            </div>

            <div className={'lg:w-1/2 lg:pl-6 mt-6 lg:mt-0'}>
              <div className={'relative'}>
                <div className={'arrow-box'}>
                  <span>{'Try Me!'}</span>
                </div>

                <QuizTerminal
                  id="terminal"
                  className={'terminal mt-4'}
                  tabIndex={0}
                  autoFocus={false}
                  welcome={
                    <>
                      <div>{'Welcome to the hacking terminal. Type "help" to get started.'}</div>
                    </>
                  }
                />
              </div>
            </div>
          </section>

          <section className={'mt-12 flex flex-col lg:flex-row items-center lg:items-start'}>
            <div className={'lg:w-1/2 lg:pr-6 order-2 lg:order-1 mt-6 lg:mt-0'}>
              <div className={'relative'}>
                <button
                  className={
                    'px-4 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 focus:outline-none'
                  }
                  onClick={sql.scrollToInput}
                >
                  {'\n                            Try Me\n                        '}
                </button>

                <div
                  className={
                    'absolute top-0 left-0 right-0 flex justify-center mt-10 animate-bounce'
                  }
                >
                  <svg
                    xmlns={'http://www.w3.org/2000/svg'}
                    className={'h-6 w-6 text-orange-500'}
                    fill={'none'}
                    viewBox={'0 0 24 24'}
                    stroke={'currentColor'}
                  >
                    <path
                      strokeLinecap={'round'}
                      strokeLinejoin={'round'}
                      strokeWidth={'2'}
                      d={'M19 9l-7 7-7-7'}
                    ></path>
                  </svg>
                </div>
              </div>

              <form
                id={'sql-demo'}
                className={'flex flex-col items-center mt-6'}
                onSubmit={(event) => {
                  event.preventDefault();
                  sql.checkLogin();
                }}
              >
                <input
                  id={'username'}
                  type={'text'}
                  placeholder={'Username'}
                  className={
                    'w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400'
                  }
                  value={sql.username}
                  ref={sql.usernameRef}
                  onChange={(event) => sql.setUsername(event.target.value)}
                />

                <input
                  id={'password'}
                  type={'password'}
                  placeholder={'Password'}
                  className={
                    'w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400'
                  }
                  value={sql.password}
                  onChange={(event) => sql.setPassword(event.target.value)}
                />

                <button
                  type={'button'}
                  className={
                    'px-4 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 focus:outline-none'
                  }
                  onClick={sql.checkLogin}
                >
                  {'\n                            Login\n                        '}
                </button>
              </form>

              <div id={'output'} className={'mt-4 text-orange-600 font-semibold'}>
                {sql.output}
              </div>

              <div id={'info'} className={'mt-2 text-gray-600 text-sm'}>
                {sql.info}
              </div>
            </div>

            <div className={'lg:w-1/2 lg:pl-6 order-1 lg:order-2'}>
              <h2 className={'text-2xl font-bold text-gray-800'}>{'SQL Injection Demo'}</h2>

              <p className={'mt-4 text-gray-600'}>
                {'Try entering '}
                <code className={'bg-gray-100 text-orange-600 px-1 rounded'}>{"' OR '1'='1"}</code>
                {' to see how SQL Injection works.'}
              </p>
            </div>
          </section>

          <section className={'mt-12'}>
            <div className={'max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg'}>
              <h2 className={'text-2xl font-bold mb-4'}>{'Frequently Asked Questions'}</h2>

              <div className={'space-y-4'}>
                <FaqItem
                  className={'border-b border-gray-200 pb-4'}
                  buttonClass={
                    'w-full flex justify-between items-center text-left text-lg font-medium text-gray-700 focus:outline-none'
                  }
                  iconClass={'transition-transform transform rotate-0 fas fa-plus'}
                  answerClass={'hidden mt-2 text-gray-600'}
                  question={
                    <>
                      <span className={'ml-4'}>{'What is your return policy?'}</span>
                    </>
                  }
                >
                  {
                    '\n                                Our return policy lasts 30 days. If 30 days have gone by since your purchase, unfortunately, we can’t offer you a refund or exchange.\n                            '
                  }
                </FaqItem>

                <FaqItem
                  className={'border-b border-gray-200 pb-4'}
                  buttonClass={
                    'w-full flex justify-between items-center text-left text-lg font-medium text-gray-700 focus:outline-none'
                  }
                  iconClass={'transition-transform transform rotate-0 fas fa-plus'}
                  answerClass={'hidden mt-2 text-gray-600'}
                  question={
                    <>
                      <span className={'ml-4'}>{'How do I track my order?'}</span>
                    </>
                  }
                >
                  {
                    '\n                                You can track your order using the tracking number provided in your order confirmation email.\n                            '
                  }
                </FaqItem>

                <FaqItem
                  className={'border-b border-gray-200 pb-4'}
                  buttonClass={
                    'w-full flex justify-between items-center text-left text-lg font-medium text-gray-700 focus:outline-none'
                  }
                  iconClass={'transition-transform transform rotate-0 fas fa-plus'}
                  answerClass={'hidden mt-2 text-gray-600'}
                  question={
                    <>
                      <span className={'ml-4'}>{'Do you ship internationally?'}</span>
                    </>
                  }
                >
                  {
                    '\n                                Yes, we ship internationally. Shipping costs will apply, and will be added at checkout.\n                            '
                  }
                </FaqItem>

                <FaqItem
                  className={'border-b border-gray-200 pb-4'}
                  buttonClass={
                    'w-full flex justify-between items-center text-left text-lg font-medium text-gray-700 focus:outline-none'
                  }
                  iconClass={'transition-transform transform rotate-0 fas fa-plus'}
                  answerClass={'hidden mt-2 text-gray-600'}
                  question={
                    <>
                      <span className={'ml-4'}>{'Can I change my order?'}</span>
                    </>
                  }
                >
                  {
                    '\n                                If you need to change your order, please contact us immediately. We process orders quickly, but we will do our best to accommodate your request.\n                            '
                  }
                </FaqItem>
              </div>
            </div>
          </section>
        </main>

        <footer className={'mt-12 text-center'}>
          <p className={'text-gray-500'}>{'© 2024 Vulnerable Testing. All rights reserved.'}</p>
        </footer>
      </div>
    </>
  );
}
