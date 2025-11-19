import React, { useState } from 'react';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import { User, Crown, LogIn, UserCheck } from 'lucide-react';

interface AuthControlsProps {
  onSaveToAccount?: () => void;
  showSaveButton?: boolean;
  className?: string;
}

export const AuthControls: React.FC<AuthControlsProps> = ({
  onSaveToAccount,
  showSaveButton = false,
  className = ""
}) => {
  const { user } = useUser();
  const [isGuest, setIsGuest] = useState(false);

  const handleContinueAsGuest = () => {
    setIsGuest(true);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <SignedOut>
        <div className="flex items-center gap-2">
          {!isGuest ? (
            <>
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
                  <LogIn size={16} />
                  Sign In
                </button>
              </SignInButton>
              <button
                onClick={handleContinueAsGuest}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <User size={16} />
                Continue as Guest
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                <User size={14} />
                Guest Mode
              </div>
              {showSaveButton && onSaveToAccount && (
                <SignInButton mode="modal">
                  <button className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                    <Crown size={14} />
                    Save to Account
                  </button>
                </SignInButton>
              )}
            </div>
          )}
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              <UserCheck size={14} />
              {user.firstName || user.emailAddresses[0]?.emailAddress}
            </div>
          )}
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>
    </div>
  );
};