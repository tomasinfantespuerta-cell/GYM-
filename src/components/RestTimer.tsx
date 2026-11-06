import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { fmtRest } from '../data/progression'

interface TimerState {
  endAt: number
  total: number
  label: string
}

interface TimerApi {
  state: TimerState | null
  start: (seconds: number, label: string) => void
  add: (seconds: number) => void
  stop: () => void
}

const KEY = 'gymlog.rest-timer'
const Ctx = createContext<TimerApi | null>(null)

function load(): TimerState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as TimerState
    // Si terminó hace más de un minuto, ya no tiene sentido mostrarlo
    return s.endAt > Date.now() - 60_000 ? s : null
  } catch {
    return null
  }
}

function save(s: TimerState | null) {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s))
    else localStorage.removeItem(KEY)
  } catch {
    /* sin almacenamiento: el temporizador funciona igual en memoria */
  }
}

export function RestTimerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TimerState | null>(load)

  const update = useCallback((s: TimerState | null) => {
    save(s)
    setState(s)
  }, [])

  const api: TimerApi = {
    state,
    start: (seconds, label) => {
      update({ endAt: Date.now() + seconds * 1000, total: seconds, label })
    },
    add: (seconds) => {
      if (!state) return
      const endAt = Math.max(Date.now() + 1000, Math.max(Date.now(), state.endAt) + seconds * 1000)
      update({ ...state, endAt, total: Math.max(state.total, Math.round((endAt - Date.now()) / 1000)) })
    },
    stop: () => update(null),
  }
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useRestTimer(): TimerApi {
  const c = useContext(Ctx)
  if (!c) throw new Error('useRestTimer fuera de RestTimerProvider')
  return c
}

export function RestTimer() {
  const { state, add, stop } = useRestTimer()
  const [now, setNow] = useState(Date.now())
  const alerted = useRef<number | null>(null)

  useEffect(() => {
    if (!state) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [state])

  const left = state ? Math.ceil((state.endAt - now) / 1000) : 0
  const finished = !!state && left <= 0

  useEffect(() => {
    if (!state || !finished || alerted.current === state.endAt) return
    alerted.current = state.endAt
    // Solo vibración, sin sonido
    navigator.vibrate?.([400, 150, 400, 150, 600])
  }, [finished, state])

  // Se cierra solo un rato después de terminar
  useEffect(() => {
    if (!finished) return
    const id = setTimeout(stop, 15_000)
    return () => clearTimeout(id)
  }, [finished, stop])

  // Mantiene la pantalla encendida durante el descanso para que el aviso llegue
  useEffect(() => {
    if (!state) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false
    navigator.wakeLock
      ?.request('screen')
      .then((l) => {
        if (cancelled) l.release()
        else lock = l
      })
      .catch(() => {})
    return () => {
      cancelled = true
      lock?.release().catch(() => {})
    }
  }, [state])

  if (!state) return null
  const frac = Math.max(0, Math.min(1, left / state.total))
  const R = 120
  const C = 2 * Math.PI * R

  return (
    <div className={`timer-full ${finished ? 'finished' : ''}`} role="timer" aria-live="polite">
      <div className="timer-label">{finished ? '¡Descanso terminado!' : 'Descanso'}</div>
      <div className="timer-ring">
        <svg viewBox="0 0 280 280" aria-hidden="true">
          <circle cx="140" cy="140" r={R} className="track" />
          {!finished && <circle cx="140" cy="140" r={R} className="fill" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} />}
        </svg>
        <div className="timer-time">{finished ? '¡Ya!' : fmtRest(left)}</div>
      </div>
      <div className="timer-next">{finished ? 'A por la siguiente serie 💪' : state.label}</div>
      {finished ? (
        <button className="btn primary lg timer-main" onClick={stop}>
          Empezar la serie
        </button>
      ) : (
        <>
          <div className="row" style={{ gap: 12 }}>
            <button className="btn lg" onClick={() => add(-15)} aria-label="Quitar 15 segundos">
              −15 s
            </button>
            <button className="btn lg" onClick={() => add(15)} aria-label="Añadir 15 segundos">
              +15 s
            </button>
          </div>
          <button className="btn ghost timer-skip" onClick={stop}>
            Saltar descanso
          </button>
        </>
      )}
    </div>
  )
}
