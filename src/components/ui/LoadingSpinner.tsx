import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={`${sizes[size]} animate-spin text-primary-600`} />
        {text && (
          <p className="text-sm text-secondary-600 animate-pulse-soft">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner
