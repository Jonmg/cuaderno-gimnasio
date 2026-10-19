"use strict";
/* Fichas con foto, comunes a todas las libretas: miniatura de cada máquina, bloque de foto con
   sus botones (cámara, galería, quitar, compartir) y la hoja abierta, para volver a pintarla
   cuando cambia una foto. Necesita catalogo.js (APARATOS) y base.js (Fotos, FotosGym, FotosGen).
   La foto va por aparato: la misma foto de una máquina sale en todos los ejercicios que la
   usan, en cualquier libreta. */

const AP = Object.fromEntries(APARATOS.map(a => [a.id, a]));
const TIPO_AP = Object.fromEntries(TIPOS_APARATO);
// Miniatura de un aparato: su foto si la hay; si no, el icono de su tipo.
const fotoAp = (ap, clase = "ap-chip") => urlFoto(ap) ? `<img class="${clase}" src="${urlFoto(ap)}" alt="" onerror="this.style.visibility='hidden'">` : `<span class="${clase} sin-foto">${iconoAparato(AP[ap]?.tipo)}</span>`;

/* ---------- Hoja abierta ----------
   Hoja = { tipo, id } de la que está a la vista. Cada motor (y Compartir) registra en HOJAS
   cómo se pinta cada tipo, para refrescarla tras hacer o quitar una foto. */
let Hoja = null;
const HOJAS = {};
function abrirFicha(tipo, id) { Hoja = { tipo, id }; abrirHoja(HOJAS[tipo](id)); }
function refrescarHoja() { if (HOJAS[Hoja?.tipo]) abrirHoja(HOJAS[Hoja.tipo](Hoja.id)); }

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

// Botones y campos del bloque de foto. Como Compartir: click devuelve undefined si el botón no
// es suyo; cambio devuelve true si el campo era suyo.
const FotoFicha = {
  click(b) {
    if (!b.dataset.borrarfoto) return undefined;
    Fotos.borrar(b.dataset.borrarfoto).then(() => { refrescarHoja(); repintar(); });
    return false;
  },
  cambio(t) {
    if (!t.dataset.foto) return false;
    const clave = t.dataset.foto, f = t.files[0]; if (!f) return true;
    $("#msgFoto").textContent = "Guardando foto…";
    reducirFoto(f).then(b => Fotos.guardar(clave, b)).then(() => { evento("gim-foto-hecha"); refrescarHoja(); repintar(); })
      .catch(err => { const m = $("#msgFoto"); if (m) { m.textContent = `No se pudo guardar la foto: ${err.message}`; m.style.color = "var(--warn)"; } });
    return true;
  },
};
