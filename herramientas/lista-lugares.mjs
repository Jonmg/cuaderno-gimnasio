// Lista de lo que se puede y no se puede hacer en cada gimnasio con límites (LUGARES con
// aparatos o soloConFoto), con las mismas reglas que la app:
//   - una máquina está si tiene foto en fotos/<lugar>/ (soloConFoto) o si está en su lista aparatos;
//   - una variante se puede si está su máquina y el lugar no la descarta en sinVariantes;
//   - un ejercicio se propone si se puede alguna de sus variantes.
// Escribe fotos/<lugar>/EJERCICIOS.md y avisa si la lista aparatos no coincide con las fotos.
//   node herramientas/lista-lugares.mjs
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["comun/catalogo.js", "planes/rutina-3dias.js"]) vm.runInContext(fs.readFileSync(path.join(raiz, f), "utf8"), ctx);
const { MUSCULOS, FILTROS_MUSCULO, TIPOS_APARATO, APARATOS, LUGARES, CATALOGO_BASE, PLAN } = ctx.window;

// Los nombres que da el plan a sus ejercicios mandan, como en la app.
const nombrePlan = Object.fromEntries(PLAN.dias.flatMap(d => d.ejercicios.map(e => [e.id, e.nombre])));
const ejercicios = CATALOGO_BASE.filter(e => !e.oculto).map(e => ({ ...e, nombre: nombrePlan[e.id] || e.nombre }));
const EXT = /\.(jpe?g|png|webp)$/i;
let avisos = 0;

for (const [id, l] of Object.entries(LUGARES)) {
  if (!l.aparatos && !l.soloConFoto) continue;
  const carpeta = path.join(raiz, "fotos", id);
  const fotos = fs.existsSync(carpeta) ? fs.readdirSync(carpeta).filter(f => EXT.test(f)).map(f => f.replace(EXT, "")) : [];
  const hay = new Set(l.soloConFoto ? fotos : l.aparatos);
  if (l.soloConFoto) {
    const lista = new Set(l.aparatos || []);
    const sobran = [...lista].filter(ap => !hay.has(ap)), faltan = [...hay].filter(ap => !lista.has(ap));
    if (sobran.length || faltan.length) {
      avisos++;
      console.warn(`⚠ ${l.nombre}: la lista aparatos de comun/catalogo.js no coincide con las fotos.` +
        (sobran.length ? ` Sin foto: ${sobran.join(", ")}.` : "") + (faltan.length ? ` Con foto y fuera de la lista: ${faltan.join(", ")}.` : ""));
    }
  }
  const nombreAp = ap => l.nombres?.[ap] || APARATOS.find(a => a.id === ap)?.nombre || ap;
  const sinVar = l.sinVariantes || {};
  const posible = (e, i) => { const v = e.variantes[i]; return (!v.ap || hay.has(v.ap)) && !(`${e.id}|${i}` in sinVar); };
  const variante = (e, v) => `${v.n || "sin material"}${v.ap ? ` (${nombreAp(v.ap)})` : ""}`;
  const si = ejercicios.filter(e => e.variantes.some((_, i) => posible(e, i)));
  const no = ejercicios.filter(e => !si.includes(e));
  const grupo = e => FILTROS_MUSCULO.find(f => f[1].includes(e.m[0]))?.[0] || MUSCULOS[e.m[0]]?.n || "Otros";
  const porGrupo = lista => FILTROS_MUSCULO.map(([g]) => [g, lista.filter(e => grupo(e) === g)]).filter(([, l2]) => l2.length);

  const md = [];
  md.push(`# Qué se puede hacer en ${l.nombre}`, "");
  md.push("Generado con `node herramientas/lista-lugares.mjs` a partir de las fotos de esta carpeta y de",
    "`LUGARES` en `comun/catalogo.js`, con las mismas reglas que la app. No se edita a mano: si algo",
    "está mal, se cambia la foto o los datos y se vuelve a generar.", "");
  md.push(`- **${hay.size} máquinas y material**${l.soloConFoto ? " con foto del gimnasio: solo eso se propone" : ""}.`,
    `- **${si.length} ejercicios se pueden hacer** y son los únicos que la app enseña y mete en el plan aquí.`,
    `- **${no.length} ejercicios no se pueden hacer** y no se proponen (el plan los cambia por otro del mismo músculo, o ese día no salen).`, "");

  md.push("## Máquinas y material que hay", "", "| Máquina | Archivo |", "|---|---|");
  for (const [t] of TIPOS_APARATO) for (const a of APARATOS.filter(a => a.tipo === t && hay.has(a.id))) md.push(`| ${nombreAp(a.id)} | \`${a.id}.jpg\` |`);
  md.push("");

  md.push("## Ejercicios que se pueden hacer", "");
  for (const [g, lista] of porGrupo(si)) {
    md.push(`### ${g}`, "");
    for (const e of lista) {
      const vs = e.variantes.map((v, i) => ({ v, i })).filter(o => posible(e, o.i));
      md.push(`- **${e.nombre}**: ${vs.map(o => variante(e, o.v)).join(" · ")}`);
    }
    md.push("");
  }

  const descartadas = ejercicios.flatMap(e => e.variantes.map((v, i) => ({ e, v, i })).filter(o => `${o.e.id}|${o.i}` in sinVar));
  if (descartadas.length) {
    md.push("## Variantes que no se pueden aunque esté la máquina", "", "| Ejercicio | Variante | Por qué |", "|---|---|---|");
    for (const { e, v, i } of descartadas) md.push(`| ${e.nombre} | ${variante(e, v)} | ${sinVar[`${e.id}|${i}`]} |`);
    md.push("");
  }

  md.push("## Ejercicios que no se pueden hacer", "");
  for (const [g, lista] of porGrupo(no)) {
    md.push(`### ${g}`, "");
    for (const e of lista) {
      const faltan = [...new Set(e.variantes.filter(v => v.ap && !hay.has(v.ap)).map(v => nombreAp(v.ap)))];
      const motivos = e.variantes.map((v, i) => `${e.id}|${i}` in sinVar ? `${v.n.toLowerCase()} no: ${sinVar[`${e.id}|${i}`]}` : "").filter(Boolean);
      md.push(`- **${e.nombre}**: ${[faltan.length ? `falta ${faltan.join(", o ")}` : "", ...motivos].filter(Boolean).join("; ")}`);
    }
    md.push("");
  }

  md.push("## Cómo cambiar esta lista", "",
    "- **Hay una máquina que no sale:** hazle una foto desde la app y compártela (o súbela aquí con el",
    "  nombre de archivo de [`fotos/README.md`](../README.md)). Al aceptarla, se propone.",
    "- **Sale una máquina que no hay:** en la app, ficha de la máquina → *¿No está? Proponer quitarla*",
    "  (borra su foto). Y quítala de `aparatos` en `comun/catalogo.js`.",
    "- **La máquina está pero no permite una variante** (o al revés): `sinVariantes` en `comun/catalogo.js`.",
    "- Después, `node herramientas/lista-lugares.mjs` para regenerar este archivo.", "");
  fs.writeFileSync(path.join(carpeta, "EJERCICIOS.md"), md.join("\n"));
  console.log(`${l.nombre}: ${hay.size} máquinas, ${si.length} ejercicios sí, ${no.length} no → fotos/${id}/EJERCICIOS.md`);
}
process.exitCode = avisos ? 1 : 0;
