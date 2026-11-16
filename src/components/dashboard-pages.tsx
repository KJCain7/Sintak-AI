
import { useState } from 'react'
import {
  Plus,
  Bot,
  MessageSquare,
  Users,
  BookOpen,
  Settings,
  HelpCircle,
  Search,
  MoreHorizontal,
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
}

const sampleChatbots = [
  { name: 'Customer Support Bot', status: 'Active', conversations: 842 },
  { name: 'Sales Assistant', status: 'Active', conversations: 321 },
  { name: 'Website Assistant', status: 'Draft', conversations: 121 },
]

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

function DashboardPages({ page, onNavigate }: DashboardPagesProps) {
  const [chatbots, setChatbots] = useState(sampleChatbots)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newBotName, setNewBotName] = useState('')
  const [search, setSearch] = useState('')
  const [knowledgeSources, setKnowledgeSources] = useState([
    'Company information',
    'Frequently asked questions',
    'Product and service information',
  ])

  function createChatbot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!newBotName.trim()) return

    setChatbots([
      ...chatbots,
      { name: newBotName.trim(), status: 'Draft', conversations: 0 },
    ])
    setNewBotName('')
    setShowCreateForm(false)
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
              <button type="submit" className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400">
                Create
              </button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="rounded-lg border border-[#253247] px-4 py-2 text-sm text-slate-300">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {chatbots.map((bot, index) => (
            <div key={`${bot.name}-${index}`} className="rounded-xl border border-[#253247] bg-[#101827] p-5">
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <Bot size={23} />
                </div>
                <button aria-label={`More options for ${bot.name}`} className="text-slate-500 hover:text-white">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              <h3 className="mt-5 font-semibold text-white">{bot.name}</h3>
              <p className="mt-2 text-xs text-slate-500">{bot.conversations} conversations</p>
              <div className="mt-5 flex items-center justify-between border-t border-[#253247] pt-4">
                <span className={`rounded-md px-2 py-1 text-xs ${bot.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {bot.status}
                </span>
                <button className="text-xs font-semibold text-blue-400 hover:text-cyan-400">
                  Configure →
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600">Chatbots created here are temporary local examples. Database saving comes later.</p>
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
