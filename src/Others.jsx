import { useState } from 'react'
import { Sparkles, CheckCircle2, MessageSquare, Phone, CalendarCheck, ShieldCheck, ArrowRight } from 'lucide-react'
import { SPECIALISTS, URGENCY } from './data.js'
import { Pill, ProgramPill, Btn, Card, SideNav, MemberSidebar, RecordTabs } from './ui.jsx'

const CHANNELS = ['Call', 'Text', 'App', 'Specialist call']

export function Specialist({ s, set, go }) {
  const [prog, setProg] = useState('Pharmacy')
  const sent = s.stage >= 1
  const sp = SPECIALISTS[prog]
  const tasks = s.tasks[prog]
  const approved = s.approved[prog]
  const editTask = (i, patch) => set({ tasks: { ...s.tasks, [prog]: tasks.map((t, j) => j === i ? { ...t, ...patch } : t) } })
  const approve = () => {
    const a = { ...s.approved, [prog]: true }
    set({ approved: a })
    const next = Object.keys(SPECIALISTS).find(p => !a[p])
    if (next) setProg(next); else go(2)
  }
  return (
    <div className="flex">
      <SideNav active="Worklists" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-brand-50 px-4 py-2">
          <span className="text-sm text-brand-700">Signed in as specialist:</span>
          {Object.keys(SPECIALISTS).map(p => (
            <button key={p} onClick={() => setProg(p)} aria-pressed={prog === p} className={`rounded-full px-3 py-1 text-sm ${prog === p ? 'bg-white font-medium text-brand-900 ring-1 ring-brand-200' : 'text-brand-700'}`}>{p}{sent && (s.approved[p] ? ' ✓' : ' •')}</button>))}
        </div>
        <div className="grid gap-4 p-4 lg:grid-cols-[280px_1fr]">
          <Card title={`${prog} referrals`}>
            <ul className="space-y-2 text-sm">
              {sent && <li className={`rounded-lg p-2.5 ring-1 ${approved ? 'bg-slate-50 ring-slate-200' : 'bg-brand-50 ring-brand-200'}`}>
                <div className="flex items-center justify-between gap-2"><b className="font-medium">Robert Hayes</b><Pill cls={URGENCY[s.routing.urgency].cls}>{s.routing.urgency}</Pill></div>
                <div className="text-xs text-slate-500">{approved ? 'Tasks approved' : URGENCY[s.routing.urgency].due} · from Sarah K.</div></li>}
              <li className="rounded-lg bg-slate-50 p-2.5"><div className="flex justify-between"><span>Ana Ruiz</span><Pill cls={URGENCY.Routine.cls}>Routine</Pill></div><div className="text-xs text-slate-500">Review within 5 days</div></li>
              <li className="rounded-lg bg-slate-50 p-2.5"><div className="flex justify-between"><span>Tom Becker</span><Pill cls={URGENCY.Routine.cls}>Routine</Pill></div><div className="text-xs text-slate-500">Review within 5 days</div></li>
            </ul>
          </Card>
          {!sent ? <Card><p className="text-sm text-slate-500">No new referrals for Robert yet. Sarah must verify and route his flag first.</p></Card> : (
            <div className="space-y-4">
              {(s.routing.note || s.routing.urgency !== s.routing.ai) && <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
                {s.routing.note && <div><b className="font-medium">From Sarah K. (care manager):</b> {s.routing.note}</div>}
                {s.routing.urgency !== s.routing.ai && <div className="mt-1 text-xs">Urgency raised by Sarah from {s.routing.ai} to {s.routing.urgency}: {s.routing.reason}</div>}
              </div>}
              <Card title={<span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand-600" />AI-suggested tasks for Robert · {prog}</span>} action={approved && <Pill cls="bg-emerald-50 text-emerald-700 ring-emerald-200">Approved</Pill>}>
                <p className="mb-3 text-sm text-slate-600"><b className="font-medium text-ink">{sp.who}:</b> {sp.comment}</p>
                <ul className="space-y-2">{tasks.map((t, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-2.5">
                    <input type="checkbox" aria-label="Include task" className="accent-brand-600" checked={t.on} disabled={approved} onChange={e => editTask(i, { on: e.target.checked })} />
                    <input aria-label="Task" value={t.text} disabled={approved} onChange={e => editTask(i, { text: e.target.value })} className="min-w-[180px] flex-1 rounded-md bg-white px-2 py-1 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-500 disabled:bg-transparent disabled:ring-0" />
                    <select aria-label="Channel" value={t.channel} disabled={approved} onChange={e => editTask(i, { channel: e.target.value })} className="rounded-md bg-white px-2 py-1 text-sm ring-1 ring-slate-200">{CHANNELS.map(c => <option key={c}>{c}</option>)}</select>
                  </li>))}</ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Btn primary disabled={approved} onClick={approve}><CheckCircle2 className="h-4 w-4" />{approved ? 'Approved' : 'Approve tasks'}</Btn><Btn>Add task</Btn><Btn>Message Sarah</Btn>
                </div>
              </Card>
            </div>)}
        </div>
      </div>
    </div>
  )
}

export function MemberApp({ s, set, go }) {
  const [view, setView] = useState('home')
  const slots = ['Thu 6:30 pm', 'Thu 7:15 pm', 'Fri 6:00 pm']
  const active = s.stage >= 3
  return (
    <div className="flex justify-center p-6">
      <div className="w-[340px] rounded-[2.2rem] bg-ink p-3 shadow-xl">
        <div className="min-h-[600px] overflow-hidden rounded-[1.7rem] bg-slate-50">
          <div className="bg-brand-700 px-5 pb-5 pt-6 text-white">
            <div className="flex items-center gap-3"><img src="./robert.jpg" alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-white/40" /><div><div className="text-xs text-brand-100">Good evening</div><div className="font-display text-xl font-bold">Robert</div></div><img src="./icon.png" alt="CareLink" className="ml-auto h-8 w-8 rounded-lg bg-white p-1" /></div>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/10 p-2.5 text-sm"><div className="grid h-8 w-8 place-items-center rounded-full bg-cyan-accent text-xs font-bold">SK</div><div><div className="font-medium">Sarah K., RN</div><div className="text-xs text-brand-100">Your care manager</div></div></div>
          </div>
          <div className="space-y-3 p-4 text-sm">
            {!active && <p className="rounded-xl bg-white p-4 text-slate-500 ring-1 ring-slate-200">No new messages from your care team.</p>}
            {active && !s.slot && view === 'home' && (<>
              <div className="rounded-xl bg-white p-4 ring-1 ring-brand-200">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-brand-600"><ShieldCheck className="h-3.5 w-3.5" />From your care team</div>
                <p>Hi Robert, I'm Sarah, your care manager. I'd like to help with your <b className="font-medium">statin refill</b>, an <b className="font-medium">overdue blood test</b> and your <b className="font-medium">blood pressure</b>, all in one short call.</p>
                <p className="mt-2 text-xs text-slate-500">This service is free and doesn't affect your coverage or claims.</p>
              </div>
              <button onClick={() => setView('slots')} className="flex w-full items-center gap-2 rounded-xl bg-brand-600 p-3 font-medium text-white"><CalendarCheck className="h-4 w-4" />Schedule a call<ArrowRight className="ml-auto h-4 w-4" /></button>
              <button className="flex w-full items-center gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200"><MessageSquare className="h-4 w-4 text-brand-600" />Message Sarah</button>
              <button className="flex w-full items-center gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200"><CheckCircle2 className="h-4 w-4 text-brand-600" />Do it myself (refill, book test)</button>
            </>)}
            {active && !s.slot && view === 'slots' && (<>
              <div className="font-display font-bold">Pick a time that suits you</div>
              {slots.map(t => <button key={t} onClick={() => set({ slot: t })} className="w-full rounded-xl bg-white p-3 text-left ring-1 ring-slate-200 hover:ring-brand-500">{t} · 15 min call with Sarah</button>)}
              <button onClick={() => setView('home')} className="text-xs text-slate-500 underline">Back</button>
            </>)}
            {s.slot && (<>
              <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800 ring-1 ring-emerald-200"><div className="font-medium">Call booked ✓</div><div>{s.slot} with Sarah. We'll text you a reminder.</div></div>
              <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200"><div className="mb-1 text-xs font-medium text-slate-500">Your to-dos</div><div>• Refill atorvastatin <span className="text-xs text-brand-600">(reminder sent)</span></div><div>• HbA1c blood test</div><div>• Log your BP daily</div></div>
              {s.stage === 3 && <Btn primary className="w-full justify-center" onClick={() => go(4)}><Phone className="h-4 w-4" />Continue: Sarah calls Robert</Btn>}
            </>)}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Outcomes({ reset }) {
  const rows = [['Calls to Robert', '3 separate, unanswered', '1 coordinated, completed'], ['Health assessments', '3 repeated', '1 shared'], ['Teams he hears from', '3', '1 familiar contact'], ['Care gaps addressed', '0 of 3', '3 of 3 in progress'], ['Diet advice', '2 different messages', '1 aligned plan']]
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h2 className="font-display text-2xl font-bold text-brand-900">Robert's month: before vs with CareLink</h2>
      <p className="mt-1 text-sm text-slate-600">Outcome measured per member. Credit is shared across every program that contributed.</p>
      <div className="mt-4 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
        <table className="w-full text-sm"><thead><tr className="bg-slate-50 text-left text-xs text-slate-500"><th className="px-4 py-2.5 font-medium">Measure</th><th className="px-4 py-2.5 font-medium">Before</th><th className="px-4 py-2.5 font-medium text-brand-700">With CareLink</th></tr></thead>
          <tbody>{rows.map(r => <tr key={r[0]} className="border-t border-slate-100"><td className="px-4 py-2.5 font-medium">{r[0]}</td><td className="px-4 py-2.5 text-slate-500">{r[1]}</td><td className="px-4 py-2.5 font-medium text-brand-700">{r[2]}</td></tr>)}</tbody></table>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">{['Diabetes', 'Heart', 'Pharmacy'].map(p => (
        <div key={p} className="rounded-xl bg-white p-4 ring-1 ring-slate-200"><ProgramPill p={p} /><div className="mt-2 text-sm text-slate-600">Credited for Robert's outcome</div></div>))}</div>
      <p className="mt-4 text-sm text-slate-600">Capacity freed from Robert's duplicate calls goes to under-reached members like Linda, now first on Sarah's worklist.</p>
      <Btn className="mt-4" onClick={reset}>Restart demo</Btn>
    </div>
  )
}

export { MemberSidebar, RecordTabs }
