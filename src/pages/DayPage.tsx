import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EXERCISE_BY_ID } from '../data/exercises'
import { getActiveRoutine, startOrResumeSession, weekdayOf } from '../data/db'
import { fmtRest, groupSupersets } from '../data/progression'
import type { RoutineItem } from '../data/types'
import { WD_NAME } from './WeekPage'

export function targetText(it: RoutineItem): string {
  const ex = EXERCISE_BY_ID[it.exerciseId]
  const reps = it.repMin === it.repMax ? `${it.repMin}` : `${it.repMin}-${it.repMax}`
  return `${it.sets} × ${reps}${ex?.timed ? ' s' : ''}${it.note ? ` ${it.note}` : ''}`
}

export default function DayPage() {
  const { dayId } = useParams()
  const navigate = useNavigate()
  const routine = useLiveQuery(getActiveRoutine)
  const [open, setOpen] = useState<string | null>(null)

  if (!routine) return null
  const day = routine.days.find((d) => d.id === dayId)
  if (!day) return <div className="empty">Día no encontrado</div>

  const main = day.items.filter((x) => !x.optional)
  const extra = day.items.filter((x) => x.optional)
  const isToday = routine.flexible || weekdayOf(new Date()) === day.weekday
  const dayLabel = routine.flexible ? `Día ${routine.days.indexOf(day) + 1}` : WD_NAME[(day.weekday ?? 1) - 1]
  const totalSets = main.reduce((a, x) => a + x.sets, 0)

  async function start() {
    const id = await startOrResumeSession(routine!, day!)
    navigate(`/entreno/${id}`)
  }

  const renderItem = (it: RoutineItem, i: number) => {
    const ex = EXERCISE_BY_ID[it.exerciseId]
    const key = `${it.exerciseId}-${i}`
    return (
      <button key={key} className="card ex-card" style={{ display: 'block', width: '100%', textAlign: 'left' }} onClick={() => setOpen(open === key ? null : key)}>
        <div className="spread">
          <div style={{ minWidth: 0 }}>
            <h3>{ex?.name ?? it.exerciseId}</h3>
            <div className="target">
              {targetText(it)} · {it.restSec > 0 ? `descanso ${fmtRest(it.restSec)}` : 'sin descanso, pasa al siguiente'}
            </div>
          </div>
          {it.variant && <span className="badge">{it.variant}</span>}
        </div>
        {open === key && ex && (
          <>
            <ul className="tips">
              {ex.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            {ex.alternatives.length > 0 && (
              <div className="small muted" style={{ marginTop: 8 }}>
                Si está ocupado: {ex.alternatives.map((a) => EXERCISE_BY_ID[a]?.name).filter(Boolean).join(' · ')}
              </div>
            )}
          </>
        )}
      </button>
    )
  }

  return (
    <>
      <header className="topbar">
        <button className="back" onClick={() => navigate(-1)} aria-label="Volver">
          ‹
        </button>
        <div>
          <h1>{day.name}</h1>
          <div className="sub">
            {dayLabel} · {day.focus}
          </div>
        </div>
      </header>

      <div className="row" style={{ gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <span className="badge">{main.length} ejercicios</span>
        <span className="badge">{totalSets} series</span>
        {day.cardio && <span className="badge blue">+ {day.cardio.minutes}′ cardio</span>}
      </div>

      <button className="btn primary block lg" onClick={start}>
        {isToday ? '▶ Empezar entreno' : `▶ Hacer este entreno hoy`}
      </button>

      <div className="section-title">Ejercicios · toca para ver consejos</div>
      {groupSupersets(main, (it) => it.superset).map((g) =>
        g.items.length > 1 ? (
          <div key={`ss-${day.items.indexOf(g.items[0])}`} className="superset">
            <div className="superset-head">
              🔗 <b>Superserie</b> · una serie de cada uno seguidas, luego descanso
            </div>
            {g.items.map((it) => renderItem(it, day.items.indexOf(it)))}
          </div>
        ) : (
          renderItem(g.items[0], day.items.indexOf(g.items[0]))
        ),
      )}

      {day.cardio && (
        <div className="card" style={{ marginTop: 10 }}>
          <div className="spread">
            <div>
              <h3 style={{ margin: 0, fontSize: 17 }}>🚶 {day.cardio.type}</h3>
              <div className="target muted small">{day.cardio.minutes} minutos al terminar</div>
            </div>
            <span className="badge blue">Cardio</span>
          </div>
        </div>
      )}

      {extra.length > 0 && (
        <>
          <div className="section-title">➕ Opcionales · si vas sobrado de tiempo</div>
          {extra.map((it) => renderItem(it, day.items.indexOf(it)))}
        </>
      )}
    </>
  )
}
