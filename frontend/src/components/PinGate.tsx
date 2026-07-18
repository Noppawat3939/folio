import { useState, useEffect, useCallback } from 'react'
import { Drawer } from 'vaul'
import { verifyPin, isUnlocked, unlock, recordFailure, getLockoutUntil } from '~/utils/pin'

const PIN_LENGTH = 6

interface Props {
  onUnlocked: () => void
}

function PadButton({ label, sub, onClick }: { label: string; sub?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center w-20 h-16 rounded-2xl bg-[#141824] active:bg-[#1d2030] text-white select-none"
    >
      <span className="text-2xl font-light leading-none">{label}</span>
      {sub && <span className="text-[9px] tracking-widest text-[#404360] mt-0.5">{sub}</span>}
    </button>
  )
}

function PinContent({ onUnlocked }: Props) {
  const [digits, setDigits] = useState('')
  const [error, setError]   = useState('')
  const [lockUntil, setLockUntil] = useState<number | null>(getLockoutUntil)
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!lockUntil) return
    const tick = () => {
      const left = Math.ceil((lockUntil - Date.now()) / 1000)
      if (left <= 0) {
        setLockUntil(null)
        setError('')
      } else {
        setRemaining(left)
      }
    }
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [lockUntil])

  const press = useCallback((d: string) => {
    if (lockUntil) return
    setError('')
    setDigits(prev => {
      const next = (prev + d).slice(0, PIN_LENGTH)
      if (next.length === PIN_LENGTH) {
        if (verifyPin(next)) {
          unlock()
          onUnlocked()
        } else {
          const fails = recordFailure()
          const lo = getLockoutUntil()
          if (lo) {
            setLockUntil(lo)
            setError('')
          } else {
            setError(`Incorrect PIN · ${5 - fails} attempt${5 - fails === 1 ? '' : 's'} left`)
          }
        }
        return ''
      }
      return next
    })
  }, [lockUntil, onUnlocked])

  const del = useCallback(() => {
    if (lockUntil) return
    setDigits(prev => prev.slice(0, -1))
    setError('')
  }, [lockUntil])

  const locked = !!lockUntil

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 py-10 select-none">
      {/* Title */}
      <p className="text-[#5e6180] text-xs font-semibold uppercase tracking-widest mb-1">Folio</p>
      <h1 className="text-white text-xl font-bold mb-8">
        {locked ? 'Too many attempts' : 'Enter PIN'}
      </h1>

      {/* Dot indicators */}
      <div className="flex gap-4 mb-6">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors duration-100 ${
              i < digits.length ? 'bg-[#8494FF]' : 'bg-[#252840]'
            }`}
          />
        ))}
      </div>

      {/* Error / lockout message */}
      <div className="h-5 mb-6 text-center">
        {locked ? (
          <p className="text-amber-400 text-xs">Locked — try again in {remaining}s</p>
        ) : error ? (
          <p className="text-red-400 text-xs">{error}</p>
        ) : null}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 opacity-[.98]">
        {['1','2','3','4','5','6','7','8','9'].map(d => (
          <PadButton
            key={d}
            label={d}
            sub={['','ABC','DEF','GHI','JKL','MNO','PQRS','TUV','WXYZ'][Number(d)]}
            onClick={() => press(d)}
          />
        ))}
        <div /> {/* empty cell */}
        <PadButton label="0" onClick={() => press('0')} />
        <button
          type="button"
          onClick={del}
          disabled={locked || digits.length === 0}
          className="flex items-center justify-center w-20 h-16 rounded-2xl text-[#6367FF] text-2xl disabled:opacity-30"
          aria-label="Delete"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}

export default function PinGate({ onUnlocked }: Props) {
  if (isUnlocked()) {
    onUnlocked()
    return null
  }

  return (
    <Drawer.Root open dismissible={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-[#0d0f17] z-50" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0f17] rounded-t-3xl outline-none border-t border-[#1d2030] max-h-screen overflow-y-auto"
          aria-describedby={undefined}
        >
          <Drawer.Title className="sr-only">PIN Gate</Drawer.Title>
          <div className="mx-auto w-10 h-1 bg-[#252840] rounded-full mt-3 mb-1" />
          <PinContent onUnlocked={onUnlocked} />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
