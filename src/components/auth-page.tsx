
import { useState } from 'react'
import { Bot, Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        })

        if (error) throw error

        if (!data.session) {
          setMessage('Account created! Check your email to confirm your account before signing in.')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dark min-h-screen bg-[#080d18] text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20 mb-4">
            <Bot size={30} className="text-white" />
          </div>

          <h1 className="text-2xl font-bold tracking-wide">
            SINTAK<span className="text-cyan-400">.</span>
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            AI-powered customer support for your business
          </p>
        </div>

        <div className="rounded-2xl border border-[#253247] bg-[#0c1422] p-8 shadow-2xl">
          <h2 className="text-xl font-semibold">
            {isRegistering ? 'Create your account' : 'Welcome back'}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {isRegistering
              ? 'Get started with your SINTAK workspace.'
              : 'Sign in to access your workspace.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {isRegistering && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Full name
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-[#253247] bg-[#101827] px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[#253247] bg-[#101827] px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <div className="relative">
                <input
                  required
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg border border-[#253247] bg-[#101827] px-4 py-3 pr-12 text-sm outline-none transition focus:border-cyan-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3 text-sm text-cyan-300">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 size={17} className="animate-spin" />}
              {loading
                ? 'Please wait...'
                : isRegistering
                  ? 'Create account'
                  : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            {isRegistering
              ? 'Already have an account?'
              : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsRegistering(!isRegistering)
                setError('')
                setMessage('')
              }}
              className="font-semibold text-cyan-400 hover:text-cyan-300"
            >
              {isRegistering ? 'Sign in' : 'Create one'}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Secure authentication powered by Supabase
        </p>
      </div>
    </div>
  )
}
