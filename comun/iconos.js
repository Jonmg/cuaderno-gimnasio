"use strict";
/* Iconos dibujados en SVG (sin imágenes externas): figura con el músculo resaltado,
   iconos de material para las máquinas sin foto e iconos de las pestañas.
   Los colores salen de las variables del tema (--fig, --accent…). */

/* ---------- Figura con músculos ----------
   Vista de frente (f) o de espaldas (e) según el músculo principal. El principal va en color
   pleno y los secundarios de la misma vista, más suaves. */
const FIGURA = `
  <circle cx="30" cy="8" r="6.5"/><rect x="27" y="13" width="6" height="5"/>
  <path d="M16 18 Q30 15 44 18 L42 46 Q30 49 18 46 Z"/>
  <rect x="9.5" y="19" width="6.5" height="20" rx="3.2"/><rect x="44" y="19" width="6.5" height="20" rx="3.2"/>
  <rect x="8.5" y="39" width="5.6" height="17" rx="2.8"/><rect x="45.9" y="39" width="5.6" height="17" rx="2.8"/>
  <circle cx="11.3" cy="58.5" r="2.6"/><circle cx="48.7" cy="58.5" r="2.6"/>
  <rect x="19" y="45" width="10" height="21" rx="5"/><rect x="31" y="45" width="10" height="21" rx="5"/>
  <rect x="20" y="65" width="8" height="16" rx="4"/><rect x="32" y="65" width="8" height="16" rx="4"/>
  <rect x="19.5" y="80" width="9" height="3" rx="1.5"/><rect x="31.5" y="80" width="9" height="3" rx="1.5"/>`;
const ZONAS_SVG = {
  pecho: `<path d="M18.5 21 Q24 19 29.4 21 L29.4 28 Q24 31 18.5 27.5 Z"/><path d="M41.5 21 Q36 19 30.6 21 L30.6 28 Q36 31 41.5 27.5 Z"/>`,
  hombro: `<circle cx="15.5" cy="21" r="4.6"/><circle cx="44.5" cy="21" r="4.6"/>`,
  biceps: `<ellipse cx="12.8" cy="29" rx="3" ry="6.5"/><ellipse cx="47.2" cy="29" rx="3" ry="6.5"/>`,
  antebrazo: `<ellipse cx="11.3" cy="46" rx="2.6" ry="6"/><ellipse cx="48.7" cy="46" rx="2.6" ry="6"/>`,
  abdomen: `<rect x="25.5" y="30" width="9" height="14" rx="2.5"/>`,
  oblicuos: `<ellipse cx="21.5" cy="36" rx="2.3" ry="6"/><ellipse cx="38.5" cy="36" rx="2.3" ry="6"/>`,
  cuadriceps: `<ellipse cx="24" cy="55" rx="4.3" ry="8.5"/><ellipse cx="36" cy="55" rx="4.3" ry="8.5"/>`,
  aductores: `<ellipse cx="28" cy="52" rx="1.6" ry="5"/><ellipse cx="32" cy="52" rx="1.6" ry="5"/>`,
  trapecio: `<path d="M24 17 L30 14 L36 17 L33 27 L27 27 Z"/>`,
  dorsal: `<path d="M19 24 Q23 22 28 27 L27 40 Q22 37 19.5 31 Z"/><path d="M41 24 Q37 22 32 27 L33 40 Q38 37 40.5 31 Z"/>`,
  espalda: `<rect x="26" y="20" width="8" height="12" rx="2"/>`,
  lumbar: `<rect x="26" y="36" width="8" height="8" rx="2"/>`,
  "hombro-post": `<circle cx="15.5" cy="21" r="4.6"/><circle cx="44.5" cy="21" r="4.6"/>`,
  triceps: `<ellipse cx="12.8" cy="29.5" rx="3" ry="6.5"/><ellipse cx="47.2" cy="29.5" rx="3" ry="6.5"/>`,
  gluteo: `<ellipse cx="25" cy="48.5" rx="5" ry="4.3"/><ellipse cx="35" cy="48.5" rx="5" ry="4.3"/>`,
  "gluteo-medio": `<ellipse cx="21.3" cy="45.5" rx="2.6" ry="2.8"/><ellipse cx="38.7" cy="45.5" rx="2.6" ry="2.8"/>`,
  isquios: `<ellipse cx="24" cy="57" rx="4" ry="7.5"/><ellipse cx="36" cy="57" rx="4" ry="7.5"/>`,
  gemelo: `<ellipse cx="24" cy="71" rx="3.4" ry="6"/><ellipse cx="36" cy="71" rx="3.4" ry="6"/>`,
};
const CORAZON = `<path d="M30 70 C12 56 6 44 6 34 C6 25 13 19 20.5 19 C25 19 28.5 21.5 30 25 C31.5 21.5 35 19 39.5 19 C47 19 54 25 54 34 C54 44 48 56 30 70 Z"/>
  <path d="M12 40 H22 L26 32 L31 48 L35 38 H48" fill="none" stroke="var(--card)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;

function iconoMusculo(m = [], { clase = "musculo", titulo = "" } = {}) {
  const lista = (Array.isArray(m) ? m : [m]).filter(Boolean);
  const prin = lista[0];
  const nombre = titulo || lista.map(x => window.MUSCULOS?.[x]?.n || x).join(", ");
  const abre = `<svg class="${clase}" viewBox="0 0 60 84" role="img" aria-label="${nombre}">`;
  if (prin === "cardio") return `${abre}<g fill="var(--accent)">${CORAZON}</g></svg>`;
  if (prin === "cuerpo" || !ZONAS_SVG[prin]) return `${abre}<g fill="var(--accent)" opacity=".75">${FIGURA}</g></svg>`;
  const vista = window.MUSCULOS?.[prin]?.vista || "f";
  const sec = lista.slice(1).filter(x => ZONAS_SVG[x] && (window.MUSCULOS?.[x]?.vista || "f") === vista && !(x === "hombro" && prin === "hombro-post"));
  // De espaldas: línea de la columna para distinguir la vista.
  const espalda = vista === "e" ? `<line x1="30" y1="18" x2="30" y2="45" stroke="var(--card)" stroke-width="1.2" opacity=".9"/>` : "";
  return `${abre}<g fill="var(--fig)">${FIGURA}</g>${espalda}
    <g fill="var(--accent)" opacity=".42">${sec.map(x => ZONAS_SVG[x]).join("")}</g>
    <g fill="var(--accent)">${ZONAS_SVG[prin]}</g></svg>`;
}

/* ---------- Iconos de material (24×24, trazo) ---------- */
const ICONOS_APARATO = {
  maquina: `<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8 8h8M8 11h8M8 14h8M8 17h8"/><path d="M12 3v3"/>`,
  polea: `<circle cx="12" cy="5" r="2.6"/><path d="M12 7.6v8.4"/><path d="M7 16h10l-1 4H8z"/>`,
  mancuernas: `<path d="M8 12h8"/><rect x="3" y="8" width="3" height="8" rx="1"/><rect x="6" y="9.5" width="2" height="5" rx=".6"/><rect x="18" y="8" width="3" height="8" rx="1"/><rect x="16" y="9.5" width="2" height="5" rx=".6"/>`,
  barra: `<path d="M1.5 12h21"/><rect x="4" y="6.5" width="2.6" height="11" rx="1"/><rect x="7" y="8.5" width="1.8" height="7" rx=".6"/><rect x="17.4" y="6.5" width="2.6" height="11" rx="1"/><rect x="15.2" y="8.5" width="1.8" height="7" rx=".6"/>`,
  banco: `<rect x="3" y="9" width="18" height="3.4" rx="1.2"/><path d="M6 12.4V19M18 12.4V19M4 19h4M16 19h4"/>`,
  funcional: `<path d="M8.5 9.5a3.5 3.5 0 1 1 7 0"/><path d="M7.3 9.5h9.4"/><circle cx="12" cy="15" r="5.5"/>`,
  cardio: `<path d="M2 12h4l2.3-5 4.4 10 2.3-5H22"/>`,
  discos: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>`,
};
const iconoAparato = (tipo, clase = "ap-icono") =>
  `<svg class="${clase}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS_APARATO[tipo] || ICONOS_APARATO.maquina}</svg>`;

/* ---------- Pestañas y otros ---------- */
const ICONOS_UI = {
  hoy: `<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M9 15l2 2 4-4"/>`,
  progreso: `<path d="M4 20V11M10 20V5M16 20v-6M22 20H2"/>`,
  ejercicios: ICONOS_APARATO.mancuernas,
  ajustes: `<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>`,
  ubicacion: `<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>`,
  camara: `<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>`,
};
const iconoUI = (n, clase = "ui-icono") =>
  `<svg class="${clase}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS_UI[n] || ""}</svg>`;
