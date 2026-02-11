import React from 'react';
import styles from './CtaButton.module.css';

interface CtaButtonProps {
  variant?: 'primary' | 'ghost';
  href?: string;
  className?: string;
  'data-trackid'?: string;
  children: React.ReactNode;
}

export const CtaButton: React.FC<CtaButtonProps> = ({ 
  variant = 'primary', 
  href, 
  className = '',
  'data-trackid': trackId,
  children 
}) => {
  const buttonClass = `${styles.button} ${styles[variant]} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        className={buttonClass}
        target="_parent"
        data-trackid={trackId}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={buttonClass}
      data-trackid={trackId}
    >
      {children}
    </button>
  );
};
