import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  shape?: 'pill' | 'rounded';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  shape = 'pill',
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-white text-black hover:bg-gray-200';
      case 'secondary':
        return 'bg-[#1A1A1A] text-white border border-white/10 hover:bg-[#2A2A2A]';
      case 'ghost':
        return 'bg-transparent text-white border border-white/20 hover:bg-white/10';
      case 'danger':
        return 'bg-[#FF6B6B]/10 text-[#FF6B6B] border border-[#FF6B6B]/20 hover:bg-[#FF6B6B]/20';
      default:
        return 'bg-white text-black';
    }
  };

  const getShapeStyles = () => {
    return shape === 'pill' ? 'btn-pill' : 'btn-rounded';
  };

  // Convert these util class concepts to plain inline styles or rely on index.css for specifics
  // We will map our conceptual variant classes to plain CSS if needed, but we can just output them here
  // We'll add some specific inline styles that might be easier than polluting index.css.
  const inlineStyles: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    width: fullWidth ? '100%' : 'auto',
    backgroundColor: variant === 'primary' ? '#F5F5F5' : 
                     variant === 'secondary' ? '#1A1A1A' : 
                     variant === 'ghost' ? 'transparent' : 
                     variant === 'danger' ? 'rgba(255, 107, 107, 0.1)' : '#F5F5F5',
    color: variant === 'primary' ? '#0D0D0D' : 
           variant === 'danger' ? '#FF6B6B' : '#F5F5F5',
    border: variant === 'ghost' ? '1px solid rgba(255, 255, 255, 0.2)' : 
            variant === 'secondary' ? '1px solid rgba(255, 255, 255, 0.1)' : 
            variant === 'danger' ? '1px solid rgba(255, 107, 107, 0.2)' : 'none',
  };

  return (
    <button 
      className={`btn ${getShapeStyles()} hover-lift ${className}`}
      style={inlineStyles}
      {...props}
    >
      {children}
    </button>
  );
};
