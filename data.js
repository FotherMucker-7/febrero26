// Configuración de fecha base: 14 de Febrero del año actual
// Ojo: Los meses en JS van de 0 a 11. Febrero es 1.
const YEAR = new Date().getFullYear();
const BASE_DATE = new Date(YEAR, 1, 14); // 14 de Febrero

const songsData = [
    {
        id: 1,
        title: "El inicio de todo",
        text: "Esta es mi primera razón: que hayas decidido vencer tus miedos. Ese día no empezó un cuento de hadas, empezó algo mejor: nosotros, aprendiendo a querernos superando todo. Gracias por llegar a mi vida y dar ese paso conmigo. Mi universo cambió y es más bonito desde entonces. ✨",
        image: "assets/img/1.jpg",
        audio: "assets/audio/1.mp3",
        // Hora de desbloqueo: 00:00 (Medianoche)
        unlockHour: 0,
        unlockMinute: 0,
        effect: "hearts",
        effectBtnText: "Haz clic para ver el amor",
        unlockEffect: "hearts" // Efecto al desbloquearse
    },
    {
        id: 2,
        title: "Qué bueno que hicimos match",
        text: "Segunda razón: de todas las personas en Facebook (y en el universo), terminamos encontrándonos nosotros. Mira hasta dónde llegó la cosa. Quién diría que un scroll iba a cambiarme la vida. Gracias por enviar ese primer mensaje. 💌",
        image: "assets/img/2.jpg",
        audio: "assets/audio/2.mp3",
        // Hora de desbloqueo: 08:00 AM
        unlockHour: 8,
        unlockMinute: 0,
        unlockEffect: "sunshine" // Nuevo día radiante
    },
    {
        id: 3,
        title: "Cuando nada fue problema",
        text: "Otra razón para celebrar este día: la primera vez que nos vimos. Tu invitación y tu reacción ante mi olvido del patito 🦆... me ayudaste a buscar un vaso y seguimos como si nada. Ahí entendí algo: contigo, los problemas no pesan tanto. Gracias por tu naturalidad desde el principio. 🌹",
        image: "assets/img/3.jpg",
        audio: "assets/audio/3.mp3",
        // Hora de desbloqueo: 08:30 AM
        unlockHour: 8,
        unlockMinute: 30,
        unlockEffect: "hearts" // Recuerdo romántico
    },
    {
        id: 4,
        title: "Tu Risa",
        text: "Otra de mis razones: tu risa y tu sonrisa. Tienen algo especial, siempre logran que todo se sienta más liviano. Tal vez no lo notas, pero cuando te ríes y sonríes el día mejora. 😁 Gracias por contagiar esa alegría natural.",
        image: "assets/img/4.jpg",
        audio: "assets/audio/4.mp3",
        // Hora de desbloqueo: 09:00 AM
        unlockHour: 9,
        unlockMinute: 0,
        effect: "hearts",
        effectBtnText: "¡Haz sonreír mi corazón!",
        unlockEffect: "stars" // Alegría brillante
    },
    {
        id: 5,
        title: "Cuando dices que soy lindo",
        text: "Otra razón que guardo: cuando me dices “lindo”. Siempre me saca una sonrisa y me sonroja 😊. Porque sé que lo dices de verdad, y porque viniendo de ti tiene un valor distinto. Gracias por mirarme con esos ojos buenos.",
        image: "assets/img/5.jpg",
        audio: "assets/audio/5.mp3",
        // Hora de desbloqueo: 10:00 AM
        unlockHour: 9,
        unlockMinute: 30,
        effect: "kiss",
        effectBtnText: "Un beso virtual 💋",
        unlockEffect: "kiss" // El más obvio
    },
    {
        id: 6,
        title: "Nuestros lugares",
        text: "Una razón omnipresente: nuestros lugares. Ya sea un café, un parque, tu casa o la mía, si estamos juntos, estamos bien. Lugares simples o cotidianos contigo valen más. Cada espacio se vuelve especial por tu presencia. 🤩",
        image: "assets/img/6.jpg",
        audio: "assets/audio/9.mp3",
        // Hora de desbloqueo: 11:30 AM
        unlockHour: 10,
        unlockMinute: 0,
        unlockEffect: "stars" // Brillo en sus ojos
    },
    {
        id: 7,
        title: "Contigo sí dan ganas",
        text: "Otra razón sincera: contigo sí dan ganas de salir, de hacer cosas, de moverse un poco más 👨🏻🦼💨. Porque sé que contigo hasta el día más normal puede terminar bien. Aunque sientas que cruzo Santiago solo por un rato contigo o que no podrás darme tanta atención como esperas, vale totalmente la pena. Gracias por motivarme.",
        image: "assets/img/7.jpg",
        audio: "assets/audio/7.mp3",
        // Hora de desbloqueo: 13:00 PM (Hora del almuerzo)
        unlockHour: 10,
        unlockMinute: 30,
        effect: "bomb",
        effectBtnText: "¡Explosión de amor!",
        unlockEffect: "bomb" // Momento que lo cambió todo
    },
    {
        id: 8,
        title: "Tus detalles",
        text: "Una razón muy tuya: los detalles que tienes conmigo. Para mi cumpleaños 44, nuestra primera navidad, el 14 de febrero pasado, para mi cumpleaños 45... algunos ejemplos de esos detalles. Sin olvidar el detallazo de aguantar mis 5 minutos y nubes negras. No es solo lo que haces, es la intención detrás de toda tu preocupación y aceptación sincera. 🥰 Gracias por tu amor y dedicación.",
        image: "assets/img/8.jpg",
        audio: "assets/audio/8.mp3",
        // Hora de desbloqueo: 15:00 PM
        unlockHour: 11,
        unlockMinute: 0,
        unlockEffect: "hearts" // Calidez y amor
    },
    {
        id: 9,
        title: "Tu forma de acompañarme",
        text: "Otra razón importante: tu manera de estar conmigo. Nunca desde la lástima, siempre desde lo natural. Te adaptaste a mi mundo como si ya supieras el camino, y sigues adaptándote con el esfuerzo que eso supone... eso dice mucho de ti. Gracias por caminar (andar) a mi ritmo, pero sin dejar de avanzar. 🚀",
        image: "assets/img/9.jpg",
        audio: "assets/audio/6.mp3",
        // Hora de desbloqueo: 16:30 PM
        unlockHour: 11,
        unlockMinute: 30,
        effect: "hearts",
        effectBtnText: "¡Más aventuras juntos!",
        unlockEffect: "fireworks" // Emoción y aventura
    },
    {
        id: 10,
        title: "Tu Voz",
        text: "Otra de mis razones: tu voz. No solo cómo suena, sino cómo dices las cosas. Cuando me cuentas tu día, cuando te emocionas por algo, hasta cuando hablas encima de mi 😄... Podría escucharte horas sin aburrirme. Gracias por compartir conmigo tu mundo y tus cosas en palabras e intentarlo todos los días a pesar de las ocupaciones. 🌹",
        image: "assets/img/10.jpg",
        audio: "assets/audio/10.mp3",
        // Hora de desbloqueo: 18:00 PM
        unlockHour: 12,
        unlockMinute: 0,
        unlockEffect: "musicNotes" // Voz = música
    },
    {
        id: 11,
        title: "Nuestras salidas",
        text: "Una razón que me gusta mucho: nuestras salidas por la ciudad. Ir a votar, salir a comprar algo, cualquier vuelta corta. Contigo no son “trámites”, son momentos juntos. Gracias por convertir lo cotidiano en recuerdos. Y por hacer espacio para mis tiempos y mis ruedas. 👨🏻🦼💨",
        image: "assets/img/11.jpg",
        audio: "assets/audio/11.mp3",
        // Hora de desbloqueo: 19:30 PM
        unlockHour: 12,
        unlockMinute: 30,
        effect: "hearts",
        effectBtnText: "Soñemos juntos ✨",
        unlockEffect: "stars" // Sueños = estrellas
    },
    {
        id: 12,
        title: "Sentirme en casa",
        text: "Otra razón que valoro: la tranquilidad que siento contigo. No importa dónde estemos, si estoy a tu lado me siento bien. Como si no tuviera que demostrar nada, solo ser yo 😁. Gracias por darme (y por ser) ese lugar donde puedo estar en paz.",
        image: "assets/img/12.jpg",
        audio: "assets/audio/12.mp3",
        // Hora de desbloqueo: 21:00 PM
        unlockHour: 13,
        unlockMinute: 0,
        effect: "bomb",
        effectBtnText: "¡Te amo hasta el infinito!",
        unlockEffect: "hearts" // Hogar = corazón
    },
    {
        id: 13,
        title: "Lo que logras",
        text: "Otra razón para celebrar: lo capaz que eres. 🏆 Verte con tu diploma me recordó cómo sacas adelante las cosas, no solo en tu trabajo, también con tus hijos, con tu familia. Admiro tu inteligencia, tu esfuerzo, tu dedicación y tu forma de crecer. Gracias por inspirarme sin siquiera intentarlo. 👏",
        image: "assets/img/13.jpg",
        audio: "assets/audio/13.mp3",
        // Hora de desbloqueo: 22:00 PM (Casi la última del día)
        unlockHour: 13,
        unlockMinute: 30,
        unlockEffect: "hearts" // Anticipación romántica
    },
    {
        id: 14,
        title: "TÚ",
        text: "Y la última razón eres simplemente TÚ. Tu forma de ser, tu belleza, tu manera de estar en mi vida. Podría escribir muchas más razones, pero me quedé en 14 por ahora. Sé que seguiremos sumando muchas más durante muchos febreros. \n\n Ahora ya llegué, así que… abre la puerta. \nTe amo infinito. ❤♾",
        image: "assets/img/14.jpg",
        audio: "assets/audio/14.mp3",
        isManual: true, // Esta es la especial
        secretPin: "1805", // El código de tu aniversario
        unlockEffect: "ultimateExplosion", // ¡EL GRAN FINAL!

        // === GEOLOCALIZACIÓN ===
        requiresGeolocation: true,
        targetLocation: {
            lat: -33.47831184741243,  // Casa de ella (Santiago, Chile)
            lng: -70.59777378955586,
            radius: 50  // 50 metros de proximidad
        },
        geolocationMessage: "Cuando esté cerca podrás desbloquearla 💕"
    }
];