import React from 'react'
import Button from './Button'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  className?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-secondary-100 rounded-full text-secondary-400">
          {icon}
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-secondary-900 mb-2">
        {title}
      </h3>
      
      <p className="text-secondary-600 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      
      {action && (
        <Button
          onClick={action.onClick}
          icon={action.icon}
          className="animate-fade-in"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
