import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef, useState } from 'react'
import { db, exportBackup, fromISODate, importBackup, requestPersistence, todayISO, type Backup } from '../data/db'
import { fmtKg } from '../data/progression'
import type { Profile } from '../data/types'

const BACKUP_KEY = 'gymlog.last-backup'

function ageFrom(birth: string): number {
  const b = new Date(birth)
  const n = new Date()
  let age = n.getFullYear() - b.getFullYear()
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) age--
  return age
}

export default function ProfilePage() {
  const profile = useLiveQuery(() => db.profile.get('me'))
  const weights = useLiveQuery(() => db.bodyweights.orderBy('date').reverse().toArray()) ?? []
  const [kg, setKg] = useState('')
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [lastBackup, setLastBackup] = useState<string | null>(() => {
    try {
      return localStorage.getItem(BACKUP_KEY)
    } catch {
      return null
    }
  })
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(null))
  }, [])

  if (!profile) return null

  const setField = (patch: Partial<Profile>) => db.profile.update('me', patch)
  const current = weights[0]
  const bmi = current ? current.kg / (profile.heightCm / 100) ** 2 : null

  async function addWeight() {
    const n = parseFloat(kg.replace(',', '.'))
    if (!Number.isFinite(n) || n < 30 || n > 250) return
    const date = todayISO()
    const existing = await db.bodyweights.where('date').equals(date).first()
    if (existing) await db.bodyweights.update(existing.id!, { kg: n })
    else await db.bodyweights.add({ date, kg: n })
    setKg('')
  }

  async function doExport() {
    const data = await exportBackup()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const name = `gymlog-copia-${todayISO()}.json`
    const file = new File([blob], name, { type: 'application/json' })
    // En el móvil, compartir permite guardarlo en Drive, WhatsApp, Archivos…
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Copia de Gym Log' })
      } catch {
        return
      }
    } else {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = name
      a.click()
      URL.revokeObjectURL(a.href)
    }
    const now = new Date().toISOString()
    try {
      localStorage.setItem(BACKUP_KEY, now)
    } catch {
      /* no pasa nada */
    }
    setLastBackup(now)
  }

  async function doImport(f: File) {
    try {
      const data = JSON.parse(await f.text()) as Backup
      if (!confirm(`¿Restaurar la copia del ${new Date(data.exportedAt).toLocaleDateString('es-ES')}? Se reemplazarán los datos actuales.`)) return
      await importBackup(data)
      alert('Copia restaurada ✓')
    } catch (e) {
      alert(`No se pudo restaurar: ${(e as Error).message}`)
    }
  }

  const daysSinceBackup = lastBackup ? Math.floor((Date.now() - new Date(lastBackup).getTime()) / 86400000) : null

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Perfil</h1>
          <div className="sub">Tus datos y tu copia de seguridad</div>
        </div>
      </header>

      <div className="card">
        <div className="spread">
          <div>
            <div className="big">{profile.name}</div>
            <div className="muted small">
              {ageFrom(profile.birthDate)} años · {(profile.heightCm / 100).toFixed(2).replace('.', ',')} m
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="big num">{current ? `${fmtKg(current.kg)} kg` : '–'}</div>
            {bmi && <div className="muted small">IMC {bmi.toFixed(1).replace('.', ',')}</div>}
          </div>
        </div>
      </div>

      <div className="section-title">Peso corporal</div>
      <div className="card">
        <div className="row">
          <input className="text-input" inputMode="decimal" placeholder="Peso de hoy (kg)" value={kg} onChange={(e) => setKg(e.target.value.replace(/[^\d.,]/g, ''))} />
          <button className="btn primary" onClick={addWeight}>
            Guardar
          </button>
        </div>
        <div className="small muted" style={{ marginTop: 8 }}>
          Pésate en ayunas, mejor siempre el mismo día de la semana.
        </div>
        {weights.slice(0, 8).map((w, i) => {
          const prev = weights[i + 1]
          const diff = prev ? w.kg - prev.kg : 0
          return (
            <div key={w.id} className="spread num" style={{ marginTop: 10, fontSize: 15 }}>
              <span className="muted">{fromISODate(w.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span>
                <b>{fmtKg(w.kg)} kg</b>
                {prev && diff !== 0 && (
                  <span className="small" style={{ marginLeft: 8, color: diff < 0 ? 'var(--accent)' : 'var(--warn)' }}>
                    {diff > 0 ? '+' : ''}
                    {fmtKg(Math.round(diff * 10) / 10)}
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>

      <div className="section-title">Mis datos</div>
      <div className="card">
        <label className="lbl" style={{ marginTop: 0 }}>
          Nombre
        </label>
        <input className="text-input" defaultValue={profile.name} onChange={(e) => setField({ name: e.target.value })} />
        <div className="row">
          <div style={{ flex: 1 }}>
            <label className="lbl">Nacimiento</label>
            <input className="text-input" type="date" defaultValue={profile.birthDate} onChange={(e) => e.target.value && setField({ birthDate: e.target.value })} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="lbl">Altura (cm)</label>
            <input
              className="text-input"
              inputMode="numeric"
              defaultValue={profile.heightCm}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                if (n > 100 && n < 250) setField({ heightCm: n })
              }}
            />
          </div>
        </div>
        <label className="lbl">Objetivo</label>
        <textarea className="text-input" rows={3} defaultValue={profile.goal} onChange={(e) => setField({ goal: e.target.value })} />
        <label className="lbl">Experiencia</label>
        <textarea className="text-input" rows={3} defaultValue={profile.experience} onChange={(e) => setField({ experience: e.target.value })} />
        <label className="lbl">Notas (lesiones, gimnasio…)</label>
        <textarea className="text-input" rows={3} defaultValue={profile.notes} onChange={(e) => setField({ notes: e.target.value })} />
      </div>

      <div className="section-title">Tus datos están a salvo</div>
      <div className="card">
        <div className="small">
          💾 <b>Autoguardado:</b> todo se guarda en el móvil en cuanto lo escribes.
        </div>
        <div className="small" style={{ marginTop: 6 }}>
          🔒 <b>Almacenamiento protegido:</b>{' '}
          {persisted ? (
            <span className="brand">activado</span>
          ) : (
            <>
              <span style={{ color: 'var(--warn)' }}>no confirmado</span>{' '}
              <button className="btn sm" style={{ marginLeft: 4 }} onClick={() => requestPersistence().then(setPersisted)}>
                Activar
              </button>
            </>
          )}
        </div>
        <div className="small muted" style={{ marginTop: 6 }}>
          ☁️ Próximamente: copia automática en la nube.
        </div>

        <div className="small" style={{ marginTop: 14 }}>
          Última copia manual:{' '}
          {daysSinceBackup == null ? (
            <span style={{ color: 'var(--warn)' }}>nunca</span>
          ) : (
            <span style={{ color: daysSinceBackup > 7 ? 'var(--warn)' : 'var(--accent)' }}>
              {daysSinceBackup === 0 ? 'hoy' : `hace ${daysSinceBackup} días`}
            </span>
          )}
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn primary" style={{ flex: 1 }} onClick={doExport}>
            ⬇ Hacer copia
          </button>
          <button className="btn" style={{ flex: 1 }} onClick={() => fileRef.current?.click()}>
            ⬆ Restaurar
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) doImport(f)
            e.target.value = ''
          }}
        />
      </div>

      <p className="small muted" style={{ textAlign: 'center', marginTop: 24 }}>
        Gym Log · v0.1
      </p>
    </>
  )
}
