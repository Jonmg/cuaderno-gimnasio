# Cuaderno de Fuerza

Libretas de gimnasio para el móvil, una por persona, pensadas para **VivaGym Miribilla**.
Sin servidor ni cuentas: es una web estática en GitHub Pages y cada libreta guarda sus datos en
el navegador del móvil donde se usa.

App personal, sin relación oficial con VivaGym. Propone; quien entrena decide. No sustituye al
médico, al fisio ni al entrenador.

## Las libretas

| Libreta | Para | Qué hace |
|---|---|---|
| **[Aita](https://jonmg.github.io/cuaderno-gimnasio/aita/)** | Manolo | Recuperar fuerza tras una operación: sesión suave y variada cada día, paseos, señales de alarma |
| **[Jon](https://jonmg.github.io/cuaderno-gimnasio/jon/)** | Jon | Rutina de 3 días con progresión, descansos, fotos de máquinas |
| **[Mikel](https://jonmg.github.io/cuaderno-gimnasio/mikel/)** | Mikel | La misma rutina de 3 días, con sus propios datos |

Portada con los tres enlaces: <https://jonmg.github.io/cuaderno-gimnasio/>. Si un móvil tenía
datos de la primera versión de la app de Manolo (que vivía en la portada), salta solo a `aita/`
y los recupera (`?portada` al final de la dirección evita el salto).

### Instalar en el móvil

Abrir el enlace de la libreta y añadirla a la pantalla de inicio:

- **Android (Chrome):** menú ⋮ → *Añadir a pantalla de inicio* o *Instalar aplicación*.
- **iPhone (Safari):** botón Compartir → *Añadir a pantalla de inicio*.

En iPhone, la app instalada y Safari guardan los datos por separado: conviene usar siempre la
libreta desde el mismo sitio (mejor, desde el icono).

### Los datos

- Todo se guarda **solo en ese móvil** (`localStorage`, una clave por persona). Las fotos de
  máquinas, en IndexedDB.
- **Copia de seguridad** en Ajustes: descargar o copiar como texto, y restaurar. La app avisa si
  pasa un mes sin copia. Las fotos no van en la copia; para no perderlas, se comparten con el
  gimnasio (ver *Fotos de las máquinas*).

## Qué hace cada libreta

### Aita (motor de recuperación, `comun/recuperacion.js`)

- **Hoy:** cómo se encuentra (1–5; un día flojo propone bajar el ritmo), botón *Tengo alguna
  molestia* con las señales para parar y el 112, y el tipo de día.
- **Semana tipo:** lunes, miércoles y viernes gimnasio; martes, jueves y sábado paseo; domingo
  descanso. Cada día se puede cambiar.
- **Gimnasio:** sesión variada cada día (calentamiento, 2 de piernas, 2 de espalda y brazos,
  equilibrio y estiramientos) con 21 ejercicios suaves en máquina. Evita repetir los de la
  sesión anterior, se puede cambiar un ejercicio o pedir otra sesión. Peso, series y
  repeticiones se rellenan con lo de la última vez; si dos veces seguidas fue *fácil*, sugiere
  subir un poco.
- **Paseo:** minutos y kilómetros, con la referencia de la última vez.
- **Progreso:** racha de días, minutos andando por semana, peso en cada máquina e historial.
- **Ajustes:** quitar los ejercicios que el médico o el entrenador desaconsejen.

### Jon y Mikel (motor de rutina, `comun/rutina.js`)

- **Qué día toca:** el siguiente al último entrenado (Día 1 → 2 → 3 → 1), no el día de la
  semana. También *Entreno libre* (empezar de cero) y *Solo deporte*.
- **Cada serie por separado,** con lo de la última vez como sugerencia. Al marcarla arranca el
  **descanso** (90 s principales, 60 s aislamientos; pitido y vibración al terminar) y corre el
  **cronómetro de sesión**.
- **Doble progresión:** si la última vez todas las series obligatorias llegaron al máximo del
  rango, propone subir el incremento de Ajustes (2,5 kg por defecto); en las asistidas, bajar la
  ayuda.
- **Con qué lo haces:** cada ejercicio tiene variantes por máquina o material (curl con barra,
  mancuernas, barra Z, polea o máquina…), cada una con su historial.
- **Adaptar el plan:** cambiar un ejercicio *solo hoy* o *siempre en ese día* (se deshace en
  Ajustes), quitar uno hoy, añadir extras o crear ejercicios propios. Se registra siempre el
  ejercicio que de verdad se hizo.
- **Superseries, calentamiento, rodilla:** el día de pierna pregunta por la rodilla (0–10) y
  qué ejercicio molestó; si se repite, avisa de consultarlo con el fisio.
- **Otro deporte** (pádel, correr…) cuenta para el objetivo semanal.
- **Constancia:** entrenos por semana frente al objetivo (3) y racha de semanas cumplidas.
- **Progreso:** entrenos por semana, evolución por ejercicio y variante, kilos movidos, rodilla,
  deporte e historial.
- **Ejercicios:** catálogo con buscador y filtros por músculo y material, ficha de cada
  ejercicio (músculos, cómo se hace, errores típicos, historial, vídeos) y vista de máquinas.

### En las dos

- Saludo según la hora y una **frase del día** con el nombre, que cambia según el contexto
  (sesión hecha, objetivo cumplido, varios días sin entrenar, día de pierna…).
- Icono con el **músculo** trabajado resaltado en cada ejercicio.
- Modo claro y oscuro según el móvil.

## Fotos de las máquinas

Una foto por **máquina** (no por ejercicio): la de las mancuernas sirve para todos los
ejercicios con mancuernas. En cada móvil se ve, por este orden:

1. **La foto propia** hecha en ese móvil (ficha ? de un ejercicio o Ejercicios → Máquinas).
2. **La foto del gimnasio**, compartida: `fotos/vivagym-miribilla/<máquina>.jpg`.
3. **Una foto genérica** con licencia libre (22 máquinas, `fotos/general/`, créditos en
   [`fotos/general/CREDITOS.md`](fotos/general/CREDITOS.md)).
4. **Una ilustración** de la máquina (todas las demás).

La lista de fotos del gimnasio se pide a la API pública de GitHub (sin cuenta, como mucho una
vez por hora y con copia en el móvil). Los nombres de archivo de cada máquina están en
[`fotos/README.md`](fotos/README.md).

### Compartir fotos con el gimnasio

En Ejercicios → Máquinas → *Compartir mis fotos*:

- **Proponer en GitHub:** sube las fotos a una rama y abre un *pull request*; al aceptarlo, en un
  par de minutos las ve todo el mundo. Solo aparece en los perfiles con `proponeFotos: true`
  (Jon y Mikel) y con GitHub conectado en ese móvil.
- **Enviar a quien gestiona la app:** genera un archivo con las fotos para mandarlo por WhatsApp
  (como documento) o por correo. Quien tiene GitHub lo importa (*Importar fotos recibidas*) y lo
  propone.
- **A mano:** subir el archivo en GitHub, en la carpeta del gimnasio, con el nombre de la tabla.

**Conectar un móvil con GitHub:** Ajustes → Fotos del gimnasio → pegar un token *fine-grained*
con acceso solo a este repositorio y permisos de *Contents* y *Pull requests* en lectura y
escritura. Para conectar otro móvil con el mismo token: en el que ya está conectado, *Pasar el
acceso a otro móvil* enseña un QR (enlace `…/#gh=<token>`); al abrirlo, el otro queda conectado.

El token **nunca va en el código**: el repositorio y la web son públicos y GitHub revoca los
tokens que encuentra publicados. Vive solo en el almacenamiento de cada móvil, no va en la copia
de seguridad y no se envía a las estadísticas.

## Estadísticas

Uso anónimo con [GoatCounter](https://www.goatcounter.com), en el panel
**<https://jon-apps.goatcounter.com>** (compartido con otras apps de jonmg.github.io). Todo lo de
esta app queda bajo `/cuaderno-gimnasio/` y sus eventos empiezan por `gim-`.

**Visitas de página:** una al abrir cada página (`/cuaderno-gimnasio/`, `…/aita/`, `…/jon/`,
`…/mikel/`); cambiar de pestaña no cuenta como visita. El título enviado es fijo y sin nombres
(`Cuaderno de Fuerza · jon`). Si la app se abre desde el icono de la pantalla de inicio, la
procedencia aparece como `app-instalada` (en *Referrers*).

**Eventos** (10 nombres fijos):

| Evento | Cuándo |
|---|---|
| `gim-vista-hoy`, `gim-vista-progreso`, `gim-vista-ejercicios`, `gim-vista-ajustes` | Al cambiar a esa pestaña |
| `gim-entreno-empezado-{aita,jon,mikel}` | Primera actividad del día (serie, ejercicio, paseo o deporte); una vez al día |
| `gim-entreno-completo-{aita,jon,mikel}` | Todas las series obligatorias (o todos los ejercicios) hechas; una vez al día |
| `gim-plan-adaptado` | Cambiar, añadir o crear un ejercicio, o elegir Entreno libre |
| `gim-ficha-abierta` | Abrir la ficha de un ejercicio o de una máquina |
| `gim-foto-hecha` | Guardar una foto de una máquina |
| `gim-foto-compartida` | Enviar el archivo de fotos o crear la propuesta en GitHub |

**Lo que no se mide nunca:** nada que escriba o elija el usuario (pesos, repeticiones, minutos,
notas, nombre, gimnasio, búsquedas, qué ejercicio o máquina, fotos, ajustes de máquina, el token
de GitHub) ni identificadores de ningún tipo; nada de salud (cómo se encuentra, molestias,
rodilla). Sin cookies. Lo que va tras `#` en la dirección nunca se envía.

**Cómo funciona:** el script oficial va en cada HTML, precedido de `comun/estadisticas.js`, que
fija ruta, título y procedencia y tiene la única función para eventos, `evento()` (y
`eventoDelDia()` para los de una vez al día). Los eventos anteriores a que cargue el script
esperan en una cola; si el script no carga (bloqueador, sin conexión), la app funciona igual.
GoatCounter no cuenta en `localhost`.

**Excluir tus visitas:** abre una vez en cada dispositivo
<https://jonmg.github.io/cuaderno-gimnasio/#toggle-goatcounter> (vale cualquier página de la
app). Sale un aviso y desde entonces ese navegador no cuenta; repitiéndolo se vuelve a activar.
La marca se guarda para todo `jonmg.github.io`, así que también excluye tus otras apps.

## Para mantenerla

### Estructura

```
index.html                portada con los enlaces
aita/ jon/ mikel/         una carpeta por persona: index.html (define window.PERFIL) y manifest
comun/base.js             núcleo: datos por persona, pestañas, hoja inferior, fotos, copia, gráficos
comun/recuperacion.js     motor de Aita
comun/rutina.js           motor de rutina (Jon y Mikel)
comun/catalogo.js         músculos, máquinas y ejercicios del catálogo
comun/compartir.js        compartir fotos: enviar, importar, pull request, pasar el acceso
comun/estadisticas.js     estadísticas de uso (GoatCounter)
comun/iconos.js           figura de músculos e iconos (SVG dibujado en código)
comun/estilos.css         estilos y paleta (tokens al principio)
comun/vendor/qrcode.js    generador de QR (qrcode-generator 1.4.4, MIT), solo al pasar el acceso
planes/rutina-3dias.js    el plan de Jon y Mikel, editable como datos
fotos/general/            imágenes genéricas: ilustraciones .svg y fotos libres, indice.json, créditos
fotos/vivagym-miribilla/  fotos compartidas del gimnasio
herramientas/ilustraciones.mjs   dibuja fotos/general/<máquina>.svg
```

### Convenciones

- Código, comentarios y textos en castellano. Sin frameworks ni dependencias nuevas: HTML, CSS y
  JS sin compilar; fuentes de Google Fonts (Anybody y Open Sans).
- **Al cambiar algo de `comun/` o `planes/`**, sube el `?v=` de los `<script>` y `<link>` en los
  cuatro HTML para que los móviles no usen la versión en caché.
- **Los `id` no se cambian** (ejercicios, máquinas, días del plan): el historial va por `id`.
- **Las variantes de un ejercicio solo se añaden al final**: el historial guarda su posición. Si
  un ejercicio pasa a ser variante de otro, se deja con `oculto: true` para no perder su historial.
- Nada que escriba el usuario sale del móvil, salvo las fotos que él mismo decide compartir.

### Añadir una persona

1. Copia la carpeta `jon/` con otro nombre, por ejemplo `ane/`.
2. En `ane/index.html`, en `window.PERFIL`, cambia `id` (`"ane"`), `nombre` y `clave`
   (`"cuaderno-ane"`; debe ser única, porque todas las páginas de jonmg.github.io comparten el
   almacenamiento del navegador). `proponeFotos: true` solo si debe poder proponer fotos.
3. En `ane/manifest.webmanifest`, cambia el nombre. Añade el enlace en `index.html`.
4. Para la libreta de recuperación, copia `aita/` en vez de `jon/`.

Las estadísticas la recogen sola: su página será `/cuaderno-gimnasio/ane/` y sus eventos de
entreno, `gim-entreno-empezado-ane` y `gim-entreno-completo-ane`.

### Cambiar el plan de entrenamiento

Edita `planes/rutina-3dias.js`: días, ejercicios (por `id` del catálogo), series, rango,
descanso, superseries, notas y objetivo semanal. Los campos están explicados al principio del
archivo. Para un plan distinto para otra persona, copia el archivo y apunta a él desde su
`index.html`.

### Añadir máquinas o ejercicios

En `comun/catalogo.js`: cada máquina en `APARATOS` y cada ejercicio con sus músculos, variantes
`[nombre, máquina]`, pauta por defecto, pasos y errores típicos. Después:

```
node herramientas/ilustraciones.mjs
```

para dibujar la ilustración de las máquinas nuevas (si no, se ve su icono). Cada persona puede
crear además sus propios ejercicios desde la app.

### Estilo

Inspirado en la sala, sin usar el logo ni las fotos de VivaGym: naranja `#FD5000` para lo que se
pulsa y el progreso (más oscuro para texto, por contraste), azul petróleo `#254957`/`#6799AB`
para la banda y los iconos, fondo claro, títulos y números en Anybody y texto en Open Sans. Los
tokens están al principio de `comun/estilos.css`; las ilustraciones usan la misma paleta
(`PALETA` en `herramientas/ilustraciones.mjs`).

### Probar en local

```
python3 -m http.server 8000
```

y abrir <http://localhost:8000/jon/> (o `aita/`, `mikel/`). Los datos de local no se mezclan con
los de la web publicada y GoatCounter no cuenta estas visitas. No hay batería de pruebas
automática: los cambios se comprueban en el navegador, a tamaño de móvil y en modo claro y
oscuro.

### Publicar

GitHub Pages: Settings → Pages → *Deploy from a branch* → `main`, `/ (root)`. Cada push a `main`
se publica en un par de minutos.

## Licencias

- Código e ilustraciones: de este proyecto.
- `comun/vendor/qrcode.js`: qrcode-generator, de Kazuhiko Arase, licencia MIT.
- Fotos de `fotos/general/`: Wikimedia Commons, con autor y licencia (CC BY-SA o dominio público)
  en [`fotos/general/CREDITOS.md`](fotos/general/CREDITOS.md); las CC BY-SA se redistribuyen con
  la misma licencia.
