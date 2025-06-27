import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { supabase, type Service, type Port } from '../lib/supabase'
import { Calendar, Ship, MapPin, DollarSign } from 'lucide-react'


interface ReservationFormProps {
  onClose: () => void
  onSuccess: () => void
}

const ReservationForm: React.FC<ReservationFormProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [ports, setPorts] = useState<Port[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedPort, setSelectedPort] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [formData, setFormData] = useState({
    ship_name: '',
    ship_imo: '',
    requested_date: '',
    requested_time: '',
    duration_hours: 1,
    notes: ''
  })

  useEffect(() => {
    fetchPorts()
  }, [])

  useEffect(() => {
    if (selectedPort) {
      fetchServices(selectedPort)
    }
  }, [selectedPort])

  const fetchPorts = async () => {
    try {
      const { data, error } = await supabase
        .from('ports')
        .select('*')
        .order('name')

      if (error) throw error
      setPorts(data || [])
    } catch (error) {
      // Silently handle errors in production
    }
  }

  const fetchServices = async (portId: string) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('port_id', portId)
        .eq('availability', true)
        .order('name')

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      // Silently handle errors in production
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedService) return

    setLoading(true)
    try {
      // Preparar dados da reserva
      const reservationData = {
        service_id: selectedService,
        captain_id: user.id,
        ship_name: formData.ship_name.trim(),
        ship_imo: formData.ship_imo?.trim() || null,
        requested_date: formData.requested_date,
        requested_time: formData.requested_time,
        duration_hours: formData.duration_hours,
        captain_notes: formData.notes?.trim() || null,
        status: 'pending' as const
      }

      console.log('Criando reserva com dados:', reservationData)

      const { error } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select()

      if (error) {
        console.error('Erro detalhado:', error)
        throw error
      }

      showSuccess('Reservation created successfully!', 'Your reservation has been submitted and is pending approval.')
      onSuccess()
      onClose()
    } catch (error: unknown) {

      let errorMessage = 'An unexpected error occurred'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String((error as any).message)
      }

      showError('Failed to create reservation', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const selectedServiceData = services.find(s => s.id === selectedService)
  const estimatedCost = selectedServiceData?.price_per_hour 
    ? selectedServiceData.price_per_hour * formData.duration_hours 
    : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Service Reservation</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Ship Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Ship className="h-5 w-5 mr-2" />
              Ship Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ship Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ship_name}
                  onChange={(e) => setFormData({...formData, ship_name: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  IMO Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.ship_imo}
                  onChange={(e) => setFormData({...formData, ship_imo: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Service Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Service Selection
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Port *
                </label>
                <select
                  required
                  value={selectedPort}
                  onChange={(e) => setSelectedPort(e.target.value)}
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
                <label className="block text-sm font-medium text-gray-700">
                  Service *
                </label>
                <select
                  required
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  disabled={!selectedPort}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.type}
                      {service.price_per_hour && ` ($${service.price_per_hour}/hr)`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Schedule
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.requested_date}
                  onChange={(e) => setFormData({...formData, requested_date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.requested_time}
                  onChange={(e) => setFormData({...formData, requested_time: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration (hours) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="24"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData({...formData, duration_hours: parseInt(e.target.value)})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Cost Estimate */}
          {estimatedCost && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">
                  Estimated Cost: ${estimatedCost.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any special requirements or notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReservationForm
