export function PortfolioIcon({ on }: { on: boolean }) {
  const c = on ? '#4f72ff' : '#35395a'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2"  y="10" width="4" height="8" rx="1" fill={c} />
      <rect x="8"  y="6"  width="4" height="12" rx="1" fill={c} />
      <rect x="14" y="2"  width="4" height="16" rx="1" fill={c} />
    </svg>
  )
}

export function AnalyticsIcon({ on }: { on: boolean }) {
  const c = on ? '#4f72ff' : '#35395a'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2 14 L6 9 L10 11.5 L14 5 L18 7" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="7" r="1.8" fill={c} />
    </svg>
  )
}
