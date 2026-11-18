import { useState } from 'react'
import { Sparkles, CheckCircle2, MessageSquare, Phone, CalendarCheck, ShieldCheck, ArrowRight, AlertTriangle, Send, Bell } from 'lucide-react'
import { SPECIALISTS, URGENCY, MERGE, OWN_CASES, EVIDENCE, HISTORY } from './data.js'
import { Pill, ProgramPill, Btn, Card, SideNav, MemberSidebar, RecordTabs, AccessLine, CaseTracker } from './ui.jsx'
import { WorkspaceTabs, EARLY } from './Sarah.jsx'


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

const PROG_UPDATES = s => ({
  Pharmacy: [
    s.stage >= 2 && ['Raj (pharmacist) reviewed your medicines', 'He thinks your statin may be causing muscle aches and wants to check before your next refill.'],
    s.stage >= 2 && ['Refill reminder', 'Your atorvastatin refill is ready after the review.'],
    s.summary && ['Medicine review booked', 'Raj will call you Friday about side effects.'],
  ],
  Diabetes: [
    s.stage >= 2 && ['Dr. Lee reviewed your plan', 'Your last HbA1c (blood sugar average) was 7.9%. A new blood test is recommended.'],
    s.stage >= 2 && ['Eating tips', 'One simple plan: fewer refined carbs and less salt (agreed with your heart team).'],
    s.summary && ['Blood test booked', 'Monday, 9 am at your local lab.'],
  ],
  Heart: [
    s.stage >= 2 && ['Nurse Kim reviewed your blood pressure', 'Your last reading was 148/92. Goal: below 130/80.'],
    s.stage >= 2 && ['Start a BP log', 'Measure once a day; your team will check in after 2 weeks.'],
  ],
})

export function MemberApp({ s, set, go }) {
  const [view, setView] = useState('home')
  const [menu, setMenu] = useState(false)
  const [ask, setAsk] = useState(''), [asked, setAsked] = useState(''), [askErr, setAskErr] = useState('')
  const slots = ['Thu 6:30 pm', 'Thu 7:15 pm', 'Fri 6:00 pm']
  const active = s.stage >= 3
  const routed = s.stage >= 1
  const upd = PROG_UPDATES(s)
  const nav = v => { setView(v); setMenu(false); setAsked(''); setAsk(''); setAskErr('') }
  const MENU = [['home', 'Home'], ['id', 'ID card'], ['claims', 'Claims'], ['benefits', 'Benefits'], ['doctor', 'Find a doctor'], ['rx', 'Pharmacy'], ['cm', 'Care management'], ['msg', 'Messages'], ['set', 'Settings']]
  const Header = ({ title, back }) => (
    <div className="flex items-center gap-3 bg-brand-700 px-4 pb-3 pt-5 text-white">
      {back ? <button onClick={() => nav(back)} aria-label="Back" className="text-lg">‹</button> : <button onClick={() => setMenu(true)} aria-label="Open menu" className="flex flex-col gap-1"><span className="h-0.5 w-5 bg-white" /><span className="h-0.5 w-5 bg-white" /><span className="h-0.5 w-5 bg-white" /></button>}
      <div className="flex-1 font-display font-bold">{title}</div>
      <button onClick={() => nav('cm')} aria-label="Notifications" className="relative"><Bell className="h-5 w-5" />{routed && <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-cyan-accent text-[10px] font-bold">{active && !s.slot ? 2 : 1}</span>}</button>
      <img src="./icon.png" alt="CareLink" className="h-7 w-7 rounded-md bg-white p-0.5" />
    </div>)
  const SarahCard = () => (
    <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <div className="text-xs font-medium text-slate-500">Your care manager</div>
      <div className="mt-1.5 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-accent text-sm font-bold text-white">SK</div><div><div className="font-medium">Sarah K., RN</div><div className="text-xs text-slate-500">Mon–Fri, 9 am–7 pm · (555) 014-2290</div></div></div>
      <div className="mt-2.5 grid grid-cols-2 gap-2"><button onClick={() => nav('ask')} className="flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2 text-sm text-white"><MessageSquare className="h-4 w-4" />Message</button><button className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-sm"><Phone className="h-4 w-4" />Call</button></div>
    </div>)
  let body
  if (view === 'cm') body = (<>
    <Header title="Care management" />
    <div className="space-y-3 p-4 text-sm">
      <SarahCard />
      
      {routed && s.early && !active && <div className={`rounded-xl bg-white p-4 ring-1 ${active ? 'ring-slate-200 opacity-80' : 'ring-brand-200'}`}>
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-brand-600"><ShieldCheck className="h-3.5 w-3.5" />From your care team · {active ? 'earlier' : 'today'}</div>
        <p>Hi Robert, I'm Sarah, your care manager. Our team is reviewing your medicines and tests, and I'll contact you {EARLY[s.routing.urgency]}.</p>
        <p className="mt-2 text-xs text-slate-500">This service is free and doesn't affect your coverage or claims.</p></div>}
      {active && !s.slot && (<>
        <div className="rounded-xl bg-white p-4 ring-1 ring-brand-200"><div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-brand-600"><ShieldCheck className="h-3.5 w-3.5" />From Sarah · now</div>
          <p>Your team has a plan: a <b className="font-medium">statin check</b>, an <b className="font-medium">overdue blood test</b> and your <b className="font-medium">blood pressure</b>. Let's cover it in one short call.</p></div>
        <button onClick={() => nav('slots')} className="flex w-full items-center gap-2 rounded-xl bg-brand-600 p-3 font-medium text-white"><CalendarCheck className="h-4 w-4" />Schedule a call<ArrowRight className="ml-auto h-4 w-4" /></button>
        <button onClick={() => nav('ask')} className="flex w-full items-center gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200"><MessageSquare className="h-4 w-4 text-brand-600" />Message Sarah</button></>)}
      {s.slot && (<>
        <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800 ring-1 ring-emerald-200"><div className="font-medium">Call with Sarah ✓</div><div>{s.slot}. We'll text you a reminder.</div></div>
        {s.stage === 3 && <Btn primary className="w-full justify-center" onClick={() => go(4)}><Phone className="h-4 w-4" />Continue: Sarah calls Robert</Btn>}</>)}
      {active && s.early && <button onClick={() => nav('msgs')} className="w-full text-center text-xs font-medium text-brand-600">View all messages (2) ›</button>}
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your programs</div>
      {routed ? ['Diabetes', 'Heart', 'Pharmacy'].map(p => {
        const n = upd[p].filter(Boolean).length
        return <button key={p} onClick={() => nav('p:' + p)} className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left ring-1 ring-slate-200"><ProgramPill p={p} /><span className="flex-1 text-xs text-slate-600">{n ? `${n} update${n > 1 ? 's' : ''}` : 'Your team is reviewing'}</span><span className="text-slate-400">›</span></button>
      }) : <p className="rounded-xl bg-white p-3 text-slate-500 ring-1 ring-slate-200">No active programs yet.</p>}
      <p className="text-xs text-slate-500">Questions about any program go to Sarah. She'll bring in the right specialist.</p>
    </div></>)
  else if (view.startsWith('p:')) { const p = view.slice(2); const list = upd[p].filter(Boolean); body = (<>
    <Header title={`${p} program`} back="cm" />
    <div className="space-y-3 p-4 text-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Latest updates</div>
      {list.length ? list.map(([h, d]) => <div key={h} className="rounded-xl bg-white p-3 ring-1 ring-slate-200"><div className="font-medium">{h}</div><div className="text-xs text-slate-600">{d}</div></div>)
        : <p className="rounded-xl bg-white p-3 text-slate-500 ring-1 ring-slate-200">Your {p.toLowerCase()} team is reviewing your plan. Sarah will update you.</p>}
      <button onClick={() => nav('ask')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 p-3 font-medium text-white"><MessageSquare className="h-4 w-4" />Ask about this program</button>
      <p className="text-center text-xs text-slate-500">Goes to Sarah, your care manager</p>
    </div></>) }
  else if (view === 'ask') body = (<>
    <Header title="Message Sarah" back="cm" />
    <div className="space-y-3 p-4 text-sm">
      {asked ? <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800 ring-1 ring-emerald-200"><div className="font-medium">Sent to Sarah ✓</div><div className="text-xs">She usually replies within a few hours and will loop in your specialist if needed.</div><div className="mt-2 rounded-lg bg-white p-2 text-xs text-slate-700">"{asked}"</div></div> : (<>
        <p className="text-xs text-slate-500">Your message goes to Sarah, your care manager. She'll involve Raj, Dr. Lee or Nurse Kim if needed.</p>
        <textarea rows={4} value={ask} onChange={e => { setAskErr(''); setAsk(e.target.value) }} aria-label="Message" placeholder="e.g. Can I take my statin at night instead?" className="w-full rounded-xl bg-white p-3 ring-1 ring-slate-300 outline-none focus:ring-brand-500" />
        {askErr && <p className="text-xs text-red-600">{askErr}</p>}
        <button onClick={() => ask.trim() ? setAsked(ask.trim()) : setAskErr('Write a message first.')} className="w-full rounded-xl bg-brand-600 p-3 font-medium text-white">Send to Sarah</button></>)}
    </div></>)
  else if (view === 'msgs') body = (<>
    <Header title="Messages from Sarah" back="cm" />
    <div className="space-y-3 p-4 text-sm">
      {[active && ['Now', 'Your team has a plan: a statin check, an overdue blood test and your blood pressure. Let\'s cover it in one short call.'],
        s.early && ['Earlier today', `Hi Robert, I'm Sarah, your care manager. Our team is reviewing your medicines and tests, and I'll contact you ${EARLY[s.routing.urgency]}. This service is free and doesn't affect your coverage or claims.`]].filter(Boolean).map(([when, txt]) => (
        <div key={when} className="rounded-xl bg-white p-3 ring-1 ring-slate-200"><div className="mb-1 text-xs font-medium text-brand-600">Sarah K., RN · {when}</div><p>{txt}</p></div>))}
    </div></>)
  else if (view === 'slots') body = (<>
    <Header title="Schedule a call" back="cm" />
    <div className="space-y-3 p-4 text-sm"><div className="font-display font-bold">Pick a time that suits you</div>
      {slots.map(x => <button key={x} onClick={() => { set({ slot: x }); nav('cm') }} className="w-full rounded-xl bg-white p-3 text-left ring-1 ring-slate-200 hover:ring-brand-500">{x} · 15 min call with Sarah</button>)}</div></>)
  else if (view !== 'home') body = (<><Header title={MENU.find(m => m[0] === view)?.[1]} back="home" /><p className="p-4 text-sm text-slate-500">This section is part of the regular member app (not in this prototype).</p></>)
  else body = (<>
    <Header title="CareLink" />
    <div className="bg-brand-700 px-4 pb-4 text-white"><div className="flex items-center gap-3"><img src="./robert.jpg" alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-white/40" /><div><div className="text-xs text-brand-100">Good evening</div><div className="font-display text-lg font-bold">Robert</div></div></div>
      <div className="mt-3 rounded-xl bg-white/10 p-3 text-xs"><div className="text-brand-100">Medicare Advantage · Member ID</div><div className="font-medium tracking-wide">MBR-112093</div></div></div>
    <div className="space-y-3 p-4 text-sm">
      <div className="grid grid-cols-3 gap-2 text-center text-xs">{[['claims', 'Claims'], ['doctor', 'Find care'], ['rx', 'Pharmacy'], ['benefits', 'Benefits'], ['id', 'ID card'], ['cm', 'Care team']].map(([v, l]) => (
        <button key={v} onClick={() => nav(v)} className={`relative rounded-xl p-2.5 ring-1 ${v === 'cm' ? 'bg-brand-50 font-medium text-brand-700 ring-brand-200' : 'bg-white ring-slate-200'}`}>{l}{v === 'cm' && routed && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cyan-accent" />}</button>))}</div>
      {s.slot && <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200"><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upcoming</div><div className="mt-1 flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-brand-600" /><span>Call with Sarah · {s.slot}</span></div></div>}
      <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
        <div className="flex items-center justify-between"><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent claims</div><button onClick={() => nav('claims')} className="text-xs text-brand-600">See all</button></div>
        {[['Office visit · Dr. A. Patel', 'Oct 20', 'You paid $20'], ['Atorvastatin 20 mg · Pharmacy', 'Sep 14', 'You paid $0'], ['Lab work · HbA1c', 'Apr 12', 'Covered in full']].map(([a, d, c]) => <div key={a} className="flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0"><div><div>{a}</div><div className="text-xs text-slate-500">{d}</div></div><span className="text-xs text-emerald-700">{c}</span></div>)}
      </div>
      <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200"><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Plan usage</div>
        <div className="mt-1 text-sm">Out-of-pocket: $640 of $4,500</div><div className="mt-1.5 h-2 rounded-full bg-slate-100"><div className="h-2 w-[14%] rounded-full bg-brand-500" /></div></div>
      <div className="rounded-xl bg-cyan-soft p-3 text-cyan-900 ring-1 ring-cyan-200"><div className="text-xs font-semibold uppercase tracking-wide">Wellness tip</div><div className="mt-1 text-sm">A 10-minute walk after meals can help keep blood sugar steady.</div></div>
    </div></>)
  return (
    <div className="flex justify-center p-6">
      <div className="w-[350px] rounded-[2.2rem] bg-ink p-3 shadow-xl">
        <div className="relative h-[640px] overflow-y-auto overflow-x-hidden rounded-[1.7rem] bg-slate-50">
          {body}
          {menu && (<div className="absolute inset-0 z-10 flex">
            <nav aria-label="App menu" className="w-64 bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center gap-2"><img src="./robert.jpg" alt="" className="h-9 w-9 rounded-full object-cover" /><div><div className="text-sm font-medium">Robert Hayes</div><div className="text-xs text-slate-500">MBR-112093</div></div></div>
              {MENU.map(([v, l]) => <button key={v} onClick={() => nav(v)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${v === view ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-700'}`}>{l}{v === 'cm' && routed && <span className="rounded-full bg-cyan-accent px-1.5 text-[10px] font-medium text-white">New</span>}</button>)}
            </nav>
            <button aria-label="Close menu" className="flex-1 bg-black/30" onClick={() => setMenu(false)} />
          </div>)}
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
