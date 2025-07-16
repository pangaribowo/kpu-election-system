import React from 'react';
import { FiX } from 'react-icons/fi';

interface InputWithClearProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  prefix?: React.ReactNode;
  error?: string;
  helper?: string;
  label?: string;
  noMargin?: boolean;
}

const baseInputClass =
  'py-3 px-4 pr-10 border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 text-base transition-all duration-200';

const InputWithClear: React.FC<InputWithClearProps> = ({
  value,
  onChange,
  onClear,
  className = '',
  containerClassName = '',
  disabled = false,
  leftIcon,
  prefix,
  error,
  helper,
  label,
  noMargin = false,
  ...props
}) => {
  return (
    <div className={`${noMargin ? '' : 'mb-4'} ${containerClassName}`}>
      {label && (
        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">{label}</label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm h-full">
            {prefix}
          </span>
        )}
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300">{leftIcon}</span>
        )}
        <input
          value={value}
          onChange={onChange}
          className={`${baseInputClass} ${leftIcon ? 'pl-10' : ''} ${prefix ? 'rounded-l-none' : ''} ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
          disabled={disabled}
          {...props}
        />
        {value && !disabled && onClear && (
          <button
            type="button"
            aria-label="Bersihkan input"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900 dark:hover:text-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={onClear}
            tabIndex={0}
          >
            <FiX size={18} />
          </button>
        )}
      </div>
      {helper && !error && (
        <small className="input-helper text-gray-500 dark:text-gray-400">{helper}</small>
      )}
      {error && (
        <small className="input-helper text-red-500 dark:text-red-400 font-semibold mt-2 block" role="alert">{error}</small>
      )}
    </div>
  );
};

export default InputWithClear; 