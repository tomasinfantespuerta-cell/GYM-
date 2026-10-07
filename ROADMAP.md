# Gym Log · Hoja de ruta

App publicada en **https://gym-seven-plum.vercel.app** (Vercel publica la rama `claude/nifty-wozniak-g6oag0` al hacer push).

## ✅ Hecho: Fase 1 (5-oct-2026)
- 7-oct: descansos acortados (principales 2:00, secundarios 1:30, pequeños 1:00); el temporizador solo vibra, sin sonido
- Semana con los días de la rutina, estado (hecho / hoy / pendiente) y actividad libre del domingo
- Detalle de cada día con consejos de técnica y alternativas
- Modo entreno con **autoguardado**: peso, reps, RIR opcional, última vez, sugerencia de progresión
- Temporizador de descanso automático (vibración + pitido, +15 s, saltar)
- Cambiar ejercicio si la máquina está ocupada · variantes (Multipower / barra / mancuernas)
- Ejercicios opcionales · cardio final · notas por ejercicio y del día
- Historial · Perfil · registro de peso corporal · copia de seguridad manual (exportar / restaurar)
- PWA instalable en el móvil

## 🔜 Próximo: Fase 2

### 1. ☁️ Copia automática en la nube ← LO SIGUIENTE
- Supabase (gratis): login con email o Google, tabla por usuario con seguridad por filas
- Sincronización automática en segundo plano; la app sigue funcionando sin conexión
- Al iniciar sesión en otro móvil se recupera todo
- Permite que un amigo tenga su cuenta con sus propios datos
- **Lo que tendrá que hacer Tomás:** crear la cuenta en supabase.com y pasar la URL y la clave pública (guiado paso a paso)

### 1b. 📳 Aviso de fin de descanso en segundo plano (elegido por Tomás, hacer junto a la nube)
- Al marcar una serie, la app pide a una función de Vercel que le envíe una **notificación push** cuando acabe el descanso
- Vibra aunque el móvil esté bloqueado o en otra app (Android; iPhone con la app instalada, iOS 16.4+)
- Si pulsa "Saltar" o empieza otro descanso, el aviso anterior se cancela (el service worker comprueba el id del temporizador actual)
- Necesita: claves VAPID, permiso de notificaciones y un envío con retraso (función que espera o cola tipo QStash)
- Preguntar a Tomás si su móvil es Android o iPhone

### 2. 📈 Progreso y récords
- Gráfica por ejercicio: peso máximo, 1RM estimado y volumen
- Récord personal 🏆 con aviso en el momento de batirlo
- Resumen al terminar el entreno: récords, comparación con la semana anterior
- Gráfica de peso corporal

### 3. 🔥 Calendario y racha
- Calendario mensual con los días entrenados y las actividades
- Racha de semanas cumpliendo los 3 entrenos (+ actividad del domingo)
- Resumen semanal: entrenos, series, volumen y minutos de cardio

### 4. 🧠 Propuestas del coach
- Hacia **principios de diciembre de 2026** (unas 8 semanas): proponer cambios para que Tomás diga sí o no
  - Recuperar las aperturas en polea (lunes)
  - Rotar algún ejercicio para no estancarse ni aburrirse
  - Pasar a 4 días con un día extra de **torso**
- Detectar estancamientos (3 semanas sin progresar en un ejercicio) y sugerir un cambio
- Semana de descarga cada 6-8 semanas

### 5. 🏃 Plan para correr 5 km
- Plan progresivo (caminar/correr → 5 km seguidos) usando el cardio del final o el domingo
- Registro de distancia, tiempo y ritmo; objetivo: 5 km sintiéndose ligero

## 💡 Mejoras e ideas
- Editor de rutina dentro de la app (añadir, quitar o cambiar ejercicios, series y descansos)
- Varias rutinas guardadas y cambiar entre ellas sin perder el historial
- Reordenar ejercicios en el modo entreno (arrastrar)
- "Modo rápido" para días con poco tiempo: solo los ejercicios principales
- Medidas corporales (cintura, pecho, brazo, muslo) con evolución
- Recordatorio de copia de seguridad si no hay nube
- Series de calentamiento sugeridas para los ejercicios grandes
- Descartado por Tomás: calculadora de discos

## 🐞 Defectos reportados
_(ir apuntando aquí lo que encuentre Tomás al usarla)_
