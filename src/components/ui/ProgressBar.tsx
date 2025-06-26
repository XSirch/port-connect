import React from 'react'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'success' | 'warning' | 'error'
  showLabel?: boolean
  label?: string
  animated?: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className = '',
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  animated = true
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }
  
  const variants = {
    primary: 'bg-primary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600'
  }
  
  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-secondary-700">
            {label || `Progress`}
          </span>
          <span className="text-sm text-secondary-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={`w-full bg-secondary-200 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          className={`${sizes[size]} ${variants[variant]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 0.8 : 0,
            ease: "easeOut"
          }}
        />
      </div>
    </div>
  )
}

export default ProgressBar