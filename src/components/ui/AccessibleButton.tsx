import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  fullWidth?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  fullWidth = false,
  ariaLabel,
  ariaDescribedBy,
  ...props
}, ref) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg 
    transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed
    relative overflow-hidden
  `
  
  const variants = {
    primary: `
      bg-primary-600 text-white 
      hover:bg-primary-700 
      focus:ring-primary-500 
      shadow-sm hover:shadow-md
      border-2 border-transparent
    `,
    secondary: `
      bg-secondary-100 text-secondary-900 
      hover:bg-secondary-200 
      focus:ring-secondary-500
      border-2 border-transparent
    `,
    outline: `
      border-2 border-secondary-300 text-secondary-700 
      hover:bg-secondary-50 hover:border-secondary-400
      focus:ring-secondary-500
    `,
    ghost: `
      text-secondary-600 
      hover:text-secondary-900 hover:bg-secondary-100 
      focus:ring-secondary-500
      border-2 border-transparent
    `,
    danger: `
      bg-error-600 text-white 
      hover:bg-error-700 
      focus:ring-error-500 
      shadow-sm hover:shadow-md
      border-2 border-transparent
    `
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-[2rem]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[2.5rem]',
    lg: 'px-6 py-3 text-base gap-2 min-h-[3rem]'
  }
  
  const classes = `
    ${baseClasses} 
    ${variants[variant]} 
    ${sizes[size]} 
    ${fullWidth ? 'w-full' : ''} 
    ${className}
  `.replace(/\s+/g, ' ').trim()
  
  return (
    <motion.button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 bg-white opacity-0 pointer-events-none"
        initial={false}
        whileTap={{ opacity: [0, 0.2, 0] }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <div className="relative flex items-center justify-center gap-2">
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
        
        {!loading && icon && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        )}
        
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          {children}
        </motion.span>
      </div>
    </motion.button>
  )
})

AccessibleButton.displayName = 'AccessibleButton'

export default AccessibleButton