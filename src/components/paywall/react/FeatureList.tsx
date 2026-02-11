import React from 'react';
import styles from './FeatureList.module.css';

interface FeatureListProps {
  items: string[];
  className?: string;
}

export const FeatureList: React.FC<FeatureListProps> = ({ 
  items, 
  className = '' 
}) => {
  return (
    <ul className={`${styles.list} ${className}`}>
      {items.map((item, index) => (
        <li key={index} className={styles.item}>
          <span className={styles.icon}></span>
          <span className={styles.text}>{item}</span>
        </li>
      ))}
    </ul>
  );
};
