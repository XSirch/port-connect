import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'soft' | 'medium' | 'strong'
  hover?: boolean
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'soft',
  hover = false
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
  
  const hoverEffect = hover ? 'hover:shadow-medium hover:-translate-y-1' : ''
  
  const classes = `${baseClasses} ${paddings[padding]} ${shadows[shadow]} ${hoverEffect} ${className}`
  
  return (
    <div className={classes}>
      {children}
    </div>
  )
}

export default Card
