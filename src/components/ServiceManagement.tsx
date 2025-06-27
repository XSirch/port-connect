import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { supabase, type Service, type Port, type Reservation } from '../lib/supabase'

// Extended type for services with joined data
type ServiceWithPort = Service & {
  ports?: Port
}

interface ReservationWithService extends Reservation {
  services: ServiceWithPort
}

import { Plus, Edit, Trash2, MapPin, DollarSign, ToggleLeft, ToggleRight, Check, X } from 'lucide-react'
import SmartStatusBadge from './ui/SmartStatusBadge'

import ConfirmModal from './ui/ConfirmModal'

const ServiceManagement: React.FC = () => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [services, setServices] = useState<ServiceWithPort[]>([])
  const [ports, setPorts] = useState<Port[]>([])
  const [pendingReservations, setPendingReservations] = useState<ReservationWithService[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<ServiceWithPort | null>(null)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    service: ServiceWithPort | null
    loading: boolean
  }>({
    isOpen: false,
    service: null,
    loading: false
  })
  const [formData, setFormData] = useState({
    name: '',
    type: 'tugboat' as 'tugboat' | 'bunkering' | 'cleaning' | 'maintenance' | 'docking',
    description: '',
    port_id: '',
    price_per_hour: '',
    availability: true
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch user's services (including terminal services)
      let servicesQuery = supabase
        .from('services')
        .select(`
          *,
          ports (*)
        `)
        .order('created_at', { ascending: false })

      // If user is a provider, show only their services
      if (user!.role === 'provider') {
        servicesQuery = servicesQuery.eq('provider_id', user!.id)
      }
      // If user is terminal, show ALL services for their assigned port (not just their own)
      else if ((user!.role as any) === 'terminal' && user!.port_id) {
        servicesQuery = servicesQuery.eq('port_id', user!.port_id)
      }
      // If user is captain, show all available services
      else if (user!.role === 'captain') {
        servicesQuery = servicesQuery.eq('availability', true)
      }

      const { data: servicesData, error: servicesError } = await servicesQuery

      if (servicesError) throw servicesError
      setServices(servicesData || [])

      // Fetch ports (terminal users only see their assigned port)
      let portsQuery = supabase
        .from('ports')
        .select('*')
        .order('name')

      if ((user!.role as any) === 'terminal' && user!.port_id) {
        portsQuery = portsQuery.eq('id', user!.port_id)
      }

      const { data: portsData, error: portsError } = await portsQuery

      if (portsError) throw portsError
      setPorts(portsData || [])

      // Fetch pending reservations for provider approval
      if (user!.role === 'provider') {
        const { data: reservationsData, error: reservationsError } = await supabase
          .from('reservations')
          .select(`
            *,
            services!inner (
              *,
              ports (*)
            )
          `)
          .eq('services.provider_id', user!.id)
          .eq('provider_approval', 'pending')
          .order('created_at', { ascending: false })

        if (!reservationsError) {
          setPendingReservations(reservationsData || [])
        }
      }
    } catch (error) {
      // Silently handle errors in production
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user?.role === 'provider') {
      fetchData()
    }
  }, [user, fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const serviceData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        port_id: formData.port_id,
        provider_id: user.id, // For terminal users, they act as the provider for their port's services
        price_per_hour: formData.price_per_hour ? parseFloat(formData.price_per_hour) : null,
        availability: formData.availability
      }

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id)

        if (error) throw error
        showSuccess('Service updated successfully!', 'Your service has been updated.')
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData])

        if (error) throw error
        showSuccess('Service created successfully!', 'Your new service is now available.')
      }

      resetForm()
      fetchData()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showError('Failed to save service', errorMessage)
    }
  }

  const handleEdit = (service: ServiceWithPort) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      type: ['tugboat', 'bunkering', 'cleaning', 'maintenance', 'docking'].includes(service.type)
        ? service.type as 'tugboat' | 'bunkering' | 'cleaning' | 'maintenance' | 'docking'
        : 'tugboat',
      description: service.description || '',
      port_id: service.port_id,
      price_per_hour: service.price_per_hour?.toString() || '',
      availability: service.availability
    })
    setShowForm(true)
  }

  const handleDelete = async (serviceId: string) => {
    setDeleteModal(prev => ({ ...prev, loading: true }))

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)

      if (error) throw error
      showSuccess('Service deleted successfully!', 'The service has been removed.')
      fetchData()
      setDeleteModal({ isOpen: false, service: null, loading: false })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showError('Failed to delete service', errorMessage)
    } finally {
      setDeleteModal(prev => ({ ...prev, loading: false }))
    }
  }

  const toggleAvailability = async (service: ServiceWithPort) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ availability: !service.availability })
        .eq('id', service.id)

      if (error) throw error
      fetchData()
      showSuccess('Service availability updated', `Service is now ${!service.availability ? 'available' : 'unavailable'}.`)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showError('Failed to update service availability', errorMessage)
    }
  }

  const handleProviderApproval = async (reservationId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          provider_approval: action,
          provider_approved_at: new Date().toISOString(),
          provider_approved_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId)

      if (error) throw error

      showSuccess(
        'Provider Approval Updated',
        `Reservation has been ${action === 'approved' ? 'approved' : 'rejected'} by provider successfully.`
      )

      // Refresh data
      fetchData()

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update reservation'
      showError('Error', errorMessage)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'tugboat',
      description: '',
      port_id: '',
      price_per_hour: '',
      availability: true
    })
    setEditingService(null)
    setShowForm(false)
  }

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'tugboat': return '🚢'
      case 'bunkering': return '⛽'
      case 'cleaning': return '🧽'
      case 'maintenance': return '🔧'
      case 'cargo_handling': return '📦'
      case 'vessel_berthing': return '🏗️'
      case 'pilotage': return '🧭'
      case 'customs_clearance': return '📋'
      case 'waste_disposal': return '♻️'
      case 'security': return '🛡️'
      default: return '⚓'
    }
  }

  if (user?.role !== 'provider') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">This section is only available for service providers.</p>
      </div>
    )
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {(user?.role as any) === 'terminal' ? 'Port Services Management' : 'My Services'}
          </h2>
          {(user?.role as any) === 'terminal' && ports.length > 0 && (
            <p className="text-gray-600 mt-1">
              Managing services for <strong>{ports[0]?.name}</strong> ({ports[0]?.code})
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </button>
      </div>

      {/* Pending Reservations for Providers */}
      {user?.role === 'provider' && pendingReservations.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pending Provider Approvals</h3>
            <p className="text-sm text-gray-600">Reservations waiting for your approval</p>
          </div>

          <div className="divide-y divide-gray-200">
            {pendingReservations.map((reservation) => (
              <div key={reservation.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      🚢
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
                          userRole="provider"
                          size="sm"
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        {reservation.services?.name} • {new Date(reservation.requested_date).toLocaleDateString()} at {reservation.requested_time}
                      </p>
                      <p className="text-xs text-gray-500">
                        Duration: {reservation.duration_hours}h
                        {(reservation as any).captain_notes && ` • Notes: ${(reservation as any).captain_notes}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleProviderApproval(reservation.id, 'approved')}
                      className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-full hover:bg-green-100 flex items-center space-x-1"
                    >
                      <Check className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleProviderApproval(reservation.id, 'rejected')}
                      className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100 flex items-center space-x-1"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getServiceTypeIcon(service.type)}</span>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{service.type}</p>
                </div>
              </div>
              <button
                onClick={() => toggleAvailability(service)}
                className="text-gray-400 hover:text-gray-600"
              >
                {service.availability ? (
                  <ToggleRight className="h-6 w-6 text-green-500" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-gray-400" />
                )}
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {service.ports?.name}
              </div>
              {service.price_per_hour && (
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  ${service.price_per_hour}/hour
                </div>
              )}
            </div>

            {service.description && (
              <p className="text-sm text-gray-600 mb-4">{service.description}</p>
            )}

            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                service.availability 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {service.availability ? 'Available' : 'Unavailable'}
              </span>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteModal({
                    isOpen: true,
                    service,
                    loading: false
                  })}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚓</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
          <p className="text-gray-500 mb-4">Start by adding your first service offering.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Service
          </button>
        </div>
      )}

      {/* Service Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Service Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as 'tugboat' | 'bunkering' | 'cleaning' | 'maintenance' | 'docking'})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="tugboat">Tugboat</option>
                  <option value="bunkering">Bunkering</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="docking">Docking/Pier Services</option>
                  <option value="cargo_handling">Cargo Handling</option>
                  <option value="vessel_berthing">Vessel Berthing</option>
                  <option value="pilotage">Pilotage</option>
                  <option value="customs_clearance">Customs Clearance</option>
                  <option value="waste_disposal">Waste Disposal</option>
                  <option value="security">Security</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Port *</label>
                <select
                  required
                  value={formData.port_id}
                  onChange={(e) => setFormData({...formData, port_id: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a port</option>
                  {ports.map((port) => (
                    <option key={port.id} value={port.id}>
                      {port.name} ({port.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price per Hour</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_hour}
                  onChange={(e) => setFormData({...formData, price_per_hour: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="availability"
                  checked={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="availability" className="ml-2 block text-sm text-gray-900">
                  Available for booking
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {editingService ? 'Update' : 'Create'} Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, service: null, loading: false })}
        onConfirm={() => deleteModal.service && handleDelete(deleteModal.service.id)}
        title="Delete Service"
        message={`Are you sure you want to delete "${deleteModal.service?.name}"? This action cannot be undone.`}
        type="danger"
        confirmText="Delete"
        loading={deleteModal.loading}
      />
    </div>
  )
}

export default ServiceManagement
