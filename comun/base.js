"use strict";
/* Núcleo común de todas las libretas: almacenamiento por persona, esqueleto de la página,
   copia de seguridad y gráficos. Cada persona tiene su carpeta con un index.html que define
   window.PERFIL y carga este fichero más un motor (recuperacion.js o rutina.js). El motor
   registra window.App = { ajustesIniciales, vistas: {hoy, progreso, ajustes}, click(b), cambio(t) }. */

const PERFIL = window.PERFIL;
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/* ---------- Utilidades ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function claveFecha(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function deClave(k) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); }
function fechaLarga(d) { return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`; }
function fechaCorta(d) { return `${d.getDate()}/${d.getMonth() + 1}`; }
function lunesDe(d) { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); x.setHours(0, 0, 0, 0); return x; }
// Aleatorio reproducible a partir de una semilla: el mismo día da la misma sesión.
function azar(semilla) { let h = 2166136261; for (const c of semilla) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
const HOY = claveFecha(new Date());
const SVG_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const num = v => (v === "" || v == null || isNaN(Number(v))) ? null : Number(v);
const fmt = v => String(Math.round(Number(v) * 10) / 10).replace(".", ",");
// En los ejes, los miles abreviados: 7381 -> "7,4k".
const fmtEje = v => Math.abs(v) >= 1000 ? `${fmt(v / 1000)}k` : fmt(v);

/* ---------- Almacenamiento ----------
   Todo en el navegador del móvil, con una clave por persona: todas las páginas de
   jonmg.github.io comparten almacenamiento y así no se pisan entre ellas. */
const Datos = {
  dias: {}, ajustes: {},
  cargar(iniciales) {
    this.ajustes = structuredClone(iniciales);
    try {
      let raw = localStorage.getItem(PERFIL.clave);
      // Primera vez en la carpeta nueva: trae lo que hubiera en la versión anterior de la app.
      if (!raw && PERFIL.migrarDe) { raw = localStorage.getItem(PERFIL.migrarDe); if (raw) localStorage.setItem(PERFIL.clave, raw); }
      const j = JSON.parse(raw || "null");
      if (j) { this.dias = j.dias || {}; Object.assign(this.ajustes, j.ajustes || {}); }
    } catch (e) {}
  },
  guardar() {
    try { localStorage.setItem(PERFIL.clave, JSON.stringify({ dias: this.dias, ajustes: this.ajustes })); }
    catch (e) { const el = $("#estadoDatos"); if (el) el.textContent = "No se pudo guardar en este móvil. Revisa que el navegador no esté en modo privado."; }
  },
  guardarDia(k) { delete this.dias[k].nuevo; this.dias[k].actualizado = Date.now(); this.guardar(); },
  guardarAjustes() { this.guardar(); },
};
const nombreVisible = () => Datos.ajustes.nombre || PERFIL.nombre;

/* ---------- Esqueleto y navegación ---------- */
let pestaña = "hoy";
const PESTAÑAS = [["hoy", "Hoy"], ["progreso", "Progreso"], ["ajustes", "Ajustes"]];

function montar() {
  document.body.insertAdjacentHTML("afterbegin", `
    <div class="wrap">
      <header class="top"><h1 id="saludo"></h1><span class="fecha" id="fechaHoy"></span></header>
      <main id="vista"></main>
      <p class="estado-datos" id="estadoDatos">Tus datos se guardan solo en este móvil. Haz una copia de vez en cuando desde Ajustes.</p>
    </div>
    <div id="flotante"></div>
    <nav class="tabs" role="tablist" aria-label="Secciones">${PESTAÑAS.map(([id, t]) => `<button role="tab" id="tab-${id}" data-tab="${id}">${t}</button>`).join("")}</nav>`);
  $("#fechaHoy").textContent = fechaLarga(new Date());

  document.querySelector("nav.tabs").addEventListener("click", ev => {
    const b = ev.target.closest("button[data-tab]"); if (!b) return;
    pestaña = b.dataset.tab; pintar(); window.scrollTo(0, 0);
    try { localStorage.setItem(PERFIL.clave + "-tab", pestaña); } catch (e) {}
  });
  $("#vista").addEventListener("click", ev => {
    const b = ev.target.closest("button"); if (!b) return;
    if (clickCopia(b)) return;
    if (App.click(b) !== false) repintar();
  });
  $("#vista").addEventListener("change", ev => {
    const t = ev.target;
    if (t.id === "importarFichero") { if (t.files[0]) t.files[0].text().then(restaurar); return; }
    App.cambio(t);
  });

  Datos.cargar(App.ajustesIniciales);
  try { const t = localStorage.getItem(PERFIL.clave + "-tab"); if (PESTAÑAS.some(p => p[0] === t)) pestaña = t; } catch (e) {}
  pintar();
}
function pintar() {
  document.querySelectorAll("nav.tabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === pestaña)));
  $("#saludo").textContent = `Hola, ${nombreVisible()}`;
  App.vistas[pestaña]();
}
// Repinta sin perder la posición de lectura.
function repintar() { const y = window.scrollY; pintar(); window.scrollTo(0, y); }

/* ---------- Copia de seguridad ---------- */
function textoCopia() {
  return JSON.stringify({ app: "cuaderno-fuerza", motor: PERFIL.motor, perfil: PERFIL.id, version: 2, exportado: new Date().toISOString(), ajustes: Datos.ajustes, dias: Object.fromEntries(Object.entries(Datos.dias).filter(([, d]) => !d.nuevo)) });
}
function msgCopia(t, mal) { const el = $("#msgCopia"); if (el) { el.textContent = t; el.style.color = mal ? "var(--warn)" : "var(--ok)"; } }
function marcarCopia() { Datos.ajustes.ultimaCopia = Date.now(); Datos.guardarAjustes(); }
// Mezcla una copia con lo que ya hay: por cada día gana la versión modificada más tarde.
function restaurar(texto) {
  let j;
  try { j = JSON.parse(texto); } catch (e) { msgCopia("Ese texto no es una copia válida. Copia el texto entero, desde la primera llave hasta la última.", true); return; }
  if (!j || j.app !== "cuaderno-fuerza" || typeof j.dias !== "object") { msgCopia("Ese fichero no es una copia de esta libreta.", true); return; }
  if ((j.motor || "recuperacion") !== PERFIL.motor) { msgCopia("Esa copia es de otro tipo de libreta y no encaja aquí.", true); return; }
  let n = 0;
  for (const [k, d] of Object.entries(j.dias)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !d || typeof d !== "object") continue;
    const actual = Datos.dias[k];
    if (!actual || actual.nuevo || (d.actualizado || 0) > (actual.actualizado || 0)) { Datos.dias[k] = d; n++; }
  }
  if (j.ajustes && typeof j.ajustes === "object") Object.assign(Datos.ajustes, j.ajustes);
  Datos.guardar();
  pintar();
  msgCopia(`Copia restaurada: ${n} día${n === 1 ? "" : "s"} recuperado${n === 1 ? "" : "s"}.`);
}
function clickCopia(b) {
  if ("descargar" in b.dataset) {
    const url = URL.createObjectURL(new Blob([textoCopia()], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = `cuaderno-${PERFIL.id}-${HOY}.json`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    marcarCopia(); msgCopia("Copia descargada. Guárdala fuera del móvil, por ejemplo mandándotela por correo.");
    return true;
  }
  if ("copiar" in b.dataset) {
    const t = textoCopia(), area = $("#importarTexto");
    const plan = () => { area.value = t; area.select(); msgCopia("No se pudo copiar solo: el texto está seleccionado en el recuadro, cópialo a mano.", true); };
    try { navigator.clipboard.writeText(t).then(() => { marcarCopia(); msgCopia("Copia guardada en el portapapeles. Pégala en un mensaje para ti."); }, plan); } catch (e) { plan(); }
    return true;
  }
  if ("restaurar" in b.dataset) { const t = $("#importarTexto").value.trim(); if (t) restaurar(t); else msgCopia("Pega primero el texto de la copia en el recuadro.", true); return true; }
  return false;
}
function htmlCopia() {
  return `<section class="card" aria-labelledby="t-copia"><h2 id="t-copia">Copia de seguridad</h2>
    <p class="muted small" style="margin:0">Tus datos están solo en este móvil. Saca una copia de vez en cuando y guárdala (por ejemplo, mándatela por WhatsApp o correo).${Datos.ajustes.ultimaCopia ? ` Última copia: ${fechaLarga(new Date(Datos.ajustes.ultimaCopia))}.` : ""}</p>
    <div class="fila">
      <button class="btn peq" data-descargar>Descargar copia</button>
      <button class="btn sec peq" data-copiar>Copiar copia como texto</button>
    </div>
    <label class="campo" for="importarFichero">Restaurar desde un fichero de copia<input type="file" id="importarFichero" accept=".json,application/json,text/plain" style="font-size:1rem"></label>
    <label class="campo" for="importarTexto">…o pega aquí el texto de la copia<textarea id="importarTexto" rows="3" class="area"></textarea></label>
    <button class="btn sec peq" data-restaurar style="justify-self:start">Restaurar copia pegada</button>
    <p class="small" id="msgCopia" role="status" style="margin:0"></p>
  </section>`;
}
// Recordatorio discreto si hay datos y hace más de un mes que no se saca copia.
function avisoCopia(diasActivos) {
  const ult = Datos.ajustes.ultimaCopia || 0;
  if (diasActivos < 5 || Date.now() - ult < 30 * 864e5) return "";
  return `<p class="aviso small" style="margin:0">${ult ? "Hace más de un mes que no guardas una copia." : "Aún no has guardado ninguna copia."} Tus datos están solo en este móvil: <button class="enlace" data-ir="ajustes">haz una copia en Ajustes</button>.</p>`;
}
document.addEventListener("click", ev => { const b = ev.target.closest("[data-ir]"); if (b) { pestaña = b.dataset.ir; pintar(); window.scrollTo(0, 0); } });

/* ---------- Gráficos ----------
   SVG a mano, sin librerías. Colores siempre desde las variables del tema. */
// items: [{ etiqueta, partes: [{ v, color }] }]; opciones: { meta, unidad }
function graficoBarras(items, { meta = null, unidad = "", etiquetaAria = "" } = {}) {
  const W = 340, H = 180, iz = 34, ab = 24, ar = 14;
  const totales = items.map(i => i.partes.reduce((s, p) => s + p.v, 0));
  const max = Math.max(meta || 0, ...totales, 1);
  // Paso "redondo" (1, 2, 2,5, 5 × 10ⁿ) para que el eje tenga como mucho 5 rayas.
  const crudo = max / 4, mag = Math.pow(10, Math.floor(Math.log10(crudo)));
  const paso = Math.max(1, [1, 2, 2.5, 5, 10].map(m => m * mag).find(m => m >= crudo));
  const tope = Math.ceil(max / paso) * paso;
  const y = v => ar + (H - ar - ab) * (1 - v / tope);
  const bw = (W - iz - 8) / items.length;
  const rayas = Math.round(tope / paso);
  let s = `<svg class="grafico" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(etiquetaAria)}">`;
  for (let i = 0; i <= rayas; i++) { const v = tope * i / rayas; s += `<line class="rejilla" x1="${iz}" x2="${W}" y1="${y(v)}" y2="${y(v)}"/><text x="${iz - 6}" y="${y(v) + 4}" text-anchor="end">${fmtEje(v)}</text>`; }
  items.forEach((it, i) => {
    const x = iz + 4 + i * bw;
    let acum = 0;
    for (const p of it.partes) {
      if (p.v <= 0) continue;
      s += `<rect x="${x + 3}" y="${y(acum + p.v)}" width="${bw - 6}" height="${y(acum) - y(acum + p.v)}" rx="3" fill="${p.color}"/>`;
      acum += p.v;
    }
    if (acum) s += `<text x="${x + bw / 2}" y="${y(acum) - 4}" text-anchor="middle" style="fill:var(--ink)">${fmtEje(acum)}${unidad}</text>`;
    s += `<text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${esc(it.etiqueta)}</text>`;
  });
  if (meta) s += `<line x1="${iz}" x2="${W}" y1="${y(meta)}" y2="${y(meta)}" stroke="var(--amber)" stroke-width="2" stroke-dasharray="6 4"/>`;
  return s + `</svg>`;
}
// pts: [{ k: fecha, v }]; opciones: { unidad, max }
function graficoLinea(pts, { unidad = "", max: maxFijo = null, min: minFijo = null } = {}) {
  if (!pts.length) return `<p class="muted">Sin datos todavía.</p>`;
  const W = 340, H = 170, iz = 34, de = 14, ab = 24, ar = 18;
  const vals = pts.map(p => p.v);
  const rango = Math.max(...vals) - Math.min(...vals);
  const pasoR = rango > 40 ? 10 : 5;
  const min = minFijo ?? Math.max(0, Math.floor((Math.min(...vals) - pasoR) / pasoR) * pasoR);
  const max = maxFijo ?? Math.ceil((Math.max(...vals) + pasoR) / pasoR) * pasoR;
  const x = i => pts.length === 1 ? (iz + W - de) / 2 : iz + 8 + (W - iz - de - 8) * i / (pts.length - 1);
  const y = v => ar + (H - ar - ab) * (1 - (v - min) / (max - min || 1));
  let s = `<svg class="grafico" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución">`;
  for (let i = 0; i <= 2; i++) { const v = min + (max - min) * i / 2; s += `<line class="rejilla" x1="${iz}" x2="${W - de}" y1="${y(v)}" y2="${y(v)}"/><text x="${iz - 6}" y="${y(v) + 4}" text-anchor="end">${fmt(v)}</text>`; }
  const linea = pts.map((p, i) => `${x(i)},${y(p.v)}`).join(" ");
  s += `<polygon points="${x(0)},${y(min)} ${linea} ${x(pts.length - 1)},${y(min)}" fill="var(--accent-soft)" opacity=".7"/>`;
  s += `<polyline points="${linea}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/>`;
  pts.forEach((p, i) => { s += `<circle cx="${x(i)}" cy="${y(p.v)}" r="${i === pts.length - 1 ? 6 : 3.5}" fill="var(--accent)"/>`; });
  const u = pts[pts.length - 1];
  s += `<text x="${Math.min(x(pts.length - 1), W - de - 4)}" y="${y(u.v) - 10}" text-anchor="end" style="fill:var(--ink);font-weight:700">${fmt(u.v)}${unidad}</text>`;
  s += `<text x="${x(0)}" y="${H - 6}" text-anchor="start">${fechaCorta(deClave(pts[0].k))}</text>`;
  if (pts.length > 1) s += `<text x="${x(pts.length - 1)}" y="${H - 6}" text-anchor="end">${fechaCorta(deClave(u.k))}</text>`;
  return s + `</svg>`;
}
// Las últimas n semanas (lunes a domingo), la actual al final.
function ultimasSemanas(n) {
  const lunes = lunesDe(new Date()), out = [];
  for (let i = n - 1; i >= 0; i--) { const s = new Date(lunes); s.setDate(s.getDate() - 7 * i); const f = new Date(s); f.setDate(f.getDate() + 7); out.push({ inicio: s, fin: f }); }
  return out;
}
const semanaDe = (semanas, k) => { const f = deClave(k); return semanas.find(w => f >= w.inicio && f < w.fin); };

window.addEventListener("DOMContentLoaded", montar);
