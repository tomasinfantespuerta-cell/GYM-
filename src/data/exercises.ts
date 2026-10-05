export type Muscle =
  | 'Pecho'
  | 'Espalda'
  | 'Hombro'
  | 'Bíceps'
  | 'Tríceps'
  | 'Cuádriceps'
  | 'Femoral'
  | 'Glúteo'
  | 'Gemelo'
  | 'Abdomen'

export interface ExerciseDef {
  id: string
  name: string
  muscle: Muscle
  /** Variantes de material. El progreso solo se compara dentro de la misma variante. */
  variants?: string[]
  tips: string[]
  /** Ejercicios equivalentes para cuando la máquina está ocupada. */
  alternatives: string[]
  /** Se mide en segundos en vez de repeticiones. */
  timed?: boolean
  /** Sin peso externo por defecto (peso corporal). */
  bodyweight?: boolean
}

export const EXERCISES: ExerciseDef[] = [
  // ── Pecho
  {
    id: 'press-banca',
    name: 'Press banca',
    muscle: 'Pecho',
    variants: ['Multipower', 'Barra'],
    tips: [
      'Escápulas juntas y hacia abajo, como si guardaras los omóplatos en los bolsillos de atrás.',
      'Baja la barra controlada hasta la parte baja del pecho, sin rebotar.',
      'Pies firmes en el suelo. Si notas pinchazo en el pecho izquierdo, para.',
    ],
    alternatives: ['press-pecho-maquina', 'press-banca-mancuernas'],
  },
  {
    id: 'press-banca-mancuernas',
    name: 'Press banca con mancuernas',
    muscle: 'Pecho',
    tips: ['Baja hasta notar estiramiento en el pecho.', 'Junta las mancuernas arriba sin chocarlas.'],
    alternatives: ['press-banca', 'press-pecho-maquina'],
  },
  {
    id: 'press-inclinado',
    name: 'Press inclinado',
    muscle: 'Pecho',
    variants: ['Mancuernas', 'Multipower'],
    tips: [
      'Banco a unos 30°: más inclinado ya trabaja sobre todo hombro.',
      'Con mancuernas, fíjate si un lado va peor que el otro.',
    ],
    alternatives: ['press-pecho-maquina', 'press-banca-mancuernas'],
  },
  {
    id: 'press-pecho-maquina',
    name: 'Press de pecho en máquina',
    muscle: 'Pecho',
    tips: ['Ajusta el asiento para que las asas queden a la altura del pecho medio.', 'Controla la vuelta, 2 segundos.'],
    alternatives: ['press-banca', 'press-inclinado'],
  },
  {
    id: 'aperturas-polea',
    name: 'Aperturas en polea',
    muscle: 'Pecho',
    tips: [
      'Codos ligeramente flexionados y fijos durante todo el movimiento.',
      'Junta las manos delante del pecho y aprieta 1 segundo.',
    ],
    alternatives: ['contractor-pecho'],
  },
  {
    id: 'contractor-pecho',
    name: 'Contractor de pecho (peck deck)',
    muscle: 'Pecho',
    tips: ['Espalda pegada al respaldo.', 'No dejes que los brazos vayan demasiado atrás.'],
    alternatives: ['aperturas-polea'],
  },

  // ── Hombro
  {
    id: 'press-militar',
    name: 'Press militar sentado',
    muscle: 'Hombro',
    variants: ['Mancuernas', 'Multipower', 'Máquina'],
    tips: ['Respaldo casi vertical y abdomen apretado.', 'Baja hasta la altura de las orejas, sube sin bloquear del todo.'],
    alternatives: ['press-hombro-maquina'],
  },
  {
    id: 'press-hombro-maquina',
    name: 'Press de hombro en máquina',
    muscle: 'Hombro',
    tips: ['Asas a la altura de los hombros al empezar.'],
    alternatives: ['press-militar'],
  },
  {
    id: 'elevaciones-laterales',
    name: 'Elevaciones laterales',
    muscle: 'Hombro',
    variants: ['Mancuernas', 'Polea', 'Máquina'],
    tips: [
      'Sube hasta la altura de los hombros, no más.',
      'Peso ligero y controlado; si balanceas el cuerpo, sobra peso.',
    ],
    alternatives: [],
  },
  {
    id: 'face-pull',
    name: 'Face pull',
    muscle: 'Hombro',
    tips: ['Polea a la altura de la cara, cuerda hacia la frente abriendo las manos.', 'Muy bueno para la postura y los hombros.'],
    alternatives: ['pajaro-maquina'],
  },
  {
    id: 'pajaro-maquina',
    name: 'Pájaro en máquina (deltoides posterior)',
    muscle: 'Hombro',
    tips: ['Brazos casi rectos, abre hasta la línea del cuerpo.'],
    alternatives: ['face-pull'],
  },

  // ── Tríceps
  {
    id: 'extension-triceps-polea',
    name: 'Extensión de tríceps en polea',
    muscle: 'Tríceps',
    variants: ['Cuerda', 'Barra'],
    tips: ['Codos pegados al cuerpo, que no se muevan.', 'Estira del todo abajo y aprieta.'],
    alternatives: ['press-frances'],
  },
  {
    id: 'press-frances',
    name: 'Press francés',
    muscle: 'Tríceps',
    variants: ['Barra Z', 'Mancuernas'],
    tips: ['Baja la barra hacia la frente o detrás de la cabeza, codos apuntando al techo.'],
    alternatives: ['extension-triceps-polea'],
  },

  // ── Espalda
  {
    id: 'jalon-pecho',
    name: 'Jalón al pecho',
    muscle: 'Espalda',
    tips: [
      'Agarre algo más ancho que los hombros.',
      'Lleva la barra a la parte alta del pecho tirando con los codos, no con las manos.',
      'Pecho arriba, sin echarte muy atrás.',
    ],
    alternatives: ['dominadas', 'jalon-estrecho'],
  },
  {
    id: 'dominadas',
    name: 'Dominadas',
    muscle: 'Espalda',
    variants: ['Peso corporal', 'Asistidas'],
    bodyweight: true,
    tips: ['Baja del todo con control.', 'En la máquina asistida, menos peso = más difícil.'],
    alternatives: ['jalon-pecho'],
  },
  {
    id: 'jalon-estrecho',
    name: 'Jalón agarre estrecho (V)',
    muscle: 'Espalda',
    tips: ['Lleva el triángulo al pecho manteniendo la espalda recta.'],
    alternatives: ['jalon-pecho'],
  },
  {
    id: 'remo-mancuerna',
    name: 'Remo con mancuerna a una mano',
    muscle: 'Espalda',
    tips: [
      'Rodilla y mano del mismo lado apoyadas en el banco, espalda plana.',
      'Lleva la mancuerna hacia la cadera, no hacia el hombro.',
    ],
    alternatives: ['remo-maquina', 'remo-polea-baja'],
  },
  {
    id: 'remo-polea-baja',
    name: 'Remo en polea baja',
    muscle: 'Espalda',
    tips: ['Espalda recta, no balancees el tronco.', 'Junta las escápulas al final del recorrido.'],
    alternatives: ['remo-maquina', 'remo-mancuerna'],
  },
  {
    id: 'remo-maquina',
    name: 'Remo en máquina',
    muscle: 'Espalda',
    tips: ['Pecho apoyado en el soporte, tira con los codos.'],
    alternatives: ['remo-polea-baja', 'remo-mancuerna'],
  },

  // ── Bíceps
  {
    id: 'curl-biceps',
    name: 'Curl de bíceps',
    muscle: 'Bíceps',
    variants: ['Mancuernas', 'Barra Z', 'Polea'],
    tips: ['Codos quietos pegados al cuerpo.', 'Baja lento, 2-3 segundos: ahí también crece el músculo.'],
    alternatives: ['curl-martillo'],
  },
  {
    id: 'curl-martillo',
    name: 'Curl martillo',
    muscle: 'Bíceps',
    tips: ['Palmas mirándose entre sí todo el recorrido.'],
    alternatives: ['curl-biceps'],
  },

  // ── Pierna
  {
    id: 'sentadilla',
    name: 'Sentadilla',
    muscle: 'Cuádriceps',
    variants: ['Multipower', 'Barra'],
    tips: [
      'Pies a la anchura de los hombros, puntas un poco hacia fuera.',
      'Rodillas en la dirección de las puntas de los pies.',
      'Baja al menos hasta que el muslo quede paralelo al suelo, con la espalda recta.',
    ],
    alternatives: ['prensa', 'sentadilla-bulgara'],
  },
  {
    id: 'prensa',
    name: 'Prensa de piernas',
    muscle: 'Cuádriceps',
    tips: ['No despegues la zona lumbar del respaldo.', 'No bloquees las rodillas arriba.'],
    alternatives: ['sentadilla', 'sentadilla-hack'],
  },
  {
    id: 'sentadilla-hack',
    name: 'Sentadilla hack (máquina)',
    muscle: 'Cuádriceps',
    tips: ['Espalda bien apoyada, baja profundo y controlado.'],
    alternatives: ['prensa', 'sentadilla'],
  },
  {
    id: 'sentadilla-bulgara',
    name: 'Sentadilla búlgara',
    muscle: 'Cuádriceps',
    variants: ['Mancuernas', 'Multipower'],
    tips: ['Pie de atrás apoyado en el banco, baja recto.', 'Repeticiones por pierna.'],
    alternatives: ['prensa'],
  },
  {
    id: 'peso-muerto-rumano',
    name: 'Peso muerto rumano',
    muscle: 'Femoral',
    variants: ['Barra', 'Mancuernas', 'Multipower'],
    tips: [
      'Rodillas un poco flexionadas y fijas; la cadera va hacia atrás.',
      'La barra baja pegada a las piernas, espalda siempre recta.',
      'Baja hasta notar tensión en el femoral (más o menos media tibia).',
    ],
    alternatives: ['curl-femoral', 'hip-thrust'],
  },
  {
    id: 'curl-femoral',
    name: 'Curl femoral',
    muscle: 'Femoral',
    variants: ['Sentado', 'Tumbado'],
    tips: ['Sentado trabaja algo mejor el femoral; tumbado también vale.', 'Controla la vuelta.'],
    alternatives: ['peso-muerto-rumano'],
  },
  {
    id: 'hip-thrust',
    name: 'Hip thrust',
    muscle: 'Glúteo',
    variants: ['Barra', 'Máquina', 'Multipower'],
    tips: ['Barbilla al pecho, sube hasta que la cadera quede alineada con el tronco.'],
    alternatives: ['peso-muerto-rumano'],
  },
  {
    id: 'extension-cuadriceps',
    name: 'Extensión de cuádriceps',
    muscle: 'Cuádriceps',
    tips: ['Aprieta 1 segundo arriba.', 'Muy bueno para proteger las rodillas al correr.'],
    alternatives: ['prensa'],
  },
  {
    id: 'gemelos',
    name: 'Elevación de gemelos',
    muscle: 'Gemelo',
    variants: ['Máquina', 'Multipower', 'Prensa', 'Mancuerna'],
    tips: ['Baja del todo estirando y sube de puntillas al máximo.', 'Pausa de 1 segundo arriba.'],
    alternatives: [],
  },

  // ── Abdomen
  {
    id: 'elevacion-piernas',
    name: 'Elevación de piernas (máquina)',
    muscle: 'Abdomen',
    bodyweight: true,
    tips: ['Espalda pegada al respaldo, sube las rodillas hacia el pecho sin balancearte.'],
    alternatives: ['crunch-maquina', 'plancha'],
  },
  {
    id: 'crunch-maquina',
    name: 'Crunch en máquina',
    muscle: 'Abdomen',
    tips: ['Enrolla la columna, no tires con los brazos.'],
    alternatives: ['elevacion-piernas', 'plancha'],
  },
  {
    id: 'plancha',
    name: 'Plancha',
    muscle: 'Abdomen',
    timed: true,
    bodyweight: true,
    tips: ['Cuerpo recto de cabeza a talones, glúteo y abdomen apretados.'],
    alternatives: ['elevacion-piernas', 'crunch-maquina'],
  },
]

export const EXERCISE_BY_ID: Record<string, ExerciseDef> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]))

export function exerciseName(id: string): string {
  return EXERCISE_BY_ID[id]?.name ?? id
}
