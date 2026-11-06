# Gym Log 💪

App de gimnasio personal (PWA instalable en el móvil). Modo oscuro azul marino + verde fosforito.

## Stack
- Vite + React + TypeScript
- Dexie (IndexedDB): **autoguardado** de cada serie al instante, funciona sin conexión
- vite-plugin-pwa: instalable y offline
- Despliegue en Vercel (`vercel.json` reescribe las rutas a `index.html`)

```bash
npm install
npm run dev      # desarrollo
npm run build    # typecheck + build de producción
```

## Estructura
- `src/data/exercises.ts`: biblioteca de ejercicios (variantes, consejos, alternativas)
- `src/data/seed.ts`: rutina inicial, perfil y peso (se cargan la primera vez)
- `src/data/db.ts`: base de datos, sesiones, última marca, copia de seguridad
- `src/data/progression.ts`: sugerencias de doble progresión y semanas de readaptación
- `src/pages/`: Semana, Día, Entreno, Historial, Perfil

## Rutina actual: 4 días flexibles (desde el 6-nov-2026)
Sin días fijos: se hacen en orden (1 → 2 → 3 → 4) cuando se pueda. Objetivo: 4 por semana, 45-60 min de fuerza + 15 min de cardio. 🔗 = superserie.
- **Día 1, Pecho y hombro:** press banca Multipower 4×8-10 · press inclinado (Multipower o mancuernas) 3×10-12 · press militar 3×8-10 · 🔗 mariposa + elevaciones laterales 3×12-15 · tríceps en polea 3×12-15 · 15′ cinta inclinada
- **Día 2, Pierna:** prensa 4×10-12 · peso muerto rumano 3×10-12 · 🔗 extensión de cuádriceps + gemelos 3×12-15 · elevación de piernas 3×12-15 · 15′ cinta inclinada
- **Día 3, Espalda y bíceps:** jalón 4×10-12 · remo con mancuerna 3×10-12 · remo en polea baja 3×10-12 · 🔗 face pull + curl con mancuernas 3×12-15 · 15′ bici o cinta
- **Día 4, Femoral y brazos:** curl femoral sentado 3×10-12 · 🔗 aductores + abductores 3×12-15 · zancadas 3×8-10 por pierna · 🔗 curl martillo + press francés 3×10-12 · 🔗 curl en polea + tríceps con cuerda 3×12-15 · 15′ cinta inclinada
- Domingo u otros días: actividad libre (fútbol, pádel, bici, caminar).
- Rutina anterior (oct-2026, Empuje/Pierna/Tirón 3 días fijos) guardada como `LEGACY_ROUTINE_3D` para el historial.

## Hoja de ruta (detalle en ROADMAP.md)
- [x] **Fase 1:** semana, día, modo entreno (peso, reps y RIR), última vez, sugerencias, sustituir ejercicio, opcionales, cardio, actividad libre, temporizador de descanso, historial, perfil y peso corporal, copia manual
- [ ] Copia automática en la nube (Supabase + login)
- [ ] Gráficas de progreso por ejercicio, 1RM estimado y récords 🏆
- [ ] Calendario y racha
- [ ] **Propuestas del coach:** al cabo de unas 8 semanas (aprox. principios de diciembre de 2026), proponer cambios en la rutina (p. ej. recuperar las aperturas en polea, rotar ejercicios, pasar a 4 días con un día de torso)
- [ ] Plan para correr 5 km
- [ ] Editor de rutina dentro de la app
- [ ] Medidas corporales
