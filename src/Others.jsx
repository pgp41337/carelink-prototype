import { useState } from 'react'
import { Sparkles, CheckCircle2, MessageSquare, Phone, CalendarCheck, ShieldCheck, ArrowRight, AlertTriangle, Send } from 'lucide-react'
import { SPECIALISTS, URGENCY, MERGE, OWN_CASES, EVIDENCE, HISTORY } from './data.js'
import { Pill, ProgramPill, Btn, Card, SideNav, MemberSidebar, RecordTabs, AccessLine, CaseTracker } from './ui.jsx'
import { WorkspaceTabs } from './Sarah.jsx'


export const extract = (prog, note, picked, talk) => {
  const sp = SPECIALISTS[prog]
  const out = picked.map(i => ({ text: sp.sug[i][0], key: sp.sug[i][1], channel: sp.sug[i][2], on: true }))
  note.split(/(?<=[.!?])\s+/).map(x => x.trim().replace(/[.!?]$/, '')).filter(x => x.length > 8 && !out.some(o => x.includes(o.text) || o.text.includes(x)))
    .forEach(x => out.push({ text: x.length > 90 ? x.slice(0, 87) + '…' : x, channel: 'Call', on: true }))
  if (talk) out.push({ text: `${sp.first} to speak with Robert directly`, channel: 'Specialist call', on: true })
  return out
}

export function Specialist({ s, set, go }) {
  const [prog, setProg] = useState('Pharmacy')
  const [tab, setTab] = useState('list')
  const [err, setErr] = useState('')
  const [noMode, setNoMode] = useState(false)
  const [resText, setResText] = useState('')
  const sent = s.stage >= 1
  const sp = SPECIALISTS[prog]
  const done = s.approved[prog]
  const r = s.routing
  const note = s.notes[prog], picked = s.picked[prog], talk = s.talk[prog]
  const tasks = extract(prog, note, picked, talk)
  const conflictLive = prog === 'Heart' && s.approved.Pharmacy && picked.includes(0) && s.conflict !== 'resolved'
  const pick = i => {
    if (picked.includes(i) || done) return
    setErr('')
    set({ picked: { ...s.picked, [prog]: [...picked, i] }, notes: { ...s.notes, [prog]: (note ? note.trim() + ' ' : '') + sp.sug[i][0] + '.' } })
  }
  const resolveNo = () => {
    if (!resText.trim()) return setErr('Say how you will address the pharmacist\'s concern.')
    const res = resText.trim().replace(/[.]$/, '')
    const base = note.replace(SPECIALISTS.Heart.sug[0][0] + '.', '').replace(/\s+/g, ' ').trim()
    set({ conflict: 'resolved', resolution: res, notes: { ...s.notes, Heart: (base ? base + ' ' : '') + res + '.' }, picked: { ...s.picked, Heart: picked.filter(i => i !== 0) } })
    setNoMode(false); setErr('')
  }
  const send = () => {
    if (!note.trim()) return setErr('Write a short clinical note first (or add a suggestion).')
    if (conflictLive && !s.conflict) return setErr('Respond to the AI conflict flag first.')
    let list = tasks
    if (prog === 'Heart' && s.conflict === 'resolved') list = list.map(x => s.resolution && x.text.startsWith(s.resolution.slice(0, 30)) ? { ...x, key: 'statin', custom: true, channel: 'Specialist call' } : x)
    const a = { ...s.approved, [prog]: true }
    set({ approved: a, tasks: { ...s.tasks, [prog]: list } })
    const next = ['Pharmacy', 'Diabetes', 'Heart'].find(p => !a[p])
    if (next) { setProg(next); setTab('list') } else go(2)
  }
  const status = p => s.approved[p] ? ['Sent to Sarah', 'bg-emerald-50 text-emerald-700 ring-emerald-200'] : p === prog ? ['In review (you)', 'bg-brand-50 text-brand-700 ring-brand-200'] : ['In review', 'bg-slate-100 text-slate-600 ring-slate-200']
  return (
    <div className="flex">
      <SideNav />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 text-sm">
          <span className="text-slate-500">Demo: view as</span>
          {['Pharmacy', 'Diabetes', 'Heart'].map(p => (
            <button key={p} onClick={() => { setProg(p); setTab('list'); setErr('') }} aria-pressed={prog === p} className={`rounded-full px-3 py-1 ${prog === p ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{SPECIALISTS[p].who} · {p}{sent && s.approved[p] ? ' ✓' : ''}</button>))}
        </div>
        <WorkspaceTabs tabs={sent ? [['list', `My worklist · ${prog} (3)`], ['rec', 'Hayes, Robert']] : [['list', `My worklist · ${prog} (2)`]]} active={tab} onPick={setTab} />
        {tab === 'list' ? (
          <div className="p-4">
            <h2 className="mb-1 font-display text-xl font-bold text-brand-900">{prog} worklist</h2>
            <p className="mb-3 text-sm text-slate-600">Your own program cases plus referrals from care managers.</p>
            <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200">
              <table className="w-full text-sm"><thead><tr className="border-b border-slate-200 text-left text-xs text-slate-500">{['Member', 'Your role', 'Source', 'Reason', 'Urgency', 'Due', 'Status'].map(h => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr></thead>
                <tbody>
                  {sent && <tr className="border-b border-slate-100 bg-brand-50/60">
                    <td className="px-3 py-2.5"><button onClick={() => setTab('rec')} className="flex items-center gap-2 font-medium text-brand-700 underline decoration-brand-200 underline-offset-2"><img src="./robert.jpg" alt="" className="h-7 w-7 rounded-full object-cover" />Robert Hayes</button></td>
                    <td className="px-3 py-2.5"><Pill cls="bg-slate-100 text-slate-700 ring-slate-300">Contributor</Pill><div className="mt-0.5 text-xs text-slate-500">Lead: Sarah K.</div></td>
                    <td className="px-3 py-2.5"><Pill cls="bg-cyan-soft text-cyan-800 ring-cyan-200">From Sarah K. · care manager</Pill></td>
                    <td className="px-3 py-2.5">Multi-program referral (3 programs)</td>
                    <td className="px-3 py-2.5"><Pill cls={URGENCY[r.urgency].cls}>{r.urgency}</Pill></td>
                    <td className="px-3 py-2.5 text-slate-600">{URGENCY[r.urgency].due.replace('Review ', '')}</td>
                    <td className="px-3 py-2.5"><Pill cls={status(prog)[1]}>{done ? 'Sent to Sarah' : 'To review'}</Pill></td></tr>}
                  {OWN_CASES[prog].map(([n, why, u]) => <tr key={n} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2.5">{n}</td><td className="px-3 py-2.5"><Pill cls="bg-brand-50 text-brand-700 ring-brand-200">Lead</Pill><div className="mt-0.5 text-xs text-slate-500">Single program</div></td><td className="px-3 py-2.5"><Pill>{prog} program</Pill></td><td className="px-3 py-2.5">{why}</td>
                    <td className="px-3 py-2.5"><Pill cls={URGENCY[u].cls}>{u}</Pill></td><td className="px-3 py-2.5 text-slate-600">{URGENCY[u].due.replace('Review ', '')}</td><td className="px-3 py-2.5"><Pill>Open</Pill></td></tr>)}
                </tbody></table>
            </div>
            {!sent ? <p className="mt-2 text-xs text-slate-500">Robert appears here once Sarah verifies and routes his flag.</p> : !done && <p className="mt-2 text-xs text-slate-500">Tip: open Robert Hayes to continue the demo.</p>}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">
            <MemberSidebar programs={r.programs} viewer={prog} />
            <div className="min-w-0 flex-1">
              <RecordTabs active="Flag review" />
              <AccessLine>Viewing as {prog} specialist · contributor on this case (Sarah K. leads outreach)</AccessLine>
              <CaseTracker s={s} />
              <div className="grid gap-4 p-4 xl:grid-cols-[1fr_380px]">
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
                        {s.approved[p] ? <p className="mt-1.5 text-xs text-slate-700">"{s.notes[p]}"{s.talk[p] && <span className="text-brand-700"> · Wants to speak with Robert</span>}</p> : <p className="mt-1 text-xs text-slate-500">Not submitted yet.</p>}
                      </li>))}
                      <li className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-slate-300 p-2.5 text-xs text-slate-500"><ShieldCheck className="h-4 w-4" aria-hidden /><span className="flex-1">Behavioral health: details restricted (member consent required)</span><button className="rounded-md px-2 py-1 font-medium text-brand-600 ring-1 ring-brand-200" title="Emergency access needs a reason and is reviewed">Request access…</button></li>
                    </ul>
                  </Card>
                  <Card title="Contact history (all teams)">
                    {HISTORY.map(([g, rows]) => (<div key={g} className="mb-2"><div className="mb-1 text-xs font-semibold text-brand-600">{g}</div>
                      {rows.map(rw => <div key={rw[0] + rw[2]} className="grid grid-cols-4 gap-2 border-b border-slate-100 py-1.5 text-sm last:border-0"><span className="text-slate-500">{rw[0]}</span><span>{rw[1]}</span><span>{rw[2]}</span><span className="text-slate-600">{rw[3]}</span></div>)}</div>))}
                  </Card>
                </div>
                <Card title={`Your review · ${prog}`} action={done && <Pill cls="bg-emerald-50 text-emerald-700 ring-emerald-200">Sent</Pill>}>
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600"><Sparkles className="h-3.5 w-3.5 text-brand-600" />AI suggestions <span className="font-normal text-slate-500">(tap to add to your note)</span></div>
                  <div className="flex flex-wrap gap-1.5">{sp.sug.map(([txt], i) => (
                    <button key={i} disabled={done || picked.includes(i) || (prog === 'Heart' && i === 0 && s.conflict === 'resolved')} onClick={() => pick(i)} className={`rounded-full px-3 py-1 text-left text-xs ring-1 ${picked.includes(i) ? 'bg-brand-50 text-brand-700 ring-brand-200' : 'bg-white text-slate-700 ring-slate-300 hover:ring-brand-500'}`}>{picked.includes(i) ? '✓ ' : '+ '}{txt}</button>))}</div>
                  <label className="mt-3 block text-xs font-semibold text-slate-600">Clinical note for Sarah
                    <textarea rows={5} disabled={done} value={note} placeholder="Write your assessment and what Robert needs. AI turns it into tasks for the care manager." onChange={e => { setErr(''); set({ notes: { ...s.notes, [prog]: e.target.value } }) }} className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-sm font-normal ring-1 ring-slate-300 outline-none focus:ring-brand-500" /></label>
                  <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand-600" disabled={done} checked={talk} onChange={e => set({ talk: { ...s.talk, [prog]: e.target.checked } })} />I'd like to speak with Robert directly <span className="text-xs text-slate-500">(Sarah arranges it)</span></label>
                  {conflictLive && (
                    <div role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-900 ring-1 ring-red-200">
                      <div className="flex items-center gap-1.5 font-semibold"><AlertTriangle className="h-4 w-4" />Possible conflict with Pharmacy</div>
                      <p className="mt-1">Raj Mehta (Pharmacy) noted possible <b className="font-medium">statin side effects</b> and wants a review before Robert continues. Do you want to raise a flag and talk with Raj?</p>
                      {s.conflict === 'joint' ? <p className="mt-2 rounded-lg bg-white p-2 text-xs">Flag raised · Raj notified · 10-min huddle requested for today. Sarah will see this as pending.</p>
                        : noMode ? (
                          <div className="mt-2 rounded-lg bg-white p-2.5">
                            <label className="block text-xs font-semibold text-slate-700">What should happen instead?
                              <textarea rows={2} value={resText} onChange={e => { setErr(''); setResText(e.target.value) }} placeholder="e.g. Hold statin reinforcement until the pharmacist's side-effect review, then resume daily" className="mt-1 w-full rounded-md px-2 py-1.5 text-sm font-normal text-ink ring-1 ring-slate-300 outline-none focus:ring-brand-500" /></label>
                            <button onClick={() => setResText('Hold statin reinforcement until the pharmacist\'s side-effect review, then resume daily')} className="mt-1 text-xs text-brand-600">✨ Use AI wording</button>
                            <div className="mt-2 flex gap-2"><Btn primary onClick={resolveNo}>Confirm</Btn><Btn onClick={() => setNoMode(false)}>Back</Btn></div>
                          </div>)
                        : <div className="mt-2 flex flex-wrap gap-2"><Btn primary onClick={() => { setErr(''); set({ conflict: 'joint' }) }}>Yes, talk with Raj</Btn><Btn onClick={() => setNoMode(true)}>No, I'll address it</Btn></div>}
                    </div>)}
                  {s.conflict === 'resolved' && prog === 'Heart' && <p className="mt-3 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">Conflict addressed by you: {s.resolution}.</p>}
                  <div className="mt-3 rounded-lg bg-slate-50 p-2.5">
                    <div className="mb-1 text-xs font-semibold text-slate-600">Tasks for Sarah <span className="font-normal text-slate-500">(AI-extracted from your note · channel set by care manager)</span></div>
                    {tasks.length ? <ul className="space-y-0.5 text-sm">{tasks.map(t => <li key={t.text}>• {t.text}</li>)}</ul> : <p className="text-xs text-slate-500">Tasks appear as you write.</p>}
                  </div>
                  <p role="alert" className="mt-2 min-h-5 text-sm text-red-600">{err}</p>
                  <div className="flex flex-wrap gap-2">
                    <Btn primary disabled={done} onClick={send}><Send className="h-4 w-4" />{done ? 'Sent to Sarah' : 'Send to Sarah for review'}</Btn>
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
