const numberFormatter = new Intl.NumberFormat('th-TH')

export function fmt(n: number): string {
  return numberFormatter.format(n)
}

export function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7)
}
