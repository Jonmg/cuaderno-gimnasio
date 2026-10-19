/* Plan de 3 días: Jon y Mikel.
   Para cambiar el plan basta con editar este fichero. Campos de cada ejercicio:
     id          identificador único (no cambiarlo si ya hay historial: se perdería el hilo)
     nombre      lo que se ve en pantalla
     (con qué máquina o material se hace, los músculos y la ayuda vienen del catálogo: comun/catalogo.js)
     series      número de series; seriesOpcionales: cuántas de las últimas son opcionales
     reps        [mínimo, máximo] del rango. Con unidad "s" son segundos
     porLado     true si las repeticiones son por pierna/brazo
     sinPeso     true si no se apunta peso
     tipo        "principal" o "aislamiento": decide el descanso
     superserie  misma letra = se alternan sin descanso entre ellos
     opcional    true si el ejercicio entero es opcional
     nota        consejo que se ve debajo del nombre
     rodilla     false para no preguntar por la rodilla en ese ejercicio (en días de pierna) */
window.PLAN = {
  nombre: "Rutina de 3 días",
  objetivoSemanal: 3,
  duracionMin: 45,
  descansos: { principal: 90, aislamiento: 60 },
  textoDescansos: "60–90 s en los ejercicios principales, 45–60 s en los aislamientos.",
  dias: [
    {
      id: "d1", nombre: "Día 1", titulo: "Pecho + Tríceps + core",
      calentamiento: ["5 min de bici o elíptica", "Movilidad de hombros y activación de escápulas con bandas"],
      ejercicios: [
        { id: "press-banca", seccion: "Pecho", nombre: "Press banca", series: 4, reps: [6, 8], tipo: "principal", nota: "Ejercicio base: controla bien la bajada." },
        { id: "press-inclinado", seccion: "Pecho", nombre: "Press inclinado", series: 3, reps: [8, 10], tipo: "principal" },
        { id: "aperturas", seccion: "Pecho", nombre: "Aperturas", series: 3, reps: [12, 15], tipo: "aislamiento", nota: "Sin bloquear los codos." },
        { id: "fondos", seccion: "Tríceps", nombre: "Fondos", series: 3, reps: [8, 10], tipo: "principal", nota: "En la máquina asistida apunta el peso de ayuda: cuanto menos, mejor." },
        { id: "triceps-polea", seccion: "Tríceps", nombre: "Extensión de tríceps", series: 3, reps: [10, 12], tipo: "aislamiento" },
        { id: "plancha", seccion: "Core", nombre: "Plancha frontal", series: 3, reps: [30, 45], unidad: "s", sinPeso: true, tipo: "aislamiento" },
      ],
    },
    {
      id: "d2", nombre: "Día 2", titulo: "Espalda + Bíceps + Hombro",
      calentamiento: ["Remo suave", "Movilidad de hombros"],
      ejercicios: [
        { id: "jalon", seccion: "Espalda", nombre: "Jalón al pecho", series: 4, reps: [8, 10], tipo: "principal" },
        { id: "remo", seccion: "Espalda", nombre: "Remo", series: 3, reps: [8, 10], tipo: "principal" },
        { id: "face-pull", seccion: "Espalda", nombre: "Face pull / pájaros en polea", series: 3, reps: [12, 15], tipo: "aislamiento", nota: "Clave para unos hombros sanos." },
        { id: "curl", seccion: "Bíceps", nombre: "Curl de bíceps", series: 3, reps: [8, 10], tipo: "aislamiento" },
        { id: "curl-2", seccion: "Bíceps", nombre: "Curl inclinado o predicador", series: 3, reps: [10, 12], tipo: "aislamiento" },
        { id: "laterales", seccion: "Hombro ligero", nombre: "Elevaciones laterales", series: 3, seriesOpcionales: 1, reps: [12, 15], tipo: "aislamiento", nota: "2–3 series: la tercera es opcional." },
      ],
    },
    {
      id: "d3", nombre: "Día 3", titulo: "Pierna + estabilidad + brazo extra", rodilla: true,
      nota: "Día muy recomendable para las rodillas.",
      calentamiento: ["Bici estática", "Activación de glúteos con bandas"],
      ejercicios: [
        { id: "prensa", seccion: "Pierna", nombre: "Prensa", series: 3, reps: [10, 12], tipo: "principal", nota: "Recorrido cómodo, pies algo altos en la plataforma." },
        { id: "rumano", seccion: "Pierna", nombre: "Peso muerto rumano", series: 3, reps: [8, 10], tipo: "principal", nota: "Fortalece los isquios, clave para el LCA." },
        { id: "femoral", seccion: "Pierna", nombre: "Curl femoral", series: 3, reps: [10, 12], tipo: "aislamiento" },
        { id: "step-up", seccion: "Pierna", nombre: "Step-up bajo o zancada estática corta", series: 2, reps: [8, 8], porLado: true, tipo: "principal", nota: "Control, sin impacto." },
        { id: "equilibrio", seccion: "Estabilidad", nombre: "Equilibrio a una pierna", series: 2, reps: [30, 30], unidad: "s", porLado: true, sinPeso: true, tipo: "aislamiento" },
        { id: "ss-biceps", seccion: "Extra brazos", nombre: "Curl de bíceps en polea", series: 3, seriesOpcionales: 1, reps: [12, 15], tipo: "aislamiento", superserie: "A", opcional: true, rodilla: false },
        { id: "ss-triceps", seccion: "Extra brazos", nombre: "Extensión de tríceps en polea", series: 3, seriesOpcionales: 1, reps: [12, 15], tipo: "aislamiento", superserie: "A", opcional: true, rodilla: false },
      ],
    },
  ],
};
