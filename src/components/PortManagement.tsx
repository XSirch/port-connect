import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { supabase, type Port } from '../lib/supabase'
import { Plus, Edit, Trash2, MapPin, Clock, Globe, Users } from 'lucide-react'
import LoadingSpinner from './ui/LoadingSpinner'
import ConfirmModal from './ui/ConfirmModal'

const PortManagement: React.FC = () => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [ports, setPorts] = useState<Port[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPort, setEditingPort] = useState<Port | null>(null)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    port: Port | null
    loading: boolean
  }>({
    isOpen: false,
    port: null,
    loading: false
  })
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    timezone: 'UTC'
  })

  useEffect(() => {
    if (user?.role === 'terminal') {
      fetchPorts()
    }
  }, [user])

  const fetchPorts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ports')
        .select(`
          *,
          terminal_manager:users!ports_terminal_manager_id_fkey(name, email)
        `)
        .order('name')

      if (error) throw error
      setPorts(data || [])
    } catch (error) {
      showError('Failed to load ports', 'Please refresh the page and try again')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingPort) {
        const { error } = await supabase
          .from('ports')
          .update(formData)
          .eq('id', editingPort.id)

        if (error) throw error
        showSuccess('Port updated successfully!', 'The port information has been updated.')
      } else {
        const { error } = await supabase
          .from('ports')
          .insert([formData])

        if (error) throw error
        showSuccess('Port created successfully!', 'The new port has been added.')
      }

      resetForm()
      fetchPorts()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showError('Failed to save port', errorMessage)
    }
  }

  const handleEdit = (port: Port) => {
    setEditingPort(port)
    setFormData({
      name: port.name,
      code: port.code,
      location: port.location,
      timezone: port.timezone
    })
    setShowForm(true)
  }

  const handleDelete = async (portId: string) => {
    setDeleteModal(prev => ({ ...prev, loading: true }))

    try {
      const { error } = await supabase
        .from('ports')
        .delete()
        .eq('id', portId)

      if (error) throw error
      showSuccess('Port deleted successfully!', 'The port and all associated data have been removed.')
      fetchPorts()
      setDeleteModal({ isOpen: false, port: null, loading: false })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showError('Failed to delete port', errorMessage)
    } finally {
      setDeleteModal(prev => ({ ...prev, loading: false }))
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      location: '',
      timezone: 'UTC'
    })
    setEditingPort(null)
    setShowForm(false)
  }

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Amsterdam',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney'
  ]

  if (user?.role !== 'terminal') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">This section is only available for terminal operators.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-64">
        <LoadingSpinner size="lg" text="Loading ports..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Port Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Port
        </button>
      </div>

      {/* Ports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ports.map((port) => (
          <div key={port.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{port.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{port.code}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="h-4 w-4 mr-2" />
                {port.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {port.timezone}
              </div>
              {(port as any).terminal_manager && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  Terminal Manager: {(port as any).terminal_manager.name}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => handleEdit(port)}
                className="p-2 text-gray-400 hover:text-blue-600"
                title="Edit port"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteModal({
                  isOpen: true,
                  port,
                  loading: false
                })}
                className="p-2 text-gray-400 hover:text-red-600"
                title="Delete port"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {ports.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ports configured</h3>
          <p className="text-gray-500 mb-4">Start by adding your first port.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Port
          </button>
        </div>
      )}

      {/* Port Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingPort ? 'Edit Port' : 'Add New Port'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Port Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Port of Santos"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Port Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="e.g., BRSSZ"
                  maxLength={5}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
                <p className="mt-1 text-xs text-gray-500">5-letter UN/LOCODE</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Santos, Brazil"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Timezone *</label>
                <select
                  required
                  value={formData.timezone}
                  onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
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
                  {editingPort ? 'Update' : 'Create'} Port
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, port: null, loading: false })}
        onConfirm={() => deleteModal.port && handleDelete(deleteModal.port.id)}
        title="Delete Port"
        message={`Are you sure you want to delete "${deleteModal.port?.name}"? This will also delete all associated services and reservations. This action cannot be undone.`}
        type="danger"
        confirmText="Delete"
        loading={deleteModal.loading}
      />
    </div>
  )
}

export default PortManagement
