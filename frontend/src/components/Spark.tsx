export default function Spark({ color, pts }: { color: string; pts: number[] }) {
  const W = 60, H = 28
  const mx = Math.max(...pts), mn = Math.min(...pts), rng = mx - mn || 1
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * W)
  const ys = pts.map(p => H - 2 - ((p - mn) / rng) * (H - 7))
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <path d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
