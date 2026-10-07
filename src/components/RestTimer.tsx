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
      const endAt = Math.max(Date.now(), state.endAt) + seconds * 1000
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

  if (!state) return null
  const pct = Math.max(0, Math.min(100, (left / state.total) * 100))

  return (
    <div className={`timer ${finished ? 'finished' : ''}`} role="timer">
      <div className="time">{finished ? '¡Ya!' : fmtRest(left)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="small" style={{ fontWeight: 700 }}>
          {finished ? 'A por la siguiente serie 💪' : 'Descanso'}
        </div>
        <div className="small" style={{ opacity: 0.75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {state.label}
        </div>
      </div>
      {!finished && (
        <button className="btn sm" onClick={() => add(15)} aria-label="Añadir 15 segundos">
          +15s
        </button>
      )}
      <button className={`btn sm ${finished ? '' : 'ghost'}`} onClick={stop} aria-label="Cerrar temporizador">
        {finished ? 'OK' : 'Saltar'}
      </button>
      {!finished && <div className="bar" style={{ width: `${pct}%` }} />}
    </div>
  )
}
