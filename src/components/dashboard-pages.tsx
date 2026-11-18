import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  Plus,
  Bot,
  MessageSquare,
  Users,
  BookOpen,
  Settings,
  HelpCircle,
  Search,
  ArrowUpRight,
  Upload,
  Globe,
  CheckCircle2,
  Clock3,
  Trash2,
} from 'lucide-react'

type DashboardPagesProps = {
  page: string
  onNavigate: (page: string) => void
  businessId: string
}
type Chatbot = {
  id: string
  business_id: string
  name: string
  description: string | null
  status: 'draft' | 'active' | 'paused'
  welcome_message: string
  primary_color: string
  created_at: string
  updated_at: string
}

const sampleLeads = [
  { name: 'James Daniels', email: 'james@example.com', source: 'Website', status: 'New' },
  { name: 'Sarah Mitchell', email: 'sarah@example.com', source: 'Chatbot', status: 'Contacted' },
  { name: 'Thabo Khumalo', email: 'thabo@example.com', source: 'Website', status: 'New' },
]

const sampleMessages = [
  { name: 'James Daniels', message: 'I need help with your services.', status: 'New', time: '2 min ago' },
  { name: 'Sarah Mitchell', message: 'Can I book an appointment?', status: 'Active', time: '18 min ago' },
  { name: 'Thabo Khumalo', message: 'Thank you for your help.', status: 'Resolved', time: '42 min ago' },
]

function PageHeading({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      </div>
      {children}
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string
  icon: React.ElementType
}) {
  return (
    <div className="rounded-xl border border-[#253247] bg-[#101827] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <Icon size={19} className="text-blue-400" />
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

function DashboardPages({ page, onNavigate, businessId }: DashboardPagesProps) {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [chatbotsLoading, setChatbotsLoading] = useState(false)
  const [chatbotError, setChatbotError] = useState('')
  const [savingChatbot, setSavingChatbot] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null)
  const [savingConfiguration, setSavingConfiguration] = useState(false)
  const [editBotName, setEditBotName] = useState('')
  const [editBotDescription, setEditBotDescription] = useState('')
  const [editWelcomeMessage, setEditWelcomeMessage] = useState('')
  const [editPrimaryColor, setEditPrimaryColor] = useState('#2563EB')
  const [editBotStatus, setEditBotStatus] = useState<Chatbot['status']>('draft')
  const [newBotName, setNewBotName] = useState('')
  const [search, setSearch] = useState('')
  const [knowledgeSources, setKnowledgeSources] = useState([
    'Company information',
    'Frequently asked questions',
    'Product and service information',
  ])

    useEffect(() => {
    if (page !== 'AI Chatbots') return

    let cancelled = false

    async function loadChatbots() {
      setChatbotsLoading(true)
      setChatbotError('')

      const { data, error } = await supabase
        .from('chatbots')
        .select(
          'id, business_id, name, description, status, welcome_message, primary_color, created_at, updated_at'
        )
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (error) {
        setChatbotError(error.message)
      } else {
        setChatbots(data ?? [])
      }

      setChatbotsLoading(false)
    }

    loadChatbots()

    return () => {
      cancelled = true
    }
  }, [page, businessId])

    async function createChatbot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = newBotName.trim()

    if (name.length < 2) {
      setChatbotError('Chatbot name must be at least 2 characters.')
      return
    }

    setSavingChatbot(true)
    setChatbotError('')

    const { data, error } = await supabase
      .from('chatbots')
      .insert({
        business_id: businessId,
        name,
      })
      .select(
        'id, business_id, name, description, status, welcome_message, primary_color, created_at, updated_at'
      )
      .single()

    setSavingChatbot(false)

    if (error) {
      setChatbotError(error.message)
      return
    }

    setChatbots((current) => [data, ...current])
    setNewBotName('')
    setShowCreateForm(false)
  }

  async function saveChatbotConfiguration(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!selectedChatbot) return

    const name = editBotName.trim()
    const description = editBotDescription.trim()
    const welcomeMessage = editWelcomeMessage.trim()

    if (name.length < 2) {
      setChatbotError('Chatbot name must be at least 2 characters.')
      return
    }

    if (!welcomeMessage) {
      setChatbotError('Welcome message cannot be empty.')
      return
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(editPrimaryColor)) {
      setChatbotError('Please choose a valid colour.')
      return
    }

    setSavingConfiguration(true)
    setChatbotError('')

    const { data, error } = await supabase
      .from('chatbots')
      .update({
        name,
        description: description || null,
        welcome_message: welcomeMessage,
        primary_color: editPrimaryColor,
        status: editBotStatus,
      })
      .eq('id', selectedChatbot.id)
      .eq('business_id', businessId)
      .select(
        'id, business_id, name, description, status, welcome_message, primary_color, created_at, updated_at'
      )
      .single()

    setSavingConfiguration(false)

    if (error) {
      setChatbotError(error.message)
      return
    }

    setChatbots((current) =>
      current.map((bot) => (bot.id === data.id ? data : bot))
    )

    setSelectedChatbot(data)
  }
function openChatbotConfiguration(bot: Chatbot) {
  setSelectedChatbot(bot)
  setEditBotName(bot.name)
  setEditBotDescription(bot.description ?? '')
  setEditWelcomeMessage(bot.welcome_message)
  setEditPrimaryColor(bot.primary_color)
  setEditBotStatus(bot.status)
  setChatbotError('')
  onNavigate('Chatbot Configuration')
}
  const filteredMessages = sampleMessages.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.message.toLowerCase().includes(search.toLowerCase())
  )

  if (page === 'Overview') {
    return (
      <div className="space-y-8">
        <PageHeading
          title="Welcome back, Kyle 👋"
          description="Here's what's happening with your AI workspace today."
        >
          <button
            onClick={() => onNavigate('AI Chatbots')}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"
          >
            <Plus size={17} /> Create chatbot
          </button>
        </PageHeading>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total conversations" value="1,284" icon={MessageSquare} />
          <StatCard title="Active chatbots" value="3" icon={Bot} />
          <StatCard title="Leads captured" value="186" icon={Users} />
          <StatCard title="Resolution rate" value="94.6%" icon={CheckCircle2} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-[#253247] bg-[#101827] p-6">
            <h3 className="font-semibold text-white">Getting started</h3>
            <p className="mt-2 text-sm text-slate-400">
              Complete these steps to set up your AI workspace.
            </p>
            {[
              'Create your first chatbot',
              'Add business information',
              'Configure your AI assistant',
              'Connect your website',
            ].map((item, index) => (
              <div key={item} className="mt-5 flex items-center gap-3 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-xs text-blue-400">
                  {index + 1}
                </span>
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[#253247] bg-[#101827] p-6">
            <h3 className="font-semibold text-white">Workspace status</h3>
            <div className="mt-5 flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="text-sm text-slate-300">Dashboard is running</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Your workspace is ready for configuration. Connect Supabase later to store real business data.
            </p>
            <button
              onClick={() => onNavigate('Settings')}
              className="mt-6 flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-cyan-400"
            >
              Workspace settings <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-600">Illustrative sample data — not connected to a live database.</p>
      </div>
    )
  }
if (page === 'Chatbot Configuration') {
  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => onNavigate('AI Chatbots')}
        className="text-sm text-blue-400 hover:text-cyan-400"
      >
        ← Back to AI Chatbots
      </button>

    {selectedChatbot && (
        <form
    onSubmit={saveChatbotConfiguration}
    className="rounded-xl border border-blue-500/30 bg-[#101827] p-6 space-y-5"
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-white">
          Configure chatbot
        </h3>
          <p className="mt-1 text-sm text-slate-400">
          Customise your AI assistant's settings.
        </p>
      </div>

      <button
        onClick={() => setSelectedChatbot(null)}
        className="text-sm text-slate-400 hover:text-white"
      >
        Close
      </button>
    </div>

    <div>
      <label className="block text-sm text-slate-400">Chatbot name</label>
      <input
        value={editBotName}
        onChange={(event) => setEditBotName(event.target.value)}
        className="mt-2 w-full rounded-lg border border-[#253247] bg-[#080d18] px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm text-slate-400">Description</label>
      <textarea
        value={editBotDescription}
        onChange={(event) => setEditBotDescription(event.target.value)}
        rows={3}
        placeholder="Describe what this chatbot does..."
        className="mt-2 w-full rounded-lg border border-[#253247] bg-[#080d18] px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm text-slate-400">Welcome message</label>
      <textarea
        value={editWelcomeMessage}
        onChange={(event) => setEditWelcomeMessage(event.target.value)}
        rows={3}
        className="mt-2 w-full rounded-lg border border-[#253247] bg-[#080d18] px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm text-slate-400">Primary colour</label>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="color"
          value={editPrimaryColor}
          onChange={(event) => setEditPrimaryColor(event.target.value)}
          className="h-11 w-16 cursor-pointer rounded-lg border border-[#253247] bg-[#080d18] p-1"
        />
        <span className="text-sm text-slate-400">{editPrimaryColor}</span>
      </div>
    </div>

    <div>
      <label className="block text-sm text-slate-400">Status</label>
      <select
        value={editBotStatus}
        onChange={(event) => setEditBotStatus(event.target.value as Chatbot['status'])}
        className="mt-2 w-full rounded-lg border border-[#253247] bg-[#080d18] px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
      >
        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
      </select>
    </div>

    <div className="flex gap-3 border-t border-[#253247] pt-5">
      <button
        disabled={savingConfiguration}
        className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50"
      >
        {savingConfiguration ? 'Saving...' : 'Save changes'}
      </button>

      <button
        onClick={() => setSelectedChatbot(null)}
        className="rounded-lg border border-[#253247] px-5 py-2.5 text-sm text-slate-300 hover:text-white"
      >
        Cancel
      </button>
    </div>
</form>
)}

    </div>
  )
}

  if (page === 'AI Chatbots') {
    return (
      <div className="space-y-6">
        <PageHeading
          title="AI Chatbots"
          description="Create, configure and manage your business AI assistants."
        >
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"
          >
            <Plus size={17} /> Create chatbot
          </button>
        </PageHeading>

        {showCreateForm && (
          <form onSubmit={createChatbot} className="rounded-xl border border-blue-500/30 bg-[#101827] p-5">
            <h3 className="font-semibold text-white">New chatbot</h3>
            <label className="mt-4 block text-sm text-slate-400" htmlFor="bot-name">
              Chatbot name
            </label>
            <input
              id="bot-name"
              value={newBotName}
              onChange={(event) => setNewBotName(event.target.value)}
              placeholder="e.g. Customer Support Assistant"
              className="mt-2 w-full rounded-lg border border-[#253247] bg-[#080d18] px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
              required
            />
            <div className="mt-4 flex gap-3">
              <button
  type="submit"
  disabled={savingChatbot}
  className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
>
  {savingChatbot ? 'Creating...' : 'Create'}
</button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="rounded-lg border border-[#253247] px-4 py-2 text-sm text-slate-300">
                Cancel
              </button>
            </div>
          </form>
        )}
       

        {chatbotError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {chatbotError}
          </div>
        )}

        {chatbotsLoading ? (
          <div className="rounded-xl border border-[#253247] bg-[#101827] p-8 text-center text-sm text-slate-400">
            Loading your chatbots...
          </div>
        ) : chatbots.length === 0 ? (
          <div className="rounded-xl border border-[#253247] bg-[#101827] p-10 text-center">
            <Bot size={32} className="mx-auto text-slate-500" />
            <h3 className="mt-4 font-semibold text-white">No chatbots yet</h3>
            <p className="mt-2 text-sm text-slate-400">
              Create your first AI chatbot to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {chatbots.map((bot) => (
              <div key={bot.id} className="rounded-xl border border-[#253247] bg-[#101827] p-5">
                <div className="flex items-start justify-between">
                  <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                    <Bot size={23} />
                  </div>
                </div>

                <h3 className="mt-5 font-semibold text-white">{bot.name}</h3>

                <p className="mt-2 text-xs text-slate-500">
                  Created {new Date(bot.created_at).toLocaleDateString()}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-[#253247] pt-4">
                  <span className={`rounded-md px-2 py-1 text-xs ${
                    bot.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : bot.status === 'paused'
                        ? 'bg-slate-500/10 text-slate-400'
                        : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {bot.status.charAt(0).toUpperCase() + bot.status.slice(1)}
                  </span>

<button
  onClick={() => openChatbotConfiguration(bot)}
  className="text-xs font-semibold text-blue-400 hover:text-cyan-400"
>
  Configure →
</button>             </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (page === 'Conversations') {
    return (
      <div className="space-y-6">
        <PageHeading title="Conversations" description="View and manage customer conversations." />
        <div className="flex items-center gap-3 rounded-lg border border-[#253247] bg-[#101827] px-3 py-3">
          <Search size={17} className="text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>
        <div className="overflow-hidden rounded-xl border border-[#253247] bg-[#101827]">
          {filteredMessages.map((item) => (
            <div key={item.name} className="flex flex-wrap items-center justify-between gap-3 border-b border-[#253247] p-5 last:border-0">
              <div>
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="mt-1 text-sm text-slate-400">{item.message}</p>
                <p className="mt-2 text-xs text-slate-500">{item.time}</p>
              </div>
              <span className="rounded-md bg-blue-500/10 px-3 py-1 text-xs text-blue-400">{item.status}</span>
            </div>
          ))}
          {filteredMessages.length === 0 && (
            <p className="p-6 text-sm text-slate-400">No matching conversations found.</p>
          )}
        </div>
      </div>
    )
  }

  if (page === 'Leads') {
    return (
      <div className="space-y-6">
        <PageHeading title="Leads" description="Keep track of potential customers captured by your chatbots." />
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard title="Total leads" value="186" icon={Users} />
          <StatCard title="New leads" value="24" icon={Clock3} />
        </div>
        <div className="overflow-x-auto rounded-xl border border-[#253247] bg-[#101827]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#253247] text-xs text-slate-500">
              <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Source</th><th className="p-4">Status</th></tr>
            </thead>
            <tbody>
              {sampleLeads.map((lead) => (
                <tr key={lead.email} className="border-b border-[#253247] last:border-0">
                  <td className="p-4 text-slate-200">{lead.name}</td>
                  <td className="p-4 text-slate-400">{lead.email}</td>
                  <td className="p-4 text-slate-400">{lead.source}</td>
                  <td className="p-4"><span className="rounded-md bg-blue-500/10 px-2 py-1 text-xs text-blue-400">{lead.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-600">Sample leads only. Real lead capture will be connected later.</p>
      </div>
    )
  }

  if (page === 'Knowledge Base') {
    return (
      <div className="space-y-6">
        <PageHeading title="Knowledge Base" description="Manage the information your AI assistants use to answer questions." />
        <div className="rounded-xl border border-dashed border-blue-500/40 bg-[#101827] p-8 text-center">
          <Upload size={30} className="mx-auto text-blue-400" />
          <h3 className="mt-4 font-semibold text-white">Add knowledge sources</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Later you'll be able to upload documents and add website URLs to teach your chatbot about a business.
          </p>
          <button
            onClick={() => setKnowledgeSources([...knowledgeSources, `New sample source ${knowledgeSources.length + 1}`])}
            className="mt-5 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"
          >
            <Plus size={15} className="mr-2 inline" /> Add sample source
          </button>
        </div>
        <div className="rounded-xl border border-[#253247] bg-[#101827] p-5">
          <h3 className="font-semibold text-white">Knowledge sources</h3>
          {knowledgeSources.map((source, index) => (
            <div key={`${source}-${index}`} className="flex items-center justify-between gap-3 border-b border-[#253247] py-4 last:border-0">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400"><BookOpen size={18} /></div>
                <span className="text-sm text-slate-300">{source}</span>
              </div>
              <button
                aria-label={`Remove ${source}`}
                onClick={() => setKnowledgeSources(knowledgeSources.filter((_, i) => i !== index))}
                className="text-slate-500 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (page === 'Settings') {
    return (
      <div className="space-y-6">
        <PageHeading title="Settings" description="Manage your workspace preferences." />
        <div className="rounded-xl border border-[#253247] bg-[#101827] p-6">
          <div className="flex items-center gap-3">
            <Settings className="text-blue-400" />
            <h3 className="font-semibold text-white">Workspace settings</h3>
          </div>
          <div className="mt-6 space-y-5">
            <div><p className="text-sm text-slate-300">Workspace name</p><p className="mt-1 text-xs text-slate-500">Acme Company (sample workspace)</p></div>
            <div><p className="text-sm text-slate-300">Subscription plan</p><p className="mt-1 text-xs text-slate-500">Free plan</p></div>
            <div><p className="text-sm text-slate-300">Platform</p><p className="mt-1 text-xs text-slate-500">SINTAK AI</p></div>
          </div>
        </div>
      </div>
    )
  }

  if (page === 'Help & Support') {
    return (
      <div className="space-y-6">
        <PageHeading title="Help & Support" description="Find help as you build and manage your AI workspace." />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#253247] bg-[#101827] p-6">
            <BookOpen className="text-blue-400" size={24} />
            <h3 className="mt-4 font-semibold text-white">Documentation</h3>
            <p className="mt-2 text-sm text-slate-400">Guides for setting up chatbots and managing your workspace.</p>
          </div>
          <div className="rounded-xl border border-[#253247] bg-[#101827] p-6">
            <HelpCircle className="text-cyan-400" size={24} />
            <h3 className="mt-4 font-semibold text-white">Contact support</h3>
            <p className="mt-2 text-sm text-slate-400">Support options will be added as the platform develops.</p>
          </div>
          <div className="rounded-xl border border-[#253247] bg-[#101827] p-6">
            <Globe className="text-blue-400" size={24} />
            <h3 className="mt-4 font-semibold text-white">Website integration</h3>
            <p className="mt-2 text-sm text-slate-400">Learn how the SINTAK chat widget will work on your website.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#253247] bg-[#101827] p-6">
      <h2 className="text-xl font-semibold text-white">{page}</h2>
      <p className="mt-2 text-sm text-slate-400">This section is coming soon.</p>
    </div>
  )
}

export default DashboardPages
