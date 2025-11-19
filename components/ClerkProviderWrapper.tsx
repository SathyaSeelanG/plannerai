import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Publishable Key');
}

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
}

export const ClerkProviderWrapper: React.FC<ClerkProviderWrapperProps> = ({ children }) => {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      {children}
    </ClerkProvider>
  );
};