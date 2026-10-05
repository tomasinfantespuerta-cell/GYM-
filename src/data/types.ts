/** 1 = lunes … 7 = domingo */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface RoutineItem {
  exerciseId: string
  sets: number
  repMin: number
  repMax: number
  restSec: number
  optional?: boolean
  /** Variante sugerida por defecto (Multipower, Mancuernas…) */
  variant?: string
  /** Texto libre para casos especiales, p. ej. "por pierna" */
  note?: string
}

export interface CardioPlan {
  type: string
  minutes: number
}

export interface RoutineDay {
  id: string
  weekday: Weekday
  name: string
  focus: string
  items: RoutineItem[]
  cardio?: CardioPlan
}

export interface Routine {
  id: string
  name: string
  /** 1 = rutina activa (Dexie no indexa booleanos) */
  active: 0 | 1
  createdAt: string
  days: RoutineDay[]
  /** Día de actividad libre (fútbol, pádel, bici…) */
  activityWeekday?: Weekday
}

export interface SetLog {
  weight: number | null
  reps: number | null
  /** Repeticiones en reserva: 0 = al fallo, 3 = "podría haber hecho 3 más o más" */
  rir: number | null
  done: boolean
}

export interface EntryLog {
  /** Clave única dentro de la sesión */
  key: string
  /** Posición del ejercicio en el día de la rutina (para saber series/reps objetivo) */
  itemIndex: number
  exerciseId: string
  variant?: string
  optional?: boolean
  /** Si se sustituyó, el ejercicio original de la rutina */
  replaces?: string
  sets: SetLog[]
}

export interface CardioLog {
  type: string
  minutes: number | null
  distanceKm: number | null
  done: boolean
}

export interface Session {
  id: string
  /** Fecha local YYYY-MM-DD */
  date: string
  routineId: string
  dayId: string
  dayName: string
  startedAt: string
  finishedAt?: string
  entries: EntryLog[]
  cardio?: CardioLog
  notes?: string
}

export interface Activity {
  id: string
  date: string
  type: string
  minutes: number | null
  notes?: string
}

export interface Profile {
  id: 'me'
  name: string
  birthDate: string
  heightCm: number
  goal: string
  experience: string
  notes: string
}

export interface BodyWeight {
  id?: number
  date: string
  kg: number
}

export interface ExerciseNote {
  exerciseId: string
  note: string
}
