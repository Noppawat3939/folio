import type { Entry } from '~/types'

export default function ConfirmDeleteModal({ entry, onCancel, onConfirm, deleting }: {
  entry: Entry
  onCancel: () => void
  onConfirm: () => void
  deleting: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 pointer-events-none" aria-hidden="true" />
      <div
        className="relative bg-[#141824] rounded-3xl w-full max-w-sm mx-4 shadow-2xl border border-[#1d2030] p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-white font-bold text-base mb-2">ยืนยันการลบ</h3>
        <p className="text-[#6b6e8e] text-sm mb-6">
          ต้องการลบ <span className="text-white font-medium">"{entry.name ?? entry.type}"</span> ออกใช่ไหม?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 bg-[#1d2030] border border-[#252840] text-[#6b6e8e] py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-40 text-white py-3 rounded-xl text-sm font-semibold"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
