import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = 'rounded-lg font-semibold transition-all duration-300 ease-in-out active:scale-95 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-wine text-light hover:bg-wine-light shadow-[0_4px_20px_rgba(139,0,0,0.3)] disabled:bg-wine/50',
    secondary: 'bg-gold text-dark hover:bg-gold-light shadow-[0_4px_20px_rgba(212,175,55,0.3)] disabled:bg-gold/50',
    outline: 'border-2 border-gold text-gold hover:bg-gold hover:text-dark hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)] disabled:border-gold/50 disabled:text-gold/50',
    ghost: 'text-gold hover:bg-gold/10 disabled:text-gold/50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className} ${
        disabled || isLoading ? 'cursor-not-allowed opacity-60' : ''
      }`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
