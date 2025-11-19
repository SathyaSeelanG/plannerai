import React from 'react';
import { AuthControls } from './AuthControls';

interface HeaderProps {
  title?: string;
  showSaveButton?: boolean;
  onSaveToAccount?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Roadmap Planner",
  showSaveButton = false,
  onSaveToAccount
}) => {
  return (
    <header className="flex items-center justify-between py-4 mb-6 border-b border-gray-200">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <AuthControls
        showSaveButton={showSaveButton}
        onSaveToAccount={onSaveToAccount}
      />
    </header>
  );
};

export default Header;
