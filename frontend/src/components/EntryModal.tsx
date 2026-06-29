import { useState, type FormEvent } from 'react'
import { Drawer } from 'vaul'
import type { Entry } from '~/types'
import { api, QUICK_TYPES } from '~/services/api'
import MonthPicker from '~/components/MonthPicker'
import { useIsMobile } from '~/hooks/useIsMobile'

interface Props {
  period: string
  entry?: Entry
  onClose: () => void
  onSuccess: () => void
}

function FormContent({ period, entry, onClose, onSuccess, autoFocus }: Props & { autoFocus?: boolean }) {
  const isEdit = entry != null
  const [form, setForm] = useState({
    name:   entry?.name   ?? '',
    type:   entry?.type   ?? '',
    amount: entry ? String(entry.amount) : '',
    note:   entry?.note   ?? '',
    period: entry ? entry.period.slice(0, 7) : period,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.type.trim()) { setError('กรุณาเลือกหรือพิมพ์ประเภท'); return }
    const amount = Number(form.amount)
    if (!form.amount.trim() || isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
      setError('Amount must be a positive whole number')
      return
    }
    const payload = {
      name:   form.name.trim()   || null,
      type:   form.type.trim(),
      amount,
      period: `${form.period}-01`,
      note:   form.note.trim()   || null,
    }
    setSubmitting(true)
    try {
      if (isEdit) await api.entries.update(entry.id, payload)
      else        await api.entries.create(payload)
      onSuccess()
    } catch (err) {
      setError(String(err).replace('Error: ', ''))
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full bg-[#0d0f17] border border-[#252840] text-white rounded-xl px-3 py-2.5 text-sm placeholder:text-[#3a3e5a] focus:outline-none focus:border-[#BFC9D1]'
  const labelCls = 'block text-[11px] font-semibold text-[#5e6180] uppercase tracking-wider mb-2'

  return (
    <>
      <div className="px-5 py-4 border-b border-[#1d2030] flex items-center justify-between">
        <h2 className="font-bold text-white text-base">
          {isEdit ? 'Edit Entry' : 'Add Entry'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-[#1d2030] text-[#5e6180] hover:text-white flex items-center justify-center text-sm"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
        {/* Type */}
        <div>
          <label className={labelCls}>ประเภท <span className="text-red-500 normal-case">*</span></label>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {QUICK_TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`px-3 py-1 rounded-xl text-xs font-medium border ${
                  form.type === t
                    ? 'bg-linear-to-br from-[#9BB4C0] to-[#BFC9D1] border-transparent text-[#0d0f17]'
                    : 'border-[#252840] text-[#6b6e8e] bg-transparent hover:border-[#BFC9D1]/50'
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
            className={inputCls}
          />
        </div>

        {/* Amount */}
        <div>
          <label className={labelCls}>จำนวนเงิน (THB) <span className="text-red-500 normal-case">*</span></label>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            placeholder="0"
            className={inputCls}
            autoFocus={autoFocus && !isEdit}
          />
        </div>

        {/* Name */}
        <div>
          <label className={labelCls}>
            ชื่อ asset <span className="text-[#3a3e5a] normal-case font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="เช่น GOOGL, MSFT, กสิกร…"
            className={inputCls}
          />
        </div>

        {/* Period */}
        <div>
          <label className={labelCls}>เดือน</label>
          <MonthPicker
            value={form.period}
            onChange={v => setForm(f => ({ ...f, period: v }))}
          />
        </div>

        {/* Note */}
        <div>
          <label className={labelCls}>
            หมายเหตุ <span className="text-[#3a3e5a] normal-case font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            placeholder="รายละเอียดเพิ่มเติม…"
            className={inputCls}
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1 pb-1">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 bg-[#1d2030] border border-[#252840] text-[#6b6e8e] py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-linear-to-br from-[#9BB4C0] to-[#BFC9D1] hover:from-[#AABFCA] hover:to-[#CDD7DC] active:from-[#8AA3B0] active:to-[#B0BEC8] disabled:opacity-40 text-[#0d0f17] py-3 rounded-xl text-sm font-semibold"
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
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-[#141824] rounded-t-3xl outline-none border-t border-[#1d2030]">
            <div className="mx-auto w-10 h-1 bg-[#252840] rounded-full mt-3 mb-1" />
            <FormContent period={period} entry={entry} onClose={onClose} onSuccess={onSuccess} />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 pointer-events-none" aria-hidden="true" />
      <div
        className="relative bg-[#141824] rounded-3xl w-full max-w-sm shadow-2xl border border-[#1d2030]"
        onClick={e => e.stopPropagation()}
      >
        <FormContent period={period} entry={entry} onClose={onClose} onSuccess={onSuccess} autoFocus />
      </div>
    </div>
  )
}
