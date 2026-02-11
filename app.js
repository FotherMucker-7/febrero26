// ==========================================
// CONFIGURACIÓN DE PRUEBA (MODO DESARROLLADOR)
// ==========================================
// Cambia esto a "true" para ver todo desbloqueado como si fuera el futuro
// Cambia a "false" para simular la experiencia real
const DEV_MODE = true;

// Si quieres probar una hora específica, descomenta y edita esta línea:
const FAKE_NOW = new Date(2026, 1, 14, 22, 0); // 14 Feb, 7:59:50 AM
// const FAKE_NOW = null; // Dejar en null para usar la hora real

// ==========================================
// SISTEMA DE TIEMPO SIMULADO
// ==========================================

// Guardar el tiempo inicial (para que FAKE_NOW avance)
const REAL_START_TIME = new Date(); // Hora real cuando se carga la página
const FAKE_START_TIME = FAKE_NOW ? new Date(FAKE_NOW) : null; // Copia de FAKE_NOW

function getCurrentTime() {
    if (DEV_MODE && FAKE_START_TIME) {
        // Calcular cuánto tiempo ha pasado en la realidad
        const elapsedMs = new Date() - REAL_START_TIME;

        // Sumar ese tiempo al FAKE_NOW inicial
        const currentFakeTime = new Date(FAKE_START_TIME.getTime() + elapsedMs);

        return currentFakeTime;
    }
    return new Date(); // Hora real
}

// ==========================================
// CICLO DE ACTUALIZACIÓN
// ==========================================

// Auto-refresh cada segundo para detectar unlocks
setInterval(() => {
    updateCountdown();
    renderGrid(); // Re-renderizar para detectar cambios de unlock
}, 1000); // 1 segundo

// ==========================================
// LÓGICA PRINCIPAL
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // SERVICE WORKER
    // ==========================================

    // Solo registrar Service Worker en PRODUCCIÓN (no en DEV_MODE)
    if ('serviceWorker' in navigator) {
        if (!DEV_MODE) {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registrado exitosamente:', registration.scope);
                })
                .catch(error => {
                    console.error('❌ Error al registrar Service Worker:', error);
                });
        } else {
            console.log('🔧 DEV_MODE activo: Service Worker deshabilitado para testing');
        }
    } else {
        console.warn('⚠️ Service Workers no son soportados en este navegador');
    }

    initApp();
});

function initApp() {
    renderGrid();
    setupModal();
    updateCountdown();

    // Mostrar hora simulada en consola
    if (DEV_MODE && FAKE_START_TIME) {
        console.log(`⏰ Tiempo simulado iniciado: ${FAKE_START_TIME.toLocaleTimeString()}`);
        console.log('⏱️ El tiempo avanzará normalmente desde esta hora');
    }
}

const lines = document.querySelectorAll("#poem span");
let lineIndex = 0;

function typeLine(line, callback) {
    const text = line.textContent;
    line.textContent = "";
    line.style.opacity = 1;
    line.classList.add("typing");

    let i = 0;
    const speed = window.innerWidth < 600 ? 32 : 40;

    const typing = setInterval(() => {
        line.textContent += text[i];
        i++;

        if (i >= text.length) {
            clearInterval(typing);
            line.classList.remove("typing");
            setTimeout(callback, 1000);
        }
    }, speed);
}

function showLine() {
    if (lineIndex < lines.length) {
        const line = lines[lineIndex];
        line.style.opacity = 1;
        line.style.transform = "translateY(0)";

        typeLine(line, () => {
            lineIndex++;
            showLine();
        });
    } else {
        activateGlow();
    }
}

function activateGlow() {
    const lastLines = [
        lines[lines.length - 1],
        lines[lines.length - 2]
    ];

    lastLines.forEach(line => {
        line.classList.add("glow");
    });
}

setTimeout(showLine, 1000);


function renderGrid() {
    const grid = document.getElementById('grid-container');
    const existingCards = grid.querySelectorAll('.card');

    // Guardar estado anterior de bloqueo Y revelación
    const previousStates = {};
    existingCards.forEach(card => {
        const id = card.dataset.cardId;
        const wasLocked = card.classList.contains('locked');
        const wasUnlocked = card.classList.contains('unlocked');
        const wasRevealed = card.dataset.revealed === 'true';
        if (id) previousStates[id] = { wasLocked, wasUnlocked, wasRevealed };
    });

    grid.innerHTML = ''; // Limpiar grid para redibujar

    const now = getCurrentTime();
    const currentYear = now.getFullYear();

    songsData.forEach(card => {
        // Crear elemento tarjeta
        const cardEl = document.createElement('div');
        cardEl.classList.add('card');
        cardEl.dataset.cardId = card.id;

        // Calcular fecha de desbloqueo
        let unlockDate = new Date(currentYear, 1, 14, card.unlockHour, card.unlockMinute);

        // Determinar si está bloqueada por tiempo
        let isTimeToUnlock = now >= unlockDate;

        // Si estamos en DEV_MODE puro (sin hora específica), desbloquear todo
        if (DEV_MODE && !FAKE_NOW) isTimeToUnlock = true;

        // Recuperar si ya fue revelada anteriormente
        const wasRevealed = previousStates[card.id]?.wasRevealed || false;

        // === LÓGICA ESPECIAL PARA TARJETA 14 (GEOLOCALIZACIÓN) ===
        let state;

        if (card.id === 14 && card.requiresGeolocation) {
            // Verificar si tarjeta 13 fue revelada
            const card13Revealed = localStorage.getItem('card_13_revealed') === 'true';

            if (!card13Revealed) {
                // Tarjeta 14 bloqueada hasta que 13 se revele
                state = 'locked';
                cardEl.dataset.specialMessage = "Completa la tarjeta 13 primero 💕";
            } else {
                // Tarjeta 13 revelada, ahora depende de geolocalización
                const unlockedByLocation = localStorage.getItem('card14_unlocked_by_location') === 'true';

                if (!unlockedByLocation) {
                    // Esperando que llegue a la ubicación
                    state = 'waiting-location';
                } else if (!wasRevealed) {
                    // Llegó a la ubicación, espera click
                    state = 'unlocked';
                } else {
                    // Ya fue revelada
                    state = 'revealed';
                }
            }
        } else {
            // Lógica normal para todas las demás tarjetas
            if (!isTimeToUnlock) {
                state = 'locked'; // No ha llegado la hora
            } else if (!wasRevealed) {
                state = 'unlocked'; // Hora llegó pero no ha sido tocada
            } else {
                state = 'revealed'; // Ya fue revelada
            }
        }

        // Aplicar clases según estado
        if (state === 'locked') {
            cardEl.classList.add('locked');
        } else if (state === 'unlocked') {
            cardEl.classList.add('unlocked');
        } else if (state === 'waiting-location') {
            cardEl.classList.add('waiting-location');
        }
        // Si está revelada, no tiene clase especial (normal)

        // Marcar como revelada en dataset para persistencia
        cardEl.dataset.revealed = wasRevealed ? 'true' : 'false';

        // ARIA y atributos de accesibilidad
        cardEl.setAttribute('role', 'listitem');
        cardEl.setAttribute('tabindex', '0');
        const statusText = state === 'locked' ? 'Bloqueada' :
            state === 'waiting-location' ? 'Esperando tu llegada' :
                state === 'unlocked' ? 'Lista para revelar' : 'Disponible';
        cardEl.setAttribute('aria-label', `Tarjeta ${card.id}: ${card.title}. ${statusText}`);

        // HTML interno de la tarjeta
        cardEl.innerHTML = `
            <div class="card-inner">
                <img src="${card.image}" alt="Imagen de ${card.title}" loading="lazy">
                <div class="card-number">#${card.id}</div>
            </div>
        `;

        // Evento Click
        cardEl.addEventListener('click', () => {
            if (state === 'locked') {
                // Tarjeta aún bloqueada
                shakeCard(cardEl);
                const message = cardEl.dataset.specialMessage ||
                    `🔒 Disponible a las ${formatTime(card.unlockHour, card.unlockMinute)}`;
                showToast(message);
            } else if (state === 'waiting-location') {
                // Tarjeta 14 esperando que llegues
                shakeCard(cardEl);
                showToast(card.geolocationMessage || '📍 Espera a llegar al lugar especial...');
            } else if (state === 'unlocked') {
                // Tarjeta lista para revelar - AQUÍ DISPARAMOS LA ANIMACIÓN
                revealCard(cardEl, card);
            } else {
                // Tarjeta ya revelada - abrir modal normal
                openModal(card);
            }
        });

        // Soporte de teclado (Enter o Space)
        cardEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                cardEl.click();
            }
        });

        grid.appendChild(cardEl);
    });
}

// ==========================================
// NUEVA FUNCIÓN: REVELAR TARJETA MANUALMENTE
// ==========================================

function revealCard(cardEl, card) {
    // Marcar como revelada
    cardEl.dataset.revealed = 'true';

    // === ESPECIAL: Si es tarjeta 13, activar geolocalización para tarjeta 14 ===
    if (card.id === 13) {
        localStorage.setItem('card_13_revealed', 'true');
        console.log('🎯 Tarjeta 13 revelada - Activando geolocalización para tarjeta 14');

        // Iniciar geolocalización después de un breve delay
        setTimeout(() => {
            if (typeof initGeolocationIfNeeded === 'function') {
                initGeolocationIfNeeded();
            }
        }, 2000); // 2 segundos después de revelar tarjeta 13
    }

    // Remover clase unlocked y agregar revealing
    cardEl.classList.remove('unlocked');
    cardEl.classList.add('revealing');

    // Disparar efecto especial a mitad de animación
    setTimeout(() => {
        if (card.unlockEffect) {
            const rect = cardEl.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;
            triggerEffect(card.unlockEffect, null, { x, y });
        }
    }, 400); // Mitad de la animación de 0.8s

    // Remover clase revealing después de animación y abrir modal
    setTimeout(() => {
        cardEl.classList.remove('revealing');
        openModal(card);
    }, 800);
}

// Efecto de vibración para tarjetas bloqueadas
function shakeCard(element) {
    element.style.transform = 'translateX(5px)';
    setTimeout(() => {
        element.style.transform = 'translateX(-5px)';
    }, 50);
    setTimeout(() => {
        element.style.transform = 'translateX(5px)';
    }, 100);
    setTimeout(() => {
        element.style.transform = 'translateX(0)';
    }, 150);
}

// ==========================================
// LÓGICA DEL MODAL (REPRODUCTOR)
// ==========================================
const modal = document.getElementById('modal');
const audioPlayer = document.getElementById('audio-player');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalText = document.getElementById('modal-text');
const manualUnlockArea = document.getElementById('manual-unlock-area');
const pinInput = document.getElementById('pin-input');
const unlockBtn = document.getElementById('unlock-btn');

function setupModal() {
    // Cerrar modal
    document.getElementById('close-btn').addEventListener('click', closeModal);

    // Cerrar si click fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Lógica del PIN para la tarjeta 14
    unlockBtn.addEventListener('click', checkPin);
}

let currentCardId = null;

function openModal(card) {
    currentCardId = card.id;

    // Si es la tarjeta manual (la 14) y no se ha desbloqueado aún
    if (card.isManual) {
        // Mostrar UI de PIN, ocultar contenido
        modalImg.src = card.image; // O una imagen de candado si prefieres
        modalImg.style.filter = "blur(10px)"; // Efecto misterio
        modalTitle.innerText = "ACCESO RESTRINGIDO";
        modalText.innerText = "Ingresa la clave del administrador del corazón.";
        audioPlayer.style.display = 'none';
        manualUnlockArea.style.display = 'block';
        manualUnlockArea.classList.remove('hidden');

        // Limpiar input anterior
        pinInput.value = '';
    } else {
        // Tarjeta normal
        setupContent(card);
    }

    modal.classList.remove('hidden');
}

function setupContent(card) {
    modalImg.src = card.image;
    modalImg.style.filter = "none";
    modalTitle.innerText = card.title;
    modalText.innerText = card.text;

    // 1. Limpiamos interacciones anteriores
    const extraContainer = document.getElementById('extra-interaction');
    extraContainer.innerHTML = '';

    // 2. Verificamos si esta tarjeta tiene un efecto especial
    if (card.effect) {
        const btn = document.createElement('button');
        btn.className = 'magic-btn';
        btn.innerText = card.effectBtnText || "¡Sorpresa!"; // Texto por defecto si no pusiste

        // Asignamos la magia según el tipo
        btn.addEventListener('click', (e) => {
            triggerEffect(card.effect, e.target);
        });

        extraContainer.appendChild(btn);
    }

    // Configurar audio
    audioPlayer.src = card.audio;
    audioPlayer.volume = 0.4;
    audioPlayer.style.display = 'block';
    audioPlayer.load(); // Cargar audio

    // Intentar reproducir (los navegadores pueden bloquear esto si no hubo interacción previa)
    const playPromise = audioPlayer.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Autoplay bloqueado, el usuario debe dar play manual.");
        });
    }

    manualUnlockArea.style.display = 'none';
}

// NUEVA FUNCIÓN: El Mago de los Efectos
function triggerEffect(type, btnElement = null, customOrigin = null) {
    let x, y;

    if (customOrigin) {
        // Usar origen personalizado (para reveals automáticos)
        x = customOrigin.x;
        y = customOrigin.y;
    } else if (btnElement) {
        // Usar posición del botón
        const rect = btnElement.getBoundingClientRect();
        x = (rect.left + rect.width / 2) / window.innerWidth;
        y = (rect.top + rect.height / 2) / window.innerHeight;
    } else {
        // Default: centro de pantalla
        x = 0.5;
        y = 0.6;
    }

    const commonOptions = {
        origin: { x: x, y: y },
        zIndex: 2001,
        disableForReducedMotion: true
    };

    if (type === 'hearts') {
        // Opción A: Usar emoji de corazón (Más seguro y compatible)
        const heartShape = confetti.shapeFromText({ text: '❤️', scalar: 3 });

        confetti({
            ...commonOptions,
            particleCount: 30,
            scalar: 2,
            spread: 60,
            shapes: [heartShape],
        });
    }
    else if (type === 'kiss') {
        const kissShape = confetti.shapeFromText({ text: '💋', scalar: 3 });

        confetti({
            ...commonOptions,
            particleCount: 20,
            scalar: 2,
            spread: 60,
            shapes: [kissShape],
        });
    }
    else if (type === 'bomb') {
        confetti({
            ...commonOptions,
            particleCount: 100,
            spread: 70,
            colors: ['#FFE000', '#79FF79']
        });
    }
    // ===== NUEVOS EFECTOS =====
    else if (type === 'stars') {
        confetti({
            ...commonOptions,
            particleCount: 50,
            shapes: ['star'],
            colors: ['#FFD700', '#FFA500', '#FFFF00', '#FFF'],
            spread: 80,
            startVelocity: 45,
            ticks: 200
        });
    }
    else if (type === 'fireworks') {
        // Múltiples explosiones en secuencia
        const duration = 2000;
        const animationEnd = Date.now() + duration;

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            confetti({
                zIndex: 2001,
                disableForReducedMotion: true,
                particleCount: 30,
                angle: randomInRange(55, 125),
                spread: randomInRange(50, 70),
                origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
                colors: ['#ff4b2b', '#ff416c', '#FFD700', '#00ff88']
            });

            if (Date.now() > animationEnd) {
                clearInterval(interval);
            }
        }, 250);
    }
    else if (type === 'musicNotes') {
        const noteShape = confetti.shapeFromText({ text: '♪', scalar: 3 });

        confetti({
            ...commonOptions,
            particleCount: 25,
            shapes: [noteShape],
            colors: ['#ff4b2b', '#ff416c', '#FFD700'],
            spread: 60,
            startVelocity: 35
        });
    }
    else if (type === 'sunshine') {
        // Explosión radiante desde el centro
        confetti({
            ...commonOptions,
            particleCount: 80,
            spread: 360,
            ticks: 200,
            startVelocity: 30,
            colors: ['#FFD700', '#FFA500', '#FFFF00', '#FF6347'],
            shapes: ['circle', 'square']
        });
    }
    else if (type === 'ultimateExplosion') {
        // Efecto masivo para la tarjeta final
        const count = 200;
        const defaults = {
            origin: { x: x, y: y },
            zIndex: 2001,
            colors: ['#ff4b2b', '#ff416c', '#FFD700', '#FF6347', '#ff9a9e']
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });

        setTimeout(() => {
            fire(0.2, { spread: 60 });
        }, 100);

        setTimeout(() => {
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        }, 200);

        setTimeout(() => {
            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        }, 300);

        setTimeout(() => {
            fire(0.1, { spread: 120, startVelocity: 45 });
        }, 400);
    }
}

function checkPin() {
    // Buscamos la tarjeta actual en los datos
    const card = songsData.find(c => c.id === currentCardId);

    if (pinInput.value === card.secretPin) {
        showToast("🎉 ¡Correcto! Abriendo tu regalo final...");
        manualUnlockArea.style.display = 'none';
        setupContent(card);

        // Disparar explosión épica para tarjeta 14
        setTimeout(() => {
            if (card.unlockEffect) {
                triggerEffect(card.unlockEffect, null, { x: 0.5, y: 0.5 });
            }
        }, 500); // Medio  segundo después de abrir
    } else {
        pinInput.classList.add('wrong');
        showToast("❌ PIN incorrecto. Intenta de nuevo");

        setTimeout(() => {
            pinInput.classList.remove('wrong');
        }, 500);
    }
}

function closeModal() {
    modal.classList.add('hidden');
    audioPlayer.pause(); // Parar música al salir
    audioPlayer.currentTime = 0;
}

// ==========================================
// UTILIDADES
// ==========================================

function formatTime(h, m) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function showToast(message) {
    // Crear un elemento flotante temporal
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(0,0,0,0.8)';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '20px';
    toast.style.zIndex = '2000';
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}

function updateCountdown() {
    const now = getCurrentTime();
    const target = new Date(now.getFullYear(), 1, 14, 0, 0, 0); // 14 Feb 00:00

    const diff = target - now;
    const el = document.getElementById('countdown');

    if (diff <= 0) {
        el.innerText = "¡Feliz San Valentín!";
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    el.innerText = `Faltan: ${days}d ${hours}h para el amor.`;
}

// Efecto simple de confeti (opcional)
function partyEffect() {
    // Lanza confeti desde el centro
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff4b2b', '#ff416c', '#ffffff'], // Colores de tu tema
        zIndex: 2001
    });

    // Lanza una segunda ola para más drama
    setTimeout(() => {
        confetti({
            particleCount: 100,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            zIndex: 2001
        });
        confetti({
            particleCount: 100,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            zIndex: 2001
        });
    }, 500);
}