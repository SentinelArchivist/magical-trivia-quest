const CACHE_NAME = 'magical-trivia-quest-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/game.js',
  './js/skill-tree.js',
  './js/storage.js',
  './js/questions.js',
  './data/questions.json',
  './data/questions_level1.json',
  './data/questions_level2.json',
  './data/questions_level3.json',
  './data/questions_level4.json',
  './data/questions_level5.json',
  './manifest.json',
  './assets/icons/icon-72x72.png',
  './assets/icons/icon-96x96.png',
  './assets/icons/icon-128x128.png',
  './assets/icons/icon-144x144.png',
  './assets/icons/icon-152x152.png',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-384x384.png',
  './assets/icons/icon-512x512.png',
  './assets/icons/favicon.ico'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  // Force the service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Ensure the service worker takes control of all open clients
  self.clients.claim();
});

// Fetch event - serve cached assets
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                // Cache new assets (except API calls)
                if (!event.request.url.includes('/api/')) {
                  cache.put(event.request, responseToCache);
                }
              });
              
            return response;
          })
          .catch(() => {
            // Handle offline scenarios
            if (event.request.mode === 'navigate') {
              // Return cached index.html for page navigation
              return caches.match('./index.html');
            }
            
            // Return cached JSON for data requests
            if (event.request.url.endsWith('.json')) {
              return caches.match('./data/questions.json');
            }
            
            // Return null for other resources that aren't available offline
            return null;
          });
      })
  );
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  // If the message is to skip waiting, call skipWaiting
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle game state refresh for offline mode
  if (event.data && event.data.type === 'REFRESH_GAME_STATE') {
    console.log('Service worker received refresh game state message');
    // We don't need to do anything special here since the main thread
    // has already updated localStorage. This just ensures the service worker
    // stays active and doesn't require a refresh that would break offline functionality.
    
    // Notify all clients that the game state has been refreshed
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'GAME_STATE_REFRESHED'
        });
      });
    });
  }
});

// Handle localStorage operations that might fail during offline mode
self.addEventListener('sync', (event) => {
  if (event.tag === 'local-storage-sync') {
    // This will be triggered when online again
    // The app can use this to retry operations that failed offline
    console.log('Syncing local storage data now that we are back online');
  }
});
