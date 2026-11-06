import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ActivitySheet from '../components/ActivitySheet'
import { addDays, db, fromISODate, sessionHasProgress, startOfWeek, startOrResumeSession, toISODate, todayISO } from '../data/db'
import type { Routine, RoutineDay, Session } from '../data/types'
import { WD_SHORT } from './WeekPage'

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** Semana para rutinas sin días fijos: los entrenos se hacen en orden, cuando se pueda. */
export default function FlexWeek({ routine }: { routine: Routine }) {
  const navigate = useNavigate()
  const [activityDate, setActivityDate] = useState<string | null>(null)
  const today = new Date()
  const todayStr = todayISO()
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(today), i))
  const from = toISODate(days[0])
  const to = toISODate(days[6])
  const target = routine.weeklyTarget ?? routine.days.length

  const weekSessions =
    useLiveQuery(() => db.sessions.where('date').between(from, to, true, true).toArray(), [from, to])?.filter(sessionHasProgress) ?? []
  const activities = useLiveQuery(() => db.activities.where('date').between(from, to, true, true).toArray(), [from, to]) ?? []
  // Último entreno de esta rutina (de cualquier semana) para saber cuál toca después
  const lastSession = useLiveQuery(
    () =>
      db.sessions
        .orderBy('date')
        .reverse()
        .filter((s) => s.routineId === routine.id && sessionHasProgress(s))
        .first(),
    [routine.id],
  )
  const todaySession = useLiveQuery(
    () => db.sessions.where('date').equals(todayStr).filter((s) => s.routineId === routine.id).first(),
    [todayStr, routine.id],
  )

  const mine = weekSessions.filter((s) => s.routineId === routine.id)
  const doneThisWeek = (day: RoutineDay): Session | undefined => mine.find((s) => s.dayId === day.id)
  const lastIdx = lastSession ? routine.days.findIndex((d) => d.id === lastSession.dayId) : -1
  // El siguiente en orden después del último hecho; si ya está hecho esta semana, el primero pendiente
  let next = routine.days[(lastIdx + 1) % routine.days.length]
  if (doneThisWeek(next)) next = routine.days.find((d) => !doneThisWeek(d)) ?? next
  const count = mine.length
  const todayDay = todaySession ? routine.days.find((d) => d.id === todaySession.dayId) : undefined

  async function goTrain(day: RoutineDay) {
    const id = await startOrResumeSession(routine, day)
    navigate(`/entreno/${id}`)
  }

  return (
    <>
      <header className="topbar">
        <div style={{ flex: 1 }}>
          <h1>
            Gym <span className="brand">Log</span>
          </h1>
          <div className="sub">
            Semana del {days[0].getDate()} {MONTHS[days[0].getMonth()]} al {days[6].getDate()} {MONTHS[days[6].getMonth()]}
          </div>
        </div>
        <span className={`badge ${count >= target ? 'accent' : ''} num`}>
          {count}/{target} entrenos
        </span>
      </header>

      <div className="week-strip">
        {days.map((d, i) => {
          const iso = toISODate(d)
          const trained = weekSessions.some((s) => s.date === iso)
          const act = activities.some((a) => a.date === iso)
          const cls = ['d', trained ? 'train ok' : act ? 'act' : '', iso === todayStr ? 'is-today' : ''].join(' ')
          return (
            <div key={iso} className={cls}>
              {WD_SHORT[i]}
              <b>{d.getDate()}</b>
              <div className="dot" />
            </div>
          )
        })}
      </div>

      {todaySession && todayDay ? (
        <div className="hero">
          <span className="badge accent">Hoy · Día {routine.days.indexOf(todayDay) + 1}</span>
          <h2>{todayDay.name}</h2>
          <div className="muted small">{todaySession.finishedAt ? '¡Entreno de hoy hecho! 💪' : 'Tienes el entreno de hoy a medias.'}</div>
          {todaySession.finishedAt ? (
            <button className="btn primary block lg" style={{ marginTop: 14 }} onClick={() => navigate(`/resumen/${todaySession.id}`)}>
              🧠 Ver el análisis
            </button>
          ) : (
            <button className="btn primary block lg" style={{ marginTop: 14 }} onClick={() => navigate(`/entreno/${todaySession.id}`)}>
              ▶ Continuar entreno
            </button>
          )}
        </div>
      ) : (
        <div className="hero">
          <span className="badge accent">{count >= target ? '¡Semana completada! · extra' : 'Hoy toca'}</span>
          <h2>
            Día {routine.days.indexOf(next) + 1} · {next.name}
          </h2>
          <div className="muted small">{next.focus}</div>
          <button className="btn primary block lg" style={{ marginTop: 14 }} onClick={() => goTrain(next)}>
            ▶ Empezar entreno
          </button>
          <div className="small muted" style={{ marginTop: 10 }}>
            ¿Prefieres otro? Elige abajo cualquier día.
          </div>
        </div>
      )}

      <div className="progress" style={{ margin: '14px 4px 0' }}>
        <div style={{ width: `${Math.min(100, (count / target) * 100)}%` }} />
      </div>

      <div className="section-title">Tus {routine.days.length} entrenos · en orden</div>
      {routine.days.map((d, i) => {
        const s = doneThisWeek(d)
        const doneDay = s ? WD_SHORT[(fromISODate(s.date).getDay() + 6) % 7] : null
        const isNext = !todaySession && d.id === next.id
        return (
          <Link key={d.id} to={`/dia/${d.id}`} className={`card tap day-card ${isNext ? 'today' : ''} ${s ? 'done' : ''}`} style={{ display: 'block' }}>
            <div className="row">
              <div className="wd">
                Día
                <b>{i + 1}</b>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="dname">{d.name}</div>
                <div className="muted small">{d.focus}</div>
                <div className="muted small" style={{ marginTop: 4 }}>
                  {d.items.filter((x) => !x.optional).length} ejercicios
                  {d.cardio ? ` · ${d.cardio.minutes}′ ${d.cardio.type.toLowerCase()}` : ''}
                </div>
              </div>
              {s ? (
                <span className="badge accent">✓ {doneDay}</span>
              ) : isNext ? (
                <span className="badge accent">Siguiente</span>
              ) : (
                <span className="muted" style={{ fontSize: 22 }}>
                  ›
                </span>
              )}
            </div>
          </Link>
        )
      })}

      <div className="section-title">Actividad libre</div>
      <button className="card tap day-card" style={{ display: 'block', width: '100%', textAlign: 'left' }} onClick={() => setActivityDate(todayStr)}>
        <div className="row">
          <div style={{ flex: 1 }}>
            <div className="dname">⚽ Fútbol, pádel, bici, caminar…</div>
            <div className="muted small">
              {activities.length
                ? activities.map((a) => `${WD_SHORT[(fromISODate(a.date).getDay() + 6) % 7]} ${a.type}${a.minutes ? ` ${a.minutes}′` : ''}`).join(' · ')
                : 'Apunta lo que hagas fuera del gimnasio'}
            </div>
          </div>
          <span className="badge blue">+ Hoy</span>
        </div>
      </button>

      {activityDate && <ActivitySheet date={activityDate} onClose={() => setActivityDate(null)} />}
    </>
  )
}
