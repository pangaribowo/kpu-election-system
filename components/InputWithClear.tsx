import React from 'react';
import { FiX } from 'react-icons/fi';

interface InputWithClearProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
}

const InputWithClear: React.FC<InputWithClearProps> = ({
  value,
  onChange,
  onClear,
  className = '',
  containerClassName = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className={`relative ${containerClassName}`}>
      <input
        value={value}
        onChange={onChange}
        className={`pr-10 ${className}`}
        disabled={disabled}
        {...props}
      />
      {value && !disabled && (
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
  );
};

export default InputWithClear; 