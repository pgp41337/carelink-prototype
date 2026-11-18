import { useState } from 'react'
import { RotateCcw, Stethoscope, UserRound, Smartphone, Clock } from 'lucide-react'
import { SPECIALISTS } from './data.js'
import { TopBar, Card, Btn } from './ui.jsx'
import { SarahFlags, SarahOutreach, SarahCall, SarahWaiting } from './Sarah.jsx'
import { Specialist, MemberApp, Outcomes, extract } from './Others.jsx'

const init = () => ({
  stage: 0,
  routing: { ai: 'Routine', urgency: 'Routine', reason: '', programs: ['Diabetes', 'Heart', 'Pharmacy'], note: '' },
  tasks: { Pharmacy: [], Diabetes: [], Heart: [] }, notes: { Pharmacy: '', Diabetes: '', Heart: '' }, picked: { Pharmacy: [], Diabetes: [], Heart: [] }, talk: { Pharmacy: true, Diabetes: false, Heart: false },
  approved: {}, conflict: null, early: true, slot: null, callDone: {}, handoff: false, summary: false,
})

const RES = "Hold statin reinforcement until the pharmacist's side-effect review, then resume daily"
function stepState(n) {
  const s = init(); s.stage = n
  if (n < 1) return s
  s.routing = { ...s.routing, urgency: 'High', reason: '3 unanswered calls; disengaging', note: 'Mentioned muscle aches on statin at last visit.' }
  if (n < 2) return s
  const picks = { Pharmacy: [0, 1], Diabetes: [0, 1], Heart: [1, 2] }
  for (const p of ['Pharmacy', 'Diabetes', 'Heart']) {
    s.picked[p] = picks[p]
    s.notes[p] = picks[p].map(i => SPECIALISTS[p].sug[i][0] + '.').join(' ') + (p === 'Heart' ? ' ' + RES + '.' : '')
    s.tasks[p] = extract(p, s.notes[p], s.picked[p], s.talk[p]).map(x => p === 'Heart' && x.text.startsWith(RES.slice(0, 30)) ? { ...x, key: 'statin', custom: true, channel: 'Specialist call' } : x)
    s.approved[p] = true
  }
  s.conflict = 'resolved'; s.resolution = RES
  if (n >= 4) s.slot = 'Thu 6:30 pm'
  if (n >= 5) { s.handoff = true; s.summary = true }
  return s
}

const STEPS = [
  ['cm', 'Sarah reviews Robert\'s AI flag', 'Open Robert Hayes, check the evidence, try raising urgency (a reason is required), then Verify & send.'],
  ['spec', 'Specialists review Robert', 'Each specialist sees who referred Robert and what others decided, writes a note (AI suggestions help, AI extracts tasks) and sends to Sarah. Heart gets a conflict flag.'],
  ['cm', 'Sarah gets one merged plan', 'Read the AI summary, ask a specialist if needed, then choose how to reach Robert: call now (recommended) or message to schedule.'],
  ['member', 'Robert gets a heads-up', 'A clear, friendly message from a named contact. Schedule a call.'],
  ['cm', 'One call covers everything', 'Tick the tasks, hand off to the pharmacist, then end the call to see the AI summary.'],
  ['cm', 'Outcome', 'One coordinated contact instead of three separate calls, with credit shared across programs.'],
]
const ROLES = [['cm', 'Care manager · Sarah', UserRound], ['spec', 'Specialists', Stethoscope], ['member', "Robert's app", Smartphone]]

export default function App() {
  const fromHash = () => { const m = /step-(\d)/.exec(window.location.hash); const n = m ? Math.min(5, Math.max(0, +m[1] - 1)) : 0; return n }
  const [s, setS] = useState(() => stepState(fromHash()))
  const [role, setRole] = useState(() => STEPS[fromHash()][0])
  const jump = n => { setS(stepState(n)); setRole(STEPS[n][0]); window.history.replaceState(null, '', '#step-' + (n + 1)) }
  const set = p => setS(x => ({ ...x, ...p }))
  const go = n => { setS(x => ({ ...x, stage: n })); setRole(STEPS[n][0]); window.history.replaceState(null, '', '#step-' + (n + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const reset = () => { setS(init()); setRole('cm'); window.history.replaceState(null, '', '#step-1') }
  const [, title, hint] = STEPS[s.stage]

  let view
  if (role === 'spec') view = <Specialist s={s} set={set} go={go} />
  else if (role === 'member') view = <MemberApp s={s} set={set} go={go} />
  else if (s.stage === 0) view = <SarahFlags s={s} set={set} go={go} />
  else if (s.stage === 1) view = <SarahWaiting s={s} />
  else if (s.stage <= 3) view = <SarahOutreach s={s} go={go} set={set} />
  else if (s.stage === 4) view = <SarahCall s={s} set={set} go={go} />
  else view = <Outcomes reset={reset} />

  return (
    <div className="min-h-screen">
      <div className="bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <nav aria-label="Jump to step" className="flex items-center gap-1">{STEPS.map((st, i) => (
            <button key={i} onClick={() => jump(i)} title={`Step ${i + 1}: ${st[1]}`} aria-current={i === s.stage ? 'step' : undefined} className={`grid h-7 w-7 place-items-center rounded-full text-sm font-bold ${i === s.stage ? 'bg-brand-600 text-white' : i < s.stage ? 'bg-brand-100 text-brand-700 hover:bg-brand-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{i + 1}</button>))}</nav>
          <div className="min-w-0 flex-1"><div className="font-display font-bold text-brand-900">{title}</div><div className="text-sm text-slate-600">{hint}</div></div>
          <Btn onClick={reset}><RotateCcw className="h-4 w-4" />Restart</Btn>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Switch view">
          {ROLES.map(([id, label, I]) => (
            <button key={id} role="tab" aria-selected={role === id} onClick={() => setRole(id)} className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${role === id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <I className="h-4 w-4" aria-hidden />{label}
              {STEPS[s.stage][0] === id && role !== id && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-cyan-accent ring-2 ring-white" aria-label="action needed" />}
            </button>))}
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] p-3 sm:p-5">
        <div className="overflow-hidden rounded-2xl bg-slate-50 shadow-sm ring-1 ring-slate-200">
          {role !== 'member' && <TopBar user={role === 'spec' ? 'Specialist workspace' : 'Sarah K., RN · Care manager'} />}
          {view}
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">CareLink · concept prototype for the "One Member, Many Programs" case study · all names and data are fictional</p>
      </div>
    </div>
  )
}
