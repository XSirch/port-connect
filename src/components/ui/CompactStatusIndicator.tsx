import React from 'react'
import { Check, Clock, X, AlertCircle } from 'lucide-react'
import type { ApprovalStatus, ReservationStatus, UserRole } from '../../lib/supabase'

interface CompactStatusIndicatorProps {
  status: ReservationStatus
  terminalApproval?: ApprovalStatus
  providerApproval?: ApprovalStatus
  userRole: UserRole
  showTooltip?: boolean
}

const CompactStatusIndicator: React.FC<CompactStatusIndicatorProps> = ({
  status,
  terminalApproval = 'pending',
  providerApproval = 'pending',
  userRole,
  showTooltip = true
}) => {
  // Get the most relevant status for the user
  const getRelevantStatus = () => {
    // Final states always show
    if (status === 'completed') return { color: 'bg-blue-500', icon: <Check className="h-3 w-3" />, text: 'Completed' }
    if (status === 'cancelled') return { color: 'bg-gray-500', icon: <X className="h-3 w-3" />, text: 'Cancelled' }
    if (status === 'rejected') return { color: 'bg-red-500', icon: <X className="h-3 w-3" />, text: 'Rejected' }
    if (status === 'confirmed') return { color: 'bg-green-500', icon: <Check className="h-3 w-3" />, text: 'Confirmed' }

    // For pending, show role-specific status
    if (userRole === 'terminal') {
      if (terminalApproval === 'pending') {
        return { color: 'bg-yellow-500', icon: <Clock className="h-3 w-3" />, text: 'Awaiting Terminal Approval' }
      } else if (terminalApproval === 'approved') {
        return { color: 'bg-blue-500', icon: <Clock className="h-3 w-3" />, text: 'Awaiting Provider Approval' }
      }
    }

    if (userRole === 'provider') {
      if (providerApproval === 'pending') {
        return { color: 'bg-yellow-500', icon: <Clock className="h-3 w-3" />, text: 'Awaiting Provider Approval' }
      } else if (providerApproval === 'approved') {
        return { color: 'bg-blue-500', icon: <Clock className="h-3 w-3" />, text: 'Awaiting Terminal Approval' }
      }
    }

    if (userRole === 'captain') {
      const approvedCount = [terminalApproval, providerApproval].filter(a => a === 'approved').length
      if (approvedCount === 0) {
        return { color: 'bg-yellow-500', icon: <Clock className="h-3 w-3" />, text: 'Awaiting Approvals' }
      } else if (approvedCount === 1) {
        return { color: 'bg-blue-500', icon: <Clock className="h-3 w-3" />, text: 'Partially Approved' }
      }
    }

    return { color: 'bg-gray-500', icon: <AlertCircle className="h-3 w-3" />, text: 'Unknown Status' }
  }

  const statusInfo = getRelevantStatus()

  return (
    <div className={`relative ${showTooltip ? 'group' : ''}`}>
      {/* Compact dot indicator */}
      <div className={`
        w-3 h-3 rounded-full ${statusInfo.color} 
        flex items-center justify-center
        cursor-pointer transition-all duration-200
        group-hover:w-6 group-hover:h-6
      `}>
        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
          {React.cloneElement(statusInfo.icon, { className: 'h-2 w-2' })}
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {statusInfo.text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  )
}

export default CompactStatusIndicator
