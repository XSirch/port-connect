import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Anchor, Ship, Users, Eye, EyeOff } from 'lucide-react'
import Button from './ui/Button'
import Input from './ui/Input'
import Card from './ui/Card'
import BoltBadge from './ui/BoltBadge'

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState<'terminal' | 'provider' | 'captain'>('captain')
  const [company, setCompany] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role,
              company,
            },
          },
        })

        if (error) throw error

        if (data.user) {
          alert('Check your email for the confirmation link!')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
      }
    } catch (error: any) {
      setErrors({ general: error.error_description || error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card padding="lg" shadow="strong" className="animate-slide-up">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-primary-600 rounded-xl mr-3">
                <Anchor className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-secondary-900">PortConnect</h1>
            </div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-secondary-600">
              {isSignUp ? 'Join the maritime services platform' : 'Sign in to your account'}
            </p>
          </div>

          {errors.general && (
            <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-sm text-error-700">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <>
                <Input
                  id="name"
                  label="Full Name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  placeholder="Enter your full name"
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-secondary-700">
                    Role <span className="text-error-500">*</span>
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'terminal' | 'provider' | 'captain')}
                    className="block w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="captain">Ship Captain/Agent</option>
                    <option value="provider">Service Provider</option>
                    <option value="terminal">Terminal Operator</option>
                  </select>
                </div>

                <Input
                  id="company"
                  label="Company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Enter your company name (optional)"
                  helpText="Optional - helps identify your organization"
                />
              </>
            )}

            <Input
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="Enter your email address"
            />

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                Password <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full px-3 py-2 pr-10 border rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.password
                      ? 'border-error-300 text-error-900 placeholder-error-300'
                      : 'border-secondary-300 text-secondary-900 placeholder-secondary-400'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-error-600 flex items-center gap-1">
                  {errors.password}
                </p>
              )}
              {isSignUp && !errors.password && (
                <p className="text-sm text-secondary-500">
                  Must be at least 6 characters long
                </p>
              )}
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setErrors({})
              }}
              className="text-sm"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </Button>
          </div>

          {/* Role descriptions */}
          {isSignUp && (
            <div className="mt-8 p-4 bg-secondary-50 rounded-lg">
              <h3 className="text-sm font-medium text-secondary-900 mb-3">Choose your role:</h3>
              <div className="space-y-3 text-sm text-secondary-600">
                <div className="flex items-start gap-3">
                  <Ship className="h-4 w-4 mt-0.5 text-primary-600" />
                  <div>
                    <span className="font-medium text-secondary-900">Ship Captain/Agent:</span>
                    <p className="text-xs">Book and manage services for your vessels</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 mt-0.5 text-primary-600" />
                  <div>
                    <span className="font-medium text-secondary-900">Service Provider:</span>
                    <p className="text-xs">Offer tugboat, bunkering, cleaning, and maintenance services</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Anchor className="h-4 w-4 mt-0.5 text-primary-600" />
                  <div>
                    <span className="font-medium text-secondary-900">Terminal Operator:</span>
                    <p className="text-xs">Manage port resources, schedules, and operations</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Bolt.new Badge for Auth Page */}
        <div className="mt-8 flex justify-center">
          <BoltBadge variant="compact" position="inline" />
        </div>
      </div>
    </div>
  )
}

export default Auth
