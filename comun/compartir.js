"use strict";
/* Compartir las fotos de las máquinas con el resto del gimnasio.

   Las fotos compartidas viven en el repositorio (fotos/<gimnasio>/<máquina>.jpg) y la app las
   enseña a todos (ver FotosGym en base.js). Para llevar fotos nuevas al repositorio hay dos
   caminos:
   1. Con GitHub conectado en este móvil (un token guardado solo aquí): "Proponer en GitHub"
      crea una rama, sube las fotos y abre un pull request. Al aceptarlo en GitHub, las ven todos.
   2. Sin GitHub: "Enviar" genera un archivo con las fotos para mandarlo por WhatsApp (como
      documento) o por correo a quien gestiona el repositorio, que lo importa en su app y lo
      propone desde allí.
   El token nunca sale de este móvil salvo hacia api.github.com, y no va en la copia de seguridad. */

const CLAVE_TOKEN = "cuaderno-github-token";
const GH = {
  token() { try { return localStorage.getItem(CLAVE_TOKEN) || ""; } catch (e) { return ""; } },
  guardarToken(t) { try { t ? localStorage.setItem(CLAVE_TOKEN, t) : localStorage.removeItem(CLAVE_TOKEN); } catch (e) {} },
  async api(ruta, { metodo = "GET", datos } = {}) {
    const r = await fetch(`https://api.github.com/repos/${REPO}${ruta}`, {
      method: metodo,
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${this.token()}`, ...(datos ? { "Content-Type": "application/json" } : {}) },
      body: datos ? JSON.stringify(datos) : undefined,
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      const e = new Error(r.status === 401 ? "El token no es válido o ha caducado" : r.status === 403 || r.status === 404 ? "El token no tiene permiso sobre el repositorio" : j.message || `GitHub respondió ${r.status}`);
      e.status = r.status; throw e;
    }
    return r.status === 204 ? null : r.json();
  },
};
const blobABase64 = b => new Promise((ok, mal) => { const f = new FileReader(); f.onload = () => ok(String(f.result)); f.onerror = () => mal(f.error); f.readAsDataURL(b); });
async function blobDeFoto(ap) { const u = Fotos.url[ap]; return u ? (await fetch(u)).blob() : null; }

const Compartir = {
  sel: new Set(), estado: "", malo: false, enlace: "", ocupado: false,

  // Fotos propias de máquinas (las de ejercicios creados sin máquina se quedan en el móvil).
  pendientes() { return APARATOS.map(a => a.id).filter(ap => Fotos.url[ap]); },

  abrir(pre) {
    const pend = this.pendientes();
    this.sel = new Set(pre ? [pre] : pend.filter(ap => !FotosGym.url[ap]));
    this.estado = ""; this.enlace = ""; this.malo = false;
    Hoja = { tipo: "compartir" };
    abrirHoja(this.html());
  },

  html() {
    const pend = this.pendientes(), n = [...this.sel].filter(ap => pend.includes(ap)).length, gh = !!GH.token();
    return `<div class="hoja-cab"><div><span class="ej-grupo">${esc(gimnasio())}</span><h2>Compartir fotos</h2></div>${botonCerrar}</div>
      <p class="small muted" style="margin:0">Las fotos compartidas las ve todo el que use la app en este gimnasio. Elige cuáles mandar:</p>
      ${pend.length ? `<div class="lista">${pend.map(ap => `<label class="item sel-foto">
          <input type="checkbox" data-selfoto="${ap}" ${this.sel.has(ap) ? "checked" : ""}>
          ${fotoAp(ap, "item-foto")}
          <span class="item-txt"><b>${esc(AP[ap].nombre)}</b><span class="small muted">${FotosGym.url[ap] ? "Ya hay foto del gimnasio: la tuya la sustituiría" : "Nueva para el gimnasio"}</span></span>
        </label>`).join("")}</div>`
      : `<p class="muted" style="margin:0">Aún no tienes fotos propias. Hazlas desde la ficha de cualquier máquina (Ejercicios → Máquinas).</p>`}
      <div class="grid-botones">
        ${gh ? `<button class="btn" data-ghpr ${!n || this.ocupado ? "disabled" : ""}>Proponer en GitHub (${n})</button>` : ""}
        <button class="btn ${gh ? "sec" : ""}" data-enviarfotos ${!n || this.ocupado ? "disabled" : ""}>Enviar a quien gestiona la app (${n})</button>
      </div>
      <p class="small" id="msgCompartir" role="status" style="margin:0;${this.malo ? "color:var(--warn)" : ""}">${esc(this.estado)}</p>
      ${this.enlace ? `<a class="btn sec" href="${esc(this.enlace)}" target="_blank" rel="noopener">Ver la propuesta en GitHub ↗</a>` : ""}
      <details><summary><b>¿Cómo funciona?</b></summary>
        <ol class="pasos small" style="margin-top:8px">
          ${gh ? `<li><b>Proponer en GitHub</b> sube las fotos a una rama y abre un <i>pull request</i>. Cuando lo aceptes en GitHub, en un par de minutos las ve todo el mundo.</li>` : ""}
          <li><b>Enviar</b> crea un archivo con las fotos. Mándalo por WhatsApp <b>como documento</b> (no como foto) o por correo a quien gestiona la app.</li>
          <li>Quien lo recibe lo importa aquí abajo, revisa las fotos y las propone en GitHub.</li>
        </ol>
      </details>
      <label class="campo" for="importarFotos"><b style="color:var(--ink)">Importar fotos recibidas</b><span class="small muted">El archivo que te ha mandado otra persona. Solo se añaden las máquinas que aún no tienen foto tuya.</span>
        <input type="file" id="importarFotos" accept=".json,.txt,application/json,text/plain" style="font-size:1rem"></label>`;
  },

  htmlAjustes() {
    const t = GH.token();
    return `<section class="card" aria-labelledby="t-gh"><h2 id="t-gh">Fotos del gimnasio</h2>
      <p class="small muted" style="margin:0">Las fotos compartidas de ${esc(gimnasio())} se guardan en el repositorio <code>${esc(REPO)}</code>. ${(n => n === 1 ? "1 máquina tiene foto" : `${n} máquinas tienen foto`)(Object.keys(FotosGym.url).length)}.</p>
      <div class="fila"><button class="btn sec peq" data-abrircompartir>Compartir mis fotos</button><button class="btn sec peq" data-actualizarfotos>Actualizar</button></div>
      <details><summary><b>Conexión con GitHub</b> <span class="small muted">(solo para quien gestiona el repositorio)</span></summary>
        <div style="display:grid;gap:10px;margin-top:10px">
          <p class="small muted" style="margin:0">Con un token, este móvil puede proponer fotos directamente como <i>pull request</i>. Crea un token <i>fine-grained</i> en GitHub → Settings → Developer settings, con acceso solo a <code>${esc(REPO)}</code> y permisos de <b>Contents</b> y <b>Pull requests</b> en lectura y escritura. Se guarda solo en este móvil.</p>
          <label class="campo" for="ghToken">Token<input id="ghToken" class="texto" type="password" autocomplete="off" placeholder="github_pat_…" value="${t ? "••••••••••••" : ""}"></label>
          <div class="fila">${t ? `<button class="btn sec peq" data-ghprobar>Probar conexión</button><button class="enlace" data-gholvidar>Olvidar token</button>` : ""}</div>
          <p class="small" id="msgGh" role="status" style="margin:0"></p>
        </div>
      </details>
    </section>`;
  },

  avance(t, malo = false) { this.estado = t; this.malo = malo; const m = $("#msgCompartir"); if (m) { m.textContent = t; m.style.color = malo ? "var(--warn)" : ""; } },

  // Devuelve undefined si el botón no es suyo; si no, lo que deba devolver App.click.
  click(b) {
    const ds = b.dataset;
    if (ds.compartir) { this.abrir(ds.compartir); return false; }
    if ("abrircompartir" in ds) { this.abrir(); return false; }
    if ("actualizarfotos" in ds) { b.disabled = true; b.textContent = "Actualizando…"; FotosGym.cargar(true).then(() => repintar()); return false; }
    if ("enviarfotos" in ds) { this.enviar(); return false; }
    if ("ghpr" in ds) { this.proponer(); return false; }
    if ("ghprobar" in ds) { this.probar(); return false; }
    if ("gholvidar" in ds) { GH.guardarToken(""); return true; }
    return undefined;
  },
  // Devuelve true si el cambio era suyo.
  cambio(t) {
    if (t.dataset.selfoto) { t.checked ? this.sel.add(t.dataset.selfoto) : this.sel.delete(t.dataset.selfoto); abrirHoja(this.html()); return true; }
    if (t.id === "importarFotos") { if (t.files[0]) this.importar(t.files[0]); return true; }
    if (t.id === "ghToken") {
      const v = t.value.trim();
      if (v && !v.includes("•")) { GH.guardarToken(v); repintar(); setTimeout(() => this.probar(), 0); }
      return true;
    }
    return false;
  },

  elegidas() { const pend = this.pendientes(); return [...this.sel].filter(ap => pend.includes(ap)); },

  // 1. Archivo con las fotos para mandarlo a quien gestiona el repositorio.
  async enviar() {
    const aps = this.elegidas(); if (!aps.length) return;
    this.avance("Preparando el archivo…");
    const fotos = {};
    for (const ap of aps) fotos[ap] = await blobABase64(await blobDeFoto(ap));
    const datos = JSON.stringify({ app: "cuaderno-fuerza", tipo: "fotos", gimnasio: gimnasio(), de: nombreVisible(), fecha: new Date().toISOString(), fotos });
    const base = `fotos-${slugGym()}-${sinAcentos(nombreVisible()).replace(/[^a-z0-9]+/g, "-")}-${HOY}`;
    // Algunos móviles no dejan compartir .json: se prueba también como texto.
    const candidatos = [new File([datos], base + ".json", { type: "application/json" }), new File([datos], base + ".txt", { type: "text/plain" })];
    const f = candidatos.find(x => navigator.canShare?.({ files: [x] }));
    if (f) {
      try {
        await navigator.share({ files: [f], title: "Fotos del gimnasio", text: `${aps.length} foto${aps.length > 1 ? "s" : ""} de máquinas de ${gimnasio()} para la app. Impórtalas en Ejercicios → Máquinas → Compartir.` });
        this.avance("Enviado. Quien lo reciba tiene que importarlo en su app y proponerlo en GitHub.");
      } catch (e) { this.avance(e.name === "AbortError" ? "" : `No se pudo compartir: ${e.message}`, e.name !== "AbortError"); }
      return;
    }
    const url = URL.createObjectURL(candidatos[0]);
    const a = document.createElement("a"); a.href = url; a.download = candidatos[0].name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
    this.avance(`Archivo descargado (${candidatos[0].name}). Mándalo por correo o WhatsApp a quien gestiona la app.`);
  },

  // Importa un archivo de fotos de otra persona: solo donde no hay foto propia.
  async importar(file) {
    try {
      const j = JSON.parse(await file.text());
      if (j?.app !== "cuaderno-fuerza" || j.tipo !== "fotos" || typeof j.fotos !== "object") throw new Error("Ese archivo no es de fotos de la app.");
      let nuevas = 0, ya = 0, otras = 0;
      for (const [ap, dataUrl] of Object.entries(j.fotos)) {
        if (!AP[ap] || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) { otras++; continue; }
        if (Fotos.url[ap]) { ya++; continue; }
        await Fotos.guardar(ap, await (await fetch(dataUrl)).blob());
        this.sel.add(ap); nuevas++;
      }
      this.avance(`${nuevas} foto${nuevas === 1 ? "" : "s"} de ${j.de || "otra persona"} importada${nuevas === 1 ? "" : "s"}${ya ? `; ${ya} no, porque ya tenías foto de esa máquina` : ""}${otras ? `; ${otras} no reconocida${otras > 1 ? "s" : ""}` : ""}.${GH.token() && nuevas ? " Revísalas y pulsa Proponer en GitHub." : ""}`);
      refrescarHoja(); repintar();
    } catch (e) { this.avance(`No se pudo importar: ${e.message}`, true); refrescarHoja(); }
  },

  async probar() {
    const m = $("#msgGh"); const pon = (t, malo) => { if (m) { m.textContent = t; m.style.color = malo ? "var(--warn)" : "var(--ok)"; } };
    pon("Comprobando…");
    try {
      const r = await GH.api("");
      pon(r.permissions?.push ? `Conectado a ${r.full_name}: este móvil puede proponer fotos.` : "El token funciona pero no tiene permiso de escritura en el repositorio.", !r.permissions?.push);
    } catch (e) { pon(e.message, true); }
  },

  // 2. Pull request con las fotos elegidas: rama nueva + un commit por foto + PR.
  async proponer() {
    const aps = this.elegidas(); if (!aps.length || this.ocupado) return;
    this.ocupado = true; this.enlace = ""; refrescarHoja();
    try {
      this.avance("Conectando con GitHub…");
      const repo = await GH.api("");
      const base = repo.default_branch;
      const ref = await GH.api(`/git/ref/heads/${base}`);
      const carpeta = `fotos/${slugGym()}`;
      // Si ya hay foto de esa máquina en el repositorio, hace falta su sha para sustituirla.
      let existentes = {};
      try { for (const f of await GH.api(`/contents/${carpeta}?ref=${base}`)) existentes[f.name] = f.sha; } catch (e) { if (e.status !== 404) throw e; }
      const rama = `fotos/${PERFIL.id}-${Date.now().toString(36)}`;
      await GH.api("/git/refs", { metodo: "POST", datos: { ref: `refs/heads/${rama}`, sha: ref.object.sha } });
      for (const [i, ap] of aps.entries()) {
        this.avance(`Subiendo ${i + 1} de ${aps.length}: ${AP[ap].nombre}…`);
        const nombre = `${ap}.jpg`;
        const contenido = (await blobABase64(await blobDeFoto(ap))).split(",")[1];
        await GH.api(`/contents/${carpeta}/${nombre}`, { metodo: "PUT", datos: {
          message: `Foto de ${AP[ap].nombre} (${gimnasio()})`, content: contenido, branch: rama,
          ...(existentes[nombre] ? { sha: existentes[nombre] } : {}),
        } });
      }
      this.avance("Abriendo la propuesta…");
      const pr = await GH.api("/pulls", { metodo: "POST", datos: {
        title: `Fotos de ${gimnasio()}: ${aps.length} máquina${aps.length > 1 ? "s" : ""}`,
        head: rama, base,
        body: `Fotos hechas con la app por ${nombreVisible()}.\n\n${aps.map(ap => `- ${AP[ap].nombre} → \`${carpeta}/${ap}.jpg\`${existentes[`${ap}.jpg`] ? " (sustituye a la anterior)" : ""}`).join("\n")}\n\nAl aceptarla, la app las enseña a todos en este gimnasio.`,
      } });
      this.enlace = pr.html_url;
      this.avance(`Propuesta creada (#${pr.number}). Acéptala en GitHub y en un par de minutos las verán todos.`);
    } catch (e) {
      this.avance(`No se pudo completar: ${e.message}`, true);
    } finally { this.ocupado = false; refrescarHoja(); }
  },
};
