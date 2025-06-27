import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { supabase, type Reservation, type Service, type User } from '../lib/supabase'
import { format } from 'date-fns'
import { Calendar, Clock, Ship, Check, X, Ban } from 'lucide-react'
import LoadingSpinner from './ui/LoadingSpinner'
import SmartStatusBadge from './ui/SmartStatusBadge'
import ConfirmModal from './ui/ConfirmModal'
import CancelReservationModal from './CancelReservationModal'

// Extended type for reservations with joined data
type ReservationWithService = Reservation & {
  services?: Service & {
    ports?: { name: string }
  }
  users?: User
}

const ReservationManagement: React.FC = () => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [reservations, setReservations] = useState<ReservationWithService[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')
  const [selectedReservation, setSelectedReservation] = useState<ReservationWithService | null>(null)
  const [providerNotes, setProviderNotes] = useState('')
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    type: 'confirm' | 'reject' | 'complete'
    reservation: ReservationWithService | null
    loading: boolean
  }>({
    isOpen: false,
    type: 'confirm',
    reservation: null,
    loading: false
  })
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean
    reservation: ReservationWithService | null
  }>({
    isOpen: false,
    reservation: null
  })

  const fetchReservations = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      let query = supabase
        .from('reservations')
        .select(`
          *,
          services!inner (
            *,
            ports (*)
          )
        `)

      // Filter based on user role
      if (user.role === 'provider') {
        query = query.eq('services.provider_id', user.id)
      } else if (user.role === 'captain') {
        query = query.eq('captain_id', user.id)
      } else if (user.role === 'terminal') {
        // Terminal operators can only see reservations for their assigned port
        query = query.eq('services.port_id', user.port_id)
      }

      // Apply status filter
      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setReservations(data || [])
    } catch (error) {
      showError('Failed to load reservations', 'Please refresh the page and try again')
    } finally {
      setLoading(false)
    }
  }, [user, filter])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  const updateReservationApproval = async (reservationId: string, action: 'approve' | 'reject' | 'complete', notes?: string) => {
    setConfirmModal(prev => ({ ...prev, loading: true }))

    try {
      if (!user) throw new Error('User not authenticated')

      let updateData: any = {}
      let statusMessage = ''

      if (action === 'complete') {
        // Only providers can mark as complete
        if (user.role !== 'provider') throw new Error('Only providers can mark reservations as complete')
        updateData = {
          status: 'completed',
          provider_notes: notes
        }
        statusMessage = 'Reservation marked as completed!'
      } else {
        // Handle approval/rejection based on user role
        const now = new Date().toISOString()

        if (user.role === 'terminal') {
          updateData = {
            terminal_approval: action === 'approve' ? 'approved' : 'rejected',
            terminal_approved_at: action === 'approve' ? now : null,
            terminal_approved_by: action === 'approve' ? user.id : null,
            terminal_notes: notes
          }
          statusMessage = action === 'approve' ? 'Terminal approval granted!' : 'Terminal approval rejected!'
        } else if (user.role === 'provider') {
          updateData = {
            provider_approval: action === 'approve' ? 'approved' : 'rejected',
            provider_approved_at: action === 'approve' ? now : null,
            provider_approved_by: action === 'approve' ? user.id : null,
            provider_notes: notes
          }
          statusMessage = action === 'approve' ? 'Provider approval granted!' : 'Provider approval rejected!'
        } else {
          throw new Error('Only terminal operators and providers can approve reservations')
        }

        // Note: The overall status will be updated automatically by the database trigger
        // based on the terminal_approval and provider_approval values
      }

      const { error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', reservationId)

      if (error) throw error

      showSuccess('Status Updated', statusMessage)
      fetchReservations()
      setSelectedReservation(null)
      setProviderNotes('')
      setConfirmModal({ isOpen: false, type: 'confirm', reservation: null, loading: false })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showError('Failed to update reservation', errorMessage)
    } finally {
      setConfirmModal(prev => ({ ...prev, loading: false }))
    }
  }



  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'tugboat': return '🚢'
      case 'bunkering': return '⛽'
      case 'cleaning': return '🧽'
      case 'maintenance': return '🔧'
      case 'docking': return '🏗️'
      default: return '⚓'
    }
  }

  const canManageReservation = (reservation: ReservationWithService) => {
    if (user?.role === 'provider') {
      return reservation.services?.provider_id === user.id
    }
    if (user?.role === 'terminal') {
      return true
    }
    return false
  }

  if (loading) {
    return (
      <div className="h-64">
        <LoadingSpinner size="lg" text="Loading reservations..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {user?.role === 'captain' ? 'My Reservations' : 'Reservation Management'}
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled')}
            className="text-sm border-gray-300 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {['pending', 'confirmed', 'completed', 'cancelled', 'all'].map((status) => (
          <div key={status} className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-600 capitalize">
              {status === 'all' ? 'Total' : status}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {status === 'all' 
                ? reservations.length 
                : reservations.filter(r => r.status === status).length
              }
            </div>
          </div>
        ))}
      </div>

      {/* Reservations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {reservations.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Ship className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reservations</h3>
              <p className="mt-1 text-sm text-gray-500">
                No reservations found for the selected filter.
              </p>
            </div>
          ) : (
            reservations.map((reservation) => (
              <div key={reservation.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getServiceTypeIcon(reservation.services?.type || 'tugboat')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {reservation.ship_name}
                        </h4>
                        {reservation.ship_imo && (
                          <span className="text-xs text-gray-500">
                            IMO: {reservation.ship_imo}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {reservation.services?.name} • {reservation.services?.ports?.name}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(reservation.requested_date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {reservation.requested_time} ({reservation.duration_hours}h)
                        </div>
                        {user?.role !== 'captain' && (
                          <div className="flex items-center">
                            <Ship className="h-3 w-3 mr-1" />
                            {reservation.users?.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {reservation.total_cost && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ${reservation.total_cost}
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    )}
                    
                    <SmartStatusBadge
                      status={reservation.status as 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'}
                      terminalApproval={reservation.terminal_approval || 'pending'}
                      providerApproval={reservation.provider_approval || 'pending'}
                      userRole={user?.role || 'captain'}
                      size="sm"
                      showDetailOnHover={true}
                    />
                    
                    {canManageReservation(reservation) && reservation.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setConfirmModal({
                            isOpen: true,
                            type: 'confirm',
                            reservation,
                            loading: false
                          })}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                          title="Confirm"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReservation(reservation)
                            setProviderNotes('')
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    {reservation.status === 'confirmed' && canManageReservation(reservation) && (
                      <button
                        onClick={() => setConfirmModal({
                          isOpen: true,
                          type: 'complete',
                          reservation,
                          loading: false
                        })}
                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100"
                      >
                        Mark Complete
                      </button>
                    )}

                    {/* Cancel button for captains */}
                    {user?.role === 'captain' && reservation.captain_id === user.id &&
                     reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                      <button
                        onClick={() => setCancelModal({
                          isOpen: true,
                          reservation
                        })}
                        className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100 flex items-center gap-1"
                        title="Cancel Reservation"
                      >
                        <Ban className="h-3 w-3" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                
                {(reservation.notes || reservation.provider_notes) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {reservation.notes && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Customer Notes:</strong> {reservation.notes}
                      </div>
                    )}
                    {reservation.provider_notes && (
                      <div className="text-sm text-gray-600">
                        <strong>Provider Notes:</strong> {reservation.provider_notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Reject Reservation</h3>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this reservation:
              </p>
              
              <textarea
                rows={4}
                value={providerNotes}
                onChange={(e) => setProviderNotes(e.target.value)}
                placeholder="Reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setSelectedReservation(null)
                  setProviderNotes('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateReservationApproval(selectedReservation.id, 'reject', providerNotes)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Reject Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'confirm'}
        onClose={() => setConfirmModal({ isOpen: false, type: 'confirm', reservation: null, loading: false })}
        onConfirm={() => confirmModal.reservation && updateReservationApproval(confirmModal.reservation.id, 'approve')}
        title="Confirm Reservation"
        message={`Are you sure you want to confirm the reservation for ${confirmModal.reservation?.ship_name}?`}
        type="success"
        confirmText="Confirm"
        loading={confirmModal.loading}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'complete'}
        onClose={() => setConfirmModal({ isOpen: false, type: 'complete', reservation: null, loading: false })}
        onConfirm={() => confirmModal.reservation && updateReservationApproval(confirmModal.reservation.id, 'complete')}
        title="Mark as Complete"
        message={`Are you sure you want to mark the reservation for ${confirmModal.reservation?.ship_name} as completed?`}
        type="success"
        confirmText="Mark Complete"
        loading={confirmModal.loading}
      />

      {/* Cancel Reservation Modal */}
      <CancelReservationModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, reservation: null })}
        reservation={cancelModal.reservation}
        onSuccess={fetchReservations}
      />
    </div>
  )
}

export default ReservationManagement
