# Cuaderno de Fuerza

Libretas de gimnasio para el móvil, una por persona. Sin servidor ni cuentas: cada libreta
guarda sus datos en el navegador del móvil donde se usa (con copia de seguridad en Ajustes).

| Página | Para | Motor |
|---|---|---|
| [`aita/`](https://jonmg.github.io/cuaderno-gimnasio/aita/) | Aita | Recuperación: sesión suave y variada cada día, paseos, señales de alarma |
| [`jon/`](https://jonmg.github.io/cuaderno-gimnasio/jon/) | Jon | Rutina de 3 días (`planes/rutina-3dias.js`) |
| [`mikel/`](https://jonmg.github.io/cuaderno-gimnasio/mikel/) | Mikel | Rutina de 3 días (el mismo plan) |

La raíz es una portada con los enlaces. Si el móvil tenía datos de la primera versión de la
app de Aita (que vivía en la raíz), salta directamente a `aita/` y los recupera.

## Estructura

```
comun/base.js         núcleo: datos por persona, pestañas, copia de seguridad, gráficos
comun/recuperacion.js motor de Aita
comun/rutina.js       motor de rutina fija: series, doble progresión, descansos, deporte, rodilla
comun/estilos.css
planes/rutina-3dias.js  el plan de Jon y Mikel, editable como datos
<persona>/index.html  define window.PERFIL (nombre, clave de almacenamiento, motor)
```

## Añadir una persona

1. Copia la carpeta `jon/` con otro nombre, por ejemplo `ane/`.
2. En `ane/index.html` cambia `id`, `nombre` y `clave` de `window.PERFIL` (la clave debe ser única:
   todas las páginas de jonmg.github.io comparten el almacenamiento del navegador).
3. En `ane/manifest.webmanifest` cambia el nombre. Añade el enlace en `index.html`.
4. Para otro plan: copia `planes/rutina-3dias.js`, edítalo y apunta a él desde su `index.html`.

Al cambiar código en `comun/`, sube el `?v=` de los `<script>` y `<link>` para que los móviles no
usen la versión en caché.

## Rutina: cómo decide

- **Qué día toca**: el siguiente al último entrenado (Día 1 → 2 → 3 → 1), no el día de la semana.
- **Subir peso (doble progresión)**: si la última vez todas las series obligatorias llegaron al
  máximo del rango, propone subir el incremento de Ajustes (2,5 kg por defecto). En máquinas
  asistidas propone bajar la ayuda.
- **Constancia**: cuenta días entrenados por semana (gimnasio o deporte) frente al objetivo.

## Adaptar el entrenamiento (Jon y Mikel)

- **Cambiar ejercicio**: en cada ejercicio del día, elige otro del catálogo (o créalo). Puede ser
  *solo hoy* o *siempre en ese día del plan* (se deshace en Ajustes). Se registra con el nombre
  del ejercicio que de verdad se hizo, con su propio historial y su propia progresión.
- **Añadir / quitar**: añadir ejercicios extra al día, quitar uno solo hoy, o hacer un
  *Entreno libre* empezando de cero.
- **Catálogo** (`comun/catalogo.js`): unos 75 ejercicios por zona, con cómo se hace y errores
  típicos. Para añadir uno para todos, edítalo ahí; cada persona puede crear los suyos en la app.
- **Ayuda (?)**: ficha de cada ejercicio con foto de la máquina (cámara o galería), cómo la
  ajustas (asiento, agarre…), pasos, historial y enlace a vídeos. Las fotos se guardan en el
  móvil (IndexedDB), reducidas a ~1000 px, y no van en la copia de seguridad.

## Publicar

GitHub Pages: Settings → Pages → *Deploy from a branch* → `main`, `/ (root)`.

La app propone; quien entrena decide. No sustituye al médico, al fisio ni al entrenador.
