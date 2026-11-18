import { Bell, Search, Inbox, Home, ListChecks, Users, CheckSquare, Calendar, BarChart3, Settings, AlertTriangle } from 'lucide-react'
import { PROGRAMS } from './data.js'

export const Pill = ({ children, cls = 'bg-slate-100 text-slate-700 ring-slate-200' }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap ${cls}`}>{children}</span>
)
export const ProgramPill = ({ p }) => <Pill cls={PROGRAMS[p]}>{p}</Pill>

export const Btn = ({ primary, children, className = '', ...rest }) => (
  <button {...rest} className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50 disabled:cursor-not-allowed ${primary ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm' : 'bg-white text-ink ring-1 ring-slate-300 hover:bg-slate-50'} ${className}`}>{children}</button>
)

export const Card = ({ title, action, children, className = '' }) => (
  <section className={`rounded-xl bg-white ring-1 ring-slate-200 ${className}`}>
    {title && <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5"><h3 className="text-sm font-semibold">{title}</h3>{action}</div>}
    <div className="p-4">{children}</div>
  </section>
)

export const TopBar = ({ user }) => (
  <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
    <img src="./logo.png" alt="CareLink" className="h-8 w-auto" />
    <label className="relative flex-1 min-w-[160px] max-w-md">
      <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" aria-hidden />
      <input aria-label="Search members" placeholder="Search members, IDs, tasks…" className="w-full rounded-lg bg-slate-100 py-1.5 pl-8 pr-3 text-sm placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-brand-200" />
    </label>
    <div className="ml-auto flex items-center gap-4 text-sm text-slate-600">
      <span className="flex items-center gap-1"><Inbox className="h-4 w-4" aria-hidden />7</span>
      <span className="flex items-center gap-1"><Bell className="h-4 w-4" aria-hidden />3</span>
      <span className="rounded-full bg-brand-600 px-3 py-1 text-white">{user}</span>
    </div>
  </header>
)

const NAV = [[Home, 'Home'], [ListChecks, 'Worklists'], [Users, 'My members'], [CheckSquare, 'Tasks'], [Inbox, 'Inbox'], [Calendar, 'Schedule'], [BarChart3, 'Reports'], [Settings, 'Settings']]
export const SideNav = ({ active = 'Worklists' }) => (
  <nav aria-label="Main" className="hidden w-44 shrink-0 border-r border-slate-200 bg-white p-2 lg:block">
    {NAV.map(([I, l]) => (
      <a key={l} href="#" onClick={e => e.preventDefault()} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${l === active ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}><I className="h-4 w-4" aria-hidden />{l}</a>
    ))}
  </nav>
)

export const MemberSidebar = ({ programs, flag = true, extra, viewer = 'Sarah' }) => (
  <aside aria-label="Member summary" className="w-full shrink-0 space-y-3 border-b border-slate-200 bg-white p-4 text-sm md:w-60 md:border-b-0 md:border-r">
    <div className="flex items-center gap-3">
      <img src="./robert.jpg" alt="Robert Hayes" className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-100" />
      <div><div className="font-display text-base font-bold text-brand-900">Robert Hayes</div><div className="text-xs text-slate-500">Male, 58 · DOB 03/14/1968</div></div>
    </div>
    <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
      <dt className="text-slate-500">Member ID</dt><dd>MBR-112093</dd>
      <dt className="text-slate-500">Plan</dt><dd>Medicare Adv.</dd>
      <dt className="text-slate-500">Primary care</dt><dd>Dr. A. Patel</dd>
      <dt className="text-slate-500">Prefers</dt><dd>Text, evenings</dd>
    </dl>
    {flag && <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800"><AlertTriangle className="h-3.5 w-3.5" aria-hidden />AI flag · risk 71 (medium)</div>}
    <div className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-700">3 unanswered calls in 30 days</div>
    <Sec t="Programs">{programs?.length ? <div className="flex flex-wrap gap-1">{programs.map(p => <ProgramPill key={p} p={p} />)}</div> : <span className="text-xs text-slate-500">Not yet routed</span>}</Sec>
    <Sec t="Care gaps"><ul className="space-y-0.5 text-xs"><li>● HbA1c test overdue</li><li>● Statin refill late</li><li>● BP above target</li></ul></Sec>
    <Sec t="Problem list (3)"><div className="text-xs">Type 2 diabetes · Hypertension · Hyperlipidemia</div></Sec>
    <Sec t="Care team & roles"><ul className="space-y-1 text-xs">{[
      ['Sarah', 'Sarah K., RN', 'Lead · care manager'], ['Pharmacy', 'Raj Mehta, PharmD', 'Contributor · Pharmacy'], ['Diabetes', 'Dr. Lee', 'Contributor · Diabetes'], ['Heart', 'Nurse Kim, RN', 'Contributor · Heart'], ['pcp', 'Dr. A. Patel', 'Primary care (view only)'],
    ].filter(([k]) => k === 'Sarah' || k === 'pcp' || programs?.includes(k)).map(([k, n, r]) => (
      <li key={k} className={`rounded-md px-2 py-1 ${k === viewer ? 'bg-brand-50 ring-1 ring-brand-200' : ''}`}><span className="font-medium">{n}</span>{k === viewer && <span className="text-brand-700"> (you)</span>}<div className={r.startsWith('Lead') ? 'text-brand-700' : 'text-slate-500'}>{r}</div></li>))}</ul></Sec>
    <Sec t="Consent"><div className="text-xs">Data sharing across programs ✓</div></Sec>
    {extra}
  </aside>
)
const Sec = ({ t, children }) => <div><div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-brand-600">{t}</div>{children}</div>

export const RecordTabs = ({ active }) => (
  <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3">
    {['Flag review', 'Outreach plan', 'Contact history', 'Care plan', 'Tasks', 'Claims', 'Meds', 'Labs', 'Notes'].map(t => (
      <button key={t} role="tab" aria-selected={t === active} className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm ${t === active ? 'border-brand-600 font-medium text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{t}</button>
    ))}
  </div>
)

const STEPS = ['Flagged', 'Verified', 'Specialists', 'Plan ready', 'Heads-up sent', 'Call booked', 'Done']
export function caseStep(s) {
  if (s.stage === 0) return 0
  if (s.stage === 1) return 2
  if (s.stage === 2) return 3
  if (s.stage === 3) return s.slot ? 5 : 4
  if (s.stage === 4) return s.summary ? 6 : 5
  return 7
}
export function CaseTracker({ s }) {
  const cur = caseStep(s)
  const n = ['Pharmacy', 'Diabetes', 'Heart'].filter(p => s.approved[p]).length
  const next = [
    ['Review the AI flag, set urgency and route Robert to programs.', 'action'],
    null,
    ['Plan ready. Review the merged tasks and approve outreach.', 'action'],
    s.slot ? [`Robert booked a call: ${s.slot}. Prepare from the shared plan.`, 'info'] : ['Heads-up sent. Waiting for Robert to reply.', 'wait'],
    s.summary ? ['Call done. AI summary saved; follow-ups scheduled.', 'info'] : ['On call: work through the checklist, then end the call.', 'action'],
    ['Case complete. Next check-in in 4 weeks.', 'info'],
  ][s.stage] || [`Waiting on specialists (${n}/3 sent). Nothing to do yet.${s.conflict === 'joint' ? ' Heart raised a conflict with Pharmacy; huddle requested.' : ''}`, 'wait']
  const tone = { action: 'bg-brand-600 text-white', wait: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200', info: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' }[next[1]]
  return (
    <div className="space-y-2 border-b border-slate-200 bg-white px-4 py-3">
      <ol aria-label="Case progress" className="flex flex-wrap items-center gap-1 text-xs">
        {STEPS.map((t, i) => (
          <li key={t} className="flex items-center gap-1">
            <span aria-current={i === cur ? 'step' : undefined} className={`rounded-full px-2.5 py-1 font-medium ${i < cur ? 'bg-emerald-50 text-emerald-700' : i === cur ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{i < cur ? '✓ ' : ''}{t}{i === 2 && s.stage >= 1 ? ` ${n}/3` : ''}</span>
            {i < STEPS.length - 1 && <span className="text-slate-300" aria-hidden>›</span>}
          </li>))}
      </ol>
      {s.stage >= 1 && <div className="flex flex-wrap gap-1.5 text-xs">{['Pharmacy', 'Diabetes', 'Heart'].map(p => {
        const st = s.approved[p] ? (p === 'Heart' && s.conflict === 'joint' ? ['⚠ Sent · huddle with Pharmacy', 'bg-amber-50 text-amber-800 ring-amber-200'] : ['✓ Sent', 'bg-emerald-50 text-emerald-700 ring-emerald-200']) : [`In review · ${URG_DUE[s.routing.urgency]}`, 'bg-slate-100 text-slate-600 ring-slate-200']
        return <Pill key={p} cls={st[1]}>{p}: {st[0]}</Pill>
      })}</div>}
      <div className={`rounded-lg px-3 py-2 text-sm ${tone}`}><b className="font-semibold">Next for you:</b> {next[0]}</div>
    </div>
  )
}
const URG_DUE = { Urgent: 'due today', High: 'due in 2 days', Routine: 'due in 5 days' }
export const AccessLine = ({ children }) => <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-1.5 text-xs text-slate-500">🔒 {children} · access logged</div>
