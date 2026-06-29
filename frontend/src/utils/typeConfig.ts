export const TYPE_CFG: Record<string, { bg: string; text: string; accent: string }> = {
  'หุ้น':                        { bg: 'bg-[#BFC9D1]/15',   text: 'text-[#BFC9D1]',   accent: '#BFC9D1' },
  'กองทุน':                      { bg: 'bg-[#9BB4C0]/15',   text: 'text-[#9BB4C0]',   accent: '#9BB4C0' },
  'ประกัน':                      { bg: 'bg-amber-500/15',   text: 'text-amber-400',   accent: '#fbbf24' },
  'เงินสำรองฉุกเฉินส่วนตัว':     { bg: 'bg-emerald-500/15', text: 'text-emerald-400', accent: '#34d399' },
  'เงินสำรองฉุกเฉินกับแฟน':     { bg: 'bg-teal-500/15',    text: 'text-teal-400',    accent: '#2dd4bf' },
  'อื่นๆ':                       { bg: 'bg-slate-500/15',   text: 'text-slate-400',   accent: '#94a3b8' },
}

const SPARK_DATA: Record<string, number[]> = {
  'หุ้น':                        [30, 46, 35, 57, 40, 63, 52],
  'กองทุน':                      [50, 40, 63, 45, 70, 55, 73],
  'ประกัน':                      [40, 43, 38, 47, 42, 51, 46],
  'เงินสำรองฉุกเฉินส่วนตัว':     [35, 40, 47, 42, 54, 57, 54],
  'เงินสำรองฉุกเฉินกับแฟน':     [45, 51, 48, 59, 53, 62, 58],
  'อื่นๆ':                       [40, 38, 45, 40, 47, 43, 49],
}

export function tcfg(type: string) {
  return TYPE_CFG[type] ?? { bg: 'bg-[#8FA8B8]/15', text: 'text-[#8FA8B8]', accent: '#8FA8B8' }
}

export function spark(type: string) {
  return SPARK_DATA[type] ?? [40, 44, 42, 50, 46, 54, 50]
}

export function abbr(s: string) {
  const map: Record<string, string> = {
    'หุ้น': 'STK', 'กองทุน': 'FND', 'ประกัน': 'INS',
    'เงินสำรองฉุกเฉินส่วนตัว': 'EMG', 'เงินสำรองฉุกเฉินกับแฟน': 'EMG',
  }
  return map[s] ?? s.slice(0, 3).toUpperCase()
}
