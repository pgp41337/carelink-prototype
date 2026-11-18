import { useState } from 'react'
import { Sparkles, Pill as PillIcon, FlaskConical, Stethoscope, CheckCircle2, X, MessageSquare, Phone, Merge } from 'lucide-react'
import { FLAGS, EVIDENCE, HISTORY, URGENCY, SPECIALISTS } from './data.js'
import { Pill, ProgramPill, Btn, Card, SideNav, MemberSidebar, RecordTabs } from './ui.jsx'

const ICONS = [PillIcon, FlaskConical, Stethoscope]
const riskCls = s => s >= 80 ? 'bg-red-50 text-red-700 ring-red-200' : s >= 60 ? 'bg-amber-50 text-amber-800 ring-amber-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'

export function SarahFlags({ s, set, go }) {
  const [tab, setTab] = useState('list')
  const r = s.routing
  const overridden = r.urgency !== r.ai
  const [err, setErr] = useState('')
  const verify = () => {
    if (!r.programs.length) return setErr('Select at least one program first.')
    if (overridden && !r.reason.trim()) return setErr('Add a reason for changing the AI urgency.')
    go(1)
  }
  const upd = p => { setErr(''); set({ routing: { ...r, ...p } }) }
  return (
    <div className="flex">
      <SideNav />
      <div className="min-w-0 flex-1">
        <WorkspaceTabs tabs={[['list', 'Worklist · New flags (5)'], ['rec', 'Hayes, Robert']]} active={tab} onPick={setTab} />
        {tab === 'list' ? (
          <div className="p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h2 className="mr-2 font-display text-xl font-bold text-brand-900">New flags</h2>
              {['Program: All', 'Risk: All', 'Source: All', 'Flagged: Last 24h'].map(f => <Pill key={f}>{f} ▾</Pill>)}
            </div>
            <p className="mb-3 text-sm text-slate-600">AI flagged 5 members overnight from claims, pharmacy and lab data. Verify each before it reaches programs.</p>
            <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-200 text-left text-xs text-slate-500">{['Member', 'Member ID', 'AI risk', 'Flag reason', 'Suggested programs', 'Status'].map(h => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr></thead>
                <tbody>{FLAGS.map(m => (
                  <tr key={m.id} className={`border-b border-slate-100 last:border-0 ${m.id === 'robert' ? 'bg-brand-50/60' : ''}`}>
                    <td className="px-3 py-2.5"><button onClick={() => m.id === 'robert' && setTab('rec')} className={`font-medium ${m.id === 'robert' ? 'text-brand-700 underline decoration-brand-200 underline-offset-2' : 'text-ink'}`}>{m.name}</button><div className="text-xs text-slate-500">{m.age} {m.sex}</div></td>
                    <td className="px-3 py-2.5 text-slate-600">{m.mid}</td>
                    <td className="px-3 py-2.5"><Pill cls={riskCls(m.score)}>{m.score}</Pill></td>
                    <td className="px-3 py-2.5">{m.reason}</td>
                    <td className="px-3 py-2.5"><div className="flex flex-wrap gap-1">{m.programs.map(p => <ProgramPill key={p} p={p} />)}</div></td>
                    <td className="px-3 py-2.5"><Pill>To review</Pill></td>
                  </tr>))}</tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500">Tip: open Robert Hayes to continue the demo.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">
            <MemberSidebar programs={[]} />
            <div className="min-w-0 flex-1">
              <RecordTabs active="Flag review" />
              <div className="grid gap-4 p-4 xl:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                  <Card title={<span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand-600" />Why AI flagged Robert</span>} action={<span className="text-xs text-slate-500">Model v2.3 · high confidence</span>}>
                    <div className="space-y-2">{EVIDENCE.map(([src, txt], i) => { const I = ICONS[i]; return (
                      <div key={src} className="flex items-start gap-3 rounded-lg bg-slate-50 p-2.5"><I className="mt-0.5 h-4 w-4 text-brand-600" aria-hidden /><div><div className="text-xs text-slate-500">{src}</div><div className="text-sm">{txt}</div></div></div>) })}</div>
                  </Card>
                  <Card title="Contact history (all teams)">
                    {HISTORY.map(([g, rows]) => (<div key={g} className="mb-2"><div className="mb-1 text-xs font-semibold text-brand-600">{g}</div>
                      {rows.map(rw => <div key={rw[0] + rw[2]} className="grid grid-cols-4 gap-2 border-b border-slate-100 py-1.5 text-sm last:border-0"><span className="text-slate-500">{rw[0]}</span><span>{rw[1]}</span><span>{rw[2]}</span><span className="text-slate-600">{rw[3]}</span></div>)}</div>))}
                  </Card>
                </div>
                <Card title="Review & route">
                  <fieldset className="mb-4">
                    <legend className="mb-1.5 text-xs font-semibold text-slate-600">Review urgency <span className="font-normal text-slate-500">(AI suggests {r.ai})</span></legend>
                    <div className="grid grid-cols-3 gap-1.5">{Object.keys(URGENCY).map(u => (
                      <button key={u} onClick={() => upd({ urgency: u })} aria-pressed={r.urgency === u} className={`rounded-lg px-2 py-2 text-xs font-medium ring-1 ${r.urgency === u ? URGENCY[u].cls + ' ring-2' : 'bg-white text-slate-600 ring-slate-200'}`}>{u}</button>))}</div>
                    <div className="mt-1 text-xs text-slate-500">{URGENCY[r.urgency].due}</div>
                    {overridden && <label className="mt-2 block text-xs font-medium text-slate-700">Reason for change<input value={r.reason} onChange={e => upd({ reason: e.target.value })} placeholder="e.g. 3 unanswered calls; disengaging" className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-sm font-normal ring-1 ring-slate-300 outline-none focus:ring-brand-500" /></label>}
                  </fieldset>
                  <fieldset className="mb-4">
                    <legend className="mb-1.5 text-xs font-semibold text-slate-600">Route to programs <span className="font-normal text-slate-500">(AI suggested)</span></legend>
                    {['Diabetes', 'Heart', 'Pharmacy', 'Maternity'].map(p => (
                      <label key={p} className="mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"><input type="checkbox" className="accent-brand-600" checked={r.programs.includes(p)} onChange={e => upd({ programs: e.target.checked ? [...r.programs, p] : r.programs.filter(x => x !== p) })} /><ProgramPill p={p} /></label>))}
                  </fieldset>
                  <label className="block text-xs font-semibold text-slate-600">Note to specialists
                    <textarea rows={3} value={r.note} onChange={e => upd({ note: e.target.value })} className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-sm font-normal ring-1 ring-slate-300 outline-none focus:ring-brand-500" /></label>
                  <p role="alert" className="mt-2 min-h-5 text-sm text-red-600">{err}</p>
                  <div className="mt-1 flex flex-wrap gap-2"><Btn primary onClick={verify}><CheckCircle2 className="h-4 w-4" />Verify & send</Btn><Btn>Request info</Btn><Btn>Dismiss…</Btn></div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function SarahOutreach({ s, go }) {
  const tasks = mergedTasks(s.tasks)
  return (
    <div className="flex">
      <SideNav />
      <div className="min-w-0 flex-1">
        <WorkspaceTabs tabs={[['rec', 'Worklist · Ready for outreach (1)'], ['r', 'Hayes, Robert']]} active="r" onPick={() => {}} />
        <div className="flex flex-col md:flex-row">
          <MemberSidebar programs={s.routing.programs} />
          <div className="min-w-0 flex-1">
            <RecordTabs active="Outreach plan" />
            <div className="grid gap-4 p-4 xl:grid-cols-[1fr_340px]">
              <Card title="One merged plan from 3 programs" action={<Pill cls="bg-brand-50 text-brand-700 ring-brand-200">{tasks.length} tasks</Pill>}>
                <ul className="space-y-2">{tasks.map(t => (
                  <li key={t.text} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-2.5 text-sm">
                    {t.merged && <Merge className="h-4 w-4 text-amber-600" aria-label="merged" />}
                    <span className="flex-1">{t.text}</span>
                    {t.from.map(p => <ProgramPill key={p} p={p} />)}
                    <Pill>{t.channel}</Pill>
                  </li>))}</ul>
                <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">AI merged 2 diet-advice tasks (Diabetes + Heart) into one consistent message.</p>
                <div className="mt-4 space-y-2">{Object.entries(SPECIALISTS).map(([p, v]) => (
                  <div key={p} className="text-sm"><span className="font-medium">{v.who}:</span> <span className="text-slate-600">{v.comment}</span></div>))}</div>
              </Card>
              <Card title={<span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand-600" />AI recommendation</span>}>
                <div className="rounded-xl bg-brand-50 p-3 text-brand-900">
                  <div className="font-display text-lg font-bold">1 combined call</div>
                  <div className="text-sm">Heads-up by text first · Sarah leads · Pharmacist joins for med review</div>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  <li>• Urgency: <b className="font-medium text-ink">{s.routing.urgency}</b>{s.routing.urgency !== s.routing.ai && ' (set by Sarah)'}</li>
                  <li>• 3 calls went unanswered last month</li><li>• Member prefers text, evenings</li><li>• Refill reminder sent automatically (low risk)</li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2"><Btn primary disabled={s.stage >= 3} onClick={() => go(3)}><CheckCircle2 className="h-4 w-4" />{s.stage >= 3 ? "Approved · heads-up sent" : "Approve outreach"}</Btn><Btn>Edit plan</Btn></div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SarahCall({ s, set, go }) {
  const tasks = mergedTasks(s.tasks).filter(t => t.channel !== 'Text')
  const done = s.callDone
  const all = tasks.every(t => done[t.text])
  return (
    <div className="flex">
      <SideNav active="Schedule" />
      <div className="min-w-0 flex-1">
        <WorkspaceTabs tabs={[['c', `Call · Hayes, Robert · Thu ${s.slot}`]]} active="c" onPick={() => {}} />
        <div className="flex flex-col md:flex-row">
          <MemberSidebar programs={s.routing.programs} flag={false} />
          <div className="grid min-w-0 flex-1 gap-4 p-4 xl:grid-cols-[1fr_340px]">
            <Card title={<span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-emerald-600" />On call with Robert · 08:42</span>} action={<Pill cls="bg-emerald-50 text-emerald-700 ring-emerald-200">Recording (consented)</Pill>}>
              <p className="mb-3 text-sm text-slate-600">One checklist covering all programs. Tick tasks as you go.</p>
              <ul className="space-y-2">{tasks.map(t => (
                <li key={t.text}><label className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 text-sm"><input type="checkbox" className="accent-brand-600" checked={!!done[t.text]} onChange={e => set({ callDone: { ...done, [t.text]: e.target.checked } })} /><span className={`flex-1 ${done[t.text] ? 'text-slate-400 line-through' : ''}`}>{t.text}</span>{t.from.map(p => <ProgramPill key={p} p={p} />)}</label></li>))}</ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn onClick={() => set({ handoff: true })} disabled={s.handoff}>{s.handoff ? 'Pharmacist Raj booked for Fri ✓' : 'Warm handoff to pharmacist'}</Btn>
                <Btn primary disabled={!all || !s.handoff} onClick={() => set({ summary: true })}>End call & summarise</Btn>
              </div>
              {(!all || !s.handoff) && <p className="mt-2 text-xs text-slate-500">Tick all tasks and book the pharmacist handoff to end the call.</p>}
            </Card>
            <Card title={<span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand-600" />AI call summary</span>}>
              {s.summary ? (<div className="space-y-3 text-sm">
                <p>Robert stopped his statin over muscle-ache worries. HbA1c test booked for Mon. Agreed to log BP daily and follow one low-carb, low-sodium plan.</p>
                <div><div className="mb-1 text-xs font-semibold text-brand-600">Next best actions</div>
                  <ul className="space-y-1"><li>• Pharmacist review Fri (side effects)</li><li>• Check HbA1c result next week</li><li>• Next check-in in 4 weeks, by text first</li></ul></div>
                <p className="rounded-lg bg-cyan-soft p-2 text-xs text-cyan-800">Saved to shared profile · visible to Diabetes, Heart, Pharmacy</p>
                <Btn primary onClick={() => go(5)}>See outcomes</Btn>
              </div>) : <p className="text-sm text-slate-500">Summary appears here when the call ends.</p>}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export function WorkspaceTabs({ tabs, active, onPick }) {
  return (
    <div className="flex gap-1 border-b border-slate-200 bg-brand-50 px-3 pt-2">
      {tabs.map(([id, label]) => (
        <button key={id} onClick={() => onPick(id)} className={`flex items-center gap-2 rounded-t-lg px-3 py-1.5 text-sm ${active === id ? 'bg-white font-medium text-brand-900 ring-1 ring-slate-200' : 'text-brand-700 hover:bg-white/60'}`}>{label}{id !== 'list' && <X className="h-3 w-3 opacity-50" aria-hidden />}</button>))}
    </div>
  )
}

export function mergedTasks(tasks) {
  const out = []
  Object.entries(tasks).forEach(([p, list]) => list.filter(t => t.on).forEach(t => {
    if (t.text.startsWith('Diet advice')) {
      const ex = out.find(o => o.merged)
      if (ex) { ex.from.push(p); return }
      out.push({ text: 'Diet advice: one low-carb, low-sodium plan', from: [p], channel: 'Call', merged: true }); return
    }
    out.push({ text: t.text, from: [p], channel: t.channel })
  }))
  return out
}
export { MessageSquare }
