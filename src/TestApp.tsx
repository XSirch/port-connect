import React from 'react'

const TestApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          PortConnect Test Page
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see this, the basic React app is working.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            ✅ React is loading
          </p>
          <p className="text-sm text-gray-500">
            ✅ Tailwind CSS is working
          </p>
          <p className="text-sm text-gray-500">
            ✅ TypeScript is compiling
          </p>
        </div>
        <button
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => console.log('Test button clicked')}
        >
          Test Button
        </button>
      </div>
    </div>
  )
}

export default TestApp
