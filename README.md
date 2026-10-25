# Cuaderno de Fuerza

Libretas de gimnasio para el móvil, una por persona, pensadas para **VivaGym Miribilla**.
Sin servidor ni cuentas: es una web estática en GitHub Pages y cada libreta guarda sus datos en
el navegador del móvil donde se usa.

App personal, sin relación oficial con VivaGym. Propone; quien entrena decide. No sustituye al
médico, al fisio ni al entrenador.

## Las libretas

| Libreta | Para | Qué hace |
|---|---|---|
| **[Aita](https://jonmg.github.io/cuaderno-gimnasio/aita/)** | Manolo | Recuperar fuerza tras una operación: sesión suave y variada cada día, paseos, señales de alarma, ficha y foto de cada máquina |
| **[VivaGym](https://jonmg.github.io/cuaderno-gimnasio/vivagym/)** | Cualquiera | Libreta de rutina: su nombre, sus días de fuerza y de cardio, sus favoritos, progresión, descansos y fotos de máquinas |
| **[Tekniker](https://jonmg.github.io/cuaderno-gimnasio/tekniker/)** | Cualquiera | La misma libreta, que empieza en el gimnasio de Tekniker (sus colores y sus máquinas) |

Los dos enlaces son **la misma libreta**: en un móvil, los dos leen los mismos datos. El enlace
solo decide el gimnasio con el que se estrena y dónde se está hoy al abrirla; en Ajustes cada
uno marca dónde entrena (uno o los dos). Quien entrena en los dos (Jon) tiene un solo historial.

Los enlaces antiguos `jon/`, `mikel/` y `tu/` siguen funcionando y son también esa libreta, para
que los iconos ya instalados no se rompan. La primera vez que se abre la libreta en un móvil
trae sola los datos de la libreta vieja que haya (ver *Libretas de antes*).

Portada con los enlaces: <https://jonmg.github.io/cuaderno-gimnasio/>. Si un móvil tenía
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

- **Cinco estrellas al día:** en gimnasio, una por bloque de la sesión (calentar, piernas,
  brazos, tronco —equilibrio, lumbares o abdominales—, pies); en paseo, una cada 5 minutos andando. Los días de diálisis y de
  descanso cuentan como cumplidos. Se ve la semana entera (por ejemplo, 12 de 30) y avisa de cada estrella nueva.
- **Sesión paso a paso** (botón *Empezar la sesión*): un ejercicio en pantalla con la foto de la
  máquina, las cifras ya puestas y un botón grande *Hecho*; pregunta cómo ha ido y pasa al
  siguiente. Al terminar, celebración con confeti, lo que ha mejorado y la cuenta de la semana.
- **Enviar mi semana:** imagen con las estrellas, días de gimnasio y paseos para mandarla por
  WhatsApp a la familia (desde Progreso o al terminar).
- **Hoy:** cómo se encuentra (1–5; un día flojo propone bajar el ritmo), botón *Tengo alguna
  molestia* con las señales para parar y el 112, y el tipo de día.
- **Semana tipo:** lunes, miércoles y viernes **diálisis** (marcado, sin entreno); martes,
  jueves y sábado gimnasio (3 por semana); domingo paseo. Cada día se puede cambiar.
- **Paseos todos los días** (tarjeta *Paseos de hoy*, siempre; los días de gimnasio, arriba del todo): varios al día (objetivo 2 o 3).
  *▶ Empezar un paseo* pone un cronómetro que sigue contando aunque se cierre la app o se
  bloquee el móvil; *Terminar* lo apunta con su hora y minutos. Sin cronómetro, botones de +10,
  +15, +20 y +30 min. Cada paseo se puede quitar y el **total del día** (lo que cuenta para las
  estrellas y el progreso) se suma solo y se puede corregir a mano. Si el cronómetro pasa de dos
  horas, pregunta cuánto anduvo de verdad.
- **Gimnasio:** sesión variada cada día (calentamiento, 2 de piernas, 2 de espalda y brazos,
  equilibrio, tronco y estiramientos de pies) con ejercicios suaves en máquina. Los que **suele
  hacer** (`habitual: true`: curl y press de pecho sentado, polea alta a un brazo, gemelo,
  glúteo, lumbares y abdominales en máquina, steps, sentarse y levantarse y elevar piernas en el
  banco) salen mucho más que el resto, y lo de la sesión anterior, menos. **Nada tumbado:** el
  puente de glúteo y los estiramientos en colchoneta están retirados (`retirado: true`, se
  guardan por el historial); al final, estiramiento de gemelo en la pared, de la planta del pie,
  círculos de tobillo o rodar una pelota bajo el pie, sentado o de pie. Evita repetir los de la
  sesión anterior, se puede cambiar un ejercicio o pedir otra sesión. Peso, series y
  repeticiones se rellenan con lo de la última vez; si dos veces seguidas fue *fácil*, sugiere
  subir un poco.
- **Ficha de cada ejercicio** (tocando el músculo o la máquina): foto de la máquina, músculos
  que trabaja, cómo se hace y con qué tener cuidado (pensado para la recuperación), notas de
  cómo ajustarla (se ven en la sesión), historial y vídeos.
- **Ejercicios:** los 23 en uso, por grupos, con la foto de su máquina, para mirarlos antes de ir.
- **Paseo:** ver *Paseos de hoy*; kilómetros opcionales y cómo fueron (fácil, bien, duro).
- **Progreso:** racha de días, estrellas y minutos andando por semana, peso en cada máquina e
  historial.
- **Ajustes:** quitar los ejercicios que el médico o el entrenador desaconsejen, y compartir sus
  fotos de máquinas.

### Libreta de rutina: VivaGym y Tekniker (motor de rutina, `comun/rutina.js`)

- **Plan a medida** (tarjeta en *Hoy* la primera vez y siempre en Ajustes → Tu plan): nombre,
  **días de fuerza** (1–6) y **días de cardio** (0–5) a la semana, y **favoritos**. Con 3 días
  de fuerza el plan es el de siempre (`planes/rutina-3dias.js`); con otros números se arma con
  `planes/plantillas.js`: 1 = cuerpo entero, 2 = cuerpo entero A/B, 4 = torso/pierna ×2,
  5 = los 3 días + torso B + pierna B, 6 = los 3 días + hombro/pecho, espalda/bíceps y pierna B.
  Enseña una semana orientativa (L Fuerza, M Cardio…).
- **Qué día toca:** el siguiente día de fuerza al último entrenado (Día 1 → 2 → 3 → 1), no el
  día de la semana; y **cardio** cuando falta para la semana (alterna con la fuerza mientras
  falten los dos). El día de cardio propone cinta, bici o elíptica en minutos, más core y
  estiramientos opcionales. También *Entreno libre* y *Solo deporte*.
- **Favoritos** (★ en la ficha de un ejercicio o máquina, o Tu plan → Favoritos): un ejercicio
  favorito ocupa el hueco del plan que le corresponde (mismo grupo muscular y tipo); si no tiene
  hueco, entra como extra opcional en el día más parecido (dos como mucho por día). Una máquina
  favorita hace que los ejercicios se propongan en ella cuando se pueda; si ningún ejercicio del
  plan la usa, entra uno suyo como extra. Salen también primero en las listas y en los cambios
  automáticos de Tekniker. Sin azar: los mismos ajustes dan el mismo plan, para que la
  progresión tenga hilo. Los cambios fijos que haga la persona siguen mandando.
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
- **Otro deporte** (pádel, correr…) cuenta como día de cardio.
- **Constancia:** entrenos por semana frente al objetivo (fuerza + cardio, con los dos por
  separado) y racha de semanas cumplidas. Las libretas de antes conservan su objetivo: 3 días de
  fuerza y el resto, de cardio.
- **Progreso:** entrenos por semana, evolución por ejercicio y variante, récords, kilos movidos,
  rodilla, deporte e historial.
- **Ánimos con contexto:** récord personal al superar la mejor marca (más kilos, o más
  repeticiones con los mismos), bienvenida tras una semana o más sin ir, aviso de la última serie
  del día, sesión completa y semana cumplida. Tras tres semanas sin hacer un ejercicio, propone
  repetir peso en vez de subir.
- **Dónde entrenas** (Ajustes → Perfil): VivaGym, Tekniker o los dos; con los dos, un botón en *Hoy*
  (ver *Lugares de entrenamiento*).
- **Álbum de cromos:** cada máquina es un cromo que se consigue al entrenar con ella y se vuelve
  dorado con foto real (Ejercicios → Álbum).
- **Ejercicios:** catálogo con buscador y filtros por músculo y material, ficha de cada
  ejercicio (músculos, cómo se hace, errores típicos, historial, vídeos) y vista de máquinas.

### En todas

- Saludo según la hora y una **frase del día** con el nombre, que cambia según el contexto
  (sesión hecha, objetivo cumplido, varios días sin entrenar, día de pierna…).
- Icono con el **músculo** trabajado resaltado en cada ejercicio, que abre su ficha.
- **Fotos de las máquinas** compartidas: la que haga cualquiera sale en todas las
  libretas una vez subida al gimnasio.
- Modo claro y oscuro según el móvil.

## Fotos de las máquinas

Una foto por **máquina** (no por ejercicio): la de las mancuernas sirve para todos los
ejercicios con mancuernas. En cada móvil se ve, por este orden:

1. **La foto propia** hecha en ese móvil (desde la ficha de un ejercicio o de una máquina).
2. **La foto del gimnasio**, compartida: `fotos/vivagym-miribilla/<máquina>.jpg`.
3. **Una foto genérica** con licencia libre (22 máquinas, `fotos/general/`, créditos en
   [`fotos/general/CREDITOS.md`](fotos/general/CREDITOS.md)).
4. **Una ilustración** de la máquina (todas las demás).

La lista de fotos del gimnasio se pide a la API pública de GitHub (sin cuenta, como mucho una
vez por hora y con copia en el móvil). Los nombres de archivo de cada máquina están en
[`fotos/README.md`](fotos/README.md).

### Compartir fotos con el gimnasio

Desde la ficha, *Compartir con el gimnasio*, o en Ajustes → Fotos del gimnasio → *Compartir mis
fotos* (en la libreta de rutina, también en Ejercicios → Máquinas):

- **Proponer en GitHub:** sube las fotos a una rama y abre un *pull request*; al aceptarlo, en un
  par de minutos las ve todo el mundo. Solo aparece en los móviles con GitHub conectado (el
  token guardado, por el enlace o el QR de acceso; el enlace `jon/` deja además pegarlo a mano).
- **Enviar a quien gestiona la app:** genera un archivo con las fotos para mandarlo por WhatsApp
  (como documento) o por correo. Es lo que ve Manolo. Quien tiene GitHub lo importa (*Importar
  fotos recibidas*) y lo propone.
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

**Eventos** (nombres fijos):

| Evento | Cuándo |
|---|---|
| `gim-vista-hoy`, `gim-vista-progreso`, `gim-vista-ejercicios`, `gim-vista-ajustes` | Al cambiar a esa pestaña |
| `gim-entreno-empezado-{aita,vivagym,tekniker,jon,mikel}` | Primera actividad del día (serie, ejercicio, paseo o deporte); una vez al día |
| `gim-entreno-completo-{aita,vivagym,tekniker,jon,mikel}` | Todas las series obligatorias (o todos los ejercicios) hechas; una vez al día |
| `gim-plan-adaptado` | Cambiar, añadir o crear un ejercicio, o elegir Entreno libre |
| `gim-ficha-abierta` | Abrir la ficha de un ejercicio o de una máquina |
| `gim-foto-hecha` | Guardar una foto de una máquina |
| `gim-foto-compartida` | Enviar el archivo de fotos o crear la propuesta en GitHub |
| `gim-paso-a-paso-aita` | Empezar la sesión paso a paso; una vez al día |
| `gim-semana-enviada` | Enviar (o descargar) la imagen de *Mi semana* |
| `gim-lugar-cambiado` | Cambiar el lugar de entrenamiento (sin decir cuál) |
| `gim-libreta-traida` | La libreta nueva trae los datos de una libreta vieja (sin decir de quién) |
| `gim-lugares-elegidos` | Marcar o desmarcar un gimnasio en Ajustes (sin decir cuál) |
| `gim-paseo-cronometro` | Empezar un paseo con cronómetro (Manolo) |
| `gim-paseo-corregido` | Corregir a mano el total de minutos andados del día (Manolo) |
| `gim-maquina-quitada` | Proponer quitar una máquina de un gimnasio (sin decir cuál) |
| `gim-plan-personalizado` | Cambiar los días de fuerza o de cardio (sin decir cuántos) |
| `gim-favoritos-abiertos` | Abrir la lista de favoritos |
| `gim-favorito-marcado` | Marcar un favorito (sin decir cuál) |

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
aita/                     libreta de Manolo: index.html (define window.PERFIL) y manifest
vivagym/ tekniker/        libreta de rutina para cualquiera, con el gimnasio con que se estrena
jon/ mikel/ tu/           enlaces antiguos: la misma libreta de rutina (iconos ya instalados)
comun/base.js             núcleo: datos por persona, pestañas, hoja inferior, fotos, copia, gráficos
comun/recuperacion.js     motor de Aita (sus ejercicios, con su máquina y cómo se hacen)
comun/rutina.js           motor de rutina (VivaGym y Tekniker)
comun/catalogo.js         músculos, máquinas y ejercicios del catálogo
comun/fichas.js           común a todas las libretas: foto de cada máquina y sus botones
IDEAS.md                  mejoras pensadas y pendientes, para que no se pierdan
comun/compartir.js        compartir fotos: enviar, importar, pull request, pasar el acceso
comun/estadisticas.js     estadísticas de uso (GoatCounter)
comun/iconos.js           figura de músculos e iconos (SVG dibujado en código)
comun/estilos.css         estilos y paleta (tokens al principio)
comun/vendor/qrcode.js    generador de QR (qrcode-generator 1.4.4, MIT), solo al pasar el acceso
planes/rutina-3dias.js    el plan de 3 días, editable como datos
planes/plantillas.js      días para el plan a medida (huecos con candidatos) y el día de cardio
fotos/general/            imágenes genéricas: ilustraciones .svg y fotos libres, indice.json, créditos
fotos/vivagym-miribilla/  fotos compartidas de cada gimnasio (también fotos/tekniker/)
herramientas/ilustraciones.mjs   dibuja fotos/general/<máquina>.svg
herramientas/lista-lugares.mjs   escribe fotos/<lugar>/EJERCICIOS.md: qué se puede y qué no en cada gimnasio
```

### Convenciones

- Código, comentarios y textos en castellano. Sin frameworks ni dependencias nuevas: HTML, CSS y
  JS sin compilar; fuentes de Google Fonts (Anybody y Open Sans).
- **Al cambiar algo de `comun/` o `planes/`**, sube el `?v=` de los `<script>` y `<link>` en los
  HTML (portada y libretas) para que los móviles no usen la versión en caché.
- **Los `id` no se cambian** (ejercicios, máquinas, días del plan): el historial va por `id`.
- **Las variantes de un ejercicio solo se añaden al final**: el historial guarda su posición. Si
  un ejercicio pasa a ser variante de otro, se deja con `oculto: true` para no perder su historial.
- Nada que escriba el usuario sale del móvil, salvo las fotos que él mismo decide compartir.

### Añadir una persona

Para la rutina no hace falta nada: se le pasa el enlace de su gimnasio (`vivagym/` o
`tekniker/`) y pone su nombre al abrirla. Cada móvil tiene su libreta.

Para otra libreta de recuperación como la de Manolo: copia `aita/` (por ejemplo, en `ane/`) y en
su `window.PERFIL` cambia `id` (`"ane"`), `nombre` y `clave` (`"cuaderno-ane"`; debe ser única,
porque todas las páginas de jonmg.github.io comparten el almacenamiento del navegador). Cambia el
nombre en su `manifest.webmanifest` y añade el enlace en `index.html`.

### Libretas de antes

Antes había una libreta de rutina por persona (`cuaderno-jon`, `cuaderno-mikel`, `cuaderno-tu`,
con sus fotos en `cuaderno-fotos-<id>`). Ahora todas las páginas de rutina usan la clave
`cuaderno-rutina` y la base de fotos `cuaderno-fotos-rutina`. La primera vez que se abre la
libreta en un móvil (`LIBRETAS_ANTES` en `comun/rutina.js`, lógica en `comun/base.js`):

- Si hay una libreta vieja con datos, la copia (días, ajustes y fotos propias), pone su nombre
  y sus gimnasios, y avisa. La vieja no se borra.
- Si hay varias, pregunta de quién es (o empezar de cero).
- Si no hay ninguna, empieza vacía con el gimnasio del enlace.

**Ojo con el iPhone:** una web añadida a la pantalla de inicio guarda sus datos aparte de
Safari. Quien la usaba desde el icono debe seguir abriéndola desde ese icono (`jon/` y `mikel/`
ya son la libreta nueva). Si hiciera falta pasar datos entre Safari y el icono, *Copia de
seguridad* → descargar en uno y restaurar en el otro.

### Cambiar el plan de entrenamiento

Edita `planes/rutina-3dias.js`: días, ejercicios (por `id` del catálogo), series, rango,
descanso, superseries y notas. Los campos están explicados al principio del archivo.

Los demás planes salen de `planes/plantillas.js`: cada día es una lista de huecos con sus
candidatos (`ej`, por orden de preferencia) y su pauta; en `semanas`, qué días forman el plan
según los días de fuerza; en `cardio`, el día de cardio. Los `id` de los días no se cambian (el
historial guarda qué día se hizo). Cada persona elige días y favoritos en la app.

### Añadir máquinas o ejercicios

En `comun/catalogo.js`: cada máquina en `APARATOS` y cada ejercicio con sus músculos, variantes
`[nombre, máquina]`, pauta por defecto, pasos y errores típicos. Después:

```
node herramientas/ilustraciones.mjs
```

para dibujar la ilustración de las máquinas nuevas (si no, se ve su icono). Cada persona puede
crear además sus propios ejercicios desde la app.

Los ejercicios de Manolo están aparte, en `CATALOGO` y `FICHAS` de `comun/recuperacion.js`:
cada uno con su máquina (`ap`, un `id` de `APARATOS`), pasos y errores.

### Lugares de entrenamiento

La libreta de rutina ofrece los sitios de su `window.PERFIL` (`"lugares": ["vivagym-miribilla",
"tekniker"]`, y `lugarInicial` según el enlace); cada persona marca en Ajustes en cuáles entrena
(`misLugares`). Cada lugar está en `LUGARES` de `comun/catalogo.js`:

- **Nombre y carpeta de fotos:** el `id` es la carpeta (`fotos/tekniker/`).
- **Tema:** `tema: "tekniker"` activa `:root[data-marca="tekniker"]` en `comun/estilos.css`
  (azul de Tekniker, banda azul marino, detalle amarillo, letra Albert Sans, botones en píldora).
- **Aparatos:** con la lista `aparatos`, la app solo propone las variantes que se pueden hacer
  allí; el ejercicio del plan que no se puede hacer se cambia solo por otro del mismo músculo
  (en Tekniker, Prensa → Sentadilla en multipower, Fondos → Press francés), con *elegir otro*
  por si no convence; si no hay ninguno parecido, ese día no se propone y se dice. Ejercicios,
  Máquinas y Álbum enseñan lo de ese sitio (*Ver todos* para el catálogo entero). El plan de
  Ajustes se enseña tal como queda en el sitio actual.
- **Solo con foto** (`soloConFoto: true`, Tekniker): solo se propone lo que tiene foto del
  gimnasio en `fotos/<id>/` (la app consulta la carpeta en GitHub; la lista `aparatos` es la
  reserva para cuando aún no ha podido, y debe coincidir con las fotos). Para **añadir** una
  máquina: foto y *Compartir* (al aceptar el pull request, se propone). Para **quitar** una que no
  está: en su ficha, *¿No está? Proponer quitarla* (solo en móviles con GitHub conectado) abre un
  pull request que borra su foto. VivaGym no tiene lista: se propone todo el catálogo.
- **Lista de lo que se puede y no se puede** en cada gimnasio con límites:
  [`fotos/tekniker/EJERCICIOS.md`](fotos/tekniker/EJERCICIOS.md). La genera
  `node herramientas/lista-lugares.mjs` con las mismas reglas que la app (y avisa si la lista
  `aparatos` no coincide con las fotos): regenerarla tras cambiar fotos o `sinVariantes`.
- **Variantes que no se pueden** (`sinVariantes`, `"<ejercicio>|<posición de la variante>": "motivo"`):
  aunque la máquina esté, el sitio descarta lo que no permite. En Tekniker la multiestación tiene
  una polea alta y una baja fijas, sin cruce ni tobillera: fuera aperturas y pájaros en poleas,
  aductores y patada de glúteo en polea, y Pallof. En un sitio limitado, la lista de ejercicios,
  sus etiquetas y las fichas solo enseñan lo que se puede hacer allí.
- **Nombres:** `nombres` renombra máquinas del catálogo en ese sitio. En Tekniker, la máquina de
  4 puestos son tres "aparatos": remo (`polea-baja`), jalón (`polea-alta`) y las poleas alta y
  baja (`polea-doble`).
- **Un solo registro:** cambiar de sitio solo cambia lo que se propone. La rotación de días, los
  entrenos de la semana, la última vez, la subida de peso, los récords y el progreso cuentan
  igual en los dos. Cada día guarda dónde se entrenó (se ve en *Últimos días*) y, al volver a un
  sitio, se propone la variante que se usó allí la última vez.

Para añadir un lugar: una entrada en `LUGARES`, su id en `lugares` de los `PERFIL` de rutina (y,
si se quiere, una carpeta con su enlace, como `tekniker/`), la carpeta `fotos/<id>/` y, si se
quiere otro aspecto, un bloque `data-marca` en los estilos.

### Mensajes de la familia (Manolo)

En `ANIMOS_FAMILIA` de `comun/recuperacion.js`, una línea por mensaje:
`{ de: "Jon", texto: "¡Vamos, aita!" }`. En cada celebración sale uno. Como el repositorio es
público, nada personal.

Las mejoras pensadas y aún sin hacer están en [`IDEAS.md`](IDEAS.md).

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
