import React, { useState, useRef, useEffect } from 'react'
import './BoltBadge.css'

interface BoltBadgeProps {
  variant?: 'default' | 'compact' | 'icon-only' | 'large'
  position?: 'fixed' | 'inline'
  className?: string
  draggable?: boolean
}

interface Position {
  x: number
  y: number
}

const BoltBadge: React.FC<BoltBadgeProps> = ({
  variant = 'default',
  position = 'fixed',
  className = '',
  draggable = false
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragPosition, setDragPosition] = useState<Position>({ x: 0, y: 0 })
  const [initialPosition, setInitialPosition] = useState<Position>({ x: 0, y: 0 })
  const badgeRef = useRef<HTMLDivElement>(null)

  // Load saved position from localStorage
  useEffect(() => {
    if (position === 'fixed' && draggable) {
      const saved = localStorage.getItem('bolt-badge-position')
      if (saved) {
        try {
          const pos = JSON.parse(saved)
          setDragPosition(pos)
        } catch (e) {
          // Use default position if parsing fails - footer area
          const defaultX = Math.max(16, window.innerWidth - 200)
          const defaultY = Math.max(16, window.innerHeight - 100)
          setDragPosition({ x: defaultX, y: defaultY })
        }
      } else {
        // Position at bottom-right (footer area) with safe margins
        const safeX = Math.max(16, window.innerWidth - 200)
        const safeY = Math.max(16, window.innerHeight - 100)
        setDragPosition({ x: safeX, y: safeY })
      }
    }
  }, [position, draggable])

  // Save position to localStorage
  const savePosition = (pos: Position) => {
    if (position === 'fixed' && draggable) {
      localStorage.setItem('bolt-badge-position', JSON.stringify(pos))
    }
  }

  // Mouse/Touch event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable || position !== 'fixed') return

    setIsDragging(true)
    setInitialPosition({
      x: e.clientX - dragPosition.x,
      y: e.clientY - dragPosition.y
    })
    e.preventDefault()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!draggable || position !== 'fixed') return

    const touch = e.touches[0]
    setIsDragging(true)
    setInitialPosition({
      x: touch.clientX - dragPosition.x,
      y: touch.clientY - dragPosition.y
    })
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const newPos = {
        x: e.clientX - initialPosition.x,
        y: e.clientY - initialPosition.y
      }

      // Constrain to viewport
      const maxX = window.innerWidth - (badgeRef.current?.offsetWidth || 0)
      const maxY = window.innerHeight - (badgeRef.current?.offsetHeight || 0)

      newPos.x = Math.max(0, Math.min(newPos.x, maxX))
      newPos.y = Math.max(0, Math.min(newPos.y, maxY))

      setDragPosition(newPos)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return

      const touch = e.touches[0]
      const newPos = {
        x: touch.clientX - initialPosition.x,
        y: touch.clientY - initialPosition.y
      }

      // Constrain to viewport
      const maxX = window.innerWidth - (badgeRef.current?.offsetWidth || 0)
      const maxY = window.innerHeight - (badgeRef.current?.offsetHeight || 0)

      newPos.x = Math.max(0, Math.min(newPos.x, maxX))
      newPos.y = Math.max(0, Math.min(newPos.y, maxY))

      setDragPosition(newPos)
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        savePosition(dragPosition)
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, initialPosition, dragPosition])

  const baseClasses = 'bolt-badge-draggable'
  const dragClasses = draggable && position === 'fixed'
    ? `cursor-move ${isDragging ? 'bolt-badge-dragging' : ''}`
    : ''

  const positionClasses = position === 'fixed'
    ? `fixed z-50 bolt-badge-fixed ${draggable ? '' : 'bottom-4 right-4'}`
    : ''

  const positionStyle = position === 'fixed' && draggable
    ? {
        left: `${dragPosition.x}px`,
        top: `${dragPosition.y}px`,
        right: 'auto',
        bottom: 'auto'
      }
    : {}

  const renderBadge = () => {
    switch (variant) {
      case 'compact':
        return (
          <a
            href="https://bolt.new/"
            target="_blank"
            rel="noopener noreferrer"
            className={`bolt-badge-compact inline-flex items-center justify-center p-0 bg-white rounded-full shadow-lg hover:shadow-xl border-2 border-gray-300 hover:border-gray-400 ${baseClasses} ${className}`}
            title="Built with Bolt.new"
            style={{ width: '48px', height: '48px' }}
          >
            <img
              src="/black_circle_360x360.png"
              alt="Bolt.new"
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                // Fallback: hide the image
                e.currentTarget.style.display = 'none'
              }}
            />
          </a>
        )
      
      case 'icon-only':
        return (
          <a
            href="https://bolt.new/"
            target="_blank"
            rel="noopener noreferrer"
            className={`bolt-badge-compact inline-flex items-center justify-center p-0 bg-white rounded-full shadow-lg hover:shadow-xl border-2 border-gray-300 hover:border-gray-400 ${baseClasses} ${className}`}
            title="Built with Bolt.new"
            style={{ width: '44px', height: '44px' }}
          >
            <img
              src="/black_circle_360x360.png"
              alt="Bolt.new"
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                // Fallback: hide the image
                e.currentTarget.style.display = 'none'
              }}
            />
          </a>
        )

      case 'large':
        return (
          <a
            href="https://bolt.new/"
            target="_blank"
            rel="noopener noreferrer"
            className={`bolt-badge-large inline-flex items-center justify-center p-0 bg-white rounded-full shadow-xl hover:shadow-2xl border-3 border-gray-300 hover:border-gray-400 ${baseClasses} ${className}`}
            title="Built with Bolt.new"
            style={{ width: '120px', height: '120px' }}
          >
            <img
              src="/black_circle_360x360.png"
              alt="Bolt.new"
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                // Fallback: hide the image
                e.currentTarget.style.display = 'none'
              }}
            />
          </a>
        )

      default:
        return (
          <a
            href="https://bolt.new/"
            target="_blank"
            rel="noopener noreferrer"
            className={`bolt-badge-default inline-flex items-center px-5 py-4 rounded-xl ${baseClasses} ${className}`}
          >
            <img
              src="/logotext_poweredby_360w.png"
              alt="Powered by Bolt.new"
              className="h-8 w-auto sm:h-10 sm:w-auto md:h-12 md:w-auto"
              onError={(e) => {
                // Fallback: show text instead with white color for dark background
                e.currentTarget.outerHTML = '<span class="text-sm font-semibold text-white px-2">Powered by Bolt.new</span>'
              }}
            />
          </a>
        )
    }
  }

  return (
    <div
      ref={badgeRef}
      className={`${positionClasses} ${dragClasses} ${className}`}
      style={positionStyle}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      title={draggable ? "Drag to move" : undefined}
    >
      {renderBadge()}
      {draggable && position === 'fixed' && (
        <div className="bolt-badge-indicator" title="Draggable" />
      )}
    </div>
  )
}

export default BoltBadge
