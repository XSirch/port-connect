import React from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Button from './Button'
import Card from './Card'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center" padding="lg">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-error-100 rounded-full">
            <AlertTriangle className="h-8 w-8 text-error-600" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
          Something went wrong
        </h2>
        
        <p className="text-secondary-600 mb-6">
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </p>
        
        <details className="mb-6 text-left">
          <summary className="cursor-pointer text-sm text-secondary-500 hover:text-secondary-700">
            Technical details
          </summary>
          <pre className="mt-2 text-xs text-error-600 bg-error-50 p-3 rounded-lg overflow-auto">
            {error.message}
          </pre>
        </details>
        
        <div className="flex gap-3 justify-center">
          <Button
            onClick={resetErrorBoundary}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Try again
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh page
          </Button>
        </div>
      </Card>
    </div>
  )
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  fallback = ErrorFallback 
}) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo)
        // Aqui você pode enviar o erro para um serviço de monitoramento
        // como Sentry, LogRocket, etc.
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}

export default ErrorBoundary