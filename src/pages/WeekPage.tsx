import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ActivitySheet from '../components/ActivitySheet'
import { addDays, db, getActiveRoutine, sessionHasProgress, startOfWeek, startOrResumeSession, toISODate, todayISO, weekdayOf } from '../data/db'
import { isReadaptation, programWeek } from '../data/progression'
import type { Activity, RoutineDay, Session } from '../data/types'

export const WD_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
export const WD_NAME = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export default function WeekPage() {
  const navigate = useNavigate()
  const [activityDate, setActivityDate] = useState<string | null>(null)
  const today = new Date()
  const todayStr = todayISO()
  const monday = startOfWeek(today)
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  const from = toISODate(days[0])
  const to = toISODate(days[6])

  const routine = useLiveQuery(getActiveRoutine)
  const sessions = useLiveQuery(() => db.sessions.where('date').between(from, to, true, true).toArray(), [from, to]) ?? []
  const activities = useLiveQuery(() => db.activities.where('date').between(from, to, true, true).toArray(), [from, to]) ?? []

  if (!routine) return null

  const dayFor = (wd: number) => routine.days.find((d) => d.weekday === wd)
  const sessionFor = (day: RoutineDay): Session | undefined =>
    sessions.find((s) => s.dayId === day.id && sessionHasProgress(s))
  const activityOn = (date: string): Activity | undefined => activities.find((a) => a.date === date)

  const todayWd = weekdayOf(today)
  const todayDay = dayFor(todayWd)
  const todaySession = todayDay && sessions.find((s) => s.date === todayStr && s.dayId === todayDay.id)
  const doneCount = routine.days.filter((d) => sessionFor(d)).length
  const week = programWeek(todayStr)

  async function goTrain(day: RoutineDay) {
    const id = await startOrResumeSession(routine!, day)
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
        <span className={`badge ${isReadaptation(todayStr) ? 'warn' : 'accent'}`}>
          Semana {week}
          {isReadaptation(todayStr) ? ' · Readaptación' : ''}
        </span>
      </header>

      <div className="week-strip">
        {days.map((d, i) => {
          const iso = toISODate(d)
          const rd = dayFor(i + 1)
          const ok = (rd && sessionFor(rd)) || activityOn(iso)
          const cls = [
            'd',
            rd ? 'train' : routine.activityWeekday === i + 1 ? 'act' : '',
            ok ? 'ok' : '',
            iso === todayStr ? 'is-today' : '',
          ].join(' ')
          return (
            <div key={iso} className={cls}>
              {WD_SHORT[i]}
              <b>{d.getDate()}</b>
              <div className="dot" />
            </div>
          )
        })}
      </div>

      {todayDay ? (
        <div className="hero">
          <span className="badge accent">Hoy · {WD_NAME[todayWd - 1]}</span>
          <h2>{todayDay.name}</h2>
          <div className="muted small">{todayDay.focus}</div>
          <button className="btn primary block lg" style={{ marginTop: 14 }} onClick={() => goTrain(todayDay)}>
            {todaySession?.finishedAt ? '✓ Ver entreno de hoy' : todaySession ? '▶ Continuar entreno' : '▶ Empezar entreno'}
          </button>
        </div>
      ) : routine.activityWeekday === todayWd ? (
        <div className="hero">
          <span className="badge blue">Hoy · {WD_NAME[todayWd - 1]}</span>
          <h2>Actividad libre</h2>
          <div className="muted small">Fútbol, pádel, bici, caminar con los perros… ¡muévete!</div>
          <button className="btn primary block lg" style={{ marginTop: 14 }} onClick={() => setActivityDate(todayStr)}>
            {activityOn(todayStr) ? '✓ Actividad apuntada' : '+ Apuntar actividad'}
          </button>
        </div>
      ) : (
        <div className="hero">
          <span className="badge">Hoy · {WD_NAME[todayWd - 1]}</span>
          <h2>Descanso</h2>
          <div className="muted small">Recuperar también es entrenar. Hidrátate y duerme bien.</div>
        </div>
      )}

      <div className="spread section-title">
        <span>Esta semana</span>
        <span className="num">
          {doneCount}/{routine.days.length} entrenos
        </span>
      </div>

      {days.map((d, i) => {
        const iso = toISODate(d)
        const wd = i + 1
        const rd = dayFor(wd)
        if (rd) {
          const s = sessionFor(rd)
          const isToday = iso === todayStr
          return (
            <Link key={iso} to={`/dia/${rd.id}`} className={`card tap day-card ${isToday ? 'today' : ''} ${s ? 'done' : ''}`} style={{ display: 'block' }}>
              <div className="row">
                <div className="wd">
                  {WD_SHORT[i]}
                  <b>{d.getDate()}</b>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="dname">{rd.name}</div>
                  <div className="muted small">{rd.focus}</div>
                  <div className="muted small" style={{ marginTop: 4 }}>
                    {rd.items.filter((x) => !x.optional).length} ejercicios
                    {rd.cardio ? ` · ${rd.cardio.minutes}′ ${rd.cardio.type.toLowerCase()}` : ''}
                  </div>
                </div>
                {s ? (
                  <span className="badge accent">✓ Hecho</span>
                ) : isToday ? (
                  <span className="badge accent">Hoy</span>
                ) : (
                  <span className="muted" style={{ fontSize: 22 }}>›</span>
                )}
              </div>
            </Link>
          )
        }
        if (routine.activityWeekday === wd) {
          const a = activityOn(iso)
          return (
            <button key={iso} className="card tap day-card" style={{ display: 'block', width: '100%', textAlign: 'left' }} onClick={() => setActivityDate(iso)}>
              <div className="row">
                <div className="wd">
                  {WD_SHORT[i]}
                  <b>{d.getDate()}</b>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="dname">Actividad libre</div>
                  <div className="muted small">{a ? `${a.type}${a.minutes ? ` · ${a.minutes} min` : ''}` : 'Fútbol, pádel, bici, caminar…'}</div>
                </div>
                {a ? <span className="badge blue">✓ Hecho</span> : <span className="badge blue">+ Apuntar</span>}
              </div>
            </button>
          )
        }
        return (
          <div key={iso} className="rest-line">
            {WD_SHORT[i]} {d.getDate()} · Descanso
          </div>
        )
      })}

      {activityDate && <ActivitySheet date={activityDate} onClose={() => setActivityDate(null)} />}
    </>
  )
}
