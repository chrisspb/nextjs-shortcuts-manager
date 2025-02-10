import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>((
  { className, label, error, type, ...props },
  ref
) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full rounded-lg border border-gray-300 px-4 py-2
          text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
          ${error ? 'border-red-500' : ''}
          ${className || ''}
        `}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;