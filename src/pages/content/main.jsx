import React, { useState } from 'react';
import { Link } from '../../routing';
import { assetUrl } from '../../routing';
import VulnerabilityModal from '../../components/VulnerabilityModal';
import { routePaths } from '../../routing';

export default function Page() {
  const [disclaimerVisible, setDisclaimerVisible] = useState(true);
  const [course, setCourse] = useState(null);
  return (
    <>
      <nav className={'bg-orange-500 p-4 shadow-md rounded-lg mb-6'}>
        <div className={'container mx-auto flex items-center justify-between'}>
          <a href={'#'} className={'flex items-center space-x-2'}>
            <img
              src={assetUrl('images/BBLOGO.png')}
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

      <header className={'text-center py-12'}>
        <h1 className={'text-4xl font-bold'}>
          {'Explore, Examine, Exploit, just like the real thing 🤫'}
        </h1>

        <p className={'mt-4 text-gray-400'}>
          {'Learn and practice cybersecurity by exploiting real-world vulnerabilities.'}
        </p>
      </header>

      <main className={'container mx-auto px-20 py-8'}>
        <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
          <div className={'bg-[#1b2b3c] p-6 rounded-lg shadow-md'}>
            <h2 className={'text-2xl font-bold text-orange-500'}>{'SQL Injection'}</h2>

            <p className={'mt-2 text-gray-300'}>
              {'Understand how attackers exploit improperly secured SQL queries.'}
            </p>

            <button
              className={'mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded'}
              onClick={() => setCourse('SQL Injection')}
            >
              {'\n                    View Vulnerabilities\n                '}
            </button>
          </div>

          <div className={'bg-[#1b2b3c] p-6 rounded-lg shadow-md'}>
            <h2 className={'text-2xl font-bold text-orange-500'}>{'Cross-Site Scripting (XSS)'}</h2>

            <p className={'mt-2 text-gray-300'}>
              {'Learn how malicious scripts can be injected into web applications.'}
            </p>

            <button
              className={'mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded'}
              onClick={() => setCourse('Cross-Site Scripting')}
            >
              {'\n                    View Vulnerabilities\n                '}
            </button>
          </div>

          <div className={'bg-[#1b2b3c] p-6 rounded-lg shadow-md'}>
            <h2 className={'text-2xl font-bold text-orange-500'}>{'Broken Authentication'}</h2>

            <p className={'mt-2 text-gray-300'}>
              {'Explore vulnerabilities in authentication mechanisms.'}
            </p>

            <button
              className={'mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded'}
              onClick={() => setCourse('Broken Authentication')}
            >
              {'\n                    View Vulnerabilities\n                '}
            </button>
          </div>

          <div className={'bg-[#1b2b3c] p-6 rounded-lg shadow-md'}>
            <h2 className={'text-2xl font-bold text-orange-500'}>
              {'Insecure Direct Object References'}
            </h2>

            <p className={'mt-2 text-gray-300'}>
              {'Understand how unauthorized access to objects can occur.'}
            </p>

            <button
              className={'mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded'}
              onClick={() => setCourse('Insecure Direct Object References')}
            >
              {'\n                    View Vulnerabilities\n                '}
            </button>
          </div>

          <div className={'bg-[#1b2b3c] p-6 rounded-lg shadow-md'}>
            <h2 className={'text-2xl font-bold text-orange-500'}>{'Sensitive Data Exposure'}</h2>

            <p className={'mt-2 text-gray-300'}>
              {'Learn how sensitive data can be exposed during transit.'}
            </p>

            <button
              className={'mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded'}
              onClick={() => setCourse('Sensitive Data Exposure')}
            >
              {'\n                    View Vulnerabilities\n                '}
            </button>
          </div>
        </div>
      </main>

      {disclaimerVisible && (
        <div
          id={'disclaimer'}
          className={
            'fixed bottom-0 left-0 right-0 bg-[#0d1b2a] text-white p-4 shadow-lg z-50 flex justify-between items-center'
          }
        >
          <div className={'text-sm'}>
            <p>
              <strong>{'Disclaimer:'}</strong>
              {
                ' The content on this website is for educational purposes only. By using this site, you acknowledge that the website may simulate vulnerabilities for cybersecurity learning. \n                '
              }
              <span className={'font-bold text-orange-500'}>
                {'Do not attempt to misuse the information for malicious purposes.'}
              </span>
            </p>
          </div>

          <button
            id={'acceptDisclaimer'}
            className={
              'ml-4 bg-orange-500 hover:bg-orange-600 text-white px-7 py-1 rounded font-semibold'
            }
            onClick={() => setDisclaimerVisible(false)}
          >
            {'\n            I Understand\n        '}
          </button>
        </div>
      )}

      <VulnerabilityModal course={course} onClose={() => setCourse(null)} />
    </>
  );
}
