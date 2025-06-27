import React from 'react'
import { Clock, CheckCircle, XCircle, AlertCircle, Package } from 'lucide-react'

interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true 
}) => {
  const config = {
    pending: {
      label: 'Pending',
      icon: <Clock className="h-3 w-3" />,
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    confirmed: {
      label: 'Confirmed', 
      icon: <CheckCircle className="h-3 w-3" />,
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    rejected: {
      label: 'Rejected',
      icon: <XCircle className="h-3 w-3" />,
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    completed: {
      label: 'Completed',
      icon: <Package className="h-3 w-3" />,
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    cancelled: {
      label: 'Cancelled',
      icon: <AlertCircle className="h-3 w-3" />,
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  }

  const statusConfig = config[status]

  return (
    <span 
      className={`
        inline-flex items-center gap-1 font-medium rounded-full border
        ${statusConfig.className} ${sizeClasses[size]}
      `}
      role="status"
      aria-label={`Status: ${statusConfig.label}`}
    >
      {showIcon && statusConfig.icon}
      {statusConfig.label}
    </span>
  )
}

export default StatusBadge
