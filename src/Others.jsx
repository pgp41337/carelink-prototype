import { useState } from 'react'
import { Sparkles, CheckCircle2, MessageSquare, Phone, CalendarCheck, ShieldCheck, ArrowRight, AlertTriangle, Send } from 'lucide-react'
import { SPECIALISTS, URGENCY, MERGE, OWN_CASES, EVIDENCE, HISTORY } from './data.js'
import { Pill, ProgramPill, Btn, Card, SideNav, MemberSidebar, RecordTabs } from './ui.jsx'
import { WorkspaceTabs } from './Sarah.jsx'

const CHANNELS = ['Call', 'Text', 'App', 'Specialist call']

export function Specialist({ s, set, go }) {
  const [prog, setProg] = useState('Pharmacy')
  const [tab, setTab] = useState('list')
  const [conflictOpen, setConflictOpen] = useState(false)
  const sent = s.stage >= 1
  const sp = SPECIALISTS[prog]
  const tasks = s.tasks[prog]
  const done = s.approved[prog]
  const r = s.routing
  const editTask = (i, patch) => set({ tasks: { ...s.tasks, [prog]: tasks.map((t, j) => j === i ? { ...t, ...patch } : t) } })
  const addTask = () => set({ tasks: { ...s.tasks, [prog]: [...tasks, { text: '', channel: 'Call', on: true }] } })
  const hasConflict = prog === 'Heart' && s.approved.Pharmacy && tasks.some(t => t.on && t.key === 'statin-conflict') && !s.conflict
  const finish = extra => {
    const a = { ...s.approved, [prog]: true }
    set({ approved: a, ...extra }); setConflictOpen(false)
    const next = ['Pharmacy', 'Diabetes', 'Heart'].find(p => !a[p])
    if (next) { setProg(next); setTab('list') } else go(2)
  }
  const send = () => hasConflict ? setConflictOpen(true) : finish({})
  const resolve = mode => {
    if (mode === 'combine') finish({ conflict: 'resolved', tasks: { ...s.tasks, Heart: tasks.map(t => t.key === 'statin-conflict' ? { ...t, key: 'statin' } : t) } })
    else finish({ conflict: 'joint' })
  }
  const status = p => s.approved[p] ? ['Sent to Sarah', 'bg-emerald-50 text-emerald-700 ring-emerald-200'] : p === prog ? ['In review (you)', 'bg-brand-50 text-brand-700 ring-brand-200'] : ['In review', 'bg-slate-100 text-slate-600 ring-slate-200']
  return (
    <div className="flex">
      <SideNav />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 text-sm">
          <span className="text-slate-500">Demo: view as</span>
          {['Pharmacy', 'Diabetes', 'Heart'].map(p => (
            <button key={p} onClick={() => { setProg(p); setTab('list') }} aria-pressed={prog === p} className={`rounded-full px-3 py-1 ${prog === p ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{SPECIALISTS[p].who} · {p}{sent && s.approved[p] ? ' ✓' : ''}</button>))}
        </div>
        <WorkspaceTabs tabs={sent ? [['list', `My worklist · ${prog} (3)`], ['rec', 'Hayes, Robert']] : [['list', `My worklist · ${prog} (2)`]]} active={tab} onPick={setTab} />
        {tab === 'list' ? (
          <div className="p-4">
            <h2 className="mb-1 font-display text-xl font-bold text-brand-900">{prog} worklist</h2>
            <p className="mb-3 text-sm text-slate-600">Your own program cases plus referrals from care managers.</p>
            <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200">
              <table className="w-full text-sm"><thead><tr className="border-b border-slate-200 text-left text-xs text-slate-500">{['Member', 'Source', 'Reason', 'Urgency', 'Due', 'Status'].map(h => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr></thead>
                <tbody>
                  {sent && <tr className="border-b border-slate-100 bg-brand-50/60">
                    <td className="px-3 py-2.5"><button onClick={() => setTab('rec')} className="flex items-center gap-2 font-medium text-brand-700 underline decoration-brand-200 underline-offset-2"><img src="./robert.jpg" alt="" className="h-7 w-7 rounded-full object-cover" />Robert Hayes</button></td>
                    <td className="px-3 py-2.5"><Pill cls="bg-cyan-soft text-cyan-800 ring-cyan-200">From Sarah K. · care manager</Pill></td>
                    <td className="px-3 py-2.5">Multi-program referral (3 programs)</td>
                    <td className="px-3 py-2.5"><Pill cls={URGENCY[r.urgency].cls}>{r.urgency}</Pill></td>
                    <td className="px-3 py-2.5 text-slate-600">{URGENCY[r.urgency].due.replace('Review ', '')}</td>
                    <td className="px-3 py-2.5"><Pill cls={status(prog)[1]}>{done ? 'Sent to Sarah' : 'To review'}</Pill></td></tr>}
                  {OWN_CASES[prog].map(([n, why, u]) => <tr key={n} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2.5">{n}</td><td className="px-3 py-2.5"><Pill>{prog} program</Pill></td><td className="px-3 py-2.5">{why}</td>
                    <td className="px-3 py-2.5"><Pill cls={URGENCY[u].cls}>{u}</Pill></td><td className="px-3 py-2.5 text-slate-600">{URGENCY[u].due.replace('Review ', '')}</td><td className="px-3 py-2.5"><Pill>Open</Pill></td></tr>)}
                </tbody></table>
            </div>
            {!sent ? <p className="mt-2 text-xs text-slate-500">Robert appears here once Sarah verifies and routes his flag.</p> : !done && <p className="mt-2 text-xs text-slate-500">Tip: open Robert Hayes to continue the demo.</p>}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">
            <MemberSidebar programs={r.programs} />
            <div className="min-w-0 flex-1">
              <RecordTabs active="Flag review" />
              <div className="grid gap-4 p-4 xl:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                  <div className="rounded-xl bg-cyan-soft p-3 text-sm text-cyan-900 ring-1 ring-cyan-200">
                    <div className="flex flex-wrap items-center gap-2"><b className="font-semibold">Referral from Sarah K., RN · care manager</b><span className="text-xs text-cyan-800">Today 10:42 am</span><Pill cls={URGENCY[r.urgency].cls}>{r.urgency} · {URGENCY[r.urgency].due}</Pill></div>
                    {r.urgency !== r.ai && <div className="mt-1 text-xs">Urgency raised from AI's {r.ai}: "{r.reason}"</div>}
                    <div className="mt-1">{r.note ? <>Note: "{r.note}"</> : <span className="text-cyan-800">No note added.</span>}</div>
                  </div>
                  <Card title={<span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand-600" />Why AI flagged Robert</span>} action={<span className="text-xs text-slate-500">Model v2.3</span>}>
                    <ul className="space-y-1.5 text-sm">{EVIDENCE.map(([src, txt]) => <li key={src} className="rounded-lg bg-slate-50 p-2"><span className="text-xs text-slate-500">{src}</span><div>{txt}</div></li>)}</ul>
                  </Card>
                  <Card title="Shared plan: what other programs decided" action={<span className="text-xs text-slate-500">Visible to the care team</span>}>
                    <ul className="space-y-2 text-sm">{['Pharmacy', 'Diabetes', 'Heart'].filter(p => p !== prog).map(p => (
                      <li key={p} className="rounded-lg bg-slate-50 p-2.5">
                        <div className="flex items-center gap-2"><ProgramPill p={p} /><span className="flex-1 text-slate-600">{SPECIALISTS[p].who}</span><Pill cls={status(p)[1]}>{status(p)[0]}</Pill></div>
                        {s.approved[p] ? (<>
                          <ul className="mt-1.5 space-y-0.5 text-xs">{s.tasks[p].filter(x => x.on).map(x => <li key={x.text}>• {x.text} <span className="text-slate-500">({x.channel})</span></li>)}</ul>
                          <p className="mt-1 text-xs text-slate-600">"{s.comments[p]}"</p></>)
                          : <p className="mt-1 text-xs text-slate-500">Not submitted yet.</p>}
                      </li>))}
                      <li className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 p-2.5 text-xs text-slate-500"><ShieldCheck className="h-4 w-4" aria-hidden />Behavioral health: details restricted (member consent required)</li>
                    </ul>
                  </Card>
                  <Card title="Contact history (all teams)">
                    {HISTORY.map(([g, rows]) => (<div key={g} className="mb-2"><div className="mb-1 text-xs font-semibold text-brand-600">{g}</div>
                      {rows.map(rw => <div key={rw[0] + rw[2]} className="grid grid-cols-4 gap-2 border-b border-slate-100 py-1.5 text-sm last:border-0"><span className="text-slate-500">{rw[0]}</span><span>{rw[1]}</span><span>{rw[2]}</span><span className="text-slate-600">{rw[3]}</span></div>)}</div>))}
                  </Card>
                </div>
                <Card title={<span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand-600" />AI-suggested next steps · {prog}</span>} action={done && <Pill cls="bg-emerald-50 text-emerald-700 ring-emerald-200">Sent</Pill>}>
                  <p className="mb-2 text-xs text-slate-500">Based on evidence, history and Sarah's note. Include, edit or add.</p>
                  <ul className="space-y-2">{tasks.map((t, i) => (
                    <li key={i} className={`rounded-lg p-2 ${t.key === 'statin-conflict' && s.approved.Pharmacy && !s.conflict ? 'bg-red-50 ring-1 ring-red-200' : 'bg-slate-50'}`}>
                      <div className="flex items-center gap-2"><input type="checkbox" aria-label="Include" className="accent-brand-600" checked={t.on} disabled={done} onChange={e => editTask(i, { on: e.target.checked })} />
                        <input aria-label="Task" value={t.text} disabled={done} placeholder="New task" onChange={e => editTask(i, { text: e.target.value })} className="min-w-0 flex-1 rounded-md bg-white px-2 py-1 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-500 disabled:bg-transparent disabled:ring-0" /></div>
                      <div className="mt-1.5 flex items-center gap-2 pl-6"><select aria-label="Channel" value={t.channel} disabled={done} onChange={e => editTask(i, { channel: e.target.value })} className="rounded-md bg-white px-2 py-0.5 text-xs ring-1 ring-slate-200">{CHANNELS.map(c => <option key={c}>{c}</option>)}</select>
                        {t.key === 'statin-conflict' && s.approved.Pharmacy && !s.conflict && <span className="text-xs text-red-700">May conflict with Pharmacy</span>}</div>
                    </li>))}</ul>
                  {!done && <button onClick={addTask} className="mt-2 text-sm font-medium text-brand-600">+ Add task</button>}
                  <label className="mt-3 block text-xs font-semibold text-slate-600">Clinical comment for Sarah
                    <textarea rows={3} disabled={done} value={s.comments[prog]} onChange={e => set({ comments: { ...s.comments, [prog]: e.target.value } })} className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-sm font-normal ring-1 ring-slate-300 outline-none focus:ring-brand-500" /></label>
                  {conflictOpen && (
                    <div role="alertdialog" aria-label="Conflict detected" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-900 ring-1 ring-red-200">
                      <div className="flex items-center gap-1.5 font-semibold"><AlertTriangle className="h-4 w-4" />AI found a conflict with Pharmacy</div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-lg bg-white p-2 text-xs"><ProgramPill p="Heart" /><div className="mt-1">Reinforce daily statin use</div></div>
                        <div className="rounded-lg bg-white p-2 text-xs"><ProgramPill p="Pharmacy" /><div className="mt-1">Review possible statin side effects first</div></div>
                      </div>
                      <div className="mt-2 rounded-lg bg-white p-2 text-xs"><b className="font-medium">AI-proposed combined step:</b> {MERGE.statin}</div>
                      <div className="mt-2 flex flex-wrap gap-2"><Btn primary onClick={() => resolve('combine')}>Accept combined step</Btn><Btn onClick={() => resolve('joint')}>Request joint review</Btn></div>
                    </div>)}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Btn primary disabled={done || conflictOpen} onClick={send}><Send className="h-4 w-4" />{done ? 'Sent to Sarah' : 'Send to Sarah for review'}</Btn>
                    <Btn title="Return to Sarah without taking on the case">Decline referral</Btn>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
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
