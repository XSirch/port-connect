import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { supabase, type Reservation, type Service, type Port } from '../lib/supabase'
import { Calendar, Clock, Ship, Plus, Filter, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import ReservationForm from './ReservationForm'
import Card from './ui/Card'
import Button from './ui/Button'
import Badge from './ui/Badge'
import LoadingSpinner from './ui/LoadingSpinner'
import EmptyState from './ui/EmptyState'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const { showSuccess } = useToast()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [, setPorts] = useState<Port[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all')
  const [showReservationForm, setShowReservationForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch reservations based on user role
      let reservationsQuery = supabase.from('reservations').select(`
        *,
        services (
          *,
          ports (*)
        )
      `)

      if (user.role === 'captain') {
        reservationsQuery = reservationsQuery.eq('captain_id', user.id)
      } else if (user.role === 'provider') {
        reservationsQuery = reservationsQuery.eq('services.provider_id', user.id)
      }

      const { data: reservationsData, error: reservationsError } = await reservationsQuery

      if (reservationsError) {
        console.error('Error fetching reservations:', reservationsError)
      } else {
        setReservations(reservationsData || [])
      }

      // Fetch services for providers
      if (user.role === 'provider') {
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*, ports (*)')
          .eq('provider_id', user.id)

        if (servicesError) {
          console.error('Error fetching services:', servicesError)
        } else {
          setServices(servicesData || [])
        }
      }

      // Fetch all ports for general reference
      const { data: portsData, error: portsError } = await supabase
        .from('ports')
        .select('*')

      if (portsError) {
        console.error('Error fetching ports:', portsError)
      } else {
        setPorts(portsData || [])
      }
    } catch (error) {
      console.error('Error in fetchData:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusVariant = (status: string): 'warning' | 'success' | 'error' | 'primary' | 'secondary' => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'confirmed':
        return 'success'
      case 'rejected':
        return 'error'
      case 'completed':
        return 'primary'
      case 'cancelled':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'tugboat':
        return '🚢'
      case 'bunkering':
        return '⛽'
      case 'cleaning':
        return '🧽'
      case 'maintenance':
        return '🔧'
      default:
        return '⚓'
    }
  }

  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'all') return true
    return reservation.status === filter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <Card padding="lg" className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-secondary-600 text-lg">
              {user?.role === 'captain' && 'Manage your vessel service reservations'}
              {user?.role === 'provider' && 'Track your service bookings and availability'}
              {user?.role === 'terminal' && 'Monitor port operations and resource allocation'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="p-4 bg-primary-100 rounded-full">
              <Ship className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover className="group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 mb-1">Total Reservations</p>
              <p className="text-3xl font-bold text-secondary-900">{reservations.length}</p>
              <p className="text-xs text-secondary-500 mt-1">All time</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card hover className="group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-warning-600">
                {reservations.filter(r => r.status === 'pending').length}
              </p>
              <p className="text-xs text-secondary-500 mt-1">Awaiting approval</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-xl group-hover:bg-warning-200 transition-colors">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </Card>

        <Card hover className="group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 mb-1">
                {user?.role === 'provider' ? 'Active Services' : 'Confirmed'}
              </p>
              <p className="text-3xl font-bold text-success-600">
                {user?.role === 'provider'
                  ? services.filter(s => s.availability).length
                  : reservations.filter(r => r.status === 'confirmed').length
                }
              </p>
              <p className="text-xs text-secondary-500 mt-1">
                {user?.role === 'provider' ? 'Available now' : 'Ready to go'}
              </p>
            </div>
            <div className="p-3 bg-success-100 rounded-xl group-hover:bg-success-200 transition-colors">
              <TrendingUp className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Reservations List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-secondary-900">Recent Reservations</h2>
            <p className="text-sm text-secondary-600 mt-1">
              {filteredReservations.length} of {reservations.length} reservations
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-secondary-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-sm border-secondary-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            {user?.role === 'captain' && (
              <Button
                onClick={() => setShowReservationForm(true)}
                icon={<Plus className="h-4 w-4" />}
                size="sm"
              >
                New Reservation
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {filteredReservations.length === 0 ? (
            <EmptyState
              icon={<Ship className="h-12 w-12" />}
              title="No reservations found"
              description={
                user?.role === 'captain'
                  ? 'Get started by creating your first service reservation.'
                  : 'No reservations found for the selected filter.'
              }
              action={user?.role === 'captain' ? {
                label: 'Create Reservation',
                onClick: () => setShowReservationForm(true),
                icon: <Plus className="h-4 w-4" />
              } : undefined}
            />
          ) : (
            filteredReservations.map((reservation) => (
              <Card key={reservation.id} padding="md" hover className="group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl p-2 bg-secondary-100 rounded-lg group-hover:bg-secondary-200 transition-colors">
                      {getServiceTypeIcon((reservation as any).services?.type || 'tugboat')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-semibold text-secondary-900">
                          {reservation.ship_name}
                        </h4>
                        {reservation.ship_imo && (
                          <span className="text-xs text-secondary-500 font-mono bg-secondary-100 px-2 py-0.5 rounded">
                            IMO: {reservation.ship_imo}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-secondary-600 mb-2">
                        {(reservation as any).services?.name} • {(reservation as any).services?.ports?.name}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-secondary-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(reservation.requested_date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {reservation.requested_time} ({reservation.duration_hours}h)
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {reservation.total_cost && (
                      <div className="text-right">
                        <p className="text-lg font-semibold text-secondary-900">
                          ${reservation.total_cost}
                        </p>
                        <p className="text-xs text-secondary-500">Total cost</p>
                      </div>
                    )}
                    <Badge variant={getStatusVariant(reservation.status)} size="md">
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* Reservation Form Modal */}
      {showReservationForm && (
        <ReservationForm
          onClose={() => setShowReservationForm(false)}
          onSuccess={() => {
            fetchData() // Refresh data after successful reservation
            showSuccess('Reservation created successfully!')
          }}
        />
      )}
    </div>
  )
}

export default Dashboard
