import { useState, type FormEvent } from 'react'
import { Drawer } from 'vaul'
import type { Entry } from '~/types'
import { api, QUICK_TYPES } from '~/services/api'
import { useIsMobile } from '~/hooks/useIsMobile'

interface Props {
  period: string
  entry?: Entry
  onClose: () => void
  onSuccess: () => void
}

function FormContent({
  period,
  entry,
  onClose,
  onSuccess,
  autoFocus,
}: Props & { autoFocus?: boolean }) {
  const isEdit = entry != null
  const [form, setForm] = useState({
    name: entry?.name ?? '',
    type: entry?.type ?? '',
    amount: entry ? String(entry.amount) : '',
    note: entry?.note ?? '',
    period: entry ? entry.period.slice(0, 7) : period,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.type.trim()) {
      setError('กรุณาเลือกหรือพิมพ์ประเภท')
      return
    }
    const amount = Number(form.amount)
    if (!form.amount.trim() || isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
      setError('Amount must be a positive whole number')
      return
    }

    const payload = {
      name: form.name.trim() || null,
      type: form.type.trim(),
      amount,
      period: `${form.period}-01`,
      note: form.note.trim() || null,
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await api.entries.update(entry.id, payload)
      } else {
        await api.entries.create(payload)
      }
      onSuccess()
    } catch (err) {
      setError(String(err).replace('Error: ', ''))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-base">
          {isEdit ? 'Edit Entry' : 'Add Entry'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            ประเภท <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {QUICK_TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  form.type === t
                    ? 'bg-blue-400 border-blue-400 text-white'
                    : 'border-gray-200 text-gray-600 bg-white hover:border-blue-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            placeholder="หรือพิมพ์เองได้…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            จำนวนเงิน (THB) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus={autoFocus && !isEdit}
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            ชื่อ asset{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="เช่น GOOGL, MSFT, กสิกร…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Period */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">เดือน</label>
          <input
            type="month"
            value={form.period}
            onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            หมายเหตุ{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            placeholder="รายละเอียดเพิ่มเติม…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1 pb-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-400 hover:bg-blue-500 active:bg-blue-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium"
          >
            {submitting ? 'Saving…' : isEdit ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </>
  )
}

export default function EntryModal({ period, entry, onClose, onSuccess }: Props) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer.Root open onOpenChange={open => !open && onClose()}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl outline-none">
            <div className="mx-auto w-12 h-1.5 bg-gray-300 rounded-full mt-3 mb-1" />
            <FormContent period={period} entry={entry} onClose={onClose} onSuccess={onSuccess} />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none" aria-hidden="true" />
      <div
        className="relative bg-white rounded-2xl w-full max-w-sm shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <FormContent
          period={period}
          entry={entry}
          onClose={onClose}
          onSuccess={onSuccess}
          autoFocus
        />
      </div>
    </div>
  )
}
