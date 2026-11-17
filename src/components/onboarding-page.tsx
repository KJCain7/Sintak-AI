
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Bot, Building2, Loader2 } from 'lucide-react'

interface OnboardingPageProps {
  userId: string
  onComplete: () => void
}

export default function OnboardingPage({
  userId,
  onComplete,
}: OnboardingPageProps) {
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const name = businessName.trim()

    if (name.length < 2) {
      setError('Business name must be at least 2 characters.')
      return
    }

    const slug = `${name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}-${crypto.randomUUID().slice(0, 8)}`

    setLoading(true)

    const { error: createError } = await supabase
      .from('businesses')
      .insert({
        name,
        slug,
        owner_id: userId,
      })

    setLoading(false)

    if (createError) {
      setError(createError.message)
      return
    }

    onComplete()
  }

  return (
    <div className="dark min-h-screen bg-[#080d18] text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20">
            <Bot size={30} className="text-white" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#253247] bg-[#0c1422] p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Welcome to SINTAK
            </p>
            <h1 className="text-2xl font-bold">Set up your workspace</h1>
            <p className="mt-2 text-sm text-slate-400">
              Tell us about your business to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="businessName"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Business name
              </label>

              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Company"
                  required
                  minLength={2}
                  maxLength={100}
                  disabled={loading}
                  className="w-full rounded-lg border border-[#253247] bg-[#080d18] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || businessName.trim().length < 2}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Creating workspace...
                </>
              ) : (
                'Create workspace'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Your workspace will be private to your business.
          </p>
        </div>
      </div>
    </div>
  )
}
