import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Bell, X, Check, Clock, Ship } from 'lucide-react'
import { format } from 'date-fns'

interface Notification {
  id: string
  type: 'reservation_created' | 'reservation_confirmed' | 'reservation_rejected' | 'reservation_completed'
  title: string
  message: string
  read: boolean
  created_at: string
  reservation_id?: string
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications()
    }
  }, [isOpen, user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // For now, we'll simulate notifications based on recent reservations
      // In a real app, you'd have a notifications table
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select(`
          *,
          services (
            name,
            type,
            ports (name)
          )
        `)
        .or(`captain_id.eq.${user.id},services.provider_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      // Convert reservations to notifications
      const mockNotifications: Notification[] = reservations?.map((reservation, index) => {
        let type: Notification['type'] = 'reservation_created'
        let title = ''
        let message = ''

        if (user.role === 'captain') {
          switch (reservation.status) {
            case 'pending':
              type = 'reservation_created'
              title = 'Reservation Submitted'
              message = `Your reservation for ${(reservation as any).services?.name} is pending approval`
              break
            case 'confirmed':
              type = 'reservation_confirmed'
              title = 'Reservation Confirmed'
              message = `Your reservation for ${(reservation as any).services?.name} has been confirmed`
              break
            case 'rejected':
              type = 'reservation_rejected'
              title = 'Reservation Rejected'
              message = `Your reservation for ${(reservation as any).services?.name} was rejected`
              break
            case 'completed':
              type = 'reservation_completed'
              title = 'Service Completed'
              message = `Service ${(reservation as any).services?.name} has been completed`
              break
          }
        } else if (user.role === 'provider') {
          switch (reservation.status) {
            case 'pending':
              type = 'reservation_created'
              title = 'New Reservation Request'
              message = `New booking request for ${(reservation as any).services?.name} from ${reservation.ship_name}`
              break
            case 'confirmed':
              type = 'reservation_confirmed'
              title = 'Reservation Confirmed'
              message = `You confirmed the booking for ${reservation.ship_name}`
              break
            case 'completed':
              type = 'reservation_completed'
              title = 'Service Completed'
              message = `Service for ${reservation.ship_name} marked as completed`
              break
          }
        }

        return {
          id: `${reservation.id}-${index}`,
          type,
          title,
          message,
          read: Math.random() > 0.3, // Simulate some read/unread
          created_at: reservation.created_at,
          reservation_id: reservation.id
        }
      }) || []

      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reservation_created':
        return <Ship className="h-5 w-5 text-blue-500" />
      case 'reservation_confirmed':
        return <Check className="h-5 w-5 text-green-500" />
      case 'reservation_rejected':
        return <X className="h-5 w-5 text-red-500" />
      case 'reservation_completed':
        return <Clock className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-16 p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Bell className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(notification.created_at), 'MMM dd, yyyy at h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationCenter
