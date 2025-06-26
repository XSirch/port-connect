import React, { memo } from 'react'
import { motion } from 'framer-motion'

interface OptimizedCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'soft' | 'medium' | 'strong'
  hover?: boolean
  clickable?: boolean
  onClick?: () => void
  ariaLabel?: string
  role?: string
}

const OptimizedCard: React.FC<OptimizedCardProps> = memo(({
  children,
  className = '',
  padding = 'md',
  shadow = 'soft',
  hover = false,
  clickable = false,
  onClick,
  ariaLabel,
  role
}) => {
  const baseClasses = 'bg-white rounded-xl border border-secondary-200 transition-all duration-200'
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  
  const shadows = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    strong: 'shadow-strong'
  }
  
  const interactiveClasses = clickable || onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2' : ''
  const hoverEffect = hover || clickable ? 'hover:shadow-medium hover:-translate-y-1' : ''
  
  const classes = `${baseClasses} ${paddings[padding]} ${shadows[shadow]} ${hoverEffect} ${interactiveClasses} ${className}`
  
  const cardProps = {
    className: classes,
    onClick: clickable ? onClick : undefined,
    'aria-label': ariaLabel,
    role: role || (clickable ? 'button' : undefined),
    tabIndex: clickable ? 0 : undefined,
    onKeyDown: clickable ? (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && onClick) {
        e.preventDefault()
        onClick()
      }
    } : undefined
  }
  
  if (hover || clickable) {
    return (
      <motion.div
        {...cardProps}
        whileHover={{ y: -2 }}
        whileTap={clickable ? { scale: 0.98 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {children}
      </motion.div>
    )
  }
  
  return (
    <div {...cardProps}>
      {children}
    </div>
  )
})

OptimizedCard.displayName = 'OptimizedCard'

export default OptimizedCard