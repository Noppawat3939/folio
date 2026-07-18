import type { Entry, MonthlySummary, YearlySummary } from '~/types'

const API_TOKEN = import.meta.env.VITE_API_TOKEN ?? ''
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const authHeader = () => ({ Authorization: `Bearer ${API_TOKEN}` })

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeader() })
  const json = (await res.json()) as { success: boolean; data: T; error?: string }
  if (!res.ok || !json.success) throw new Error(json.error ?? `${res.status}`)
  return json.data
}

async function mutate<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: body != null ? JSON.stringify(body) : undefined,
  })
  const json = (await res.json()) as { success: boolean; data: T; error?: string }
  if (!res.ok || !json.success) throw new Error(json.error ?? `${res.status}`)
  return json.data
}

export const api = {
  entries: {
    list: (period: string) => get<Entry[]>(`/api/entries?period=${period}-01`),
    get: (id: string) => get<Entry>(`/api/entries/${id}`),
    create: (body: Omit<Entry, 'id'>) => mutate<Entry>('POST', '/api/entries', body),
    update: (id: string, body: Omit<Entry, 'id'>) =>
      mutate<Entry>('PUT', `/api/entries/${id}`, body),
    delete: (id: string) => mutate<void>('DELETE', `/api/entries/${id}`),
  },
  summary: {
    monthly: (period: string) =>
      get<MonthlySummary[]>(`/api/summary/monthly?period=${period}-01`),
    yearly: (year: string) => get<YearlySummary[]>(`/api/summary/yearly?year=${year}`),
  },
}

export const QUICK_TYPES = [
  'หุ้น',
  'กองทุน',
  'ประกัน',
  'เงินสำรองฉุกเฉินส่วนตัว',
  'เงินสำรองฉุกเฉินกับแฟน',
  'อื่นๆ',
]
