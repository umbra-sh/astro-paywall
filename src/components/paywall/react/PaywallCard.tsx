import React from 'react';
import styles from './PaywallCard.module.css';

interface PaywallCardProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const PaywallCard: React.FC<PaywallCardProps> = ({ 
  children, 
  footer,
  className = '' 
}) => {
  return (
    <article className={`${styles.card} ${className}`}>
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </article>
  );
};
