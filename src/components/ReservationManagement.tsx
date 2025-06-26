import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type Reservation } from '../lib/supabase'
import { Calendar, Clock, Ship, Check, X } from 'lucide-react'
import { format } from 'date-fns'

const ReservationManagement: React.FC = () => {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [providerNotes, setProviderNotes] = useState('')

  useEffect(() => {
    fetchReservations()
  }, [user, filter])

  const fetchReservations = async () => {
    if (!user) return

    try {
      setLoading(true)
      let query = supabase
        .from('reservations')
        .select(`
          *,
          services (
            *,
            ports (*),
            users!services_provider_id_fkey (name, email, company)
          ),
          users!reservations_captain_id_fkey (name, email, company)
        `)

      // Filter based on user role
      if (user.role === 'provider') {
        query = query.eq('services.provider_id', user.id)
      } else if (user.role === 'captain') {
        query = query.eq('captain_id', user.id)
      }
      // Terminal operators can see all reservations

      // Apply status filter
      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setReservations(data || [])
    } catch (error) {
      console.error('Error fetching reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateReservationStatus = async (reservationId: string, status: string, notes?: string) => {
    try {
      const updateData: any = { status }
      if (notes !== undefined) {
        updateData.provider_notes = notes
      }

      const { error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', reservationId)

      if (error) throw error

      alert(`Reservation ${status} successfully!`)
      fetchReservations()
      setSelectedReservation(null)
      setProviderNotes('')
    } catch (error: any) {
      alert(error.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'tugboat': return '🚢'
      case 'bunkering': return '⛽'
      case 'cleaning': return '🧽'
      case 'maintenance': return '🔧'
      default: return '⚓'
    }
  }

  const canManageReservation = (reservation: Reservation) => {
    if (user?.role === 'provider') {
      return (reservation as any).services?.provider_id === user.id
    }
    if (user?.role === 'terminal') {
      return true
    }
    return false
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border-gray-300 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['pending', 'confirmed', 'completed', 'all'].map((status) => (
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
                      {getServiceTypeIcon((reservation as any).services?.type || 'tugboat')}
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
                        {(reservation as any).services?.name} • {(reservation as any).services?.ports?.name}
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
                            {(reservation as any).users?.name}
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
                    
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(reservation.status)}`}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </span>
                    
                    {canManageReservation(reservation) && reservation.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
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
                        onClick={() => updateReservationStatus(reservation.id, 'completed')}
                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100"
                      >
                        Mark Complete
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
                onClick={() => updateReservationStatus(selectedReservation.id, 'rejected', providerNotes)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Reject Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReservationManagement
