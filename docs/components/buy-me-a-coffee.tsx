import React from 'react';
import Link from 'next/link';

interface BuyMeACoffeeProps {
  variant?: 'default' | 'large' | 'inline';
  className?: string;
}

export const BuyMeACoffee: React.FC<BuyMeACoffeeProps> = ({ 
  variant = 'default', 
  className = ''
}) => {
  const baseClasses = "inline-flex items-center gap-2 font-medium rounded-lg transition-colors duration-200";
  
  const variantClasses = {
    default: "px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black",
    large: "px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black text-lg",
    inline: "px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black text-sm"
  };

  return (
    <Link 
      href="https://www.buymeacoffee.com/kinseylkj" 
      target="_blank"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      <span>☕</span>
      <span>Buy me a coffee</span>
    </Link>
  );
};

export default BuyMeACoffee; 