"use strict";
/* Estadísticas de uso con GoatCounter (panel compartido con otras apps de jonmg.github.io).

   - Visitas: una por página, con su ruta (/cuaderno-gimnasio/, /aita/, /jon/, /mikel/) y sin
     parámetros. El título es fijo y sin nombres de persona. Si la app se abre desde el icono de
     la pantalla de inicio, la procedencia de la visita es "app-instalada".
   - Eventos: solo nombres fijos con el prefijo "gim-" (ver README → Estadísticas). Nunca se
     envía nada que haya escrito el usuario: ni pesos, ni notas, ni nombres, ni fotos, ni tokens.
   - GoatCounter no usa cookies. Lo que va tras # en la dirección (el enlace de acceso a GitHub)
     nunca se envía.

   El script oficial (gc.zgo.at/count.js) carga en asíncrono justo después de este archivo. Los
   eventos que llegan antes se guardan en una cola y se envían al cargar. Si no carga (bloqueador,
   sin conexión), la cola se queda en memoria y la app sigue funcionando igual. */

const Estadisticas = (function () {
  const cola = [];
  let contar = null;
  const instalada = () => {
    try { return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; } catch (e) { return false; }
  };
  // Página sin nombre de persona: la carpeta (aita, jon, mikel) o "portada".
  const pagina = () => window.PERFIL?.id || "portada";

  const gc = window.goatcounter = window.goatcounter || {};
  gc.path = () => location.pathname.replace(/index\.html$/, "");
  gc.title = () => `Cuaderno de Fuerza · ${pagina()}`;
  gc.referrer = r => instalada() ? "app-instalada" : r;

  function enviar(nombre) {
    try { contar({ path: nombre, title: nombre, event: true }); } catch (e) {}
  }
  function vaciar() { while (contar && cola.length) enviar(cola.shift()); }
  // count.js asigna goatcounter.count al cargar: en ese momento se envía lo que esperaba en cola.
  try {
    Object.defineProperty(gc, "count", {
      configurable: true, enumerable: true,
      get: () => contar,
      set: f => { contar = typeof f === "function" ? f : null; setTimeout(vaciar, 0); },
    });
  } catch (e) {}

  // Única entrada para los eventos. Solo acepta nombres fijos con el prefijo de la app.
  function evento(nombre) {
    try {
      if (!/^gim-[a-z0-9-]+$/.test(nombre)) return;
      if (contar) enviar(nombre); else if (cola.length < 50) cola.push(nombre);
    } catch (e) {}
  }

  // Eventos que se cuentan como mucho una vez al día y por página (entreno empezado/completo).
  // Recordar cuáles se han enviado hoy no sale del móvil.
  function eventoDelDia(base) {
    try {
      const clave = `cuaderno-${pagina()}-estadisticas`, hoy = claveDia();
      let reg = {};
      try { reg = JSON.parse(localStorage.getItem(clave) || "{}"); } catch (e) {}
      if (reg.fecha !== hoy) reg = { fecha: hoy, hechos: [] };
      if (reg.hechos.includes(base)) return;
      reg.hechos.push(base);
      try { localStorage.setItem(clave, JSON.stringify(reg)); } catch (e) {}
      evento(`${base}-${pagina()}`);
    } catch (e) {}
  }
  function claveDia() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }

  return { evento, eventoDelDia };
})();
const evento = Estadisticas.evento;
const eventoDelDia = Estadisticas.eventoDelDia;
