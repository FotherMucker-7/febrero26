// ==========================================
// SISTEMA DE GEOLOCALIZACIÓN
// ==========================================

let currentPosition = null;
let watchId = null;
let geolocationGranted = false;
let card14UnlockedByLocation = false;

// ==========================================
// TESTING: UBICACIÓN SIMULADA
// ==========================================

// Para testing - configurar directamente aquí
const FAKE_LOCATION = {
    // Opciones de testing:
    // null = usar GPS real
    // 'away' = lejos de la ubicación (para ver estado waiting-location)
    // 'near' = en la ubicación (para simular llegada)

    mode: 'near', // Cambiar a 'away', 'near' o null para testing

    // Coordenadas de prueba
    away: {
        lat: -33.50000000000000,  // 2.8 km lejos
        lng: -70.60000000000000,
        accuracy: 10
    },
    near: {
        lat: -33.47831184741243,  // Casa de ella (EXACTO)
        lng: -70.59777378955586,
        accuracy: 5
    }
};

// ==========================================
// SOLICITAR PERMISO Y UBICACIÓN INICIAL
// ==========================================

function requestGeolocationPermission() {
    // Si hay FAKE_LOCATION.mode configurado, usarla para testing
    if (FAKE_LOCATION && FAKE_LOCATION.mode) {
        const fakeCoords = FAKE_LOCATION[FAKE_LOCATION.mode];
        console.log(`🧪 Testing MODE: ${FAKE_LOCATION.mode.toUpperCase()}`);
        console.log(`🧪 Ubicación simulada: ${fakeCoords.lat}, ${fakeCoords.lng}`);

        geolocationGranted = true;
        currentPosition = {
            coords: {
                latitude: fakeCoords.lat,
                longitude: fakeCoords.lng,
                accuracy: fakeCoords.accuracy
            }
        };
        return Promise.resolve(currentPosition);
    }
    if (!navigator.geolocation) {
        console.warn('⚠️ Geolocalización no soportada en este navegador');
        return Promise.reject('not-supported');
    }

    console.log('📍 Solicitando permiso de ubicación...');

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                geolocationGranted = true;
                currentPosition = position;
                console.log(`✅ Ubicación obtenida: ${position.coords.latitude}, ${position.coords.longitude}`);
                resolve(position);
            },
            (error) => {
                console.error('❌ Error de geolocalización:', error.message);
                handleGeolocationError(error);
                reject(error);
            },
            {
                enableHighAccuracy: true,  // Usar GPS
                timeout: 15000,            // 15 segundos máximo
                maximumAge: 0              // No usar caché
            }
        );
    });
}

// ==========================================
// TRACKING CONTINUO DE UBICACIÓN
// ==========================================

function startLocationTracking() {
    // Si hay FAKE_LOCATION configurado, simular tracking
    if (FAKE_LOCATION && FAKE_LOCATION.mode) {
        console.log('🧪 Tracking simulado activado');

        // Simular actualización periódica cada 5 segundos
        watchId = setInterval(() => {
            const fakeCoords = FAKE_LOCATION[FAKE_LOCATION.mode];
            currentPosition = {
                coords: {
                    latitude: fakeCoords.lat,
                    longitude: fakeCoords.lng,
                    accuracy: fakeCoords.accuracy
                }
            };
            checkProximityToTarget();
        }, 5000);

        // Llamar inmediatamente la primera vez
        checkProximityToTarget();
        return;
    }

    // GPS REAL (producción)
    if (!navigator.geolocation || !geolocationGranted) {
        console.warn('⚠️ No se puede iniciar tracking: permiso no otorgado');
        return;
    }

    console.log('🎯 Iniciando tracking de ubicación...');

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            currentPosition = position;
            checkProximityToTarget();
        },
        (error) => {
            console.error('❌ Error tracking ubicación:', error.message);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 5000,     // Actualizar cada 5 segundos
            timeout: 10000
        }
    );
}

function stopLocationTracking() {
    if (watchId) {
        // Si es tracking fake (setInterval), usar clearInterval
        if (FAKE_LOCATION && FAKE_LOCATION.mode) {
            clearInterval(watchId);
        } else {
            // Si es tracking real (GPS), usar clearWatch
            navigator.geolocation.clearWatch(watchId);
        }
        watchId = null;
        console.log('🛑 Tracking de ubicación detenido');
    }
}

// ==========================================
// CÁLCULO DE DISTANCIA
// ==========================================

// Fórmula Haversine para calcular distancia entre dos coordenadas
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
}

// Verificar si está cerca del objetivo
function isNearTarget(targetLat, targetLng, radius) {
    if (!currentPosition) return false;

    const distance = calculateDistance(
        currentPosition.coords.latitude,
        currentPosition.coords.longitude,
        targetLat,
        targetLng
    );

    return { isNear: distance <= radius, distance: Math.round(distance) };
}

// ==========================================
// VERIFICAR PROXIMIDAD A DESTINO
// ==========================================

function checkProximityToTarget() {
    const card14 = songsData.find(c => c.id === 14);

    if (!card14 || !card14.requiresGeolocation || !card14.targetLocation) {
        return;
    }

    const result = isNearTarget(
        card14.targetLocation.lat,
        card14.targetLocation.lng,
        card14.targetLocation.radius
    );

    console.log(`📏 Distancia al destino: ${result.distance}m`);

    if (result.isNear && !card14UnlockedByLocation) {
        unlockCard14ByLocation();
    }
}

// ==========================================
// DESBLOQUEAR TARJETA 14 POR UBICACIÓN
// ==========================================

function unlockCard14ByLocation() {
    console.log('🎉 ¡Llegaste al destino! Tarjeta 14 desbloqueada');

    // Marcar como desbloqueada
    card14UnlockedByLocation = true;
    localStorage.setItem('card14_unlocked_by_location', 'true');

    // Re-renderizar para mostrar nuevo estado
    renderGrid();

    // Mostrar notificación
    showToast('💕 ¡Estás aquí! La tarjeta final está lista');

    // Detener tracking para ahorrar batería
    stopLocationTracking();

    // Reproducir sonido o vibración (opcional)
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
}

// ==========================================
// MANEJO DE ERRORES
// ==========================================

function handleGeolocationError(error) {
    let message = '';

    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = '❌ Permiso de ubicación denegado. Necesito acceso para la sorpresa final.';
            showGeolocationPermissionDialog();
            break;
        case error.POSITION_UNAVAILABLE:
            message = '⚠️ No puedo detectar tu ubicación. Asegúrate de tener GPS activado.';
            break;
        case error.TIMEOUT:
            message = '⏱️ Tiempo agotado buscando ubicación. Reintentando...';
            setTimeout(() => requestGeolocationPermission(), 3000);
            break;
        default:
            message = '❌ Error desconocido de ubicación';
    }

    showToast(message);
}

function showGeolocationPermissionDialog() {
    // Crear botón para reintentar permiso
    const toast = document.querySelector('.toast');
    if (toast) {
        const retryBtn = document.createElement('button');
        retryBtn.textContent = 'Reintentar';
        retryBtn.style.cssText = 'margin-top: 10px; padding: 8px 16px; background: white; color: #ff4b2b; border: none; border-radius: 5px; cursor: pointer;';
        retryBtn.onclick = () => {
            requestGeolocationPermission()
                .then(() => startLocationTracking())
                .catch(console.error);
        };
        toast.appendChild(retryBtn);
    }
}

// ==========================================
// INICIALIZACIÓN INTELIGENTE
// ==========================================

function initGeolocationIfNeeded() {
    // Solo iniciar si tarjeta 13 fue revelada
    const card13Revealed = localStorage.getItem('card_13_revealed') === 'true';

    if (!card13Revealed) {
        console.log('⏳ Esperando que tarjeta 13 se revele para activar geolocalización');
        return;
    }

    // Verificar si ya fue desbloqueada
    const alreadyUnlocked = localStorage.getItem('card14_unlocked_by_location') === 'true';
    if (alreadyUnlocked) {
        card14UnlockedByLocation = true;
        console.log('✅ Tarjeta 14 ya desbloqueada por ubicación');
        return;
    }

    // Pedir permiso e iniciar tracking
    requestGeolocationPermission()
        .then(() => {
            startLocationTracking();
        })
        .catch((error) => {
            if (error !== 'not-supported') {
                console.error('Error inicializando geolocalización:', error);
            }
        });
}

// Detener tracking cuando la app no está visible (ahorro de batería)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopLocationTracking();
    } else {
        // Reiniciar tracking si es necesario
        if (geolocationGranted && !card14UnlockedByLocation) {
            const card13Revealed = localStorage.getItem('card_13_revealed') === 'true';
            if (card13Revealed) {
                startLocationTracking();
            }
        }
    }
});
