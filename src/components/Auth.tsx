import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Anchor, Ship, Users, Eye, EyeOff } from 'lucide-react'
import BoltBadge from './ui/BoltBadge'

import { useToast } from '../hooks/useToast'
import type { Port } from '../lib/supabase'

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState<'terminal' | 'provider' | 'captain'>('captain')
  const [company, setCompany] = useState('')
  const [selectedPortId, setSelectedPortId] = useState('')
  const [ports, setPorts] = useState<Port[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showSuccess, showError } = useToast()

  // Carregar portos quando o componente monta
  useEffect(() => {
    const fetchPorts = async () => {
      const { data, error } = await supabase
        .from('ports')
        .select('*')
        .order('name')

      if (error) {
        showError('Failed to load ports', 'Please refresh the page and try again')
      } else {
        setPorts(data || [])
      }
    }

    fetchPorts()
  }, [showError])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (isSignUp) {
      if (!name) {
        newErrors.name = 'Name is required'
      }

      if (role === 'terminal' && !selectedPortId) {
        newErrors.port = 'Please select a port for terminal operator'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      if (isSignUp) {


        // Ensure we're completely signed out before signup
        await supabase.auth.signOut({ scope: 'local' })

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role,
              company: company || null,
              port_id: role === 'terminal' ? selectedPortId : null
            },
            emailRedirectTo: `${window.location.origin}`
          }
        })

        if (error) throw error

        if (data.user) {
          if (!data.session) {
            // User needs to confirm email
            showSuccess(
              'Account created successfully!',
              `We sent a confirmation email to ${email}. Please check your email and click the confirmation link to activate your account.`
            )
            setIsSignUp(false)

            // Clear form fields
            setEmail('')
            setPassword('')
            setName('')
            setCompany('')
            setSelectedPortId('')
          }
          // If data.session exists, user is automatically logged in
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error
        showSuccess('Welcome back!', 'You have been successfully signed in.')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showError('Authentication failed', errorMessage)
      setErrors({ general: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
      {/* Teste do Tailwind */}
      <div className="fixed top-4 left-4 bg-red-500 text-white p-2 rounded">
        Tailwind Test
      </div>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-blue-600 rounded-xl mr-3 shadow-lg">
                <Anchor className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">PortConnect</h1>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-slate-600">
              {isSignUp ? 'Join the maritime services platform' : 'Sign in to your account'}
            </p>
          </div>

          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <>
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="block w-full px-4 py-3 border border-slate-300 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => {
                        setRole(e.target.value as 'terminal' | 'provider' | 'captain')
                        setSelectedPortId('') // Reset port selection when role changes
                      }}
                      className="block w-full px-4 py-3 border border-slate-300 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white hover:border-slate-400"
                    >
                      <option value="captain">Ship Captain/Agent</option>
                      <option value="provider">Service Provider</option>
                      <option value="terminal">Terminal Operator</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      {role === 'captain' && <Ship className="h-4 w-4 text-slate-400" />}
                      {role === 'provider' && <Users className="h-4 w-4 text-slate-400" />}
                      {role === 'terminal' && <Anchor className="h-4 w-4 text-slate-400" />}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="company" className="block text-sm font-medium text-slate-700">
                    Company
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Enter your company name (optional)"
                    className="block w-full px-4 py-3 border border-slate-300 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400"
                  />
                  <p className="text-xs text-slate-500">Optional - helps identify your organization</p>
                </div>

                {role === 'terminal' && (
                  <div className="space-y-1">
                    <label htmlFor="port" className="block text-sm font-medium text-slate-700">
                      Assigned Port <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="port"
                      value={selectedPortId}
                      onChange={(e) => setSelectedPortId(e.target.value)}
                      className="block w-full px-4 py-3 border border-slate-300 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white hover:border-slate-400"
                    >
                      <option value="">Select a port...</option>
                      {ports.map((port) => (
                        <option key={port.id} value={port.id}>
                          {port.name} ({port.code})
                        </option>
                      ))}
                    </select>
                    {errors.port && (
                      <p className="text-sm text-red-600">{errors.port}</p>
                    )}
                    <p className="text-xs text-slate-500">Select the port you will manage as a terminal operator</p>
                  </div>
                )}
              </>
            )}

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="block w-full px-4 py-3 border border-slate-300 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full px-4 py-3 pr-12 border rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 ${
                    errors.password
                      ? 'border-red-300 text-red-900 placeholder-red-300'
                      : 'border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  {errors.password}
                </p>
              )}
              {isSignUp && !errors.password && (
                <p className="text-sm text-slate-500">
                  Must be at least 6 characters long
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setErrors({})
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200 hover:underline"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Role descriptions */}
          {isSignUp && (
            <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-sm font-medium text-slate-900 mb-3">Choose your role:</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <Ship className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <span className="font-medium text-slate-900">Ship Captain/Agent:</span>
                    <p className="text-xs">Book and manage services for your vessels</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <span className="font-medium text-slate-900">Service Provider:</span>
                    <p className="text-xs">Offer tugboat, bunkering, cleaning, and maintenance services</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Anchor className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <span className="font-medium text-slate-900">Terminal Operator:</span>
                    <p className="text-xs">Manage port resources, schedules, and operations</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bolt.new Badge for Auth Page */}
        <div className="mt-8 flex justify-center">
          <BoltBadge variant="compact" position="inline" />
        </div>
      </div>
    </div>
  )
}

export default Auth
