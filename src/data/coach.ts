import { lastPerformance, type LastPerformance } from './db'
import { EXERCISE_BY_ID } from './exercises'
import { e1rm, fmtKg, fmtRest, isReadaptation, programWeek } from './progression'
import type { EntryLog, ExerciseReview, Review, RoutineDay, RoutineItem, Session, SetLog, Verdict } from './types'

type DoneSet = SetLog & { reps: number }

/** Redondea al disco más cercano (2,5 kg en ejercicios grandes, 1 kg en el resto) */
function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step
}

function setsText(sets: DoneSet[], bodyweight?: boolean): string {
  return sets.map((s) => (s.weight != null && !(bodyweight && !s.weight) ? `${fmtKg(s.weight)}×${s.reps}` : `${s.reps}`)).join(' · ')
}

function best(sets: { weight: number | null; reps: number | null }[]): { e1rm: number; reps: number } {
  let b = 0
  let reps = 0
  for (const s of sets) {
    reps += s.reps ?? 0
    if (s.weight && s.reps) b = Math.max(b, e1rm(s.weight, s.reps))
  }
  return { e1rm: b, reps }
}

interface ExerciseAnalysis {
  review: ExerciseReview
  good?: string
  improve?: string
}

function analyzeExercise(entry: EntryLog, item: RoutineItem, last: LastPerformance | null, date: string): ExerciseAnalysis | null {
  const ex = EXERCISE_BY_ID[entry.exerciseId]
  const name = ex?.name ?? entry.exerciseId
  const done = entry.sets.filter((s): s is DoneSet => s.done && s.reps != null)
  const readapt = isReadaptation(date)

  if (done.length === 0) {
    if (entry.optional) return null
    return {
      review: {
        exerciseId: entry.exerciseId,
        verdict: 'skipped',
        summary: 'No lo hiciste.',
        nextTip:
          item.restSec >= 120
            ? 'La última vez te lo saltaste y es de los más importantes del día: hazlo de los primeros.'
            : 'La última vez te lo saltaste: si vas justo de tiempo, haz al menos 2 series.',
      },
      improve: `Te saltaste ${name}.`,
    }
  }

  const bodyweight = ex?.bodyweight || done.every((s) => !s.weight)
  const w = Math.max(...done.map((s) => s.weight ?? 0))
  // Mancuernas van de 2 en 2 kg; barra/Multipower de 2,5; máquinas y poleas de 1
  const step = /mancuerna/i.test(entry.variant ?? '') || /mancuerna/i.test(name) ? 2 : item.restSec >= 120 ? 2.5 : 1
  const up = roundTo(w + step, step)
  const down = Math.max(0, roundTo(w * 0.93, step))
  const reps = done.map((s) => s.reps)
  const rirs = done.map((s) => s.rir).filter((r): r is number => r != null)
  const avgRir = rirs.length ? rirs.reduce((a, b) => a + b, 0) / rirs.length : null
  const complete = done.length >= item.sets
  const allTop = complete && reps.every((r) => r >= item.repMax)
  const belowIdx = reps.findIndex((r) => r < item.repMin)
  const onlyLastBelow = belowIdx === reps.length - 1 && reps.length > 1
  const sameWeight = done.every((s) => (s.weight ?? 0) === (done[0].weight ?? 0))
  const dropOff = sameWeight && reps.length >= 3 && reps[0] - reps[reps.length - 1] >= 3
  const unit = ex?.timed ? 's' : 'reps'

  // ── Comparación con la última vez
  let verdict: Verdict = 'first'
  let comparison = ''
  if (last) {
    const now = best(done)
    const prev = best(last.sets)
    if (!bodyweight && now.e1rm && prev.e1rm) {
      const ratio = now.e1rm / prev.e1rm
      const prevW = Math.max(...last.sets.map((s) => s.weight ?? 0))
      verdict = ratio > 1.01 ? 'up' : ratio < 0.95 ? 'down' : 'ok'
      if (w > prevW) comparison = `+${fmtKg(w - prevW)} kg respecto a la última vez`
      else if (w < prevW) comparison = `${fmtKg(w - prevW)} kg respecto a la última vez`
      else if (now.reps !== prev.reps) comparison = `${now.reps > prev.reps ? '+' : ''}${now.reps - prev.reps} ${unit} en total respecto a la última vez`
      else comparison = 'Igual que la última vez'
    } else {
      verdict = now.reps > prev.reps ? 'up' : now.reps < prev.reps * 0.9 ? 'down' : 'ok'
      comparison =
        now.reps === prev.reps ? 'Igual que la última vez' : `${now.reps > prev.reps ? '+' : ''}${now.reps - prev.reps} ${unit} en total respecto a la última vez`
    }
  }

  const summary = [`${setsText(done, bodyweight)}${ex?.timed ? ' s' : ''}`, comparison].filter(Boolean).join('. ') + '.'

  // ── Consejo para la próxima vez (el más importante primero)
  let nextTip: string
  let nextWeight: number | undefined = bodyweight ? undefined : w
  if (belowIdx >= 0 && !bodyweight) {
    nextTip = onlyLastBelow
      ? `En la última serie te quedaste en ${reps[reps.length - 1]} (el mínimo es ${item.repMin}). Mantén ${fmtKg(w)} kg y descansa el tiempo completo (${fmtRest(item.restSec)}).`
      : `Te quedaste por debajo de ${item.repMin} ${unit}: el peso está algo alto. Prueba con ${fmtKg(down)} kg y completa el rango ${item.repMin}-${item.repMax}.`
    if (!onlyLastBelow) nextWeight = down
  } else if (allTop && readapt && avgRir != null && avgRir <= 1) {
    nextTip = `Llegaste al máximo pero casi al fallo. Mantén ${fmtKg(w)} kg una semana más: aún estás en readaptación.`
  } else if (allTop) {
    if (!bodyweight) nextWeight = up
    nextTip = bodyweight
      ? `¡Rango completado! Añade dificultad: baja más lento (3 segundos) o súmale peso.`
      : `¡Rango completado en todas! Sube a ${fmtKg(up)} kg (empezarás con menos reps, es normal).`
  } else if (readapt && avgRir != null && avgRir < 1.5) {
    nextTip = `Fuiste muy cerca del fallo. En readaptación mantén ${fmtKg(w)} kg y deja 2-3 reps en reserva.`
  } else if (avgRir != null && avgRir >= 3 && !bodyweight) {
    nextWeight = up
    nextTip = `Te sobraban muchas reps (3 o más). Sube a ${fmtKg(up)} kg o haz más reps, hasta ${item.repMax}.`
  } else if (dropOff) {
    nextTip = `Perdiste muchas reps entre series (${reps[0]} → ${reps[reps.length - 1]}). Descansa el tiempo completo (${fmtRest(item.restSec)}) o baja un poco el peso.`
  } else if (!complete) {
    nextTip = `Hiciste ${done.length} de ${item.sets} series: intenta completarlas todas.`
  } else {
    nextTip = bodyweight
      ? `Intenta sumar 1 ${ex?.timed ? 'segundo más por serie' : 'repetición por serie'} hasta llegar a ${item.repMax}.`
      : `Mantén ${fmtKg(w)} kg e intenta sumar 1 rep en alguna serie hasta llegar a ${item.repMax} en todas.`
  }

  let good: string | undefined
  if (verdict === 'up') good = `Progresaste en ${name} (${comparison.replace(' respecto a la última vez', '')}).`
  else if (allTop) good = `Completaste el rango en ${name}.`

  let improve: string | undefined
  if (verdict === 'down') improve = `${name} fue a peor que la última vez. Puede ser cansancio; revisa sueño y comida.`
  else if (belowIdx >= 0 && !onlyLastBelow && !bodyweight) improve = `En ${name} el peso se te quedó grande.`

  return { review: { exerciseId: entry.exerciseId, verdict, summary, nextTip, nextWeight }, good, improve }
}

/** Analiza un entreno terminado y genera el informe del coach. */
export async function buildReview(session: Session, day: RoutineDay): Promise<Review> {
  const good: string[] = []
  const improve: string[] = []
  const exercises: ExerciseReview[] = []
  let withHistory = 0
  let progressed = 0

  for (const entry of session.entries) {
    const item = day.items[entry.itemIndex]
    if (!item) continue
    const last = await lastPerformance(entry.exerciseId, entry.variant, session.id, session.date)
    const a = analyzeExercise(entry, item, last, session.date)
    if (!a) continue
    exercises.push(a.review)
    if (a.good) good.push(a.good)
    if (a.improve) improve.push(a.improve)
    if (a.review.verdict !== 'first' && a.review.verdict !== 'skipped') {
      withHistory++
      if (a.review.verdict === 'up') progressed++
    }
  }

  // ── Visión general
  const main = session.entries.filter((e) => !e.optional)
  const planned = main.reduce((a, e) => a + e.sets.length, 0)
  const doneSets = main.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0)
  const completion = planned ? Math.min(1, doneSets / planned) : 0
  const allSets = session.entries.flatMap((e) => e.sets.filter((s) => s.done))
  const rirLogged = allSets.length ? allSets.filter((s) => s.rir != null).length / allSets.length : 0
  const extras = session.entries.filter((e) => e.optional && e.sets.some((s) => s.done)).length
  const cardioPlanned = !!day.cardio
  const cardioDone = !!session.cardio?.done
  const minutes = session.finishedAt ? Math.round((new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 60000) : null
  const week = programWeek(session.date)

  if (isReadaptation(session.date)) {
    good.unshift(`Semana ${week} de readaptación: aquí lo que cuenta es la técnica y la constancia, no batir récords.`)
  }
  if (completion >= 1) good.push('Completaste todas las series del día. 💯')
  else if (completion < 0.8) improve.push(`Hiciste ${doneSets} de ${planned} series. Si vas justo de tiempo, prioriza los primeros ejercicios del día.`)
  if (extras > 0) good.push(`Hiciste ${extras === 1 ? 'un ejercicio extra' : `${extras} ejercicios extra`}. ¡Así se hace!`)
  if (cardioPlanned && cardioDone) good.push(`Cardio hecho (${session.cardio?.minutes ?? day.cardio?.minutes}′): clave para perder grasa y para llegar a correr 5 km.`)
  if (cardioPlanned && !cardioDone) improve.push('Faltó el cardio del final. Aunque sean 10 minutos, suma mucho para tu objetivo.')
  if (rirLogged >= 0.5) good.push('Apuntaste cuántas reps te sobraban: así los consejos son mucho más precisos.')
  else if (allSets.length) improve.push('Apunta "¿cuántas más podías?" en cada serie: así sabré si subir peso o no.')
  if (minutes != null && minutes > 100) improve.push(`El entreno se alargó a ${minutes} min. Respeta los descansos y deja el móvil entre series.`)
  if (session.notes && /dolor|molest|pinch|duele|lesi/i.test(session.notes)) {
    improve.push('Apuntaste alguna molestia: no fuerces esa zona y cambia a la versión en máquina. Si dura más de 2 semanas, que te lo mire un fisio.')
  }

  // ── Nota de 1 a 10
  const progressScore = withHistory ? progressed / withHistory : 0.6
  const raw = 6 * completion + (cardioPlanned ? (cardioDone ? 1.5 : 0) : 1.5) + 1.5 * progressScore + (rirLogged >= 0.5 ? 1 : 0.5)
  const score = Math.max(1, Math.min(10, Math.round(raw)))
  const headline =
    score >= 9 ? '¡Entrenazo! 🔥' : score >= 7 ? 'Buen entreno 💪' : score >= 5 ? 'Entreno correcto, se puede apretar más' : 'Entreno a medias: la próxima, a por todas'

  return { createdAt: new Date().toISOString(), score, headline, good, improve, exercises }
}
