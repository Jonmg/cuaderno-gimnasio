"use strict";
/* Motor "rutina": un plan de varios días (window.PLAN) que rotan en orden, se haga cuando se
   haga. Cada ejercicio del plan es un hueco que puede ocuparse con cualquier ejercicio del
   catálogo (window.CATALOGO_BASE + los creados por la persona): el registro va siempre por el
   ejercicio que de verdad se hizo. Apunta cada serie, propone subir peso con doble progresión,
   lleva el descanso y la duración de la sesión, el deporte aparte, la rodilla si el plan lo
   pide, y una ficha de ayuda por ejercicio con foto de la máquina. */

const BASE = window.PLAN;
// P es el plan en uso (lo arma construirPlan con los días que elige la persona); DIA, todos los
// días que se conocen, estén o no en la rotación, para el historial.
let P = BASE, DIA = Object.fromEntries(BASE.dias.map(d => [d.id, d])), enElPlan = new Set();
const LIBRE = { id: "libre", nombre: "Entreno libre", titulo: "Tú eliges los ejercicios", calentamiento: [], ejercicios: [] };
const diaDef = d => DIA[d?.diaPlan] || (d?.diaPlan === "libre" ? LIBRE : null);
const DEPORTES = ["Pádel", "Correr", "Bici", "Natación", "Fútbol", "Caminar", "Montaña", "Otro"];
const ZONA_A_MUSCULO = { Pecho: "pecho", Espalda: "dorsal", Hombro: "hombro", "Bíceps": "biceps", "Tríceps": "triceps", Pierna: "cuadriceps", "Glúteo": "gluteo", Gemelo: "gemelo", Core: "abdomen", Estabilidad: "cuerpo", Cardio: "cardio", Movilidad: "cuerpo" };

/* ---------- Catálogo ----------
   Ficha de cada ejercicio = catálogo base (músculos, variantes con su aparato, ayuda) + lo que
   diga el plan para ese id (nombre, pauta, nota). Los creados por la persona viven en sus ajustes. */
const CAT_FIJO = {};
for (const e of window.CATALOGO_BASE) CAT_FIJO[e.id] = { ...e };
for (const d of BASE.dias) for (const e of d.ejercicios) {
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
const TIPO_CORTO = { maquina: "Máquina", discos: "Discos", polea: "Polea", mancuernas: "Mancuernas", barra: "Barra", banco: "Banco y suelo", funcional: "Funcional", cardio: "Cardio" };
const nombreMusculos = e => (e.m || []).map(x => MUSCULOS[x]?.n).filter(Boolean).join(", ");
const zonaDe = e => MUSCULOS[e.m?.[0]]?.n || e.zona || "";
const ejerciciosCon = ap => todos().filter(e => e.variantes.some(v => v.ap === ap));
// Clave de la foto de una variante: la del aparato (compartida); si no tiene, la del ejercicio.
const claveFoto = (e, v) => variante(e, v)?.ap || e.id;

/* ---------- Lo que hay en el lugar ----------
   Con un lugar limitado (LUGARES[…].aparatos o soloConFoto) solo se proponen las variantes que
   se pueden hacer allí, y el ejercicio del plan que no se puede hacer se cambia solo por otro del
   mismo músculo; si no hay ninguno, ese día no se propone. El registro es uno solo: la última vez, la progresión, los récords y la semana
   cuentan igual entrene donde entrene. */
const disponible = v => !v?.ap || hayAparato(v.ap);
const sePuedeAqui = e => !!e && variantes(e).some(disponible);
const primeraAqui = e => Math.max(0, variantes(e).findIndex(disponible));
function alternativa(e, evitar) {
  const mismo = c => c.m[0] === e.m[0] ? 2 : c.m.includes(e.m[0]) ? 1 : 0;
  const puntos = c => mismo(c) * 4 + (c.tipo === e.tipo ? 2 : 0) + ((c.unidad || "") === (e.unidad || "") && !!c.sinPeso === !!e.sinPeso ? 1 : 0)
    + (esFav(c.id) ? 2.5 : 0) + (variantes(c).some(v => apFav(v.ap) && disponible(v)) ? 1 : 0);
  return todos().filter(c => !evitar.has(c.id) && mismo(c) && sePuedeAqui(c)).sort((a, b) => puntos(b) - puntos(a))[0] || null;
}

/* ---------- Plan a medida ----------
   La persona elige cuántos días de fuerza y de cardio quiere a la semana y sus favoritos
   (ejercicios y máquinas). El plan se arma con planes/plantillas.js: cada hueco toma su primer
   candidato, salvo que un favorito encaje (mismo grupo muscular y tipo) o un candidato se haga
   en una máquina favorita. Los favoritos que no caben en ningún hueco entran como extra
   opcional en el día que más se les parece. Sin azar: con los mismos ajustes sale el mismo plan,
   para que la progresión tenga hilo. Los cambios fijos de cada hueco siguen mandando. */
const PL = window.PLANTILLAS;
const favoritos = tipo => Datos.ajustes.favoritos?.[tipo] || [];
const esFav = id => favoritos("ej").includes(id);
const apFav = ap => !!ap && favoritos("ap").includes(ap);
const conApFav = e => variantes(e).some(v => apFav(v.ap));
const slotDe = pe => pe.slot || pe.id;
function objetivos() {
  const a = Datos.ajustes, gym = Number(a.diasGym) || BASE.dias.length, cardio = Number(a.diasCardio) || 0;
  return { gym, cardio, total: gym + cardio };
}
const grupoDe = m => FILTROS_MUSCULO.find(f => f[1].includes(m))?.[1] || [m];
const ZONA_PIERNA = ["cuadriceps", "isquios", "gluteo", "gluteo-medio", "aductores", "gemelo"], ZONA_CORE = ["abdomen", "oblicuos", "lumbar"];
const zonaCuerpo = m => ZONA_PIERNA.includes(m) ? "pierna" : ZONA_CORE.includes(m) ? "core" : m === "cardio" || m === "cuerpo" ? m : "torso";
const mismaMedida = (a, b) => (a.unidad || "") === (b.unidad || "") && !!a.sinPeso === !!b.sinPeso && !!a.porLado === !!b.porLado;
// El ejercicio de un hueco: el primer candidato, o un favorito o uno con máquina favorita que encaje.
function elegirHueco(h, enDia) {
  const base = cat(h.ej[0]); if (!base) return h.ej[0];
  const g = grupoDe(base.m[0]);
  const ids = [...new Set([...h.ej.filter(cat), ...todos().filter(e => g.includes(e.m[0]) && e.tipo === h.tipo && (esFav(e.id) || conApFav(e))).map(e => e.id)])];
  // Un favorito gana siempre; una máquina favorita empata con el candidato preferido (y en el
  // empate manda el plan): lo normal es que el mismo ejercicio se proponga en esa máquina.
  const puntos = id => (esFav(id) ? 10 : 0) + (conApFav(cat(id)) ? 4 : 0) + (h.ej.includes(id) ? Math.max(1, 5 - h.ej.indexOf(id)) : 0);
  return ids.filter(id => !enDia.has(id)).sort((a, b) => puntos(b) - puntos(a))[0] || h.ej[0];
}
// Lo que se apunta en el plan: con otro ejercicio de distinta medida, su propia pauta del catálogo.
function entradaPlan(h, id, slot) {
  const { ej, nombre, nota, id: _, slot: __, ...pauta } = h;
  if (id === ej[0] || mismaMedida(pauta, cat(id))) return { ...pauta, id, slot };
  const { seccion, superserie, opcional, rodilla } = pauta;
  return JSON.parse(JSON.stringify({ id, slot, seccion, superserie, opcional, rodilla }));
}
function construirPlan() {
  if (!PL) return;
  const n = Math.min(6, Math.max(1, objetivos().gym));
  const defs = { ...PL.dias, cardio: PL.cardio };
  for (const d of BASE.dias) defs[d.id] = { ...d, huecos: d.ejercicios.map(e => ({ ...e, ej: [e.id], slot: e.id })) };
  const armar = (id, nombre) => {
    const { huecos: hs, ejercicios: _, ...def } = defs[id], enDia = new Set();
    const ejercicios = hs.map((h, i) => { const ex = elegirHueco(h, enDia); enDia.add(ex); return entradaPlan(h, ex, h.slot || `${id}-${i + 1}`); });
    return { ...def, id, nombre, ejercicios };
  };
  DIA = Object.fromEntries(Object.keys(defs).map(id => [id, armar(id, id === "cardio" ? defs[id].nombre : defs[id].titulo)]));
  const rot = PL.semanas[n].map((id, i) => (DIA[id] = armar(id, `Día ${i + 1}`)));
  // Favoritos sin hueco (y máquinas favoritas que ningún ejercicio del plan usa): extra opcional.
  const usa = ap => rot.some(d => d.ejercicios.some(pe => variantes(cat(pe.id) || {}).some(v => v.ap === ap)));
  const quiere = [...favoritos("ej"), ...favoritos("ap").filter(ap => AP[ap] && AP[ap].tipo !== "cardio" && !usa(ap)).map(ap => ejerciciosCon(ap)[0]?.id)];
  for (const id of new Set(quiere)) {
    const e = cat(id);
    if (!e || e.oculto || e.m[0] === "cardio" || rot.some(d => d.ejercicios.some(pe => pe.id === id))) continue;
    const parecido = d => d.ejercicios.reduce((s, pe) => { const m = cat(pe.id)?.m[0]; return s + (m === e.m[0] ? 3 : zonaCuerpo(m) === zonaCuerpo(e.m[0]) ? 1 : 0); }, 0);
    const extras = d => d.ejercicios.filter(pe => pe.slot.startsWith("fav-")).length;
    const dia = rot.filter(d => extras(d) < 2).sort((a, b) => parecido(b) - parecido(a) || extras(a) - extras(b))[0];
    if (dia) dia.ejercicios.push({ id, slot: `fav-${id}`, seccion: "★ Favorito", opcional: true, rodilla: false });
  }
  const o = objetivos();
  P = { ...BASE, nombre: `Plan de ${n} día${n > 1 ? "s" : ""} de fuerza${o.cardio ? ` y ${o.cardio} de cardio` : ""}`, dias: rot };
  enElPlan = new Set([...rot, DIA.cardio].flatMap(d => d.ejercicios.map(pe => pe.id)));
}
// Semana orientativa: los días de entreno repartidos de lunes a domingo, alternando fuerza y cardio.
function semanaTipo() {
  const o = objetivos(), t = Math.min(7, o.total), dias = Array(7).fill("");
  let f = o.gym, c = o.cardio, ult = "";
  for (let i = 0; i < t; i++) {
    const toca = c > 0 && (f <= 0 || c > f || ult === "F") ? "C" : "F";
    dias[Math.floor(i * 7 / t)] = toca; if (toca === "F") f--; else c--; ult = toca;
  }
  return dias;
}

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
  const plan = { ...cat(pe.id), ...pe }, c = cat(exId);
  if (exId === pe.id || !c) return plan;
  const misma = (c.unidad || "") === (plan.unidad || "") && !!c.sinPeso === !!plan.sinPeso;
  const pautaPlan = misma ? { series: plan.series, seriesOpcionales: plan.seriesOpcionales, reps: plan.reps, tipo: plan.tipo } : {};
  return { ...c, ...pautaPlan, seccion: pe.seccion, superserie: pe.superserie, opcional: pe.opcional, rodilla: pe.rodilla };
}
function huecos(d) {
  const dia = diaDef(d); if (!dia) return [];
  const out = [], restringido = lugarLimitado();
  out.noAqui = [];   // ejercicios del plan que aquí no se pueden hacer ni cambiar por otro
  const evitar = new Set([...dia.ejercicios.map(pe => pe.id), ...Object.values(d.cambios || {}), ...Object.values(Datos.ajustes.sustituciones || {}), ...(d.extras || [])]);
  for (const pe of dia.ejercicios) {
    const slot = slotDe(pe);
    if (d.quitados?.includes(slot)) continue;
    const hoy = d.cambios?.[slot], siempre = Datos.ajustes.sustituciones?.[slot];
    let exId = (hoy && cat(hoy)) ? hoy : (siempre && cat(siempre)) ? siempre : pe.id, porLugar = false;
    // Lo elegido hoy a mano se respeta; lo demás, si aquí no se puede hacer, se cambia solo.
    if (restringido && exId !== hoy && !sePuedeAqui(cat(exId))) {
      const alt = alternativa(cat(exId), evitar);
      if (alt) { exId = alt.id; porLugar = true; evitar.add(alt.id); }
    }
    if (restringido && exId !== hoy && !sePuedeAqui(cat(exId)) && !empezado(d, exId)) { out.noAqui.push(cat(pe.id)?.nombre || pe.id); continue; }
    out.push({ slot, e: prescripcion(pe, exId), original: { ...cat(pe.id), ...pe }, cambiado: exId !== pe.id, cambioHoy: exId === hoy && exId !== pe.id, porLugar, sinAparato: restringido && !sePuedeAqui(cat(exId)) });
  }
  for (const id of d.extras || []) { const c = cat(id); if (c) out.push({ slot: "x:" + id, e: { ...c, seccion: zonaDe(c) }, extra: true }); }
  // Lo ya apuntado hoy que no está en ningún hueco (se cambió el plan o el día a mitad): se sigue viendo.
  const vistos = new Set(out.map(h => h.e.id));
  for (const [id, x] of Object.entries(d.ej || {})) { const c = cat(id); if (c && !vistos.has(id) && x.series.some(s => s.hecho)) out.push({ slot: "x:" + id, e: { ...c, seccion: zonaDe(c) }, extra: true }); }
  return out;
}
const enUso = d => new Set(huecos(d).map(h => h.e.id));

/* ---------- Días ---------- */
const hizoGym = d => !!d && !d.nuevo && Object.values(d.ej || {}).some(x => x.series.some(s => s.hecho));
const minDeporte = d => (d?.deporte || []).reduce((s, x) => s + (Number(x.min) || 0), 0);
const diaActivo = d => !!d && !d.nuevo && (hizoGym(d) || minDeporte(d) > 0);
// Un día cuenta como fuerza si se hizo algo del gimnasio que no fuera la sesión de cardio; el
// resto de días con actividad (sesión de cardio o deporte por fuera) cuentan como cardio.
const esFuerza = d => hizoGym(d) && d.diaPlan !== "cardio";
// El día que toca es el siguiente al último del plan que se entrenó, no depende del día de la semana.
function siguienteDia(k) {
  const prev = Object.keys(Datos.dias).filter(x => x < k && esFuerza(Datos.dias[x]) && DIA[Datos.dias[x].diaPlan]).sort().pop();
  const i = prev ? P.dias.findIndex(d => d.id === Datos.dias[prev].diaPlan) : -1;
  return P.dias[(i + 1) % P.dias.length].id;
}
// ¿Toca cardio? Según lo que falte esta semana: alterna fuerza y cardio mientras falten los dos.
function tocaCardio(k) {
  const o = objetivos(); if (!o.cardio || !DIA.cardio) return false;
  const lunes = claveFecha(lunesDe(deClave(k)));
  const antes = Object.keys(Datos.dias).filter(x => x >= lunes && x < k && diaActivo(Datos.dias[x])).sort();
  const fuerza = antes.filter(x => esFuerza(Datos.dias[x])).length;
  const faltaF = o.gym - fuerza, faltaC = o.cardio - (antes.length - fuerza);
  if (faltaC <= 0) return false;
  if (faltaF <= 0 || faltaC > faltaF) return true;
  return !!antes.length && esFuerza(Datos.dias[antes[antes.length - 1]]);
}
function diaDe(k) {
  if (!Datos.dias[k]) Datos.dias[k] = { fecha: k, ej: {}, calent: [], deporte: [], rodilla: null, nota: "", nuevo: true, ...(lugares().length ? { lugar: lugarId() } : {}) };
  const d = Datos.dias[k];
  if (d.nuevo) d.diaPlan = tocaCardio(k) ? "cardio" : siguienteDia(k);
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
    // Repite la variante de la última vez que se hizo este ejercicio (mejor, en este mismo lugar),
    // salvo que haya otra en una máquina favorita que se pueda usar aquí.
    const antes = Object.keys(Datos.dias).filter(k => k < d.fecha && Datos.dias[k].ej?.[e.id]?.series.some(s => s.hecho)).sort();
    const prev = antes.filter(k => lugarDe(k) === lugarId()).pop() || antes.pop();
    const v0 = prev ? Datos.dias[prev].ej[e.id].v : -1, vs = variantes(e);
    const vale = i => i >= 0 && i < vs.length && disponible(vs[i]), fav = vs.findIndex(v => apFav(v.ap) && disponible(v));
    d.ej[e.id] = { v: vale(v0) && (fav < 0 || apFav(vs[v0].ap)) ? v0 : fav >= 0 ? fav : primeraAqui(e), series: [], rodilla: false };
  }
  const x = d.ej[e.id];
  // Si se cambió de lugar antes de empezar, pasa a una variante que haya aquí.
  if (!x.series.some(s => s.hecho) && !disponible(variante(e, x.v))) x.v = primeraAqui(e);
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
  // Tras un parón largo no se sube: primero, volver a coger el ritmo.
  const parado = Math.round((deClave(k) - deClave(u.k)) / 864e5);
  if (parado >= 21) return { tipo: "manten", texto: `Hace ${Math.floor(parado / 7)} semanas de la última vez: empieza con el mismo peso o algo menos y ve viendo.` };
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
  const semanas = ultimasSemanas(n).map(w => ({ ...w, gym: 0, cardio: 0, volumen: 0, minDep: 0 }));
  for (const [k, d] of Object.entries(Datos.dias)) {
    const w = semanaDe(semanas, k);
    if (!w || !diaActivo(d)) continue;
    if (esFuerza(d)) w.gym++; else w.cardio++;
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
  const obj = objetivos().total;
  const semanas = resumenSemanas(104);
  let r = 0, i = semanas.length - 1;
  if (semanas[i].gym + semanas[i].cardio < obj) i--;
  for (; i >= 0 && semanas[i].gym + semanas[i].cardio >= obj; i--) r++;
  return r;
}

/* ---------- Récords, cromos y ánimos ---------- */
// Cómo se mide la mejor marca: kilos (y a igual peso, repeticiones), menos ayuda en las
// asistidas, o repeticiones/segundos en los de sin peso.
const modoMarca = (e, x) => variante(e, x.v).asistido ? "ayuda" : e.sinPeso ? "reps" : "peso";
// Una serie cuenta para las marcas si tiene lo que se mide (kilos y repeticiones, o repeticiones).
const valida = (modo, s) => (num(s.reps) || 0) > 0 && (modo === "reps" || num(s.peso) != null);
function mejorQue(modo, a, b) {
  const pa = num(a.peso), pb = num(b.peso), ra = num(a.reps) || 0, rb = num(b.reps) || 0;
  if (modo === "reps") return ra > rb;
  if (pa == null || ra <= 0) return false;
  if (pb == null) return true;
  return (modo === "ayuda" ? pa < pb : pa > pb) || (pa === pb && ra > rb);
}
// Mejor serie de un ejercicio y variante en los días que pasen el filtro (sin contar `excluir`).
function mejorMarca(e, v, filtro = () => true, excluir = null) {
  const modo = modoMarca(e, { v }); let mejor = null;
  for (const k of Object.keys(Datos.dias).sort()) {
    const x = Datos.dias[k].ej?.[e.id];
    if (!filtro(k) || !x || x.v !== v) continue;
    for (const s of x.series) if (s.hecho && s !== excluir && valida(modo, s) && (!mejor || mejorQue(modo, s, mejor.s))) mejor = { s, k };
  }
  return mejor;
}
function textoMarca(e, v, s) {
  const modo = modoMarca(e, { v });
  if (modo === "reps") return `${s.reps} ${uRep(e)}${e.porLado ? " por lado" : ""}`;
  return `${fmt(s.peso)} kg${modo === "ayuda" ? " de ayuda" : ""} × ${s.reps}`;
}
// Álbum: un cromo por máquina. Se consigue al entrenar con ella (o al hacerle una foto) y es
// dorado cuando tiene foto real, la tuya o la del gimnasio.
function cromos() {
  const desde = {};
  for (const k of Object.keys(Datos.dias).sort()) for (const [id, x] of Object.entries(Datos.dias[k].ej || {})) {
    const e = cat(id), ap = e && variante(e, x.v)?.ap;
    if (ap && !desde[ap] && x.series.some(s => s.hecho)) desde[ap] = k;
  }
  return APARATOS.map(a => ({ a, desde: desde[a.id] || (Fotos.url[a.id] ? "foto" : ""), dorado: !!fotoReal(a.id) }));
}
// Los cromos del lugar actual (en un sitio con pocas máquinas, solo las suyas).
const cromosAqui = () => cromos().filter(c => hayAparato(c.a.id));
function sesionCompleta(d) {
  const obligados = huecos(d).filter(h => !h.e.opcional);
  return obligados.length > 0 && obligados.every(h => d.ej[h.e.id]?.series.slice(0, obligatorias(h.e)).every(s => s.hecho));
}
const seriesPendientes = d => huecos(d).filter(h => !h.e.opcional)
  .reduce((n, h) => n + (d.ej[h.e.id] ? d.ej[h.e.id].series.slice(0, obligatorias(h.e)).filter(s => !s.hecho).length : obligatorias(h.e)), 0);
// Lo que hay que saber antes de marcar una serie para celebrar lo que cambie al marcarla.
function antesDeSerie(d, e, x) {
  const ap = variante(e, x.v)?.ap;
  return { primera: !hizoGym(d), completa: sesionCompleta(d), apNuevo: ap && AP[ap] && !cromos().find(c => c.a.id === ap)?.desde ? ap : "" };
}
function celebrarSerie(d, e, x, s, antes) {
  const n = nombreVisible(), msgs = [];
  if (antes.primera) {
    const ultimo = Object.keys(Datos.dias).filter(k => k < HOY && hizoGym(Datos.dias[k])).sort().pop();
    const dias = ultimo ? Math.round((deClave(HOY) - deClave(ultimo)) / 864e5) : null;
    if (dias == null) msgs.push(`💪 ¡Primer entreno apuntado, ${n}! Empieza la cuenta.`);
    else if (dias >= 7) msgs.push(`💪 ¡De vuelta, ${n}! Lo difícil era volver. Hoy con calma: mejor quedarse corto que pasarse.`);
  }
  const hist = mejorMarca(e, x.v, k => k < HOY), todo = mejorMarca(e, x.v, () => true, s);
  if (hist && todo && mejorQue(modoMarca(e, x), s, todo.s)) msgs.push(`🏆 ¡Nuevo récord! ${nombreCompleto(e, x.v)}: ${textoMarca(e, x.v, s)}`);
  if (antes.apNuevo) { const cs = cromosAqui(); msgs.push(`🃏 Nuevo cromo: ${AP[antes.apNuevo].nombre} (${cs.filter(c => c.desde).length} de ${cs.length})`); }
  if (!antes.completa && sesionCompleta(d)) {
    const obj = objetivos().total, sem = resumenSemanas(1)[0], hechos = sem.gym + sem.cardio, racha = rachaSemanas();
    msgs.push(hechos === obj ? `🎉 ¡Semana cumplida, ${n}! ${hechos} de ${obj}${racha > 1 ? ` · ${racha} semanas seguidas` : ""}`
      : hechos > obj ? `🎉 ¡Sesión completa! Y van ${hechos} esta semana: de sobresaliente.` : `🎉 ¡Sesión completa! Llevas ${hechos} de ${obj} esta semana.`);
    confeti();
  } else if (seriesPendientes(d) === 1) msgs.push(`🔥 Última serie del día, ${n}. ¡A por ella!`);
  if (msgs.length) vibrar();
  msgs.forEach(t => aviso(t, "celebra"));
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
  const o = objetivos();
  const sem = resumenSemanas(1)[0], hechos = sem.gym + sem.cardio;
  const racha = rachaSemanas();
  const dia = diaDef(d);
  // Un punto por día: los de fuerza llenos y los de cardio en el otro color.
  const puntos = (n, hechos, clase) => Array.from({ length: Math.max(n, hechos) }, (_, i) => `<i class="${clase} ${i < hechos ? "hecho" : ""}"></i>`).join("");
  let h = `<div class="wrap" style="padding:0">
    ${Datos.ajustes.planHecho ? "" : htmlTuPlan(true)}
    <section class="card semana" aria-label="Esta semana">
      <div class="puntos" aria-hidden="true">${puntos(o.gym, sem.gym, "fuerza")}${puntos(o.cardio, sem.cardio, "cardio")}</div>
      <div><b class="num grande">${hechos} de ${o.total}</b> <span class="muted">entrenos esta semana</span>
      ${o.cardio ? `<div class="small muted">Fuerza <b>${sem.gym} de ${o.gym}</b> · Cardio <b>${sem.cardio} de ${o.cardio}</b></div>` : ""}
      <div class="small muted">${racha ? `Racha: <b>${racha} semana${racha > 1 ? "s" : ""}</b> cumpliendo` : "Cumple el objetivo esta semana para empezar la racha"}</div></div>
    </section>
    <section class="card" aria-labelledby="t-toca">
      <h2 id="t-toca">Hoy toca</h2>${htmlLugares()}
      <div class="chips cinco" role="group" aria-label="Qué entrenas hoy">
        ${P.dias.map(x => `<button class="chip" data-diaplan="${x.id}" aria-pressed="${d.diaPlan === x.id}"><b>${esc(x.nombre)}</b><span class="small">${esc(x.titulo)}</span></button>`).join("")}
        ${DIA.cardio ? `<button class="chip cardio" data-diaplan="cardio" aria-pressed="${d.diaPlan === "cardio"}"><b>Cardio</b><span class="small">${esc(cat(DIA.cardio.ejercicios[0].id)?.nombre || DIA.cardio.titulo)}</span></button>` : ""}
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
  const pos = P.dias.findIndex(x => x.id === dia.id), siguiente = pos >= 0 ? P.dias[(pos + 1) % P.dias.length].nombre : "";
  let h = `<section class="card" aria-labelledby="t-sesion">
    <div class="top"><h2 id="t-sesion">${esc(dia.nombre)} · ${esc(dia.titulo)}</h2>${total ? `<span class="num" style="font-size:1.4rem">${hechas}/${total}</span>` : ""}</div>
    ${total ? `<div class="progreso-dia" aria-hidden="true"><i style="width:${pct}%"></i></div>` : ""}
    <p class="small muted" style="margin:0"><span id="crono">${d.inicio ? "" : "El cronómetro arranca con la primera serie"}</span>${dia.id === "cardio" ? "" : ` · objetivo ~${P.duracionMin} min. Descansos: ${esc(P.textoDescansos)}`}</p>
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
  const quitados = (d.quitados || []).map(slot => dia.ejercicios.find(pe => slotDe(pe) === slot)).filter(Boolean).map(pe => ({ ...cat(pe.id), slot: slotDe(pe) }));
  h += `<div class="fila"><button class="btn sec" data-anadir>+ Añadir ejercicio</button></div>`;
  if (hs.noAqui?.length) h += `<p class="small muted" style="margin:0">Hoy no se propone${hs.noAqui.length > 1 ? "n" : ""} ${esc(hs.noAqui.join(", "))}: en ${esc(lugar().corto)} no hay con qué hacerlo${hs.noAqui.length > 1 ? "s" : ""} ni otro parecido.</p>`;
  if (quitados.length) h += `<p class="small muted" style="margin:0">Quitados hoy: ${quitados.map(e => `${esc(e.nombre)} <button class="enlace" data-recuperar="${e.slot}">recuperar</button>`).join(" · ")}</p>`;
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
  if (hueco.porLugar) origen = `<p class="small muted" style="margin:0">En ${esc(lugar().corto)} no hay con qué hacer ${esc(hueco.original.nombre)}: hoy toca este${bloqueado ? "" : ` · <button class="enlace" data-cambiar="${slot}">elegir otro</button>`}</p>`;
  else if (hueco.sinAparato) origen = `<p class="aviso small" style="margin:0">En ${esc(lugar().corto)} no hay con qué hacerlo. Cámbialo o quítalo hoy.</p>`;
  else if (hueco.cambiado) origen = `<p class="small muted" style="margin:0">En lugar de ${esc(hueco.original.nombre)}${hueco.cambioHoy ? " (solo hoy)" : " (cambio fijo)"}${bloqueado ? "" : ` · <button class="enlace" data-revertir="${slot}">volver al del plan</button>`}</p>`;
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
  // Solo las variantes que se pueden hacer aquí (y la ya empezada, aunque no).
  const aqui = vs.map((v, i) => ({ v, i })).filter(o => disponible(o.v) || (bloqueado && x.v === o.i));
  if (aqui.length > 1) h += `<div class="variantes" role="group" aria-label="Con qué lo haces">${aqui.map(({ v, i }) => `<button class="chip var" data-var="${e.id}" data-v="${i}" aria-pressed="${x.v === i}" ${bloqueado && x.v !== i ? "disabled" : ""}>${v.ap ? fotoAp(v.ap) : ""}<span>${esc(v.n)}</span></button>`).join("")}</div>`;
  else if (aqui[0]?.v.ap) h += `<button class="ap-linea" data-aparato="${aqui[0].v.ap}">${fotoAp(aqui[0].v.ap)}<span>${esc(AP[aqui[0].v.ap]?.nombre || aqui[0].v.n)}</span></button>`;
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
    ${lista.length ? `<div class="historial">${lista.map((x, i) => `<div class="hist"><span><b>${esc(x.tipo)}</b> · ${esc(x.min)} min</span><button class="enlace" data-deldep="${i}" aria-label="Quitar ${esc(x.tipo)}">Quitar</button></div>`).join("")}</div>` : `<p class="small muted" style="margin:0">Pádel, correr, bici… cuenta como día de cardio de la semana.</p>`}
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
  const obj = objetivos().total;
  const claves = Object.keys(Datos.dias).filter(k => diaActivo(Datos.dias[k])).sort();
  const semanas = resumenSemanas(8), actual = semanas[semanas.length - 1];
  const sesiones = claves.filter(k => hizoGym(Datos.dias[k])).length;
  let h = `<div class="wrap" style="padding:0">
    <div class="tiles">
      <div class="tile"><span class="eyebrow">Racha</span><span class="num">${rachaSemanas()}</span><span>semanas cumpliendo</span></div>
      <div class="tile"><span class="eyebrow">Semana</span><span class="num">${actual.gym + actual.cardio}/${obj}</span><span>entrenos</span></div>
      <div class="tile"><span class="eyebrow">Gimnasio</span><span class="num">${sesiones}</span><span>sesiones en total</span></div>
    </div>`;
  if (!claves.length) {
    $("#vista").innerHTML = h + `<section class="card"><h2>Aquí verás tu progreso</h2><p class="muted">Cuando marques series o apuntes deporte en <b>Hoy</b>, aparecerán aquí tus semanas, cómo suben los kilos en cada ejercicio y el historial.</p></section></div>`;
    return;
  }
  h += `<section class="card"><h2>Entrenos por semana</h2>
    ${graficoBarras(semanas.map(w => ({ etiqueta: fechaCorta(w.inicio), partes: [{ v: w.gym, color: "var(--accent)" }, { v: w.cardio, color: "var(--sec)" }] })), { meta: obj, etiquetaAria: "Entrenos por semana en las últimas 8 semanas" })}
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
  // Mejores marcas, las más recientes primero.
  const records = opciones.map(o => ({ o, m: mejorMarca(o.e, o.v) })).filter(x => x.m).sort((a, b) => b.m.k.localeCompare(a.m.k)).slice(0, 8);
  if (records.length) h += `<section class="card"><h2>Tus récords</h2><div class="historial">${records.map(({ o, m }) => `<div class="hist"><span>🏆 ${esc(nombreCompleto(o.e, o.v))}</span><span class="num">${esc(textoMarca(o.e, o.v, m.s))} <span class="muted small">${fechaCorta(deClave(m.k))}</span></span></div>`).join("")}</div></section>`;

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
    if (hizoGym(d)) partes.push(`${diaDef(d)?.nombre || "Gimnasio"}${lugares().length > 1 ? ` · ${LUGARES[lugarDe(k)].corto}` : ""}${d.inicio && d.ultima ? ` · ${Math.max(1, Math.round((d.ultima - d.inicio) / 60e3))} min` : ""}`);
    for (const x of d.deporte || []) partes.push(`${x.tipo} ${x.min} min`);
    return `<div class="hist"><span>${fechaLarga(deClave(k))}</span><span class="muted">${esc(partes.join(" · "))}</span></div>`;
  }).join("")}</div></section></div>`;
  $("#vista").innerHTML = h;
}

/* ---------- Listas de ejercicios (buscador y filtros) ---------- */
// El filtro de músculo mira el principal: "Bíceps" da curls, no jalones.
// Los favoritos (o los que se hacen en una máquina favorita) salen antes en las listas.
const favorito = e => esFav(e.id) ? 2 : conApFav(e) ? 1 : 0;
function filtrar({ q = "", musc = "", mat = "", excluir = new Set(), primero = [], aqui = false }) {
  const t = sinAcentos(q).trim();
  const grupo = FILTROS_MUSCULO.find(f => f[0] === musc)?.[1];
  return todos()
    .filter(e => !excluir.has(e.id)
      && (!aqui || sePuedeAqui(e))
      && (!grupo || grupo.includes(e.m[0]))
      && (!mat || e.variantes.some(v => AP[v.ap]?.tipo === mat && (!aqui || disponible(v))))
      && (!t || sinAcentos(`${e.nombre} ${nombreMusculos(e)} ${e.variantes.map(v => `${v.n} ${AP[v.ap]?.nombre || ""}`).join(" ")}`).includes(t)))
    .sort((a, b) => primero.includes(b.m[0]) - primero.includes(a.m[0]) || favorito(b) - favorito(a) || a.nombre.localeCompare(b.nombre, "es"));
}
function htmlLista(lista, accion) {
  if (!lista.length) return `<p class="muted small" style="margin:0">No hay ninguno así. Prueba con otro filtro o créalo abajo.</p>`;
  return lista.map(e => {
    const n = sesionesDe(e.id).length;
    const tipos = [...new Set(e.variantes.map(v => AP[v.ap]?.tipo).filter(Boolean))];
    return `<button class="item" data-${accion}="${e.id}">
      ${iconoMusculo(e.m, { clase: "musculo item-ico" })}
      <span class="item-txt"><b>${esFav(e.id) ? "★ " : ""}${esc(e.nombre)}</b><span class="small muted">${esc(nombreMusculos(e))}${enElPlan.has(e.id) ? " · en tu plan" : ""}${e.propio ? " · creado por ti" : ""}${n ? ` · ${n} ${n > 1 ? "sesiones" : "sesión"}` : ""}</span>
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
function abrirAyuda(id) { abrirFicha("ayuda", id); evento("gim-ficha-abierta"); }
function abrirAparato(ap) { abrirFicha("aparato", ap); evento("gim-ficha-abierta"); }

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
  return htmlLista(filtrar({ ...Sel, excluir: enUso(d), primero: hueco?.e.m || [], aqui: true }), "elegir");
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
function añadirExtra(d, id) { d.extras = [...(d.extras || []), id]; if (!d.diaPlan) d.diaPlan = "libre"; tocar(HOY); evento("gim-plan-adaptado"); }
// Estadísticas: primer registro del día y sesión completa (todas las series obligatorias hechas).
function contarEntreno(d) {
  eventoDelDia("gim-entreno-empezado");
  if (sesionCompleta(d)) eventoDelDia("gim-entreno-completo");
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
    ${botonFav("ej", id)}
    <div class="ficha-top">${iconoMusculo(e.m, { clase: "musculo grande" })}
      <div class="ficha-txt"><p style="margin:0"><b>Trabaja:</b> ${esc(nombreMusculos(e))}</p>
      <p class="small muted" style="margin:0">Pauta habitual: ${pauta(e)} · descanso ${descansoDe(e)} s</p></div></div>
    <div><h3>${va.ap ? esc(AP[va.ap]?.nombre) : "Foto"}</h3>${vs.length > 1 ? `<p class="small muted" style="margin:0 0 6px">Variante: ${esc(va.n)}</p>` : ""}</div>
    ${htmlFoto(clave, va.ap ? AP[va.ap]?.nombre : e.nombre)}
    ${va.ap ? `<p class="small muted" style="margin:0">La foto es de la máquina: sale en todos los ejercicios que la usan.</p>` : ""}
    ${vs.length > 1 ? `<div><h3>Con qué más se puede hacer</h3><div class="lista">${vs.map((v, i) => i === vAct ? "" : `<button class="item" ${v.ap ? `data-aparato="${v.ap}"` : "disabled"}>${v.ap ? fotoAp(v.ap, "item-foto") : `<span class="item-foto sin-foto"></span>`}<span class="item-txt"><b>${esc(v.n)}</b><span class="small muted">${esc(AP[v.ap]?.nombre || "")}${v.ap && !hayAparato(v.ap) ? ` · no hay en ${esc(lugar().corto)}` : v.ap && !fotoReal(v.ap) ? " · sin foto real" : ""}</span></span></button>`).join("")}</div></div>` : ""}
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
    ${botonFav("ap", ap)}
    ${htmlFoto(ap, a.nombre)}
    ${a.nota ? `<p class="nota">${esc(a.nota)}</p>` : ""}
    ${(c => c?.desde ? `<p class="small" style="margin:0">🃏 Cromo conseguido${c.desde !== "foto" ? ` el ${fechaCorta(deClave(c.desde))}` : ""}${c.dorado ? " · dorado ★" : " · con una foto real será dorado"}.</p>` : `<p class="small muted" style="margin:0">🃏 Cromo sin conseguir: entrena con esta máquina para llevártelo.</p>`)(cromos().find(c => c.a.id === ap))}
    ${lugar()?.soloConFoto ? (FotosGym.url[ap] ? `<p class="small" style="margin:0">✓ Está en ${esc(lugar().corto)}: tiene foto del gimnasio, así que se propone.${conGH() ? ` <button class="enlace" data-quitarap="${ap}">¿No está? Proponer quitarla</button>` : ""}</p>`
      : `<p class="aviso small" style="margin:0">En ${esc(lugar().corto)} no se propone: no hay foto de esta máquina del gimnasio. Si la hay, hazle una foto y compártela.</p>`) : ""}
    <p class="small" id="msgQuitar" role="status" style="margin:0"></p>
    <p class="small muted" style="margin:0">Archivo en el repositorio: <code>fotos/${slugGym()}/${ap}.jpg</code></p>
    <label class="campo" for="notaAp"><b style="color:var(--ink)">Notas de la máquina</b><span class="small muted">Dónde está en la sala, número, peculiaridades…</span>
      <textarea id="notaAp" data-notaap="${ap}" rows="2" class="area">${esc(Datos.ajustes.notasAp?.[ap] || "")}</textarea></label>
    <div><h3>Ejercicios con ${lista.length === 1 ? "esta máquina" : `esta máquina (${lista.length})`}</h3><div class="lista">${htmlLista(lista, "ayuda")}</div></div>`;
}

HOJAS.ayuda = hojaAyuda;
HOJAS.aparato = hojaAparato;

/* ---------- Álbum de cromos ---------- */
function htmlAlbum() {
  const cs = cromosAqui(), con = cs.filter(c => c.desde).length, oro = cs.filter(c => c.desde && c.dorado).length;
  return `<section class="card" aria-labelledby="t-album">
      <div class="top"><h2 id="t-album">Álbum${lugar() ? ` de ${esc(lugar().corto)}` : " de máquinas"}</h2><span class="num" style="font-size:1.4rem">${con}/${cs.length}</span></div>
      <div class="progreso-dia" aria-hidden="true"><i style="width:${Math.round(100 * con / cs.length)}%"></i></div>
      <p class="small muted" style="margin:0">Cada máquina es un cromo: se consigue al entrenar con ella. Se vuelve <b>dorado ★</b> cuando tiene foto real: haz la de ${esc(gimnasio() || "tu gimnasio")} y compártela. Llevas <b>${oro}</b> dorado${oro === 1 ? "" : "s"}.</p>
    </section>
    <section class="card">${TIPOS_APARATO.filter(([t]) => cs.some(c => c.a.tipo === t)).map(([t, nombre]) => `<div><p class="eyebrow" style="margin:6px 0 8px">${nombre}</p><div class="album">${cs.filter(c => c.a.tipo === t).map(c => {
      const u = urlFoto(c.a.id), estado = !c.desde ? "bloqueado" : c.dorado ? "dorado" : "";
      return `<button class="cromo ${estado}" data-aparato="${c.a.id}" aria-label="${esc(c.a.nombre)}${!c.desde ? ", sin conseguir" : c.dorado ? ", dorado" : ""}">
        <span class="cromo-img">${u ? `<img src="${u}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : iconoAparato(c.a.tipo)}${!c.desde ? `<b class="cromo-candado">?</b>` : ""}</span>
        <span class="cromo-nombre">${esc(c.a.nombre)}</span>${c.dorado && c.desde ? `<span class="cromo-oro">★</span>` : ""}</button>`;
    }).join("")}</div></div>`).join("")}</section>`;
}

/* ---------- Vista: Ejercicios y máquinas ---------- */
const Lib = { vista: "ejercicios", q: "", musc: "", mat: "", todo: false };
const libAqui = () => lugarLimitado() && !Lib.todo;
function pintarEjercicios() {
  const seg = `<div class="seg" role="tablist" aria-label="Ver">
    <button role="tab" data-libvista="ejercicios" aria-selected="${Lib.vista === "ejercicios"}">Ejercicios</button>
    <button role="tab" data-libvista="maquinas" aria-selected="${Lib.vista === "maquinas"}">Máquinas</button>
    <button role="tab" data-libvista="album" aria-selected="${Lib.vista === "album"}">Álbum</button></div>`;
  if (Lib.vista === "album") { $("#vista").innerHTML = `<div class="wrap" style="padding:0">${seg}${htmlAlbum()}</div>`; return; }
  if (Lib.vista === "maquinas") {
    const apsAqui = APARATOS.filter(a => hayAparato(a.id) || (lugarLimitado() && Lib.todo));
    const delGym = apsAqui.filter(a => FotosGym.url[a.id]).length, propias = Compartir.pendientes(), mias = propias.filter(ap => !FotosGym.url[ap]).length;
    $("#vista").innerHTML = `<div class="wrap" style="padding:0">${seg}
    <section class="card" aria-labelledby="t-fotosgym">
      <h2 id="t-fotosgym">Fotos del gimnasio</h2>
      <p class="small muted" style="margin:0">${esc(gimnasio())}: <b>${delGym} de ${apsAqui.length}</b> máquinas con foto compartida. ${mias ? `Tienes <b>${mias}</b> foto${mias > 1 ? "s" : ""} nueva${mias > 1 ? "s" : ""} sin compartir.` : "Las fotos que hagas se pueden compartir para que las vean todos."}</p>
      ${FotosGym.error ? `<p class="small" style="margin:0;color:var(--warn)">No se pudo actualizar la lista: ${esc(FotosGym.error)}.</p>` : ""}
      <div class="fila">${propias.length ? `<button class="btn ${mias ? "" : "sec "}peq" data-abrircompartir>Compartir mis fotos</button>` : ""}<button class="btn sec peq" data-actualizarfotos>Actualizar</button></div>
    </section>
    <section class="card">
      <h2>Máquinas y material</h2>
      <p class="small muted" style="margin:0">Una foto por máquina sirve para todos los ejercicios que la usan.</p>
      ${lugar()?.soloConFoto ? `<p class="small muted" style="margin:0">${Lib.todo ? `Todo el catálogo. Las que no tienen foto de ${esc(lugar().corto)} no se proponen: si hay alguna, hazle una foto y compártela. <button class="enlace" data-libtodo>Solo las de ${esc(lugar().corto)}</button>`
        : `En ${esc(lugar().corto)} solo se proponen las máquinas con foto real del gimnasio. ¿Falta alguna? <button class="enlace" data-libtodo>Ver todo el catálogo</button>`}</p>` : ""}
      ${TIPOS_APARATO.filter(([t]) => apsAqui.some(a => a.tipo === t)).map(([t, n]) => `<div><p class="eyebrow" style="margin:10px 0 0">${n}</p><div class="lista">${apsAqui.filter(a => a.tipo === t).map(a => {
        const k = ejerciciosCon(a.id).length;
        return `<button class="item" data-aparato="${a.id}">${fotoAp(a.id, "item-foto")}<span class="item-txt"><b>${apFav(a.id) ? "★ " : ""}${esc(a.nombre)}</b><span class="small muted">${k} ejercicio${k === 1 ? "" : "s"}${Fotos.url[a.id] ? " · tu foto" : FotosGym.url[a.id] ? "" : " · sin foto real"}${Datos.ajustes.notasAp?.[a.id] ? " · " + esc(Datos.ajustes.notasAp[a.id]) : ""}</span></span></button>`;
      }).join("")}</div></div>`).join("")}
    </section></div>`;
    return;
  }
  $("#vista").innerHTML = `<div class="wrap" style="padding:0">${seg}<section class="card">
    <h2>Ejercicios</h2>
    <p class="small muted" style="margin:0">Elige músculo y material para ver con qué puedes trabajarlo. Toca uno para ver cómo se hace.</p>
    <input id="buscarEj" class="texto" type="search" placeholder="Buscar: prensa, polea, isquios…" value="${esc(Lib.q)}" autocomplete="off">
    ${htmlFiltros(Lib, "lib")}
    ${lugarLimitado() ? `<p class="small muted" style="margin:0">${Lib.todo ? `Todos los ejercicios del catálogo. <button class="enlace" data-libtodo>Solo lo que hay en ${esc(lugar().corto)}</button>` : `Solo lo que se puede hacer en ${esc(lugar().corto)}. <button class="enlace" data-libtodo>Ver todos</button>`}</p>` : ""}
    <div id="listaLib" class="lista">${htmlLista(filtrar({ ...Lib, aqui: libAqui() }), "ayuda")}</div>
    <button class="btn sec" data-crearlib>Crear ejercicio nuevo</button>
  </section></div>`;
  verZona();
}

/* ---------- Tu plan y favoritos ----------
   La misma tarjeta sale en Hoy la primera vez (con el nombre) y siempre en Ajustes. */
const LETRAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];
function htmlTuPlan(enHoy) {
  const o = objetivos(), semana = semanaTipo(), nf = favoritos("ej").length + favoritos("ap").length;
  const chips = (k, valores, actual, otro) => `<div class="chips dias-sem" role="group">${valores.map(n => `<button class="chip" data-${k}="${n}" aria-pressed="${n === actual}" ${n + otro > 7 ? "disabled" : ""}>${n}</button>`).join("")}</div>`;
  return `<section class="card tu-plan" aria-labelledby="t-plan">
    <h2 id="t-plan">${enHoy ? "Haz el plan a tu medida" : "Tu plan"}</h2>
    ${enHoy ? `<p class="small muted" style="margin:0">Dinos cuántos días quieres entrenar y qué te gusta más: el plan se organiza solo. Se puede cambiar cuando quieras en Ajustes.</p>
      <label class="campo" for="nombre">Tu nombre<input id="nombre" value="${esc(Datos.ajustes.nombre)}" placeholder="${esc(PERFIL.nombre || "Cómo te llamas")}" class="texto" autocomplete="given-name"></label>` : ""}
    <div class="campo"><span id="t-dg">Días de fuerza a la semana</span>${chips("diasgym", [1, 2, 3, 4, 5, 6], o.gym, o.cardio)}</div>
    <div class="campo"><span>Días de cardio a la semana <span class="muted small">(cinta, bici, elíptica, o deporte por fuera)</span></span>${chips("diascardio", [0, 1, 2, 3, 4, 5], o.cardio, o.gym)}</div>
    <div class="semana-tipo" aria-label="Semana orientativa">${semana.map((t, i) => `<span class="${t === "F" ? "f" : t === "C" ? "c" : ""}"><b>${LETRAS_SEMANA[i]}</b>${t === "F" ? "Fuerza" : t === "C" ? "Cardio" : "—"}</span>`).join("")}</div>
    <p class="small muted" style="margin:0">Semana orientativa: cada día la app propone lo que toca según lo que lleves hecho, entrenes el día que entrenes.</p>
    <div class="historial">${P.dias.map(d => `<div class="hist"><span><b>${esc(d.nombre)}</b> · ${esc(d.titulo)}</span><span class="muted small">${huecos({ diaPlan: d.id }).filter(h => !h.e.opcional).length} ejercicios</span></div>`).join("")}
      ${o.cardio && DIA.cardio ? `<div class="hist"><span><b>Cardio</b> · ${esc(cat(DIA.cardio.ejercicios[0].id)?.nombre)}</span><span class="muted small">${pauta({ ...cat(DIA.cardio.ejercicios[0].id), ...DIA.cardio.ejercicios[0] })}</span></div>` : ""}</div>
    <div class="fila"><button class="btn sec peq" data-favoritos>★ Favoritos${nf ? ` (${nf})` : ""}</button>${enHoy ? `<button class="btn peq" data-planlisto>Listo</button>` : ""}</div>
    ${nf ? "" : `<p class="small muted" style="margin:0">Marca tus ejercicios y máquinas favoritas: saldrán más a menudo en el plan.</p>`}
  </section>`;
}
const textoFavs = () => { const e = favoritos("ej").length, m = favoritos("ap").length; return e + m ? `Tienes ${e} ejercicio${e === 1 ? "" : "s"} y ${m} máquina${m === 1 ? "" : "s"} como favoritos.` : "Aún no tienes favoritos."; };
// Máquinas de los sitios donde entrena la persona (sin lugares con lista, todas).
const apsMios = () => APARATOS.filter(a => !lugares().length || lugares().some(id => hayAparato(a.id, id)));
const ejMios = () => todos().filter(e => !lugares().length || lugares().some(id => variantes(e).some(v => !v.ap || hayAparato(v.ap, id))));
function hojaFavoritos() {
  const aps = apsMios(), chip = (tipo, id, nombre) => `<button class="chip mini" data-fav="${tipo}|${id}" aria-pressed="${tipo === "ap" ? apFav(id) : esFav(id)}">${esc(nombre)}</button>`;
  return `<div class="hoja-cab"><h2>Favoritos</h2>${botonCerrar}</div>
    <p class="small muted" style="margin:0">Lo que marques sale más a menudo: el plan lo pone en el hueco que le corresponde y, si no tiene hueco, como extra opcional en el día que más se le parece. Con una máquina favorita, los ejercicios se proponen en ella.</p>
    <p class="small" id="cuentaFav" role="status" style="margin:0">${textoFavs()}</p>
    <h3>Máquinas y material</h3>
    ${TIPOS_APARATO.filter(([t]) => aps.some(a => a.tipo === t)).map(([t, n]) => `<div><p class="eyebrow" style="margin:4px 0 6px">${esc(n)}</p><div class="chips-fav">${aps.filter(a => a.tipo === t).map(a => chip("ap", a.id, a.nombre)).join("")}</div></div>`).join("")}
    <h3>Ejercicios</h3>
    ${FILTROS_MUSCULO.map(([n, ms]) => { const l = ejMios().filter(e => ms.includes(e.m[0])); return l.length ? `<div><p class="eyebrow" style="margin:4px 0 6px">${esc(n)}</p><div class="chips-fav">${l.map(e => chip("ej", e.id, e.nombre)).join("")}</div></div>` : ""; }).join("")}
    <button class="btn" data-cerrar>Hecho</button>`;
}
HOJAS.favoritos = hojaFavoritos;
// Marca o desmarca un favorito ("ej|id" o "ap|id") y rehace el plan. Devuelve si queda marcado.
function alternarFav(clave) {
  const [tipo, id] = clave.split("|"), a = Datos.ajustes, lista = favoritos(tipo), on = !lista.includes(id);
  a.favoritos = { ej: favoritos("ej"), ap: favoritos("ap"), [tipo]: on ? [...lista, id] : lista.filter(x => x !== id) };
  Datos.guardarAjustes(); construirPlan();
  if (on) evento("gim-favorito-marcado");
  return on;
}
const botonFav = (tipo, id) => { const on = tipo === "ap" ? apFav(id) : esFav(id); return `<button class="chip mini fav" data-fav="${tipo}|${id}" aria-pressed="${on}">${on ? "★ Favorito" : "☆ Marcar como favorito"}</button>`; };

/* ---------- Vista: Ajustes ---------- */
function opciones(valores, actual, sufijo = "") { return valores.map(v => `<option value="${v}" ${Number(actual) === v ? "selected" : ""}>${fmt(v)}${sufijo}</option>`).join(""); }
function pintarAjustes() {
  const a = Datos.ajustes;
  const sust = Object.entries(a.sustituciones || {}).map(([slot, id]) => {
    const dia = [...P.dias, ...Object.values(DIA)].find(d => d.ejercicios.some(pe => slotDe(pe) === slot)), pe = dia?.ejercicios.find(x => slotDe(x) === slot);
    return pe && cat(id) ? `<div class="hist"><span>${esc(dia.nombre)}: ${esc(cat(pe.id)?.nombre)} → <b>${esc(cat(id).nombre)}</b></span><button class="enlace" data-deshacersust="${slot}">Deshacer</button></div>` : "";
  }).join("");
  $("#vista").innerHTML = `<div class="wrap" style="padding:0">
    ${htmlPerfil()}
    ${htmlTuPlan(false)}
    <section class="card"><h2>Entrenamiento</h2>
      <div class="campos">
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
      ${lugarLimitado() ? `<p class="small muted" style="margin:0">Así queda en <b>${esc(lugar().nombre)}</b>: solo con lo que hay allí.</p>` : ""}
      ${[...P.dias, ...(DIA.cardio ? [DIA.cardio] : [])].map(d => { const hs = huecos({ diaPlan: d.id }); return `<details><summary><b>${esc(d.nombre)}</b> · ${esc(d.titulo)}</summary><div class="historial">${hs.map(h => {
        const e = h.e, antes = h.cambiado ? h.original.nombre : "";
        return `<div class="hist"><span>${esFav(e.id) ? "★ " : ""}${esc(e.nombre)}${antes ? ` <span class="muted small">(en lugar de ${esc(antes)}${h.porLugar ? ` en ${esc(lugar().corto)}` : ""})</span>` : ""}${e.opcional ? " (opcional)" : ""}</span><span class="muted num">${pauta(e)}</span></div>`;
      }).join("")}${hs.noAqui.length ? `<p class="small muted" style="margin:6px 0 0">No se propone${hs.noAqui.length > 1 ? "n" : ""} aquí: ${esc(hs.noAqui.join(", "))}.</p>` : ""}</div></details>`; }).join("")}
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
  const obj = objetivos().total;
  const sem = resumenSemanas(1)[0], hechos = sem.gym + sem.cardio;
  const ultimo = Object.keys(Datos.dias).filter(k => k < HOY && diaActivo(Datos.dias[k])).sort().pop();
  const sinEntrenar = ultimo ? Math.round((deClave(HOY) - deClave(ultimo)) / 864e5) : 0;
  const racha = rachaSemanas();
  if (!Datos.ajustes.planHecho && !Object.values(Datos.dias).some(diaActivo)) return `${Datos.ajustes.nombre || PERFIL.nombre ? `${n}, primero` : "Primero"}, haz el plan a tu medida: cuántos días entrenas y qué te gusta más.`;
  if (diaActivo(d)) return hechos >= obj ? `¡Hecho, ${n}! Objetivo de la semana cumplido. Ahora toca descansar.` : `¡Sesión hecha, ${n}! Agua, buena comida y a descansar.`;
  if (sinEntrenar >= 14) return `${n}, han pasado ${Math.floor(sinEntrenar / 7)} semanas. No hay nada que recuperar: con ir hoy, ya ganas.`;
  if (sinEntrenar >= 4) return `${n}, llevas ${sinEntrenar} días sin entrenar. Hoy es un buen día para volver.`;
  if (hechos >= obj) return `${n}, ya has cumplido el objetivo de la semana. Lo que hagas hoy es extra.`;
  if (racha >= 2 && new Date().getDay() === 1) return `${n}, ${racha} semanas seguidas cumpliendo. ¡A por otra!`;
  if (new Date().getDay() === 1) {
    const pasada = resumenSemanas(2)[0], hp = pasada.gym + pasada.cardio;
    if (hp) return hp >= obj ? `${n}, la semana pasada, ${hp} de ${obj}: cumplida. Esta, igual.` : `${n}, la semana pasada, ${hp} de ${obj}. Esta semana, a por ${obj}.`;
  }
  if (DIA[d?.diaPlan]?.rodilla) return fraseDelDia([`${n}, hoy toca pierna. Ni se te ocurra saltártela.`, `Día de pierna, ${n}: control, recorrido cómodo y a por ello.`]);
  return fraseDelDia(FRASES);
}

/* ---------- Eventos ---------- */
// Libretas de antes de que la de rutina fuera una para todos: se traen la primera vez (base.js).
const LIBRETAS_ANTES = [
  { clave: "cuaderno-jon", fotos: "jon", nombre: "Jon", lugares: ["vivagym-miribilla", "tekniker"] },
  { clave: "cuaderno-mikel", fotos: "mikel", nombre: "Mikel", lugares: ["vivagym-miribilla"] },
  { clave: "cuaderno-tu", fotos: "tu", nombre: "" },
];
window.App = {
  traer: LIBRETAS_ANTES,
  pestañas: [["hoy", "Hoy"], ["progreso", "Progreso"], ["ejercicios", "Ejercicios"], ["ajustes", "Ajustes"]],
  ajustesIniciales: { nombre: "", objetivo: BASE.objetivoSemanal, favoritos: { ej: [], ap: [] }, incremento: 2.5, descansos: { ...BASE.descansos }, sonido: true, vibracion: true, propios: [], sustituciones: {}, notasEj: {}, notasAp: {} },
  vistas: { hoy: pintarHoy, progreso: pintarProgreso, ejercicios: pintarEjercicios, ajustes: pintarAjustes },
  motivacion,
  alCerrarHoja() { Sel = null; Hoja = null; },
  // Tras cargar los datos (o restaurar una copia): los días de antes del plan a medida salen del
  // objetivo semanal que hubiera (3 de fuerza y el resto, cardio); luego se arma el plan.
  alCargar() {
    const a = Datos.ajustes;
    if (a.diasGym == null) { a.diasGym = BASE.dias.length; a.diasCardio = Math.max(0, Math.min(5, (Number(a.objetivo) || BASE.objetivoSemanal) - a.diasGym)); }
    construirPlan();
  },
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
    const c = Compartir.click(b) ?? FotoFicha.click(b); if (c !== undefined) return c;
    /* Hojas: no repintan la vista de detrás salvo que cambien datos. */
    if (ds.ayuda) { abrirAyuda(ds.ayuda); return false; }
    if (ds.aparato) { abrirAparato(ds.aparato); return false; }
    if ("favoritos" in ds) { abrirFicha("favoritos"); evento("gim-favoritos-abiertos"); return false; }
    if (ds.fav) {
      const on = alternarFav(ds.fav);
      // En la lista de favoritos se cambia solo el botón, para no perder por dónde se iba.
      if (Hoja?.tipo === "favoritos") { b.setAttribute("aria-pressed", String(on)); $("#cuentaFav").textContent = textoFavs(); } else refrescarHoja();
      return;
    }
    if (ds.diasgym || ds.diascardio) {
      if (ds.diasgym) a.diasGym = Number(ds.diasgym); else a.diasCardio = Number(ds.diascardio);
      a.objetivo = objetivos().total; Datos.guardarAjustes(); construirPlan(); evento("gim-plan-personalizado"); return;
    }
    if ("planlisto" in ds) { a.planHecho = true; Datos.guardarAjustes(); return; }
    if (ds.cambiar) { Sel = { modo: "cambiar", slot: ds.cambiar, q: "", musc: "", mat: "", paso: "lista" }; abrirHoja(hojaSelector()); return false; }
    if ("anadir" in ds) { Sel = { modo: "anadir", q: "", musc: "", mat: "", paso: "lista" }; abrirHoja(hojaSelector()); return false; }
    if ("crearlib" in ds) { Sel = { modo: "explorar", q: "", musc: Lib.musc, mat: Lib.mat, paso: "crear" }; abrirHoja(hojaSelector()); return false; }
    if (ds.filtro !== undefined) {
      const [k, v] = ds.filtro.split("|");
      if (ds.para === "sel") { Sel[k] = v; abrirHoja(hojaSelector()); verZona(); return false; }
      Lib[k] = v; return;
    }
    if (ds.libvista) { Lib.vista = ds.libvista; return; }
    if ("libtodo" in ds) { Lib.todo = !Lib.todo; return; }
    if ("crear" in ds) { Sel.paso = "crear"; abrirHoja(hojaSelector()); return false; }
    if ("volversel" in ds) { Sel.paso = "lista"; abrirHoja(hojaSelector()); return false; }
    if (ds.elegir) {
      if (Sel.modo === "cambiar") { Sel.elegido = ds.elegir; Sel.paso = "confirmar"; abrirHoja(hojaSelector()); return false; }
      añadirExtra(d, ds.elegir); cerrarHoja(); return;
    }
    if (ds.confirmar) {
      if (ds.confirmar === "siempre") { a.sustituciones = { ...a.sustituciones, [Sel.slot]: Sel.elegido }; if (d.cambios) delete d.cambios[Sel.slot]; Datos.guardarAjustes(); }
      else d.cambios = { ...d.cambios, [Sel.slot]: Sel.elegido };
      tocar(HOY); cerrarHoja(); evento("gim-plan-adaptado"); return;
    }
    if ("guardarnuevo" in ds) {
      const id = crearPropio(); if (!id) return false;
      if (Sel.modo === "cambiar") { Sel.elegido = id; Sel.paso = "confirmar"; abrirHoja(hojaSelector()); return; }
      if (Sel.modo === "anadir") { añadirExtra(d, id); cerrarHoja(); return; }
      evento("gim-plan-adaptado"); Sel = null; abrirAyuda(id); return;
    }
    if (ds.borrarpropio) { a.propios = propios().filter(e => e.id !== ds.borrarpropio); Datos.guardarAjustes(); cerrarHoja(); return; }
    if (ds.deshacersust) { delete a.sustituciones[ds.deshacersust]; Datos.guardarAjustes(); return; }

    /* Sesión de hoy */
    if ("diaplan" in ds) { if (ds.diaplan === "libre" && d.diaPlan !== "libre") evento("gim-plan-adaptado"); d.diaPlan = ds.diaplan || null; tocar(HOY); }
    else if (ds.quitar) { d.quitados = [...new Set([...(d.quitados || []), ds.quitar])]; tocar(HOY); }
    else if (ds.recuperar) { d.quitados = (d.quitados || []).filter(x => x !== ds.recuperar); tocar(HOY); }
    else if (ds.revertir) { if (d.cambios?.[ds.revertir]) delete d.cambios[ds.revertir]; else { delete a.sustituciones[ds.revertir]; Datos.guardarAjustes(); } tocar(HOY); }
    else if (ds.quitarextra) { d.extras = (d.extras || []).filter(x => x !== ds.quitarextra); tocar(HOY); }
    else if (ds.var) { const x = d.ej[ds.var]; if (x.series.some(s => s.hecho)) return false; x.v = Number(ds.v); tocar(HOY); }
    else if (ds.ok) {
      const [id, i] = ds.ok.split("|"), hs = huecos(d), h = hs.find(x => x.e.id === id);
      if (!h) return false;
      const e = h.e, x = d.ej[id], s = x.series[Number(i)];
      const antes = s.hecho ? null : antesDeSerie(d, e, x);
      s.hecho = !s.hecho;
      if (s.hecho) {
        // Lo que no se ha escrito se toma de lo sugerido (la última vez o el rango).
        const ph = sugerido(e, x, Number(i), HOY);
        if (s.peso === "" && !e.sinPeso && ph.peso !== "") s.peso = Number(ph.peso);
        if (s.reps === "") s.reps = Number(ph.reps);
        actividad(d);
        contarEntreno(d);
        celebrarSerie(d, e, x, s, antes);
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
      eventoDelDia("gim-entreno-empezado");
    }
    else if (ds.deldep) { d.deporte.splice(Number(ds.deldep), 1); tocar(HOY); }
    else return false;
  },
  cambio(t) {
    const d = diaDe(HOY), a = Datos.ajustes;
    if (Compartir.cambio(t) || FotoFicha.cambio(t)) return;
    if (t.dataset.notaej) { a.notasEj = { ...a.notasEj, [t.dataset.notaej]: t.value.trim() }; Datos.guardarAjustes(); repintar(); }
    else if (t.dataset.notaap) { a.notasAp = { ...a.notasAp, [t.dataset.notaap]: t.value.trim() }; Datos.guardarAjustes(); repintar(); }
    else if (t.dataset.serie) { const [id, i] = t.dataset.serie.split("|"); d.ej[id].series[Number(i)][t.dataset.k] = t.value === "" ? "" : Number(t.value); tocar(HOY); }
    else if (t.dataset.calent) { d.calent = d.calent || []; d.calent[Number(t.dataset.calent)] = t.checked; if (t.checked) actividad(d); tocar(HOY); repintar(); }
    else if (t.id === "nota") { d.nota = t.value; tocar(HOY); }
    else if (t.id === "nombre") { a.nombre = t.value.trim(); Datos.guardarAjustes(); pintar(); }
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
    else if (t.id === "buscarEj") { Lib.q = t.value; $("#listaLib").innerHTML = htmlLista(filtrar({ ...Lib, aqui: libAqui() }), "ayuda"); }
  },
};
// Aviso breve en la zona del temporizador (por ejemplo, en mitad de una superserie).
function msgFlotante(texto) {
  const el = $("#flotante");
  el.innerHTML = `<div class="descanso"><div class="descanso-txt"><span class="eyebrow">Superserie</span><b>${esc(texto)}</b></div></div>`;
  document.body.classList.add("con-descanso");
  clearTimeout(msgFlotante.t); msgFlotante.t = setTimeout(() => { if (!T.fin) pararDescanso(); }, 4000);
}
