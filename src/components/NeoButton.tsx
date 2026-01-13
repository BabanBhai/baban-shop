import React from 'react';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'black';
  icon?: React.ReactNode;
}

export const NeoButton: React.FC<NeoButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "font-bold border-2 border-black flex items-center justify-center gap-2 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";
  
  const variants = {
    primary: "bg-white text-black shadow-neo hover:bg-gray-50",
    secondary: "bg-yellow-300 text-black shadow-neo hover:bg-yellow-400",
    black: "bg-black text-white shadow-neo border-black hover:bg-gray-900",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};