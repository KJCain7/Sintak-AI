
import { useState } from 'react'
import DashboardPages from './components/dashboard-pages'
import {
  Activity,
  ArrowUpRight,
  Bell,
  Bot,
  BookOpen,
  ChevronDown,
  Clock3,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'

const navigation = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'AI Chatbots', icon: Bot },
  { name: 'Conversations', icon: MessageSquare },
  { name: 'Leads', icon: Users },
  { name: 'Knowledge Base', icon: BookOpen },
]

const conversations = [
  {
    initials: 'JD',
    name: 'James Daniels',
    message: 'I would like to know more about your services.',
    time: '2 min ago',
    status: 'New',
    color: 'bg-blue-500/15 text-blue-400',
  },
  {
    initials: 'SM',
    name: 'Sarah Mitchell',
    message: 'Can I book an appointment for Friday?',
    time: '18 min ago',
    status: 'Active',
    color: 'bg-cyan-500/15 text-cyan-400',
  },
  {
    initials: 'TK',
    name: 'Thabo Khumalo',
    message: 'Thank you, that answers my question.',
    time: '42 min ago',
    status: 'Resolved',
    color: 'bg-emerald-500/15 text-emerald-400',
  },
  {
    initials: 'LN',
    name: 'Lauren Naidoo',
    message: 'Do you offer delivery in Durban?',
    time: '1 hour ago',
    status: 'Active',
    color: 'bg-cyan-500/15 text-cyan-400',
  },
]

function App() {
  const [activePage, setActivePage] = useState('Overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <><div className="dark min-h-screen bg-[#080d18] text-slate-100">
      <div className="flex min-h-screen">
        {mobileMenuOpen && (
          <button
            aria-label="Close navigation menu"
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setMobileMenuOpen(false)} />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#253247] bg-[#0c1422] transition-transform duration-200 lg:static lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex h-20 items-center justify-between border-b border-[#253247] px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20">
                <Bot size={23} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-wide">SINTAK<span className="text-cyan-400">.</span></h1>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  AI Platform
                </p>
              </div>
            </div>
            <button
              aria-label="Close menu"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={19} />
            </button>
          </div>

          <div className="px-4 py-6">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Workspace
            </p>
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#253247] bg-[#151f30] p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-sm font-bold text-blue-400">
                AC
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-200">Acme Company</p>
                <p className="text-xs text-slate-500">Free plan</p>
              </div>
              <ChevronDown size={15} className="text-slate-500" />
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = activePage === item.name

                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActivePage(item.name)
                      setMobileMenuOpen(false)
                    } }
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition ${active
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'text-slate-400 hover:bg-[#151f30] hover:text-slate-100'}`}
                  >
                    <Icon size={18} />
                    {item.name}
                    {item.name === 'Conversations' && (
                      <span className="ml-auto rounded-md bg-blue-500/15 px-2 py-0.5 text-[10px] text-blue-400">
                        4
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            <p className="mb-3 mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Preferences
            </p>
            <button
              onClick={() => setActivePage('Settings')}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${activePage === 'Settings'
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-slate-400 hover:bg-[#151f30] hover:text-slate-100'}`}
            >
              <Settings size={18} />
              Settings
            </button>
            <button
              onClick={() => setActivePage('Help & Support')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-400 hover:bg-[#151f30] hover:text-slate-100"
            >
              <HelpCircle size={18} />
              Help & Support
            </button>
          </div>

          <div className="mt-auto border-t border-[#253247] p-4">
            <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-cyan-400">
                <Sparkles size={16} />
                <span className="text-xs font-semibold">Need more power?</span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-slate-400">
                Upgrade your plan to unlock more AI conversations.
              </p>
              <button
                onClick={() => setActivePage('Settings')}
                className="w-full rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-400"
              >
                Explore plans
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3 px-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-bold text-white">
                KC
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-200">Account Owner</p>
                <p className="text-xs text-slate-500">owner@example.com</p>
              </div>
              <MoreHorizontal size={18} className="text-slate-500" />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#253247] bg-[#080d18]/90 px-4 backdrop-blur-xl sm:px-8">
            <div className="flex items-center gap-3">
              <button
                aria-label="Open navigation menu"
                className="rounded-lg p-2 text-slate-400 hover:bg-[#151f30] lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={21} />
              </button>
              <div>
                <p className="text-xs text-slate-500">Workspace / {activePage}</p>
                <h2 className="text-lg font-semibold text-white">{activePage}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden items-center gap-2 rounded-lg border border-[#253247] bg-[#101827] px-3 py-2 md:flex">
                <Search size={16} className="text-slate-500" />
                <input
                  placeholder="Search..."
                  className="w-32 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500" />
                <span className="rounded border border-[#253247] px-1.5 py-0.5 text-[10px] text-slate-500">
                  /
                </span>
              </div>
              <button
                aria-label="Notifications"
                className="relative rounded-lg border border-[#253247] p-2.5 text-slate-400 transition hover:bg-[#151f30] hover:text-white"
              >
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
              </button>
              <div className="hidden h-8 w-px bg-[#253247] sm:block" />
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                  AC
                </div>
                <span className="text-sm text-slate-300">Acme Company</span>
                <ChevronDown size={15} className="text-slate-500" />
              </div>
            </div>
          </header>

                   <div className="mx-auto max-w-[1500px] p-4 sm:p-8">
            <DashboardPages
              page={activePage}
              onNavigate={setActivePage}
            />
          </div>
                </main>
      </div>
    </div>
    </>
  )
}

export default App
