import React from 'react'
import { Check, Clock, X, AlertCircle } from 'lucide-react'
import type { ApprovalStatus } from '../../lib/supabase'

interface DualApprovalBadgeProps {
  terminalApproval: ApprovalStatus
  providerApproval: ApprovalStatus
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
}

const DualApprovalBadge: React.FC<DualApprovalBadgeProps> = ({
  terminalApproval,
  providerApproval,
  size = 'md',
  showLabels = true
}) => {
  const getApprovalIcon = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved':
        return <Check className="h-3 w-3" />
      case 'rejected':
        return <X className="h-3 w-3" />
      case 'pending':
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getApprovalColor = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }



  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2'
  }

  const getOverallStatus = () => {
    if (terminalApproval === 'approved' && providerApproval === 'approved') {
      return { status: 'approved', text: 'Fully Approved', icon: <Check className="h-4 w-4" /> }
    }
    if (terminalApproval === 'rejected' || providerApproval === 'rejected') {
      return { status: 'rejected', text: 'Rejected', icon: <X className="h-4 w-4" /> }
    }
    return { status: 'pending', text: 'Pending Approval', icon: <AlertCircle className="h-4 w-4" /> }
  }

  const overall = getOverallStatus()

  return (
    <div className="flex flex-col space-y-2">
      {/* Overall Status */}
      <div className={`
        inline-flex items-center space-x-1 rounded-full border font-medium
        ${sizeClasses[size]}
        ${getApprovalColor(overall.status as ApprovalStatus)}
      `}>
        {overall.icon}
        <span>{overall.text}</span>
      </div>

      {/* Individual Approvals */}
      {showLabels && (
        <div className="flex space-x-2">
          {/* Terminal Approval */}
          <div className={`
            inline-flex items-center space-x-1 rounded-full border font-medium
            ${sizeClasses.sm}
            ${getApprovalColor(terminalApproval)}
          `}>
            {getApprovalIcon(terminalApproval)}
            <span>Terminal</span>
          </div>

          {/* Provider Approval */}
          <div className={`
            inline-flex items-center space-x-1 rounded-full border font-medium
            ${sizeClasses.sm}
            ${getApprovalColor(providerApproval)}
          `}>
            {getApprovalIcon(providerApproval)}
            <span>Provider</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DualApprovalBadge
