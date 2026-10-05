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

## Rutina actual: Empuje / Pierna / Tirón (desde el 5-oct-2026)
- **Lunes, Empuje:** press banca (Multipower), press inclinado con mancuernas, press militar sentado, elevaciones laterales, tríceps en polea, 20′ de cinta. Opcionales: aperturas en polea y press francés.
- **Miércoles, Pierna:** sentadilla (Multipower), peso muerto rumano, curl femoral, extensión de cuádriceps, gemelos, elevación de piernas, 15′ de cinta. Opcional: prensa.
- **Jueves, Tirón:** jalón al pecho, remo con mancuerna, remo en polea baja, face pull, curl con mancuernas, 20′ de cinta. Opcional: curl martillo.
- **Domingo:** actividad libre (fútbol, pádel, bici, caminar).
- Semanas 1-2: readaptación (RIR 3). Después, doble progresión.

## Hoja de ruta (detalle en ROADMAP.md)
- [x] **Fase 1:** semana, día, modo entreno (peso, reps y RIR), última vez, sugerencias, sustituir ejercicio, opcionales, cardio, actividad libre, temporizador de descanso, historial, perfil y peso corporal, copia manual
- [ ] Copia automática en la nube (Supabase + login)
- [ ] Gráficas de progreso por ejercicio, 1RM estimado y récords 🏆
- [ ] Calendario y racha
- [ ] **Propuestas del coach:** al cabo de unas 8 semanas (aprox. principios de diciembre de 2026), proponer cambios en la rutina (p. ej. recuperar las aperturas en polea, rotar ejercicios, pasar a 4 días con un día de torso)
- [ ] Plan para correr 5 km
- [ ] Editor de rutina dentro de la app
- [ ] Medidas corporales
