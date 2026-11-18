export const PROGRAMS = {
  Diabetes: 'bg-brand-50 text-brand-700 ring-brand-200',
  Heart: 'bg-rose-50 text-rose-700 ring-rose-200',
  Pharmacy: 'bg-cyan-soft text-cyan-800 ring-cyan-200',
  Maternity: 'bg-pink-50 text-pink-700 ring-pink-200',
}

export const URGENCY = {
  Urgent: { cls: 'bg-red-50 text-red-700 ring-red-200', due: 'Review today' },
  High: { cls: 'bg-amber-50 text-amber-800 ring-amber-200', due: 'Review within 2 days' },
  Routine: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', due: 'Review within 5 days' },
}

export const FLAGS = [
  { id: 'linda', name: 'Linda Moore', age: 67, sex: 'F', mid: 'MBR-204871', score: 88, reason: 'Discharged 2 days ago (heart failure)', programs: ['Heart', 'Pharmacy'] },
  { id: 'maria', name: 'Maria Lopez', age: 28, sex: 'F', mid: 'MBR-318402', score: 82, reason: 'New gestational diabetes code', programs: ['Maternity', 'Diabetes'] },
  { id: 'robert', name: 'Robert Hayes', age: 58, sex: 'M', mid: 'MBR-112093', score: 71, reason: 'Late statin refill · HbA1c overdue · BP high', programs: ['Diabetes', 'Heart', 'Pharmacy'] },
  { id: 'james', name: 'James Carter', age: 71, sex: 'M', mid: 'MBR-275519', score: 64, reason: 'New COPD diagnosis', programs: ['Pharmacy'] },
  { id: 'priya', name: 'Priya Nair', age: 44, sex: 'F', mid: 'MBR-390276', score: 38, reason: 'Diabetic eye exam overdue', programs: ['Diabetes'] },
]

export const EVIDENCE = [
  ['Pharmacy claim · Nov 1', 'Atorvastatin 20 mg refill 18 days overdue'],
  ['Lab result · Apr 12', 'Last HbA1c 7.9%; no test in 7 months'],
  ['Clinic claim · Oct 20', 'BP 148/92 at primary care visit'],
]

export const HISTORY = [
  ['Last 30 days', [['Oct 28', 'Call', 'Heart', 'No answer'], ['Oct 21', 'Call', 'Diabetes', 'No answer'], ['Oct 14', 'Call', 'Pharmacy', 'No answer']]],
  ['6 months ago', [['May 03', 'Letter', 'Diabetes', 'Mailed'], ['Apr 12', 'Lab result', 'Primary care', 'HbA1c 7.9%']]],
]

export const SPECIALISTS = {
  Diabetes: { who: 'Dr. Lee · Diabetes educator', comment: 'HbA1c last checked 7 months ago. Wants test booked before next visit.',
    tasks: [['Book HbA1c blood test', 'Call'], ['Diet advice: reduce refined carbs', 'Call']] },
  Heart: { who: 'Nurse Kim · Cardiac care', comment: 'BP 148/92. Reinforce BP medication and home monitoring.',
    tasks: [['BP check-in and home log', 'Call'], ['Diet advice: lower sodium', 'Call']] },
  Pharmacy: { who: 'Raj Mehta · Clinical pharmacist', comment: 'Statin refill 18 days late; may have side-effect concerns.',
    tasks: [['Statin refill reminder', 'Text'], ['Medication review (side effects)', 'Specialist call']] },
}
