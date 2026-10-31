import React, { useState } from 'react';
import { Link } from '../routing';
import { assetUrl } from '../routing';
import NetworkTerminal from '../components/NetworkTerminal';

export default function Page() {
  return (
    <>
      <div className={'container mx-auto py-10'}>
        <NetworkTerminal />
      </div>
    </>
  );
}
