"use strict";
/* Motor "recuperación": sesión de gimnasio variada cada día con máquinas guiadas, paseos
   y señales de alarma. Pensado para volver a coger fuerza poco a poco tras una operación. */

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
  { id: "puente", nombre: "Puente de glúteo en colchoneta", grupo: "Equilibrio", tipo: "fuerza", series: 2, reps: 10, peso: 0, pauta: "Sube la cadera despacio. Peso = 0." },
  { id: "marcha", nombre: "Marcha en el sitio levantando rodillas", grupo: "Equilibrio", tipo: "tiempo", min: 2, pauta: "Con apoyo cerca. Rodillas a altura cómoda." },
  // Vuelta a la calma
  { id: "estiramientos", nombre: "Estiramientos suaves", grupo: "Vuelta a la calma", tipo: "tiempo", min: 5, pauta: "Piernas, espalda y hombros. Sin rebotes, sin dolor." },
];
const POR_ID = Object.fromEntries(CATALOGO.map(e => [e.id, e]));
// Músculos de cada ejercicio, para el icono (el primero es el principal).
const MUSCULOS_EJ = {
  bici: ["cardio"], cinta: ["cardio"], eliptica: ["cardio"], bicirec: ["cardio"], marcha: ["cardio"],
  prensa: ["cuadriceps", "gluteo"], extension: ["cuadriceps"], femoral: ["isquios"], abductor: ["gluteo-medio"], aductor: ["aductores"],
  silla: ["cuadriceps", "gluteo"], talones: ["gemelo"], remo: ["espalda", "dorsal"], jalon: ["dorsal", "biceps"], pecho: ["pecho", "triceps"],
  biceps: ["biceps"], triceps: ["triceps"], hombro: ["hombro"], equilibrio: ["cuerpo"], puente: ["gluteo", "isquios"], estiramientos: ["cuerpo"],
};
// Estructura de una sesión de gimnasio: cuántos ejercicios de cada grupo.
const ESTRUCTURA = [["Calentamiento", 1], ["Piernas", 2], ["Espalda y brazos", 2], ["Equilibrio", 1], ["Vuelta a la calma", 1]];
// Plan por defecto según el día de la semana (0 = domingo).
const PLAN_SEMANA = ["descanso", "gym", "paseo", "gym", "paseo", "gym", "paseo"];
const TIPOS = { gym: "Gimnasio", paseo: "Paseo", descanso: "Descanso" };

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
  const activos = CATALOGO.filter(e => !Datos.ajustes.desactivados.includes(e.id));
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

/* ---------- Vista: Hoy ---------- */
const ENERGIA = [["1", "Muy flojo"], ["2", "Flojo"], ["3", "Normal"], ["4", "Bien"], ["5", "Muy bien"]];

function pintarHoy() {
  const d = diaDe(HOY);
  const nombre = `, ${esc(nombreVisible())}`;
  let h = `<div class="wrap" style="padding:0">`;
  h += `<section class="card" aria-labelledby="t-energia">
    <h2 id="t-energia">¿Cómo te encuentras hoy${nombre}?</h2>
    <div class="escala" role="group" aria-label="Energía de hoy">${ENERGIA.map(([v, t]) => `<button class="chip" data-energia="${v}" aria-pressed="${String(d.energia) === v}"><b>${v}</b>${t}</button>`).join("")}</div>
    ${d.energia && d.energia <= 2 ? `<p class="aviso">Día flojo: haz solo lo que te apetezca, a menos peso o menos tiempo. Un paseo corto también cuenta.</p>` : ""}
    <button class="btn sec peq" data-alerta style="justify-self:start">${d.alerta ? "Ocultar señales de alarma" : "Tengo alguna molestia"}</button>
    ${d.alerta ? alarma() : ""}
  </section>`;

  h += `<section class="card" aria-labelledby="t-plan">
    <h2 id="t-plan">Hoy toca</h2>
    <div class="chips" role="group" aria-label="Tipo de día">${Object.entries(TIPOS).map(([v, t]) => `<button class="chip" data-tipo="${v}" aria-pressed="${d.tipo === v}">${t}</button>`).join("")}</div>
  </section>`;

  if (d.tipo === "gym") h += pintarGym(d);
  if (d.tipo === "paseo") h += pintarPaseo(d);
  if (d.tipo === "descanso") h += `<section class="card"><h2>Día de descanso</h2><p class="muted">Descansar también es parte del plan: el músculo se recupera hoy. Si te apetece, un paseo tranquilo de 10–15 minutos está bien.</p></section>`;
  if (d.tipo !== "paseo" && Number(d.paseo?.min) > 0) h += pintarPaseo(d);

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
    ${hechos === ejs.length && ejs.length ? `<p class="aviso" style="background:var(--accent-soft)"><b>Sesión completa.</b> Bien hecho. Bebe agua y descansa.</p>` : ""}
    <div>`;
  ejs.forEach((e, i) => {
    const c = POR_ID[e.id]; if (!c) return;
    const sube = !e.hecho ? sugerenciaSubir(e.id, HOY) : "";
    h += `<div class="ej ${e.hecho ? "hecho" : ""}">
      <button class="check" data-check="${i}" aria-pressed="${e.hecho}" aria-label="Marcar ${esc(c.nombre)} como hecho">${SVG_CHECK}</button>
      <div class="ej-cuerpo">
        <div class="ej-cab"><div class="ej-tit"><span class="ej-grupo">${esc(c.grupo)}</span>
        <span class="ej-nombre">${esc(c.nombre)}</span></div>${iconoMusculo(MUSCULOS_EJ[c.id] || ["cuerpo"])}</div>
        <span class="ej-pauta">${esc(c.pauta)}</span>
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
function campo(i, k, etiqueta, v, paso = "1") {
  return `<label class="campo">${etiqueta}<input class="num" type="number" inputmode="decimal" min="0" step="${paso}" id="c-${i}-${k}" data-campo="${i}" data-k="${k}" value="${esc(v)}"></label>`;
}

function pintarPaseo(d) {
  const p = d.paseo || {};
  const ultimos = Object.keys(Datos.dias).filter(k => k < HOY && Number(Datos.dias[k].paseo?.min) > 0).sort().slice(-1);
  const ref = ultimos.length ? `La última vez: <b class="num">${Datos.dias[ultimos[0]].paseo.min} min</b>${Datos.dias[ultimos[0]].paseo.km ? ` · ${Datos.dias[ultimos[0]].paseo.km} km` : ""}.` : "Empieza con lo que te resulte cómodo, por ejemplo 15–20 minutos.";
  return `<section class="card" aria-labelledby="t-paseo">
    <h2 id="t-paseo">Paseo</h2>
    <p class="muted small" style="margin:0">${ref} Ve sumando poco a poco: unos 5 minutos más por semana es buen ritmo.</p>
    <div class="campos">
      <label class="campo">Minutos<input class="num" type="number" inputmode="decimal" min="0" id="p-min" data-paseo="min" value="${esc(p.min)}"></label>
      <label class="campo">Kilómetros<input class="num" type="number" inputmode="decimal" min="0" step="0.1" id="p-km" data-paseo="km" value="${esc(p.km)}"></label>
    </div>
    <div class="sens" role="group" aria-label="¿Cómo fue el paseo?">${[["facil", "Fácil"], ["bien", "Bien"], ["duro", "Duro"]].map(([v, t]) => `<button class="chip" data-psens="${v}" aria-pressed="${p.esfuerzo === v}">${t}</button>`).join("")}</div>
  </section>`;
}


/* ---------- Vista: Ajustes ---------- */
function pintarAjustes() {
  const grupos = [...new Set(CATALOGO.map(e => e.grupo))];
  let h = `<div class="wrap" style="padding:0">
    ${htmlPerfil()}
    <section class="card"><h2>Ejercicios que puedo hacer</h2>
      <p class="muted small" style="margin:0">Quita los que el médico o el entrenador te hayan desaconsejado, o las máquinas que no tenga tu gimnasio. Las sesiones solo usarán los marcados.</p>`;
  for (const g of grupos) {
    h += `<div><p class="eyebrow" style="margin:12px 0 0">${esc(g)}</p><div class="lista-ajustes">${CATALOGO.filter(e => e.grupo === g).map(e => `<label><input type="checkbox" id="aj-${e.id}" data-activo="${e.id}" ${Datos.ajustes.desactivados.includes(e.id) ? "" : "checked"}><span>${esc(e.nombre)}</span></label>`).join("")}</div></div>`;
  }
  h += `</section>
    <section class="card"><h2>Semana tipo</h2><p class="muted small" style="margin:0">Lunes, miércoles y viernes: gimnasio. Martes, jueves y sábado: paseo. Domingo: descanso. Cada día puedes cambiarlo arriba en <b>Hoy</b>.</p></section>
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
  // Racha: días seguidos (hasta hoy o ayer) con algo hecho, contando los días de descanso planificados.
  let racha = 0; const cur = new Date();
  if (!diaActivo(Datos.dias[HOY])) cur.setDate(cur.getDate() - 1);
  while (racha < 3650) {
    const d = Datos.dias[claveFecha(cur)];
    if (diaActivo(d)) racha++;
    else if (!(d?.tipo === "descanso" || (!d && PLAN_SEMANA[cur.getDay()] === "descanso"))) break;
    cur.setDate(cur.getDate() - 1);
  }

  const fuerza = CATALOGO.filter(e => e.tipo === "fuerza" && claves.some(k => (Datos.dias[k].ejercicios || []).some(x => x.id === e.id && x.hecho && Number(x.peso) > 0)));
  const sel = fuerza.some(e => e.id === maquinaSel) ? maquinaSel : fuerza[0]?.id;

  let h = `<div class="wrap" style="padding:0">
    <div class="tiles">
      <div class="tile"><span class="eyebrow">Racha</span><span class="num">${racha}</span><span>días seguidos</span></div>
      <div class="tile"><span class="eyebrow">Gimnasio</span><span class="num">${estaSemana.gym}</span><span>sesiones esta semana</span></div>
      <div class="tile"><span class="eyebrow">Paseo</span><span class="num">${estaSemana.minPaseo}</span><span>min esta semana</span></div>
    </div>`;
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
  "Sin prisa pero sin pausa, {n}.", "{n}, que el día empiece con energía: un vaso de agua y a por ello.",
  "El mejor momento para moverse es hoy, {n}.", "{n}, tu entrenador estaría orgulloso. Sigue con el plan.",
  "{n}, cada día que te mueves es un día que ganas.", "Hoy toca sumar, {n}. Lo que sea, pero sumar.",
];
function motivacion() {
  const n = nombreVisible(), d = Datos.dias[HOY];
  const ultimo = Object.keys(Datos.dias).filter(k => k < HOY && diaActivo(Datos.dias[k])).sort().pop();
  const sinMoverse = ultimo ? Math.round((deClave(HOY) - deClave(ultimo)) / 864e5) : 0;
  if (diaActivo(d)) return `¡Hecho por hoy, ${n}! Ahora a descansar y a beber agua.`;
  if (sinMoverse >= 3) return `${n}, hace ${sinMoverse} días que no apuntas nada. Un paseo corto hoy y retomamos.`;
  if ((d?.tipo || PLAN_SEMANA[new Date().getDay()]) === "descanso") return `${n}, hoy toca descansar: también es parte del plan.`;
  return fraseDelDia(FRASES);
}

/* ---------- Eventos ---------- */
window.App = {
  ajustesIniciales: { nombre: "", desactivados: [] },
  vistas: { hoy: pintarHoy, progreso: pintarProgreso, ajustes: pintarAjustes },
  motivacion,
  click(b) {
    const d = Datos.dias[HOY];
    if (b.dataset.energia) { d.energia = Number(b.dataset.energia); tocar(HOY); }
    else if ("alerta" in b.dataset) { d.alerta = !d.alerta; tocar(HOY); }
    else if (b.dataset.tipo) {
      d.tipo = b.dataset.tipo;
      if (d.tipo === "gym" && !(d.ejercicios || []).length) d.ejercicios = generarSesion(HOY);
      tocar(HOY);
    }
    else if (b.dataset.check) {
      const e = d.ejercicios[Number(b.dataset.check)]; e.hecho = !e.hecho; tocar(HOY);
      if (e.hecho) { eventoDelDia("gim-entreno-empezado"); if (d.ejercicios.every(x => x.hecho)) eventoDelDia("gim-entreno-completo"); }
    }
    else if (b.dataset.sens) { const e = d.ejercicios[Number(b.dataset.sens)]; e.sensacion = e.sensacion === b.dataset.v ? "" : b.dataset.v; tocar(HOY); }
    else if (b.dataset.cambiar) {
      const i = Number(b.dataset.cambiar), actual = POR_ID[d.ejercicios[i].id];
      const usados = d.ejercicios.map(e => e.id);
      const opciones = CATALOGO.filter(e => e.grupo === actual.grupo && !usados.includes(e.id) && !Datos.ajustes.desactivados.includes(e.id));
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
    const d = Datos.dias[HOY];
    if (t.dataset.campo) { d.ejercicios[Number(t.dataset.campo)][t.dataset.k] = t.value === "" ? "" : Number(t.value); tocar(HOY); }
    else if (t.dataset.paseo) {
      d.paseo = d.paseo || {}; d.paseo[t.dataset.paseo] = t.value === "" ? "" : Number(t.value); tocar(HOY);
      if (t.dataset.paseo === "min" && Number(t.value) > 0) eventoDelDia("gim-entreno-empezado");
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
