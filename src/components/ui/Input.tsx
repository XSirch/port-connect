import React, { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
  icon?: React.ReactNode
  required?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helpText,
  icon,
  required,
  className = '',
  ...props
}, ref) => {
  const inputClasses = `
    block w-full px-3 py-2 border rounded-lg text-sm
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
    disabled:bg-secondary-50 disabled:text-secondary-500 disabled:cursor-not-allowed
    ${error 
      ? 'border-error-300 text-error-900 placeholder-error-300 focus:ring-error-500 focus:border-error-500' 
      : 'border-secondary-300 text-secondary-900 placeholder-secondary-400'
    }
    ${icon ? 'pl-10' : ''}
    ${className}
  `

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-secondary-400">
              {icon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : helpText ? `${props.id}-help` : undefined}
          {...props}
        />
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-4 w-4 text-error-500" />
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${props.id}-error`} className="text-sm text-error-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={`${props.id}-help`} className="text-sm text-secondary-500">
          {helpText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
