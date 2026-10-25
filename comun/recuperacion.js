"use strict";
/* Motor "recuperación": sesión de gimnasio variada cada día con máquinas guiadas, paseos
   y señales de alarma. Pensado para volver a coger fuerza poco a poco tras una operación.
   Cada ejercicio tiene su ficha con la foto de la máquina (compartida con las otras libretas,
   ver fichas.js) y cómo se hace. */

/* ---------- Catálogo de ejercicios ----------
   Pensados para recuperar fuerza con máquinas guiadas y poco riesgo.
   tipo "fuerza": series × repeticiones + peso. tipo "tiempo": minutos. */
const CATALOGO = [
  // Calentamiento / cardio suave
  { id: "bici", nombre: "Bicicleta estática", grupo: "Calentamiento", tipo: "tiempo", min: 10, pauta: "Ritmo suave, que puedas hablar sin ahogarte." },
  { id: "cinta", nombre: "Cinta caminando", grupo: "Calentamiento", tipo: "tiempo", min: 10, pauta: "Sin inclinación al principio. Agárrate si lo necesitas." },
  { id: "eliptica", nombre: "Elíptica", grupo: "Calentamiento", tipo: "tiempo", min: 8, pauta: "Resistencia baja, movimiento continuo." },
  { id: "bicirec", nombre: "Bici reclinada", grupo: "Calentamiento", tipo: "tiempo", min: 10, pauta: "Espalda apoyada, pedaleo cómodo." },
  // Piernas
  { id: "prensa", nombre: "Prensa de piernas", grupo: "Piernas", tipo: "fuerza", series: 2, reps: 12, peso: 30, pauta: "Baja despacio, sin bloquear las rodillas al estirar." },
  { id: "extension", nombre: "Extensión de cuádriceps", grupo: "Piernas", tipo: "fuerza", series: 2, reps: 12, peso: 10, pauta: "Sube en 2 segundos, baja en 3." },
  { id: "femoral", nombre: "Curl femoral sentado", grupo: "Piernas", tipo: "fuerza", series: 2, reps: 12, peso: 10, pauta: "Movimiento controlado, sin tirones." },
  { id: "abductor", nombre: "Abductores en máquina", grupo: "Piernas", tipo: "fuerza", series: 2, reps: 12, peso: 15, pauta: "Abre despacio, espalda pegada al respaldo." },
  { id: "aductor", nombre: "Aductores en máquina", grupo: "Piernas", tipo: "fuerza", series: 2, reps: 12, peso: 15, pauta: "Cierra despacio, sin rebote." },
  { id: "silla", nombre: "Levantarse de la silla", grupo: "Piernas", tipo: "fuerza", series: 2, reps: 8, peso: 0, pauta: "Sin usar las manos si puedes. Peso = 0." },
  { id: "talones", nombre: "Elevación de talones con apoyo", grupo: "Piernas", tipo: "fuerza", series: 2, reps: 12, peso: 0, pauta: "Agarrado a una barra. Peso = 0." },
  // Tren superior
  { id: "remo", nombre: "Remo sentado en máquina", grupo: "Espalda y brazos", tipo: "fuerza", series: 2, reps: 12, peso: 15, pauta: "Saca pecho y junta los omóplatos al tirar." },
  { id: "jalon", nombre: "Jalón al pecho", grupo: "Espalda y brazos", tipo: "fuerza", series: 2, reps: 12, peso: 15, pauta: "Tira hacia la parte alta del pecho, no detrás de la nuca." },
  { id: "pecho", nombre: "Press de pecho en máquina", grupo: "Espalda y brazos", tipo: "fuerza", series: 2, reps: 12, peso: 10, pauta: "Empuja soltando el aire. No aguantes la respiración." },
  { id: "biceps", nombre: "Curl de bíceps en máquina", grupo: "Espalda y brazos", tipo: "fuerza", series: 2, reps: 12, peso: 5, pauta: "Codos quietos, sin balancear el cuerpo." },
  { id: "triceps", nombre: "Tríceps en polea", grupo: "Espalda y brazos", tipo: "fuerza", series: 2, reps: 12, peso: 5, pauta: "Codos pegados al cuerpo." },
  { id: "hombro", nombre: "Press de hombro en máquina", grupo: "Espalda y brazos", tipo: "fuerza", series: 2, reps: 10, peso: 5, pauta: "Peso muy ligero. Para si notas molestia." },
  // Equilibrio y movilidad
  { id: "equilibrio", nombre: "Equilibrio a una pierna con apoyo", grupo: "Equilibrio", tipo: "tiempo", min: 2, pauta: "20 segundos por pierna, varias veces. Siempre con algo a mano." },
  // Retirados: no le gustan los ejercicios tumbado. Siguen aquí por su historial.
  { id: "puente", nombre: "Puente de glúteo en colchoneta", grupo: "Equilibrio", tipo: "fuerza", series: 2, reps: 10, peso: 0, pauta: "Sube la cadera despacio. Peso = 0.", retirado: true },
  { id: "marcha", nombre: "Marcha en el sitio levantando rodillas", grupo: "Equilibrio", tipo: "tiempo", min: 2, pauta: "Con apoyo cerca. Rodillas a altura cómoda." },
  // Vuelta a la calma: estiramientos de pies, sentado o de pie (nada tumbado)
  { id: "estiramientos", nombre: "Estiramientos suaves", grupo: "Vuelta a la calma", tipo: "tiempo", min: 5, pauta: "Piernas, espalda y hombros. Sin rebotes, sin dolor.", retirado: true },
  { id: "gemelo-pared", nombre: "Estiramiento de gemelo en la pared", grupo: "Vuelta a la calma", tipo: "tiempo", min: 3, pauta: "De pie, manos en la pared. 30 segundos por pierna, dos veces." },
  { id: "planta-pie", nombre: "Estiramiento de la planta del pie, sentado", grupo: "Vuelta a la calma", tipo: "tiempo", min: 3, pauta: "Sentado, tira de los dedos del pie hacia ti. 30 segundos por pie, dos veces." },
  { id: "tobillos", nombre: "Círculos de tobillo, sentado", grupo: "Vuelta a la calma", tipo: "tiempo", min: 2, pauta: "Sentado, dibuja círculos con cada pie: 10 hacia cada lado." },
  { id: "pelota-pie", nombre: "Rodar una pelota bajo el pie", grupo: "Vuelta a la calma", tipo: "tiempo", min: 3, pauta: "Sentado, con una pelota de tenis o una botella. Un minuto y medio por pie." },
];
/* ---------- Fichas ----------
   Máquina de cada ejercicio (ap: id de APARATOS en catalogo.js; la foto va por máquina) y cómo
   se hace, con el cuidado de quien vuelve a entrenar tras una operación. Sin ap: no hace falta
   máquina. */
const FICHAS = {
  bici: { ap: "bici",
    pasos: ["Ajusta el sillín: con el pedal abajo, la rodilla queda casi estirada.", "Empieza sin resistencia y súbela poco a poco hasta un nivel cómodo.", "Pedalea a ritmo constante: tienes que poder hablar sin ahogarte."],
    errores: ["Sillín demasiado bajo: carga las rodillas.", "Subir la resistencia en los primeros minutos."] },
  cinta: { ap: "cinta",
    pasos: ["Súbete con la cinta parada y agárrate a las barras de los lados.", "Si tiene pinza de seguridad, engánchala a la ropa.", "Arranca muy lenta (2–3 km/h) y ve subiendo hasta un paso cómodo.", "Para bajar, ve frenando hasta que pare del todo antes de soltarte."],
    errores: ["Bajarse con la cinta en marcha.", "Poner inclinación los primeros días."] },
  eliptica: { ap: "eliptica",
    pasos: ["Sube agarrado a las asas fijas, con los pies enteros sobre los pedales.", "Empieza con resistencia baja y movimiento lento.", "Espalda recta y mirada al frente."],
    errores: ["Apoyarse solo en las puntas de los pies.", "Ir tan rápido que cueste hablar."] },
  bicirec: { ap: "bici-reclinada",
    pasos: ["Mueve el asiento hasta que, con el pedal más lejos, la rodilla quede casi estirada.", "Espalda apoyada en el respaldo y manos en los agarres.", "Pedaleo suave y continuo."],
    errores: ["Asiento muy cerca: las rodillas van demasiado dobladas.", "Resistencia alta desde el principio."] },
  prensa: { ap: "prensa-horizontal",
    pasos: ["Siéntate con la espalda y la cadera bien apoyadas en el respaldo.", "Pies en la plataforma a la anchura de la cadera, rodillas en línea con los pies.", "Empuja con todo el pie soltando el aire, sin llegar a bloquear las rodillas.", "Vuelve despacio, sin bajar tanto que se despegue la zona lumbar."],
    errores: ["Bloquear las rodillas al estirar.", "Rodillas que se van hacia dentro.", "Aguantar la respiración."] },
  extension: { ap: "maq-extension",
    pasos: ["Ajusta el respaldo para que la rodilla quede a la altura del eje de la máquina.", "El rodillo, apoyado justo encima del tobillo.", "Estira las piernas en 2 segundos y baja en 3."],
    errores: ["Dar golpes arriba o dejar caer el peso.", "Subir el peso si molesta la rodilla."] },
  femoral: { ap: "maq-femoral-sentado",
    pasos: ["Rodilla alineada con el eje de la máquina y el rodillo encima del tobillo.", "Baja la sujeción hasta que quede firme sobre los muslos.", "Dobla las rodillas llevando los talones hacia abajo y atrás; vuelve despacio."],
    errores: ["Tirones al empezar.", "Dejar que el peso vuelva de golpe."] },
  abductor: { ap: "maq-abd-add",
    pasos: ["Pon los apoyos por fuera de las rodillas (posición de abrir).", "Espalda pegada al respaldo y manos en los agarres.", "Abre las piernas despacio hasta donde sea cómodo y vuelve sin rebote."],
    errores: ["Abrir más de lo cómodo.", "Separar la espalda del respaldo."] },
  aductor: { ap: "maq-abd-add",
    pasos: ["Pon los apoyos por dentro de las rodillas (posición de cerrar), abiertos solo lo que sea cómodo.", "Espalda pegada al respaldo.", "Cierra las piernas despacio y vuelve controlando."],
    errores: ["Empezar con las piernas muy abiertas.", "Rebotar al volver."] },
  silla: {
    pasos: ["Silla o banco firme. Siéntate en el borde, pies apoyados a la anchura de la cadera.", "Échate un poco hacia delante y levántate empujando con las piernas.", "Siéntate despacio, sin dejarte caer.", "Si hace falta, ayúdate con las manos en los muslos o en los reposabrazos."],
    errores: ["Dejarse caer al sentarse.", "Usar una silla con ruedas o que se mueva."] },
  talones: {
    pasos: ["De pie, agarrado a una barra o al respaldo de una silla firme.", "Sube despacio sobre las puntas de los pies.", "Aguanta un segundo arriba y baja despacio."],
    errores: ["Soltarse del apoyo.", "Subir y bajar con rebote."] },
  remo: { ap: "maq-remo",
    pasos: ["Ajusta el asiento para que las asas queden a la altura del pecho.", "Pecho apoyado en el cojín, espalda recta.", "Tira llevando los codos hacia atrás y junta los omóplatos.", "Vuelve despacio estirando los brazos."],
    errores: ["Tirar a tirones o balanceando el cuerpo.", "Subir los hombros hacia las orejas."] },
  jalon: { ap: "polea-alta",
    pasos: ["Ajusta el rodillo para que sujete los muslos.", "Agarra la barra algo más abierta que los hombros, espalda recta.", "Tira hacia la parte alta del pecho soltando el aire.", "Sube la barra despacio hasta estirar los brazos."],
    errores: ["Tirar por detrás de la nuca.", "Echarse hacia atrás para ayudarse con el cuerpo."] },
  pecho: { ap: "maq-press-pecho",
    pasos: ["Ajusta el asiento para que las asas queden a la altura del centro del pecho.", "Espalda apoyada y pies en el suelo.", "Empuja soltando el aire, sin bloquear los codos.", "Vuelve despacio hasta notar un estiramiento suave."],
    errores: ["Aguantar la respiración.", "Despegar la espalda del respaldo."] },
  biceps: { ap: "maq-curl",
    pasos: ["Ajusta el asiento para que las axilas queden en el borde del cojín.", "Agarra las asas con las palmas hacia arriba.", "Sube doblando los codos y baja despacio hasta casi estirar."],
    errores: ["Levantar los codos del cojín.", "Bajar de golpe."] },
  triceps: { ap: "polea-doble",
    pasos: ["Polea arriba, con la barra corta o la cuerda.", "De pie y cerca de la polea, codos pegados al cuerpo.", "Estira los brazos hacia abajo y vuelve despacio sin despegar los codos."],
    errores: ["Separar los codos del cuerpo.", "Inclinarse para empujar con el cuerpo."] },
  hombro: { ap: "maq-press-hombro",
    pasos: ["Ajusta el asiento para que las asas queden a la altura de los hombros.", "Espalda bien apoyada.", "Empuja hacia arriba soltando el aire, sin bloquear los codos, y baja despacio."],
    errores: ["Arquear la espalda.", "Seguir si molesta el hombro."] },
  equilibrio: {
    pasos: ["De pie junto a una barra, una pared o un respaldo, con la mano apoyada o muy cerca.", "Levanta un pie del suelo y aguanta unos 20 segundos.", "Cambia de pierna. Cuando sea fácil, apóyate solo con un dedo."],
    errores: ["Hacerlo lejos de un apoyo.", "Bloquear la rodilla de la pierna de apoyo."] },
  puente: { ap: "suelo",
    pasos: ["Para bajar a la colchoneta y para levantarte, hazlo de lado y con calma.", "Boca arriba, rodillas dobladas y pies apoyados.", "Aprieta el glúteo y sube la cadera hasta formar una línea recta.", "Aguanta un segundo y baja despacio."],
    errores: ["Arquear la zona lumbar al subir.", "Subir a tirones."] },
  marcha: {
    pasos: ["De pie, junto a un apoyo.", "Levanta una rodilla a una altura cómoda y bájala; luego la otra.", "Mueve los brazos a la vez, a ritmo tranquilo."],
    errores: ["Subir las rodillas más de lo cómodo.", "Echarse hacia atrás."] },
  estiramientos: { ap: "suelo",
    pasos: ["Piernas, espalda y hombros, de pie o sentado.", "Mantén cada postura 20–30 segundos respirando con calma.", "Tiene que notarse una tensión suave, nunca dolor."],
    errores: ["Rebotar.", "Forzar la zona de la operación."] },
  "gemelo-pared": {
    pasos: ["De pie frente a una pared, con las dos manos apoyadas a la altura del pecho.", "Lleva una pierna atrás con el talón pegado al suelo y la rodilla estirada.", "Inclínate un poco hacia la pared hasta notar tirar la pantorrilla. Aguanta 30 segundos respirando con calma.", "Cambia de pierna. Dos veces cada una."],
    errores: ["Levantar el talón de atrás.", "Hacerlo sin apoyo o con rebotes."] },
  "planta-pie": {
    pasos: ["Sentado en una silla o banco firme.", "Cruza una pierna y apoya el tobillo sobre la otra rodilla (o estira la pierna delante si cuesta).", "Con la mano, tira de los dedos del pie hacia ti hasta notar estirar la planta. Aguanta 30 segundos.", "Cambia de pie. Dos veces cada uno."],
    errores: ["Tirar hasta que duela.", "Encorvar la espalda: mejor estirar la pierna y llegar menos."] },
  tobillos: {
    pasos: ["Sentado, con un pie apoyado y el otro levantado un poco del suelo.", "Dibuja círculos lentos con la punta del pie: 10 hacia un lado y 10 hacia el otro.", "Después, sube y baja la punta 10 veces. Cambia de pie."],
    errores: ["Hacerlo deprisa.", "Mover toda la pierna en vez del tobillo."] },
  "pelota-pie": {
    pasos: ["Sentado, descalzo o con calcetín, con una pelota de tenis (o una botella) bajo un pie.", "Hazla rodar despacio desde los dedos hasta el talón, apretando lo que sea agradable.", "Un minuto y medio por pie."],
    errores: ["Apretar hasta que duela.", "Hacerlo de pie si cuesta mantener el equilibrio."] },
};
for (const e of CATALOGO) Object.assign(e, FICHAS[e.id]);
const POR_ID = Object.fromEntries(CATALOGO.map(e => [e.id, e]));
// Músculos de cada ejercicio, para el icono (el primero es el principal).
const MUSCULOS_EJ = {
  bici: ["cardio"], cinta: ["cardio"], eliptica: ["cardio"], bicirec: ["cardio"], marcha: ["cardio"],
  prensa: ["cuadriceps", "gluteo"], extension: ["cuadriceps"], femoral: ["isquios"], abductor: ["gluteo-medio"], aductor: ["aductores"],
  silla: ["cuadriceps", "gluteo"], talones: ["gemelo"], remo: ["espalda", "dorsal"], jalon: ["dorsal", "biceps"], pecho: ["pecho", "triceps"],
  biceps: ["biceps"], triceps: ["triceps"], hombro: ["hombro"], equilibrio: ["cuerpo"], puente: ["gluteo", "isquios"], estiramientos: ["cuerpo"],
  "gemelo-pared": ["gemelo"], "planta-pie": ["gemelo"], tobillos: ["gemelo"], "pelota-pie": ["gemelo"],
};
// Estructura de una sesión de gimnasio: cuántos ejercicios de cada grupo.
const ESTRUCTURA = [["Calentamiento", 1], ["Piernas", 2], ["Espalda y brazos", 2], ["Equilibrio", 1], ["Vuelta a la calma", 1]];
// Plan por defecto según el día de la semana (0 = domingo): lunes, miércoles y viernes tiene
// diálisis (sin entreno); martes, jueves y sábado, gimnasio; domingo, paseo. El paseo sale todos
// los días.
const PLAN_SEMANA = ["paseo", "dialisis", "gym", "dialisis", "gym", "dialisis", "gym"];
const TIPOS = { gym: "Gimnasio", paseo: "Paseo", dialisis: "Diálisis", descanso: "Descanso" };
// Días sin entreno: cuentan como cumplidos y no entran en la cuenta de estrellas de la semana.
const SIN_ENTRENO = ["descanso", "dialisis"];
// Los ejercicios que se pueden proponer (los retirados quedan solo para el historial).
const vigentes = () => CATALOGO.filter(e => !e.retirado);

/* ---------- Historial y progresión ---------- */
// Últimos registros hechos de un ejercicio, del más reciente al más antiguo (sin contar el día indicado).
function historialEj(id, antesDe) {
  return Object.keys(Datos.dias).filter(k => k < antesDe).sort().reverse()
    .map(k => ({ k, e: (Datos.dias[k].ejercicios || []).find(x => x.id === id && x.hecho) }))
    .filter(x => x.e);
}
// Si las dos últimas veces le resultó "fácil", se sugiere subir un poco.
function sugerenciaSubir(id, hoy) {
  const h = historialEj(id, hoy).slice(0, 2);
  if (h.length < 2 || !h.every(x => x.e.sensacion === "facil")) return "";
  const ej = POR_ID[id];
  if (ej.tipo === "tiempo") return "Las dos últimas veces fue fácil: puedes probar con 2 minutos más.";
  if (!h[0].e.peso) return "Las dos últimas veces fue fácil: puedes probar con 2 repeticiones más.";
  return "Las dos últimas veces fue fácil: puedes probar a subir un punto de peso.";
}

function generarSesion(k, excluir = []) {
  const r = azar(k + excluir.join(""));
  const activos = vigentes().filter(e => !Datos.ajustes.desactivados.includes(e.id));
  // Evita repetir lo de la última sesión de gimnasio cuando hay alternativa.
  const ultima = Object.keys(Datos.dias).filter(x => x < k && Datos.dias[x].tipo === "gym").sort().pop();
  const recientes = new Set(ultima ? (Datos.dias[ultima].ejercicios || []).map(e => e.id) : []);
  const elegidos = [];
  for (const [grupo, n] of ESTRUCTURA) {
    let pool = activos.filter(e => e.grupo === grupo && !excluir.includes(e.id));
    const frescos = pool.filter(e => !recientes.has(e.id));
    if (frescos.length >= n) pool = frescos;
    pool = pool.map(e => [r(), e]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
    elegidos.push(...pool.slice(0, n));
  }
  return elegidos.map(e => nuevaEntrada(e, k));
}
function nuevaEntrada(e, k) {
  const prev = historialEj(e.id, k)[0]?.e;
  const base = { id: e.id, hecho: false, sensacion: "" };
  if (e.tipo === "tiempo") return { ...base, min: prev?.min ?? e.min };
  return { ...base, series: prev?.series ?? e.series, reps: prev?.reps ?? e.reps, peso: prev?.peso ?? e.peso };
}
function diaDe(k) {
  if (!Datos.dias[k]) {
    const tipo = PLAN_SEMANA[deClave(k).getDay()];
    Datos.dias[k] = { fecha: k, tipo, energia: 0, alerta: false, ejercicios: tipo === "gym" ? generarSesion(k) : [], paseo: { min: "", km: "", esfuerzo: "" }, nota: "", nuevo: true };
  }
  return Datos.dias[k];
}
// Un día "nuevo" solo se guarda cuando se toca algo, para no llenar el historial de días vacíos.
function tocar(k) { Datos.guardarDia(k); }
function diaActivo(d) {
  if (!d || d.nuevo) return false;
  return (d.ejercicios || []).some(e => e.hecho) || Number(d.paseo?.min) > 0;
}

/* ---------- Estrellas del día ----------
   Gimnasio: una por bloque de la sesión (los cinco de ESTRUCTURA), cuando están hechos todos
   sus ejercicios. Paseo: una cada 5 minutos andando, hasta cinco. Descanso y diálisis: el día
   cuenta como cumplido y no entra en la cuenta de la semana. */
const MIN_ESTRELLA = 5;
const NOMBRE_BLOQUE = { Calentamiento: "Calentar", Piernas: "Piernas", "Espalda y brazos": "Brazos", Equilibrio: "Equilibrio", "Vuelta a la calma": "Pies" };
const tipoDe = k => Datos.dias[k]?.tipo || PLAN_SEMANA[deClave(k).getDay()];
function estrellas(k) {
  const d = Datos.dias[k], tipo = tipoDe(k);
  if (SIN_ENTRENO.includes(tipo)) return null;
  if (tipo === "paseo") { const min = Number(d?.paseo?.min) || 0; return [1, 2, 3, 4, 5].map(i => ({ n: `${i * MIN_ESTRELLA} min`, ok: min >= i * MIN_ESTRELLA })); }
  const ejs = d?.ejercicios || [], todo = ejs.length > 0 && ejs.every(e => e.hecho);
  return ESTRUCTURA.map(([g]) => {
    const del = ejs.filter(e => POR_ID[e.id]?.grupo === g);
    return { n: NOMBRE_BLOQUE[g], ok: del.length ? del.every(e => e.hecho) : todo };
  });
}
const cuantas = k => (estrellas(k) || []).filter(s => s.ok).length;
// Nombre de la estrella que se acaba de ganar (comparando antes y después), o "".
const estrellaNueva = (antes, despues) => (despues || []).find((s, i) => s.ok && !antes?.[i]?.ok)?.n || "";
// Una semana de lunes a domingo: estrellas ganadas y posibles (descanso y diálisis no cuentan).
function semanaEstrellas(lunes = lunesDe(new Date())) {
  const dias = [];
  for (let i = 0; i < 7; i++) { const f = new Date(lunes); f.setDate(f.getDate() + i); const k = claveFecha(f); dias.push({ k, f, tipo: tipoDe(k), n: cuantas(k) }); }
  const activos = dias.filter(x => !SIN_ENTRENO.includes(x.tipo));
  return { dias, ganadas: activos.reduce((s, x) => s + x.n, 0), posibles: activos.length * 5 };
}
const SVG_ESTRELLA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4l2.95 6.1 6.65.8-4.9 4.6 1.25 6.6L12 17.3l-5.95 3.2 1.25-6.6-4.9-4.6 6.65-.8z"/></svg>';
const estrella = ok => `<span class="estrella ${ok ? "si" : ""}">${SVG_ESTRELLA}</span>`;
const LETRA_DIA = ["D", "L", "M", "X", "J", "V", "S"];

function htmlEstrellas(d) {
  const est = estrellas(HOY), sem = semanaEstrellas(), n = cuantas(HOY);
  const ejs = d.ejercicios || [], pendiente = d.tipo === "gym" && ejs.some(e => !e.hecho);
  let h = `<section class="card" aria-labelledby="t-estrellas">
    <div class="top"><h2 id="t-estrellas">Tus estrellas de hoy</h2>${est ? `<span class="num" style="font-size:1.5rem">${n}/5</span>` : ""}</div>`;
  h += est ? `<div class="estrellas" role="img" aria-label="${n} de 5 estrellas">${est.map(s => `<div>${estrella(s.ok)}<span>${esc(s.n)}</span></div>`).join("")}</div>`
    : `<p class="muted" style="margin:0">${d.tipo === "dialisis" ? "Hoy tienes diálisis: no hay entreno y" : "Hoy descansas:"} el día cuenta como cumplido ✓</p>`;
  if (pendiente) h += `<button class="btn grande" data-empezar>${ejs.some(e => e.hecho) ? "▶ Seguir con la sesión" : "▶ Empezar la sesión"}</button>`;
  else if (d.tipo === "gym" && n === 5) h += `<p style="margin:0"><b>¡Las cinco!</b> Sesión completa.</p>`;
  if (d.tipo === "paseo") h += `<p class="small muted" style="margin:0">Una estrella por cada ${MIN_ESTRELLA} minutos andando. Apúntalo abajo, en <b>Paseo</b>.</p>`;
  h += `<div class="semana-dias" role="img" aria-label="Esta semana: ${sem.ganadas} de ${sem.posibles} estrellas">${sem.dias.map(x => `<div class="${x.k === HOY ? "hoy" : ""}"><span>${LETRA_DIA[x.f.getDay()]}</span>${x.tipo === "dialisis" ? `<b class="dialisis" title="Diálisis">diál.</b>` : x.tipo === "descanso" ? `<b>–</b>` : `<b class="num">${x.k > HOY ? "·" : x.n}</b>`}</div>`).join("")}</div>
    <p class="small muted" style="margin:0">Esta semana: <b>${sem.ganadas} de ${sem.posibles}</b> estrellas${sem.ganadas ? "" : ". ¡A por la primera!"}</p>
  </section>`;
  return h;
}

/* ---------- Sesión paso a paso ----------
   Un ejercicio cada vez: foto de la máquina, qué hacer, las cifras ya puestas y un botón grande.
   Al marcarlo pregunta cómo ha ido y pasa al siguiente; al terminar, celebración. */
const Paso = { i: 0, fase: "hacer", nueva: "" };
function siguientePendiente(ejs, desde) {
  for (let j = 1; j <= ejs.length; j++) { const i = (desde + j) % ejs.length; if (!ejs[i].hecho) return i; }
  return -1;
}
function empezarPaso() {
  const ejs = Datos.dias[HOY].ejercicios;
  Paso.i = Math.max(0, ejs.findIndex(e => !e.hecho)); Paso.fase = "hacer"; Paso.nueva = "";
  abrirFicha("paso"); eventoDelDia("gim-paso-a-paso");
}
function irAPaso(i) {
  if (i < 0) { abrirFiesta(); return; }
  Paso.i = i; Paso.fase = "hacer"; Paso.nueva = "";
  abrirFicha("paso"); $("#hoja .hoja").scrollTop = 0;
}
function hojaPaso() {
  const ejs = Datos.dias[HOY]?.ejercicios || [], i = Paso.i, e = ejs[i], c = POR_ID[e?.id];
  if (!c) return "";
  const a = AP[c.ap], foto = a && urlFoto(c.ap), ajuste = Datos.ajustes.notasEj?.[c.id];
  let h = `<div class="hoja-cab"><div><span class="ej-grupo">${i + 1} de ${ejs.length} · ${esc(c.grupo)}</span><h2 class="paso-nombre">${esc(c.nombre)}</h2></div>${botonCerrar}</div>
    <div class="estrellas mini" role="img" aria-label="${cuantas(HOY)} de 5 estrellas">${estrellas(HOY).map(s => estrella(s.ok)).join("")}</div>`;
  if (Paso.nueva) h += `<p class="estrella-nueva">${estrella(true)} ¡Estrella de ${esc(Paso.nueva)}!</p>`;
  h += foto ? `<div class="paso-foto"><img src="${foto}" alt="${esc(a.nombre)}"></div>`
    : `<div class="paso-foto icono">${iconoMusculo(MUSCULOS_EJ[c.id] || ["cuerpo"], { clase: "musculo grande" })}</div>`;
  h += `<p class="paso-pauta">${esc(c.pauta)}</p>`;
  if (ajuste) h += `<p class="ajuste-maq">⚙ ${esc(ajuste)}</p>`;
  if (Paso.fase === "como") {
    return h + `<p class="paso-hecho">✓ ¡Hecho!</p><h3 style="margin:0;text-align:center">¿Cómo ha ido?</h3>
      <div class="paso-sens">${Object.entries(SENSACION).map(([v, t]) => `<button class="btn ${v === "bien" ? "" : "sec"}" data-pasosens="${v}">${t}</button>`).join("")}</div>`;
  }
  h += `<div class="campos paso-campos">${c.tipo === "tiempo" ? campo(i, "min", "Minutos", e.min, "1", "p")
    : campo(i, "series", "Series", e.series, "1", "p") + campo(i, "reps", "Repeticiones", e.reps, "1", "p") + campo(i, "peso", "Kilos", e.peso, "0.5", "p")}</div>
    <p class="small muted" style="margin:0">Vienen puestas las cifras de la última vez: cámbialas solo si hace falta.</p>`;
  const sube = !e.hecho ? sugerenciaSubir(c.id, HOY) : "";
  if (sube) h += `<span class="sube">${sube}</span>`;
  h += e.hecho ? `<button class="btn grande" data-pasoir="sig">Ya está hecho · Siguiente →</button>` : `<button class="btn grande verde" data-pasohecho>✓ Hecho</button>`;
  if (c.pasos?.length) h += `<details><summary><b>Cómo se hace</b></summary><ol class="pasos" style="margin-top:8px">${c.pasos.map(p => `<li>${esc(p)}</li>`).join("")}</ol></details>`;
  return h + `<div class="paso-nav"><button class="btn sec peq" data-pasoir="ant" ${i === 0 ? "disabled" : ""}>← Anterior</button><button class="btn sec peq" data-pasoir="sig">${e.hecho ? "Siguiente" : "Saltar"} →</button></div>`;
}

/* ---------- Celebración ---------- */
const FIESTA = [
  "¡Sesión completa, {n}! Cada día que entrenas, ganas fuerza.", "¡Bien hecho, {n}! Hoy has vuelto a sumar.",
  "¡Cinco estrellas, {n}! Así se recupera la fuerza.", "¡Lo has conseguido, {n}! Ahora, a descansar.",
  "¡Hecho, {n}! Paso a paso se llega lejos.", "¡Qué máquina, {n}! Otro día más al bote.",
  "¡Enhorabuena, {n}! Tu entrenador estaría orgulloso.", "¡Bravo, {n}! Hoy eres un poco más fuerte que ayer.",
];
// Mensajes de la familia: { de: "Jon", texto: "…" }. Si hay, sale uno en cada celebración.
// Van en el código, que es público: nada personal.
const ANIMOS_FAMILIA = [];
// Ejercicios de un día con más peso que la primera vez que se hicieron.
function mejorasDe(k) {
  const out = [];
  for (const e of Datos.dias[k]?.ejercicios || []) {
    const c = POR_ID[e.id];
    if (!e.hecho || c?.tipo !== "fuerza" || !(Number(e.peso) > 0)) continue;
    const primera = historialEj(e.id, k).pop()?.e;
    if (primera && Number(e.peso) > Number(primera.peso)) out.push(`${c.nombre}: ${fmt(e.peso)} kg, ${fmt(e.peso - primera.peso)} más que la primera vez`);
  }
  return out;
}
function abrirFiesta() { abrirFicha("fiesta"); confeti(); vibrar([80, 60, 80, 60, 180]); }
function hojaFiesta() {
  const d = Datos.dias[HOY], sem = semanaEstrellas(), mejoras = mejorasDe(HOY).slice(0, 2);
  const fam = ANIMOS_FAMILIA.length ? ANIMOS_FAMILIA[Math.floor(azar(HOY + "familia")() * ANIMOS_FAMILIA.length)] : null;
  const frase = d?.tipo === "paseo" ? `¡Paseo de cinco estrellas, ${nombreVisible()}! ${d.paseo.min} minutos andando.` : fraseDelDia(FIESTA, "fiesta");
  return `<div class="hoja-cab"><span></span>${botonCerrar}</div>
    <div class="fiesta">
      <div class="estrellas grandes">${(estrellas(HOY) || []).map(s => estrella(s.ok)).join("")}</div>
      <h2>${esc(frase)}</h2>
      ${fam ? `<blockquote class="familia">«${esc(fam.texto)}»<span>— ${esc(fam.de)}</span></blockquote>` : ""}
      ${mejoras.map(m => `<p class="mejora">↑ ${esc(m)}</p>`).join("")}
      <p class="muted" style="margin:0">Esta semana llevas <b>${sem.ganadas} de ${sem.posibles}</b> estrellas.</p>
    </div>
    <button class="btn grande" data-semana>Enviar mi semana a la familia</button>
    <button class="btn sec" data-cerrar>Cerrar</button>`;
}

/* ---------- Enviar mi semana ----------
   Imagen con las estrellas, el gimnasio y los paseos de la semana para mandarla por WhatsApp a la
   familia. Se prepara al abrir la hoja (así el botón de compartir funciona a la primera también
   en iPhone) y no sale del móvil hasta que se envía. */
const Semana = { url: "", file: null, estado: "" };
function rachaDias() {
  // Días seguidos (hasta hoy o ayer) con algo hecho, contando los de descanso y diálisis.
  let racha = 0; const cur = new Date();
  if (!diaActivo(Datos.dias[HOY])) cur.setDate(cur.getDate() - 1);
  while (racha < 3650) {
    const d = Datos.dias[claveFecha(cur)];
    if (diaActivo(d)) racha++;
    else if (!SIN_ENTRENO.includes(d?.tipo || PLAN_SEMANA[cur.getDay()])) break;
    cur.setDate(cur.getDate() - 1);
  }
  return racha;
}
function datosSemana() {
  const s = semanaEstrellas(); let gym = 0, min = 0, km = 0; const mejoras = {};
  for (const x of s.dias) {
    const d = Datos.dias[x.k]; if (!d || d.nuevo) continue;
    if ((d.ejercicios || []).some(e => e.hecho)) gym++;
    min += Number(d.paseo?.min) || 0; km += Number(d.paseo?.km) || 0;
    for (const m of mejorasDe(x.k)) mejoras[m.split(":")[0]] = m;
  }
  return { ...s, gym, min, km, mejora: Object.values(mejoras).pop() || "", racha: rachaDias() };
}
async function dibujarSemana() {
  const s = datosSemana(), W = 1080, H = 1350;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const g = cv.getContext("2d");
  try { await Promise.all(["800 90px Anybody", "700 40px 'Open Sans'", "400 36px 'Open Sans'"].map(f => document.fonts.load(f))); } catch (e) {}
  const TIT = "Anybody, 'Arial Black', sans-serif", TXT = "'Open Sans', Arial, sans-serif";
  const caja = (x, y, w, h, r, color) => { g.fillStyle = color; g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); g.fill(); };
  const estrellaC = (cx, cy, r, color) => { g.fillStyle = color; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; g.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a)); } g.closePath(); g.fill(); };
  const texto = (t, x, y, fuente, color, max = W - 160, alinear = "left") => {
    g.textAlign = alinear; g.fillStyle = color; let [peso, tam, ...fam] = fuente.split(" "); tam = parseInt(tam);
    do { g.font = `${peso} ${tam}px ${fam.join(" ")}`; tam -= 2; } while (g.measureText(t).width > max && tam > 16);
    g.fillText(t, x, y);
  };
  g.fillStyle = "#F2F5F6"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#254957"; g.fillRect(0, 0, W, 380);
  g.fillStyle = "#FD5000"; g.fillRect(0, 380, W, 10);
  const ini = s.dias[0].f, fin = s.dias[6].f;
  texto("CUADERNO DE FUERZA", 80, 110, `700 30px ${TXT}`, "#B8D2DB");
  texto(`La semana de ${nombreVisible()}`, 80, 230, `800 92px ${TIT}`, "#FFFFFF");
  texto(`Del ${ini.getDate()}${ini.getMonth() !== fin.getMonth() ? ` de ${MESES[ini.getMonth()]}` : ""} al ${fin.getDate()} de ${MESES[fin.getMonth()]}`, 80, 310, `400 40px ${TXT}`, "#B8D2DB");
  estrellaC(160, 525, 78, "#FD5000");
  texto(String(s.ganadas), 270, 572, `800 130px ${TIT}`, "#0C0E0D");
  g.font = `800 130px ${TIT}`; const ancho = g.measureText(String(s.ganadas)).width;
  texto(`de ${s.posibles} estrellas`, 290 + ancho, 568, `600 50px ${TXT}`, "#383838", W - 370 - ancho);
  const cw = (W - 160 - 6 * 14) / 7;
  s.dias.forEach((x, i) => {
    const x0 = 80 + i * (cw + 14), cx = x0 + cw / 2, hoy = x.k === HOY;
    caja(x0, 650, cw, 210, 22, hoy ? "#FFF1E8" : "#FFFFFF");
    texto(LETRA_DIA[x.f.getDay()], cx, 705, `700 34px ${TXT}`, hoy ? "#C24000" : "#666E70", cw, "center");
    if (SIN_ENTRENO.includes(x.tipo)) { texto("–", cx, 800, `800 60px ${TIT}`, "#B7CBD2", cw, "center"); texto(x.tipo === "dialisis" ? "diálisis" : "descanso", cx, 840, `400 20px ${TXT}`, "#666E70", cw - 8, "center"); return; }
    estrellaC(cx, 755, 26, x.n ? "#FD5000" : "#DCE3E5");
    texto(x.k > HOY ? "" : String(x.n), cx, 838, `800 56px ${TIT}`, "#0C0E0D", cw, "center");
  });
  const tiles = [[s.gym, s.gym === 1 ? "día de gimnasio" : "días de gimnasio"], [s.min, "minutos andando"], s.km ? [fmt(s.km), "km andados"] : [s.racha, s.racha === 1 ? "día de racha" : "días de racha"]];
  const tw = (W - 160 - 2 * 24) / 3;
  tiles.forEach(([v, t], i) => {
    const x0 = 80 + i * (tw + 24);
    caja(x0, 900, tw, 200, 22, "#FFFFFF");
    texto(String(v), x0 + 30, 1010, `800 88px ${TIT}`, "#C24000", tw - 60);
    texto(t, x0 + 30, 1062, `600 28px ${TXT}`, "#666E70", tw - 60);
  });
  if (s.mejora) texto(`↑ ${s.mejora}`, 80, 1175, `700 34px ${TXT}`, "#287D3C");
  else if (s.racha > 1) texto(`${s.racha} días seguidos cumpliendo el plan`, 80, 1175, `700 34px ${TXT}`, "#287D3C");
  texto(`${gimnasio() || "Gimnasio"} · Cuaderno de Fuerza`, 80, 1285, `400 28px ${TXT}`, "#666E70");
  return cv;
}
async function abrirSemana() {
  if (Semana.url) URL.revokeObjectURL(Semana.url);
  Object.assign(Semana, { url: "", file: null, estado: "Preparando la imagen…" });
  abrirFicha("semana");
  try {
    const cv = await dibujarSemana();
    const blob = await new Promise((ok, mal) => cv.toBlob(b => b ? ok(b) : mal(new Error("el navegador no la generó")), "image/png"));
    Semana.file = new File([blob], `semana-${sinAcentos(nombreVisible()).replace(/[^a-z0-9]+/g, "-")}-${HOY}.png`, { type: "image/png" });
    Semana.url = URL.createObjectURL(blob); Semana.estado = "";
  } catch (e) { Semana.estado = `No se pudo preparar la imagen: ${e.message}`; }
  if (Hoja?.tipo === "semana") refrescarHoja();
}
function hojaSemana() {
  return `<div class="hoja-cab"><div><span class="ej-grupo">Para la familia</span><h2>Mi semana</h2></div>${botonCerrar}</div>
    ${Semana.url ? `<img class="semana-img" src="${Semana.url}" alt="Resumen de la semana">` : ""}
    <p class="small" id="msgSemana" role="status" style="margin:0">${esc(Semana.estado)}</p>
    <button class="btn grande" data-enviarsemana ${Semana.file ? "" : "disabled"}>Enviar por WhatsApp…</button>
    <p class="small muted" style="margin:0">Se abre el menú de compartir del móvil: elige WhatsApp y el grupo de la familia.</p>`;
}
async function enviarSemana() {
  const f = Semana.file; if (!f) return;
  const s = semanaEstrellas(), msg = t => { Semana.estado = t; const m = $("#msgSemana"); if (m) m.textContent = t; };
  if (navigator.canShare?.({ files: [f] })) {
    try { await navigator.share({ files: [f], text: `Mi semana en el gimnasio: ${s.ganadas} de ${s.posibles} estrellas ⭐` }); msg("¡Enviada!"); evento("gim-semana-enviada"); }
    catch (e) { if (e.name !== "AbortError") msg(`No se pudo compartir: ${e.message}`); }
    return;
  }
  const a = document.createElement("a"); a.href = Semana.url; a.download = f.name;
  document.body.appendChild(a); a.click(); a.remove();
  msg("Imagen guardada en Descargas: mándala por WhatsApp desde allí."); evento("gim-semana-enviada");
}
HOJAS.paso = hojaPaso;
HOJAS.fiesta = hojaFiesta;
HOJAS.semana = hojaSemana;

/* ---------- Vista: Hoy ---------- */
const ENERGIA = [["1", "Muy flojo"], ["2", "Flojo"], ["3", "Normal"], ["4", "Bien"], ["5", "Muy bien"]];

function pintarHoy() {
  const d = diaDe(HOY);
  const nombre = `, ${esc(nombreVisible())}`;
  let h = `<div class="wrap" style="padding:0">${htmlEstrellas(d)}`;
  h += `<section class="card" aria-labelledby="t-energia">
    <h2 id="t-energia">¿Cómo te encuentras hoy${nombre}?</h2>
    <div class="escala" role="group" aria-label="Energía de hoy">${ENERGIA.map(([v, t]) => `<button class="chip" data-energia="${v}" aria-pressed="${String(d.energia) === v}"><b>${v}</b>${t}</button>`).join("")}</div>
    ${d.energia && d.energia <= 2 ? `<p class="aviso">Día flojo: haz solo lo que te apetezca, a menos peso o menos tiempo. Un paseo corto también cuenta.</p>` : ""}
    <button class="btn sec peq" data-alerta style="justify-self:start">${d.alerta ? "Ocultar señales de alarma" : "Tengo alguna molestia"}</button>
    ${d.alerta ? alarma() : ""}
  </section>`;

  h += `<section class="card" aria-labelledby="t-plan">
    <h2 id="t-plan">Hoy toca</h2>
    <div class="chips cuatro" role="group" aria-label="Tipo de día">${Object.entries(TIPOS).map(([v, t]) => `<button class="chip" data-tipo="${v}" aria-pressed="${d.tipo === v}">${t}</button>`).join("")}</div>
  </section>`;

  if (d.tipo === "gym") h += pintarGym(d);
  if (d.tipo === "dialisis") h += `<section class="card dialisis" aria-labelledby="t-dialisis"><h2 id="t-dialisis">Hoy tienes diálisis</h2><p class="muted" style="margin:0">Hoy no hay entreno: el día cuenta como cumplido. Descansa. Si al volver te encuentras con fuerzas, un paseo corto y tranquilo; si no, nada.</p></section>`;
  if (d.tipo === "descanso") h += `<section class="card"><h2>Día de descanso</h2><p class="muted">Descansar también es parte del plan: el músculo se recupera hoy. Si te apetece, un paseo tranquilo de 10–15 minutos está bien.</p></section>`;
  // El paseo sale todos los días.
  h += pintarPaseo(d);

  h += `<section class="card"><label class="campo" for="nota" style="font-size:1rem;color:var(--ink)"><b>Nota del día</b><span class="muted small">Molestias, cómo dormiste, lo que dijo el médico…</span></label>
    <textarea id="nota" rows="3" class="area">${esc(d.nota)}</textarea></section>`;
  h += avisoCopia(Object.values(Datos.dias).filter(diaActivo).length);
  h += `</div>`;
  $("#vista").innerHTML = h;
}

function alarma() {
  return `<div class="alerta" role="alert">
    <strong>Para y no sigas entrenando si notas:</strong>
    <span>dolor u opresión en el pecho, falta de aire que no se pasa al parar, mareo, palpitaciones fuertes, sudor frío, o dolor, hinchazón o enrojecimiento en la zona de la operación.</span>
    <span>Si es fuerte o no se pasa en unos minutos, llama al <b class="num" style="font-size:1.3rem">112</b>. Si es leve, coméntalo con tu médico antes de volver a entrenar.</span>
  </div>`;
}

function pintarGym(d) {
  const ejs = d.ejercicios || [];
  const hechos = ejs.filter(e => e.hecho).length;
  const pct = ejs.length ? Math.round(hechos / ejs.length * 100) : 0;
  let h = `<section class="card" aria-labelledby="t-gym">
    <div class="top"><h2 id="t-gym">Sesión de gimnasio</h2><span class="num" style="font-size:1.5rem">${hechos}/${ejs.length}</span></div>
    <div class="progreso-dia" aria-hidden="true"><i style="width:${pct}%"></i></div>
    ${hechos === ejs.length && ejs.length ? `<p class="aviso" style="background:var(--accent-soft)"><b>Sesión completa.</b> Bien hecho. Ahora, a descansar.</p>` : ""}
    <div>`;
  ejs.forEach((e, i) => {
    const c = POR_ID[e.id]; if (!c) return;
    const sube = !e.hecho ? sugerenciaSubir(e.id, HOY) : "";
    const a = AP[c.ap], ajuste = Datos.ajustes.notasEj?.[c.id];
    h += `<div class="ej ${e.hecho ? "hecho" : ""}">
      <button class="check" data-check="${i}" aria-pressed="${e.hecho}" aria-label="Marcar ${esc(c.nombre)} como hecho">${SVG_CHECK}</button>
      <div class="ej-cuerpo">
        <div class="ej-cab"><div class="ej-tit"><span class="ej-grupo">${esc(c.grupo)}</span>
        <span class="ej-nombre">${esc(c.nombre)}</span></div><button class="musculo-btn peq" data-ayuda="${c.id}" aria-label="Ficha de ${esc(c.nombre)}">${iconoMusculo(MUSCULOS_EJ[c.id] || ["cuerpo"])}</button></div>
        <span class="ej-pauta">${esc(c.pauta)}</span>
        <button class="ap-linea" data-ayuda="${c.id}">${a ? fotoAp(c.ap) : `<span class="ap-chip sin-foto"><b>?</b></span>`}<span>${a ? esc(a.nombre) : "Cómo se hace"}</span></button>
        ${ajuste ? `<p class="ajuste-maq small">⚙ ${esc(ajuste)}</p>` : ""}
        <div class="campos">${c.tipo === "tiempo"
          ? campo(i, "min", "Minutos", e.min)
          : campo(i, "series", "Series", e.series) + campo(i, "reps", "Repeticiones", e.reps) + campo(i, "peso", "Peso (kg)", e.peso, "0.5")}
        </div>
        ${sube ? `<span class="sube">${sube}</span>` : ""}
        ${e.hecho ? `<div class="sens" role="group" aria-label="¿Cómo fue?">${[["facil", "Fácil"], ["bien", "Bien"], ["duro", "Duro"]].map(([v, t]) => `<button class="chip" data-sens="${i}" data-v="${v}" aria-pressed="${e.sensacion === v}">${t}</button>`).join("")}</div>` : ""}
        ${!e.hecho ? `<button class="btn sec peq" data-cambiar="${i}" style="justify-self:start">Cambiar por otro</button>` : ""}
      </div>
    </div>`;
  });
  h += `</div><button class="btn sec" data-regenerar>Darme otra sesión distinta</button>
    <p class="muted small">Respira con normalidad durante cada repetición. Descansa 1–2 minutos entre series. Si algo duele, déjalo y márcalo como "Duro".</p>
  </section>`;
  return h;
}
function campo(i, k, etiqueta, v, paso = "1", pre = "c") {
  return `<label class="campo">${etiqueta}<input class="num" type="number" inputmode="decimal" min="0" step="${paso}" id="${pre}-${i}-${k}" data-campo="${i}" data-k="${k}" value="${esc(v)}"></label>`;
}

function pintarPaseo(d) {
  const p = d.paseo || {};
  const ultimos = Object.keys(Datos.dias).filter(k => k < HOY && Number(Datos.dias[k].paseo?.min) > 0).sort().slice(-1);
  const ref = ultimos.length ? `La última vez: <b class="num">${Datos.dias[ultimos[0]].paseo.min} min</b>${Datos.dias[ultimos[0]].paseo.km ? ` · ${Datos.dias[ultimos[0]].paseo.km} km` : ""}.` : "Empieza con lo que te resulte cómodo, por ejemplo 15–20 minutos.";
  return `<section class="card" aria-labelledby="t-paseo">
    <h2 id="t-paseo">Paseo de hoy</h2>
    <p class="muted small" style="margin:0">${d.tipo === "dialisis" ? "Opcional en día de diálisis: solo si te encuentras bien, y corto." : `${d.tipo === "gym" ? "Además del gimnasio, si te apetece. " : ""}${ref} Ve sumando poco a poco: unos 5 minutos más por semana es buen ritmo.`}</p>
    <div class="campos">
      <label class="campo">Minutos<input class="num" type="number" inputmode="decimal" min="0" id="p-min" data-paseo="min" value="${esc(p.min)}"></label>
      <label class="campo">Kilómetros<input class="num" type="number" inputmode="decimal" min="0" step="0.1" id="p-km" data-paseo="km" value="${esc(p.km)}"></label>
    </div>
    <div class="sens" role="group" aria-label="¿Cómo fue el paseo?">${[["facil", "Fácil"], ["bien", "Bien"], ["duro", "Duro"]].map(([v, t]) => `<button class="chip" data-psens="${v}" aria-pressed="${p.esfuerzo === v}">${t}</button>`).join("")}</div>
  </section>`;
}

/* ---------- Ficha de un ejercicio ---------- */
const nombreMusculos = id => (MUSCULOS_EJ[id] || ["cuerpo"]).map(x => MUSCULOS[x]?.n).filter(Boolean).join(", ");
const SENSACION = { facil: "Fácil", bien: "Bien", duro: "Duro" };
function textoEntrada(c, e) {
  if (c.tipo === "tiempo") return `${fmt(e.min)} min`;
  return `${e.series} × ${e.reps}${Number(e.peso) > 0 ? ` · ${fmt(e.peso)} kg` : ""}`;
}
function hojaFicha(id) {
  const c = POR_ID[id]; if (!c) return "";
  const a = AP[c.ap], m = MUSCULOS_EJ[id] || ["cuerpo"];
  const hoy = (Datos.dias[HOY]?.ejercicios || []).find(x => x.id === id);
  const hist = historialEj(id, "9999").slice(0, 6);
  const maquina = a && a.tipo !== "banco";
  return `<div class="hoja-cab"><div><span class="ej-grupo">${esc(c.grupo)}</span><h2>${esc(c.nombre)}</h2></div>${botonCerrar}</div>
    <div class="ficha-top">${iconoMusculo(m, { clase: "musculo grande" })}
      <div class="ficha-txt"><p style="margin:0"><b>Trabaja:</b> ${esc(nombreMusculos(id))}</p>
      <p class="small muted" style="margin:0">${hoy ? "Hoy" : "Pauta"}: ${textoEntrada(c, hoy || nuevaEntrada(c, HOY))}${c.tipo === "fuerza" ? " · descanso 1–2 min entre series" : ""}</p></div></div>
    <p class="nota">${esc(c.pauta)}</p>
    ${a ? `<div><h3>${esc(a.nombre)}</h3></div>${htmlFoto(c.ap, a.nombre)}
    <p class="small muted" style="margin:0">La foto es de la máquina: sale en todos los ejercicios que la usan.</p>` : ""}
    <label class="campo" for="notaEj"><b style="color:var(--ink)">${maquina ? "Cómo ajusto la máquina" : "Mis notas"}</b><span class="small muted">${maquina ? "Asiento, respaldo, número de máquina, lo que te dijo el entrenador…" : "Lo que te dijo el entrenador o el fisio…"} Se ve en la sesión.</span>
      <textarea id="notaEj" data-notaej="${id}" rows="2" class="area">${esc(Datos.ajustes.notasEj?.[id] || "")}</textarea></label>
    ${c.pasos?.length ? `<div><h3>Cómo se hace</h3><ol class="pasos">${c.pasos.map(p => `<li>${esc(p)}</li>`).join("")}</ol></div>` : ""}
    ${c.errores?.length ? `<div><h3>Ojo con</h3><ul class="pasos">${c.errores.map(p => `<li>${esc(p)}</li>`).join("")}</ul></div>` : ""}
    <p class="small muted" style="margin:0">Respira con normalidad. Si algo duele, déjalo y márcalo como "Duro".</p>
    <div><h3>Tu historial</h3>${hist.length ? `<div class="historial">${hist.map(({ k, e }) => `<div class="hist"><span>${fechaCorta(deClave(k))}${e.sensacion ? ` · ${SENSACION[e.sensacion]}` : ""}</span><span class="num">${esc(textoEntrada(c, e))}</span></div>`).join("")}</div>` : `<p class="muted small" style="margin:0">Aún no lo has hecho.</p>`}</div>
    <a class="enlace" href="https://www.youtube.com/results?search_query=${encodeURIComponent(c.nombre + " técnica gimnasio")}" target="_blank" rel="noopener">Ver vídeos de cómo se hace en YouTube ↗</a>`;
}
HOJAS.ayuda = hojaFicha;

/* ---------- Vista: Ejercicios ---------- */
function pintarEjercicios() {
  const grupos = [...new Set(CATALOGO.map(e => e.grupo))];
  let h = `<div class="wrap" style="padding:0"><section class="card"><h2>Ejercicios y máquinas</h2>
    <p class="small muted" style="margin:0">Toca uno para ver la foto de la máquina, cómo se hace y lo que has hecho.</p>`;
  for (const g of grupos) {
    h += `<div><p class="eyebrow" style="margin:10px 0 0">${esc(g)}</p><div class="lista">${vigentes().filter(e => e.grupo === g).map(e => {
      const a = AP[e.ap], n = historialEj(e.id, "9999").length;
      const det = [a ? a.nombre : "Sin máquina"];
      if (Fotos.url[e.ap]) det.push("tu foto"); else if (a && !FotosGym.url[e.ap]) det.push("sin foto real");
      if (Datos.ajustes.desactivados.includes(e.id)) det.push("quitado en Ajustes");
      if (n) det.push(`${n} ${n > 1 ? "veces" : "vez"}`);
      return `<button class="item" data-ayuda="${e.id}">${a ? fotoAp(e.ap, "item-foto") : iconoMusculo(MUSCULOS_EJ[e.id] || ["cuerpo"], { clase: "musculo item-ico" })}<span class="item-txt"><b>${esc(e.nombre)}</b><span class="small muted">${esc(det.join(" · "))}</span></span></button>`;
    }).join("")}</div></div>`;
  }
  $("#vista").innerHTML = h + `</section></div>`;
}

/* ---------- Vista: Ajustes ---------- */
function pintarAjustes() {
  const grupos = [...new Set(CATALOGO.map(e => e.grupo))];
  let h = `<div class="wrap" style="padding:0">
    ${htmlPerfil()}
    <section class="card"><h2>Ejercicios que puedo hacer</h2>
      <p class="muted small" style="margin:0">Quita los que el médico o el entrenador te hayan desaconsejado, o las máquinas que no tenga tu gimnasio. Las sesiones solo usarán los marcados.</p>`;
  for (const g of grupos) {
    h += `<div><p class="eyebrow" style="margin:12px 0 0">${esc(g)}</p><div class="lista-ajustes">${vigentes().filter(e => e.grupo === g).map(e => `<label><input type="checkbox" id="aj-${e.id}" data-activo="${e.id}" ${Datos.ajustes.desactivados.includes(e.id) ? "" : "checked"}><span>${esc(e.nombre)}</span></label>`).join("")}</div></div>`;
  }
  h += `</section>
    <section class="card"><h2>Semana tipo</h2><p class="muted small" style="margin:0">Lunes, miércoles y viernes: diálisis, sin entreno. Martes, jueves y sábado: gimnasio. Domingo: paseo. El paseo se puede apuntar todos los días. Cada día puedes cambiarlo arriba en <b>Hoy</b>.</p></section>
    ${Compartir.htmlAjustes()}
    ${htmlCopia()}
    <section class="card"><h2>Importante</h2><p class="muted small" style="margin:0">App personal, sin relación oficial con el gimnasio. Esta libreta te ayuda a ser constante, pero no sustituye al médico ni al entrenador. Los pesos y tiempos iniciales son orientativos: ajústalos a lo que hacías con el entrenador. Ante cualquier síntoma raro, para.</p></section>
  </div>`;
  $("#vista").innerHTML = h;
}

/* ---------- Vista: Progreso ---------- */
let maquinaSel = null;
function pintarProgreso() {
  const claves = Object.keys(Datos.dias).filter(k => diaActivo(Datos.dias[k])).sort();
  const semanas = ultimasSemanas(8).map(w => ({ ...w, minPaseo: 0, gym: 0 }));
  for (const k of claves) {
    const d = Datos.dias[k], s = semanaDe(semanas, k);
    if (!s) continue;
    s.minPaseo += Number(d.paseo?.min) || 0;
    if ((d.ejercicios || []).some(e => e.hecho)) s.gym++;
  }
  const estaSemana = semanas[semanas.length - 1];
  const racha = rachaDias();

  const fuerza = CATALOGO.filter(e => e.tipo === "fuerza" && claves.some(k => (Datos.dias[k].ejercicios || []).some(x => x.id === e.id && x.hecho && Number(x.peso) > 0)));
  const sel = fuerza.some(e => e.id === maquinaSel) ? maquinaSel : fuerza[0]?.id;

  let h = `<div class="wrap" style="padding:0">
    <div class="tiles">
      <div class="tile"><span class="eyebrow">Racha</span><span class="num">${racha}</span><span>días seguidos</span></div>
      <div class="tile"><span class="eyebrow">Gimnasio</span><span class="num">${estaSemana.gym}</span><span>sesiones esta semana</span></div>
      <div class="tile"><span class="eyebrow">Paseo</span><span class="num">${estaSemana.minPaseo}</span><span>min esta semana</span></div>
    </div>`;
  const sem = semanaEstrellas();
  h += `<section class="card"><div class="top"><h2>Estrellas por semana</h2><span class="num" style="font-size:1.4rem">${sem.ganadas}/${sem.posibles}</span></div>
    ${graficoBarras(semanas.map((w, i) => ({ etiqueta: fechaCorta(w.inicio), partes: [{ v: semanaEstrellas(w.inicio).ganadas, color: i === semanas.length - 1 ? "var(--accent)" : "var(--accent-soft)" }] })), { etiquetaAria: "Estrellas en las últimas 8 semanas" })}
    <button class="btn grande" data-semana>Enviar mi semana a la familia</button></section>`;
  if (!claves.length) {
    h += `<section class="card"><h2>Aquí verás cómo mejoras</h2><p class="muted">Cuando marques ejercicios o apuntes un paseo en la pestaña <b>Hoy</b>, aparecerán aquí los minutos andados por semana, cómo sube el peso en cada máquina y el historial de días.</p></section></div>`;
    $("#vista").innerHTML = h; return;
  }
  h += `<section class="card"><h2>Minutos andando por semana</h2>${graficoBarras(semanas.map((w, i) => ({ etiqueta: fechaCorta(w.inicio), partes: [{ v: w.minPaseo, color: i === semanas.length - 1 ? "var(--accent)" : "var(--accent-soft)" }] })), { etiquetaAria: "Minutos andando en las últimas 8 semanas" })}
    <p class="muted small" style="margin:0">Cada barra es una semana (empieza en lunes). La oscura es la actual.</p></section>`;
  h += `<section class="card"><h2>Peso en las máquinas</h2>`;
  if (fuerza.length) {
    h += `<label class="campo" for="selMaquina">Máquina<select id="selMaquina">${fuerza.map(e => `<option value="${e.id}" ${e.id === sel ? "selected" : ""}>${esc(e.nombre)}</option>`).join("")}</select></label>`;
    const pts = claves.map(k => ({ k, e: (Datos.dias[k].ejercicios || []).find(x => x.id === sel && x.hecho) })).filter(x => x.e && Number(x.e.peso) > 0).map(x => ({ k: x.k, v: Number(x.e.peso) }));
    h += graficoLinea(pts, { unidad: " kg" });
    if (pts.length >= 2) { const dif = pts[pts.length - 1].v - pts[0].v; h += `<p class="muted small" style="margin:0">Desde el ${fechaCorta(deClave(pts[0].k))}: ${dif > 0 ? `<b style="color:var(--ok)">+${fmt(dif)} kg</b>` : dif === 0 ? "mismo peso" : `${fmt(dif)} kg`}.</p>`; }
  } else h += `<p class="muted">Aún no hay máquinas con peso apuntado.</p>`;
  h += `</section>`;
  h += `<section class="card"><h2>Últimos días</h2><div class="historial">${claves.slice(-14).reverse().map(k => {
    const d = Datos.dias[k], hechos = (d.ejercicios || []).filter(e => e.hecho).length;
    const partes = [];
    if (hechos) partes.push(`${hechos} ejercicio${hechos > 1 ? "s" : ""}`);
    if (Number(d.paseo?.min) > 0) partes.push(`${d.paseo.min} min andando`);
    return `<div class="hist"><span>${fechaLarga(deClave(k))}</span><span class="muted">${partes.join(" · ")}</span></div>`;
  }).join("")}</div></section></div>`;
  $("#vista").innerHTML = h;
}

/* ---------- Frase del día ---------- */
const FRASES = [
  "{n}, la fuerza vuelve poco a poco. Hoy, un pasito más.", "Cada paseo cuenta, {n}. Las piernas se acuerdan de todo lo que haces.",
  "{n}, hoy no hace falta correr: basta con no parar.", "Constancia antes que intensidad, {n}. Eso es lo que te devuelve la fuerza.",
  "{n}, lo difícil ya lo pasaste. Ahora toca ir ganando terreno.", "Un día más de trabajo es un día más de fuerza, {n}.",
  "{n}, escucha al cuerpo: si pide calma, calma; si pide marcha, marcha.", "{n}, cada serie de hoy es una escalera más fácil mañana.",
  "Poco a poco se llega lejos, {n}. Y tú ya vas lejos.", "{n}, un buen paseo y a las máquinas: que no se oxide nada.",
  "Respira hondo, {n}. Hoy también suma.", "{n}, la mejor sesión es la que se hace, aunque sea corta.",
  "Sin prisa pero sin pausa, {n}.", "{n}, que el día empiece con energía: a por ello.",
  "El mejor momento para moverse es hoy, {n}.", "{n}, tu entrenador estaría orgulloso. Sigue con el plan.",
  "{n}, cada día que te mueves es un día que ganas.", "Hoy toca sumar, {n}. Lo que sea, pero sumar.",
  "{n}, hoy hay cinco estrellas esperándote.", "A por las estrellas de hoy, {n}. Una a una.",
];
function motivacion() {
  const n = nombreVisible(), d = Datos.dias[HOY];
  const ultimo = Object.keys(Datos.dias).filter(k => k < HOY && diaActivo(Datos.dias[k])).sort().pop();
  const sinMoverse = ultimo ? Math.round((deClave(HOY) - deClave(ultimo)) / 864e5) : 0;
  if (diaActivo(d)) return `¡Hecho por hoy, ${n}! Ahora, a descansar.`;
  if (sinMoverse >= 3 && !SIN_ENTRENO.includes(d?.tipo || PLAN_SEMANA[new Date().getDay()])) return `${n}, hace ${sinMoverse} días que no apuntas nada. Un paseo corto hoy y retomamos.`;
  const tipo = d?.tipo || PLAN_SEMANA[new Date().getDay()];
  if (tipo === "dialisis") return `${n}, hoy tienes diálisis: hoy no hay entreno. Descansa, que mañana seguimos.`;
  if (tipo === "descanso") return `${n}, hoy toca descansar: también es parte del plan.`;
  return fraseDelDia(FRASES);
}

/* ---------- Eventos ---------- */
window.App = {
  pestañas: [["hoy", "Hoy"], ["progreso", "Progreso"], ["ejercicios", "Ejercicios"], ["ajustes", "Ajustes"]],
  ajustesIniciales: { nombre: "", desactivados: [], notasEj: {} },
  // Si la sesión de hoy ya estaba preparada con un ejercicio retirado (tumbado) sin hacer, se
  // cambia por otro de su bloque.
  alCargar() {
    const d = Datos.dias[HOY];
    if (d?.tipo !== "gym") return;
    (d.ejercicios || []).forEach((e, i) => {
      if (e.hecho || !POR_ID[e.id]?.retirado) return;
      const usados = d.ejercicios.map(x => x.id);
      const otro = vigentes().find(c => c.grupo === POR_ID[e.id].grupo && !usados.includes(c.id) && !Datos.ajustes.desactivados.includes(c.id));
      if (otro) d.ejercicios[i] = nuevaEntrada(otro, HOY);
    });
  },
  vistas: { hoy: pintarHoy, progreso: pintarProgreso, ejercicios: pintarEjercicios, ajustes: pintarAjustes },
  motivacion,
  // Al cerrar el paso a paso se repinta la lista, por si se cambiaron cifras.
  alCerrarHoja() { const t = Hoja?.tipo; Hoja = null; if (t === "paso" || t === "fiesta") repintar(); },
  click(b) {
    const c = Compartir.click(b) ?? FotoFicha.click(b); if (c !== undefined) return c;
    if (b.dataset.ayuda) { abrirFicha("ayuda", b.dataset.ayuda); evento("gim-ficha-abierta"); return false; }
    if ("semana" in b.dataset) { abrirSemana(); return false; }
    if ("enviarsemana" in b.dataset) { enviarSemana(); return false; }
    const d = Datos.dias[HOY];
    /* Paso a paso */
    if ("empezar" in b.dataset) { empezarPaso(); return false; }
    if ("pasohecho" in b.dataset) {
      const antes = estrellas(HOY), e = d.ejercicios[Paso.i];
      e.hecho = true; tocar(HOY); vibrar();
      eventoDelDia("gim-entreno-empezado"); if (d.ejercicios.every(x => x.hecho)) eventoDelDia("gim-entreno-completo");
      Paso.nueva = estrellaNueva(antes, estrellas(HOY)); Paso.fase = "como";
      abrirHoja(hojaPaso()); $("#hoja .hoja").scrollTop = 0; return;
    }
    if (b.dataset.pasosens) { d.ejercicios[Paso.i].sensacion = b.dataset.pasosens; tocar(HOY); irAPaso(siguientePendiente(d.ejercicios, Paso.i)); return; }
    if (b.dataset.pasoir) {
      const ejs = d.ejercicios, i = Paso.i;
      if (b.dataset.pasoir === "ant") irAPaso(Math.max(0, i - 1));
      else irAPaso(i + 1 < ejs.length ? i + 1 : siguientePendiente(ejs, i));
      return false;
    }
    if (b.dataset.energia) { d.energia = Number(b.dataset.energia); tocar(HOY); }
    else if ("alerta" in b.dataset) { d.alerta = !d.alerta; tocar(HOY); }
    else if (b.dataset.tipo) {
      d.tipo = b.dataset.tipo;
      if (d.tipo === "gym" && !(d.ejercicios || []).length) d.ejercicios = generarSesion(HOY);
      tocar(HOY);
    }
    else if (b.dataset.check) {
      const antes = estrellas(HOY), e = d.ejercicios[Number(b.dataset.check)]; e.hecho = !e.hecho; tocar(HOY);
      if (e.hecho) {
        eventoDelDia("gim-entreno-empezado");
        if (d.ejercicios.every(x => x.hecho)) { eventoDelDia("gim-entreno-completo"); abrirFiesta(); }
        else { const n = estrellaNueva(antes, estrellas(HOY)); if (n) { aviso(`⭐ ¡Estrella de ${n}!`, "celebra"); vibrar(); } }
      }
    }
    else if (b.dataset.sens) { const e = d.ejercicios[Number(b.dataset.sens)]; e.sensacion = e.sensacion === b.dataset.v ? "" : b.dataset.v; tocar(HOY); }
    else if (b.dataset.cambiar) {
      const i = Number(b.dataset.cambiar), actual = POR_ID[d.ejercicios[i].id];
      const usados = d.ejercicios.map(e => e.id);
      const opciones = vigentes().filter(e => e.grupo === actual.grupo && !usados.includes(e.id) && !Datos.ajustes.desactivados.includes(e.id));
      if (!opciones.length) { b.textContent = "No hay otro de este grupo"; b.disabled = true; return false; }
      d.ejercicios[i] = nuevaEntrada(opciones[Math.floor(Math.random() * opciones.length)], HOY); tocar(HOY);
    }
    else if ("regenerar" in b.dataset) {
      // Conserva lo ya hecho y sustituye solo lo pendiente.
      const hechos = d.ejercicios.filter(e => e.hecho);
      const nueva = generarSesion(HOY + Math.random(), d.ejercicios.filter(e => !e.hecho).map(e => e.id));
      d.ejercicios = [...hechos, ...nueva.filter(n => !hechos.some(h => h.id === n.id)).slice(0, d.ejercicios.length - hechos.length)];
      tocar(HOY);
    }
    else if (b.dataset.psens) { d.paseo = d.paseo || {}; d.paseo.esfuerzo = d.paseo.esfuerzo === b.dataset.psens ? "" : b.dataset.psens; tocar(HOY); }
    else return false;
  },
  cambio(t) {
    if (Compartir.cambio(t) || FotoFicha.cambio(t)) return;
    const d = Datos.dias[HOY];
    if (t.dataset.notaej) { Datos.ajustes.notasEj = { ...Datos.ajustes.notasEj, [t.dataset.notaej]: t.value.trim() }; Datos.guardarAjustes(); repintar(); }
    else if (t.dataset.campo) { d.ejercicios[Number(t.dataset.campo)][t.dataset.k] = t.value === "" ? "" : Number(t.value); tocar(HOY); }
    else if (t.dataset.paseo) {
      const antes = cuantas(HOY);
      d.paseo = d.paseo || {}; d.paseo[t.dataset.paseo] = t.value === "" ? "" : Number(t.value); tocar(HOY);
      if (t.dataset.paseo === "min" && Number(t.value) > 0) eventoDelDia("gim-entreno-empezado");
      const ahora = cuantas(HOY);
      if (ahora > antes) { if (ahora === 5) abrirFiesta(); else { aviso(`⭐ ${ahora} de 5 estrellas: ${t.value} minutos andando`, "celebra"); vibrar(); } }
      // Después del cambio, no durante: el campo aún tiene el foco.
      setTimeout(repintar, 0);
    }
    else if (t.id === "nota") { d.nota = t.value; tocar(HOY); }
    else if (t.id === "nombre") { Datos.ajustes.nombre = t.value.trim(); Datos.guardarAjustes(); pintar(); }
    else if (t.dataset.activo) {
      const id = t.dataset.activo, set = new Set(Datos.ajustes.desactivados);
      t.checked ? set.delete(id) : set.add(id);
      Datos.ajustes.desactivados = [...set]; Datos.guardarAjustes();
      // Si hoy aún no se ha empezado el gimnasio, rehace la sesión con la nueva lista.
      const hoy = Datos.dias[HOY];
      if (hoy && hoy.tipo === "gym" && !hoy.ejercicios.some(e => e.hecho)) hoy.ejercicios = generarSesion(HOY);
    }
    else if (t.id === "selMaquina") { maquinaSel = t.value; repintar(); }
  },
};
