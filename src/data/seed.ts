import type { BodyWeight, Profile, Routine } from './types'

/** Rutina de octubre de 2026 (3 días fijos). Se conserva para el historial. */
export const LEGACY_ROUTINE_3D: Routine = {
  id: 'ppl-3d-v1',
  name: 'Empuje / Pierna / Tirón · 3 días',
  active: 1,
  createdAt: '2026-10-05',
  activityWeekday: 7,
  days: [
    {
      id: 'empuje',
      weekday: 1,
      name: 'Empuje',
      focus: 'Pecho · Hombro · Tríceps',
      items: [
        { exerciseId: 'press-banca', sets: 4, repMin: 6, repMax: 8, restSec: 120, variant: 'Multipower' },
        { exerciseId: 'press-inclinado', sets: 3, repMin: 8, repMax: 10, restSec: 90, variant: 'Mancuernas' },
        { exerciseId: 'press-militar', sets: 3, repMin: 8, repMax: 10, restSec: 90, variant: 'Mancuernas' },
        { exerciseId: 'elevaciones-laterales', sets: 3, repMin: 12, repMax: 15, restSec: 60, variant: 'Mancuernas' },
        { exerciseId: 'extension-triceps-polea', sets: 3, repMin: 10, repMax: 12, restSec: 60, variant: 'Cuerda' },
        { exerciseId: 'aperturas-polea', sets: 3, repMin: 12, repMax: 15, restSec: 60, optional: true },
        { exerciseId: 'press-frances', sets: 2, repMin: 10, repMax: 12, restSec: 60, optional: true, variant: 'Barra Z' },
      ],
      cardio: { type: 'Cinta inclinada', minutes: 20 },
    },
    {
      id: 'pierna',
      weekday: 3,
      name: 'Pierna',
      focus: 'Cuádriceps · Femoral · Gemelo · Abdomen',
      items: [
        { exerciseId: 'sentadilla', sets: 4, repMin: 6, repMax: 8, restSec: 120, variant: 'Multipower' },
        { exerciseId: 'peso-muerto-rumano', sets: 3, repMin: 8, repMax: 10, restSec: 120, variant: 'Barra' },
        { exerciseId: 'curl-femoral', sets: 3, repMin: 10, repMax: 12, restSec: 90, variant: 'Sentado' },
        { exerciseId: 'extension-cuadriceps', sets: 3, repMin: 12, repMax: 15, restSec: 60 },
        { exerciseId: 'gemelos', sets: 3, repMin: 12, repMax: 15, restSec: 60, variant: 'Máquina' },
        { exerciseId: 'elevacion-piernas', sets: 3, repMin: 10, repMax: 15, restSec: 60 },
        { exerciseId: 'prensa', sets: 3, repMin: 10, repMax: 12, restSec: 90, optional: true },
      ],
      cardio: { type: 'Cinta inclinada', minutes: 15 },
    },
    {
      id: 'tiron',
      weekday: 4,
      name: 'Tirón',
      focus: 'Espalda · Bíceps · Hombro posterior',
      items: [
        { exerciseId: 'jalon-pecho', sets: 4, repMin: 8, repMax: 10, restSec: 120 },
        { exerciseId: 'remo-mancuerna', sets: 3, repMin: 8, repMax: 10, restSec: 90, note: 'por brazo' },
        { exerciseId: 'remo-polea-baja', sets: 3, repMin: 10, repMax: 12, restSec: 90 },
        { exerciseId: 'face-pull', sets: 3, repMin: 12, repMax: 15, restSec: 60 },
        { exerciseId: 'curl-biceps', sets: 3, repMin: 10, repMax: 12, restSec: 60, variant: 'Mancuernas' },
        { exerciseId: 'curl-martillo', sets: 2, repMin: 10, repMax: 12, restSec: 60, optional: true },
      ],
      cardio: { type: 'Cinta inclinada', minutes: 20 },
    },
  ],
}

/** Rutina actual (noviembre 2026): 4 días sin día fijo, en orden, con superseries. */
export const SEED_ROUTINE: Routine = {
  id: 'flex-4d-v1',
  name: '4 días flexibles · Pecho / Pierna / Espalda / Femoral y brazos',
  active: 1,
  createdAt: '2026-11-06',
  flexible: true,
  weeklyTarget: 4,
  activityWeekday: 7,
  days: [
    {
      id: 'pecho',
      name: 'Pecho y hombro',
      focus: 'Pecho · Hombro · Tríceps',
      items: [
        { exerciseId: 'press-banca', sets: 4, repMin: 8, repMax: 10, restSec: 120, variant: 'Multipower' },
        { exerciseId: 'press-inclinado', sets: 3, repMin: 10, repMax: 12, restSec: 90, variant: 'Multipower' },
        { exerciseId: 'press-militar', sets: 3, repMin: 8, repMax: 10, restSec: 90, variant: 'Mancuernas' },
        { exerciseId: 'contractor-pecho', sets: 3, repMin: 12, repMax: 15, restSec: 0, superset: 'a' },
        { exerciseId: 'elevaciones-laterales', sets: 3, repMin: 12, repMax: 15, restSec: 75, variant: 'Mancuernas', superset: 'a' },
        { exerciseId: 'extension-triceps-polea', sets: 3, repMin: 12, repMax: 15, restSec: 60, variant: 'Cuerda' },
      ],
      cardio: { type: 'Cinta inclinada', minutes: 15 },
    },
    {
      id: 'pierna-prensa',
      name: 'Pierna',
      focus: 'Cuádriceps · Femoral · Gemelo · Abdomen',
      items: [
        { exerciseId: 'prensa', sets: 4, repMin: 10, repMax: 12, restSec: 120 },
        { exerciseId: 'peso-muerto-rumano', sets: 3, repMin: 10, repMax: 12, restSec: 90, variant: 'Barra' },
        { exerciseId: 'extension-cuadriceps', sets: 3, repMin: 12, repMax: 15, restSec: 0, superset: 'a' },
        { exerciseId: 'gemelos', sets: 3, repMin: 12, repMax: 15, restSec: 75, variant: 'Máquina', superset: 'a' },
        { exerciseId: 'elevacion-piernas', sets: 3, repMin: 12, repMax: 15, restSec: 60 },
      ],
      cardio: { type: 'Cinta inclinada', minutes: 15 },
    },
    {
      id: 'espalda',
      name: 'Espalda y bíceps',
      focus: 'Espalda · Bíceps · Hombro posterior',
      items: [
        { exerciseId: 'jalon-pecho', sets: 4, repMin: 10, repMax: 12, restSec: 90 },
        { exerciseId: 'remo-mancuerna', sets: 3, repMin: 10, repMax: 12, restSec: 90, note: 'por brazo' },
        { exerciseId: 'remo-polea-baja', sets: 3, repMin: 10, repMax: 12, restSec: 90 },
        { exerciseId: 'face-pull', sets: 3, repMin: 12, repMax: 15, restSec: 0, superset: 'a' },
        { exerciseId: 'curl-biceps', sets: 3, repMin: 12, repMax: 15, restSec: 75, variant: 'Mancuernas', superset: 'a' },
      ],
      cardio: { type: 'Bici', minutes: 15 },
    },
    {
      id: 'femoral-brazos',
      name: 'Femoral y brazos',
      focus: 'Femoral · Aductores · Bíceps · Tríceps',
      items: [
        { exerciseId: 'curl-femoral', sets: 3, repMin: 10, repMax: 12, restSec: 90, variant: 'Sentado' },
        { exerciseId: 'aductores', sets: 3, repMin: 12, repMax: 15, restSec: 0, superset: 'a' },
        { exerciseId: 'abductores', sets: 3, repMin: 12, repMax: 15, restSec: 75, superset: 'a' },
        { exerciseId: 'zancadas', sets: 3, repMin: 8, repMax: 10, restSec: 90, variant: 'Sin peso', note: 'por pierna' },
        { exerciseId: 'curl-martillo', sets: 3, repMin: 10, repMax: 12, restSec: 0, superset: 'b' },
        { exerciseId: 'press-frances', sets: 3, repMin: 10, repMax: 12, restSec: 75, variant: 'Barra Z', superset: 'b' },
        { exerciseId: 'curl-biceps', sets: 3, repMin: 12, repMax: 15, restSec: 0, variant: 'Polea', superset: 'c' },
        { exerciseId: 'extension-triceps-polea', sets: 3, repMin: 12, repMax: 15, restSec: 75, variant: 'Cuerda', superset: 'c' },
      ],
      cardio: { type: 'Cinta inclinada', minutes: 15 },
    },
  ],
}

export const OLD_PROFILE_NOTES =
  'Molestia leve en el pecho izquierdo: vigilar en press. Gimnasio Synergy. Domingo: actividad libre (fútbol, pádel, bici, caminar).'
export const PROFILE_NOTES =
  'Gimnasio Synergy por la mañana (~8:20-9:30): 45-60 min de fuerza + 15 de cardio. 4 días a la semana sin día fijo. Pecho izquierdo recuperado (lesión muscular leve). Domingo: actividad libre (fútbol, pádel, bici, caminar).'

export const SEED_PROFILE: Profile = {
  id: 'me',
  name: 'Tomás',
  birthDate: '2006-03-31',
  heightCm: 180,
  goal: 'Atlético y ligero: perder grasa, ganar músculo y fuerza, y correr 5 km sintiéndome bien.',
  experience: '1,5-2 años entrenando. Vuelta tras 2 meses parado (octubre 2026).',
  notes: PROFILE_NOTES,
}

export const SEED_WEIGHT: BodyWeight = { date: '2026-10-05', kg: 92 }

/** Fecha de inicio de la rutina: las 2 primeras semanas son de readaptación. */
export const PROGRAM_START = '2026-10-05'
