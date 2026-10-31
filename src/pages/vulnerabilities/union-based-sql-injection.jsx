import React, { useState } from 'react';
import { Link } from '../../routing';
import { assetUrl } from '../../routing';
import ExamResults from '../../components/ExamResults';

export default function Page() {
  const [examQuery, setExamQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState(null);
  return (
    <>
      <header className={'bg-orange-600 py-4 px-6 shadow-lg flex justify-between items-center'}>
        <h1 className={'text-3xl font-bold'}>
          <i className={'fas fa-graduation-cap mr-2'}></i>
          {' Student Portal'}
        </h1>

        <nav>
          <ul className={'flex space-x-6'}>
            <li>
              <a href={'#'} className={'hover:underline'}>
                {'Home'}
              </a>
            </li>

            <li>
              <a href={'#'} className={'hover:underline'}>
                {'Profile'}
              </a>
            </li>

            <li>
              <a href={'#'} className={'hover:underline'}>
                {'Courses'}
              </a>
            </li>

            <li>
              <a href={'#'} className={'hover:underline'}>
                {'Logout'}
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <div className={'flex flex-1'}>
        <aside className={'bg-orange-500 w-64 py-6 px-4 shadow-lg'}>
          <h2 className={'text-lg font-semibold mb-6'}>{'Quick Links'}</h2>

          <nav>
            <ul className={'space-y-4'}>
              <li>
                <a
                  href={'#'}
                  className={
                    'flex items-center text-white px-3 py-2 rounded-lg hover:bg-orange-600'
                  }
                >
                  <i className={'fas fa-tachometer-alt mr-3'}></i>
                  {' Dashboard\n            '}
                </a>
              </li>

              <li>
                <a
                  href={'#'}
                  className={
                    'flex items-center text-white px-3 py-2 rounded-lg hover:bg-orange-600'
                  }
                >
                  <i className={'fas fa-file-alt mr-3'}></i>
                  {' View Past Exam Results\n            '}
                </a>
              </li>

              <li>
                <a
                  href={'#'}
                  className={
                    'flex items-center text-white px-3 py-2 rounded-lg hover:bg-orange-600'
                  }
                >
                  <i className={'fas fa-book-open mr-3'}></i>
                  {' View Enrolled Courses\n            '}
                </a>
              </li>

              <li>
                <a
                  href={'#'}
                  className={
                    'flex items-center text-white px-3 py-2 rounded-lg hover:bg-orange-600'
                  }
                >
                  <i className={'fas fa-edit mr-3'}></i>
                  {' Enroll for Next Semester\n            '}
                </a>
              </li>

              <li>
                <a
                  href={'#'}
                  className={
                    'flex items-center text-white px-3 py-2 rounded-lg hover:bg-orange-600'
                  }
                >
                  <i className={'fas fa-cogs mr-3'}></i>
                  {' Settings\n            '}
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        <main className={'flex-1 bg-gray-100 p-6'}>
          <div className={'bg-white rounded-lg shadow-md p-6 mb-8'}>
            <h2 className={'text-2xl font-bold text-orange-600 mb-2'}>{'Welcome, Jane Doe 👋'}</h2>

            <p className={'text-gray-700'}>
              {'View your academic records and manage your semester activities.'}
            </p>
          </div>

          <div className={'grid grid-cols-1 lg:grid-cols-3 gap-6'}>
            <section className={'bg-white rounded-lg shadow-md p-6'}>
              <h3 className={'text-xl font-semibold text-orange-600 mb-4'}>{'📚 Your Grades'}</h3>

              <ul className={'text-gray-700 space-y-2'}>
                <li>{'🔢 Advanced Mathematics: A'}</li>

                <li>{'💻 Introduction to Programming: B'}</li>

                <li>{'🧬 Biology 101: A'}</li>
              </ul>
            </section>

            <section className={'bg-white rounded-lg shadow-md p-6'}>
              <h3 className={'text-xl font-semibold text-orange-600 mb-4'}>
                {'📖 Enrolled Courses'}
              </h3>

              <ul className={'text-gray-700 space-y-2'}>
                <li>{'🔢 Advanced Mathematics'}</li>

                <li>{'💻 Introduction to Programming'}</li>

                <li>{'🧬 Biology 101'}</li>
              </ul>
            </section>

            <section className={'bg-white rounded-lg shadow-md p-6'}>
              <h3 className={'text-xl font-semibold text-orange-600 mb-4'}>
                {'✏️ Enroll for Next Semester'}
              </h3>

              <form id={'enrollForm'} className={'space-y-4'}>
                <label htmlFor={'course'} className={'block text-sm font-medium text-gray-700'}>
                  {'Select Course:'}
                </label>

                <select
                  id={'course'}
                  className={
                    'w-full p-3 border rounded-lg bg-[#0d1b2a] text-white focus:outline-none focus:ring-2 focus:ring-orange-500'
                  }
                >
                  <option value={'Computer Science'}>{'Computer Science'}</option>

                  <option value={'Engineering'}>{'Engineering'}</option>

                  <option value={'Mathematics'}>{'Mathematics'}</option>

                  <option value={'Biology'}>{'Biology'}</option>
                </select>

                <button
                  type={'submit'}
                  className={
                    'w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition'
                  }
                >
                  {'\n              Enroll\n            '}
                </button>
              </form>
            </section>
          </div>

          <div className={'mt-8'}>
            <div className={'bg-white rounded-lg shadow-md p-6'}>
              <h3 className={'text-xl font-semibold text-orange-600 mb-4'}>
                {'🔍 View Past Exam Results'}
              </h3>

              <form
                id={'examResultsForm'}
                className={'space-y-4'}
                onSubmit={(event) => {
                  event.preventDefault();
                  setSubmittedQuery(examQuery);
                }}
              >
                <input
                  type={'text'}
                  id={'examQuery'}
                  name={'examQuery'}
                  className={
                    'w-full p-3 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500'
                  }
                  placeholder={'Search by course name or semester (e.g., Biology, Spring 2023)'}
                  required
                  value={examQuery}
                  onChange={(event) => setExamQuery(event.target.value)}
                />

                <button
                  type={'submit'}
                  className={
                    'w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition'
                  }
                >
                  {'\n              Search\n            '}
                </button>
              </form>

              <div id={'examResults'} className={'mt-6 text-gray-700'}>
                <ExamResults query={submittedQuery} />
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className={'bg-gray-800 text-center py-4'}>
        <p>{'© 2025 Student Portal. All rights reserved.'}</p>
      </footer>
    </>
  );
}
