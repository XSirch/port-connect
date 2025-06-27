import React, { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useToast } from '../hooks/useToast'
import { supabase } from '../lib/supabase'
import type { Reservation } from '../lib/supabase'

interface CancelReservationModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: Reservation | null
  onSuccess: () => void
}

const CancelReservationModal: React.FC<CancelReservationModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onSuccess
}) => {
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('')

  if (!isOpen || !reservation) return null

  const handleCancel = async () => {
    if (!reservation) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason.trim() || null
        })
        .eq('id', reservation.id)

      if (error) throw error

      showSuccess(
        'Reservation Cancelled',
        'Your reservation has been cancelled successfully. The service provider has been notified.'
      )
      
      onSuccess()
      onClose()
      setReason('')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel reservation'
      showError('Cancellation Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const canCancel = reservation.status !== 'cancelled' && reservation.status !== 'completed'

  if (!canCancel) {
    return (
      <div 
        className="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
            onClick={onClose}
          />
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Cannot Cancel Reservation
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                This reservation cannot be cancelled because it is already {reservation.status}.
              </p>
              <div className="mt-4">
                <button
                  onClick={onClose}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Cancel Reservation
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    Are you sure you want to cancel your reservation for <strong>{reservation.ship_name}</strong>? 
                    This action cannot be undone and the service provider will be notified.
                  </p>
                  
                  <div className="space-y-2">
                    <label htmlFor="cancellation-reason" className="block text-sm font-medium text-gray-700">
                      Reason for cancellation (optional)
                    </label>
                    <textarea
                      id="cancellation-reason"
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please provide a reason for cancelling this reservation..."
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500">
                      {reason.length}/500 characters
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              disabled={loading}
              onClick={handleCancel}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Cancelling...
                </div>
              ) : (
                'Cancel Reservation'
              )}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Keep Reservation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CancelReservationModal
