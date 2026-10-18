"use strict";
/* Motor "rutina": un plan fijo de varios días (window.PLAN) que rotan en orden, se haga
   cuando se haga. Apunta cada serie, propone subir peso con doble progresión, lleva el
   descanso y la duración de la sesión, el deporte aparte del gimnasio y, si el plan lo
   pide, las molestias de rodilla. */

const P = window.PLAN;
const EJ = {};
P.dias.forEach(d => d.ejercicios.forEach(e => { EJ[e.id] = { ...e, dia: d.id }; }));
const DIA = Object.fromEntries(P.dias.map(d => [d.id, d]));
const DEPORTES = ["Pádel", "Correr", "Bici", "Natación", "Fútbol", "Caminar", "Montaña", "Otro"];

/* ---------- Plan ---------- */
const variantes = e => (e.variantes || [""]).map(v => typeof v === "string" ? { n: v } : v);
const variante = (e, v) => variantes(e)[v] || variantes(e)[0];
// Con nombrePorVariante la variante ya es el nombre completo ("Zancada estática corta").
const nombreCompleto = (e, v) => variantes(e).length < 2 ? e.nombre : e.nombrePorVariante ? variante(e, v).n : `${e.nombre} · ${variante(e, v).n}`;
const uRep = e => e.unidad === "s" ? "s" : "rep";
function pauta(e) {
  const s = e.seriesOpcionales ? `${e.series - e.seriesOpcionales}–${e.series}` : e.series;
  const r = e.reps[0] === e.reps[1] ? e.reps[0] : `${e.reps[0]}–${e.reps[1]}`;
  return `${s} × ${r}${e.unidad === "s" ? " s" : ""}${e.porLado ? " por lado" : ""}`;
}
const descansoDe = e => Number(Datos.ajustes.descansos?.[e.tipo]) || P.descansos[e.tipo] || 60;
const obligatorias = e => e.series - (e.seriesOpcionales || 0);

/* ---------- Días ---------- */
const hizoGym = d => !!d && !d.nuevo && Object.values(d.ej || {}).some(x => x.series.some(s => s.hecho));
const minDeporte = d => (d?.deporte || []).reduce((s, x) => s + (Number(x.min) || 0), 0);
const diaActivo = d => !!d && !d.nuevo && (hizoGym(d) || minDeporte(d) > 0);
// El día que toca es el siguiente al último que se entrenó, no depende del día de la semana.
function siguienteDia(k) {
  const prev = Object.keys(Datos.dias).filter(x => x < k && hizoGym(Datos.dias[x]) && DIA[Datos.dias[x].diaPlan]).sort().pop();
  if (!prev) return P.dias[0].id;
  const i = P.dias.findIndex(d => d.id === Datos.dias[prev].diaPlan);
  return P.dias[(i + 1) % P.dias.length].id;
}
function diaDe(k) {
  if (!Datos.dias[k]) Datos.dias[k] = { fecha: k, ej: {}, calent: [], deporte: [], rodilla: null, nota: "", nuevo: true };
  const d = Datos.dias[k];
  if (d.nuevo) d.diaPlan = siguienteDia(k);
  return d;
}
const tocar = k => Datos.guardarDia(k);
function actividad(d) { const t = Date.now(); if (!d.inicio) d.inicio = t; d.ultima = t; }

/* ---------- Historial de un ejercicio ---------- */
function ultimaVez(id, v, antes) {
  for (const k of Object.keys(Datos.dias).filter(k => k < antes).sort().reverse()) {
    const x = Datos.dias[k].ej?.[id];
    if (x && x.v === v && x.series.some(s => s.hecho)) return { k, x };
  }
  return null;
}
function entrada(d, e) {
  if (!d.ej[e.id]) {
    // Repite la variante de la última vez que se hizo este ejercicio.
    const prev = Object.keys(Datos.dias).filter(k => k < d.fecha && Datos.dias[k].ej?.[e.id]?.series.some(s => s.hecho)).sort().pop();
    d.ej[e.id] = { v: prev ? Datos.dias[prev].ej[e.id].v : 0, series: [], rodilla: false };
  }
  const x = d.ej[e.id];
  while (x.series.length < e.series) x.series.push({ peso: "", reps: "", hecho: false });
  return x;
}
// Lo que se sugiere en cada casilla vacía: lo de la última vez, o el máximo del rango.
function sugerido(e, x, i, k) {
  const u = ultimaVez(e.id, x.v, k);
  const hechas = u ? u.x.series.filter(s => s.hecho) : [];
  const ref = u?.x.series[i]?.hecho ? u.x.series[i] : hechas[hechas.length - 1];
  return { peso: ref?.peso ?? "", reps: ref?.reps || e.reps[1] };
}
// Doble progresión: cuando todas las series obligatorias llegan al máximo del rango, se sube peso.
function consejo(e, x, k) {
  const u = ultimaVez(e.id, x.v, k);
  if (!u) return null;
  const va = variante(e, x.v), inc = Number(Datos.ajustes.incremento) || 2.5;
  const hechas = u.x.series.filter(s => s.hecho);
  const reps = hechas.map(s => num(s.reps) ?? 0);
  const pesos = hechas.map(s => num(s.peso)).filter(p => p != null);
  const lado = e.porLado ? " por lado" : "";
  const alTope = hechas.length >= obligatorias(e) && reps.slice(0, obligatorias(e)).every(r => r >= e.reps[1]);
  if (alTope) {
    if (e.unidad === "s") return { tipo: "sube", texto: `La última vez llegaste a ${e.reps[1]} s en todas. Prueba ${e.reps[1] + 15} s o una versión más difícil.` };
    if (e.sinPeso || !pesos.length) return { tipo: "sube", texto: `La última vez completaste ${e.reps[1]}${lado} en todas. Toca añadir algo de peso.` };
    if (va.asistido) { const p = Math.max(0, Math.min(...pesos) - inc); return { tipo: "sube", texto: `La última vez hiciste ${e.reps[1]} en todas. Baja la ayuda a ${fmt(p)} kg.`, peso: p }; }
    const p = Math.max(...pesos) + inc;
    return { tipo: "sube", texto: `La última vez hiciste ${e.reps[1]}${lado} en todas. Toca subir a ${fmt(p)} kg.`, peso: p };
  }
  if (reps.some(r => r < e.reps[0])) return { tipo: "manten", texto: `Alguna serie se quedó por debajo de ${e.reps[0]}. Mantén el peso hasta completar el rango.` };
  return { tipo: "suma", texto: `Mismo peso: intenta sumar una repetición hasta llegar a ${e.reps[1]} en todas.` };
}
function textoUltima(e, u) {
  const s = u.x.series.filter(s => s.hecho).map(s => e.sinPeso ? `${s.reps}` : `${fmt(s.peso || 0)}×${s.reps}`).join(" · ");
  return `Última vez (${fechaCorta(deClave(u.k))}): ${s}${e.unidad === "s" ? " s" : ""}`;
}

/* ---------- Semanas y constancia ---------- */
function resumenSemanas(n) {
  const semanas = ultimasSemanas(n).map(w => ({ ...w, gym: 0, soloDeporte: 0, volumen: 0, minDep: 0 }));
  for (const [k, d] of Object.entries(Datos.dias)) {
    const w = semanaDe(semanas, k);
    if (!w || !diaActivo(d)) continue;
    if (hizoGym(d)) w.gym++; else w.soloDeporte++;
    w.minDep += minDeporte(d);
    w.volumen += volumenDia(d);
  }
  return semanas;
}
// Kilos movidos: peso × repeticiones de las series hechas (no cuenta la ayuda de máquinas asistidas).
function volumenDia(d) {
  let v = 0;
  for (const [id, x] of Object.entries(d.ej || {})) {
    const e = EJ[id]; if (!e || e.sinPeso || variante(e, x.v).asistido) continue;
    for (const s of x.series) if (s.hecho) v += (num(s.peso) || 0) * (num(s.reps) || 0) * (e.porLado ? 2 : 1);
  }
  return v;
}
// Semanas seguidas cumpliendo el objetivo. La actual cuenta si ya se cumplió; si no, no rompe la racha.
function rachaSemanas() {
  const obj = Number(Datos.ajustes.objetivo) || P.objetivoSemanal;
  const semanas = resumenSemanas(104);
  let r = 0, i = semanas.length - 1;
  if (semanas[i].gym + semanas[i].soloDeporte < obj) i--;
  for (; i >= 0 && semanas[i].gym + semanas[i].soloDeporte >= obj; i--) r++;
  return r;
}

/* ---------- Temporizador de descanso ---------- */
const T = { fin: 0, texto: "", avisado: false, lock: null, audio: null };
function arrancarDescanso(seg, texto) {
  T.fin = Date.now() + seg * 1000; T.total = seg; T.texto = texto; T.avisado = false;
  // El sonido solo puede prepararse tras un toque del usuario: este lo es.
  if (Datos.ajustes.sonido && !T.audio) { try { T.audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  try { navigator.wakeLock?.request("screen").then(l => { T.lock = l; }, () => {}); } catch (e) {}
  const el = $("#flotante");
  el.innerHTML = `<div class="descanso" role="timer" aria-live="off">
    <div class="descanso-txt"><span class="eyebrow" id="tEtiqueta">Descanso</span><b class="num" id="tCuenta"></b><span class="small" id="tSig"></span></div>
    <button class="btn sec peq" data-t="mas">+15 s</button><button class="btn peq" data-t="saltar">Saltar</button>
    <i class="descanso-barra" id="tBarra"></i></div>`;
  $("#tSig").textContent = texto;
  document.body.classList.add("con-descanso");
  tic();
}
function pararDescanso() {
  T.fin = 0; $("#flotante").innerHTML = ""; document.body.classList.remove("con-descanso");
  try { T.lock?.release(); } catch (e) {} T.lock = null;
}
function pitar() {
  if (Datos.ajustes.vibracion) try { navigator.vibrate?.([250, 120, 250]); } catch (e) {}
  if (!Datos.ajustes.sonido || !T.audio) return;
  try {
    T.audio.resume();
    [0, 0.25].forEach(t0 => {
      const o = T.audio.createOscillator(), g = T.audio.createGain(), t = T.audio.currentTime + t0;
      o.frequency.value = 880; g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o.connect(g).connect(T.audio.destination); o.start(t); o.stop(t + 0.2);
    });
  } catch (e) {}
}
function tic() {
  if (T.fin) {
    const resta = Math.ceil((T.fin - Date.now()) / 1000);
    if (resta > 0) {
      $("#tCuenta").textContent = `${Math.floor(resta / 60)}:${String(resta % 60).padStart(2, "0")}`;
      $("#tBarra").style.width = `${Math.max(0, 100 * resta / T.total)}%`;
    } else {
      if (!T.avisado) { T.avisado = true; pitar(); $("#tEtiqueta").textContent = "Descanso terminado"; $("#tCuenta").textContent = "¡Vamos!"; $("#tBarra").style.width = "0"; }
      if (resta < -10) pararDescanso();
    }
  }
  // Cronómetro de la sesión: corre mientras haya actividad reciente.
  const c = $("#crono"), d = Datos.dias[HOY];
  if (c && d?.inicio) {
    const enCurso = Date.now() - d.ultima < 20 * 60e3;
    const min = Math.floor(((enCurso ? Date.now() : d.ultima) - d.inicio) / 60e3);
    c.textContent = `${min} min${enCurso ? " en marcha" : ""}`;
  }
}
setInterval(tic, 250);
document.addEventListener("click", ev => {
  const b = ev.target.closest("[data-t]"); if (!b) return;
  if (b.dataset.t === "mas") { T.fin = Math.max(T.fin, Date.now()) + 15e3; T.total += 15; T.avisado = false; $("#tEtiqueta").textContent = "Descanso"; tic(); }
  else pararDescanso();
});
// Siguiente serie pendiente, empezando por el ejercicio actual (o el primero de su superserie).
function siguientePendiente(d, desde) {
  const ejs = DIA[d.diaPlan].ejercicios;
  const i0 = Math.max(0, ejs.findIndex(e => e.id === desde || (EJ[desde]?.superserie && e.superserie === EJ[desde].superserie)));
  for (const e of [...ejs.slice(i0), ...ejs.slice(0, i0)]) {
    const x = entrada(d, e);
    const i = x.series.findIndex((s, j) => !s.hecho && j < e.series);
    if (i >= 0) return `Siguiente: ${nombreCompleto(e, x.v)}, serie ${i + 1}`;
  }
  return "";
}

/* ---------- Vista: Hoy ---------- */
function pintarHoy() {
  const d = diaDe(HOY);
  const obj = Number(Datos.ajustes.objetivo) || P.objetivoSemanal;
  const sem = resumenSemanas(1)[0], hechos = sem.gym + sem.soloDeporte;
  const racha = rachaSemanas();
  let h = `<div class="wrap" style="padding:0">
    <section class="card semana" aria-label="Esta semana">
      <div class="puntos" aria-hidden="true">${Array.from({ length: Math.max(obj, hechos) }, (_, i) => `<i class="${i < sem.gym ? "lleno" : i < hechos ? "dep" : ""}"></i>`).join("")}</div>
      <div><b class="num grande">${hechos} de ${obj}</b> <span class="muted">entrenos esta semana</span>
      <div class="small muted">${racha ? `Racha: <b>${racha} semana${racha > 1 ? "s" : ""}</b> cumpliendo` : "Cumple el objetivo esta semana para empezar la racha"}</div></div>
    </section>
    <section class="card" aria-labelledby="t-toca">
      <h2 id="t-toca">Hoy toca</h2>
      <div class="chips cuatro" role="group" aria-label="Qué entrenas hoy">
        ${P.dias.map(x => `<button class="chip" data-diaplan="${x.id}" aria-pressed="${d.diaPlan === x.id}"><b>${esc(x.nombre)}</b><span class="small">${esc(x.titulo)}</span></button>`).join("")}
        <button class="chip" data-diaplan="" aria-pressed="${!d.diaPlan}"><b>Solo deporte</b><span class="small">Sin gimnasio</span></button>
      </div>
    </section>`;
  if (d.diaPlan && DIA[d.diaPlan]) h += pintarSesion(d, DIA[d.diaPlan]);
  if (d.diaPlan && DIA[d.diaPlan]?.rodilla) h += pintarRodilla(d);
  h += pintarDeporte(d);
  h += `<section class="card"><label class="campo" for="nota" style="font-size:1rem;color:var(--ink)"><b>Nota del día</b><span class="muted small">Cómo te has encontrado, molestias, cambios de máquina…</span></label>
    <textarea id="nota" rows="2" class="area">${esc(d.nota)}</textarea></section>`;
  h += avisoCopia(Object.values(Datos.dias).filter(diaActivo).length);
  $("#vista").innerHTML = h + `</div>`;
  tic();
}

function pintarSesion(d, dia) {
  const ejs = dia.ejercicios;
  let total = 0, hechas = 0;
  for (const e of ejs) { if (e.opcional) continue; const x = entrada(d, e); total += obligatorias(e); hechas += Math.min(obligatorias(e), x.series.filter(s => s.hecho).length); }
  const pct = total ? Math.round(100 * hechas / total) : 0;
  let h = `<section class="card" aria-labelledby="t-sesion">
    <div class="top"><h2 id="t-sesion">${esc(dia.nombre)} · ${esc(dia.titulo)}</h2><span class="num" style="font-size:1.4rem">${hechas}/${total}</span></div>
    <div class="progreso-dia" aria-hidden="true"><i style="width:${pct}%"></i></div>
    <p class="small muted" style="margin:0"><span id="crono">${d.inicio ? "" : "El cronómetro arranca con la primera serie"}</span> · objetivo ~${P.duracionMin} min. Descansos: ${esc(P.textoDescansos)}</p>
    ${dia.nota ? `<p class="nota">${esc(dia.nota)}</p>` : ""}
    ${hechas === total && total ? `<p class="aviso" style="background:var(--accent-soft)"><b>Sesión completa.</b> Buen trabajo. El próximo día toca ${esc(DIA[P.dias[(P.dias.indexOf(dia) + 1) % P.dias.length].id].nombre)}.</p>` : ""}
    <div class="calent"><span class="eyebrow">Calentamiento</span>
      ${dia.calentamiento.map((c, i) => `<label class="lista-check"><input type="checkbox" id="cal-${i}" data-calent="${i}" ${d.calent?.[i] ? "checked" : ""}><span>${esc(c)}</span></label>`).join("")}
    </div>`;
  let i = 0;
  while (i < ejs.length) {
    const e = ejs[i];
    if (e.superserie) {
      const grupo = ejs.filter(x => x.superserie === e.superserie);
      h += `<div class="superserie"><span class="eyebrow">Superserie ${esc(e.superserie)}${e.opcional ? " · opcional" : ""}</span>
        <p class="small muted" style="margin:0">Haz una serie de cada uno sin descanso entre ellos; descansa al terminar la vuelta.</p>
        ${grupo.map(g => pintarEjercicio(d, dia, g)).join("")}</div>`;
      i += grupo.length;
    } else { h += pintarEjercicio(d, dia, e); i++; }
  }
  return h + `</section>`;
}

function pintarEjercicio(d, dia, e) {
  const x = entrada(d, e);
  const bloqueado = x.series.some(s => s.hecho);
  const u = ultimaVez(e.id, x.v, HOY);
  const c = consejo(e, x, HOY);
  const completo = x.series.slice(0, obligatorias(e)).every(s => s.hecho);
  const vs = variantes(e);
  let h = `<article class="ejr ${completo ? "hecho" : ""}">
    <div><span class="ej-grupo">${esc(e.seccion)}${e.opcional && !e.superserie ? " · opcional" : ""}</span>
    <h3 class="ej-nombre">${esc(e.nombre)}</h3>
    <span class="ej-pauta">${pauta(e)} · descanso ${descansoDe(e)} s</span></div>
    ${e.nota ? `<p class="nota">${esc(e.nota)}</p>` : ""}`;
  if (vs.length > 1) h += `<div class="sens" role="group" aria-label="Variante">${vs.map((v, i) => `<button class="chip" data-var="${e.id}" data-v="${i}" aria-pressed="${x.v === i}" ${bloqueado && x.v !== i ? "disabled" : ""}>${esc(v.n)}</button>`).join("")}</div>`;
  if (u) h += `<p class="ultima num">${textoUltima(e, u)}</p>`;
  if (c && !completo) h += `<p class="consejo ${c.tipo}">${esc(c.texto)}${c.peso != null && x.series.some(s => !s.hecho) ? ` <button class="enlace" data-usar="${e.id}" data-peso="${c.peso}">Usar ${fmt(c.peso)} kg</button>` : ""}</p>`;
  h += `<div class="series ${e.sinPeso ? "sin-peso" : ""}">`;
  x.series.slice(0, e.series).forEach((s, i) => {
    const ph = sugerido(e, x, i, HOY), opt = i >= obligatorias(e);
    const nom = `${esc(e.nombre)}, serie ${i + 1}`;
    h += `<div class="serie ${s.hecho ? "ok" : ""}">
      <span class="sn" title="${opt ? "Serie opcional" : ""}">${i + 1}${opt ? "<sup>opc</sup>" : ""}</span>
      ${e.sinPeso ? "" : `<input class="num" type="number" inputmode="decimal" min="0" step="0.25" id="s-${e.id}-${i}-peso" data-serie="${e.id}|${i}" data-k="peso" value="${esc(s.peso)}" placeholder="${esc(ph.peso)}" aria-label="${nom}: ${variante(e, x.v).asistido ? "kg de ayuda" : "kg"}"><span class="u">${variante(e, x.v).asistido ? "ayuda" : "kg"}</span>`}
      <input class="num" type="number" inputmode="numeric" min="0" step="1" id="s-${e.id}-${i}-reps" data-serie="${e.id}|${i}" data-k="reps" value="${esc(s.reps)}" placeholder="${esc(ph.reps)}" aria-label="${nom}: ${e.unidad === "s" ? "segundos" : "repeticiones"}"><span class="u">${uRep(e)}</span>
      <button class="check peq" data-ok="${e.id}|${i}" aria-pressed="${s.hecho}" aria-label="Marcar ${nom} como hecha">${SVG_CHECK}</button>
    </div>`;
  });
  h += `</div>`;
  if (dia.rodilla && e.rodilla !== false) h += `<button class="chip mini" data-rod="${e.id}" aria-pressed="${!!x.rodilla}">Me molestó la rodilla</button>`;
  return h + `</article>`;
}

function pintarRodilla(d) {
  const previas = Object.keys(Datos.dias).filter(k => k < HOY && Datos.dias[k].rodilla != null).sort().slice(-1).map(k => Datos.dias[k].rodilla);
  const alta = d.rodilla != null && d.rodilla >= 4;
  const repetida = alta && previas[0] >= 4;
  return `<section class="card" aria-labelledby="t-rodilla">
    <h2 id="t-rodilla">¿Cómo está la rodilla hoy?</h2>
    <p class="small muted" style="margin:0">0 = nada, 10 = mucho dolor. Márcalo al terminar la pierna. Sirve para ver si algún ejercicio la carga.</p>
    <div class="escala11" role="group" aria-label="Molestia de rodilla de 0 a 10">${Array.from({ length: 11 }, (_, n) => `<button class="chip" data-rodilla="${n}" aria-pressed="${d.rodilla === n}">${n}</button>`).join("")}</div>
    ${repetida ? `<p class="alerta small" style="margin:0"><strong>Dos sesiones seguidas con molestia de 4 o más.</strong> No subas peso en pierna y coméntalo con tu fisio.</p>`
      : alta ? `<p class="aviso small" style="margin:0">Molestia notable. La próxima vez no subas peso en pierna y, si se repite, coméntalo con tu fisio.</p>` : ""}
  </section>`;
}

function pintarDeporte(d) {
  const lista = d.deporte || [];
  return `<section class="card" aria-labelledby="t-dep">
    <h2 id="t-dep">Otro deporte hoy</h2>
    ${lista.length ? `<div class="historial">${lista.map((x, i) => `<div class="hist"><span><b>${esc(x.tipo)}</b> · ${esc(x.min)} min</span><button class="enlace" data-deldep="${i}" aria-label="Quitar ${esc(x.tipo)}">Quitar</button></div>`).join("")}</div>` : `<p class="small muted" style="margin:0">Pádel, correr, bici… cuenta para tu objetivo de la semana.</p>`}
    <div class="campos">
      <label class="campo">Deporte<select id="depTipo">${DEPORTES.map(t => `<option>${t}</option>`).join("")}</select></label>
      <label class="campo">Minutos<input class="num" type="number" inputmode="numeric" min="1" id="depMin" placeholder="60"></label>
      <button class="btn peq" data-adddep>Añadir</button>
    </div>
  </section>`;
}

/* ---------- Vista: Progreso ---------- */
let ejSel = null;
function pintarProgreso() {
  const obj = Number(Datos.ajustes.objetivo) || P.objetivoSemanal;
  const claves = Object.keys(Datos.dias).filter(k => diaActivo(Datos.dias[k])).sort();
  const semanas = resumenSemanas(8), actual = semanas[semanas.length - 1];
  const sesiones = claves.filter(k => hizoGym(Datos.dias[k])).length;
  let h = `<div class="wrap" style="padding:0">
    <div class="tiles">
      <div class="tile"><span class="eyebrow">Racha</span><span class="num">${rachaSemanas()}</span><span>semanas cumpliendo</span></div>
      <div class="tile"><span class="eyebrow">Semana</span><span class="num">${actual.gym + actual.soloDeporte}/${obj}</span><span>entrenos</span></div>
      <div class="tile"><span class="eyebrow">Gimnasio</span><span class="num">${sesiones}</span><span>sesiones en total</span></div>
    </div>`;
  if (!claves.length) {
    $("#vista").innerHTML = h + `<section class="card"><h2>Aquí verás tu progreso</h2><p class="muted">Cuando marques series o apuntes deporte en <b>Hoy</b>, aparecerán aquí tus semanas, cómo suben los kilos en cada ejercicio y el historial.</p></section></div>`;
    return;
  }
  h += `<section class="card"><h2>Entrenos por semana</h2>
    ${graficoBarras(semanas.map(w => ({ etiqueta: fechaCorta(w.inicio), partes: [{ v: w.gym, color: "var(--accent)" }, { v: w.soloDeporte, color: "var(--amber)" }] })), { meta: obj, etiquetaAria: "Entrenos por semana en las últimas 8 semanas" })}
    <p class="leyenda small"><span><i style="background:var(--accent)"></i>Gimnasio</span><span><i style="background:var(--amber)"></i>Solo deporte</span><span><i class="raya"></i>Objetivo (${obj})</span></p></section>`;

  // Progreso por ejercicio y variante.
  const opciones = [];
  for (const id of Object.keys(EJ)) {
    const e = EJ[id];
    for (let v = 0; v < variantes(e).length; v++) {
      const pts = claves.map(k => ({ k, x: Datos.dias[k].ej?.[id] })).filter(p => p.x && p.x.v === v && p.x.series.some(s => s.hecho));
      if (pts.length) opciones.push({ clave: `${id}|${v}`, e, v, pts });
    }
  }
  h += `<section class="card"><h2>Progreso por ejercicio</h2>`;
  if (opciones.length) {
    const o = opciones.find(o => o.clave === ejSel) || opciones[0];
    h += `<label class="campo" for="selEj">Ejercicio<select id="selEj">${opciones.map(o2 => `<option value="${o2.clave}" ${o2 === o ? "selected" : ""}>${esc(nombreCompleto(o2.e, o2.v))}</option>`).join("")}</select></label>`;
    const asistido = variante(o.e, o.v).asistido, usaReps = o.e.sinPeso;
    const serie = o.pts.map(p => {
      const hs = p.x.series.filter(s => s.hecho);
      const val = usaReps ? Math.max(...hs.map(s => num(s.reps) || 0)) : asistido ? Math.min(...hs.map(s => num(s.peso) ?? Infinity)) : Math.max(...hs.map(s => num(s.peso) || 0));
      return { k: p.k, v: Number.isFinite(val) ? val : 0, hs };
    });
    h += graficoLinea(serie, { unidad: usaReps ? (o.e.unidad === "s" ? " s" : "") : " kg" });
    const mejor = serie.reduce((a, b) => (asistido ? b.v < a.v : b.v > a.v) ? b : a);
    const mejorSerie = mejor.hs.reduce((a, b) => (num(b.reps) || 0) > (num(a.reps) || 0) ? b : a);
    h += `<p class="muted small" style="margin:0">${usaReps ? `Mejor marca: <b>${fmt(mejor.v)}${o.e.unidad === "s" ? " s" : " rep"}</b>` : asistido ? `Menos ayuda: <b>${fmt(mejor.v)} kg</b> × ${mejorSerie.reps} (menos ayuda = más fuerza)` : `Mejor serie: <b>${fmt(mejor.v)} kg</b> × ${mejorSerie.reps}`} · ${fechaCorta(deClave(mejor.k))}. ${serie.length} sesión${serie.length > 1 ? "es" : ""}.</p>`;
  } else h += `<p class="muted">Aún no hay series apuntadas.</p>`;
  h += `</section>`;

  if (semanas.some(w => w.volumen)) h += `<section class="card"><h2>Kilos movidos por semana</h2>
    ${graficoBarras(semanas.map((w, i) => ({ etiqueta: fechaCorta(w.inicio), partes: [{ v: Math.round(w.volumen), color: i === semanas.length - 1 ? "var(--accent)" : "var(--accent-soft)" }] })), { etiquetaAria: "Kilos movidos por semana" })}
    <p class="muted small" style="margin:0">Peso × repeticiones de todas las series hechas.</p></section>`;

  // Rodilla: evolución y ejercicios que más molestias han dado.
  const rod = claves.filter(k => Datos.dias[k].rodilla != null).map(k => ({ k, v: Datos.dias[k].rodilla }));
  const marcas = {};
  for (const k of claves) for (const [id, x] of Object.entries(Datos.dias[k].ej || {})) {
    if (!DIA[EJ[id]?.dia]?.rodilla || !x.series.some(s => s.hecho)) continue;
    const n = nombreCompleto(EJ[id], x.v); marcas[n] = marcas[n] || { si: 0, veces: 0 }; marcas[n].veces++; if (x.rodilla) marcas[n].si++;
  }
  const conMolestia = Object.entries(marcas).filter(([, m]) => m.si).sort((a, b) => b[1].si / b[1].veces - a[1].si / a[1].veces);
  if (rod.length || conMolestia.length) {
    h += `<section class="card"><h2>Rodilla</h2>${rod.length ? graficoLinea(rod, { min: 0, max: 10 }) : ""}
      ${conMolestia.length ? `<p class="small" style="margin:0"><b>Ejercicios con molestias:</b></p><div class="historial">${conMolestia.map(([n, m]) => `<div class="hist"><span>${esc(n)}</span><span class="muted">${m.si} de ${m.veces} sesiones</span></div>`).join("")}</div>` : `<p class="muted small" style="margin:0">Ningún ejercicio marcado con molestias.</p>`}
      <p class="muted small" style="margin:0">Es un registro para comentarlo con tu fisio, no un diagnóstico.</p></section>`;
  }

  const dep = {};
  for (const k of claves) { const w = semanaDe(semanas, k); if (!w) continue; for (const x of Datos.dias[k].deporte || []) { dep[x.tipo] = dep[x.tipo] || { veces: 0, min: 0 }; dep[x.tipo].veces++; dep[x.tipo].min += Number(x.min) || 0; } }
  if (Object.keys(dep).length) h += `<section class="card"><h2>Deporte (8 semanas)</h2><div class="historial">${Object.entries(dep).sort((a, b) => b[1].min - a[1].min).map(([t, m]) => `<div class="hist"><span>${esc(t)}</span><span class="muted">${m.veces} ${m.veces > 1 ? "veces" : "vez"} · ${m.min} min</span></div>`).join("")}</div></section>`;

  h += `<section class="card"><h2>Últimos días</h2><div class="historial">${claves.slice(-14).reverse().map(k => {
    const d = Datos.dias[k], partes = [];
    if (hizoGym(d)) partes.push(`${DIA[d.diaPlan]?.nombre || "Gimnasio"}${d.inicio && d.ultima ? ` · ${Math.max(1, Math.round((d.ultima - d.inicio) / 60e3))} min` : ""}`);
    for (const x of d.deporte || []) partes.push(`${x.tipo} ${x.min} min`);
    return `<div class="hist"><span>${fechaLarga(deClave(k))}</span><span class="muted">${esc(partes.join(" · "))}</span></div>`;
  }).join("")}</div></section></div>`;
  $("#vista").innerHTML = h;
}

/* ---------- Vista: Ajustes ---------- */
function opciones(valores, actual, sufijo = "") { return valores.map(v => `<option value="${v}" ${Number(actual) === v ? "selected" : ""}>${fmt(v)}${sufijo}</option>`).join(""); }
function pintarAjustes() {
  const a = Datos.ajustes;
  $("#vista").innerHTML = `<div class="wrap" style="padding:0">
    <section class="card"><label class="campo" for="nombre" style="font-size:1rem;color:var(--ink)"><b>Nombre</b></label>
      <input id="nombre" value="${esc(a.nombre)}" placeholder="${esc(PERFIL.nombre)}" class="texto"></section>
    <section class="card"><h2>Entrenamiento</h2>
      <div class="campos">
        <label class="campo">Objetivo semanal<select id="aj-objetivo">${opciones([2, 3, 4, 5, 6], a.objetivo, " días")}</select></label>
        <label class="campo">Subir peso de<select id="aj-incremento">${opciones([1, 1.25, 2, 2.5, 5], a.incremento, " kg")}</select></label>
      </div>
      <div class="campos">
        <label class="campo">Descanso principales<select id="aj-desc-principal">${opciones([45, 60, 75, 90, 120, 150, 180], a.descansos.principal, " s")}</select></label>
        <label class="campo">Descanso aislamientos<select id="aj-desc-aislamiento">${opciones([30, 45, 60, 75, 90], a.descansos.aislamiento, " s")}</select></label>
      </div>
      <div class="lista-ajustes">
        <label><input type="checkbox" id="aj-sonido" ${a.sonido ? "checked" : ""}><span>Pitido al terminar el descanso</span></label>
        <label><input type="checkbox" id="aj-vibracion" ${a.vibracion ? "checked" : ""}><span>Vibrar al terminar el descanso (Android)</span></label>
      </div>
      <p class="muted small" style="margin:0">Mantén la app abierta durante el descanso: con la pantalla bloqueada el móvil no deja pitar.</p>
    </section>
    <section class="card"><h2>${esc(P.nombre)}</h2>
      ${P.dias.map(d => `<details><summary><b>${esc(d.nombre)}</b> · ${esc(d.titulo)}</summary><div class="historial">${d.ejercicios.map(e => `<div class="hist"><span>${esc(e.nombre)}${e.opcional ? " (opcional)" : ""}</span><span class="muted num">${pauta(e)}</span></div>`).join("")}</div></details>`).join("")}
      <p class="muted small" style="margin:0">Duración ~${P.duracionMin} min. Descansos: ${esc(P.textoDescansos)}</p>
    </section>
    ${htmlCopia()}
    <section class="card"><h2>Importante</h2><p class="muted small" style="margin:0">La app propone; tú decides. Si un ejercicio molesta, baja el peso o cámbialo, y ante dolor de rodilla que se repite, consulta con tu fisio antes de seguir subiendo.</p></section>
  </div>`;
}

/* ---------- Eventos ---------- */
window.App = {
  ajustesIniciales: { nombre: "", objetivo: P.objetivoSemanal, incremento: 2.5, descansos: { ...P.descansos }, sonido: true, vibracion: true },
  vistas: { hoy: pintarHoy, progreso: pintarProgreso, ajustes: pintarAjustes },
  click(b) {
    const d = Datos.dias[HOY];
    if ("diaplan" in b.dataset) { d.diaPlan = b.dataset.diaplan || null; tocar(HOY); }
    else if (b.dataset.var) { const x = d.ej[b.dataset.var]; if (x.series.some(s => s.hecho)) return false; x.v = Number(b.dataset.v); tocar(HOY); }
    else if (b.dataset.ok) {
      const [id, i] = b.dataset.ok.split("|"), e = EJ[id], x = d.ej[id], s = x.series[Number(i)];
      s.hecho = !s.hecho;
      if (s.hecho) {
        // Lo que no se ha escrito se toma de lo sugerido (la última vez o el rango).
        const ph = sugerido(e, x, Number(i), HOY);
        if (s.peso === "" && !e.sinPeso && ph.peso !== "") s.peso = Number(ph.peso);
        if (s.reps === "") s.reps = Number(ph.reps);
        actividad(d);
        const grupo = e.superserie ? DIA[d.diaPlan].ejercicios.filter(g => g.superserie === e.superserie) : [e];
        const sig = siguientePendiente(d, id);
        const pos = grupo.findIndex(g => g.id === id);
        if (pos < grupo.length - 1) { const otro = grupo[pos + 1]; pararDescanso(); tocar(HOY); repintar(); msgFlotante(`Sin descanso: ahora ${otro.nombre}`); return false; }
        if (sig) arrancarDescanso(descansoDe(e), sig); else pararDescanso();
      }
      tocar(HOY);
    }
    else if (b.dataset.usar) { const x = d.ej[b.dataset.usar]; x.series.forEach(s => { if (!s.hecho) s.peso = Number(b.dataset.peso); }); tocar(HOY); }
    else if (b.dataset.rod) { const x = d.ej[b.dataset.rod]; x.rodilla = !x.rodilla; tocar(HOY); }
    else if ("rodilla" in b.dataset) { const n = Number(b.dataset.rodilla); d.rodilla = d.rodilla === n ? null : n; tocar(HOY); }
    else if ("adddep" in b.dataset) {
      const min = num($("#depMin").value);
      if (!min || min <= 0) { $("#depMin").focus(); return false; }
      d.deporte = d.deporte || []; d.deporte.push({ tipo: $("#depTipo").value, min }); tocar(HOY);
    }
    else if (b.dataset.deldep) { d.deporte.splice(Number(b.dataset.deldep), 1); tocar(HOY); }
    else return false;
  },
  cambio(t) {
    const d = Datos.dias[HOY], a = Datos.ajustes;
    if (t.dataset.serie) { const [id, i] = t.dataset.serie.split("|"); d.ej[id].series[Number(i)][t.dataset.k] = t.value === "" ? "" : Number(t.value); tocar(HOY); }
    else if (t.dataset.calent) { d.calent = d.calent || []; d.calent[Number(t.dataset.calent)] = t.checked; if (t.checked) actividad(d); tocar(HOY); repintar(); }
    else if (t.id === "nota") { d.nota = t.value; tocar(HOY); }
    else if (t.id === "nombre") { a.nombre = t.value.trim(); Datos.guardarAjustes(); pintar(); }
    else if (t.id === "aj-objetivo") { a.objetivo = Number(t.value); Datos.guardarAjustes(); }
    else if (t.id === "aj-incremento") { a.incremento = Number(t.value); Datos.guardarAjustes(); }
    else if (t.id === "aj-desc-principal") { a.descansos = { ...a.descansos, principal: Number(t.value) }; Datos.guardarAjustes(); }
    else if (t.id === "aj-desc-aislamiento") { a.descansos = { ...a.descansos, aislamiento: Number(t.value) }; Datos.guardarAjustes(); }
    else if (t.id === "aj-sonido") { a.sonido = t.checked; Datos.guardarAjustes(); }
    else if (t.id === "aj-vibracion") { a.vibracion = t.checked; Datos.guardarAjustes(); }
    else if (t.id === "selEj") { ejSel = t.value; repintar(); }
  },
};
// Aviso breve en la zona del temporizador (por ejemplo, en mitad de una superserie).
function msgFlotante(texto) {
  const el = $("#flotante");
  el.innerHTML = `<div class="descanso"><div class="descanso-txt"><span class="eyebrow">Superserie</span><b>${esc(texto)}</b></div></div>`;
  document.body.classList.add("con-descanso");
  clearTimeout(msgFlotante.t); msgFlotante.t = setTimeout(() => { if (!T.fin) pararDescanso(); }, 4000);
}
