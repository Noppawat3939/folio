const TYPE_COLORS: Record<string, string> = {
  หุ้น: 'bg-blue-100 text-blue-700',
  กองทุน: 'bg-violet-100 text-violet-700',
  ประกัน: 'bg-amber-100 text-amber-700',
  เงินสำรองฉุกเฉินส่วนตัว: 'bg-emerald-100 text-emerald-700',
  เงินสำรองฉุกเฉินกับแฟน: 'bg-teal-100 text-teal-700',
  อื่นๆ: 'bg-gray-100 text-gray-700',
}

export function typeColor(type: string) {
  return TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-700'
}

export default function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeColor(type)}`}>
      {type}
    </span>
  )
}
