import type { BodyWeight, Profile, Routine } from './types'

export const SEED_ROUTINE: Routine = {
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
        { exerciseId: 'press-banca', sets: 4, repMin: 6, repMax: 8, restSec: 150, variant: 'Multipower' },
        { exerciseId: 'press-inclinado', sets: 3, repMin: 8, repMax: 10, restSec: 120, variant: 'Mancuernas' },
        { exerciseId: 'press-militar', sets: 3, repMin: 8, repMax: 10, restSec: 120, variant: 'Mancuernas' },
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
        { exerciseId: 'sentadilla', sets: 4, repMin: 6, repMax: 8, restSec: 180, variant: 'Multipower' },
        { exerciseId: 'peso-muerto-rumano', sets: 3, repMin: 8, repMax: 10, restSec: 150, variant: 'Barra' },
        { exerciseId: 'curl-femoral', sets: 3, repMin: 10, repMax: 12, restSec: 90, variant: 'Sentado' },
        { exerciseId: 'extension-cuadriceps', sets: 3, repMin: 12, repMax: 15, restSec: 60 },
        { exerciseId: 'gemelos', sets: 3, repMin: 12, repMax: 15, restSec: 60, variant: 'Máquina' },
        { exerciseId: 'elevacion-piernas', sets: 3, repMin: 10, repMax: 15, restSec: 60 },
        { exerciseId: 'prensa', sets: 3, repMin: 10, repMax: 12, restSec: 120, optional: true },
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

export const SEED_PROFILE: Profile = {
  id: 'me',
  name: 'Tomás',
  birthDate: '2006-03-31',
  heightCm: 180,
  goal: 'Atlético y ligero: perder grasa, ganar músculo y fuerza, y correr 5 km sintiéndome bien.',
  experience: '1,5-2 años entrenando. Vuelta tras 2 meses parado (octubre 2026).',
  notes: 'Molestia leve en el pecho izquierdo: vigilar en press. Gimnasio Synergy. Domingo: actividad libre (fútbol, pádel, bici, caminar).',
}

export const SEED_WEIGHT: BodyWeight = { date: '2026-10-05', kg: 92 }

/** Fecha de inicio de la rutina: las 2 primeras semanas son de readaptación. */
export const PROGRAM_START = '2026-10-05'
