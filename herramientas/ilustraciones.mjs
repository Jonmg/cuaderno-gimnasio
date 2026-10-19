// Dibuja una ilustración de cada máquina o material del catálogo (vista lateral, estilo plano)
// y la guarda en fotos/general/<id>.svg. Sirven de foto genérica hasta que haya una foto real
// del gimnasio. Se ejecuta a mano tras añadir aparatos o cambiar colores:
//   node herramientas/ilustraciones.mjs
// Los colores salen de PALETA; el acento es el de las partes que se agarran o empujan.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PALETA = {
  fondo: "#ECEFF5", suelo: "#D7DDE8", tubo: "#2C3650", tapiz: "#1B2338",
  pila: "#A7B1C4", metal: "#7E899F", cable: "#5E6A82", acento: "#2450E0", luz: "#FFFFFF",
};
const C = PALETA;
const SUELO = 262;

/* ---------- Piezas ---------- */
const tubo = (x1, y1, x2, y2, w = 8) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.tubo}" stroke-width="${w}" stroke-linecap="round"/>`;
const linea = (pts, w = 8, color = C.tubo) => `<polyline points="${pts.map(p => p.join(",")).join(" ")}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const cable = (pts) => linea(pts, 2.5, C.cable);
// Acolchado: rectángulo redondeado girado sobre su centro.
const pad = (cx, cy, w, h, rot = 0, color = C.tapiz) => `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${Math.min(w, h) / 2.4}" fill="${color}" transform="rotate(${rot} ${cx} ${cy})"/>`;
const asa = (x1, y1, x2, y2) => linea([[x1, y1], [x2, y2]], 9, C.acento);
const polea = (x, y, r = 9) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.metal}"/><circle cx="${x}" cy="${y}" r="${r * 0.35}" fill="${C.tubo}"/>`;
const disco = (x, y, r = 30, color = C.tapiz) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/><circle cx="${x}" cy="${y}" r="${r * 0.62}" fill="none" stroke="${C.metal}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r * 0.16}" fill="${C.metal}"/>`;
const sombra = (cx = 200, w = 300) => `<ellipse cx="${cx}" cy="${SUELO + 6}" rx="${w / 2}" ry="9" fill="${C.suelo}"/>`;
// Torre con la pila de placas de peso.
function pila(x, yTop, w = 54, yBase = SUELO) {
  const placas = [];
  const h = (yBase - yTop) * 0.42, y0 = yBase - 14 - h;
  for (let i = 0; i < 9; i++) placas.push(`<rect x="${x + 8}" y="${y0 + i * (h / 9)}" width="${w - 16}" height="${h / 9 - 2}" rx="1.5" fill="${C.pila}"/>`);
  return `${tubo(x, yTop, x, yBase)}${tubo(x + w, yTop, x + w, yBase)}${tubo(x - 4, yTop, x + w + 4, yTop)}${tubo(x - 8, yBase, x + w + 8, yBase)}
    <line x1="${x + w / 2}" y1="${yTop + 6}" x2="${x + w / 2}" y2="${y0}" stroke="${C.metal}" stroke-width="3"/>${placas.join("")}
    <rect x="${x + w - 12}" y="${y0 + h * 0.45}" width="14" height="5" rx="2" fill="${C.acento}"/>`;
}
const base = (x1, x2, y = SUELO) => tubo(x1, y, x2, y, 9);
const barra = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.metal}" stroke-width="5" stroke-linecap="round"/>`;
// Barra con discos vista de frente.
function barraFrente(x1, x2, y, r = 34, n = 2) {
  let s = barra(x1, y, x2, y);
  for (const [lado, x] of [[-1, x1 + 30], [1, x2 - 30]]) for (let i = 0; i < n; i++) {
    const xi = x - lado * i * 13;
    s += `<rect x="${xi - 6}" y="${y - r + i * 6}" width="12" height="${2 * r - i * 12}" rx="3" fill="${C.tapiz}"/>`;
  }
  return s;
}
function mancuerna(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-20" y="-3" width="40" height="6" rx="2" fill="${C.metal}"/>
    <rect x="-30" y="-13" width="12" height="26" rx="3" fill="${C.tapiz}"/><rect x="18" y="-13" width="12" height="26" rx="3" fill="${C.tapiz}"/></g>`;
}

/* ---------- Máquinas (vista lateral; la persona mira a la derecha) ---------- */
const D = {};
// Banco con asiento y respaldo (máquinas sentado). rotRespaldo en grados (0 = vertical).
function asiento(x, ySeat, rotRespaldo = 0, alto = 78) {
  return `${tubo(x + 20, ySeat + 8, x + 20, SUELO)}${pad(x + 30, ySeat, 74, 17)}${pad(x - 2, ySeat - alto / 2 - 4, 17, alto, rotRespaldo)}${tubo(x - 2, ySeat - 8, x - 2, SUELO)}`;
}
D["maq-press-pecho"] = () => sombra() + pila(36, 62) + base(30, 330) + tubo(118, 62, 118, SUELO) + tubo(36, 62, 140, 56) + asiento(140, 186) +
  linea([[140, 56], [228, 92], [262, 118]]) + asa(262, 104, 262, 146);
D["maq-press-inclinado"] = () => sombra() + pila(36, 62) + base(30, 330) + tubo(110, 62, 110, SUELO) + tubo(36, 62, 130, 52) + asiento(150, 192, -24, 86) +
  linea([[130, 52], [214, 62], [254, 84]]) + asa(254, 70, 268, 104);
D["maq-contractora"] = () => sombra() + pila(36, 52) + base(30, 320) + tubo(118, 52, 118, SUELO) + tubo(36, 52, 150, 50) + asiento(150, 190) +
  linea([[150, 50], [226, 58]]) + pad(232, 102, 22, 78, 0, C.acento) + tubo(232, 58, 232, 64, 8);
D["maq-press-hombro"] = () => sombra() + pila(36, 50) + base(30, 320) + tubo(116, 50, 116, SUELO) + tubo(36, 50, 116, 50) + asiento(150, 196, -6, 92) +
  linea([[116, 50], [170, 56], [204, 66]]) + asa(204, 54, 204, 84);
D["maq-laterales"] = () => sombra() + pila(36, 72) + base(30, 320) + tubo(118, 72, 118, SUELO) + asiento(150, 196, 0, 70) +
  linea([[36, 72], [150, 100]]) + pad(196, 104, 66, 18, 8, C.acento) + polea(150, 100, 7);
D["maq-jalon"] = () => sombra() + pila(36, 40) + base(30, 330) + tubo(120, 40, 120, SUELO) + tubo(36, 40, 140, 36) + pad(196, 196, 72, 17) + tubo(190, 204, 190, SUELO) +
  pad(204, 166, 56, 16, 0) + tubo(176, 166, 176, 196, 5) + linea([[140, 36], [230, 46], [262, 74]]) + asa(262, 64, 252, 98);
D["maq-remo"] = () => sombra() + base(40, 360) + pad(120, 204, 70, 17) + tubo(122, 212, 122, SUELO) + pad(214, 146, 18, 82, 6) + tubo(214, 190, 214, SUELO) +
  pila(300, 48, 48) + tubo(300, 48, 260, 48) + linea([[260, 48], [256, 110], [258, 142]]) + asa(246, 142, 270, 142);
D["maq-asistida"] = () => sombra() + base(40, 360) + pila(40, 30) + tubo(120, 24, 120, SUELO) + tubo(40, 30, 300, 24) + tubo(300, 24, 300, SUELO) +
  asa(250, 24, 286, 40) + asa(250, 70, 284, 70) + pad(214, 168, 60, 14, 0, C.acento) + linea([[120, 168], [184, 168]], 6) +
  `<rect x="250" y="222" width="46" height="10" rx="3" fill="${C.tubo}"/><rect x="262" y="194" width="34" height="9" rx="3" fill="${C.tubo}"/>`;
D["maq-curl"] = () => sombra() + pila(36, 70) + base(30, 320) + tubo(118, 70, 118, SUELO) + pad(152, 204, 62, 17) + tubo(152, 212, 152, SUELO) +
  pad(210, 152, 70, 18, -40) + tubo(210, 170, 210, SUELO) + linea([[36, 70], [236, 128]], 3, C.cable) + linea([[236, 130], [262, 98]]) + asa(256, 88, 272, 106);
D["maq-triceps"] = () => sombra() + pila(36, 56) + base(30, 320) + tubo(116, 56, 116, SUELO) + tubo(36, 56, 116, 56) + asiento(150, 196, -4, 82) +
  linea([[116, 56], [158, 90], [196, 150]]) + asa(186, 160, 214, 160);
D["prensa"] = () => sombra(210, 330) + base(40, 360) + linea([[70, SUELO], [330, 70]], 10) + tubo(330, 70, 330, SUELO) + tubo(250, 130, 250, SUELO) +
  pad(118, 212, 18, 74, -62) + pad(92, 236, 54, 16, 18) +
  `<g transform="rotate(-36 240 132)"><rect x="196" y="120" width="92" height="22" rx="5" fill="${C.tubo}"/><rect x="214" y="80" width="12" height="44" rx="3" fill="${C.acento}"/></g>` + disco(266, 112, 26);
D["prensa-horizontal"] = () => sombra() + base(30, 360) + pila(36, 70) + pad(150, 210, 82, 17) + tubo(150, 218, 150, SUELO) + pad(118, 168, 17, 82, -22) +
  tubo(118, 210, 118, SUELO) + tubo(36, 70, 290, 70) + tubo(290, 70, 290, SUELO) + pad(270, 186, 16, 96, 0, C.acento);
D["hack"] = () => sombra() + base(40, 360) + linea([[120, SUELO], [210, 36]], 10) + linea([[150, SUELO], [240, 36]], 6) +
  `<g transform="rotate(-21 196 120)"><rect x="160" y="70" width="22" height="104" rx="9" fill="${C.tapiz}"/><rect x="176" y="60" width="38" height="16" rx="7" fill="${C.tapiz}"/></g>` +
  `<g transform="rotate(-21 250 236)"><rect x="216" y="228" width="78" height="14" rx="4" fill="${C.acento}"/></g>` + disco(228, 92, 20);
D["maq-extension"] = () => sombra() + pila(36, 70) + base(30, 320) + tubo(118, 70, 118, SUELO) + asiento(150, 186, -8, 80) +
  linea([[36, 70], [206, 182]], 3, C.cable) + linea([[206, 182], [228, 226]]) + pad(232, 232, 30, 18, 0, C.acento);
D["maq-femoral-sentado"] = () => sombra() + pila(36, 70) + base(30, 320) + tubo(118, 70, 118, SUELO) + asiento(150, 196, -14, 80) +
  pad(216, 168, 56, 16, 0, C.tapiz) + tubo(216, 168, 196, 120, 6) + linea([[206, 196], [244, 214]]) + pad(250, 218, 28, 18, 0, C.acento);
D["maq-femoral-tumbado"] = () => sombra() + base(30, 360) + pila(36, 70) + linea([[100, 196], [200, 180], [290, 190]], 18, C.tapiz) +
  tubo(150, 196, 150, SUELO) + tubo(260, 196, 260, SUELO) + linea([[36, 70], [300, 172]], 3, C.cable) + linea([[300, 196], [320, 168]]) + pad(324, 160, 30, 18, 0, C.acento);
D["maq-abd-add"] = () => sombra() + pila(36, 70) + base(30, 320) + tubo(118, 70, 118, SUELO) + asiento(150, 196, -18, 84) +
  linea([[36, 70], [236, 196]], 3, C.cable) + pad(238, 200, 20, 58, 0, C.acento) + pad(258, 192, 20, 58, 0, C.tapiz);
D["maq-hip-thrust"] = () => sombra() + base(40, 340) + pad(110, 170, 80, 18, -14) + tubo(112, 178, 112, SUELO) +
  linea([[150, 120], [230, 150]]) + pad(220, 152, 60, 18, 8, C.acento) + tubo(150, 120, 150, SUELO) +
  `<rect x="236" y="236" width="80" height="12" rx="4" fill="${C.tubo}"/>` + disco(160, 112, 26);
D["maq-gluteo"] = () => sombra() + base(40, 340) + pila(40, 60) + tubo(120, 60, 120, SUELO) + pad(170, 122, 18, 70, 20) + tubo(160, 150, 160, SUELO) +
  asa(180, 90, 200, 90) + `<rect x="150" y="236" width="56" height="10" rx="3" fill="${C.tubo}"/>` + linea([[220, 160], [262, 220]]) + pad(268, 228, 40, 14, 30, C.acento);
D["maq-gemelo-pie"] = () => sombra() + base(30, 330) + pila(36, 50) + tubo(118, 50, 118, SUELO) + tubo(36, 50, 200, 50) +
  linea([[200, 50], [214, 92]]) + pad(222, 98, 46, 16, 0, C.acento) + `<rect x="196" y="234" width="70" height="20" rx="4" fill="${C.tubo}"/>`;
D["maq-gemelo-sentado"] = () => sombra() + base(40, 340) + pad(150, 196, 76, 17) + tubo(150, 204, 150, SUELO) + pad(232, 170, 54, 16, 0, C.acento) +
  linea([[232, 178], [270, 210], [270, SUELO]]) + `<rect x="210" y="234" width="64" height="18" rx="4" fill="${C.tubo}"/>` + disco(286, 196, 24);
D["maq-abdominal"] = () => sombra() + pila(36, 50) + base(30, 320) + tubo(118, 50, 118, SUELO) + asiento(150, 200, -6, 76) +
  linea([[36, 50], [160, 60], [214, 96]]) + pad(222, 124, 20, 50, 10, C.acento) + asa(196, 74, 214, 90);
D["maq-lumbar"] = () => sombra() + pila(36, 60) + base(30, 320) + tubo(118, 60, 118, SUELO) + pad(176, 204, 70, 17) + tubo(176, 212, 176, SUELO) +
  pad(146, 150, 20, 66, 10, C.acento) + linea([[36, 60], [146, 120]], 3, C.cable) + `<rect x="226" y="226" width="40" height="12" rx="4" fill="${C.tubo}"/>`;
D["polea-doble"] = () => sombra(200, 340) + base(30, 370) + tubo(60, 30, 60, SUELO) + tubo(340, 30, 340, SUELO) + tubo(40, 30, 360, 30) +
  tubo(84, 30, 84, SUELO, 5) + tubo(316, 30, 316, SUELO, 5) + polea(84, 92) + polea(316, 92) + cable([[84, 92], [176, 150]]) + cable([[316, 92], [224, 150]]) +
  asa(166, 150, 182, 160) + asa(218, 160, 234, 150) + `<rect x="66" y="180" width="12" height="70" rx="2" fill="${C.pila}"/><rect x="322" y="180" width="12" height="70" rx="2" fill="${C.pila}"/>`;
D["polea-alta"] = () => sombra() + base(30, 330) + pila(36, 30) + tubo(36, 30, 236, 30) + polea(236, 38) + cable([[236, 38], [236, 96]]) +
  linea([[176, 92], [292, 92]], 6, C.acento) + pad(236, 206, 70, 17) + tubo(236, 214, 236, SUELO) + pad(236, 176, 56, 15) + tubo(208, 176, 208, 206, 5);
D["polea-baja"] = () => sombra() + base(30, 370) + pad(170, 222, 200, 16) + tubo(110, 230, 110, SUELO) + tubo(240, 230, 240, SUELO) +
  pila(306, 60, 50) + polea(304, 238, 8) + cable([[304, 238], [232, 206]]) + asa(222, 198, 230, 214) + `<rect x="276" y="190" width="12" height="60" rx="3" fill="${C.tubo}"/>`;
D["mancuernas"] = () => sombra(200, 330) + linea([[60, 150], [340, 150]], 7) + linea([[60, 210], [340, 210]], 7) + tubo(70, 150, 70, SUELO) + tubo(330, 150, 330, SUELO) +
  [100, 160, 220, 280].map((x, i) => mancuerna(x, 138, 0.9 + i * 0.08) + mancuerna(x, 196, 1 + i * 0.1)).join("");
D["barra"] = () => sombra(200, 340) + barraFrente(40, 360, 200, 46, 3);
D["barra-z"] = () => sombra(200, 280) + linea([[70, 200], [140, 200], [160, 186], [180, 214], [200, 186], [220, 214], [240, 200], [330, 200]], 5, C.metal) +
  `<rect x="84" y="174" width="12" height="52" rx="3" fill="${C.tapiz}"/><rect x="304" y="174" width="12" height="52" rx="3" fill="${C.tapiz}"/>` + asa(160, 186, 180, 214) + asa(220, 214, 200, 186);
D["banco-press"] = () => sombra(200, 320) + pad(200, 196, 230, 18) + tubo(110, 204, 110, SUELO) + tubo(290, 204, 290, SUELO) + base(90, 310) +
  tubo(96, 90, 96, SUELO) + tubo(80, 98, 104, 98, 6) + disco(96, 92, 40);
D["banco-inclinado"] = () => sombra(200, 320) + pad(170, 166, 150, 18, -32) + pad(258, 214, 70, 17) + tubo(258, 222, 258, SUELO) + tubo(140, 190, 140, SUELO) + base(90, 310) +
  tubo(110, 70, 110, SUELO) + tubo(94, 78, 118, 78, 6) + disco(110, 72, 40);
D["rack"] = () => sombra(200, 340) + base(40, 360) + tubo(90, 24, 90, SUELO) + tubo(310, 24, 310, SUELO) + tubo(70, 24, 330, 24) + tubo(126, 24, 126, SUELO, 5) + tubo(274, 24, 274, SUELO, 5) +
  tubo(84, 190, 316, 190, 5) + barraFrente(30, 370, 110, 40, 2);
D["multipower"] = () => sombra(200, 340) + base(40, 360) + tubo(90, 24, 90, SUELO) + tubo(310, 24, 310, SUELO) + tubo(70, 24, 330, 24) +
  `<line x1="104" y1="30" x2="104" y2="${SUELO}" stroke="${C.metal}" stroke-width="4"/><line x1="296" y1="30" x2="296" y2="${SUELO}" stroke="${C.metal}" stroke-width="4"/>` +
  barraFrente(30, 370, 130, 36, 2) + `<rect x="98" y="122" width="12" height="16" rx="3" fill="${C.acento}"/><rect x="290" y="122" width="12" height="16" rx="3" fill="${C.acento}"/>`;
D["barra-t"] = () => sombra(200, 320) + `<rect x="40" y="244" width="34" height="18" rx="4" fill="${C.tubo}"/>` + barra(58, 248, 300, 150) + disco(296, 152, 40) + asa(250, 168, 266, 196);
D["banco"] = () => sombra(200, 300) + pad(150, 158, 130, 18, -38) + pad(250, 200, 92, 17) + tubo(110, 210, 110, SUELO) + tubo(280, 208, 280, SUELO) + base(80, 320) + tubo(180, 200, 150, 184, 6);
D["banco-scott"] = () => sombra() + base(60, 340) + pad(150, 210, 70, 17) + tubo(150, 218, 150, SUELO) + pad(232, 150, 84, 20, -40) + tubo(222, 170, 222, SUELO) +
  linea([[262, 112], [272, 106]], 6) + asa(262, 100, 282, 100);
D["banco-lumbar"] = () => sombra() + base(60, 340) + linea([[90, SUELO], [300, 120]], 9) + pad(240, 140, 54, 20, -34) + pad(118, 230, 30, 14, -34, C.acento) + tubo(210, 180, 210, SUELO);
D["paralelas"] = () => sombra() + base(60, 340) + tubo(110, 24, 110, SUELO) + tubo(290, 24, 290, SUELO, 6) + tubo(110, 24, 300, 24) + pad(128, 160, 18, 92) +
  linea([[110, 106], [196, 106]], 7) + pad(176, 100, 46, 14) + asa(196, 106, 212, 106) + asa(260, 24, 300, 24);
D["barra-dominadas"] = () => sombra(200, 280) + base(80, 320) + tubo(110, 50, 110, SUELO) + tubo(290, 50, 290, SUELO) + linea([[100, 50], [300, 50]], 9, C.acento) +
  tubo(110, 70, 150, 50, 5) + tubo(290, 70, 250, 50, 5);
D["suelo"] = () => sombra(200, 300) + `<path d="M70 240 L120 196 L340 196 L290 240 Z" fill="${C.acento}"/><path d="M70 240 L290 240 L290 250 L70 250 Z" fill="${C.tapiz}"/>`;
D["kettlebell"] = () => sombra(200, 180) + `<path d="M160 150 C160 100 240 100 240 150" fill="none" stroke="${C.tapiz}" stroke-width="18"/><circle cx="200" cy="200" r="62" fill="${C.tapiz}"/><circle cx="182" cy="182" r="14" fill="${C.luz}" opacity=".12"/>`;
D["bandas"] = () => sombra(200, 260) + `<ellipse cx="160" cy="210" rx="90" ry="34" fill="none" stroke="${C.acento}" stroke-width="12"/><ellipse cx="240" cy="200" rx="90" ry="34" fill="none" stroke="${C.tapiz}" stroke-width="12"/><ellipse cx="200" cy="226" rx="80" ry="26" fill="none" stroke="${C.metal}" stroke-width="10"/>`;
D["fitball"] = () => sombra(200, 200) + `<circle cx="200" cy="168" r="96" fill="${C.acento}"/><path d="M120 120 Q200 90 280 120" fill="none" stroke="${C.luz}" stroke-width="5" opacity=".25"/><circle cx="168" cy="132" r="24" fill="${C.luz}" opacity=".18"/>`;
D["bosu"] = () => sombra(200, 280) + `<path d="M80 236 A120 100 0 0 1 320 236 Z" fill="${C.acento}"/><rect x="72" y="236" width="256" height="16" rx="6" fill="${C.tapiz}"/><path d="M140 170 Q200 150 260 170" fill="none" stroke="${C.luz}" stroke-width="5" opacity=".25"/>`;
D["cajon"] = () => sombra(200, 280) + `<path d="M100 120 L260 120 L300 96 L140 96 Z" fill="${C.metal}"/><path d="M100 120 L260 120 L260 256 L100 256 Z" fill="${C.tapiz}"/><path d="M260 120 L300 96 L300 232 L260 256 Z" fill="${C.tubo}"/><rect x="150" y="168" width="60" height="14" rx="7" fill="${C.acento}"/>`;
D["trx"] = () => sombra(200, 200) + tubo(80, 26, 320, 26, 10) + `<circle cx="200" cy="34" r="8" fill="${C.metal}"/>` + linea([[200, 34], [170, 190]], 5, C.tapiz) + linea([[200, 34], [232, 190]], 5, C.tapiz) +
  asa(156, 196, 184, 196) + asa(218, 196, 246, 196) + `<rect x="178" y="80" width="16" height="22" rx="3" fill="${C.acento}"/>`;
D["balon"] = () => sombra(200, 190) + `<circle cx="200" cy="176" r="86" fill="${C.tapiz}"/><path d="M114 176 Q200 120 286 176 M114 176 Q200 232 286 176" fill="none" stroke="${C.acento}" stroke-width="7"/><circle cx="170" cy="140" r="18" fill="${C.luz}" opacity=".12"/>`;
D["rueda"] = () => sombra(200, 220) + `<circle cx="200" cy="196" r="58" fill="${C.tapiz}"/><circle cx="200" cy="196" r="26" fill="${C.acento}"/>` + linea([[110, 196], [290, 196]], 12, C.metal) +
  `<rect x="96" y="186" width="34" height="20" rx="8" fill="${C.tubo}"/><rect x="270" y="186" width="34" height="20" rx="8" fill="${C.tubo}"/>`;
D["cinta"] = () => sombra(200, 340) + `<path d="M40 246 L300 230 L310 246 L50 258 Z" fill="${C.tapiz}"/>` + linea([[56, 238], [298, 224]], 6, C.metal) + tubo(286, 226, 316, 90) + tubo(260, 140, 316, 130, 6) +
  `<rect x="288" y="66" width="62" height="34" rx="6" fill="${C.tubo}" transform="rotate(-16 318 84)"/><rect x="296" y="74" width="44" height="16" rx="3" fill="${C.acento}" transform="rotate(-16 318 84)"/>`;
D["bici"] = () => sombra() + base(80, 320) + linea([[150, SUELO], [170, 160], [250, 150], [270, SUELO]], 9) + tubo(170, 160, 160, 120) + pad(156, 114, 46, 12) +
  tubo(250, 150, 262, 96) + asa(256, 92, 290, 86) + `<circle cx="214" cy="214" r="34" fill="${C.tapiz}"/><circle cx="214" cy="214" r="12" fill="${C.acento}"/>` + linea([[214, 214], [196, 238]], 5, C.metal);
D["bici-reclinada"] = () => sombra(200, 320) + base(60, 340) + pad(120, 204, 74, 17) + pad(84, 160, 17, 80, -20) + tubo(120, 212, 120, SUELO) + linea([[120, 220], [280, 196], [290, SUELO]], 9) +
  `<circle cx="270" cy="200" r="30" fill="${C.tapiz}"/><circle cx="270" cy="200" r="11" fill="${C.acento}"/>` + tubo(150, 196, 180, 150) + asa(170, 150, 196, 150);
D["bici-spinning"] = () => sombra() + base(70, 330) + linea([[110, SUELO], [150, 150], [260, 130], [290, SUELO]], 10) + tubo(150, 150, 140, 106) + pad(136, 100, 52, 12) +
  tubo(260, 130, 270, 86) + linea([[250, 86], [300, 80], [306, 96]], 9, C.acento) + `<circle cx="282" cy="200" r="46" fill="${C.tapiz}"/><circle cx="282" cy="200" r="16" fill="${C.metal}"/>`;
D["eliptica"] = () => sombra(200, 340) + base(40, 360) + `<circle cx="80" cy="224" r="32" fill="${C.tapiz}"/>` + linea([[80, 224], [200, 236], [300, 226]], 8) +
  pad(176, 228, 46, 10, 0, C.acento) + pad(254, 222, 46, 10, 0, C.acento) + tubo(300, 226, 300, 70) + linea([[300, 100], [256, 60], [244, 40]], 8, C.acento) +
  `<rect x="300" y="60" width="44" height="30" rx="6" fill="${C.tubo}"/>`;
D["remo-ergo"] = () => sombra(200, 360) + linea([[60, 236], [330, 236]], 10) + tubo(80, 236, 80, SUELO) + tubo(320, 236, 320, SUELO) + pad(140, 226, 46, 14) +
  `<circle cx="330" cy="206" r="34" fill="${C.tapiz}"/><circle cx="330" cy="206" r="12" fill="${C.metal}"/>` + `<rect x="280" y="216" width="22" height="18" rx="4" fill="${C.acento}"/>` + cable([[316, 200], [240, 196]]) + asa(232, 186, 232, 208);
D["escaladora"] = () => sombra(200, 300) + `<path d="M100 250 L100 210 L140 210 L140 170 L180 170 L180 130 L220 130 L220 90 L260 90 L260 250 Z" fill="${C.tapiz}"/>` +
  [210, 170, 130, 90].map((y, i) => `<rect x="${100 + i * 40}" y="${y - 6}" width="42" height="8" rx="2" fill="${C.acento}"/>`).join("") +
  tubo(260, 250, 290, 60) + tubo(250, 120, 290, 110, 6) + `<rect x="270" y="40" width="46" height="30" rx="6" fill="${C.tubo}"/>`;

/* ---------- Salida ---------- */
global.window = {};
await import(path.join(raiz, "comun/catalogo.js"));
const APARATOS = global.window.APARATOS;
const dir = path.join(raiz, "fotos/general");
fs.mkdirSync(dir, { recursive: true });
const rutaIndice = path.join(dir, "indice.json");
const indice = fs.existsSync(rutaIndice) ? JSON.parse(fs.readFileSync(rutaIndice, "utf8")) : {};
const faltan = [];
for (const a of APARATOS) {
  if (!D[a.id]) { faltan.push(a.id); continue; }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="${a.nombre}"><rect width="400" height="300" fill="${C.fondo}"/>${D[a.id]()}</svg>\n`;
  fs.writeFileSync(path.join(dir, `${a.id}.svg`), svg.replace(/\n\s+/g, ""));
  // Una foto genérica (tipo "foto") ya registrada manda sobre la ilustración: no se pisa.
  if (indice[a.id]?.tipo !== "foto") indice[a.id] = { archivo: `${a.id}.svg`, tipo: "ilustracion" };
}
fs.writeFileSync(rutaIndice, JSON.stringify(indice, null, 1) + "\n");
console.log(`${APARATOS.length - faltan.length} ilustraciones${faltan.length ? `; faltan: ${faltan.join(", ")}` : ""}`);
