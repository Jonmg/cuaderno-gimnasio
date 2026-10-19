# Fotos de las máquinas

Fotos compartidas por gimnasio: `fotos/<gimnasio>/<máquina>.jpg`. La app enseña a todos los que
usan ese gimnasio (Ajustes → Perfil → Gimnasio) las fotos de su carpeta. Si alguien tiene una
foto propia de una máquina, en su móvil manda la suya.

## Imágenes genéricas (`fotos/general/`)

Mientras una máquina no tiene foto del gimnasio, la app enseña su imagen genérica: una
ilustración dibujada por `herramientas/ilustraciones.mjs` (se regenera con
`node herramientas/ilustraciones.mjs`) o, si se añade, una foto con licencia libre. Cada imagen
está en `fotos/general/indice.json` con su tipo (`ilustracion` o `foto`) y, para las fotos, autor,
licencia y enlace a la fuente, que la app enseña junto a la imagen.

Orden en cada móvil: foto propia → foto del gimnasio → imagen genérica → icono.

## Cómo llegan las fotos aquí

1. **Desde la app, con GitHub conectado** (Ajustes → Fotos del gimnasio → Conexión con GitHub):
   Ejercicios → Máquinas → *Compartir mis fotos* → *Proponer en GitHub*. Se abre un pull request;
   al aceptarlo, en un par de minutos las ve todo el mundo.
2. **Desde la app, sin GitHub**: *Enviar a quien gestiona la app* genera un archivo con las fotos.
   Se manda por WhatsApp (como documento) o por correo; quien gestiona el repositorio lo importa
   en su app (*Importar fotos recibidas*) y lo propone en GitHub.
3. **A mano en GitHub**: entrar en la carpeta del gimnasio → *Add file* → *Upload files*, con el
   nombre exacto de la tabla. Mejor fotos en horizontal y de unos 1000 px (la app ya las reduce).

## Nombres de archivo

### Máquinas

| Archivo | Máquina |
|---|---|
| `maq-press-pecho.jpg` | Press de pecho (máquina) |
| `maq-press-inclinado.jpg` | Press inclinado (máquina) |
| `maq-contractora.jpg` | Contractora / pec deck |
| `maq-press-hombro.jpg` | Press de hombro (máquina) |
| `maq-laterales.jpg` | Elevaciones laterales (máquina) |
| `maq-jalon.jpg` | Jalón convergente (máquina) |
| `maq-remo.jpg` | Remo con apoyo de pecho |
| `maq-asistida.jpg` | Dominadas y fondos asistidos |
| `maq-curl.jpg` | Curl de bíceps (máquina Scott) |
| `maq-triceps.jpg` | Tríceps (máquina) |
| `prensa.jpg` | Prensa inclinada 45° |
| `prensa-horizontal.jpg` | Prensa horizontal (sentado) |
| `hack.jpg` | Sentadilla hack / péndulo |
| `maq-extension.jpg` | Extensión de cuádriceps |
| `maq-femoral-sentado.jpg` | Curl femoral sentado |
| `maq-femoral-tumbado.jpg` | Curl femoral tumbado |
| `maq-abd-add.jpg` | Abductores / aductores |
| `maq-hip-thrust.jpg` | Hip thrust / glúteo (máquina) |
| `maq-gluteo.jpg` | Patada de glúteo (máquina) |
| `maq-gemelo-pie.jpg` | Gemelo de pie (máquina) |
| `maq-gemelo-sentado.jpg` | Gemelo sentado (máquina) |
| `maq-abdominal.jpg` | Abdominal (máquina) |
| `maq-lumbar.jpg` | Lumbar (máquina) |

### Poleas

| Archivo | Máquina |
|---|---|
| `polea-doble.jpg` | Poleas regulables (cruce de poleas) |
| `polea-alta.jpg` | Polea alta de jalón (con asiento) |
| `polea-baja.jpg` | Polea baja de remo (sentado) |

### Mancuernas

| Archivo | Máquina |
|---|---|
| `mancuernas.jpg` | Mancuernas |

### Barras y racks

| Archivo | Máquina |
|---|---|
| `barra.jpg` | Barra olímpica y discos |
| `barra-z.jpg` | Barra Z |
| `banco-press.jpg` | Banco de press con soportes |
| `banco-inclinado.jpg` | Banco inclinado con soportes |
| `rack.jpg` | Jaula / rack de sentadillas |
| `multipower.jpg` | Multipower (Smith) |
| `barra-t.jpg` | Remo en T / landmine |

### Bancos y peso corporal

| Archivo | Máquina |
|---|---|
| `banco.jpg` | Banco regulable |
| `banco-scott.jpg` | Banco Scott (predicador) |
| `banco-lumbar.jpg` | Banco de hiperextensiones (romano) |
| `paralelas.jpg` | Paralelas / silla romana |
| `barra-dominadas.jpg` | Barra de dominadas |
| `suelo.jpg` | Suelo / colchoneta |

### Funcional

| Archivo | Máquina |
|---|---|
| `kettlebell.jpg` | Kettlebell |
| `bandas.jpg` | Bandas elásticas |
| `fitball.jpg` | Fitball |
| `bosu.jpg` | Bosu |
| `cajon.jpg` | Cajón / step |
| `trx.jpg` | TRX |
| `balon.jpg` | Balón medicinal |
| `rueda.jpg` | Rueda abdominal |

### Cardio

| Archivo | Máquina |
|---|---|
| `cinta.jpg` | Cinta de correr |
| `bici.jpg` | Bicicleta estática |
| `bici-reclinada.jpg` | Bici reclinada |
| `bici-spinning.jpg` | Bici de ciclo indoor |
| `eliptica.jpg` | Elíptica |
| `remo-ergo.jpg` | Remo ergómetro |
| `escaladora.jpg` | Escaladora |
