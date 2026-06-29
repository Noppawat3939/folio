import { useMemo } from 'react'

interface Props {
  value: string // YYYY-MM
  onChange: (value: string) => void
  className?: string
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function MonthPicker({ value, onChange, className = '' }: Props) {
  const [year, month] = value.split('-')

  const years = useMemo(() => {
    const current = new Date().getFullYear()
    const arr: number[] = []
    for (let y = current - 5; y <= current + 2; y++) arr.push(y)
    return arr
  }, [])

  const selectCls =
    'w-full bg-[#161928] border border-[#242740] text-[#8082a0] text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-[#8FA8B8] appearance-none cursor-pointer pr-6'

  return (
    <div className={`flex gap-1.5 ${className}`}>
      <div className="relative flex-1">
        <select
          value={month}
          onChange={e => onChange(`${year}-${e.target.value}`)}
          className={selectCls}
        >
          {MONTHS.map((m, i) => {
            const v = String(i + 1).padStart(2, '0')
            return <option key={v} value={v}>{m}</option>
          })}
        </select>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8082a0] text-[10px] leading-none">▾</span>
      </div>
      <div className="relative flex-1">
        <select
          value={year}
          onChange={e => onChange(`${e.target.value}-${month}`)}
          className={selectCls}
        >
          {years.map(y => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8082a0] text-[10px] leading-none">▾</span>
      </div>
    </div>
  )
}
