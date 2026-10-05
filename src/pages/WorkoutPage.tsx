import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ExerciseCard from '../components/ExerciseCard'
import { useRestTimer } from '../components/RestTimer'
import { db, fromISODate } from '../data/db'
import { exerciseName } from '../data/exercises'
import type { CardioLog, EntryLog, Session } from '../data/types'
import { WD_NAME } from './WeekPage'

const CARDIO_TYPES = ['Cinta inclinada', 'Correr', 'Bici', 'Elíptica', 'Escaleras', 'Remo']

export default function WorkoutPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const timer = useRestTimer()
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [showOptional, setShowOptional] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [, tick] = useState(0)

  // Se carga una vez: a partir de ahí la pantalla manda y cada cambio se guarda al instante.
  useEffect(() => {
    db.sessions.get(sessionId!).then((s) => setSession(s ?? null))
  }, [sessionId])

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const routine = useLiveQuery(() => (session ? db.routines.get(session.routineId) : undefined), [session?.routineId])

  if (session === undefined || (session && !routine)) return null
  if (session === null) return <div className="empty">Este entreno no existe.</div>

  const day = routine!.days.find((d) => d.id === session.dayId)
  if (!day) return <div className="empty">El día de este entreno ya no está en la rutina.</div>

  function update(fn: (s: Session) => Session) {
    setSession((prev) => {
      if (!prev) return prev
      const next = fn(prev)
      db.sessions.put(next)
      return next
    })
  }
  function updateEntry(e: EntryLog) {
    update((s) => ({ ...s, entries: s.entries.map((x) => (x.key === e.key ? e : x)) }))
  }
  function updateCardio(patch: Partial<CardioLog>) {
    update((s) => {
      const base: CardioLog = s.cardio ?? { type: CARDIO_TYPES[0], minutes: null, distanceKm: null, done: false }
      return { ...s, cardio: { ...base, ...patch } }
    })
  }

  const main = session.entries.filter((e) => !e.optional)
  const optional = session.entries.filter((e) => e.optional)
  const totalSets = main.reduce((a, e) => a + e.sets.length, 0)
  const doneSets = main.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0)
  const extraDone = optional.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0)
  const pct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0
  const end = session.finishedAt ? new Date(session.finishedAt) : new Date()
  const minutes = Math.max(0, Math.round((end.getTime() - new Date(session.startedAt).getTime()) / 60000))
  const date = fromISODate(session.date)

  async function finish() {
    const volume = session!.entries.reduce(
      (a, e) => a + e.sets.filter((s) => s.done).reduce((b, s) => b + (s.weight ?? 0) * (s.reps ?? 0), 0),
      0,
    )
    update((s) => ({ ...s, finishedAt: s.finishedAt ?? new Date().toISOString() }))
    timer.stop()
    setToast(`¡Entreno terminado! ${doneSets + extraDone} series · ${Math.round(volume).toLocaleString('es-ES')} kg movidos 💪`)
    setTimeout(() => navigate('/'), 2200)
  }

  async function remove() {
    if (!confirm('¿Borrar este entreno? Se perderán las series apuntadas.')) return
    await db.sessions.delete(session!.id)
    timer.stop()
    navigate('/', { replace: true })
  }

  return (
    <>
      {toast && <div className="toast">{toast}</div>}
      <header className="topbar">
        <button className="back" onClick={() => navigate('/')} aria-label="Volver">
          ‹
        </button>
        <div style={{ flex: 1 }}>
          <h1>{session.dayName}</h1>
          <div className="sub">
            {WD_NAME[(date.getDay() + 6) % 7]} {date.getDate()}/{date.getMonth() + 1} · {minutes} min
            {session.finishedAt ? ' · terminado' : ''}
          </div>
        </div>
        <span className="badge accent num">
          {doneSets}/{totalSets}
        </span>
      </header>
      <div className="progress" style={{ marginTop: -6, marginBottom: 6 }}>
        <div style={{ width: `${pct}%` }} />
      </div>
      <div className="small muted" style={{ margin: '0 2px 8px' }}>
        💾 Todo se guarda solo al escribir. Puedes salir y volver cuando quieras.
      </div>

      <div className="section-title">Ejercicios · en el orden que quieras</div>
      {main.map((e) => (
        <ExerciseCard key={e.key} entry={e} item={day.items[e.itemIndex]} sessionId={session.id} date={session.date} onChange={updateEntry} />
      ))}

      {session.cardio && (
        <>
          <div className="section-title">Cardio final</div>
          <div className={`card ${session.cardio.done ? 'ex-card complete' : ''}`}>
            <div className="chips">
              {CARDIO_TYPES.map((t) => (
                <button key={t} className={`chip ${session.cardio!.type === t ? 'on' : ''}`} onClick={() => updateCardio({ type: t })}>
                  {t}
                </button>
              ))}
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <div style={{ flex: 1 }}>
                <label className="lbl" style={{ marginTop: 0 }}>
                  Minutos
                </label>
                <input
                  className="field"
                  inputMode="numeric"
                  placeholder={String(day.cardio?.minutes ?? 20)}
                  value={session.cardio.minutes ?? ''}
                  onChange={(ev) => {
                    const n = parseInt(ev.target.value.replace(/\D/g, ''), 10)
                    updateCardio({ minutes: Number.isFinite(n) ? n : null })
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="lbl" style={{ marginTop: 0 }}>
                  Km (opcional)
                </label>
                <input
                  className="field"
                  inputMode="decimal"
                  placeholder="–"
                  defaultValue={session.cardio.distanceKm?.toString().replace('.', ',') ?? ''}
                  onChange={(ev) => {
                    const n = parseFloat(ev.target.value.replace(',', '.'))
                    updateCardio({ distanceKm: Number.isFinite(n) ? n : null })
                  }}
                />
              </div>
              <div>
                <label className="lbl" style={{ marginTop: 0 }}>
                  &nbsp;
                </label>
                <button
                  className={`check ${session.cardio.done ? 'on' : ''}`}
                  onClick={() =>
                    updateCardio({ done: !session.cardio!.done, minutes: session.cardio!.minutes ?? day.cardio?.minutes ?? null })
                  }
                  aria-label="Cardio hecho"
                >
                  ✓
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {optional.length > 0 && (
        <>
          <div className="section-title">➕ Opcionales · si vas sobrado</div>
          {optional.map((e) =>
            showOptional[e.key] || e.sets.some((s) => s.done) ? (
              <ExerciseCard key={e.key} entry={e} item={day.items[e.itemIndex]} sessionId={session.id} date={session.date} onChange={updateEntry} />
            ) : (
              <button key={e.key} className="option" style={{ marginTop: 8 }} onClick={() => setShowOptional({ ...showOptional, [e.key]: true })}>
                + {exerciseName(e.exerciseId)}
              </button>
            ),
          )}
        </>
      )}

      <div className="section-title">Notas del día</div>
      <textarea
        className="text-input"
        rows={2}
        placeholder="Cómo te has sentido, molestias, energía…"
        defaultValue={session.notes ?? ''}
        onChange={(ev) => {
          const notes = ev.target.value
          update((s) => ({ ...s, notes }))
        }}
      />

      <button className="btn primary block lg" style={{ marginTop: 20 }} onClick={finish} disabled={doneSets + extraDone === 0 && !session.cardio?.done}>
        {session.finishedAt ? '✓ Guardar y volver' : '🏁 Terminar entreno'}
      </button>
      <button className="btn ghost danger block" style={{ marginTop: 10 }} onClick={remove}>
        Borrar este entreno
      </button>
    </>
  )
}
