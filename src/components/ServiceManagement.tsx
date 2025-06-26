import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type Service, type Port } from '../lib/supabase'
import { Plus, Edit, Trash2, MapPin, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react'

const ServiceManagement: React.FC = () => {
  const { user } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [ports, setPorts] = useState<Port[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'tugboat' as 'tugboat' | 'bunkering' | 'cleaning' | 'maintenance',
    description: '',
    port_id: '',
    price_per_hour: '',
    availability: true
  })

  useEffect(() => {
    if (user?.role === 'provider') {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch user's services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          *,
          ports (*)
        `)
        .eq('provider_id', user!.id)
        .order('created_at', { ascending: false })

      if (servicesError) throw servicesError
      setServices(servicesData || [])

      // Fetch all ports
      const { data: portsData, error: portsError } = await supabase
        .from('ports')
        .select('*')
        .order('name')

      if (portsError) throw portsError
      setPorts(portsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const serviceData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        port_id: formData.port_id,
        provider_id: user.id,
        price_per_hour: formData.price_per_hour ? parseFloat(formData.price_per_hour) : null,
        availability: formData.availability
      }

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id)

        if (error) throw error
        alert('Service updated successfully!')
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData])

        if (error) throw error
        alert('Service created successfully!')
      }

      resetForm()
      fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      type: service.type,
      description: service.description || '',
      port_id: service.port_id,
      price_per_hour: service.price_per_hour?.toString() || '',
      availability: service.availability
    })
    setShowForm(true)
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)

      if (error) throw error
      alert('Service deleted successfully!')
      fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const toggleAvailability = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ availability: !service.availability })
        .eq('id', service.id)

      if (error) throw error
      fetchData()
    } catch (error: any) {
      alert(error.message)
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
        <h2 className="text-2xl font-bold text-gray-900">My Services</h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </button>
      </div>

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
                {(service as any).ports?.name}
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
                  onClick={() => handleDelete(service.id)}
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
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="tugboat">Tugboat</option>
                  <option value="bunkering">Bunkering</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
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
    </div>
  )
}

export default ServiceManagement
