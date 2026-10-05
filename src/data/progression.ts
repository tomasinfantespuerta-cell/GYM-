import { fromISODate } from './db'
import type { LastPerformance } from './db'
import { PROGRAM_START } from './seed'
import type { RoutineItem } from './types'

/** Semana del programa (1, 2, 3…) contando desde PROGRAM_START. */
export function programWeek(dateISO: string): number {
  const ms = fromISODate(dateISO).getTime() - fromISODate(PROGRAM_START).getTime()
  return Math.max(1, Math.floor(ms / (7 * 24 * 3600 * 1000)) + 1)
}

export function isReadaptation(dateISO: string): boolean {
  return programWeek(dateISO) <= 2
}

export interface Suggestion {
  text: string
  /** Peso sugerido para precargar (si aplica) */
  weight?: number
  kind: 'up' | 'keep' | 'first' | 'easy'
}

/**
 * Doble progresión: si todas las series llegaron al máximo del rango, sube peso.
 * Si no, mismo peso e intenta sumar repeticiones.
 */
export function suggest(item: RoutineItem, last: LastPerformance | null, dateISO: string, bodyweight = false): Suggestion {
  const range = `${item.repMin}-${item.repMax}`
  if (isReadaptation(dateISO)) {
    if (!last) return { kind: 'easy', text: `Readaptación: elige un peso con el que hagas ${range} reps dejando unas 3 en reserva.` }
    const w = maxWeight(last)
    return { kind: 'easy', weight: w ?? undefined, text: 'Readaptación: mismo peso o un poco más, sin llegar al fallo (RIR 2-3).' }
  }
  if (!last) return { kind: 'first', text: `Primera vez: busca un peso con el que llegues a ${range} reps con 1-2 en reserva.` }

  const w = maxWeight(last)
  const allTop = last.sets.length >= item.sets && last.sets.every((s) => (s.reps ?? 0) >= item.repMax)
  if (bodyweight || w == null) {
    return allTop
      ? { kind: 'up', text: 'Llegaste al máximo en todas: añade dificultad (más lento, más reps o lastre).' }
      : { kind: 'keep', text: 'Intenta sumar 1 repetición en alguna serie.' }
  }
  if (allTop) {
    const inc = item.restSec >= 120 ? 2.5 : 1
    const next = round(w + inc)
    return { kind: 'up', weight: next, text: `¡Completaste ${range} en todas! Sube a ${fmtKg(next)} kg.` }
  }
  return { kind: 'keep', weight: w, text: `Mantén ${fmtKg(w)} kg e intenta sumar repeticiones hasta llegar a ${item.repMax}.` }
}

function maxWeight(last: LastPerformance): number | null {
  const ws = last.sets.map((s) => s.weight).filter((x): x is number => x != null)
  return ws.length ? Math.max(...ws) : null
}

function round(n: number): number {
  return Math.round(n * 4) / 4
}

export function fmtKg(n: number | null | undefined): string {
  if (n == null) return '–'
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, '').replace('.', ',')
}

export function fmtRest(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** 1RM estimado (Epley) */
export function e1rm(weight: number, reps: number): number {
  return reps <= 1 ? weight : weight * (1 + reps / 30)
}
