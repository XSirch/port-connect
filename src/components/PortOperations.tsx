import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { supabase, type Service, type Reservation, type Port } from '../lib/supabase'
import { format } from 'date-fns'
import { Calendar, Clock, Check, X, Plus, BarChart3, Users, Anchor } from 'lucide-react'
import LoadingSpinner from './ui/LoadingSpinner'
import SmartStatusBadge from './ui/SmartStatusBadge'
import ConfirmModal from './ui/ConfirmModal'

interface ServiceWithPort extends Service {
  ports: Port
}

interface ReservationWithService extends Reservation {
  services: ServiceWithPort
}

const PortOperations: React.FC = () => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [port, setPort] = useState<Port | null>(null)
  const [services, setServices] = useState<ServiceWithPort[]>([])
  const [pendingReservations, setPendingReservations] = useState<ReservationWithService[]>([])
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    pendingReservations: 0,
    todayReservations: 0
  })
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    type: 'approve' | 'reject'
    reservation: ReservationWithService | null
    loading: boolean
  }>({
    isOpen: false,
    type: 'approve',
    reservation: null,
    loading: false
  })

  useEffect(() => {
    if (user?.role === 'terminal' && user.port_id) {
      fetchPortData()
    }
  }, [user])

  const fetchPortData = async () => {
    if (!user?.port_id) return

    try {
      setLoading(true)

      // Fetch port information
      const { data: portData, error: portError } = await supabase
        .from('ports')
        .select('*')
        .eq('id', user.port_id)
        .single()

      if (portError) throw portError
      setPort(portData)

      // Fetch services for this port
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          *,
          ports (*)
        `)
        .eq('port_id', user.port_id)
        .order('created_at', { ascending: false })

      if (servicesError) throw servicesError
      setServices(servicesData || [])

      // Fetch pending reservations for this port (terminal approval pending)
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          *,
          services!inner (
            *,
            ports (*)
          )
        `)
        .eq('services.port_id', user.port_id)
        .eq('terminal_approval', 'pending')
        .order('created_at', { ascending: false })

      if (reservationsError) throw reservationsError
      setPendingReservations(reservationsData || [])

      // Calculate statistics
      const today = new Date().toISOString().split('T')[0]
      const { data: todayReservationsData } = await supabase
        .from('reservations')
        .select('id, services!inner(port_id)')
        .eq('services.port_id', user.port_id)
        .eq('requested_date', today)

      setStats({
        totalServices: servicesData?.length || 0,
        activeServices: servicesData?.filter(s => s.availability).length || 0,
        pendingReservations: reservationsData?.length || 0,
        todayReservations: todayReservationsData?.length || 0
      })

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch port data'
      showError('Error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleReservationAction = async (reservationId: string, action: 'approved' | 'rejected') => {
    setConfirmModal(prev => ({ ...prev, loading: true }))

    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          terminal_approval: action,
          terminal_approved_at: new Date().toISOString(),
          terminal_approved_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId)

      if (error) throw error

      showSuccess(
        'Terminal Approval Updated',
        `Reservation has been ${action === 'approved' ? 'approved' : 'rejected'} by terminal successfully.`
      )

      // Refresh data
      await fetchPortData()

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update reservation'
      showError('Error', errorMessage)
    } finally {
      setConfirmModal({
        isOpen: false,
        type: 'approve',
        reservation: null,
        loading: false
      })
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

  if (!user || user.role !== 'terminal') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="text-gray-500">This page is only accessible to terminal operators.</p>
        </div>
      </div>
    )
  }

  if (!user.port_id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">No Port Assigned</h3>
          <p className="text-gray-500">You are not assigned to any port. Please contact an administrator.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Port Operations</h2>
          {port && (
            <p className="text-gray-600">
              Managing operations for <strong>{port.name}</strong> ({port.code})
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Anchor className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Terminal Operator</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Services</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeServices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReservations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Reservations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayReservations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Reservations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pending Reservation Approvals</h3>
          <p className="text-sm text-gray-600">Review and approve reservation requests for your port</p>
        </div>
        
        {pendingReservations.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending reservations</h3>
            <p className="mt-1 text-sm text-gray-500">All reservations have been processed.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pendingReservations.map((reservation) => (
              <div key={reservation.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getServiceTypeIcon(reservation.services?.type || 'tugboat')}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {reservation.ship_name}
                        </h4>
                        <SmartStatusBadge
                          status={reservation.status as 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'}
                          terminalApproval={reservation.terminal_approval || 'pending'}
                          providerApproval={reservation.provider_approval || 'pending'}
                          userRole="terminal"
                          size="sm"
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        {reservation.services?.name} • {format(new Date(reservation.requested_date), 'MMM dd, yyyy')} at {reservation.requested_time}
                      </p>
                      <p className="text-xs text-gray-500">
                        Duration: {reservation.duration_hours}h
                        {(reservation as any).captain_notes && ` • Notes: ${(reservation as any).captain_notes}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setConfirmModal({
                        isOpen: true,
                        type: 'approve',
                        reservation,
                        loading: false
                      })}
                      className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-full hover:bg-green-100"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmModal({
                        isOpen: true,
                        type: 'reject',
                        reservation,
                        loading: false
                      })}
                      className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Port Services Overview */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Port Services</h3>
              <p className="text-sm text-gray-600">Services available at your port</p>
            </div>
            <button
              onClick={() => window.location.hash = '#/management'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Manage Services
            </button>
          </div>
        </div>
        
        {services.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No services available</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first service to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {services.slice(0, 5).map((service) => (
              <div key={service.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getServiceTypeIcon(service.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{service.type}</p>
                      {service.price_per_hour && (
                        <p className="text-xs text-gray-500">${service.price_per_hour}/hour</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      service.availability 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {service.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {services.length > 5 && (
              <div className="px-6 py-4 text-center">
                <button
                  onClick={() => window.location.hash = '#/management'}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View all {services.length} services →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: 'approve', reservation: null, loading: false })}
        onConfirm={() => confirmModal.reservation && handleReservationAction(
          confirmModal.reservation.id,
          confirmModal.type === 'approve' ? 'approved' : 'rejected'
        )}
        title={confirmModal.type === 'approve' ? 'Approve Reservation' : 'Reject Reservation'}
        message={`Are you sure you want to ${confirmModal.type === 'approve' ? 'approve' : 'reject'} the reservation for ${confirmModal.reservation?.ship_name}?`}
        type={confirmModal.type === 'approve' ? 'success' : 'danger'}
        confirmText={confirmModal.type === 'approve' ? 'Approve' : 'Reject'}
        loading={confirmModal.loading}
      />
    </div>
  )
}

export default PortOperations
