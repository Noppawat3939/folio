import { useState, useEffect, useMemo } from 'react'
import type { Entry, FetchedData } from '~/types'
import { api } from '~/services/api'
import { fmt, currentPeriod } from '~/utils/format'
import EntryModal from '~/components/EntryModal'
import TypeBadge, { typeColor } from '~/components/TypeBadge'

type View = 'monthly' | 'yearly'
type ModalState = null | 'add' | Entry

export default function App() {
  const [view, setView] = useState<View>('monthly')
  const [period, setPeriod] = useState(currentPeriod)
  const [data, setData] = useState<FetchedData>({ entries: [], monthly: [], yearly: [] })
  const [loadedPeriod, setLoadedPeriod] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [modal, setModal] = useState<ModalState>(null)

  const year = period.slice(0, 4)
  const loading = loadedPeriod !== period

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.entries.list(period),
      api.summary.monthly(period),
      api.summary.yearly(year),
    ])
      .then(([entries, monthly, yearly]) => {
        if (cancelled) return
        setError(null)
        setData({
          entries: Array.isArray(entries) ? entries : [],
          monthly: Array.isArray(monthly) ? monthly : [],
          yearly: Array.isArray(yearly) ? yearly : [],
        })
        setLoadedPeriod(period)
      })
      .catch(e => {
        if (cancelled) return
        setError(String(e))
        setLoadedPeriod(period)
      })
    return () => {
      cancelled = true
    }
  }, [period, year, refreshKey])

  function refresh() {
    setRefreshKey(k => k + 1)
  }

  async function handleDelete(entry: Entry) {
    if (!confirm(`ลบ "${entry.name ?? entry.type}" ออกใช่ไหม?`)) return
    try {
      await api.entries.delete(entry.id)
      refresh()
    } catch (e) {
      alert(String(e))
    }
  }

  const { entries, monthly, yearly } = data
  const total = monthly.reduce((sum, s) => sum + s.total, 0)
  const maxBar = useMemo(
    () => yearly.reduce((acc, s) => Math.max(acc, s.total), 1),
    [yearly],
  )
  const yearTotal = yearly.reduce((sum, s) => sum + s.total, 0)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto">
          {/* Mobile row 1: title + add button */}
          <div className="flex items-center justify-between sm:hidden mb-2">
            <span className="text-lg font-bold tracking-tight text-gray-900">Folio</span>
            <button
              onClick={() => setModal('add')}
              className="bg-blue-400 hover:bg-blue-500 active:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
            >
              + Add
            </button>
          </div>
          {/* Mobile row 2 + Desktop single row */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-lg font-bold tracking-tight text-gray-900">Folio</span>
            <nav className="flex gap-0.5">
              {(['monthly', 'yearly'] as View[]).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    view === v ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {v === 'monthly' ? 'Monthly' : 'Yearly'}
                </button>
              ))}
            </nav>
            <input
              type="month"
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="ml-auto border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 w-32 sm:w-36"
            />
            <button
              onClick={() => setModal('add')}
              className="hidden sm:block bg-blue-400 hover:bg-blue-500 active:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap"
            >
              + Add
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4 sm:space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600">
            Failed to load data — {error}
          </div>
        )}

        {view === 'monthly' ? (
          <>
            {/* Monthly total + type breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                ลงทุนเดือนนี้ — {period}
              </p>
              <p className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-1">
                ฿{fmt(total)}
              </p>
              {monthly.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                  {monthly.map(s => (
                    <span
                      key={s.type}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeColor(s.type)}`}
                    >
                      {s.type}
                      <span className="font-mono opacity-80">฿{fmt(s.total)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bar chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 mb-4 uppercase tracking-wide">
                Monthly Overview — {year}
              </p>
              {yearly.length === 0 ? (
                <p className="text-center py-8 text-sm text-gray-400">No data for {year}</p>
              ) : (
                <div className="flex items-end gap-1.5 h-28">
                  {yearly.map(s => (
                    <div key={s.period} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t ${
                          s.period.slice(0, 7) === period ? 'bg-blue-400' : 'bg-blue-200'
                        }`}
                        style={{ height: `${(s.total / maxBar) * 100}%`, minHeight: 4 }}
                        title={`${s.period.slice(0, 7)}: ฿${fmt(s.total)}`}
                      />
                      <span className="text-[10px] text-gray-400">{s.period.slice(5, 7)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Entry list */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Entries — {period}</p>
                <span className="text-xs text-gray-400">{entries.length} items</span>
              </div>

              {loading ? (
                <p className="text-center py-10 text-sm text-gray-400">Loading…</p>
              ) : entries.length === 0 ? (
                <p className="text-center py-10 text-sm text-gray-400">
                  No entries for this period
                </p>
              ) : (
                <>
                  {/* Mobile */}
                  <div className="sm:hidden divide-y divide-gray-100">
                    {entries.map(e => (
                      <div key={e.id} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <TypeBadge type={e.type} />
                              {e.name && (
                                <span className="font-medium text-gray-900 text-sm">
                                  {e.name}
                                </span>
                              )}
                            </div>
                            {e.note && (
                              <p className="text-xs text-gray-400 mt-1 truncate">{e.note}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="font-mono font-semibold text-sm text-gray-900">
                              ฿{fmt(e.amount)}
                            </span>
                            <button
                              onClick={() => setModal(e)}
                              className="text-xs text-gray-400 hover:text-blue-500 px-1.5 py-0.5 rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(e)}
                              className="text-xs text-gray-400 hover:text-red-500 px-1.5 py-0.5 rounded"
                            >
                              Del
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop */}
                  <table className="hidden sm:table w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <th className="px-5 py-3">ประเภท</th>
                        <th className="px-5 py-3">ชื่อ</th>
                        <th className="px-5 py-3 text-right">จำนวน (THB)</th>
                        <th className="px-5 py-3 w-24"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {entries.map(e => (
                        <tr key={e.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3">
                            <TypeBadge type={e.type} />
                          </td>
                          <td className="px-5 py-3 text-gray-900">
                            {e.name ?? <span className="text-gray-400">—</span>}
                            {e.note && (
                              <span className="block text-xs text-gray-400 mt-0.5">
                                {e.note}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right font-mono font-medium text-gray-900">
                            ฿{fmt(e.amount)}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => setModal(e)}
                                className="text-xs text-gray-400 hover:text-blue-500"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(e)}
                                className="text-xs text-gray-400 hover:text-red-500"
                              >
                                Del
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </>
        ) : (
          /* Yearly view */
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 mb-4 uppercase tracking-wide">
              Yearly Overview — {year}
            </p>
            {yearly.length === 0 ? (
              <p className="text-center py-8 text-sm text-gray-400">No data for {year}</p>
            ) : (
              <>
                <div className="flex items-end gap-1.5 h-40 mb-6">
                  {yearly.map(s => (
                    <div key={s.period} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] text-gray-400 font-mono leading-none">
                        {fmt(s.total)}
                      </span>
                      <div
                        className={`w-full rounded-t ${
                          s.period.slice(0, 7) === period ? 'bg-blue-400' : 'bg-blue-200'
                        }`}
                        style={{ height: `${(s.total / maxBar) * 100}%`, minHeight: 4 }}
                        title={`${s.period.slice(0, 7)}: ฿${fmt(s.total)}`}
                      />
                      <span className="text-[10px] text-gray-400">{s.period.slice(5, 7)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 border-b border-gray-100">
                        <th className="pb-2">เดือน</th>
                        <th className="pb-2 text-right">รวม (THB)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {yearly.map(s => (
                        <tr
                          key={s.period}
                          className={`cursor-pointer hover:bg-gray-50 ${
                            s.period.slice(0, 7) === period ? 'font-medium' : ''
                          }`}
                          onClick={() => {
                            setPeriod(s.period.slice(0, 7))
                            setView('monthly')
                          }}
                        >
                          <td className="py-2 text-gray-700">{s.period.slice(0, 7)}</td>
                          <td className="py-2 text-right font-mono text-gray-900">
                            ฿{fmt(s.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-200 font-semibold text-gray-900">
                        <td className="pt-3">รวมทั้งปี</td>
                        <td className="pt-3 text-right font-mono">฿{fmt(yearTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {modal != null && (
        <EntryModal
          period={period}
          entry={typeof modal === 'string' ? undefined : modal}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setModal(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}
