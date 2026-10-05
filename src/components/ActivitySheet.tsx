import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { db, uid } from '../data/db'
import Sheet from './Sheet'

const TYPES = ['⚽ Fútbol', '🎾 Pádel', '🚴 Bici', '🐕 Caminar', '🏃 Correr', '🏊 Nadar', '✨ Otro']

export default function ActivitySheet({ date, onClose }: { date: string; onClose: () => void }) {
  const existing = useLiveQuery(() => db.activities.where('date').equals(date).first(), [date])
  const [type, setType] = useState(TYPES[0])
  const [minutes, setMinutes] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!existing) return
    setType(existing.type)
    setMinutes(existing.minutes ? String(existing.minutes) : '')
    setNotes(existing.notes ?? '')
  }, [existing])

  async function save() {
    const m = parseInt(minutes, 10)
    await db.activities.put({
      id: existing?.id ?? uid(),
      date,
      type,
      minutes: Number.isFinite(m) ? m : null,
      notes: notes.trim() || undefined,
    })
    onClose()
  }

  async function remove() {
    if (existing) await db.activities.delete(existing.id)
    onClose()
  }

  return (
    <Sheet onClose={onClose}>
      <h3>Actividad libre</h3>
      <div className="chips">
        {TYPES.map((t) => (
          <button key={t} className={`chip ${type === t ? 'on' : ''}`} onClick={() => setType(t)}>
            {t}
          </button>
        ))}
      </div>
      <label className="lbl">Minutos</label>
      <input className="text-input" inputMode="numeric" placeholder="60" value={minutes} onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ''))} />
      <label className="lbl">Notas (opcional)</label>
      <input className="text-input" placeholder="Partido con los amigos, 5 km en bici…" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className="row" style={{ marginTop: 16 }}>
        {existing && (
          <button className="btn danger" onClick={remove}>
            Borrar
          </button>
        )}
        <button className="btn primary" style={{ flex: 1 }} onClick={save}>
          Guardar
        </button>
      </div>
    </Sheet>
  )
}
