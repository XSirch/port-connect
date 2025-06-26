import React from 'react'
import { motion } from 'framer-motion'

interface SkeletonLoaderProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  variant = 'rectangular',
  width = '100%',
  height = '1rem',
  lines = 1
}) => {
  const baseClasses = 'bg-secondary-200 animate-pulse'
  
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={`${baseClasses} ${variants[variant]} h-4`}
            style={{
              width: index === lines - 1 ? '75%' : '100%'
            }}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.1
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={{ width, height }}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{
        duration: 1.5,
        repeat: Infinity
      }}
    />
  )
}

// Componentes pré-configurados para casos comuns
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 bg-white rounded-xl border border-secondary-200 ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <SkeletonLoader variant="circular" width="3rem" height="3rem" />
      <div className="flex-1">
        <SkeletonLoader variant="text" width="60%" height="1.25rem" className="mb-2" />
        <SkeletonLoader variant="text" width="40%" height="1rem" />
      </div>
    </div>
    <SkeletonLoader variant="text" lines={3} />
  </div>
)

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonLoader
            key={colIndex}
            variant="text"
            width={colIndex === 0 ? '25%' : '20%'}
            height="2.5rem"
          />
        ))}
      </div>
    ))}
  </div>
)

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8">
    {/* Header skeleton */}
    <div className="bg-white rounded-xl p-6 border border-secondary-200">
      <SkeletonLoader variant="text" width="40%" height="2rem" className="mb-2" />
      <SkeletonLoader variant="text" width="60%" height="1.25rem" />
    </div>
    
    {/* Stats skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
    
    {/* Content skeleton */}
    <div className="bg-white rounded-xl p-6 border border-secondary-200">
      <SkeletonLoader variant="text" width="30%" height="1.5rem" className="mb-6" />
      <TableSkeleton rows={6} columns={5} />
    </div>
  </div>
)

export default SkeletonLoader