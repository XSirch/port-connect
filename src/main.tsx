import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import TestApp from './TestApp.tsx'
import DebugApp from './DebugApp.tsx'

// Temporarily use TestApp to debug loading issues
const USE_TEST_APP = false
const USE_DEBUG_APP = false

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {USE_DEBUG_APP ? <DebugApp /> : USE_TEST_APP ? <TestApp /> : <App />}
  </StrictMode>,
)
