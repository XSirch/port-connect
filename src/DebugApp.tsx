import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

const DebugApp: React.FC = () => {
  const [status, setStatus] = useState<string>('Initializing...')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    const testConnection = async () => {
      try {
        addLog('Testing Supabase connection...')
        
        // Test basic connection
        const { error } = await supabase
          .from('ports')
          .select('count')
          .limit(1)

        if (error) {
          addLog(`Supabase connection error: ${error.message}`)
          setStatus('Connection Error')
        } else {
          addLog('Supabase connection successful!')
          setStatus('Connected')
        }

        // Test auth
        addLog('Testing auth session...')
        const { data: session } = await supabase.auth.getSession()
        addLog(`Auth session: ${session.session ? 'exists' : 'none'}`)

      } catch (error) {
        addLog(`Unexpected error: ${error}`)
        setStatus('Error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            PortConnect Debug Console
          </h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Connection Status
            </h2>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              status === 'Connected' ? 'bg-green-100 text-green-800' :
              status === 'Connection Error' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {status}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Environment Variables
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div>
                <span className="font-medium">VITE_SUPABASE_URL:</span>{' '}
                <span className="text-gray-600">
                  {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
              <div>
                <span className="font-medium">VITE_SUPABASE_ANON_KEY:</span>{' '}
                <span className="text-gray-600">
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Debug Logs
            </h2>
            <div className="bg-black text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-gray-500">No logs yet...</div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Reload Page
            </button>
            <button
              onClick={() => setLogs([])}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Clear Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebugApp
