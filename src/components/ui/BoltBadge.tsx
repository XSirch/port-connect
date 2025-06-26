import React from 'react'
import logoTextPoweredBy from '../../assets/logotext_poweredby_360w.png'
import blackCircle from '../../assets/black_circle_360x360.png'

interface BoltBadgeProps {
  variant?: 'default' | 'compact' | 'icon-only'
  position?: 'fixed' | 'inline'
  className?: string
}

const BoltBadge: React.FC<BoltBadgeProps> = ({
  variant = 'default',
  position = 'fixed',
  className = ''
}) => {
  const baseClasses = 'transition-all duration-200 hover:scale-105'
  const positionClasses = position === 'fixed' ? 'fixed bottom-4 right-4 z-50' : ''

  const renderBadge = () => {
    switch (variant) {
      case 'compact':
        return (
          <a
            href="https://bolt.new/"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center px-3 py-2 bg-white rounded-lg shadow-medium hover:shadow-strong border border-secondary-200 ${baseClasses} ${className}`}
          >
            <img
              src={blackCircle}
              alt="Bolt.new"
              className="h-6 w-6 mr-2"
            />
            <span className="text-sm font-medium text-secondary-900">Bolt.new</span>
          </a>
        )
      
      case 'icon-only':
        return (
          <a
            href="https://bolt.new/"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center p-2 bg-white rounded-full shadow-medium hover:shadow-strong border border-secondary-200 ${baseClasses} ${className}`}
            title="Built with Bolt.new"
          >
            <img
              src={blackCircle}
              alt="Bolt.new"
              className="h-8 w-8"
            />
          </a>
        )
      
      default:
        return (
          <a
            href="https://bolt.new/"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center bg-white rounded-xl shadow-medium hover:shadow-strong border border-secondary-200 ${baseClasses} ${className}`}
          >
            <img
              src={logoTextPoweredBy}
              alt="Powered by Bolt.new"
              className="h-10 w-auto"
            />
          </a>
        )
    }
  }

  return (
    <div className={positionClasses}>
      {renderBadge()}
    </div>
  )
}

export default BoltBadge
