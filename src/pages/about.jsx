import React, { useState } from 'react';
import { Link } from '../routing';
import { assetUrl } from '../routing';
import { routePaths } from '../routing';

export default function Page() {
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
              <Link className={'hover:underline'} to={routePaths['testcopy2.html']}>
                {'Home'}
              </Link>
            </li>

            <li>
              <Link className={'hover:underline'} to={routePaths['about.html']}>
                {'About'}
              </Link>
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

      <header className={'bg-[#1b2b3c] text-center py-16'}>
        <h1 className={'text-4xl font-bold'}>{'About Breach Boulevard'}</h1>

        <p className={'mt-4 text-lg text-gray-400'}>
          {
            '\n            Empowering individuals to learn and defend through cybersecurity education.\n        '
          }
        </p>
      </header>

      <section className={'py-16'}>
        <div className={'container mx-auto px-4 text-center'}>
          <h2 className={'text-3xl font-bold'}>{'Our Mission'}</h2>

          <p className={'mt-4 text-gray-300'}>
            {
              '\n                At Breach Boulevard, we believe that the best defense is understanding the mindset of attackers.\n                Our mission is to provide hands-on, real-world cybersecurity training for individuals of all skill levels.\n            '
            }
          </p>
        </div>
      </section>

      <section className={'bg-[#1b2b3c] py-16'}>
        <div className={'container mx-auto px-4'}>
          <h2 className={'text-3xl font-bold text-center'}>{'Our Values'}</h2>

          <div className={'mt-8 flex flex-wrap justify-center gap-6'}>
            <div className={'bg-[#0d1b2a] p-6 rounded-lg shadow-md max-w-sm'}>
              <h3 className={'text-xl font-bold text-orange-500'}>{'Integrity'}</h3>

              <p className={'mt-2 text-gray-300'}>
                {
                  '\n                        Honesty and responsibility guide everything we do. We aim to educate ethically and responsibly.\n                    '
                }
              </p>
            </div>

            <div className={'bg-[#0d1b2a] p-6 rounded-lg shadow-md max-w-sm'}>
              <h3 className={'text-xl font-bold text-orange-500'}>{'Empowerment'}</h3>

              <p className={'mt-2 text-gray-300'}>
                {
                  '\n                        Equipping learners with the tools and confidence to protect themselves and their organizations.\n                    '
                }
              </p>
            </div>

            <div className={'bg-[#0d1b2a] p-6 rounded-lg shadow-md max-w-sm'}>
              <h3 className={'text-xl font-bold text-orange-500'}>{'Innovation'}</h3>

              <p className={'mt-2 text-gray-300'}>
                {
                  '\n                        Using the latest technologies and real-world simulations for impactful learning experiences.\n                    '
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={'py-16'}>
        <div className={'container mx-auto px-4 text-center'}>
          <h2 className={'text-3xl font-bold'}>{'Meet the Team'}</h2>

          <div className={'mt-8 flex flex-wrap justify-center gap-6'}>
            <div className={'bg-[#1b2b3c] p-6 rounded-lg shadow-md max-w-sm'}>
              <img
                src={assetUrl('team-member1.jpg')}
                alt={'Team Member 1'}
                className={'rounded-full h-24 w-24 mx-auto'}
              />

              <h3 className={'text-xl font-bold mt-4'}>{'Alex Johnson'}</h3>

              <p className={'text-gray-400'}>{'Founder & CEO'}</p>
            </div>

            <div className={'bg-[#1b2b3c] p-6 rounded-lg shadow-md max-w-sm'}>
              <img
                src={assetUrl('team-member2.jpg')}
                alt={'Team Member 2'}
                className={'rounded-full h-24 w-24 mx-auto'}
              />

              <h3 className={'text-xl font-bold mt-4'}>{'Jamie Lee'}</h3>

              <p className={'text-gray-400'}>{'Lead Developer'}</p>
            </div>

            <div className={'bg-[#1b2b3c] p-6 rounded-lg shadow-md max-w-sm'}>
              <img
                src={assetUrl('team-member3.jpg')}
                alt={'Team Member 3'}
                className={'rounded-full h-24 w-24 mx-auto'}
              />

              <h3 className={'text-xl font-bold mt-4'}>{'Taylor Smith'}</h3>

              <p className={'text-gray-400'}>{'Cybersecurity Expert'}</p>
            </div>
          </div>
        </div>
      </section>

      <footer className={'bg-[#0d1b2a] text-center py-6'}>
        <p className={'text-gray-400'}>{'© 2024 Breach Boulevard. All rights reserved.'}</p>
      </footer>
    </>
  );
}
