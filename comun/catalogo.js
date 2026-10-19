"use strict";
/* Catálogo de ejercicios de gimnasio para las libretas de rutina.
   Cada ejercicio: id único (no cambiarlo: el historial va por id), zona, equipo, tipo
   (principal/aislamiento: decide el descanso), series y rango de repeticiones por defecto,
   y la ayuda (músculos, pasos y errores típicos). unidad "s" o "min" para ejercicios por tiempo,
   sinPeso si no se apunta peso, porLado si las repeticiones son por pierna/brazo.
   Los ejercicios del plan usan el mismo id: el plan añade su pauta encima de esta ficha.
   Cada persona puede crear los suyos desde la app (se guardan en su móvil). */
window.ZONAS = ["Pecho", "Espalda", "Hombro", "Bíceps", "Tríceps", "Pierna", "Glúteo", "Gemelo", "Core", "Estabilidad", "Cardio", "Movilidad"];
window.EQUIPOS = ["Máquina", "Polea", "Mancuernas", "Barra", "Peso corporal", "Kettlebell", "Bandas", "Cardio", "Otro"];

(function () {
  const L = [];
  // f(id, nombre, zona, equipo, tipo, series, reps, músculos, pasos, errores, extra)
  const f = (id, nombre, zona, equipo, tipo, series, reps, musculos, pasos, errores, extra = {}) =>
    L.push({ id, nombre, zona, equipo, tipo, series, reps, musculos, pasos, errores, ...extra });
  const P = "principal", A = "aislamiento";

  /* ---------- Pecho ---------- */
  f("press-banca", "Press banca", "Pecho", "Barra", P, 4, [6, 8], "Pectoral, tríceps y hombro anterior",
    ["Túmbate con los ojos bajo la barra y los pies firmes en el suelo.", "Junta los omóplatos y mantén un pequeño arco natural en la espalda.", "Baja controlando hasta rozar la parte baja del pecho, codos a unos 45°.", "Empuja hacia arriba y ligeramente hacia atrás, sin bloquear de golpe."],
    ["Rebotar la barra en el pecho.", "Abrir los codos a 90°: carga el hombro.", "Levantar el glúteo del banco."]);
  f("press-inclinado", "Press inclinado con mancuernas", "Pecho", "Mancuernas", P, 3, [8, 10], "Pectoral superior y hombro anterior",
    ["Banco a 30–45°. Sube las mancuernas apoyándolas en los muslos.", "Baja hasta que los codos queden algo por debajo del banco.", "Empuja juntando ligeramente las mancuernas arriba."],
    ["Inclinar demasiado el banco: pasa a ser press de hombro.", "Dejar caer las mancuernas al final."]);
  f("press-pecho-maquina", "Press de pecho en máquina", "Pecho", "Máquina", P, 3, [8, 12], "Pectoral y tríceps",
    ["Ajusta el asiento para que las asas queden a la altura del pecho medio.", "Espalda pegada al respaldo y omóplatos juntos.", "Empuja sin bloquear los codos y vuelve despacio."],
    ["Asiento demasiado alto o bajo.", "Despegar la espalda del respaldo."]);
  f("press-inclinado-maquina", "Press inclinado en máquina", "Pecho", "Máquina", P, 3, [8, 12], "Pectoral superior",
    ["Asiento para que las asas salgan a la altura de la clavícula.", "Empuja hacia arriba y adelante.", "Controla la vuelta 2–3 segundos."],
    ["Encoger los hombros al empujar."]);
  f("press-mancuernas-plano", "Press plano con mancuernas", "Pecho", "Mancuernas", P, 3, [8, 10], "Pectoral, tríceps y hombro anterior",
    ["Túmbate con las mancuernas sobre el pecho, palmas hacia los pies.", "Baja abriendo un poco hasta notar estiramiento en el pecho.", "Sube juntándolas sin chocarlas."],
    ["Bajar más de lo que el hombro tolera.", "Muñecas dobladas hacia atrás."]);
  f("aperturas", "Aperturas", "Pecho", "Máquina", A, 3, [12, 15], "Pectoral",
    ["Codos ligeramente flexionados durante todo el recorrido.", "Abre hasta notar estiramiento en el pecho, sin pasar la línea del hombro.", "Cierra como si abrazaras un árbol."],
    ["Bloquear los codos.", "Convertirlo en un press doblando mucho los brazos."]);
  f("cruce-poleas", "Cruce de poleas", "Pecho", "Polea", A, 3, [12, 15], "Pectoral",
    ["Poleas altas, un paso adelante y tronco algo inclinado.", "Lleva las manos hacia abajo y al centro, codos fijos.", "Vuelve despacio hasta notar estiramiento."],
    ["Mover los hombros hacia delante.", "Usar impulso del cuerpo."]);
  f("fondos", "Fondos", "Tríceps", "Máquina", P, 3, [8, 10], "Tríceps, pectoral inferior y hombro",
    ["Agarra las paralelas con los brazos estirados y el cuerpo recto.", "Baja hasta que los codos formen unos 90°.", "Empuja hasta estirar sin bloquear de golpe."],
    ["Bajar demasiado: carga el hombro.", "Encoger los hombros hacia las orejas."]);
  f("flexiones", "Flexiones", "Pecho", "Peso corporal", P, 3, [8, 15], "Pectoral, tríceps y core",
    ["Manos algo más abiertas que los hombros, cuerpo en línea.", "Baja el pecho hasta casi tocar el suelo, codos a 45°.", "Empuja manteniendo el abdomen firme."],
    ["Dejar caer la cadera.", "Cabeza adelantada."], { sinPeso: true });
  f("pullover", "Pullover con mancuerna", "Pecho", "Mancuernas", A, 3, [10, 12], "Dorsal y pectoral",
    ["Tumbado, sujeta una mancuerna con las dos manos sobre el pecho.", "Llévala hacia atrás por encima de la cabeza con codos algo flexionados.", "Vuelve hasta la vertical del pecho."],
    ["Bajar más de lo que permite el hombro.", "Arquear mucho la zona lumbar."]);

  /* ---------- Espalda ---------- */
  f("jalon", "Jalón al pecho", "Espalda", "Polea", P, 4, [8, 10], "Dorsal ancho y bíceps",
    ["Ajusta el rodillo para que sujete bien los muslos.", "Saca pecho y tira de la barra hacia la parte alta del pecho.", "Lleva los codos hacia abajo y atrás; sube controlando."],
    ["Tirar detrás de la nuca.", "Echarse muy atrás para usar el peso del cuerpo."]);
  f("remo", "Remo", "Espalda", "Mancuernas", P, 3, [8, 10], "Dorsal, romboides y bíceps",
    ["Espalda recta y apoyada (en banco o en el pecho de la máquina).", "Tira llevando el codo hacia la cadera.", "Junta el omóplato al final y baja despacio."],
    ["Girar el tronco para subir el peso.", "Tirar solo con el brazo."]);
  f("remo-polea-baja", "Remo sentado en polea", "Espalda", "Polea", P, 3, [10, 12], "Dorsal, romboides y trapecio medio",
    ["Rodillas algo flexionadas y espalda recta.", "Tira del agarre hacia el abdomen sacando pecho.", "Vuelve estirando los brazos sin redondear la espalda."],
    ["Balancear el tronco adelante y atrás.", "Encoger los hombros."]);
  f("remo-maquina", "Remo en máquina con apoyo de pecho", "Espalda", "Máquina", P, 3, [8, 12], "Dorsal y romboides",
    ["Pecho apoyado y asiento a la altura que deje los agarres a la del pecho.", "Tira llevando los codos atrás.", "Aguanta un segundo y vuelve controlando."],
    ["Despegar el pecho del apoyo."]);
  f("remo-barra", "Remo con barra", "Espalda", "Barra", P, 3, [6, 10], "Dorsal, romboides y lumbares",
    ["Inclina el tronco unos 45° con la espalda recta y rodillas flexionadas.", "Tira de la barra hacia el ombligo.", "Baja controlando sin perder la postura."],
    ["Redondear la espalda.", "Usar impulso de piernas."]);
  f("dominadas", "Dominadas", "Espalda", "Peso corporal", P, 3, [5, 10], "Dorsal y bíceps",
    ["Agarre algo más ancho que los hombros.", "Tira hasta que la barbilla pase la barra.", "Baja hasta casi estirar los brazos."],
    ["Balancearse.", "Hacer medio recorrido."], { sinPeso: true });
  f("dominadas-asistidas", "Dominadas asistidas en máquina", "Espalda", "Máquina", P, 3, [8, 10], "Dorsal y bíceps",
    ["Elige el contrapeso: es ayuda, cuanto menos, más difícil.", "Rodillas en la plataforma, tira hasta la barbilla sobre el agarre.", "Baja controlando."],
    ["Soltarse de golpe abajo."], { variantes: [{ n: "Asistidas", asistido: true }] });
  f("pullover-polea", "Pullover en polea alta", "Espalda", "Polea", A, 3, [12, 15], "Dorsal ancho",
    ["De pie frente a la polea, brazos casi estirados.", "Lleva la barra o cuerda hacia los muslos en arco.", "Vuelve hasta notar estiramiento del dorsal."],
    ["Doblar mucho los codos."]);
  f("face-pull", "Face pull / pájaros en polea", "Hombro", "Polea", A, 3, [12, 15], "Deltoides posterior y rotadores",
    ["Polea a la altura de la cara con cuerda.", "Tira hacia la cara separando las manos y llevando los codos altos.", "Aguanta un segundo y vuelve controlando."],
    ["Usar demasiado peso y tirar con la espalda baja."]);
  f("hiperextensiones", "Hiperextensiones lumbares", "Espalda", "Peso corporal", A, 3, [12, 15], "Lumbares, glúteo e isquios",
    ["Apoya la cadera en el banco y cruza los brazos.", "Baja con la espalda recta.", "Sube hasta alinear el cuerpo, sin pasarte."],
    ["Hiperextender la zona lumbar arriba.", "Hacerlo rápido."], { sinPeso: true });
  f("encogimientos", "Encogimientos de hombros", "Espalda", "Mancuernas", A, 3, [12, 15], "Trapecio",
    ["De pie con una mancuerna en cada mano.", "Sube los hombros hacia las orejas.", "Aguanta un segundo y baja."],
    ["Girar los hombros en círculos."]);

  /* ---------- Hombro ---------- */
  f("press-hombro-mancuernas", "Press militar con mancuernas", "Hombro", "Mancuernas", P, 3, [8, 10], "Deltoides y tríceps",
    ["Sentado con respaldo vertical, mancuernas a la altura de las orejas.", "Empuja hacia arriba sin chocarlas.", "Baja hasta la altura de la barbilla."],
    ["Arquear mucho la espalda.", "Bajar demasiado si molesta el hombro."]);
  f("press-hombro-maquina", "Press de hombro en máquina", "Hombro", "Máquina", P, 3, [8, 12], "Deltoides y tríceps",
    ["Asiento para que los agarres queden a la altura de los hombros.", "Empuja sin bloquear.", "Baja controlando."],
    ["Despegar la espalda del respaldo."]);
  f("press-militar-barra", "Press militar con barra", "Hombro", "Barra", P, 3, [6, 8], "Deltoides, tríceps y core",
    ["De pie, barra sobre la clavícula y glúteos apretados.", "Empuja en línea recta apartando la cabeza.", "Termina con la barra sobre la cabeza."],
    ["Arquear la espalda baja.", "Empujar la barra hacia delante."]);
  f("laterales", "Elevaciones laterales", "Hombro", "Mancuernas", A, 3, [12, 15], "Deltoides lateral",
    ["De pie, codos algo flexionados.", "Sube los brazos por los lados hasta la altura del hombro.", "Baja despacio."],
    ["Subir por encima del hombro.", "Usar impulso del cuerpo."]);
  f("laterales-polea", "Elevación lateral en polea", "Hombro", "Polea", A, 3, [12, 15], "Deltoides lateral",
    ["Polea baja, de lado, cable por delante del cuerpo.", "Sube el brazo hasta la altura del hombro.", "Vuelve controlando."],
    ["Inclinarse para ayudar."]);
  f("frontales", "Elevaciones frontales", "Hombro", "Mancuernas", A, 3, [10, 12], "Deltoides anterior",
    ["Mancuernas delante de los muslos.", "Sube un brazo o los dos hasta la altura de los ojos.", "Baja despacio."],
    ["Balancear el tronco."]);
  f("pajaros", "Pájaros con mancuernas", "Hombro", "Mancuernas", A, 3, [12, 15], "Deltoides posterior",
    ["Inclina el tronco hacia delante con la espalda recta.", "Abre los brazos hacia los lados con codos algo flexionados.", "Junta un poco los omóplatos arriba y baja."],
    ["Subir con impulso.", "Redondear la espalda."]);
  f("contractora-posterior", "Deltoides posterior en máquina", "Hombro", "Máquina", A, 3, [12, 15], "Deltoides posterior",
    ["En la máquina de aperturas mirando al respaldo.", "Abre los brazos hacia atrás con codos fijos.", "Vuelve despacio."],
    ["Juntar mucho los omóplatos y tirar con la espalda."]);

  /* ---------- Bíceps ---------- */
  f("curl", "Curl de bíceps", "Bíceps", "Barra", A, 3, [8, 10], "Bíceps",
    ["De pie, codos pegados al cuerpo.", "Sube el peso sin mover los codos.", "Baja hasta estirar casi del todo."],
    ["Balancear el cuerpo.", "Adelantar los codos."]);
  f("curl-2", "Curl inclinado o predicador", "Bíceps", "Mancuernas", A, 3, [10, 12], "Bíceps (porción larga y braquial)",
    ["Inclinado: banco a 45°, brazos colgando por detrás del cuerpo.", "Predicador: brazo apoyado en el atril, axila pegada.", "Sube sin despegar el brazo y baja despacio."],
    ["Estirar del todo con mucho peso en el predicador."]);
  f("curl-martillo", "Curl martillo", "Bíceps", "Mancuernas", A, 3, [10, 12], "Braquial y antebrazo",
    ["Palmas mirándose entre sí.", "Sube sin mover los codos.", "Baja controlando."],
    ["Girar la muñeca durante el recorrido."]);
  f("curl-maquina", "Curl de bíceps en máquina", "Bíceps", "Máquina", A, 3, [10, 12], "Bíceps",
    ["Ajusta el asiento para que el codo quede alineado con el eje.", "Sube y aprieta arriba.", "Baja despacio."],
    ["Asiento mal ajustado: el codo se despega."]);
  f("ss-biceps", "Curl de bíceps en polea", "Bíceps", "Polea", A, 3, [12, 15], "Bíceps",
    ["Polea baja con barra o cuerda, codos pegados.", "Sube sin mover los codos.", "Baja manteniendo tensión."],
    ["Echarse atrás para subir."]);

  /* ---------- Tríceps ---------- */
  f("triceps-polea", "Extensión de tríceps en polea", "Tríceps", "Polea", A, 3, [10, 12], "Tríceps",
    ["Polea alta, codos pegados al cuerpo.", "Empuja hasta estirar los brazos.", "Sube controlando sin separar los codos."],
    ["Abrir los codos.", "Usar el cuerpo para empujar."]);
  f("ss-triceps", "Extensión de tríceps en polea", "Tríceps", "Polea", A, 3, [12, 15], "Tríceps",
    ["Polea alta, codos pegados al cuerpo.", "Empuja hasta estirar los brazos.", "Sube controlando sin separar los codos."],
    ["Abrir los codos.", "Usar el cuerpo para empujar."], { oculto: true });
  f("triceps-cuerda", "Tríceps con cuerda", "Tríceps", "Polea", A, 3, [10, 12], "Tríceps",
    ["Polea alta con cuerda, codos fijos.", "Empuja abajo y separa las manos al final.", "Vuelve despacio."],
    ["Mover los codos adelante y atrás."]);
  f("frances", "Press francés", "Tríceps", "Barra", A, 3, [8, 10], "Tríceps",
    ["Tumbado, barra Z sobre la frente con brazos verticales.", "Dobla solo los codos bajando la barra hacia la frente.", "Estira de nuevo."],
    ["Abrir los codos.", "Bajar demasiado rápido."]);
  f("triceps-tras-nuca", "Extensión de tríceps sobre la cabeza", "Tríceps", "Mancuernas", A, 3, [10, 12], "Tríceps (porción larga)",
    ["Sentado, una mancuerna con las dos manos por encima de la cabeza.", "Baja por detrás doblando los codos.", "Sube estirando."],
    ["Arquear la espalda.", "Abrir mucho los codos."]);
  f("fondos-banco", "Fondos en banco", "Tríceps", "Peso corporal", A, 3, [10, 15], "Tríceps",
    ["Manos en el borde del banco, piernas delante.", "Baja doblando los codos hasta unos 90°.", "Empuja hasta arriba."],
    ["Bajar demasiado: carga el hombro."], { sinPeso: true });
  f("patada-triceps", "Patada de tríceps", "Tríceps", "Mancuernas", A, 3, [12, 15], "Tríceps",
    ["Tronco inclinado y codo pegado al costado.", "Estira el brazo hacia atrás.", "Vuelve sin mover el codo."],
    ["Balancear el brazo."]);

  /* ---------- Pierna ---------- */
  f("prensa", "Prensa inclinada", "Pierna", "Máquina", P, 3, [10, 12], "Cuádriceps, glúteo e isquios",
    ["Espalda y cadera pegadas al respaldo; pies a la anchura de la cadera.", "Baja hasta que las rodillas formen unos 90° sin despegar la cadera.", "Empuja con todo el pie sin bloquear las rodillas."],
    ["Bajar tanto que la zona lumbar se despega.", "Rodillas hacia dentro."]);
  f("sentadilla", "Sentadilla con barra", "Pierna", "Barra", P, 3, [6, 8], "Cuádriceps, glúteo y core",
    ["Barra sobre los trapecios, pies a la anchura de los hombros.", "Baja llevando la cadera atrás y abajo, pecho arriba.", "Sube empujando el suelo."],
    ["Rodillas hacia dentro.", "Redondear la espalda abajo."]);
  f("sentadilla-goblet", "Sentadilla goblet", "Pierna", "Mancuernas", P, 3, [10, 12], "Cuádriceps y glúteo",
    ["Sujeta una mancuerna o kettlebell pegada al pecho.", "Baja entre las piernas con el pecho alto.", "Sube empujando con los talones."],
    ["Levantar los talones."]);
  f("hack", "Sentadilla hack", "Pierna", "Máquina", P, 3, [8, 10], "Cuádriceps y glúteo",
    ["Espalda pegada al respaldo, pies en mitad de la plataforma.", "Baja controlando.", "Sube sin bloquear rodillas."],
    ["Pies muy bajos si molesta la rodilla."]);
  f("extension", "Extensión de cuádriceps", "Pierna", "Máquina", A, 3, [10, 15], "Cuádriceps",
    ["Ajusta el respaldo para que la rodilla quede en el eje de la máquina.", "Estira las piernas en 2 segundos.", "Baja en 3 segundos."],
    ["Dar golpes arriba.", "Mucho peso si hay molestias de rodilla."]);
  f("femoral", "Curl femoral en máquina", "Pierna", "Máquina", A, 3, [10, 12], "Isquiotibiales",
    ["Rodilla alineada con el eje y rodillo encima del tobillo.", "Dobla las piernas llevando el talón hacia el glúteo.", "Vuelve despacio."],
    ["Levantar la cadera.", "Bajar de golpe."]);
  f("femoral-tumbado", "Curl femoral tumbado", "Pierna", "Máquina", A, 3, [10, 12], "Isquiotibiales",
    ["Tumbado boca abajo, rodillas justo fuera del banco.", "Lleva los talones hacia el glúteo.", "Baja controlando."],
    ["Despegar la cadera del banco."]);
  f("rumano", "Peso muerto rumano", "Pierna", "Barra", P, 3, [8, 10], "Isquiotibiales, glúteo y lumbares",
    ["De pie, barra o mancuernas delante de los muslos, rodillas algo flexionadas.", "Lleva la cadera atrás deslizando el peso pegado a las piernas.", "Baja hasta notar tensión en los isquios y vuelve apretando el glúteo."],
    ["Redondear la espalda.", "Doblar mucho las rodillas: se convierte en sentadilla."]);
  f("peso-muerto", "Peso muerto", "Pierna", "Barra", P, 3, [5, 6], "Cadena posterior completa",
    ["Pies bajo la barra, agarre por fuera de las piernas.", "Espalda recta, pecho arriba; empuja el suelo con las piernas.", "Termina erguido con la cadera estirada, sin echarte atrás."],
    ["Redondear la espalda.", "Alejar la barra del cuerpo."]);
  f("zancada", "Zancadas", "Pierna", "Mancuernas", P, 3, [8, 10], "Cuádriceps y glúteo",
    ["Da un paso largo y baja la rodilla de atrás hacia el suelo.", "Rodilla delantera alineada con el pie.", "Empuja con el talón de delante para volver."],
    ["Rodilla delantera hacia dentro.", "Paso demasiado corto."], { porLado: true });
  f("bulgara", "Sentadilla búlgara", "Pierna", "Mancuernas", P, 3, [8, 10], "Cuádriceps y glúteo",
    ["Pie de atrás apoyado en un banco.", "Baja en vertical hasta que el muslo delantero quede paralelo.", "Sube empujando con el pie de delante."],
    ["Pie delantero demasiado cerca del banco."], { porLado: true });
  f("step-up", "Step-up bajo o zancada estática corta", "Pierna", "Mancuernas", P, 2, [8, 8], "Cuádriceps y glúteo",
    ["Step-up: cajón bajo, sube apoyando todo el pie y baja controlando.", "Zancada estática: pies fijos, baja y sube en vertical con recorrido corto.", "Rodilla siempre alineada con el pie."],
    ["Impulsarse con la pierna de abajo.", "Rodilla hacia dentro."], { porLado: true });
  f("aductores", "Aductores en máquina", "Pierna", "Máquina", A, 3, [12, 15], "Aductores",
    ["Espalda apoyada, piernas abiertas lo que sea cómodo.", "Cierra las piernas despacio.", "Vuelve sin rebote."],
    ["Abrir más de lo cómodo."]);

  /* ---------- Glúteo ---------- */
  f("hip-thrust", "Hip thrust", "Glúteo", "Barra", P, 3, [8, 12], "Glúteo mayor",
    ["Espalda alta apoyada en un banco, barra sobre la cadera (con protector).", "Sube la cadera hasta alinear tronco y muslos.", "Aprieta el glúteo arriba y baja controlando."],
    ["Arquear la zona lumbar en vez de subir con la cadera."]);
  f("puente-gluteo", "Puente de glúteo", "Glúteo", "Peso corporal", A, 3, [12, 15], "Glúteo e isquios",
    ["Tumbado boca arriba, pies apoyados cerca del glúteo.", "Sube la cadera apretando el glúteo.", "Baja despacio."],
    ["Empujar con la espalda baja."], { sinPeso: true });
  f("abductores", "Abductores en máquina", "Glúteo", "Máquina", A, 3, [12, 15], "Glúteo medio",
    ["Espalda apoyada.", "Abre las piernas hacia fuera.", "Vuelve despacio."],
    ["Rebotar en la vuelta."]);
  f("patada-gluteo", "Patada de glúteo en polea", "Glúteo", "Polea", A, 3, [12, 15], "Glúteo mayor",
    ["Tobillera en la polea baja, apóyate en la máquina.", "Lleva la pierna atrás con la rodilla casi estirada.", "Vuelve sin arquear la espalda."],
    ["Arquear la zona lumbar."], { porLado: true });

  /* ---------- Gemelo ---------- */
  f("gemelo-pie", "Gemelo de pie", "Gemelo", "Máquina", A, 3, [12, 15], "Gemelos",
    ["Puntas en el borde del escalón.", "Sube todo lo posible sobre las puntas.", "Baja lento hasta notar estiramiento."],
    ["Rebotar abajo."]);
  f("gemelo-sentado", "Gemelo sentado", "Gemelo", "Máquina", A, 3, [12, 15], "Sóleo",
    ["Rodillas bajo el apoyo, puntas en la plataforma.", "Sube los talones.", "Baja despacio."],
    ["Recorrido corto."]);

  /* ---------- Core ---------- */
  f("plancha", "Plancha frontal", "Core", "Peso corporal", A, 3, [30, 45], "Abdomen y core",
    ["Antebrazos bajo los hombros y cuerpo en línea recta.", "Aprieta abdomen y glúteos.", "Respira con normalidad."],
    ["Dejar caer la cadera.", "Subir el culo."], { unidad: "s", sinPeso: true });
  f("plancha-lateral", "Plancha lateral", "Core", "Peso corporal", A, 3, [20, 40], "Oblicuos",
    ["Apoya un antebrazo bajo el hombro, cuerpo de lado.", "Sube la cadera hasta alinear el cuerpo.", "Aguanta sin dejarla caer."],
    ["Girar el tronco."], { unidad: "s", sinPeso: true, porLado: true });
  f("crunch-polea", "Crunch en polea", "Core", "Polea", A, 3, [12, 15], "Recto abdominal",
    ["De rodillas frente a la polea alta con cuerda junto a la cabeza.", "Flexiona el tronco llevando los codos a los muslos.", "Vuelve despacio."],
    ["Tirar con los brazos."]);
  f("rueda", "Rueda abdominal", "Core", "Otro", A, 3, [8, 12], "Abdomen y core",
    ["De rodillas, manos en la rueda.", "Rueda hacia delante con el abdomen firme.", "Vuelve sin arquear la espalda."],
    ["Ir más lejos de lo que aguantas sin arquear."], { sinPeso: true });
  f("elevacion-piernas", "Elevación de piernas colgado", "Core", "Peso corporal", A, 3, [8, 12], "Abdomen inferior",
    ["Colgado de la barra o en el soporte de codos.", "Sube las rodillas hacia el pecho.", "Baja controlando sin balanceo."],
    ["Balancearse."], { sinPeso: true });
  f("pallof", "Press Pallof", "Core", "Polea", A, 3, [10, 12], "Core antirrotación",
    ["De lado a la polea a la altura del pecho.", "Empuja el agarre al frente sin dejar que el cuerpo gire.", "Vuelve al pecho."],
    ["Girar el tronco hacia la polea."], { porLado: true });
  f("dead-bug", "Dead bug", "Core", "Peso corporal", A, 3, [8, 10], "Core profundo",
    ["Boca arriba, brazos al techo y rodillas a 90°.", "Estira brazo y pierna contrarios sin despegar la zona lumbar.", "Vuelve y cambia de lado."],
    ["Arquear la espalda."], { sinPeso: true, porLado: true });

  /* ---------- Estabilidad y movilidad ---------- */
  f("equilibrio", "Equilibrio a una pierna", "Estabilidad", "Otro", A, 2, [30, 30], "Tobillo, rodilla y cadera",
    ["Apoya un pie y mantén la rodilla algo flexionada.", "Con balón: pásalo o lánzalo mientras mantienes el equilibrio.", "En bosu: busca estabilidad antes de añadir movimiento."],
    ["Rodilla hacia dentro.", "Bloquear la rodilla."], { unidad: "s", sinPeso: true, porLado: true });
  f("monster-walk", "Paso lateral con banda", "Estabilidad", "Bandas", A, 2, [10, 15], "Glúteo medio",
    ["Banda por encima de las rodillas o en los tobillos.", "Semiflexiona y da pasos laterales.", "Mantén la tensión de la banda."],
    ["Juntar los pies del todo."], { sinPeso: true, porLado: true });
  f("movilidad-hombro", "Movilidad de hombros con banda", "Movilidad", "Bandas", A, 2, [10, 15], "Hombros y escápulas",
    ["Sujeta la banda con los brazos estirados.", "Pasa por encima de la cabeza hacia atrás y vuelve.", "Ve cerrando el agarre poco a poco."],
    ["Forzar si duele."], { sinPeso: true });
  f("estiramientos", "Estiramientos", "Movilidad", "Peso corporal", A, 1, [5, 10], "General",
    ["Estira piernas, cadera, espalda y hombros.", "Mantén cada postura 20–30 segundos.", "Sin rebotes ni dolor."],
    ["Rebotar."], { unidad: "min", sinPeso: true });

  /* ---------- Cardio ---------- */
  f("cinta", "Cinta", "Cardio", "Cardio", A, 1, [10, 20], "Cardiovascular",
    ["Empieza caminando y sube el ritmo poco a poco.", "Inclinación si quieres más intensidad sin correr.", "No te agarres a las barras si no lo necesitas."],
    ["Agarrarse con inclinación alta."], { unidad: "min", sinPeso: true });
  f("bici", "Bicicleta estática", "Cardio", "Cardio", A, 1, [10, 20], "Cardiovascular",
    ["Sillín a la altura de la cadera: rodilla casi estirada abajo.", "Resistencia que te deje hablar a ratos.", "Cadencia constante."],
    ["Sillín bajo: carga la rodilla."], { unidad: "min", sinPeso: true });
  f("eliptica", "Elíptica", "Cardio", "Cardio", A, 1, [10, 20], "Cardiovascular",
    ["Pies enteros en los pedales.", "Empuja y tira con los brazos.", "Ritmo constante."],
    ["Apoyarse solo en las puntas."], { unidad: "min", sinPeso: true });
  f("remo-ergometro", "Remo ergómetro", "Cardio", "Cardio", A, 1, [8, 15], "Cardiovascular y espalda",
    ["Orden: piernas, tronco, brazos al tirar.", "Vuelta al revés: brazos, tronco, piernas.", "Espalda recta."],
    ["Tirar solo con los brazos."], { unidad: "min", sinPeso: true });
  f("escaladora", "Escaladora", "Cardio", "Cardio", A, 1, [8, 15], "Cardiovascular y piernas",
    ["Pisa con todo el pie en cada escalón.", "Tronco recto.", "Agárrate solo para equilibrarte."],
    ["Colgarse de las barras."], { unidad: "min", sinPeso: true });

  window.CATALOGO_BASE = L;
})();
