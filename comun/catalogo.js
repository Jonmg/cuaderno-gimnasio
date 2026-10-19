"use strict";
/* Catálogo para las libretas de rutina: músculos, aparatos (máquinas y material) y ejercicios.

   - MUSCULOS: cada uno con su vista (f = de frente, e = de espaldas) para dibujar el icono.
   - APARATOS: cada máquina o material del gimnasio. La foto se guarda por aparato, así que
     una sola foto de las mancuernas o del banco de press sirve para todos los ejercicios que
     los usan. Ordenados por las zonas del gimnasio.
   - Ejercicios: id único (no cambiarlo: el historial va por id), músculos que trabaja (el
     primero es el principal), variantes = con qué aparato o agarre se hace, tipo (principal o
     aislamiento: decide el descanso), series y rango por defecto, pasos y errores típicos.
     IMPORTANTE: las variantes solo se añaden AL FINAL; el historial guarda su posición.
     oculto: true = sigue existiendo para el historial, pero no sale en las listas porque
     ahora es una variante de otro ejercicio. */

window.MUSCULOS = {
  pecho: { n: "Pecho", vista: "f" }, hombro: { n: "Hombro", vista: "f" }, biceps: { n: "Bíceps", vista: "f" },
  antebrazo: { n: "Antebrazo", vista: "f" }, abdomen: { n: "Abdomen", vista: "f" }, oblicuos: { n: "Oblicuos", vista: "f" },
  cuadriceps: { n: "Cuádriceps", vista: "f" }, aductores: { n: "Aductores", vista: "f" },
  dorsal: { n: "Dorsal", vista: "e" }, espalda: { n: "Espalda media", vista: "e" }, trapecio: { n: "Trapecio", vista: "e" },
  lumbar: { n: "Lumbar", vista: "e" }, "hombro-post": { n: "Hombro posterior", vista: "e" }, triceps: { n: "Tríceps", vista: "e" },
  gluteo: { n: "Glúteo", vista: "e" }, "gluteo-medio": { n: "Glúteo medio", vista: "e" }, isquios: { n: "Isquios", vista: "e" },
  gemelo: { n: "Gemelo", vista: "e" }, cardio: { n: "Cardio" }, cuerpo: { n: "Cuerpo entero" },
};
// Filtros por músculo que se ven como chips (cada uno agrupa uno o varios músculos).
window.FILTROS_MUSCULO = [
  ["Pecho", ["pecho"]], ["Espalda", ["dorsal", "espalda", "trapecio"]], ["Hombro", ["hombro", "hombro-post"]],
  ["Bíceps", ["biceps", "antebrazo"]], ["Tríceps", ["triceps"]], ["Abdomen", ["abdomen", "oblicuos"]], ["Lumbar", ["lumbar"]],
  ["Cuádriceps", ["cuadriceps"]], ["Isquios", ["isquios"]], ["Glúteo", ["gluteo", "gluteo-medio"]], ["Aductores", ["aductores"]],
  ["Gemelo", ["gemelo"]], ["Cardio", ["cardio"]], ["Movilidad", ["cuerpo"]],
];
// Tipos de material, en el orden de las zonas del gimnasio.
window.TIPOS_APARATO = [
  ["maquina", "Máquinas"], ["polea", "Poleas"], ["mancuernas", "Mancuernas"], ["barra", "Barras y racks"],
  ["banco", "Bancos y peso corporal"], ["funcional", "Funcional"], ["cardio", "Cardio"],
];
window.APARATOS = [
  // Zona de fuerza: máquinas guiadas
  ["maq-press-pecho", "Press de pecho (máquina)", "maquina"], ["maq-press-inclinado", "Press inclinado (máquina)", "maquina"],
  ["maq-contractora", "Contractora / pec deck", "maquina", "Sirve para aperturas de pecho y, mirando al respaldo, para hombro posterior."],
  ["maq-press-hombro", "Press de hombro (máquina)", "maquina"], ["maq-laterales", "Elevaciones laterales (máquina)", "maquina"],
  ["maq-jalon", "Jalón convergente (máquina)", "maquina"], ["maq-remo", "Remo con apoyo de pecho", "maquina"],
  ["maq-asistida", "Dominadas y fondos asistidos", "maquina", "El peso que eliges es ayuda: cuanto menos, más difícil."],
  ["maq-curl", "Curl de bíceps (máquina Scott)", "maquina"], ["maq-triceps", "Tríceps (máquina)", "maquina"],
  ["prensa", "Prensa inclinada 45°", "maquina"], ["prensa-horizontal", "Prensa horizontal (sentado)", "maquina"],
  ["hack", "Sentadilla hack / péndulo", "maquina"], ["maq-extension", "Extensión de cuádriceps", "maquina"],
  ["maq-femoral-sentado", "Curl femoral sentado", "maquina"], ["maq-femoral-tumbado", "Curl femoral tumbado", "maquina"],
  ["maq-abd-add", "Abductores / aductores", "maquina", "En muchas salas es la misma máquina: cambia la posición de los apoyos."],
  ["maq-hip-thrust", "Hip thrust / glúteo (máquina)", "maquina"], ["maq-gluteo", "Patada de glúteo (máquina)", "maquina"],
  ["maq-gemelo-pie", "Gemelo de pie (máquina)", "maquina"], ["maq-gemelo-sentado", "Gemelo sentado (máquina)", "maquina"],
  ["maq-abdominal", "Abdominal (máquina)", "maquina"], ["maq-lumbar", "Lumbar (máquina)", "maquina"],
  // Poleas
  ["polea-doble", "Poleas regulables (cruce de poleas)", "polea", "Las dos torres con la altura regulable: casi todo se puede hacer aquí."],
  ["polea-alta", "Polea alta de jalón (con asiento)", "polea"], ["polea-baja", "Polea baja de remo (sentado)", "polea"],
  // Peso libre
  ["mancuernas", "Mancuernas", "mancuernas"],
  ["barra", "Barra olímpica y discos", "barra"], ["barra-z", "Barra Z", "barra"],
  ["banco-press", "Banco de press con soportes", "barra"], ["banco-inclinado", "Banco inclinado con soportes", "barra"],
  ["rack", "Jaula / rack de sentadillas", "barra"], ["multipower", "Multipower (Smith)", "barra", "Barra guiada: más estable que la barra libre."],
  ["barra-t", "Remo en T / landmine", "barra"],
  // Bancos y peso corporal
  ["banco", "Banco regulable", "banco"], ["banco-scott", "Banco Scott (predicador)", "banco"],
  ["banco-lumbar", "Banco de hiperextensiones (romano)", "banco"], ["paralelas", "Paralelas / silla romana", "banco"],
  ["barra-dominadas", "Barra de dominadas", "banco"], ["suelo", "Suelo / colchoneta", "banco"],
  // Zona funcional
  ["kettlebell", "Kettlebell", "funcional"], ["bandas", "Bandas elásticas", "funcional"], ["fitball", "Fitball", "funcional"],
  ["bosu", "Bosu", "funcional"], ["cajon", "Cajón / step", "funcional"], ["trx", "TRX", "funcional"],
  ["balon", "Balón medicinal", "funcional"], ["rueda", "Rueda abdominal", "funcional"],
  // Cardio
  ["cinta", "Cinta de correr", "cardio"], ["bici", "Bicicleta estática", "cardio"], ["bici-reclinada", "Bici reclinada", "cardio"],
  ["bici-spinning", "Bici de ciclo indoor", "cardio"], ["eliptica", "Elíptica", "cardio"], ["remo-ergo", "Remo ergómetro", "cardio"],
  ["escaladora", "Escaladora", "cardio"],
].map(([id, nombre, tipo, nota]) => ({ id, nombre, tipo, nota }));

(function () {
  const L = [];
  const P = "principal", A = "aislamiento";
  // f(id, nombre, músculos, variantes [[nombre, aparato, extra?]], tipo, series, reps, pasos, errores, extra)
  const f = (id, nombre, m, v, tipo, series, reps, pasos, errores, extra = {}) =>
    L.push({ id, nombre, m, variantes: v.map(([n, ap, x]) => ({ n, ap, ...x })), tipo, series, reps, pasos, errores, ...extra });
  const oculto = { oculto: true };

  /* ---------- Pecho ---------- */
  f("press-banca", "Press banca", ["pecho", "triceps", "hombro"],
    [["Con barra", "banco-press"], ["Con mancuernas", "mancuernas"], ["En multipower", "multipower"], ["En máquina", "maq-press-pecho"]], P, 4, [6, 8],
    ["Túmbate con los ojos bajo la barra (o las mancuernas sobre el pecho) y los pies firmes.", "Junta los omóplatos y mantén un pequeño arco natural en la espalda.", "Baja controlando hasta la parte baja del pecho, codos a unos 45°.", "Empuja sin bloquear de golpe. En máquina: asas a la altura del pecho medio."],
    ["Rebotar el peso en el pecho.", "Abrir los codos a 90°: carga el hombro.", "Levantar el glúteo del banco."]);
  f("press-inclinado", "Press inclinado", ["pecho", "hombro", "triceps"],
    [["Con mancuernas", "mancuernas"], ["Con barra", "banco-inclinado"], ["En multipower", "multipower"], ["En máquina", "maq-press-inclinado"]], P, 3, [8, 10],
    ["Banco a 30–45°.", "Baja hasta que los codos queden algo por debajo del banco.", "Empuja hacia arriba juntando ligeramente las manos."],
    ["Inclinar demasiado el banco: pasa a ser press de hombro.", "Dejar caer el peso al final."]);
  f("aperturas", "Aperturas", ["pecho"],
    [["En máquina", "maq-contractora"], ["En poleas", "polea-doble"], ["Con mancuernas", "mancuernas"]], A, 3, [12, 15],
    ["Codos ligeramente flexionados durante todo el recorrido.", "Abre hasta notar estiramiento en el pecho, sin pasar la línea del hombro.", "Cierra como si abrazaras un árbol."],
    ["Bloquear los codos.", "Convertirlo en un press doblando mucho los brazos."]);
  f("flexiones", "Flexiones", ["pecho", "triceps", "abdomen"],
    [["En el suelo", "suelo"], ["Con manos en banco", "banco"], ["En TRX", "trx"]], P, 3, [8, 15],
    ["Manos algo más abiertas que los hombros, cuerpo en línea.", "Baja el pecho hasta casi tocar, codos a 45°.", "Empuja manteniendo el abdomen firme. Con manos en banco es más fácil."],
    ["Dejar caer la cadera.", "Cabeza adelantada."], { sinPeso: true });
  f("pullover", "Pullover", ["dorsal", "pecho"],
    [["Con mancuerna", "mancuernas"], ["En polea", "polea-doble"]], A, 3, [10, 12],
    ["Con mancuerna: tumbado, llévala por encima de la cabeza con codos algo flexionados.", "En polea: de pie, lleva la barra o cuerda hacia los muslos en arco.", "Vuelve hasta notar estiramiento del dorsal."],
    ["Bajar más de lo que permite el hombro.", "Doblar mucho los codos."]);
  f("fondos", "Fondos", ["triceps", "pecho", "hombro"],
    [["Asistidos en máquina", "maq-asistida", { asistido: true }], ["En banco", "banco"], ["En paralelas", "paralelas"]], P, 3, [8, 10],
    ["Brazos estirados y cuerpo recto al empezar.", "Baja hasta que los codos formen unos 90°.", "Empuja hasta estirar sin bloquear de golpe."],
    ["Bajar demasiado: carga el hombro.", "Encoger los hombros hacia las orejas."]);
  f("press-pecho-maquina", "Press de pecho en máquina", ["pecho", "triceps"], [["En máquina", "maq-press-pecho"]], P, 3, [8, 12], [], [], oculto);
  f("press-inclinado-maquina", "Press inclinado en máquina", ["pecho"], [["En máquina", "maq-press-inclinado"]], P, 3, [8, 12], [], [], oculto);
  f("press-mancuernas-plano", "Press plano con mancuernas", ["pecho"], [["Con mancuernas", "mancuernas"]], P, 3, [8, 10], [], [], oculto);
  f("cruce-poleas", "Cruce de poleas", ["pecho"], [["En poleas", "polea-doble"]], A, 3, [12, 15], [], [], oculto);

  /* ---------- Espalda ---------- */
  f("jalon", "Jalón al pecho", ["dorsal", "biceps"],
    [["Agarre neutro", "polea-alta"], ["Agarre supino", "polea-alta"], ["Agarre ancho", "polea-alta"], ["Máquina convergente", "maq-jalon"]], P, 4, [8, 10],
    ["Ajusta el rodillo para que sujete bien los muslos.", "Saca pecho y tira hacia la parte alta del pecho.", "Lleva los codos hacia abajo y atrás; sube controlando."],
    ["Tirar detrás de la nuca.", "Echarse muy atrás para usar el peso del cuerpo."]);
  f("remo", "Remo", ["espalda", "dorsal", "biceps"],
    [["Con mancuerna", "mancuernas"], ["En máquina", "maq-remo"], ["En polea baja", "polea-baja"], ["Con barra", "barra"], ["En T", "barra-t"]], P, 3, [8, 10],
    ["Espalda recta (apoyada en banco, en la máquina o firme si es de pie).", "Tira llevando el codo hacia la cadera.", "Junta los omóplatos al final y vuelve despacio."],
    ["Girar o balancear el tronco.", "Tirar solo con el brazo."]);
  f("dominadas", "Dominadas", ["dorsal", "biceps"], [["En barra", "barra-dominadas"]], P, 3, [5, 10],
    ["Agarre algo más ancho que los hombros.", "Tira hasta que la barbilla pase la barra.", "Baja hasta casi estirar los brazos."],
    ["Balancearse.", "Hacer medio recorrido."], { sinPeso: true });
  f("dominadas-asistidas", "Dominadas asistidas", ["dorsal", "biceps"], [["Asistidas en máquina", "maq-asistida", { asistido: true }]], P, 3, [8, 10],
    ["Elige el contrapeso: es ayuda, cuanto menos, más difícil.", "Rodillas en la plataforma, tira hasta la barbilla sobre el agarre.", "Baja controlando."],
    ["Soltarse de golpe abajo."]);
  f("face-pull", "Face pull / pájaros en polea", ["hombro-post", "espalda"],
    [["Face pull", "polea-doble"], ["Pájaros en polea", "polea-doble"]], A, 3, [12, 15],
    ["Face pull: polea a la altura de la cara con cuerda; tira separando las manos y con los codos altos.", "Pájaros: poleas cruzadas, abre los brazos hacia atrás con codos fijos.", "Aguanta un segundo y vuelve controlando."],
    ["Usar demasiado peso y tirar con la espalda baja."], { nombrePorVariante: true });
  f("hiperextensiones", "Hiperextensiones lumbares", ["lumbar", "gluteo", "isquios"],
    [["En banco romano", "banco-lumbar"], ["En máquina de lumbar", "maq-lumbar"]], A, 3, [12, 15],
    ["Apoya la cadera y cruza los brazos (o sujeta un disco).", "Baja con la espalda recta.", "Sube hasta alinear el cuerpo, sin pasarte."],
    ["Hiperextender la zona lumbar arriba.", "Hacerlo rápido."]);
  f("encogimientos", "Encogimientos de hombros", ["trapecio"],
    [["Con mancuernas", "mancuernas"], ["Con barra", "barra"], ["En multipower", "multipower"]], A, 3, [12, 15],
    ["De pie con el peso a los lados o delante.", "Sube los hombros hacia las orejas.", "Aguanta un segundo y baja."],
    ["Girar los hombros en círculos."]);
  f("remo-polea-baja", "Remo sentado en polea", ["espalda"], [["En polea baja", "polea-baja"]], P, 3, [10, 12], [], [], oculto);
  f("remo-maquina", "Remo en máquina con apoyo de pecho", ["espalda"], [["En máquina", "maq-remo"]], P, 3, [8, 12], [], [], oculto);
  f("remo-barra", "Remo con barra", ["espalda"], [["Con barra", "barra"]], P, 3, [6, 10], [], [], oculto);
  f("pullover-polea", "Pullover en polea alta", ["dorsal"], [["En polea", "polea-doble"]], A, 3, [12, 15], [], [], oculto);

  /* ---------- Hombro ---------- */
  f("press-hombro-mancuernas", "Press de hombro", ["hombro", "triceps"],
    [["Con mancuernas", "mancuernas"], ["En máquina", "maq-press-hombro"], ["Con barra de pie", "barra"], ["En multipower", "multipower"]], P, 3, [8, 10],
    ["Sentado con respaldo vertical (o de pie con glúteos apretados).", "Empuja hacia arriba desde la altura de las orejas.", "Baja hasta la altura de la barbilla."],
    ["Arquear mucho la espalda.", "Bajar demasiado si molesta el hombro."]);
  f("laterales", "Elevaciones laterales", ["hombro"],
    [["Con mancuernas", "mancuernas"], ["En polea", "polea-doble"], ["En máquina", "maq-laterales"]], A, 3, [12, 15],
    ["Codos algo flexionados.", "Sube los brazos por los lados hasta la altura del hombro.", "Baja despacio."],
    ["Subir por encima del hombro.", "Usar impulso del cuerpo."]);
  f("frontales", "Elevaciones frontales", ["hombro"],
    [["Con mancuernas", "mancuernas"], ["En polea", "polea-doble"], ["Con disco", "barra"]], A, 3, [10, 12],
    ["Peso delante de los muslos.", "Sube hasta la altura de los ojos.", "Baja despacio."],
    ["Balancear el tronco."]);
  f("pajaros", "Hombro posterior", ["hombro-post", "espalda"],
    [["Pájaros con mancuernas", "mancuernas"], ["En contractora", "maq-contractora"], ["En poleas", "polea-doble"]], A, 3, [12, 15],
    ["Con mancuernas: tronco inclinado y espalda recta.", "En contractora: sentado mirando al respaldo.", "Abre los brazos hacia atrás con codos algo flexionados y vuelve despacio."],
    ["Subir con impulso.", "Juntar mucho los omóplatos y tirar con la espalda."]);
  f("press-hombro-maquina", "Press de hombro en máquina", ["hombro"], [["En máquina", "maq-press-hombro"]], P, 3, [8, 12], [], [], oculto);
  f("press-militar-barra", "Press militar con barra", ["hombro"], [["Con barra", "barra"]], P, 3, [6, 8], [], [], oculto);
  f("laterales-polea", "Elevación lateral en polea", ["hombro"], [["En polea", "polea-doble"]], A, 3, [12, 15], [], [], oculto);
  f("contractora-posterior", "Deltoides posterior en máquina", ["hombro-post"], [["En contractora", "maq-contractora"]], A, 3, [12, 15], [], [], oculto);

  /* ---------- Bíceps ---------- */
  f("curl", "Curl de bíceps", ["biceps", "antebrazo"],
    [["Con barra", "barra"], ["Con mancuernas", "mancuernas"], ["Con barra Z", "barra-z"], ["En polea", "polea-doble"], ["En máquina", "maq-curl"]], A, 3, [8, 10],
    ["Codos pegados al cuerpo.", "Sube el peso sin mover los codos.", "Baja hasta estirar casi del todo."],
    ["Balancear el cuerpo.", "Adelantar los codos."]);
  f("curl-2", "Curl inclinado o predicador", ["biceps"],
    [["Inclinado con mancuernas", "mancuernas"], ["Banco predicador", "banco-scott"], ["Máquina Scott", "maq-curl"]], A, 3, [10, 12],
    ["Inclinado: banco a 45°, brazos colgando por detrás del cuerpo.", "Predicador o máquina: brazo apoyado en el atril, axila pegada.", "Sube sin despegar el brazo y baja despacio."],
    ["Estirar del todo de golpe con mucho peso en el predicador."], { nombrePorVariante: true });
  f("curl-martillo", "Curl martillo", ["biceps", "antebrazo"],
    [["Con mancuernas", "mancuernas"], ["En polea con cuerda", "polea-doble"]], A, 3, [10, 12],
    ["Palmas mirándose entre sí.", "Sube sin mover los codos.", "Baja controlando."],
    ["Girar la muñeca durante el recorrido."]);
  f("ss-biceps", "Curl de bíceps en polea", ["biceps"], [["En polea", "polea-doble"]], A, 3, [12, 15],
    ["Polea baja con barra o cuerda, codos pegados.", "Sube sin mover los codos.", "Baja manteniendo tensión."], ["Echarse atrás para subir."], oculto);
  f("curl-maquina", "Curl de bíceps en máquina", ["biceps"], [["En máquina", "maq-curl"]], A, 3, [10, 12], [], [], oculto);

  /* ---------- Tríceps ---------- */
  f("triceps-polea", "Extensión de tríceps", ["triceps"],
    [["Polea con barra", "polea-doble"], ["Polea con cuerda", "polea-doble"], ["En máquina", "maq-triceps"]], A, 3, [10, 12],
    ["Polea alta, codos pegados al cuerpo.", "Empuja hasta estirar los brazos (con cuerda, separa las manos al final).", "Sube controlando sin separar los codos."],
    ["Abrir los codos.", "Usar el cuerpo para empujar."]);
  f("ss-triceps", "Extensión de tríceps en polea", ["triceps"], [["En polea", "polea-doble"]], A, 3, [12, 15],
    ["Polea alta, codos pegados al cuerpo.", "Empuja hasta estirar los brazos.", "Sube controlando sin separar los codos."], ["Abrir los codos."], oculto);
  f("frances", "Press francés", ["triceps"],
    [["Con barra Z", "barra-z"], ["Con mancuernas", "mancuernas"]], A, 3, [8, 10],
    ["Tumbado, peso sobre la frente con brazos verticales.", "Dobla solo los codos bajando hacia la frente.", "Estira de nuevo."],
    ["Abrir los codos.", "Bajar demasiado rápido."]);
  f("triceps-tras-nuca", "Extensión de tríceps sobre la cabeza", ["triceps"],
    [["Con mancuerna", "mancuernas"], ["En polea con cuerda", "polea-doble"]], A, 3, [10, 12],
    ["Peso por encima de la cabeza con los codos apuntando arriba.", "Baja por detrás doblando los codos.", "Sube estirando."],
    ["Arquear la espalda.", "Abrir mucho los codos."]);
  f("patada-triceps", "Patada de tríceps", ["triceps"],
    [["Con mancuerna", "mancuernas"], ["En polea", "polea-doble"]], A, 3, [12, 15],
    ["Tronco inclinado y codo pegado al costado.", "Estira el brazo hacia atrás.", "Vuelve sin mover el codo."],
    ["Balancear el brazo."]);
  f("triceps-cuerda", "Tríceps con cuerda", ["triceps"], [["En polea", "polea-doble"]], A, 3, [10, 12], [], [], oculto);
  f("fondos-banco", "Fondos en banco", ["triceps"], [["En banco", "banco"]], A, 3, [10, 15], [], [], { ...oculto, sinPeso: true });

  /* ---------- Pierna: cuádriceps ---------- */
  f("prensa", "Prensa", ["cuadriceps", "gluteo", "isquios"],
    [["Inclinada 45°", "prensa"], ["Horizontal", "prensa-horizontal"]], P, 3, [10, 12],
    ["Espalda y cadera pegadas al respaldo; pies a la anchura de la cadera.", "Baja hasta que las rodillas formen unos 90° sin despegar la cadera.", "Empuja con todo el pie sin bloquear las rodillas."],
    ["Bajar tanto que la zona lumbar se despega.", "Rodillas hacia dentro."]);
  f("sentadilla", "Sentadilla", ["cuadriceps", "gluteo"],
    [["Con barra en rack", "rack"], ["En multipower", "multipower"], ["Goblet con mancuerna", "mancuernas"], ["Goblet con kettlebell", "kettlebell"]], P, 3, [6, 10],
    ["Pies a la anchura de los hombros.", "Baja llevando la cadera atrás y abajo, pecho arriba.", "Sube empujando el suelo con todo el pie."],
    ["Rodillas hacia dentro.", "Redondear la espalda abajo.", "Levantar los talones."]);
  f("hack", "Sentadilla hack", ["cuadriceps", "gluteo"], [["En máquina hack", "hack"]], P, 3, [8, 10],
    ["Espalda pegada al respaldo, pies en mitad de la plataforma.", "Baja controlando.", "Sube sin bloquear rodillas."],
    ["Pies muy bajos si molesta la rodilla."]);
  f("extension", "Extensión de cuádriceps", ["cuadriceps"], [["En máquina", "maq-extension"]], A, 3, [10, 15],
    ["Ajusta el respaldo para que la rodilla quede en el eje de la máquina.", "Estira las piernas en 2 segundos.", "Baja en 3 segundos."],
    ["Dar golpes arriba.", "Mucho peso si hay molestias de rodilla."]);
  f("zancada", "Zancadas", ["cuadriceps", "gluteo"],
    [["Con mancuernas", "mancuernas"], ["Con barra", "rack"], ["En multipower", "multipower"]], P, 3, [8, 10],
    ["Da un paso largo y baja la rodilla de atrás hacia el suelo.", "Rodilla delantera alineada con el pie.", "Empuja con el talón de delante para volver."],
    ["Rodilla delantera hacia dentro.", "Paso demasiado corto."], { porLado: true });
  f("bulgara", "Sentadilla búlgara", ["cuadriceps", "gluteo"],
    [["Con mancuernas", "mancuernas"], ["En multipower", "multipower"]], P, 3, [8, 10],
    ["Pie de atrás apoyado en un banco.", "Baja en vertical hasta que el muslo delantero quede paralelo.", "Sube empujando con el pie de delante."],
    ["Pie delantero demasiado cerca del banco."], { porLado: true });
  f("step-up", "Step-up bajo o zancada estática corta", ["cuadriceps", "gluteo"],
    [["Step-up bajo", "cajon"], ["Zancada estática corta", "mancuernas"]], P, 2, [8, 8],
    ["Step-up: cajón bajo, sube apoyando todo el pie y baja controlando.", "Zancada estática: pies fijos, baja y sube en vertical con recorrido corto.", "Rodilla siempre alineada con el pie."],
    ["Impulsarse con la pierna de abajo.", "Rodilla hacia dentro."], { porLado: true, nombrePorVariante: true });
  f("sentadilla-goblet", "Sentadilla goblet", ["cuadriceps"], [["Con mancuerna", "mancuernas"]], P, 3, [10, 12], [], [], oculto);

  /* ---------- Pierna: isquios ---------- */
  f("femoral", "Curl femoral", ["isquios"],
    [["Sentado en máquina", "maq-femoral-sentado"], ["Tumbado en máquina", "maq-femoral-tumbado"], ["Con fitball", "fitball"]], A, 3, [10, 12],
    ["Rodilla alineada con el eje de la máquina y rodillo sobre el tobillo.", "Dobla las piernas llevando el talón hacia el glúteo.", "Vuelve despacio. Con fitball: tumbado, cadera arriba, acerca el balón con los talones."],
    ["Levantar la cadera.", "Bajar de golpe."]);
  f("rumano", "Peso muerto rumano", ["isquios", "gluteo", "lumbar"],
    [["Con barra", "barra"], ["Con mancuernas", "mancuernas"], ["En multipower", "multipower"], ["Con kettlebell", "kettlebell"]], P, 3, [8, 10],
    ["De pie, peso delante de los muslos, rodillas algo flexionadas.", "Lleva la cadera atrás deslizando el peso pegado a las piernas.", "Baja hasta notar tensión en los isquios y vuelve apretando el glúteo."],
    ["Redondear la espalda.", "Doblar mucho las rodillas: se convierte en sentadilla."]);
  f("peso-muerto", "Peso muerto", ["gluteo", "isquios", "lumbar", "cuadriceps"],
    [["Con barra", "barra"], ["Con mancuernas", "mancuernas"]], P, 3, [5, 6],
    ["Pies bajo la barra, agarre por fuera de las piernas.", "Espalda recta, pecho arriba; empuja el suelo con las piernas.", "Termina erguido con la cadera estirada, sin echarte atrás."],
    ["Redondear la espalda.", "Alejar la barra del cuerpo."]);
  f("buenos-dias", "Buenos días", ["isquios", "lumbar", "gluteo"],
    [["Con barra en rack", "rack"], ["En multipower", "multipower"]], P, 3, [8, 10],
    ["Barra sobre los trapecios, rodillas algo flexionadas.", "Inclina el tronco llevando la cadera atrás con la espalda recta.", "Vuelve arriba apretando el glúteo. Peso ligero."],
    ["Redondear la espalda.", "Bajar más de lo que permiten los isquios."]);
  f("nordico", "Curl nórdico asistido", ["isquios"], [["En el suelo con apoyo", "suelo"], ["Con banda", "bandas"]], A, 3, [4, 6],
    ["De rodillas con los tobillos sujetos.", "Déjate caer hacia delante lo más despacio posible con el cuerpo recto.", "Frena con las manos y vuelve ayudándote."],
    ["Doblar la cadera.", "Hacer demasiadas: es muy exigente."], { sinPeso: true });
  f("femoral-tumbado", "Curl femoral tumbado", ["isquios"], [["Tumbado en máquina", "maq-femoral-tumbado"]], A, 3, [10, 12], [], [], oculto);

  /* ---------- Glúteo y aductores ---------- */
  f("hip-thrust", "Hip thrust", ["gluteo", "isquios"],
    [["Con barra", "barra"], ["En máquina", "maq-hip-thrust"], ["En multipower", "multipower"]], P, 3, [8, 12],
    ["Espalda alta apoyada en un banco, peso sobre la cadera (con protector).", "Sube la cadera hasta alinear tronco y muslos.", "Aprieta el glúteo arriba y baja controlando."],
    ["Arquear la zona lumbar en vez de subir con la cadera."]);
  f("puente-gluteo", "Puente de glúteo", ["gluteo", "isquios"], [["En el suelo", "suelo"]], A, 3, [12, 15],
    ["Tumbado boca arriba, pies apoyados cerca del glúteo.", "Sube la cadera apretando el glúteo.", "Baja despacio."],
    ["Empujar con la espalda baja."], { sinPeso: true });
  f("abductores", "Abductores", ["gluteo-medio"], [["En máquina", "maq-abd-add"], ["Con banda", "bandas"]], A, 3, [12, 15],
    ["Espalda apoyada.", "Abre las piernas hacia fuera.", "Vuelve despacio."], ["Rebotar en la vuelta."]);
  f("aductores", "Aductores", ["aductores"], [["En máquina", "maq-abd-add"], ["En polea", "polea-doble"]], A, 3, [12, 15],
    ["Espalda apoyada, piernas abiertas lo que sea cómodo.", "Cierra las piernas despacio.", "Vuelve sin rebote."], ["Abrir más de lo cómodo."]);
  f("patada-gluteo", "Patada de glúteo", ["gluteo"], [["En polea", "polea-doble"], ["En máquina", "maq-gluteo"]], A, 3, [12, 15],
    ["Apóyate y lleva la pierna atrás con la rodilla casi estirada.", "Aprieta el glúteo al final.", "Vuelve sin arquear la espalda."],
    ["Arquear la zona lumbar."], { porLado: true });

  /* ---------- Gemelo ---------- */
  f("gemelo-pie", "Gemelo de pie", ["gemelo"],
    [["En máquina", "maq-gemelo-pie"], ["En prensa", "prensa"], ["En multipower", "multipower"]], A, 3, [12, 15],
    ["Puntas en el borde del apoyo.", "Sube todo lo posible sobre las puntas.", "Baja lento hasta notar estiramiento."], ["Rebotar abajo."]);
  f("gemelo-sentado", "Gemelo sentado", ["gemelo"], [["En máquina", "maq-gemelo-sentado"]], A, 3, [12, 15],
    ["Rodillas bajo el apoyo, puntas en la plataforma.", "Sube los talones.", "Baja despacio."], ["Recorrido corto."]);

  /* ---------- Core ---------- */
  f("plancha", "Plancha frontal", ["abdomen"], [["En el suelo", "suelo"]], A, 3, [30, 45],
    ["Antebrazos bajo los hombros y cuerpo en línea recta.", "Aprieta abdomen y glúteos.", "Respira con normalidad."],
    ["Dejar caer la cadera.", "Subir el culo."], { unidad: "s", sinPeso: true });
  f("plancha-lateral", "Plancha lateral", ["oblicuos", "abdomen"], [["En el suelo", "suelo"]], A, 3, [20, 40],
    ["Apoya un antebrazo bajo el hombro, cuerpo de lado.", "Sube la cadera hasta alinear el cuerpo.", "Aguanta sin dejarla caer."],
    ["Girar el tronco."], { unidad: "s", sinPeso: true, porLado: true });
  f("crunch-polea", "Crunch abdominal", ["abdomen"], [["En polea", "polea-doble"], ["En máquina", "maq-abdominal"]], A, 3, [12, 15],
    ["Polea: de rodillas, cuerda junto a la cabeza. Máquina: pecho contra el apoyo.", "Flexiona el tronco llevando los codos hacia los muslos.", "Vuelve despacio."],
    ["Tirar con los brazos."]);
  f("rueda", "Rueda abdominal", ["abdomen"], [["Rueda", "rueda"]], A, 3, [8, 12],
    ["De rodillas, manos en la rueda.", "Rueda hacia delante con el abdomen firme.", "Vuelve sin arquear la espalda."],
    ["Ir más lejos de lo que aguantas sin arquear."], { sinPeso: true });
  f("elevacion-piernas", "Elevación de piernas", ["abdomen"], [["En silla romana", "paralelas"], ["Colgado en barra", "barra-dominadas"]], A, 3, [8, 12],
    ["Espalda apoyada en la silla romana o colgado de la barra.", "Sube las rodillas hacia el pecho.", "Baja controlando sin balanceo."],
    ["Balancearse."], { sinPeso: true });
  f("pallof", "Press Pallof", ["oblicuos", "abdomen"], [["En polea", "polea-doble"], ["Con banda", "bandas"]], A, 3, [10, 12],
    ["De lado a la polea a la altura del pecho.", "Empuja al frente sin dejar que el cuerpo gire.", "Vuelve al pecho."],
    ["Girar el tronco hacia la polea."], { porLado: true });
  f("dead-bug", "Dead bug", ["abdomen"], [["En el suelo", "suelo"]], A, 3, [8, 10],
    ["Boca arriba, brazos al techo y rodillas a 90°.", "Estira brazo y pierna contrarios sin despegar la zona lumbar.", "Vuelve y cambia de lado."],
    ["Arquear la espalda."], { sinPeso: true, porLado: true });

  /* ---------- Estabilidad y movilidad ---------- */
  f("equilibrio", "Equilibrio a una pierna", ["cuerpo", "gluteo-medio"],
    [["Con balón", "balon"], ["Sobre bosu", "bosu"], ["En el suelo", "suelo"]], A, 2, [30, 30],
    ["Apoya un pie y mantén la rodilla algo flexionada.", "Con balón: pásalo o lánzalo mientras mantienes el equilibrio.", "En bosu: busca estabilidad antes de añadir movimiento."],
    ["Rodilla hacia dentro.", "Bloquear la rodilla."], { unidad: "s", sinPeso: true, porLado: true });
  f("monster-walk", "Paso lateral con banda", ["gluteo-medio"], [["Con banda", "bandas"]], A, 2, [10, 15],
    ["Banda por encima de las rodillas o en los tobillos.", "Semiflexiona y da pasos laterales.", "Mantén la tensión de la banda."],
    ["Juntar los pies del todo."], { sinPeso: true, porLado: true });
  f("movilidad-hombro", "Movilidad de hombros", ["cuerpo", "hombro"], [["Con banda", "bandas"]], A, 2, [10, 15],
    ["Sujeta la banda con los brazos estirados.", "Pasa por encima de la cabeza hacia atrás y vuelve.", "Ve cerrando el agarre poco a poco."],
    ["Forzar si duele."], { sinPeso: true });
  f("estiramientos", "Estiramientos", ["cuerpo"], [["En colchoneta", "suelo"]], A, 1, [5, 10],
    ["Estira piernas, cadera, espalda y hombros.", "Mantén cada postura 20–30 segundos.", "Sin rebotes ni dolor."],
    ["Rebotar."], { unidad: "min", sinPeso: true });

  /* ---------- Cardio ---------- */
  f("cinta", "Cinta", ["cardio"], [["Cinta", "cinta"]], A, 1, [10, 20],
    ["Empieza caminando y sube el ritmo poco a poco.", "Inclinación si quieres más intensidad sin correr.", "No te agarres a las barras si no lo necesitas."],
    ["Agarrarse con inclinación alta."], { unidad: "min", sinPeso: true });
  f("bici", "Bicicleta", ["cardio"], [["Estática", "bici"], ["Reclinada", "bici-reclinada"], ["Ciclo indoor", "bici-spinning"]], A, 1, [10, 20],
    ["Sillín a la altura de la cadera: rodilla casi estirada abajo.", "Resistencia que te deje hablar a ratos.", "Cadencia constante."],
    ["Sillín bajo: carga la rodilla."], { unidad: "min", sinPeso: true });
  f("eliptica", "Elíptica", ["cardio"], [["Elíptica", "eliptica"]], A, 1, [10, 20],
    ["Pies enteros en los pedales.", "Empuja y tira con los brazos.", "Ritmo constante."], ["Apoyarse solo en las puntas."], { unidad: "min", sinPeso: true });
  f("remo-ergometro", "Remo ergómetro", ["cardio", "espalda"], [["Remo", "remo-ergo"]], A, 1, [8, 15],
    ["Orden al tirar: piernas, tronco, brazos.", "Vuelta al revés: brazos, tronco, piernas.", "Espalda recta."], ["Tirar solo con los brazos."], { unidad: "min", sinPeso: true });
  f("escaladora", "Escaladora", ["cardio", "gluteo"], [["Escaladora", "escaladora"]], A, 1, [8, 15],
    ["Pisa con todo el pie en cada escalón.", "Tronco recto.", "Agárrate solo para equilibrarte."], ["Colgarse de las barras."], { unidad: "min", sinPeso: true });

  window.CATALOGO_BASE = L;
})();
