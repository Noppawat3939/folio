const TYPE_COLORS: Record<string, string> = {
  'หุ้น':                        'bg-[#8494FF]/15 text-[#8494FF]',
  'กองทุน':                      'bg-[#6367FF]/15 text-[#6367FF]',
  'ประกัน':                      'bg-amber-500/15 text-amber-400',
  'เงินสำรองฉุกเฉินส่วนตัว':     'bg-emerald-500/15 text-emerald-400',
  'เงินสำรองฉุกเฉินกับแฟน':     'bg-teal-500/15 text-teal-400',
  'อื่นๆ':                       'bg-slate-500/15 text-slate-400',
}

export function typeColor(type: string) {
  return TYPE_COLORS[type] ?? 'bg-[#8FA8B8]/15 text-[#8FA8B8]'
}

export default function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-xs font-semibold ${typeColor(type)}`}>
      {type}
    </span>
  )
}
