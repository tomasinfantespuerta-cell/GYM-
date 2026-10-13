import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db, fromISODate } from '../data/db'
import { exerciseName } from '../data/exercises'
import type { Verdict } from '../data/types'
import { WD_NAME } from './WeekPage'

const VERDICT: Record<Verdict, { label: string; cls: string }> = {
  up: { label: '⬆ Progreso', cls: 'accent' },
  ok: { label: '= Igual', cls: '' },
  down: { label: '⬇ Peor', cls: 'warn' },
  first: { label: 'Primera vez', cls: 'blue' },
  skipped: { label: 'No hecho', cls: 'danger' },
}

export default function ReviewPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const session = useLiveQuery(() => db.sessions.get(sessionId!), [sessionId])

  if (session === undefined) return null
  if (!session?.review) {
    return (
      <div className="empty">
        Este entreno aún no tiene análisis.
        <br />
        <Link to={`/entreno/${sessionId}`} className="brand">
          Terminar el entreno
        </Link>
      </div>
    )
  }

  const r = session.review
  const d = fromISODate(session.date)
  const done = session.entries.flatMap((e) => e.sets.filter((s) => s.done))
  const volume = done.reduce((a, s) => a + (s.weight ?? 0) * (s.reps ?? 0), 0)
  const minutes = session.finishedAt ? Math.round((new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 60000) : null
  const pct = r.score * 10

  return (
    <>
      <header className="topbar">
        <button className="back" onClick={() => navigate('/')} aria-label="Volver">
          ‹
        </button>
        <div>
          <h1>Análisis del coach</h1>
          <div className="sub">
            {session.dayName} · {WD_NAME[(d.getDay() + 6) % 7]} {d.getDate()}/{d.getMonth() + 1}
          </div>
        </div>
      </header>

      <div className="hero">
        <div className="row" style={{ gap: 16 }}>
          <div className="score" style={{ background: `conic-gradient(var(--accent) ${pct}%, var(--surface-2) 0)` }}>
            <div>
              <b>{r.score}</b>
              <span>/10</span>
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0 }}>{r.headline}</h2>
            <div className="muted small num" style={{ marginTop: 4 }}>
              {done.length} series · {Math.round(volume).toLocaleString('es-ES')} kg
              {minutes != null ? ` · ${minutes} min` : ''}
              {session.cardio?.done ? ` · ${session.cardio.minutes ?? ''}′ cardio` : ''}
            </div>
          </div>
        </div>
      </div>

      {r.good.length > 0 && (
        <>
          <div className="section-title">✅ Lo que has hecho bien</div>
          <div className="card">
            <ul className="review-list">
              {r.good.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      {r.improve.length > 0 && (
        <>
          <div className="section-title">🎯 A mejorar</div>
          <div className="card">
            <ul className="review-list improve">
              {r.improve.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="section-title">Ejercicio a ejercicio</div>
      {r.exercises.map((x, i) => (
        <div key={`${x.exerciseId}-${i}`} className="card">
          <div className="spread" style={{ alignItems: 'flex-start' }}>
            <div style={{ fontWeight: 800 }}>{exerciseName(x.exerciseId)}</div>
            <span className={`badge ${VERDICT[x.verdict].cls}`}>{VERDICT[x.verdict].label}</span>
          </div>
          <div className="muted small num" style={{ marginTop: 4 }}>
            {x.summary}
          </div>
          {x.nextTip && (
            <div className="hint" style={{ marginTop: 10 }}>
              <b>Para la próxima:</b> {x.nextTip}
            </div>
          )}
        </div>
      ))}

      <p className="small muted" style={{ textAlign: 'center', margin: '18px 10px 0' }}>
        🧠 Los consejos "para la próxima" te aparecerán en cada ejercicio en tu siguiente entreno.
      </p>

      <Link to="/" className="btn primary block lg" style={{ marginTop: 16 }}>
        Volver a la semana
      </Link>
      <Link to={`/entreno/${session.id}`} className="btn ghost block" style={{ marginTop: 10 }}>
        Ver o corregir el entreno
      </Link>
    </>
  )
}
