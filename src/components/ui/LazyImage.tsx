import React, { useState, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  width?: number
  height?: number
  onLoad?: () => void
  onError?: () => void
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+',
  width,
  height,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(placeholder)
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  React.useEffect(() => {
    if (inView && !isLoaded && !hasError) {
      const img = new Image()
      img.onload = () => {
        setImageSrc(src)
        setIsLoaded(true)
        onLoad?.()
      }
      img.onerror = () => {
        setHasError(true)
        onError?.()
      }
      img.src = src
    }
  }, [inView, src, isLoaded, hasError, onLoad, onError])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-70'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0.7 }}
        transition={{ duration: 0.3 }}
      />
      
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-secondary-100 animate-pulse" />
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-secondary-100 flex items-center justify-center">
          <div className="text-secondary-400 text-sm">Failed to load image</div>
        </div>
      )}
    </div>
  )
}

export default LazyImage