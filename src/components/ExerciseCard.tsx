import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef, useState } from 'react'
import { db, lastPerformance } from '../data/db'
import { EXERCISE_BY_ID, EXERCISES } from '../data/exercises'
import { fmtKg, fmtRest, suggest } from '../data/progression'
import type { EntryLog, RoutineItem, SetLog } from '../data/types'
import { targetText } from '../pages/DayPage'
import { useRestTimer } from './RestTimer'
import Sheet from './Sheet'

interface Props {
  entry: EntryLog
  item: RoutineItem
  sessionId: string
  date: string
  onChange: (entry: EntryLog) => void
}

function parseNum(raw: string): number | null {
  const n = parseFloat(raw.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export default function ExerciseCard({ entry, item, sessionId, date, onChange }: Props) {
  const ex = EXERCISE_BY_ID[entry.exerciseId]
  const timer = useRestTimer()
  const [showTips, setShowTips] = useState(false)
  const [swapOpen, setSwapOpen] = useState(false)
  const repsRefs = useRef<(HTMLInputElement | null)[]>([])

  const last = useLiveQuery(
    () => lastPerformance(entry.exerciseId, entry.variant, sessionId),
    [entry.exerciseId, entry.variant, sessionId],
  )
  const note = useLiveQuery(() => db.notes.get(entry.exerciseId), [entry.exerciseId])

  const sug = last === undefined ? null : suggest(item, last, date, ex?.bodyweight)
  const doneCount = entry.sets.filter((s) => s.done).length
  const complete = doneCount >= entry.sets.length && entry.sets.length > 0

  function setAt(i: number, patch: Partial<SetLog>) {
    onChange({ ...entry, sets: entry.sets.map((s, j) => (j === i ? { ...s, ...patch } : s)) })
  }

  /** Valor de la serie anterior de hoy, para no tener que reescribirlo */
  function prevToday(i: number, k: 'weight' | 'reps'): number | null {
    for (let j = i - 1; j >= 0; j--) if (entry.sets[j][k] != null) return entry.sets[j][k]
    return null
  }
  function placeholderWeight(i: number): number | null {
    const prev = prevToday(i, 'weight')
    if (prev != null) return prev
    if (sug?.weight != null) return sug.weight
    return last?.sets[i]?.weight ?? last?.sets.at(-1)?.weight ?? null
  }
  function placeholderReps(i: number): number | null {
    return prevToday(i, 'reps') ?? last?.sets[i]?.reps ?? last?.sets.at(-1)?.reps ?? null
  }

  function toggle(i: number) {
    const s = entry.sets[i]
    if (s.done) {
      setAt(i, { done: false })
      return
    }
    const weight = s.weight ?? placeholderWeight(i)
    const reps = s.reps ?? placeholderReps(i)
    if (reps == null) {
      repsRefs.current[i]?.focus()
      return
    }
    setAt(i, { done: true, weight, reps })
    const n = entry.sets.filter((x) => x.done).length + 1
    const label = n >= entry.sets.length ? `${ex?.name} completado · siguiente ejercicio` : `${ex?.name} · serie ${n + 1} de ${entry.sets.length}`
    timer.start(item.restSec, label)
  }

  function swapTo(id: string) {
    const alt = EXERCISE_BY_ID[id]
    onChange({
      ...entry,
      exerciseId: id,
      variant: alt?.variants?.[0],
      replaces: entry.replaces ?? (id === entry.exerciseId ? undefined : entry.exerciseId),
      sets: entry.sets.map(() => ({ weight: null, reps: null, rir: null, done: false })),
    })
    setSwapOpen(false)
  }

  const original = entry.replaces ? EXERCISE_BY_ID[entry.replaces] : null
  const altIds = ex ? [...(entry.replaces ? [entry.replaces] : []), ...ex.alternatives].filter((x) => x !== entry.exerciseId) : []
  const sameMuscle = EXERCISES.filter((e) => e.muscle === ex?.muscle && e.id !== entry.exerciseId && !altIds.includes(e.id))

  return (
    <div className={`card ex-card ${complete ? 'complete' : ''}`}>
      <div className="spread" style={{ alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <h3>
            {complete && <span className="brand">✓ </span>}
            {ex?.name ?? entry.exerciseId}
          </h3>
          <div className="target">
            {targetText(item)} · {fmtRest(item.restSec)}
            {original && <span> · en lugar de {original.name}</span>}
          </div>
        </div>
        <button className="btn sm ghost" onClick={() => setSwapOpen(true)} aria-label="Cambiar ejercicio">
          ⇄
        </button>
      </div>

      {ex?.variants && (
        <div className="chips" style={{ marginTop: 10 }}>
          {ex.variants.map((v) => (
            <button key={v} className={`chip ${entry.variant === v ? 'on' : ''}`} onClick={() => onChange({ ...entry, variant: v })}>
              {v}
            </button>
          ))}
        </div>
      )}

      <div className="last">
        {last ? (
          <>
            <span className="muted">Última vez{last.variant ? ` (${last.variant})` : ''}: </span>
            <span className="num" style={{ fontWeight: 700 }}>
              {last.sets.map((s) => `${s.weight != null ? fmtKg(s.weight) + '×' : ''}${s.reps ?? '–'}`).join(' · ')}
            </span>
          </>
        ) : (
          <span className="muted">Primera vez con este ejercicio{entry.variant ? ` en ${entry.variant}` : ''}.</span>
        )}
      </div>
      {sug && <div className={`hint ${sug.kind === 'up' ? 'up' : ''}`}>{sug.text}</div>}

      <div className="sets">
        <div className="set-head">
          <span>#</span>
          <span style={{ textAlign: 'center' }}>{ex?.bodyweight ? 'Lastre kg' : 'Kg'}</span>
          <span style={{ textAlign: 'center' }}>{ex?.timed ? 'Seg' : 'Reps'}</span>
          <span />
        </div>
        {entry.sets.map((s, i) => (
          <div key={i} className="set-block">
            <div className={`set-row ${s.done ? 'is-done' : ''}`}>
              <div className="set-n">{i + 1}</div>
              <NumField value={s.weight} placeholder={fmtKg(placeholderWeight(i)).replace('–', ex?.bodyweight ? '0' : 'kg')} decimal onChange={(v) => setAt(i, { weight: v })} />
              <NumField
                value={s.reps}
                placeholder={placeholderReps(i)?.toString() ?? `${item.repMin}-${item.repMax}`}
                onChange={(v) => setAt(i, { reps: v })}
                inputRef={(el) => (repsRefs.current[i] = el)}
              />
              <button className={`check ${s.done ? 'on' : ''}`} onClick={() => toggle(i)} aria-label={s.done ? 'Desmarcar serie' : 'Marcar serie hecha'}>
                ✓
              </button>
            </div>
            {s.done && (
              <div className="rir">
                <span>¿Cuántas más podías?</span>
                {[0, 1, 2, 3].map((r) => (
                  <button key={r} className={`chip ${s.rir === r ? 'on' : ''}`} onClick={() => setAt(i, { rir: s.rir === r ? null : r })}>
                    {r === 3 ? '3+' : r}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="row" style={{ marginTop: 12, gap: 8 }}>
        <button className="btn sm" onClick={() => onChange({ ...entry, sets: [...entry.sets, { weight: null, reps: null, rir: null, done: false }] })}>
          + Serie
        </button>
        {entry.sets.length > 1 && !entry.sets.at(-1)!.done && (
          <button className="btn sm ghost" onClick={() => onChange({ ...entry, sets: entry.sets.slice(0, -1) })}>
            − Serie
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button className={`btn sm ${showTips ? '' : 'ghost'}`} onClick={() => setShowTips(!showTips)}>
          💡 Consejos{note?.note ? ' · 📝' : ''}
        </button>
      </div>

      {showTips && ex && (
        <>
          <ul className="tips">
            {ex.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <NoteField exerciseId={entry.exerciseId} initial={note?.note ?? ''} />
        </>
      )}

      {swapOpen && (
        <Sheet onClose={() => setSwapOpen(false)}>
          <h3>Cambiar {ex?.name}</h3>
          <p className="muted small" style={{ marginTop: -6 }}>
            ¿Máquina ocupada? Elige un ejercicio equivalente. Solo cambia hoy, la rutina sigue igual.
          </p>
          {altIds.map((id) => (
            <button key={id} className="option" onClick={() => swapTo(id)}>
              <b>{EXERCISE_BY_ID[id]?.name}</b>
              {id === entry.replaces && <span className="muted small"> · el de la rutina</span>}
            </button>
          ))}
          {sameMuscle.length > 0 && <div className="section-title">Otros de {ex?.muscle.toLowerCase()}</div>}
          {sameMuscle.map((e) => (
            <button key={e.id} className="option" onClick={() => swapTo(e.id)}>
              {e.name}
            </button>
          ))}
          {doneCount > 0 && (
            <p className="small" style={{ color: 'var(--warn)' }}>
              Ojo: al cambiar se borran las series que ya has marcado en este ejercicio.
            </p>
          )}
        </Sheet>
      )}
    </div>
  )
}

function NumField({
  value,
  placeholder,
  decimal,
  onChange,
  inputRef,
}: {
  value: number | null
  placeholder: string
  decimal?: boolean
  onChange: (v: number | null) => void
  inputRef?: (el: HTMLInputElement | null) => void
}) {
  const [raw, setRaw] = useState(value == null ? '' : String(value).replace('.', ','))
  // Sincroniza si el valor cambia desde fuera (p. ej. al marcar con el valor sugerido)
  useEffect(() => {
    if (parseNum(raw) !== value) setRaw(value == null ? '' : String(value).replace('.', ','))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return (
    <input
      ref={inputRef}
      className="field"
      inputMode={decimal ? 'decimal' : 'numeric'}
      enterKeyHint="next"
      placeholder={placeholder}
      value={raw}
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        const cleaned = e.target.value.replace(decimal ? /[^\d.,]/g : /\D/g, '')
        setRaw(cleaned)
        onChange(parseNum(cleaned))
      }}
    />
  )
}

function NoteField({ exerciseId, initial }: { exerciseId: string; initial: string }) {
  const [text, setText] = useState(initial)
  useEffect(() => setText(initial), [initial])
  return (
    <>
      <label className="lbl">Mis notas (asiento, agarre, máquina…)</label>
      <textarea
        className="text-input"
        rows={2}
        placeholder="Ej.: asiento en el 4, la máquina del fondo"
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          db.notes.put({ exerciseId, note: e.target.value })
        }}
      />
    </>
  )
}
