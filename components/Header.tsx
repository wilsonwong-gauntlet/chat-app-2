import React from 'react';
import { SignedIn, UserButton } from '@clerk/nextjs';

const Header = () => {
  return (
    <header className="bg-purple-600 text-white h-14 flex items-center justify-between px-6 shadow-md">
      <h1 className="text-xl font-semibold">Chat App</h1>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </header>
  );
};

export default Header; 