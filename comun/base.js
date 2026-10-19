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
const sinAcentos = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
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
const gimnasio = () => Datos.ajustes.gimnasio ?? PERFIL.gimnasio ?? "";

/* ---------- Esqueleto y navegación ---------- */
let pestaña = "hoy";
let PESTAÑAS = [["hoy", "Hoy"], ["progreso", "Progreso"], ["ajustes", "Ajustes"]];

function montar() {
  if (App.pestañas) PESTAÑAS = App.pestañas;
  document.body.insertAdjacentHTML("afterbegin", `
    <header class="hero">
      <div class="hero-in">
        <div class="hero-top"><span class="marca">Cuaderno de Fuerza</span><span class="gym" id="gym"></span></div>
        <p class="hero-fecha" id="fechaHoy"></p>
        <h1 id="saludo"></h1>
        <p class="hero-msg" id="motivacion"></p>
      </div>
    </header>
    <div class="wrap">
      <main id="vista"></main>
      <p class="estado-datos" id="estadoDatos">Tus datos se guardan solo en este móvil. Haz una copia de vez en cuando desde Ajustes.</p>
    </div>
    <div id="flotante"></div>
    <div id="hoja" hidden></div>
    <nav class="tabs" role="tablist" aria-label="Secciones" style="grid-template-columns:repeat(${PESTAÑAS.length},1fr)">${PESTAÑAS.map(([id, t]) => `<button role="tab" id="tab-${id}" data-tab="${id}">${iconoUI(id)}<span>${t}</span></button>`).join("")}</nav>`);
  $("#fechaHoy").textContent = fechaLarga(new Date());

  document.querySelector("nav.tabs").addEventListener("click", ev => {
    const b = ev.target.closest("button[data-tab]"); if (!b) return;
    pestaña = b.dataset.tab; pintar(); window.scrollTo(0, 0);
    try { localStorage.setItem(PERFIL.clave + "-tab", pestaña); } catch (e) {}
  });
  // Un solo punto de entrada para la página y la hoja de ayuda: el motor decide qué hacer.
  document.addEventListener("click", ev => {
    if (ev.target.closest("[data-cerrar]")) { cerrarHoja(); return; }
    const b = ev.target.closest("button"); if (!b || b.closest("nav.tabs") || b.dataset.t || b.dataset.ir) return;
    if (clickCopia(b)) return;
    if (App.click(b) !== false) repintar();
  });
  document.addEventListener("change", ev => {
    const t = ev.target;
    if (t.id === "importarFichero") { if (t.files[0]) t.files[0].text().then(restaurar); return; }
    if (t.id === "gimnasio") { Datos.ajustes.gimnasio = t.value.trim(); Datos.guardarAjustes(); pintar(); FotosGym.cargar(true).then(() => repintar()); return; }
    App.cambio(t);
  });
  document.addEventListener("input", ev => App.entrada?.(ev.target));
  document.addEventListener("keydown", ev => { if (ev.key === "Escape" && !$("#hoja").hidden) cerrarHoja(); });
  Fotos.cargar().then(async n => { if (App.alCargarFotos) n += await App.alCargarFotos(); if (n) repintar(); });

  Datos.cargar(App.ajustesIniciales);
  FotosGym.cargar().then(cambio => { if (cambio) repintar(); });
  FotosGen.cargar().then(ok => { if (ok) repintar(); });
  try { const t = localStorage.getItem(PERFIL.clave + "-tab"); if (PESTAÑAS.some(p => p[0] === t)) pestaña = t; } catch (e) {}
  pintar();
}
function pintar() {
  document.querySelectorAll("nav.tabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === pestaña)));
  $("#saludo").textContent = `${saludoHora()}, ${nombreVisible()}`;
  const g = gimnasio();
  $("#gym").innerHTML = g ? `${iconoUI("ubicacion")}${esc(g)}` : "";
  const m = $("#motivacion");
  m.textContent = pestaña === "hoy" ? (App.motivacion?.() || "") : "";
  m.hidden = !m.textContent;
  App.vistas[pestaña]();
}
function saludoHora() { const h = new Date().getHours(); return h >= 6 && h < 14 ? "Buenos días" : h >= 14 && h < 21 ? "Buenas tardes" : "Buenas noches"; }
// Frase del día: misma frase todo el día, distinta cada día. {n} se cambia por el nombre.
function fraseDelDia(lista, extra = "") {
  const r = azar(HOY + PERFIL.id + extra)();
  return lista[Math.floor(r * lista.length)].replaceAll("{n}", nombreVisible());
}
// Bloque de Ajustes común: nombre y gimnasio.
function htmlPerfil() {
  return `<section class="card"><h2>Perfil</h2>
    <label class="campo" for="nombre">Nombre<input id="nombre" value="${esc(Datos.ajustes.nombre)}" placeholder="${esc(PERFIL.nombre)}" class="texto"></label>
    <label class="campo" for="gimnasio">Gimnasio<input id="gimnasio" value="${esc(gimnasio())}" placeholder="Nombre del gimnasio" class="texto"></label>
  </section>`;
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

/* ---------- Hoja (panel que sube desde abajo) ---------- */
function abrirHoja(html) {
  const h = $("#hoja");
  const ya = !h.hidden, scroll = ya ? h.querySelector(".hoja").scrollTop : 0;
  h.innerHTML = `<div class="hoja-fondo" data-cerrar></div><div class="hoja" role="dialog" aria-modal="true">${html}</div>`;
  h.hidden = false; document.body.classList.add("sin-scroll");
  h.querySelector(".hoja").scrollTop = scroll;
}
function cerrarHoja() { const h = $("#hoja"); h.hidden = true; h.innerHTML = ""; document.body.classList.remove("sin-scroll"); App.alCerrarHoja?.(); }
const botonCerrar = `<button class="cerrar" data-cerrar aria-label="Cerrar">×</button>`;

/* ---------- Fotos ----------
   Las fotos de las máquinas van en IndexedDB (cabe mucho más que en localStorage), una base
   por persona. Se reducen en el móvil antes de guardar. No entran en la copia de seguridad. */
const Fotos = {
  url: {}, _db: null,
  abrir() {
    return this._db ??= new Promise((ok, mal) => {
      const r = indexedDB.open(`cuaderno-fotos-${PERFIL.id}`, 1);
      r.onupgradeneeded = () => r.result.createObjectStore("fotos");
      r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error);
    });
  },
  async op(modo, fn) {
    const db = await this.abrir();
    return new Promise((ok, mal) => { const t = db.transaction("fotos", modo); fn(t.objectStore("fotos")); t.oncomplete = ok; t.onerror = () => mal(t.error); });
  },
  async cargar() {
    let n = 0;
    try {
      const db = await this.abrir();
      await new Promise(ok => {
        const c = db.transaction("fotos").objectStore("fotos").openCursor();
        c.onsuccess = () => { const cur = c.result; if (!cur) return ok(); this.url[cur.key] = URL.createObjectURL(cur.value); n++; cur.continue(); };
        c.onerror = () => ok();
      });
    } catch (e) {}
    return n;
  },
  async guardar(id, blob) { await this.op("readwrite", st => st.put(blob, id)); if (this.url[id]) URL.revokeObjectURL(this.url[id]); this.url[id] = URL.createObjectURL(blob); },
  async borrar(id) { await this.op("readwrite", st => st.delete(id)); if (this.url[id]) URL.revokeObjectURL(this.url[id]); delete this.url[id]; },
  // Cambia la clave de una foto (por ejemplo, de un ejercicio a la máquina que usa).
  async mover(de, a) {
    const db = await this.abrir();
    const blob = await new Promise(ok => { const q = db.transaction("fotos").objectStore("fotos").get(de); q.onsuccess = () => ok(q.result); q.onerror = () => ok(null); });
    if (!blob) return false;
    await this.guardar(a, blob); await this.borrar(de);
    return true;
  },
};
/* ---------- Fotos compartidas del gimnasio ----------
   Viven en el repositorio, en fotos/<gimnasio>/<máquina>.jpg, y las ve todo el que use la app
   en ese gimnasio. La lista de archivos se pide a la API pública de GitHub (sin cuenta) como
   mucho una vez por hora y se guarda en el móvil por si no hay conexión. Las imágenes se
   sirven desde la propia web. La foto propia de cada uno manda sobre la compartida. */
const REPO = window.REPO || "Jonmg/cuaderno-gimnasio";
const slugGym = () => sinAcentos(gimnasio()).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "general";
const EXT_FOTO = /\.(jpe?g|png|webp)$/i;
const FotosGym = {
  url: {}, archivos: {}, actualizado: 0, error: "",
  clave: () => `cuaderno-fotos-gym-${slugGym()}`,
  aplicar(archivos) {
    this.archivos = archivos; this.url = {};
    for (const [nombre, sha] of Object.entries(archivos)) this.url[nombre.replace(EXT_FOTO, "")] = `../fotos/${slugGym()}/${encodeURIComponent(nombre)}?v=${String(sha).slice(0, 8)}`;
  },
  // Devuelve true si la lista ha cambiado (para repintar).
  async cargar(forzar = false) {
    let cache = null;
    try { cache = JSON.parse(localStorage.getItem(this.clave()) || "null"); } catch (e) {}
    this.aplicar(cache?.archivos || {}); this.actualizado = cache?.t || 0;
    if (!forzar && cache && Date.now() - cache.t < 60 * 60e3) return false;
    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}/contents/fotos/${slugGym()}`, { headers: { Accept: "application/vnd.github+json" }, cache: "no-store" });
      if (!r.ok && r.status !== 404) throw new Error(r.status === 403 ? "GitHub ha limitado las consultas; se reintentará más tarde" : `GitHub respondió ${r.status}`);
      const lista = r.ok ? await r.json() : [];
      const archivos = {};
      for (const f of Array.isArray(lista) ? lista : []) if (f.type === "file" && EXT_FOTO.test(f.name)) archivos[f.name] = f.sha;
      const cambio = JSON.stringify(archivos) !== JSON.stringify(cache?.archivos || {});
      this.aplicar(archivos); this.actualizado = Date.now(); this.error = "";
      try { localStorage.setItem(this.clave(), JSON.stringify({ t: this.actualizado, archivos })); } catch (e) {}
      return cambio;
    } catch (e) { this.error = e.message || "Sin conexión"; return false; }
  },
};
/* ---------- Imágenes genéricas ----------
   fotos/general/: una ilustración por máquina (herramientas/ilustraciones.mjs) o una foto con
   licencia libre y su crédito. Se ven mientras no haya foto propia ni del gimnasio. */
const FotosGen = {
  info: {},
  async cargar() {
    try {
      const r = await fetch("../fotos/general/indice.json");
      if (!r.ok) return false;
      const j = await r.json();
      for (const [id, v] of Object.entries(j)) this.info[id] = { ...v, url: `../fotos/general/${encodeURIComponent(v.archivo)}` };
      return true;
    } catch (e) { return false; }
  },
};
// Foto real (propia o del gimnasio), sin contar las genéricas.
const fotoReal = clave => Fotos.url[clave] || FotosGym.url[clave];
// Lo que se ve: la propia; si no, la del gimnasio; si no, la genérica.
const urlFoto = clave => fotoReal(clave) || FotosGen.info[clave]?.url;

// Reduce la foto a 1000 px de lado mayor en JPEG: unos 100–200 KB en vez de varios MB.
function reducirFoto(file, max = 1000) {
  return new Promise((ok, mal) => {
    const img = new Image(), u = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(u);
      c.toBlob(b => b ? ok(b) : mal(new Error("No se pudo procesar la foto")), "image/jpeg", 0.78);
    };
    img.onerror = () => { URL.revokeObjectURL(u); mal(new Error("Ese archivo no parece una imagen")); };
    img.src = u;
  });
}

window.addEventListener("DOMContentLoaded", montar);
