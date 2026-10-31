import React, { useState } from 'react';
import { Link } from '../routing';
import { assetUrl } from '../routing';
import FaqItem from '../components/FaqItem';

export default function Page() {
  return (
    <>
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
              '\n                    Our return policy lasts 30 days. If 30 days have gone by since your purchase, unfortunately, we can’t offer you a refund or exchange.\n                '
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
              '\n                    You can track your order using the tracking number provided in your order confirmation email.\n                '
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
              '\n                    Yes, we ship internationally. Shipping costs will apply, and will be added at checkout.\n                '
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
              '\n                    If you need to change your order, please contact us immediately. We process orders quickly, but we will do our best to accommodate your request.\n                '
            }
          </FaqItem>
        </div>
      </div>
    </>
  );
}
