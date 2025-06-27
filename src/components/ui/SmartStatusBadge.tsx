import React from 'react'
import { Check, Clock, X, AlertCircle, CheckCircle, XCircle, Package } from 'lucide-react'
import type { ApprovalStatus, ReservationStatus, UserRole } from '../../lib/supabase'

interface SmartStatusBadgeProps {
  // Overall reservation status
  status: ReservationStatus
  
  // Individual approvals
  terminalApproval?: ApprovalStatus
  providerApproval?: ApprovalStatus
  
  // User context
  userRole: UserRole
  
  size?: 'sm' | 'md' | 'lg'
  
  // Optional: show detailed breakdown on hover/click
  showDetailOnHover?: boolean
}

const SmartStatusBadge: React.FC<SmartStatusBadgeProps> = ({
  status,
  terminalApproval = 'pending',
  providerApproval = 'pending',
  userRole,
  size = 'sm',
  showDetailOnHover = false
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2'
  }

  // Determine what to show based on user role and context
  const getBadgeContent = () => {
    // For completed/cancelled reservations, always show final status
    if (status === 'completed' || status === 'cancelled') {
      return {
        icon: status === 'completed' ? <Package className="h-3 w-3" /> : <XCircle className="h-3 w-3" />,
        text: status === 'completed' ? 'Completed' : 'Cancelled',
        color: status === 'completed' 
          ? 'bg-blue-100 text-blue-800 border-blue-200'
          : 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }

    // For rejected reservations, show rejected status
    if (status === 'rejected') {
      return {
        icon: <XCircle className="h-3 w-3" />,
        text: 'Rejected',
        color: 'bg-red-100 text-red-800 border-red-200'
      }
    }

    // For confirmed reservations, show confirmed status
    if (status === 'confirmed') {
      return {
        icon: <CheckCircle className="h-3 w-3" />,
        text: 'Confirmed',
        color: 'bg-green-100 text-green-800 border-green-200'
      }
    }

    // For pending reservations, show role-specific information
    if (status === 'pending') {
      // Terminal users see terminal-focused status
      if (userRole === 'terminal') {
        if (terminalApproval === 'pending') {
          return {
            icon: <Clock className="h-3 w-3" />,
            text: 'Awaiting Terminal',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
          }
        } else if (terminalApproval === 'approved') {
          return {
            icon: providerApproval === 'pending' ? <Clock className="h-3 w-3" /> : <Check className="h-3 w-3" />,
            text: providerApproval === 'pending' ? 'Awaiting Provider' : 'Terminal Approved',
            color: providerApproval === 'pending' 
              ? 'bg-blue-100 text-blue-800 border-blue-200'
              : 'bg-green-100 text-green-800 border-green-200'
          }
        }
      }

      // Provider users see provider-focused status
      if (userRole === 'provider') {
        if (providerApproval === 'pending') {
          return {
            icon: <Clock className="h-3 w-3" />,
            text: 'Awaiting Provider',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
          }
        } else if (providerApproval === 'approved') {
          return {
            icon: terminalApproval === 'pending' ? <Clock className="h-3 w-3" /> : <Check className="h-3 w-3" />,
            text: terminalApproval === 'pending' ? 'Awaiting Terminal' : 'Provider Approved',
            color: terminalApproval === 'pending' 
              ? 'bg-blue-100 text-blue-800 border-blue-200'
              : 'bg-green-100 text-green-800 border-green-200'
          }
        }
      }

      // Captain users see overall progress
      if (userRole === 'captain') {
        const approvedCount = [terminalApproval, providerApproval].filter(a => a === 'approved').length
        const rejectedCount = [terminalApproval, providerApproval].filter(a => a === 'rejected').length
        
        if (rejectedCount > 0) {
          return {
            icon: <X className="h-3 w-3" />,
            text: 'Rejected',
            color: 'bg-red-100 text-red-800 border-red-200'
          }
        }
        
        if (approvedCount === 2) {
          return {
            icon: <Check className="h-3 w-3" />,
            text: 'Fully Approved',
            color: 'bg-green-100 text-green-800 border-green-200'
          }
        }
        
        return {
          icon: <Clock className="h-3 w-3" />,
          text: `${approvedCount}/2 Approved`,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
      }
    }

    // Fallback
    return {
      icon: <AlertCircle className="h-3 w-3" />,
      text: 'Unknown',
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const badgeContent = getBadgeContent()

  // Detailed breakdown for tooltip/hover
  const getDetailedBreakdown = () => {
    if (!showDetailOnHover) return null
    
    return (
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded text-xs ${
            terminalApproval === 'approved' ? 'bg-green-600' : 
            terminalApproval === 'rejected' ? 'bg-red-600' : 'bg-yellow-600'
          }`}>
            Terminal: {terminalApproval}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${
            providerApproval === 'approved' ? 'bg-green-600' : 
            providerApproval === 'rejected' ? 'bg-red-600' : 'bg-yellow-600'
          }`}>
            Provider: {providerApproval}
          </span>
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    )
  }

  return (
    <div className={`relative ${showDetailOnHover ? 'group' : ''}`}>
      <span 
        className={`
          inline-flex items-center gap-1 font-medium rounded-full border
          ${badgeContent.color} ${sizeClasses[size]}
        `}
        role="status"
        aria-label={`Status: ${badgeContent.text}`}
      >
        {badgeContent.icon}
        {badgeContent.text}
      </span>
      {getDetailedBreakdown()}
    </div>
  )
}

export default SmartStatusBadge
