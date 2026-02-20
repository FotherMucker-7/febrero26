const CACHE_NAME = 'amor-app-v11';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './data.js',
    './manifest.json',
    'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;600&family=Dancing+Script:wght@700&display=swap',

    './assets/img/1.jpg',
    './assets/img/og-image.jpg',
    './assets/img/2.jpg',
    './assets/img/3.jpg',
    './assets/img/4.jpg',
    './assets/img/5.jpg',
    './assets/img/6.jpg',
    './assets/img/7.jpg',
    './assets/img/8.jpg',
    './assets/img/9.jpg',
    './assets/img/10.jpg',
    './assets/img/11.jpg',
    './assets/img/12.jpg',
    './assets/img/13.jpg',
    './assets/img/14.jpg',

    './assets/icon-192.png',
    './assets/icon-512.png',

    './assets/audio/1.mp3',
    './assets/audio/2.mp3',
    './assets/audio/3.mp3',
    './assets/audio/4.mp3',
    './assets/audio/5.mp3',
    './assets/audio/6.mp3',
    './assets/audio/7.mp3',
    './assets/audio/8.mp3',
    './assets/audio/9.mp3',
    './assets/audio/10.mp3',
    './assets/audio/11.mp3',
    './assets/audio/12.mp3',
    './assets/audio/13.mp3',
    './assets/audio/14.mp3'
];

// Instalación: Cacheamos los recursos estáticos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Abriendo caché del amor...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activación: Limpiamos cachés viejas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Intercepción de peticiones (Estrategia: Cache First, luego Network)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Si está en caché, lo devolvemos
                if (response) {
                    return response;
                }
                // Si no, lo pedimos a internet
                return fetch(event.request);
            })
    );
});