import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db, fromISODate, sessionHasProgress } from '../data/db'
import { WD_NAME } from './WeekPage'

export default function HistoryPage() {
  const sessions = useLiveQuery(() => db.sessions.orderBy('date').reverse().toArray()) ?? []
  const activities = useLiveQuery(() => db.activities.orderBy('date').reverse().toArray()) ?? []

  const items = [
    ...sessions.filter(sessionHasProgress).map((s) => ({ kind: 'session' as const, date: s.date, s })),
    ...activities.map((a) => ({ kind: 'activity' as const, date: a.date, a })),
  ].sort((x, y) => y.date.localeCompare(x.date))

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Historial</h1>
          <div className="sub">Tus entrenos y actividades</div>
        </div>
      </header>

      {items.length === 0 && (
        <div className="empty">
          Aún no hay entrenos.
          <br />
          ¡El primero es el más importante! 💪
        </div>
      )}

      {items.map((it) => {
        const d = fromISODate(it.date)
        const when = `${WD_NAME[(d.getDay() + 6) % 7]} ${d.getDate()}/${d.getMonth() + 1}`
        if (it.kind === 'activity') {
          return (
            <div key={`a-${it.a.id}`} className="card">
              <div className="spread">
                <div>
                  <div style={{ fontWeight: 800 }}>{it.a.type}</div>
                  <div className="muted small">
                    {when}
                    {it.a.minutes ? ` · ${it.a.minutes} min` : ''}
                    {it.a.notes ? ` · ${it.a.notes}` : ''}
                  </div>
                </div>
                <span className="badge blue">Actividad</span>
              </div>
            </div>
          )
        }
        const s = it.s
        const sets = s.entries.reduce((a, e) => a + e.sets.filter((x) => x.done).length, 0)
        const volume = s.entries.reduce((a, e) => a + e.sets.filter((x) => x.done).reduce((b, x) => b + (x.weight ?? 0) * (x.reps ?? 0), 0), 0)
        const mins = s.finishedAt ? Math.round((new Date(s.finishedAt).getTime() - new Date(s.startedAt).getTime()) / 60000) : null
        return (
          <Link key={s.id} to={`/entreno/${s.id}`} className="card tap" style={{ display: 'block' }}>
            <div className="spread">
              <div>
                <div style={{ fontWeight: 800 }}>{s.dayName}</div>
                <div className="muted small num">
                  {when} · {sets} series · {Math.round(volume).toLocaleString('es-ES')} kg
                  {mins != null ? ` · ${mins} min` : ''}
                  {s.cardio?.done ? ` · ${s.cardio.minutes ?? ''}′ cardio` : ''}
                </div>
              </div>
              {s.finishedAt ? <span className="badge accent">✓</span> : <span className="badge warn">A medias</span>}
            </div>
          </Link>
        )
      })}
    </>
  )
}
