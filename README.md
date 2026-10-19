# Cuaderno de Fuerza

Libretas de gimnasio para el móvil, una por persona. Sin servidor ni cuentas: cada libreta
guarda sus datos en el navegador del móvil donde se usa (con copia de seguridad en Ajustes).

| Página | Para | Motor |
|---|---|---|
| [`aita/`](https://jonmg.github.io/cuaderno-gimnasio/aita/) | Manolo (Aita) | Recuperación: sesión suave y variada cada día, paseos, señales de alarma |
| [`jon/`](https://jonmg.github.io/cuaderno-gimnasio/jon/) | Jon | Rutina de 3 días (`planes/rutina-3dias.js`) |
| [`mikel/`](https://jonmg.github.io/cuaderno-gimnasio/mikel/) | Mikel | Rutina de 3 días (el mismo plan) |

La raíz es una portada con los enlaces. Si el móvil tenía datos de la primera versión de la
app de Aita (que vivía en la raíz), salta directamente a `aita/` y los recupera.

## Estructura

```
comun/base.js         núcleo: datos por persona, pestañas, copia de seguridad, gráficos
comun/recuperacion.js motor de Aita
comun/rutina.js       motor de rutina fija: series, doble progresión, descansos, deporte, rodilla
comun/compartir.js    fotos compartidas: enviar, importar, proponer como pull request, pasar el acceso
comun/vendor/qrcode.js  generador de QR (qrcode-generator 1.4.4, MIT), solo se carga al pasar el acceso
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
- **Con qué lo haces**: cada ejercicio tiene variantes según la máquina o el material
  (curl de bíceps con barra, mancuernas, barra Z, polea o máquina; curl femoral sentado,
  tumbado o con fitball…). Cada variante lleva su propio historial.
- **Añadir / quitar**: añadir ejercicios extra al día, quitar uno solo hoy, o hacer un
  *Entreno libre* empezando de cero.
- **Buscador por músculo y material**: en la pestaña Ejercicios y al cambiar o añadir.

## Catálogo (`comun/catalogo.js`)

- **Músculos**: cada ejercicio indica los que trabaja; el primero es el principal y es el que
  sale resaltado en el icono (`comun/iconos.js`, figura de frente o de espaldas).
- **Aparatos**: las máquinas y el material de una sala tipo VivaGym (máquinas guiadas, poleas,
  peso libre, bancos, funcional y cardio). **La foto es de la máquina**, no del ejercicio: una
  foto de las mancuernas sirve para todos los ejercicios con mancuernas. Se hacen desde la ficha
  (?) de cualquier ejercicio o desde Ejercicios → Máquinas. Las fotos se guardan en el móvil
  (IndexedDB), reducidas a ~1000 px, y no van en la copia de seguridad.
- **Ejercicios**: con sus variantes (`[nombre, aparato]`), pauta por defecto, pasos y errores
  típicos. Las variantes nuevas se añaden siempre al final: el historial guarda su posición.
  Los que pasaron a ser variante de otro quedan con `oculto: true` para no perder su historial.

## Fotos compartidas del gimnasio

Las fotos de las máquinas se hacen una vez por gimnasio y las ve todo el mundo:

- Viven en `fotos/<gimnasio>/<máquina>.jpg` (ver [`fotos/README.md`](fotos/README.md) con los nombres).
- La app pide la lista de archivos a la API pública de GitHub (sin cuenta, como mucho una vez
  por hora, con copia en el móvil) y enseña esas fotos. La foto propia de cada uno manda en su móvil.
- **Para añadir fotos** (Ejercicios → Máquinas → *Compartir mis fotos*):
  - **Proponer en GitHub** (abre un pull request; al aceptarlo, en un par de minutos las ven
    todos). Solo lo tienen los perfiles con `proponeFotos: true` en su `window.PERFIL` (ahora
    Jon y Mikel) y con GitHub conectado en ese móvil.
  - **Conectar un móvil**: Ajustes → Fotos del gimnasio → pegar el token *fine-grained*
    (acceso solo a este repositorio, Contents y Pull requests en lectura y escritura). Los
    demás móviles no necesitan su propio token: en uno ya conectado, *Pasar el acceso a otro
    móvil* enseña un QR con el enlace `…/#gh=<token>`; al abrirlo, ese móvil queda conectado.
  - **El token nunca va en el código**: el repositorio y la web son públicos y GitHub revoca
    los tokens que encuentra publicados. Vive solo en el almacenamiento de cada móvil.
  - Sin GitHub: *Enviar* genera un archivo con las fotos para mandarlo por WhatsApp (como
    documento) o correo; quien tiene GitHub lo importa en su app y lo propone.
  - O subiéndolas a mano en GitHub con el nombre de la tabla.

## Personalización

- Saludo según la hora y una **frase del día** con el nombre (distinta cada día, la misma todo
  el día). Cambia según el contexto: sesión hecha, objetivo semanal cumplido, varios días sin
  entrenar, día de pierna…
- Nombre y gimnasio en `window.PERFIL` de cada página; se pueden cambiar en Ajustes → Perfil.

## Publicar

GitHub Pages: Settings → Pages → *Deploy from a branch* → `main`, `/ (root)`.

La app propone; quien entrena decide. No sustituye al médico, al fisio ni al entrenador.
