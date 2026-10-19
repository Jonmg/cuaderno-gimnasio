"use strict";
/* Motor "rutina": un plan de varios días (window.PLAN) que rotan en orden, se haga cuando se
   haga. Cada ejercicio del plan es un hueco que puede ocuparse con cualquier ejercicio del
   catálogo (window.CATALOGO_BASE + los creados por la persona): el registro va siempre por el
   ejercicio que de verdad se hizo. Apunta cada serie, propone subir peso con doble progresión,
   lleva el descanso y la duración de la sesión, el deporte aparte, la rodilla si el plan lo
   pide, y una ficha de ayuda por ejercicio con foto de la máquina. */

const P = window.PLAN;
const DIA = Object.fromEntries(P.dias.map(d => [d.id, d]));
const LIBRE = { id: "libre", nombre: "Entreno libre", titulo: "Tú eliges los ejercicios", calentamiento: [], ejercicios: [] };
const diaDef = d => DIA[d?.diaPlan] || (d?.diaPlan === "libre" ? LIBRE : null);
const DEPORTES = ["Pádel", "Correr", "Bici", "Natación", "Fútbol", "Caminar", "Montaña", "Otro"];
const ZONA_A_MUSCULO = { Pecho: "pecho", Espalda: "dorsal", Hombro: "hombro", "Bíceps": "biceps", "Tríceps": "triceps", Pierna: "cuadriceps", "Glúteo": "gluteo", Gemelo: "gemelo", Core: "abdomen", Estabilidad: "cuerpo", Cardio: "cardio", Movilidad: "cuerpo" };

/* ---------- Catálogo ----------
   Ficha de cada ejercicio = catálogo base (músculos, variantes con su aparato, ayuda) + lo que
   diga el plan para ese id (nombre, pauta, nota). Los creados por la persona viven en sus ajustes. */
const CAT_FIJO = {};
for (const e of window.CATALOGO_BASE) CAT_FIJO[e.id] = { ...e };
for (const d of P.dias) for (const e of d.ejercicios) {
  const { seccion, superserie, opcional, rodilla, ...ficha } = e;
  CAT_FIJO[e.id] = normalizar({ ...CAT_FIJO[e.id], ...ficha });
}
// Los ejercicios creados con la versión anterior tenían zona y equipo en vez de músculos y variantes.
function normalizar(e) {
  if (!e) return e;
  const m = e.m?.length ? e.m : [ZONA_A_MUSCULO[e.zona] || "cuerpo"];
  const variantes = (e.variantes?.length ? e.variantes : [{ n: "" }]).map(v => typeof v === "string" ? { n: v } : v);
  return { ...e, m, variantes };
}
const propios = () => Datos.ajustes.propios || [];
const cat = id => CAT_FIJO[id] || normalizar(propios().find(p => p.id === id));
const todos = () => [...Object.values(CAT_FIJO), ...propios().map(normalizar)].filter(e => !e.oculto);

/* ---------- Músculos y aparatos ---------- */
const AP = Object.fromEntries(APARATOS.map(a => [a.id, a]));
const TIPO_AP = Object.fromEntries(TIPOS_APARATO);
const TIPO_CORTO = { maquina: "Máquina", discos: "Discos", polea: "Polea", mancuernas: "Mancuernas", barra: "Barra", banco: "Banco y suelo", funcional: "Funcional", hiit: "HIIT", cardio: "Cardio" };
const nombreMusculos = e => (e.m || []).map(x => MUSCULOS[x]?.n).filter(Boolean).join(", ");
const zonaDe = e => MUSCULOS[e.m?.[0]]?.n || e.zona || "";
const ejerciciosCon = ap => todos().filter(e => e.variantes.some(v => v.ap === ap));
// Clave de la foto de una variante: la del aparato (compartida); si no tiene, la del ejercicio.
const claveFoto = (e, v) => variante(e, v)?.ap || e.id;
// Miniatura de un aparato: su foto si la hay; si no, el icono de su tipo.
const fotoAp = (ap, clase = "ap-chip") => urlFoto(ap) ? `<img class="${clase}" src="${urlFoto(ap)}" alt="" onerror="this.style.visibility='hidden'">` : `<span class="${clase} sin-foto">${iconoAparato(AP[ap]?.tipo)}</span>`;
const enElPlan = new Set(P.dias.flatMap(d => d.ejercicios.map(e => e.id)));

/* ---------- Pauta ---------- */
const variantes = e => (e.variantes || [""]).map(v => typeof v === "string" ? { n: v } : v);
const variante = (e, v) => variantes(e)[v] || variantes(e)[0];
// Con nombrePorVariante la variante ya es el nombre completo ("Zancada estática corta").
const nombreCompleto = (e, v) => variantes(e).length < 2 ? e.nombre : e.nombrePorVariante ? variante(e, v).n : `${e.nombre} · ${variante(e, v).n}`;
const uRep = e => e.unidad === "s" ? "s" : e.unidad === "min" ? "min" : "rep";
function pauta(e) {
  const s = e.seriesOpcionales ? `${e.series - e.seriesOpcionales}–${e.series}` : e.series;
  const r = e.reps[0] === e.reps[1] ? e.reps[0] : `${e.reps[0]}–${e.reps[1]}`;
  return `${s} × ${r}${e.unidad ? " " + e.unidad : ""}${e.porLado ? " por lado" : ""}`;
}
const descansoDe = e => Number(Datos.ajustes.descansos?.[e.tipo]) || P.descansos[e.tipo] || 60;
const obligatorias = e => e.series - (e.seriesOpcionales || 0);

/* ---------- Huecos del día ----------
   Un hueco es un ejercicio del plan (con el cambio que se haya hecho hoy o para siempre) o un
   ejercicio añadido hoy. Si el cambio es de la misma medida, se respeta la pauta del plan. */
function prescripcion(pe, exId) {
  if (exId === pe.id) return { ...cat(pe.id), ...pe };
  const c = cat(exId);
  if (!c) return { ...cat(pe.id), ...pe };
  const misma = (c.unidad || "") === (pe.unidad || "") && !!c.sinPeso === !!pe.sinPeso;
  const pautaPlan = misma ? { series: pe.series, seriesOpcionales: pe.seriesOpcionales, reps: pe.reps, tipo: pe.tipo } : {};
  return { ...c, ...pautaPlan, seccion: pe.seccion, superserie: pe.superserie, opcional: pe.opcional, rodilla: pe.rodilla };
}
function huecos(d) {
  const dia = diaDef(d); if (!dia) return [];
  const out = [];
  for (const pe of dia.ejercicios) {
    if (d.quitados?.includes(pe.id)) continue;
    const hoy = d.cambios?.[pe.id], siempre = Datos.ajustes.sustituciones?.[pe.id];
    const exId = (hoy && cat(hoy)) ? hoy : (siempre && cat(siempre)) ? siempre : pe.id;
    out.push({ slot: pe.id, e: prescripcion(pe, exId), original: pe, cambiado: exId !== pe.id, cambioHoy: exId === hoy && exId !== pe.id });
  }
  for (const id of d.extras || []) { const c = cat(id); if (c) out.push({ slot: "x:" + id, e: { ...c, seccion: zonaDe(c) }, extra: true }); }
  return out;
}
const enUso = d => new Set(huecos(d).map(h => h.e.id));

/* ---------- Días ---------- */
const hizoGym = d => !!d && !d.nuevo && Object.values(d.ej || {}).some(x => x.series.some(s => s.hecho));
const minDeporte = d => (d?.deporte || []).reduce((s, x) => s + (Number(x.min) || 0), 0);
const diaActivo = d => !!d && !d.nuevo && (hizoGym(d) || minDeporte(d) > 0);
// El día que toca es el siguiente al último del plan que se entrenó, no depende del día de la semana.
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
const empezado = (d, id) => !!d.ej?.[id]?.series.some(s => s.hecho);

/* ---------- Historial de un ejercicio ---------- */
function ultimaVez(id, v, antes) {
  for (const k of Object.keys(Datos.dias).filter(k => k < antes).sort().reverse()) {
    const x = Datos.dias[k].ej?.[id];
    if (x && x.v === v && x.series.some(s => s.hecho)) return { k, x };
  }
  return null;
}
function sesionesDe(id) {
  return Object.keys(Datos.dias).sort().reverse().filter(k => !Datos.dias[k].nuevo && Datos.dias[k].ej?.[id]?.series.some(s => s.hecho)).map(k => ({ k, x: Datos.dias[k].ej[id] }));
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
    if (e.unidad === "min") return { tipo: "sube", texto: `La última vez llegaste a ${e.reps[1]} min. Puedes alargar un poco o subir la intensidad.` };
    if (e.sinPeso || !pesos.length) return { tipo: "sube", texto: `La última vez completaste ${e.reps[1]}${lado} en todas. Toca añadir algo de peso o dificultad.` };
    if (va.asistido) { const p = Math.max(0, Math.min(...pesos) - inc); return { tipo: "sube", texto: `La última vez hiciste ${e.reps[1]} en todas. Baja la ayuda a ${fmt(p)} kg.`, peso: p }; }
    const p = Math.max(...pesos) + inc;
    return { tipo: "sube", texto: `La última vez hiciste ${e.reps[1]}${lado} en todas. Toca subir a ${fmt(p)} kg.`, peso: p };
  }
  if (reps.some(r => r < e.reps[0])) return { tipo: "manten", texto: `Alguna serie se quedó por debajo de ${e.reps[0]}. Mantén el peso hasta completar el rango.` };
  return { tipo: "suma", texto: `Mismo peso: intenta sumar una repetición hasta llegar a ${e.reps[1]} en todas.` };
}
function textoSeries(e, x) {
  const u = e.unidad ? " " + e.unidad : "";
  return x.series.filter(s => s.hecho).map(s => e.sinPeso || s.peso === "" ? `${s.reps}` : `${fmt(s.peso)}×${s.reps}`).join(" · ") + u;
}
const textoUltima = (e, u) => `Última vez (${fechaCorta(deClave(u.k))}): ${textoSeries(e, u.x)}`;

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
    const e = cat(id); if (!e || e.sinPeso || e.unidad || variante(e, x.v).asistido) continue;
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
  const hs = huecos(d);
  const actual = hs.find(h => h.e.id === desde);
  const i0 = Math.max(0, hs.findIndex(h => h.e.id === desde || (actual?.e.superserie && h.e.superserie === actual.e.superserie)));
  for (const h of [...hs.slice(i0), ...hs.slice(0, i0)]) {
    const x = entrada(d, h.e);
    const i = x.series.findIndex((s, j) => !s.hecho && j < h.e.series);
    if (i >= 0) return `Siguiente: ${nombreCompleto(h.e, x.v)}, serie ${i + 1}`;
  }
  return "";
}

/* ---------- Vista: Hoy ---------- */
function pintarHoy() {
  const d = diaDe(HOY);
  const obj = Number(Datos.ajustes.objetivo) || P.objetivoSemanal;
  const sem = resumenSemanas(1)[0], hechos = sem.gym + sem.soloDeporte;
  const racha = rachaSemanas();
  const dia = diaDef(d);
  let h = `<div class="wrap" style="padding:0">
    <section class="card semana" aria-label="Esta semana">
      <div class="puntos" aria-hidden="true">${Array.from({ length: Math.max(obj, hechos) }, (_, i) => `<i class="${i < sem.gym ? "lleno" : i < hechos ? "dep" : ""}"></i>`).join("")}</div>
      <div><b class="num grande">${hechos} de ${obj}</b> <span class="muted">entrenos esta semana</span>
      <div class="small muted">${racha ? `Racha: <b>${racha} semana${racha > 1 ? "s" : ""}</b> cumpliendo` : "Cumple el objetivo esta semana para empezar la racha"}</div></div>
    </section>
    <section class="card" aria-labelledby="t-toca">
      <h2 id="t-toca">Hoy toca</h2>
      <div class="chips cinco" role="group" aria-label="Qué entrenas hoy">
        ${P.dias.map(x => `<button class="chip" data-diaplan="${x.id}" aria-pressed="${d.diaPlan === x.id}"><b>${esc(x.nombre)}</b><span class="small">${esc(x.titulo)}</span></button>`).join("")}
        <button class="chip" data-diaplan="libre" aria-pressed="${d.diaPlan === "libre"}"><b>Libre</b><span class="small">Eliges tú</span></button>
        <button class="chip" data-diaplan="" aria-pressed="${!d.diaPlan}"><b>Solo deporte</b><span class="small">Sin gimnasio</span></button>
      </div>
    </section>`;
  if (dia) h += pintarSesion(d, dia);
  if (dia?.rodilla) h += pintarRodilla(d);
  h += pintarDeporte(d);
  h += `<section class="card"><label class="campo" for="nota" style="font-size:1rem;color:var(--ink)"><b>Nota del día</b><span class="muted small">Cómo te has encontrado, molestias, cambios de máquina…</span></label>
    <textarea id="nota" rows="2" class="area">${esc(d.nota)}</textarea></section>`;
  h += avisoCopia(Object.values(Datos.dias).filter(diaActivo).length);
  $("#vista").innerHTML = h + `</div>`;
  tic();
}

function pintarSesion(d, dia) {
  const hs = huecos(d);
  let total = 0, hechas = 0;
  for (const { e } of hs) { if (e.opcional) continue; const x = entrada(d, e); total += obligatorias(e); hechas += Math.min(obligatorias(e), x.series.filter(s => s.hecho).length); }
  const pct = total ? Math.round(100 * hechas / total) : 0;
  const siguiente = DIA[dia.id] ? DIA[P.dias[(P.dias.indexOf(dia) + 1) % P.dias.length].id].nombre : "";
  let h = `<section class="card" aria-labelledby="t-sesion">
    <div class="top"><h2 id="t-sesion">${esc(dia.nombre)} · ${esc(dia.titulo)}</h2>${total ? `<span class="num" style="font-size:1.4rem">${hechas}/${total}</span>` : ""}</div>
    ${total ? `<div class="progreso-dia" aria-hidden="true"><i style="width:${pct}%"></i></div>` : ""}
    <p class="small muted" style="margin:0"><span id="crono">${d.inicio ? "" : "El cronómetro arranca con la primera serie"}</span> · objetivo ~${P.duracionMin} min. Descansos: ${esc(P.textoDescansos)}</p>
    ${dia.nota ? `<p class="nota">${esc(dia.nota)}</p>` : ""}
    ${hechas === total && total ? `<p class="aviso" style="background:var(--accent-soft)"><b>Sesión completa.</b> Buen trabajo.${siguiente ? ` El próximo día toca ${esc(siguiente)}.` : ""}</p>` : ""}
    ${dia.calentamiento.length ? `<div class="calent"><span class="eyebrow">Calentamiento</span>
      ${dia.calentamiento.map((c, i) => `<label class="lista-check"><input type="checkbox" id="cal-${i}" data-calent="${i}" ${d.calent?.[i] ? "checked" : ""}><span>${esc(c)}</span></label>`).join("")}
    </div>` : ""}`;
  if (!hs.length) h += `<p class="muted" style="margin:0">Añade los ejercicios que vayas haciendo: cada uno queda registrado con su historial.</p>`;
  let i = 0;
  while (i < hs.length) {
    const { e } = hs[i];
    if (e.superserie) {
      const grupo = hs.filter(x => x.e.superserie === e.superserie);
      h += `<div class="superserie"><span class="eyebrow">Superserie ${esc(e.superserie)}${e.opcional ? " · opcional" : ""}</span>
        <p class="small muted" style="margin:0">Haz una serie de cada uno sin descanso entre ellos; descansa al terminar la vuelta.</p>
        ${grupo.map(g => pintarEjercicio(d, dia, g)).join("")}</div>`;
      i += grupo.length;
    } else { h += pintarEjercicio(d, dia, hs[i]); i++; }
  }
  const quitados = (d.quitados || []).map(id => dia.ejercicios.find(e => e.id === id)).filter(Boolean);
  h += `<div class="fila"><button class="btn sec" data-anadir>+ Añadir ejercicio</button></div>`;
  if (quitados.length) h += `<p class="small muted" style="margin:0">Quitados hoy: ${quitados.map(e => `${esc(e.nombre)} <button class="enlace" data-recuperar="${e.id}">recuperar</button>`).join(" · ")}</p>`;
  return h + `</section>`;
}

function pintarEjercicio(d, dia, hueco) {
  const { e, slot } = hueco;
  const x = entrada(d, e);
  const bloqueado = x.series.some(s => s.hecho);
  const u = ultimaVez(e.id, x.v, HOY);
  const c = consejo(e, x, HOY);
  const completo = x.series.slice(0, obligatorias(e)).every(s => s.hecho);
  const vs = variantes(e);
  const ajusteMaquina = Datos.ajustes.notasEj?.[e.id];
  let origen = "";
  if (hueco.cambiado) origen = `<p class="small muted" style="margin:0">En lugar de ${esc(hueco.original.nombre)}${hueco.cambioHoy ? " (solo hoy)" : " (cambio fijo)"}${bloqueado ? "" : ` · <button class="enlace" data-revertir="${slot}">volver al del plan</button>`}</p>`;
  if (hueco.extra) origen = `<p class="small muted" style="margin:0">Añadido hoy${bloqueado ? "" : ` · <button class="enlace" data-quitarextra="${e.id}">quitar</button>`}</p>`;
  let h = `<article class="ejr ${completo ? "hecho" : ""}">
    <div class="ejr-cab">
      <button class="musculo-btn" data-ayuda="${e.id}" aria-label="Ayuda de ${esc(e.nombre)}">${iconoMusculo(e.m)}</button>
      <div class="ejr-tit"><span class="ej-grupo">${esc(e.seccion || zonaDe(e))}${e.opcional && !e.superserie ? " · opcional" : ""}</span>
        <h3 class="ej-nombre">${esc(e.nombre)}</h3>
        <span class="ej-pauta">${pauta(e)} · descanso ${descansoDe(e)} s</span></div>
      <button class="ayuda-btn" data-ayuda="${e.id}" aria-label="Ayuda y foto de ${esc(e.nombre)}">?</button>
    </div>
    ${origen}
    ${ajusteMaquina ? `<p class="ajuste-maq small">⚙ ${esc(ajusteMaquina)}</p>` : ""}
    ${e.nota ? `<p class="nota">${esc(e.nota)}</p>` : ""}`;
  if (vs.length > 1) h += `<div class="variantes" role="group" aria-label="Con qué lo haces">${vs.map((v, i) => `<button class="chip var" data-var="${e.id}" data-v="${i}" aria-pressed="${x.v === i}" ${bloqueado && x.v !== i ? "disabled" : ""}>${v.ap ? fotoAp(v.ap) : ""}<span>${esc(v.n)}</span></button>`).join("")}</div>`;
  else if (vs[0]?.ap) h += `<button class="ap-linea" data-aparato="${vs[0].ap}">${fotoAp(vs[0].ap)}<span>${esc(AP[vs[0].ap]?.nombre || vs[0].n)}</span></button>`;
  if (u) h += `<p class="ultima num">${textoUltima(e, u)}</p>`;
  if (c && !completo) h += `<p class="consejo ${c.tipo}">${esc(c.texto)}${c.peso != null && x.series.some(s => !s.hecho) ? ` <button class="enlace" data-usar="${e.id}" data-peso="${c.peso}">Usar ${fmt(c.peso)} kg</button>` : ""}</p>`;
  h += `<div class="series ${e.sinPeso ? "sin-peso" : ""}">`;
  x.series.slice(0, e.series).forEach((s, i) => {
    const ph = sugerido(e, x, i, HOY), opt = i >= obligatorias(e);
    const nom = `${esc(e.nombre)}, serie ${i + 1}`;
    h += `<div class="serie ${s.hecho ? "ok" : ""}">
      <span class="sn" title="${opt ? "Serie opcional" : ""}">${i + 1}${opt ? "<sup>opc</sup>" : ""}</span>
      ${e.sinPeso ? "" : `<input class="num" type="number" inputmode="decimal" min="0" step="0.25" id="s-${e.id}-${i}-peso" data-serie="${e.id}|${i}" data-k="peso" value="${esc(s.peso)}" placeholder="${esc(ph.peso)}" aria-label="${nom}: ${variante(e, x.v).asistido ? "kg de ayuda" : "kg"}"><span class="u">${variante(e, x.v).asistido ? "ayuda" : "kg"}</span>`}
      <input class="num" type="number" inputmode="numeric" min="0" step="1" id="s-${e.id}-${i}-reps" data-serie="${e.id}|${i}" data-k="reps" value="${esc(s.reps)}" placeholder="${esc(ph.reps)}" aria-label="${nom}: ${e.unidad === "s" ? "segundos" : e.unidad === "min" ? "minutos" : "repeticiones"}"><span class="u">${uRep(e)}</span>
      <button class="check peq" data-ok="${e.id}|${i}" aria-pressed="${s.hecho}" aria-label="Marcar ${nom} como hecha">${SVG_CHECK}</button>
    </div>`;
  });
  h += `</div><div class="fila ej-acciones">`;
  if (dia.rodilla && e.rodilla !== false) h += `<button class="chip mini" data-rod="${e.id}" aria-pressed="${!!x.rodilla}">Me molestó la rodilla</button>`;
  if (!bloqueado && !hueco.extra) h += `<button class="chip mini" data-cambiar="${slot}">Cambiar ejercicio</button><button class="chip mini" data-quitar="${slot}">Quitar hoy</button>`;
  return h + `</div></article>`;
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
    ${graficoBarras(semanas.map(w => ({ etiqueta: fechaCorta(w.inicio), partes: [{ v: w.gym, color: "var(--accent)" }, { v: w.soloDeporte, color: "var(--sec)" }] })), { meta: obj, etiquetaAria: "Entrenos por semana en las últimas 8 semanas" })}
    <p class="leyenda small"><span><i style="background:var(--accent)"></i>Gimnasio</span><span><i style="background:var(--sec)"></i>Solo deporte</span><span><i class="raya"></i>Objetivo (${obj})</span></p></section>`;

  // Progreso por ejercicio y variante.
  const opciones = [];
  const ids = new Set(claves.flatMap(k => Object.keys(Datos.dias[k].ej || {})));
  for (const id of ids) {
    const e = cat(id); if (!e) continue;
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
    h += graficoLinea(serie, { unidad: usaReps ? (o.e.unidad ? " " + o.e.unidad : "") : " kg" });
    const mejor = serie.reduce((a, b) => (asistido ? b.v < a.v : b.v > a.v) ? b : a);
    const mejorSerie = mejor.hs.reduce((a, b) => (num(b.reps) || 0) > (num(a.reps) || 0) ? b : a);
    h += `<p class="muted small" style="margin:0">${usaReps ? `Mejor marca: <b>${fmt(mejor.v)} ${uRep(o.e)}</b>` : asistido ? `Menos ayuda: <b>${fmt(mejor.v)} kg</b> × ${mejorSerie.reps} (menos ayuda = más fuerza)` : `Mejor serie: <b>${fmt(mejor.v)} kg</b> × ${mejorSerie.reps}`} · ${fechaCorta(deClave(mejor.k))}. ${serie.length} sesión${serie.length > 1 ? "es" : ""}.</p>`;
  } else h += `<p class="muted">Aún no hay series apuntadas.</p>`;
  h += `</section>`;

  if (semanas.some(w => w.volumen)) h += `<section class="card"><h2>Kilos movidos por semana</h2>
    ${graficoBarras(semanas.map((w, i) => ({ etiqueta: fechaCorta(w.inicio), partes: [{ v: Math.round(w.volumen), color: i === semanas.length - 1 ? "var(--accent)" : "var(--accent-soft)" }] })), { etiquetaAria: "Kilos movidos por semana" })}
    <p class="muted small" style="margin:0">Peso × repeticiones de todas las series hechas.</p></section>`;

  // Rodilla: evolución y ejercicios que más molestias han dado.
  const rod = claves.filter(k => Datos.dias[k].rodilla != null).map(k => ({ k, v: Datos.dias[k].rodilla }));
  const marcas = {};
  for (const k of claves) for (const [id, x] of Object.entries(Datos.dias[k].ej || {})) {
    const e = cat(id);
    if (!e || !DIA[Datos.dias[k].diaPlan]?.rodilla || e.rodilla === false || !x.series.some(s => s.hecho)) continue;
    const n = nombreCompleto(e, x.v); marcas[n] = marcas[n] || { si: 0, veces: 0 }; marcas[n].veces++; if (x.rodilla) marcas[n].si++;
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
    if (hizoGym(d)) partes.push(`${diaDef(d)?.nombre || "Gimnasio"}${d.inicio && d.ultima ? ` · ${Math.max(1, Math.round((d.ultima - d.inicio) / 60e3))} min` : ""}`);
    for (const x of d.deporte || []) partes.push(`${x.tipo} ${x.min} min`);
    return `<div class="hist"><span>${fechaLarga(deClave(k))}</span><span class="muted">${esc(partes.join(" · "))}</span></div>`;
  }).join("")}</div></section></div>`;
  $("#vista").innerHTML = h;
}

/* ---------- Listas de ejercicios (buscador y filtros) ---------- */
// El filtro de músculo mira el principal: "Bíceps" da curls, no jalones.
function filtrar({ q = "", musc = "", mat = "", excluir = new Set(), primero = [] }) {
  const t = sinAcentos(q).trim();
  const grupo = FILTROS_MUSCULO.find(f => f[0] === musc)?.[1];
  return todos()
    .filter(e => !excluir.has(e.id)
      && (!grupo || grupo.includes(e.m[0]))
      && (!mat || e.variantes.some(v => AP[v.ap]?.tipo === mat))
      && (!t || sinAcentos(`${e.nombre} ${nombreMusculos(e)} ${e.variantes.map(v => `${v.n} ${AP[v.ap]?.nombre || ""}`).join(" ")}`).includes(t)))
    .sort((a, b) => primero.includes(b.m[0]) - primero.includes(a.m[0]) || a.nombre.localeCompare(b.nombre, "es"));
}
function htmlLista(lista, accion) {
  if (!lista.length) return `<p class="muted small" style="margin:0">No hay ninguno así. Prueba con otro filtro o créalo abajo.</p>`;
  return lista.map(e => {
    const n = sesionesDe(e.id).length;
    const tipos = [...new Set(e.variantes.map(v => AP[v.ap]?.tipo).filter(Boolean))];
    return `<button class="item" data-${accion}="${e.id}">
      ${iconoMusculo(e.m, { clase: "musculo item-ico" })}
      <span class="item-txt"><b>${esc(e.nombre)}</b><span class="small muted">${esc(nombreMusculos(e))}${enElPlan.has(e.id) ? " · en tu plan" : ""}${e.propio ? " · creado por ti" : ""}${n ? ` · ${n} ${n > 1 ? "sesiones" : "sesión"}` : ""}</span>
      ${tipos.length ? `<span class="etiquetas">${tipos.map(t => `<span class="etiqueta">${TIPO_CORTO[t]}</span>`).join("")}</span>` : ""}</span>
    </button>`;
  }).join("");
}
// Tras repintar, deja a la vista los chips elegidos (las filas se desplazan en horizontal).
const verZona = () => document.querySelectorAll('.zonas [aria-pressed="true"]').forEach(c => c.scrollIntoView({ inline: "center", block: "nearest" }));
function htmlFiltros(st, para) {
  const fila = (k, titulo, opciones) => `<div class="filtro"><span class="eyebrow">${titulo}</span><div class="zonas" role="group" aria-label="${titulo}">
    <button class="chip mini" data-filtro="${k}|" data-para="${para}" aria-pressed="${!st[k]}">Todo</button>
    ${opciones.map(([v, t]) => `<button class="chip mini" data-filtro="${k}|${v}" data-para="${para}" aria-pressed="${st[k] === v}">${t}</button>`).join("")}</div></div>`;
  return fila("musc", "Músculo", FILTROS_MUSCULO.map(([n]) => [n, n])) + fila("mat", "Material", TIPOS_APARATO.map(([id]) => [id, TIPO_CORTO[id]]));
}

/* ---------- Hojas ---------- */
let Sel = null;          // cambiar / añadir / crear ejercicio
let Hoja = null;         // qué ficha está abierta, para refrescarla tras una foto
function abrirAyuda(id) { Hoja = { tipo: "ayuda", id }; abrirHoja(hojaAyuda(id)); }
function abrirAparato(ap) { Hoja = { tipo: "aparato", id: ap }; abrirHoja(hojaAparato(ap)); }
function refrescarHoja() {
  if (Hoja?.tipo === "ayuda") abrirHoja(hojaAyuda(Hoja.id));
  else if (Hoja?.tipo === "aparato") abrirHoja(hojaAparato(Hoja.id));
  else if (Hoja?.tipo === "compartir") abrirHoja(Compartir.html());
}

function hojaSelector() {
  const d = Datos.dias[HOY];
  const hueco = Sel.slot ? huecos(d).find(h => h.slot === Sel.slot) : null;
  if (Sel.paso === "confirmar") {
    const nuevo = cat(Sel.elegido), dia = diaDef(d);
    return `<div class="hoja-cab"><h2>Cambiar ejercicio</h2>${botonCerrar}</div>
      <div class="cambio">${iconoMusculo(hueco.e.m)}<span>${esc(hueco.e.nombre)}</span><b aria-hidden="true">→</b>${iconoMusculo(nuevo.m)}<span><b>${esc(nuevo.nombre)}</b></span></div>
      <p class="small muted" style="margin:0">Se registra como ${esc(nuevo.nombre)}, con su propio historial.</p>
      <div class="grid-botones">
        <button class="btn" data-confirmar="hoy">Solo hoy</button>
        ${DIA[dia.id] ? `<button class="btn sec" data-confirmar="siempre">Siempre en ${esc(dia.nombre)}</button>` : ""}
      </div>
      <button class="enlace" data-volversel style="justify-self:start">Elegir otro</button>`;
  }
  if (Sel.paso === "crear") {
    const grupo = FILTROS_MUSCULO.find(f => f[0] === Sel.musc)?.[1];
    const mDef = grupo?.[0] || hueco?.e.m[0] || "pecho";
    const apDef = Sel.mat ? APARATOS.find(a => a.tipo === Sel.mat)?.id : "";
    return `<div class="hoja-cab"><h2>Crear ejercicio</h2>${botonCerrar}</div>
      <label class="campo" for="nuevoNombre">Nombre<input id="nuevoNombre" class="texto" placeholder="Por ejemplo: Remo Hammer unilateral" value="${esc(Sel.q)}"></label>
      <label class="campo" for="nuevoMusculo">Músculo principal<select id="nuevoMusculo">${Object.entries(MUSCULOS).map(([id, m]) => `<option value="${id}" ${id === mDef ? "selected" : ""}>${m.n}</option>`).join("")}</select></label>
      <label class="campo" for="nuevoAparato">Máquina o material<select id="nuevoAparato"><option value="">Otro / sin material</option>
        ${TIPOS_APARATO.map(([t, n]) => `<optgroup label="${n}">${APARATOS.filter(a => a.tipo === t).map(a => `<option value="${a.id}" ${a.id === apDef ? "selected" : ""}>${esc(a.nombre)}</option>`).join("")}</optgroup>`).join("")}</select></label>
      <div class="campos">
        <label class="campo">Se mide en<select id="nuevoMedida"><option value="peso">Repeticiones con peso</option><option value="reps">Repeticiones sin peso</option><option value="s">Segundos</option><option value="min">Minutos</option></select></label>
        <label class="campo">Tipo<select id="nuevoTipo"><option value="principal">Principal (más descanso)</option><option value="aislamiento" selected>Aislamiento</option></select></label>
      </div>
      <div class="campos">
        <label class="campo">Series<select id="nuevoSeries">${[1, 2, 3, 4, 5].map(n => `<option ${n === 3 ? "selected" : ""}>${n}</option>`).join("")}</select></label>
        <label class="campo">Mínimo<input class="num corto" type="number" inputmode="numeric" min="1" id="nuevoMin" value="8"></label>
        <label class="campo">Máximo<input class="num corto" type="number" inputmode="numeric" min="1" id="nuevoMax" value="12"></label>
      </div>
      <p class="small" id="msgNuevo" role="status" style="margin:0"></p>
      <div class="grid-botones"><button class="btn" data-guardarnuevo>Guardar ejercicio</button>${Sel.modo !== "explorar" ? `<button class="btn sec" data-volversel>Volver a la lista</button>` : ""}</div>`;
  }
  const titulo = Sel.modo === "cambiar" ? `Cambiar ${esc(hueco.e.nombre)}` : "Añadir ejercicio";
  return `<div class="hoja-cab"><h2>${titulo}</h2>${botonCerrar}</div>
    <input id="buscarSel" class="texto" type="search" placeholder="Buscar: prensa, polea, isquios…" value="${esc(Sel.q)}" autocomplete="off">
    ${htmlFiltros(Sel, "sel")}
    <div id="listaSel" class="lista">${listaSel()}</div>
    <button class="btn sec" data-crear>Crear ejercicio nuevo</button>`;
}
function listaSel() {
  const d = Datos.dias[HOY];
  const hueco = Sel.slot ? huecos(d).find(h => h.slot === Sel.slot) : null;
  return htmlLista(filtrar({ ...Sel, excluir: enUso(d), primero: hueco?.e.m || [] }), "elegir");
}
function crearPropio() {
  const nombre = $("#nuevoNombre").value.trim(), min = num($("#nuevoMin").value), max = num($("#nuevoMax").value);
  const msg = t => { $("#msgNuevo").textContent = t; $("#msgNuevo").style.color = "var(--warn)"; };
  if (!nombre) { msg("Ponle un nombre."); return null; }
  if (!min || !max || min > max) { msg("Revisa el rango: el mínimo no puede ser mayor que el máximo."); return null; }
  if (todos().some(e => sinAcentos(e.nombre) === sinAcentos(nombre))) { msg("Ya hay un ejercicio con ese nombre: búscalo en la lista."); return null; }
  const medida = $("#nuevoMedida").value, ap = $("#nuevoAparato").value;
  const e = {
    id: "p-" + sinAcentos(nombre).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) + "-" + Date.now().toString(36),
    nombre, m: [$("#nuevoMusculo").value], variantes: [ap ? { n: AP[ap].nombre, ap } : { n: "" }],
    tipo: $("#nuevoTipo").value, series: Number($("#nuevoSeries").value), reps: [min, max], propio: true, pasos: [], errores: [],
    ...(medida === "reps" ? { sinPeso: true } : medida === "s" || medida === "min" ? { unidad: medida, sinPeso: true } : {}),
  };
  Datos.ajustes.propios = [...propios(), e];
  Datos.guardarAjustes();
  return e.id;
}
function añadirExtra(d, id) { d.extras = [...(d.extras || []), id]; if (!d.diaPlan) d.diaPlan = "libre"; tocar(HOY); }

// Bloque de foto con sus botones (cámara y galería). La clave es el aparato o el ejercicio.
// La foto que se ve es la propia si la hay; si no, la del gimnasio; si no, la genérica.
function htmlFoto(clave, titulo) {
  const propia = Fotos.url[clave], comp = FotosGym.url[clave], gen = FotosGen.info[clave], foto = propia || comp || gen?.url;
  const credito = gen?.tipo === "foto" ? `Foto genérica · ${esc(gen.autor || "")}${gen.licencia ? `, ${esc(gen.licencia)}` : ""}` : "Ilustración · aún sin foto real";
  const origen = propia ? (comp ? "Tu foto (hay otra del gimnasio)" : "Tu foto · solo en este móvil") : comp ? `Foto del gimnasio · ${esc(gimnasio())}` : gen ? credito : "";
  const generica = !propia && !comp && gen;
  return `<div class="foto-grande ${generica ? "generica" : ""}">${foto ? `<img src="${foto}" alt="${generica ? "Imagen genérica" : "Foto"} de ${esc(titulo)}">${origen ? `<span class="foto-origen">${origen}</span>` : ""}` : `<p>${iconoUI("camara", "ui-icono grande")}<br>Haz una foto de ${esc(titulo)} para reconocerla a la primera.</p>`}</div>
    ${generica ? `<p class="small muted" style="margin:0">Es una imagen de referencia. Haz la foto de la de ${esc(gimnasio() || "tu gimnasio")} y compártela para que todos la reconozcan.${gen.fuente ? ` <a href="${esc(gen.fuente)}" target="_blank" rel="noopener">Fuente ↗</a>` : ""}</p>` : ""}
    <div class="fila">
      <label class="btn peq">${iconoUI("camara")}${comp && !propia ? "Hacer otra foto" : "Hacer foto"}<input type="file" accept="image/*" capture="environment" data-foto="${clave}" hidden></label>
      <label class="btn sec peq">Elegir de la galería<input type="file" accept="image/*" data-foto="${clave}" hidden></label>
      ${propia ? `<button class="enlace" data-borrarfoto="${clave}">${comp ? "Quitar la mía" : "Quitar foto"}</button>` : ""}
    </div>
    ${propia && AP[clave] ? `<button class="btn sec peq" data-compartir="${clave}" style="justify-self:start">Compartir con el gimnasio</button>` : ""}
    <p class="small" id="msgFoto" role="status" style="margin:0"></p>`;
}

/* ---------- Hoja: ficha de un ejercicio ---------- */
function hojaAyuda(id) {
  const e = cat(id); if (!e) return "";
  const ses = sesionesDe(id);
  // Variante de referencia: la de hoy si ya está, si no la última que se usó.
  const vAct = Datos.dias[HOY]?.ej?.[id]?.v ?? ses[0]?.x.v ?? 0;
  const va = variante(e, vAct), clave = claveFoto(e, vAct);
  const vs = variantes(e);
  return `<div class="hoja-cab"><div><span class="ej-grupo">${esc(nombreMusculos(e))}</span><h2>${esc(e.nombre)}</h2></div>${botonCerrar}</div>
    <div class="ficha-top">${iconoMusculo(e.m, { clase: "musculo grande" })}
      <div class="ficha-txt"><p style="margin:0"><b>Trabaja:</b> ${esc(nombreMusculos(e))}</p>
      <p class="small muted" style="margin:0">Pauta habitual: ${pauta(e)} · descanso ${descansoDe(e)} s</p></div></div>
    <div><h3>${va.ap ? esc(AP[va.ap]?.nombre) : "Foto"}</h3>${vs.length > 1 ? `<p class="small muted" style="margin:0 0 6px">Variante: ${esc(va.n)}</p>` : ""}</div>
    ${htmlFoto(clave, va.ap ? AP[va.ap]?.nombre : e.nombre)}
    ${va.ap ? `<p class="small muted" style="margin:0">La foto es de la máquina: sale en todos los ejercicios que la usan.</p>` : ""}
    ${vs.length > 1 ? `<div><h3>Con qué más se puede hacer</h3><div class="lista">${vs.map((v, i) => i === vAct ? "" : `<button class="item" ${v.ap ? `data-aparato="${v.ap}"` : "disabled"}>${v.ap ? fotoAp(v.ap, "item-foto") : `<span class="item-foto sin-foto"></span>`}<span class="item-txt"><b>${esc(v.n)}</b><span class="small muted">${esc(AP[v.ap]?.nombre || "")}${v.ap && !fotoReal(v.ap) ? " · sin foto real" : ""}</span></span></button>`).join("")}</div></div>` : ""}
    <label class="campo" for="notaEj"><b style="color:var(--ink)">Cómo ajusto la máquina</b><span class="small muted">Asiento, respaldo, agarre, número de máquina… Se ve en el ejercicio.</span>
      <textarea id="notaEj" data-notaej="${id}" rows="2" class="area">${esc(Datos.ajustes.notasEj?.[id] || "")}</textarea></label>
    ${e.pasos?.length ? `<div><h3>Cómo se hace</h3><ol class="pasos">${e.pasos.map(p => `<li>${esc(p)}</li>`).join("")}</ol></div>` : ""}
    ${e.errores?.length ? `<div><h3>Ojo con</h3><ul class="pasos">${e.errores.map(p => `<li>${esc(p)}</li>`).join("")}</ul></div>` : ""}
    ${e.nota ? `<p class="nota">${esc(e.nota)}</p>` : ""}
    <div><h3>Tu historial</h3>${ses.length ? `<div class="historial">${ses.slice(0, 6).map(({ k, x }) => `<div class="hist"><span>${fechaCorta(deClave(k))}${vs.length > 1 ? ` · ${esc(variante(e, x.v).n)}` : ""}</span><span class="num">${esc(textoSeries(e, x))}</span></div>`).join("")}</div>` : `<p class="muted small" style="margin:0">Aún no lo has hecho.</p>`}</div>
    <a class="enlace" href="https://www.youtube.com/results?search_query=${encodeURIComponent(e.nombre + " técnica gimnasio")}" target="_blank" rel="noopener">Ver vídeos de la técnica en YouTube ↗</a>
    ${e.propio ? `<p class="small muted" style="margin:0">Ejercicio creado por ti.${ses.length ? "" : ` <button class="enlace" data-borrarpropio="${id}">Borrar ejercicio</button>`}</p>` : ""}`;
}

/* ---------- Hoja: ficha de una máquina o material ---------- */
function hojaAparato(ap) {
  const a = AP[ap]; if (!a) return "";
  const lista = ejerciciosCon(ap);
  return `<div class="hoja-cab"><div><span class="ej-grupo">${esc(TIPO_AP[a.tipo])}</span><h2>${esc(a.nombre)}</h2></div>${botonCerrar}</div>
    ${htmlFoto(ap, a.nombre)}
    ${a.nota ? `<p class="nota">${esc(a.nota)}</p>` : ""}
    <p class="small muted" style="margin:0">Archivo en el repositorio: <code>fotos/${slugGym()}/${ap}.jpg</code></p>
    <label class="campo" for="notaAp"><b style="color:var(--ink)">Notas de la máquina</b><span class="small muted">Dónde está en la sala, número, peculiaridades…</span>
      <textarea id="notaAp" data-notaap="${ap}" rows="2" class="area">${esc(Datos.ajustes.notasAp?.[ap] || "")}</textarea></label>
    <div><h3>Ejercicios con ${lista.length === 1 ? "esta máquina" : `esta máquina (${lista.length})`}</h3><div class="lista">${htmlLista(lista, "ayuda")}</div></div>`;
}

/* ---------- Vista: Ejercicios y máquinas ---------- */
const Lib = { vista: "ejercicios", q: "", musc: "", mat: "" };
function pintarEjercicios() {
  const seg = `<div class="seg" role="tablist" aria-label="Ver">
    <button role="tab" data-libvista="ejercicios" aria-selected="${Lib.vista === "ejercicios"}">Ejercicios</button>
    <button role="tab" data-libvista="maquinas" aria-selected="${Lib.vista === "maquinas"}">Máquinas</button></div>`;
  if (Lib.vista === "maquinas") {
    const delGym = APARATOS.filter(a => FotosGym.url[a.id]).length, propias = Compartir.pendientes(), mias = propias.filter(ap => !FotosGym.url[ap]).length;
    $("#vista").innerHTML = `<div class="wrap" style="padding:0">${seg}
    <section class="card" aria-labelledby="t-fotosgym">
      <h2 id="t-fotosgym">Fotos del gimnasio</h2>
      <p class="small muted" style="margin:0">${esc(gimnasio())}: <b>${delGym} de ${APARATOS.length}</b> máquinas con foto compartida. ${mias ? `Tienes <b>${mias}</b> foto${mias > 1 ? "s" : ""} nueva${mias > 1 ? "s" : ""} sin compartir.` : "Las fotos que hagas se pueden compartir para que las vean todos."}</p>
      ${FotosGym.error ? `<p class="small" style="margin:0;color:var(--warn)">No se pudo actualizar la lista: ${esc(FotosGym.error)}.</p>` : ""}
      <div class="fila">${propias.length ? `<button class="btn ${mias ? "" : "sec "}peq" data-abrircompartir>Compartir mis fotos</button>` : ""}<button class="btn sec peq" data-actualizarfotos>Actualizar</button></div>
    </section>
    <section class="card">
      <h2>Máquinas y material</h2>
      <p class="small muted" style="margin:0">Una foto por máquina sirve para todos los ejercicios que la usan.</p>
      ${TIPOS_APARATO.map(([t, n]) => `<div><p class="eyebrow" style="margin:10px 0 0">${n}</p><div class="lista">${APARATOS.filter(a => a.tipo === t).map(a => {
        const k = ejerciciosCon(a.id).length;
        return `<button class="item" data-aparato="${a.id}">${fotoAp(a.id, "item-foto")}<span class="item-txt"><b>${esc(a.nombre)}</b><span class="small muted">${k} ejercicio${k === 1 ? "" : "s"}${Fotos.url[a.id] ? " · tu foto" : FotosGym.url[a.id] ? "" : " · sin foto real"}${Datos.ajustes.notasAp?.[a.id] ? " · " + esc(Datos.ajustes.notasAp[a.id]) : ""}</span></span></button>`;
      }).join("")}</div></div>`).join("")}
    </section></div>`;
    return;
  }
  $("#vista").innerHTML = `<div class="wrap" style="padding:0">${seg}<section class="card">
    <h2>Ejercicios</h2>
    <p class="small muted" style="margin:0">Elige músculo y material para ver con qué puedes trabajarlo. Toca uno para ver cómo se hace.</p>
    <input id="buscarEj" class="texto" type="search" placeholder="Buscar: prensa, polea, isquios…" value="${esc(Lib.q)}" autocomplete="off">
    ${htmlFiltros(Lib, "lib")}
    <div id="listaLib" class="lista">${htmlLista(filtrar(Lib), "ayuda")}</div>
    <button class="btn sec" data-crearlib>Crear ejercicio nuevo</button>
  </section></div>`;
  verZona();
}

/* ---------- Vista: Ajustes ---------- */
function opciones(valores, actual, sufijo = "") { return valores.map(v => `<option value="${v}" ${Number(actual) === v ? "selected" : ""}>${fmt(v)}${sufijo}</option>`).join(""); }
function pintarAjustes() {
  const a = Datos.ajustes;
  const sust = Object.entries(a.sustituciones || {}).map(([slot, id]) => {
    const dia = P.dias.find(d => d.ejercicios.some(e => e.id === slot)), pe = dia?.ejercicios.find(e => e.id === slot);
    return pe && cat(id) ? `<div class="hist"><span>${esc(dia.nombre)}: ${esc(pe.nombre)} → <b>${esc(cat(id).nombre)}</b></span><button class="enlace" data-deshacersust="${slot}">Deshacer</button></div>` : "";
  }).join("");
  $("#vista").innerHTML = `<div class="wrap" style="padding:0">
    ${htmlPerfil()}
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
      ${P.dias.map(d => `<details><summary><b>${esc(d.nombre)}</b> · ${esc(d.titulo)}</summary><div class="historial">${d.ejercicios.map(pe => {
        const sid = a.sustituciones?.[pe.id], e = sid && cat(sid) ? prescripcion(pe, sid) : { ...cat(pe.id), ...pe };
        return `<div class="hist"><span>${esc(e.nombre)}${sid ? ` <span class="muted small">(en lugar de ${esc(pe.nombre)})</span>` : ""}${e.opcional ? " (opcional)" : ""}</span><span class="muted num">${pauta(e)}</span></div>`;
      }).join("")}</div></details>`).join("")}
      <p class="muted small" style="margin:0">Duración ~${P.duracionMin} min. Descansos: ${esc(P.textoDescansos)}</p>
    </section>
    <section class="card"><h2>Cambios fijos en tu plan</h2>
      ${sust ? `<div class="historial">${sust}</div>` : `<p class="muted small" style="margin:0">Ninguno. En cada ejercicio, "Cambiar ejercicio" permite cambiarlo solo hoy o siempre.</p>`}
    </section>
    ${Compartir.htmlAjustes()}
    ${htmlCopia()}
    <p class="muted small" style="margin:0">Tus fotos de las máquinas se guardan en este móvil y no van en la copia de seguridad: compártelas con el gimnasio para no perderlas.</p>
    <section class="card"><h2>Importante</h2><p class="muted small" style="margin:0">App personal, sin relación oficial con el gimnasio. La app propone; tú decides. Si un ejercicio molesta, baja el peso o cámbialo, y ante dolor de rodilla que se repite, consulta con tu fisio antes de seguir subiendo.</p></section>
  </div>`;
}

/* ---------- Frase del día ---------- */
const FRASES = [
  "{n}, hoy se entrena. Mañana se nota.", "La constancia gana a la motivación, {n}. Y tú tienes las dos.",
  "{n}, una repetición más que la última vez. Ese es todo el juego.", "Hoy no hay excusas, {n}: hay series.",
  "Lo que cuesta, cuenta, {n}.", "{n}, técnica primero, kilos después.",
  "El progreso es lento hasta que de repente se nota, {n}.", "{n}, cuarenta y cinco minutos bien hechos valen más que dos horas a medias.",
  "Entrena hoy para el {n} de dentro de un año.", "{n}, la disciplina es ir también los días que no apetece.",
  "Agua, música y a darle, {n}.", "{n}, cada kilo que subes te lo has ganado tú.",
  "Hoy toca superar una marca, {n}. Aunque sea por una repetición.", "{n}, no busques motivación: busca la costumbre.",
  "Menos pensar y más empujar, {n}.", "{n}, el sofá puede esperar.",
  "Tus rodillas, tu espalda y tu yo del futuro te lo agradecen, {n}.", "{n}, entrena con cabeza y descansa con ganas.",
  "Paso a paso, semana a semana, {n}.", "{n}, hoy el que manda eres tú, no la pereza.",
];
function motivacion() {
  const n = nombreVisible(), d = Datos.dias[HOY];
  const obj = Number(Datos.ajustes.objetivo) || P.objetivoSemanal;
  const sem = resumenSemanas(1)[0], hechos = sem.gym + sem.soloDeporte;
  const ultimo = Object.keys(Datos.dias).filter(k => k < HOY && diaActivo(Datos.dias[k])).sort().pop();
  const sinEntrenar = ultimo ? Math.round((deClave(HOY) - deClave(ultimo)) / 864e5) : 0;
  const racha = rachaSemanas();
  if (diaActivo(d)) return hechos >= obj ? `¡Hecho, ${n}! Objetivo de la semana cumplido. Ahora toca descansar.` : `¡Sesión hecha, ${n}! Agua, buena comida y a descansar.`;
  if (sinEntrenar >= 4) return `${n}, llevas ${sinEntrenar} días sin entrenar. Hoy es un buen día para volver.`;
  if (hechos >= obj) return `${n}, ya has cumplido el objetivo de la semana. Lo que hagas hoy es extra.`;
  if (racha >= 2 && new Date().getDay() === 1) return `${n}, ${racha} semanas seguidas cumpliendo. ¡A por otra!`;
  if (DIA[d?.diaPlan]?.rodilla) return fraseDelDia([`${n}, hoy toca pierna. Ni se te ocurra saltártela.`, `Día de pierna, ${n}: control, recorrido cómodo y a por ello.`]);
  return fraseDelDia(FRASES);
}

/* ---------- Eventos ---------- */
window.App = {
  pestañas: [["hoy", "Hoy"], ["progreso", "Progreso"], ["ejercicios", "Ejercicios"], ["ajustes", "Ajustes"]],
  ajustesIniciales: { nombre: "", objetivo: P.objetivoSemanal, incremento: 2.5, descansos: { ...P.descansos }, sonido: true, vibracion: true, propios: [], sustituciones: {}, notasEj: {}, notasAp: {} },
  vistas: { hoy: pintarHoy, progreso: pintarProgreso, ejercicios: pintarEjercicios, ajustes: pintarAjustes },
  motivacion,
  alCerrarHoja() { Sel = null; Hoja = null; },
  // Las fotos de la versión anterior iban por ejercicio: pasan a la máquina que usa (si no tiene ya).
  async alCargarFotos() {
    let n = 0;
    for (const k of Object.keys(Fotos.url)) {
      if (AP[k]) continue;
      const ap = cat(k)?.variantes?.[0]?.ap;
      if (ap && !Fotos.url[ap]) { try { if (await Fotos.mover(k, ap)) n++; } catch (e) {} }
    }
    return n;
  },
  click(b) {
    const d = diaDe(HOY), a = Datos.ajustes, ds = b.dataset;
    const c = Compartir.click(b); if (c !== undefined) return c;
    /* Hojas: no repintan la vista de detrás salvo que cambien datos. */
    if (ds.ayuda) { abrirAyuda(ds.ayuda); return false; }
    if (ds.aparato) { abrirAparato(ds.aparato); return false; }
    if (ds.cambiar) { Sel = { modo: "cambiar", slot: ds.cambiar, q: "", musc: "", mat: "", paso: "lista" }; abrirHoja(hojaSelector()); return false; }
    if ("anadir" in ds) { Sel = { modo: "anadir", q: "", musc: "", mat: "", paso: "lista" }; abrirHoja(hojaSelector()); return false; }
    if ("crearlib" in ds) { Sel = { modo: "explorar", q: "", musc: Lib.musc, mat: Lib.mat, paso: "crear" }; abrirHoja(hojaSelector()); return false; }
    if (ds.filtro !== undefined) {
      const [k, v] = ds.filtro.split("|");
      if (ds.para === "sel") { Sel[k] = v; abrirHoja(hojaSelector()); verZona(); return false; }
      Lib[k] = v; return;
    }
    if (ds.libvista) { Lib.vista = ds.libvista; return; }
    if ("crear" in ds) { Sel.paso = "crear"; abrirHoja(hojaSelector()); return false; }
    if ("volversel" in ds) { Sel.paso = "lista"; abrirHoja(hojaSelector()); return false; }
    if (ds.elegir) {
      if (Sel.modo === "cambiar") { Sel.elegido = ds.elegir; Sel.paso = "confirmar"; abrirHoja(hojaSelector()); return false; }
      añadirExtra(d, ds.elegir); cerrarHoja(); return;
    }
    if (ds.confirmar) {
      if (ds.confirmar === "siempre") { a.sustituciones = { ...a.sustituciones, [Sel.slot]: Sel.elegido }; if (d.cambios) delete d.cambios[Sel.slot]; Datos.guardarAjustes(); }
      else d.cambios = { ...d.cambios, [Sel.slot]: Sel.elegido };
      tocar(HOY); cerrarHoja(); return;
    }
    if ("guardarnuevo" in ds) {
      const id = crearPropio(); if (!id) return false;
      if (Sel.modo === "cambiar") { Sel.elegido = id; Sel.paso = "confirmar"; abrirHoja(hojaSelector()); return; }
      if (Sel.modo === "anadir") { añadirExtra(d, id); cerrarHoja(); return; }
      Sel = null; abrirAyuda(id); return;
    }
    if (ds.borrarfoto) { Fotos.borrar(ds.borrarfoto).then(() => { refrescarHoja(); repintar(); }); return false; }
    if (ds.borrarpropio) { a.propios = propios().filter(e => e.id !== ds.borrarpropio); Datos.guardarAjustes(); cerrarHoja(); return; }
    if (ds.deshacersust) { delete a.sustituciones[ds.deshacersust]; Datos.guardarAjustes(); return; }

    /* Sesión de hoy */
    if ("diaplan" in ds) { d.diaPlan = ds.diaplan || null; tocar(HOY); }
    else if (ds.quitar) { d.quitados = [...new Set([...(d.quitados || []), ds.quitar])]; tocar(HOY); }
    else if (ds.recuperar) { d.quitados = (d.quitados || []).filter(x => x !== ds.recuperar); tocar(HOY); }
    else if (ds.revertir) { if (d.cambios?.[ds.revertir]) delete d.cambios[ds.revertir]; else { delete a.sustituciones[ds.revertir]; Datos.guardarAjustes(); } tocar(HOY); }
    else if (ds.quitarextra) { d.extras = (d.extras || []).filter(x => x !== ds.quitarextra); tocar(HOY); }
    else if (ds.var) { const x = d.ej[ds.var]; if (x.series.some(s => s.hecho)) return false; x.v = Number(ds.v); tocar(HOY); }
    else if (ds.ok) {
      const [id, i] = ds.ok.split("|"), hs = huecos(d), h = hs.find(x => x.e.id === id);
      if (!h) return false;
      const e = h.e, x = d.ej[id], s = x.series[Number(i)];
      s.hecho = !s.hecho;
      if (s.hecho) {
        // Lo que no se ha escrito se toma de lo sugerido (la última vez o el rango).
        const ph = sugerido(e, x, Number(i), HOY);
        if (s.peso === "" && !e.sinPeso && ph.peso !== "") s.peso = Number(ph.peso);
        if (s.reps === "") s.reps = Number(ph.reps);
        actividad(d);
        const grupo = e.superserie ? hs.filter(g => g.e.superserie === e.superserie) : [h];
        const pos = grupo.findIndex(g => g.e.id === id);
        if (pos < grupo.length - 1) { pararDescanso(); tocar(HOY); repintar(); msgFlotante(`Sin descanso: ahora ${grupo[pos + 1].e.nombre}`); return false; }
        const sig = siguientePendiente(d, id);
        if (sig) arrancarDescanso(descansoDe(e), sig); else pararDescanso();
      }
      tocar(HOY);
    }
    else if (ds.usar) { const x = d.ej[ds.usar]; x.series.forEach(s => { if (!s.hecho) s.peso = Number(ds.peso); }); tocar(HOY); }
    else if (ds.rod) { const x = d.ej[ds.rod]; x.rodilla = !x.rodilla; tocar(HOY); }
    else if ("rodilla" in ds) { const n = Number(ds.rodilla); d.rodilla = d.rodilla === n ? null : n; tocar(HOY); }
    else if ("adddep" in ds) {
      const min = num($("#depMin").value);
      if (!min || min <= 0) { $("#depMin").focus(); return false; }
      d.deporte = d.deporte || []; d.deporte.push({ tipo: $("#depTipo").value, min }); tocar(HOY);
    }
    else if (ds.deldep) { d.deporte.splice(Number(ds.deldep), 1); tocar(HOY); }
    else return false;
  },
  cambio(t) {
    const d = diaDe(HOY), a = Datos.ajustes;
    if (Compartir.cambio(t)) return;
    if (t.dataset.foto) {
      const clave = t.dataset.foto, f = t.files[0]; if (!f) return;
      $("#msgFoto").textContent = "Guardando foto…";
      reducirFoto(f).then(b => Fotos.guardar(clave, b)).then(() => { refrescarHoja(); repintar(); })
        .catch(err => { const m = $("#msgFoto"); if (m) { m.textContent = `No se pudo guardar la foto: ${err.message}`; m.style.color = "var(--warn)"; } });
    }
    else if (t.dataset.notaej) { a.notasEj = { ...a.notasEj, [t.dataset.notaej]: t.value.trim() }; Datos.guardarAjustes(); repintar(); }
    else if (t.dataset.notaap) { a.notasAp = { ...a.notasAp, [t.dataset.notaap]: t.value.trim() }; Datos.guardarAjustes(); repintar(); }
    else if (t.dataset.serie) { const [id, i] = t.dataset.serie.split("|"); d.ej[id].series[Number(i)][t.dataset.k] = t.value === "" ? "" : Number(t.value); tocar(HOY); }
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
  // Buscadores: solo se repinta la lista, para no perder el foco del teclado.
  entrada(t) {
    if (t.id === "buscarSel" && Sel) { Sel.q = t.value; $("#listaSel").innerHTML = listaSel(); }
    else if (t.id === "buscarEj") { Lib.q = t.value; $("#listaLib").innerHTML = htmlLista(filtrar(Lib), "ayuda"); }
  },
};
// Aviso breve en la zona del temporizador (por ejemplo, en mitad de una superserie).
function msgFlotante(texto) {
  const el = $("#flotante");
  el.innerHTML = `<div class="descanso"><div class="descanso-txt"><span class="eyebrow">Superserie</span><b>${esc(texto)}</b></div></div>`;
  document.body.classList.add("con-descanso");
  clearTimeout(msgFlotante.t); msgFlotante.t = setTimeout(() => { if (!T.fin) pararDescanso(); }, 4000);
}
