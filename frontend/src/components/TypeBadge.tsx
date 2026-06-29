const TYPE_COLORS: Record<string, string> = {
  'หุ้น':                        'bg-blue-500/15 text-blue-400',
  'กองทุน':                      'bg-violet-500/15 text-violet-400',
  'ประกัน':                      'bg-amber-500/15 text-amber-400',
  'เงินสำรองฉุกเฉินส่วนตัว':     'bg-emerald-500/15 text-emerald-400',
  'เงินสำรองฉุกเฉินกับแฟน':     'bg-teal-500/15 text-teal-400',
  'อื่นๆ':                       'bg-slate-500/15 text-slate-400',
}

export function typeColor(type: string) {
  return TYPE_COLORS[type] ?? 'bg-indigo-500/15 text-indigo-400'
}

export default function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-xs font-semibold ${typeColor(type)}`}>
      {type}
    </span>
  )
}
