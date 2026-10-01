import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, style }) => {
  return (
    <div 
      className={`card ${className}`} 
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        padding: '1.5rem',
        ...style
      }}
    >
      {children}
    </div>
  );
};
