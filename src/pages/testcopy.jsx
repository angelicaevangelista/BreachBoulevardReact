import React, { useState } from 'react';
import { Link } from '../routing';
import { assetUrl } from '../routing';
import useSqlDemo from '../hooks/useSqlDemo';
import { routePaths } from '../routing';
import QuizTerminal from '../components/QuizTerminal';
import FaqItem from '../components/FaqItem';

export default function Page() {
  const sql = useSqlDemo();
  return (
    <>
      <nav className={'bg-orange-500 p-4 shadow-md rounded-lg mb-6'}>
        <div className={'container mx-auto flex items-center justify-between'}>
          <a href={'#'} className={'flex items-center space-x-2'}>
            <img src={assetUrl('BBLOGO.png')} alt={'Breach Boulevard Logo'} className={'h-8 w-8'} />

            <span className={'text-white text-2xl font-semibold'}>{'Breach Boulevard'}</span>
          </a>

          <ul className={'flex space-x-6 text-white'}>
            <li>
              <a href={'#'} className={'hover:underline'}>
                {'Home'}
              </a>
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

      <div className={'flex flex-col items-center justify-center min-h-screen px-4'}>
        <header className={'w-full max-w-4xl text-center'}>
          <h1 className={'text-4xl font-bold text--800 text-white'}>
            {'\n                Secure Tomorrow by  '}
            <span className={'text-orange-500'}>{'Hacking Today.'}</span>
          </h1>

          <p className={'mt-4 text-lg text-white'}>
            {'\n                Defend by Understanding the Hacker’s Mindset.\n            '}
          </p>
        </header>

        <main className={'mt-8 w-full max-w-4xl'}>
          <section className={'mt-12 flex flex-col lg:flex-row items-center lg:items-start'}>
            <div className={'lg:w-1/2 lg:pr-6'}>
              <h2 className={'text-2xl font-bold text-white'}>{'Interactive Terminal'}</h2>

              <p className={'mt-4 text-white'}>
                {
                  'Use the terminal to practice your skills in a safe environment. Type "help" to get started.'
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
                  autoFocus={true}
                  welcome={
                    <>
                      <div>{'Welcome to Breach Boulevard. Type "help" to get started.'}</div>
                    </>
                  }
                />
              </div>
            </div>
          </section>

          <br />

          <br />

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
              <h2 className={'text-2xl font-bold text-white'}>{'SQL Injection Demo'}</h2>

              <p className={'mt-4 text-white'}>
                {'Try entering '}
                <code className={'bg-orange-500 text-white px-1 rounded'}>{"' OR '1'='1"}</code>
                {' to see how SQL Injection works.'}
              </p>
            </div>
          </section>

          <br />

          <br />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: '#0d1b2a',
              padding: '50px',
              borderRadius: '15px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
              fontFamily: 'Arial, sans-serif',
              color: '#ffffff',
              margin: '0 20px',
            }}
          >
            <div
              style={{
                flex: '1',
                background:
                  'linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                padding: '20px',
                borderRadius: '20px',
                marginRight: '15px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              <p
                style={{
                  fontSize: '88px',
                  fontWeight: 'bold',
                  color: 'rgb(249, 115, 22)',
                  margin: '0',
                }}
              >
                {'75%'}
              </p>

              <p
                style={{
                  fontSize: '18px',
                  lineHeight: '1.5',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: '10px 0 0',
                }}
              >
                {
                  '\n                        Cybersecurity professionals achieve better outcomes when trained using real-world vulnerabilities rather than theoretical models.\n                    '
                }
              </p>
            </div>

            <div
              style={{
                flex: '1',
                background:
                  'linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                padding: '20px',
                borderRadius: '20px',
                marginLeft: '15px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              <p
                className={
                  'text-3xl font-bold font-size: 24px; font-weight: bold; color: rgb(228, 228, 228); margin: 0;'
                }
              >
                {
                  '\n                        Bridge the gap between theory and practice. Use real-world vulnerabilities for hands-on learning.\n                    '
                }
              </p>

              <svg
                width={'100%'}
                height={'80'}
                viewBox={'0 0 300 80'}
                xmlns={'http://www.w3.org/2000/svg'}
                style={{ marginTop: '20px' }}
              >
                <path
                  d={'M0,40 Q50,10 100,40 T200,40 Q250,70 300,40'}
                  fill={'none'}
                  stroke={'rgb(249, 115, 22)'}
                  strokeWidth={'4'}
                ></path>
              </svg>
            </div>
          </div>

          <br />

          <br />

          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '40px',
              borderRadius: '15px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
              fontFamily: 'Arial, sans-serif',
              maxWidth: '900px',
              margin: 'auto',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                color: '#6c6c6c',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              {'What is Your Website?'}
            </p>

            <h1 style={{ fontSize: '32px', color: '#333333', lineHeight: '1.4' }}>
              {'\n                  An '}
              <span style={{ color: 'rgb(249, 115, 22)', fontWeight: 'bold' }}>
                {'innovative learning platform'}
              </span>
              {' \n                  for '}
              <span style={{ color: 'rgb(249, 115, 22)', fontWeight: 'bold' }}>
                {'real-world cybersecurity education.'}
              </span>
            </h1>

            <ul style={{ listStyle: 'none', padding: '0', marginTop: '20px' }}>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <svg
                    width={'16'}
                    height={'16'}
                    fill={'rgb(249, 115, 22)'}
                    xmlns={'http://www.w3.org/2000/svg'}
                  >
                    <path d={'M6 10.293L3.707 8 3 8.707l3 3 7-7L12.293 4 6 10.293z'}></path>
                  </svg>
                </div>

                <p style={{ marginLeft: '10px', color: '#333333', fontSize: '18px' }}>
                  {
                    '\n                      Built-in vulnerability assessment tools for real-world practice.\n                    '
                  }
                </p>
              </li>

              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <svg
                    width={'16'}
                    height={'16'}
                    fill={'rgb(249, 115, 22)'}
                    xmlns={'http://www.w3.org/2000/svg'}
                  >
                    <path d={'M6 10.293L3.707 8 3 8.707l3 3 7-7L12.293 4 6 10.293z'}></path>
                  </svg>
                </div>

                <p style={{ marginLeft: '10px', color: '#333333', fontSize: '18px' }}>
                  {
                    '\n                      Hands-on learning with real-world cybersecurity scenarios.\n                    '
                  }
                </p>
              </li>

              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <svg
                    width={'16'}
                    height={'16'}
                    fill={'rgb(249, 115, 22)'}
                    xmlns={'http://www.w3.org/2000/svg'}
                  >
                    <path d={'M6 10.293L3.707 8 3 8.707l3 3 7-7L12.293 4 6 10.293z'}></path>
                  </svg>
                </div>

                <p style={{ marginLeft: '10px', color: '#333333', fontSize: '18px' }}>
                  {
                    '\n                      Automated feedback and performance tracking.\n                    '
                  }
                </p>
              </li>

              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <svg
                    width={'16'}
                    height={'16'}
                    fill={'rgb(249, 115, 22)'}
                    xmlns={'http://www.w3.org/2000/svg'}
                  >
                    <path d={'M6 10.293L3.707 8 3 8.707l3 3 7-7L12.293 4 6 10.293z'}></path>
                  </svg>
                </div>

                <p style={{ marginLeft: '10px', color: '#333333', fontSize: '18px' }}>
                  {
                    '\n                      Accessible via web and mobile devices for flexible learning.\n                    '
                  }
                </p>
              </li>

              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <svg
                    width={'16'}
                    height={'16'}
                    fill={'rgb(249, 115, 22)'}
                    xmlns={'http://www.w3.org/2000/svg'}
                  >
                    <path d={'M6 10.293L3.707 8 3 8.707l3 3 7-7L12.293 4 6 10.293z'}></path>
                  </svg>
                </div>

                <p style={{ marginLeft: '10px', color: '#333333', fontSize: '18px' }}>
                  {
                    '\n                      Cheating prevention measures to ensure integrity.\n                    '
                  }
                </p>
              </li>
            </ul>
          </div>

          <div
            className={
              'bg-[#0d1b2a] text-white text-center py-16 px-6 relative overflow-hidden font-sans'
            }
          >
            <h1 className={'text-4xl font-bold'}>
              {'\n                  Anyone can learn cybersecurity with \n                  '}
              <span className={'text-orange-500'}>{'Breach Boulevard'}</span>
            </h1>

            <p className={'text-lg mt-4'}>
              {
                '\n                  Hands-on cybersecurity training through real-world scenarios\n                '
              }
            </p>

            <div className={'mt-8 flex justify-center items-center'}>
              <input
                type={'email'}
                placeholder={'Email'}
                className={'px-4 py-2 rounded-md text-black w-80'}
              />

              <button
                className={
                  'ml-4 px-6 py-2 bg-orange-500 text-white font-bold rounded-md hover:bg-orange-600 transition'
                }
              >
                {'\n                    Get Started\n                  '}
              </button>
            </div>

            <div className={'mt-8 flex justify-center space-x-8 text-gray-400'}>
              <div className={'flex items-center'}>
                <svg
                  className={'w-5 h-5 text-green-500 mr-2'}
                  fill={'currentColor'}
                  xmlns={'http://www.w3.org/2000/svg'}
                  viewBox={'0 0 16 16'}
                >
                  <path d={'M6 10.293L3.707 8 3 8.707l3 3 7-7L12.293 4 6 10.293z'}></path>
                </svg>

                <span>{'Beginner Friendly'}</span>
              </div>

              <div className={'flex items-center'}>
                <svg
                  className={'w-5 h-5 text-green-500 mr-2'}
                  fill={'currentColor'}
                  xmlns={'http://www.w3.org/2000/svg'}
                  viewBox={'0 0 16 16'}
                >
                  <path d={'M6 10.293L3.707 8 3 8.707l3 3 7-7L12.293 4 6 10.293z'}></path>
                </svg>

                <span>{'Real-World Scenarios'}</span>
              </div>

              <div className={'flex items-center'}>
                <svg
                  className={'w-5 h-5 text-green-500 mr-2'}
                  fill={'currentColor'}
                  xmlns={'http://www.w3.org/2000/svg'}
                  viewBox={'0 0 16 16'}
                >
                  <path d={'M6 10.293L3.707 8 3 8.707l3 3 7-7L12.293 4 6 10.293z'}></path>
                </svg>

                <span>{'Interactive Challenges'}</span>
              </div>
            </div>

            <div
              className={
                'absolute top-1/2 right-10 transform -translate-y-1/2 text-white  italic text-sm'
              }
            >
              <img src={assetUrl('bee.png')} width={'150px'} height={'175px'} />
            </div>
          </div>

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

        <footer className={'relative w-full'}>
          <svg
            xmlns={'http://www.w3.org/2000/svg'}
            viewBox={'0 0 1440 320'}
            className={'w-full h-auto'}
          >
            <path
              fill={'#f97316'}
              d={
                'M0,160C30,200,60,240,120,245C180,250,240,210,300,185C360,160,420,150,480,160C540,170,600,200,660,213C720,227,780,213,840,197C900,181,960,165,1020,180C1080,195,1140,240,1200,245C1260,250,1320,210,1380,190C1410,180,1440,160,1440,160L1440,320L1380,320C1320,320,1260,320,1200,320C1140,320,1080,320,1020,320C960,320,900,320,840,320C780,320,720,320,660,320C600,320,540,320,480,320C420,320,360,320,300,320C240,320,180,320,120,320C60,320,30,320,0,320Z'
              }
            ></path>
          </svg>
        </footer>
      </div>
    </>
  );
}
