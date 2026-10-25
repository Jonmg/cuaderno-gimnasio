/* Plantillas para el plan a medida (motor de rutina). Cada persona elige en la app cuántos días
   de fuerza y de cardio quiere a la semana; el plan se arma con estas plantillas.

   - dias: cada día es una lista de huecos. Un hueco no es un ejercicio fijo: ej es la lista de
     candidatos por orden de preferencia. La app elige el primero, salvo que la persona tenga un
     favorito que encaje (mismo grupo muscular y tipo) o un candidato con su máquina favorita.
     Los demás campos (series, reps, unidad, sinPeso, porLado, tipo, superserie, opcional) son
     la pauta del hueco, igual que en planes/rutina-3dias.js.
   - enfoques y semanas: qué días forman el plan según el enfoque que elige la persona
     (equilibrado, pierna y glúteo, torso) y los días de fuerza. Los días d1, d2 y d3 son los de
     planes/rutina-3dias.js (equilibrado con 3 días es exactamente ese plan).
   - cardio: el día de cardio. Va aparte de la rotación: la app lo propone cuando toca para
     cumplir los días de cardio de la semana.
   - cardioAntes: candidatos para los minutos de cardio antes de las máquinas, si la persona
     los pide (van como primer ejercicio de cada día de fuerza).
   Los ids de los días no se cambian: el historial guarda qué día se hizo. */
window.PLANTILLAS = {
  dias: {
    "cuerpo-a": {
      titulo: "Cuerpo entero A", rodilla: true,
      calentamiento: ["5 min de bici o elíptica", "Movilidad de cadera y hombros"],
      huecos: [
        { ej: ["sentadilla", "prensa"], seccion: "Pierna", series: 3, reps: [8, 10], tipo: "principal" },
        { ej: ["press-banca", "press-inclinado"], seccion: "Pecho", series: 3, reps: [8, 10], tipo: "principal" },
        { ej: ["remo", "jalon"], seccion: "Espalda", series: 3, reps: [8, 10], tipo: "principal", rodilla: false },
        { ej: ["rumano", "femoral"], seccion: "Isquios", series: 3, reps: [8, 10], tipo: "principal" },
        { ej: ["laterales", "press-hombro-mancuernas"], seccion: "Hombro", series: 2, reps: [12, 15], tipo: "aislamiento", rodilla: false },
        { ej: ["plancha", "dead-bug"], seccion: "Core", series: 3, reps: [30, 45], unidad: "s", sinPeso: true, tipo: "aislamiento", rodilla: false },
      ],
    },
    "cuerpo-b": {
      titulo: "Cuerpo entero B", rodilla: true,
      calentamiento: ["5 min de bici o elíptica", "Activación de glúteos con bandas"],
      huecos: [
        { ej: ["prensa", "zancada", "sentadilla"], seccion: "Pierna", series: 3, reps: [10, 12], tipo: "principal" },
        { ej: ["jalon", "dominadas", "remo"], seccion: "Espalda", series: 3, reps: [8, 10], tipo: "principal", rodilla: false },
        { ej: ["press-inclinado", "press-banca"], seccion: "Pecho", series: 3, reps: [8, 10], tipo: "principal", rodilla: false },
        { ej: ["hip-thrust", "puente-gluteo"], seccion: "Glúteo", series: 3, reps: [8, 12], tipo: "principal" },
        { ej: ["curl", "curl-martillo"], seccion: "Brazos", series: 2, reps: [10, 12], tipo: "aislamiento", superserie: "A", rodilla: false },
        { ej: ["triceps-polea", "frances"], seccion: "Brazos", series: 2, reps: [10, 12], tipo: "aislamiento", superserie: "A", rodilla: false },
      ],
    },
    "torso-a": {
      titulo: "Torso A · fuerza",
      calentamiento: ["5 min de remo o elíptica", "Movilidad de hombros y activación de escápulas con bandas"],
      huecos: [
        { ej: ["press-banca"], seccion: "Pecho", series: 4, reps: [6, 8], tipo: "principal" },
        { ej: ["remo"], seccion: "Espalda", series: 4, reps: [8, 10], tipo: "principal" },
        { ej: ["press-hombro-mancuernas"], seccion: "Hombro", series: 3, reps: [8, 10], tipo: "principal" },
        { ej: ["jalon", "dominadas"], seccion: "Espalda", series: 3, reps: [8, 10], tipo: "principal" },
        { ej: ["curl", "curl-martillo"], seccion: "Bíceps", series: 3, reps: [8, 10], tipo: "aislamiento" },
        { ej: ["triceps-polea", "frances"], seccion: "Tríceps", series: 3, reps: [10, 12], tipo: "aislamiento" },
      ],
    },
    "torso-b": {
      titulo: "Torso B · volumen",
      calentamiento: ["5 min de remo o elíptica", "Movilidad de hombros"],
      huecos: [
        { ej: ["press-inclinado", "press-banca"], seccion: "Pecho", series: 3, reps: [8, 10], tipo: "principal" },
        { ej: ["jalon", "dominadas"], seccion: "Espalda", series: 3, reps: [10, 12], tipo: "principal" },
        { ej: ["aperturas", "pullover"], seccion: "Pecho", series: 3, reps: [12, 15], tipo: "aislamiento" },
        { ej: ["face-pull", "pajaros"], seccion: "Espalda", series: 3, reps: [12, 15], tipo: "aislamiento" },
        { ej: ["laterales"], seccion: "Hombro", series: 3, reps: [12, 15], tipo: "aislamiento" },
        { ej: ["curl-martillo", "curl"], seccion: "Brazos", series: 3, reps: [10, 12], tipo: "aislamiento", superserie: "A" },
        { ej: ["triceps-tras-nuca", "triceps-polea"], seccion: "Brazos", series: 3, reps: [10, 12], tipo: "aislamiento", superserie: "A" },
      ],
    },
    "pierna-b": {
      titulo: "Pierna B · glúteo e isquios", rodilla: true,
      nota: "Recorridos cómodos y sin impacto: la rodilla manda.",
      calentamiento: ["Bici estática", "Activación de glúteos con bandas"],
      huecos: [
        { ej: ["hack", "sentadilla", "prensa"], seccion: "Pierna", series: 3, reps: [8, 10], tipo: "principal" },
        { ej: ["hip-thrust", "puente-gluteo"], seccion: "Glúteo", series: 3, reps: [8, 12], tipo: "principal" },
        { ej: ["femoral", "nordico"], seccion: "Isquios", series: 3, reps: [10, 12], tipo: "aislamiento" },
        { ej: ["bulgara", "zancada"], seccion: "Pierna", series: 2, reps: [8, 10], porLado: true, tipo: "principal" },
        { ej: ["gemelo-pie", "gemelo-sentado"], seccion: "Gemelo", series: 3, reps: [12, 15], tipo: "aislamiento" },
        { ej: ["plancha-lateral", "pallof"], seccion: "Core", series: 2, reps: [20, 40], unidad: "s", sinPeso: true, porLado: true, tipo: "aislamiento", rodilla: false },
      ],
    },
    "empuje-b": {
      titulo: "Hombro + pecho + tríceps",
      calentamiento: ["5 min de elíptica", "Movilidad de hombros con bandas"],
      huecos: [
        { ej: ["press-hombro-mancuernas"], seccion: "Hombro", series: 4, reps: [8, 10], tipo: "principal" },
        { ej: ["press-inclinado", "press-banca"], seccion: "Pecho", series: 3, reps: [8, 10], tipo: "principal" },
        { ej: ["laterales"], seccion: "Hombro", series: 3, reps: [12, 15], tipo: "aislamiento" },
        { ej: ["aperturas"], seccion: "Pecho", series: 3, reps: [12, 15], tipo: "aislamiento" },
        { ej: ["frances", "triceps-tras-nuca", "triceps-polea"], seccion: "Tríceps", series: 3, reps: [10, 12], tipo: "aislamiento" },
        { ej: ["crunch-polea", "rueda"], seccion: "Core", series: 3, reps: [12, 15], tipo: "aislamiento" },
      ],
    },
    /* Enfoque pierna y glúteo: cinco máquinas o ejercicios de pierna por día y core opcional. */
    "pg-a": {
      titulo: "Pierna y glúteo A",
      calentamiento: ["Movilidad de cadera", "Activación de glúteos con bandas"],
      huecos: [
        { ej: ["prensa", "hack", "sentadilla"], seccion: "Pierna", series: 3, reps: [10, 12], tipo: "principal" },
        { ej: ["hip-thrust", "puente-gluteo"], seccion: "Glúteo", series: 3, reps: [8, 12], tipo: "principal" },
        { ej: ["extension", "step-up"], seccion: "Cuádriceps", series: 3, reps: [12, 15], tipo: "aislamiento" },
        { ej: ["femoral", "nordico"], seccion: "Isquios", series: 3, reps: [10, 12], tipo: "aislamiento" },
        { ej: ["abductores", "monster-walk"], seccion: "Glúteo", series: 3, reps: [15, 20], tipo: "aislamiento" },
        { ej: ["plancha", "dead-bug"], seccion: "Core", series: 2, reps: [30, 45], unidad: "s", sinPeso: true, tipo: "aislamiento", opcional: true },
      ],
    },
    "pg-b": {
      titulo: "Pierna y glúteo B",
      calentamiento: ["Movilidad de cadera", "Activación de glúteos con bandas"],
      huecos: [
        { ej: ["rumano", "hiperextensiones"], seccion: "Isquios", series: 3, reps: [8, 10], tipo: "principal" },
        { ej: ["bulgara", "zancada", "step-up"], seccion: "Pierna", series: 3, reps: [8, 10], porLado: true, tipo: "principal" },
        { ej: ["patada-gluteo", "puente-gluteo"], seccion: "Glúteo", series: 3, reps: [12, 15], porLado: true, tipo: "aislamiento" },
        { ej: ["aductores"], seccion: "Aductores", series: 3, reps: [12, 15], tipo: "aislamiento" },
        { ej: ["gemelo-pie", "gemelo-sentado"], seccion: "Gemelo", series: 3, reps: [12, 15], tipo: "aislamiento" },
        { ej: ["dead-bug", "plancha"], seccion: "Core", series: 2, reps: [8, 10], sinPeso: true, porLado: true, tipo: "aislamiento", opcional: true },
      ],
    },
    "pg-c": {
      titulo: "Pierna y glúteo C",
      calentamiento: ["Movilidad de cadera", "Activación de glúteos con bandas"],
      huecos: [
        { ej: ["hip-thrust", "puente-gluteo"], seccion: "Glúteo", series: 4, reps: [8, 10], tipo: "principal" },
        { ej: ["hack", "sentadilla", "prensa"], seccion: "Pierna", series: 3, reps: [8, 10], tipo: "principal" },
        { ej: ["femoral", "nordico"], seccion: "Isquios", series: 3, reps: [10, 12], tipo: "aislamiento" },
        { ej: ["abductores", "monster-walk"], seccion: "Glúteo", series: 3, reps: [15, 20], tipo: "aislamiento" },
        { ej: ["hiperextensiones", "rumano"], seccion: "Lumbar y glúteo", series: 3, reps: [12, 15], tipo: "aislamiento" },
      ],
    },
    "torso-c": {
      titulo: "Torso",
      calentamiento: ["Movilidad de hombros"],
      huecos: [
        { ej: ["jalon", "dominadas"], seccion: "Espalda", series: 3, reps: [10, 12], tipo: "principal" },
        { ej: ["press-banca", "press-inclinado"], seccion: "Pecho", series: 3, reps: [10, 12], tipo: "principal" },
        { ej: ["remo"], seccion: "Espalda", series: 3, reps: [10, 12], tipo: "principal" },
        { ej: ["press-hombro-mancuernas", "laterales"], seccion: "Hombro", series: 3, reps: [10, 12], tipo: "principal" },
        { ej: ["plancha", "dead-bug"], seccion: "Core", series: 3, reps: [30, 45], unidad: "s", sinPeso: true, tipo: "aislamiento" },
      ],
    },
    "tiron-b": {
      titulo: "Espalda + bíceps + lumbar",
      calentamiento: ["Remo suave", "Movilidad de hombros"],
      huecos: [
        { ej: ["jalon", "dominadas"], seccion: "Espalda", series: 4, reps: [8, 10], tipo: "principal" },
        { ej: ["remo"], seccion: "Espalda", series: 3, reps: [8, 10], tipo: "principal" },
        { ej: ["pullover"], seccion: "Espalda", series: 3, reps: [10, 12], tipo: "aislamiento" },
        { ej: ["pajaros", "face-pull"], seccion: "Hombro posterior", series: 3, reps: [12, 15], tipo: "aislamiento" },
        { ej: ["curl-2", "curl"], seccion: "Bíceps", series: 3, reps: [10, 12], tipo: "aislamiento" },
        { ej: ["hiperextensiones"], seccion: "Lumbar", series: 3, reps: [12, 15], tipo: "aislamiento" },
      ],
    },
  },
  enfoques: [
    ["equilibrado", "Equilibrado", "Todo el cuerpo repartido en la semana"],
    ["pierna", "Pierna y glúteo", "Casi todo pierna y glúteo, algo de torso"],
    ["torso", "Torso", "Más pecho, espalda, hombro y brazos"],
  ],
  semanas: {
    equilibrado: {
      1: ["cuerpo-a"],
      2: ["cuerpo-a", "cuerpo-b"],
      3: ["d1", "d2", "d3"],
      4: ["torso-a", "d3", "torso-b", "pierna-b"],
      5: ["d1", "d2", "d3", "torso-b", "pierna-b"],
      6: ["d1", "d2", "d3", "empuje-b", "tiron-b", "pierna-b"],
    },
    pierna: {
      1: ["pg-a"],
      2: ["pg-a", "pg-b"],
      3: ["pg-a", "torso-c", "pg-b"],
      4: ["pg-a", "torso-c", "pg-b", "pg-c"],
      5: ["pg-a", "torso-c", "pg-b", "pg-c", "torso-b"],
      6: ["pg-a", "torso-c", "pg-b", "torso-b", "pg-c", "pierna-b"],
    },
    torso: {
      1: ["cuerpo-a"],
      2: ["torso-a", "cuerpo-b"],
      3: ["torso-a", "pierna-b", "torso-b"],
      4: ["empuje-b", "tiron-b", "pierna-b", "torso-b"],
      5: ["torso-a", "pierna-b", "empuje-b", "tiron-b", "torso-b"],
      6: ["empuje-b", "tiron-b", "pierna-b", "torso-a", "torso-b", "d3"],
    },
  },
  cardioAntes: ["bici", "eliptica", "cinta", "remo-ergometro"],
  cardio: {
    id: "cardio", nombre: "Cardio", titulo: "Cardio constante",
    nota: "A un ritmo en el que puedas hablar: mejor constante que a tope.",
    calentamiento: ["5 min a ritmo muy suave"],
    huecos: [
      { ej: ["bici", "eliptica", "cinta", "remo-ergometro"], seccion: "Cardio", series: 1, reps: [25, 40], unidad: "min", sinPeso: true, tipo: "aislamiento" },
      { ej: ["eliptica", "cinta", "bici"], seccion: "Para terminar", series: 1, reps: [10, 15], unidad: "min", sinPeso: true, tipo: "aislamiento", opcional: true },
      { ej: ["plancha", "dead-bug"], seccion: "Core", series: 2, reps: [30, 45], unidad: "s", sinPeso: true, tipo: "aislamiento", opcional: true },
      { ej: ["estiramientos"], seccion: "Estirar", series: 1, reps: [5, 10], unidad: "min", sinPeso: true, tipo: "aislamiento", opcional: true },
    ],
  },
};
