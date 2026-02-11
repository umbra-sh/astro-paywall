import React from 'react';
import styles from './CloseButton.module.css';

interface CloseButtonProps {
  className?: string;
}

export const CloseButton: React.FC<CloseButtonProps> = ({ className = '' }) => {
  const handleClick = () => {
    window.parent.postMessage('closePaywall', '*');
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${className}`}
      onClick={handleClick}
      aria-label="Close dialog"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
};
