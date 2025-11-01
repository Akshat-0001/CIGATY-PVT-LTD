import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onAnimationStart'> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-light font-medium mb-2">
            {label}
            {props.required && <span className="text-wine ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`input-field ${icon ? 'pl-12' : ''} ${
              error ? 'border-wine focus:border-wine focus:ring-wine/20' : ''
            } ${className}`}
            {...props}
          />
        </div>
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-wine text-sm mt-1"
          >
            {error}
          </motion.p>
        )}
        
        {helperText && !error && (
          <p className="text-gray-400 text-sm mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
