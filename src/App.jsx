import { useState } from 'react'
import { RotateCcw, Stethoscope, UserRound, Smartphone, Clock } from 'lucide-react'
import { SPECIALISTS } from './data.js'
import { TopBar, Card, Btn } from './ui.jsx'
import { SarahFlags, SarahOutreach, SarahCall, SarahWaiting } from './Sarah.jsx'
import { Specialist, MemberApp, Outcomes } from './Others.jsx'

const init = () => ({
  stage: 0,
  routing: { ai: 'Routine', urgency: 'Routine', reason: '', programs: ['Diabetes', 'Heart', 'Pharmacy'], note: '' },
  tasks: { Pharmacy: [], Diabetes: [], Heart: [] }, notes: { Pharmacy: '', Diabetes: '', Heart: '' }, picked: { Pharmacy: [], Diabetes: [], Heart: [] }, talk: { Pharmacy: true, Diabetes: false, Heart: false },
  approved: {}, conflict: null, slot: null, callDone: {}, handoff: false, summary: false,
})

const STEPS = [
  ['cm', 'Sarah reviews Robert\'s AI flag', 'Open Robert Hayes, check the evidence, try raising urgency (a reason is required), then Verify & send.'],
  ['spec', 'Specialists review Robert', 'Each specialist sees who referred Robert and what others decided, writes a note (AI suggestions help, AI extracts tasks) and sends to Sarah. Heart gets a conflict flag.'],
  ['cm', 'Sarah gets one merged plan', 'Duplicates are merged. Review the AI recommendation and approve outreach.'],
  ['member', 'Robert gets a heads-up', 'A clear, friendly message from a named contact. Schedule a call.'],
  ['cm', 'One call covers everything', 'Tick the tasks, hand off to the pharmacist, then end the call to see the AI summary.'],
  ['cm', 'Outcome', 'One coordinated contact instead of three separate calls, with credit shared across programs.'],
]
const ROLES = [['cm', 'Care manager · Sarah', UserRound], ['spec', 'Specialists', Stethoscope], ['member', "Robert's app", Smartphone]]

export default function App() {
  const [s, setS] = useState(init)
  const [role, setRole] = useState('cm')
  const set = p => setS(x => ({ ...x, ...p }))
  const go = n => { setS(x => ({ ...x, stage: n })); setRole(STEPS[n][0]); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const reset = () => { setS(init()); setRole('cm') }
  const [, title, hint] = STEPS[s.stage]

  let view
  if (role === 'spec') view = <Specialist s={s} set={set} go={go} />
  else if (role === 'member') view = <MemberApp s={s} set={set} go={go} />
  else if (s.stage === 0) view = <SarahFlags s={s} set={set} go={go} />
  else if (s.stage === 1) view = <SarahWaiting s={s} />
  else if (s.stage <= 3) view = <SarahOutreach s={s} go={go} />
  else if (s.stage === 4) view = <SarahCall s={s} set={set} go={go} />
  else view = <Outcomes reset={reset} />

  return (
    <div className="min-h-screen">
      <div className="bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">{s.stage + 1}</span><span className="text-xs text-slate-500">of 6</span></div>
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
