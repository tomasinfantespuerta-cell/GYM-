import Dexie, { type Table } from 'dexie'
import { SEED_PROFILE, SEED_ROUTINE, SEED_WEIGHT } from './seed'
import type { Activity, BodyWeight, EntryLog, ExerciseNote, Profile, Routine, RoutineDay, Session } from './types'

class GymDB extends Dexie {
  routines!: Table<Routine, string>
  sessions!: Table<Session, string>
  activities!: Table<Activity, string>
  profile!: Table<Profile, string>
  bodyweights!: Table<BodyWeight, number>
  notes!: Table<ExerciseNote, string>

  constructor() {
    super('gym-log')
    this.version(1).stores({
      routines: '&id, active',
      sessions: '&id, date, dayId',
      activities: '&id, date',
      profile: '&id',
      bodyweights: '++id, date',
      notes: '&exerciseId',
    })
    this.on('populate', (tx) => {
      tx.table('routines').add(SEED_ROUTINE)
      tx.table('profile').add(SEED_PROFILE)
      tx.table('bodyweights').add(SEED_WEIGHT)
    })
  }
}

export const db = new GymDB()

/** Pide al navegador que no borre los datos aunque falte espacio. */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (navigator.storage?.persisted && (await navigator.storage.persisted())) return true
    return (await navigator.storage?.persist?.()) ?? false
  } catch {
    return false
  }
}

export function uid(): string {
  return crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

// ── Fechas (siempre en hora local)

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO(): string {
  return toISODate(new Date())
}

/** 1 = lunes … 7 = domingo */
export function weekdayOf(d: Date): number {
  return ((d.getDay() + 6) % 7) + 1
}

export function startOfWeek(d: Date): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  r.setDate(r.getDate() - (weekdayOf(r) - 1))
  return r
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

// ── Sesiones

export async function getActiveRoutine(): Promise<Routine | undefined> {
  return db.routines.where('active').equals(1).first()
}

function entriesFromDay(day: RoutineDay): EntryLog[] {
  return day.items.map((it, i) => ({
    key: `${it.exerciseId}-${i}`,
    itemIndex: i,
    exerciseId: it.exerciseId,
    variant: it.variant,
    optional: it.optional,
    sets: Array.from({ length: it.sets }, () => ({ weight: null, reps: null, rir: null, done: false })),
  }))
}

/** Devuelve la sesión de hoy para ese día de rutina, o la crea. */
export async function startOrResumeSession(routine: Routine, day: RoutineDay): Promise<string> {
  const date = todayISO()
  const existing = await db.sessions.where('date').equals(date).filter((s) => s.dayId === day.id).first()
  if (existing) return existing.id
  const session: Session = {
    id: uid(),
    date,
    routineId: routine.id,
    dayId: day.id,
    dayName: day.name,
    startedAt: new Date().toISOString(),
    entries: entriesFromDay(day),
    cardio: day.cardio ? { type: day.cardio.type, minutes: null, distanceKm: null, done: false } : undefined,
  }
  await db.sessions.add(session)
  return session.id
}

export interface LastPerformance {
  date: string
  variant?: string
  sets: { weight: number | null; reps: number | null; rir: number | null }[]
}

/** Última vez que se hizo un ejercicio (misma variante si se indica), sin contar la sesión actual. */
export async function lastPerformance(
  exerciseId: string,
  variant: string | undefined,
  excludeSessionId: string,
): Promise<LastPerformance | null> {
  const sessions = await db.sessions.orderBy('date').reverse().toArray()
  for (const s of sessions) {
    if (s.id === excludeSessionId) continue
    for (const e of s.entries) {
      if (e.exerciseId !== exerciseId) continue
      if (variant && e.variant && e.variant !== variant) continue
      const done = e.sets.filter((x) => x.done)
      if (done.length === 0) continue
      return { date: s.date, variant: e.variant, sets: done.map(({ weight, reps, rir }) => ({ weight, reps, rir })) }
    }
  }
  return null
}

export function sessionHasProgress(s: Session): boolean {
  return s.entries.some((e) => e.sets.some((x) => x.done)) || !!s.cardio?.done
}

// ── Copia de seguridad

export interface Backup {
  app: 'gym-log'
  version: 1
  exportedAt: string
  routines: Routine[]
  sessions: Session[]
  activities: Activity[]
  profile: Profile[]
  bodyweights: BodyWeight[]
  notes: ExerciseNote[]
}

export async function exportBackup(): Promise<Backup> {
  return {
    app: 'gym-log',
    version: 1,
    exportedAt: new Date().toISOString(),
    routines: await db.routines.toArray(),
    sessions: await db.sessions.toArray(),
    activities: await db.activities.toArray(),
    profile: await db.profile.toArray(),
    bodyweights: await db.bodyweights.toArray(),
    notes: await db.notes.toArray(),
  }
}

export async function importBackup(data: Backup): Promise<void> {
  if (data?.app !== 'gym-log') throw new Error('Este archivo no es una copia de Gym Log')
  await db.transaction('rw', [db.routines, db.sessions, db.activities, db.profile, db.bodyweights, db.notes], async () => {
    await Promise.all([
      db.routines.clear(),
      db.sessions.clear(),
      db.activities.clear(),
      db.profile.clear(),
      db.bodyweights.clear(),
      db.notes.clear(),
    ])
    await db.routines.bulkAdd(data.routines ?? [])
    await db.sessions.bulkAdd(data.sessions ?? [])
    await db.activities.bulkAdd(data.activities ?? [])
    await db.profile.bulkAdd(data.profile ?? [])
    await db.bodyweights.bulkAdd(data.bodyweights ?? [])
    await db.notes.bulkAdd(data.notes ?? [])
  })
}
