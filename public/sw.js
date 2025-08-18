// Service Worker for Offline Learning
const CACHE_NAME = 'tutor-app-v1.0';
const OFFLINE_CACHE = 'tutor-offline-v1.0';

// Files to cache for offline use
const CACHE_FILES = [
    '/',
    '/dashboard.html',
    '/manifest.json',
    '/js/dashboard.js',
    '/js/gptService.js',
    '/js/textToSpeech.js',
    '/js/daily-challenge.js',
    '/js/mic-system.js',
    '/js/learningProgress.js',
    '/js/classBookManager.js',
    '/js/groupLearning.js',
    '/js/imageSearch.js',
    '/js/claudeChat.js',
    '/js/aiHealthCheck.js',
    '/js/syllabusSearch.js',
    '/js/paymentSystem.js',
    '/images/roy_sir.jpg',
    '/images/miss_sapna.jpg',
    '/images/tution.app_emblem.jpg'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
    console.log('🎯 Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching essential files...');
                return cache.addAll(CACHE_FILES);
            })
            .then(() => {
                console.log('✅ Service Worker installed successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                // Notify all clients about the update
                return self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'SW_UPDATED',
                            message: 'A new version of the app is available with latest features and improvements.'
                        });
                    });
                });
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle API requests differently
    if (request.url.includes('/api/')) {
        event.respondWith(handleApiRequest(request));
        return;
    }

    // Handle regular page requests
    event.respondWith(
        caches.match(request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    return response;
                }

                // Try to fetch from network
                return fetch(request)
                    .then((response) => {
                        // Cache successful responses
                        if (response && response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(request, responseClone);
                                });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Return offline page if fetch fails
                        if (request.destination === 'document') {
                            return caches.match('/offline.html');
                        }
                    });
            })
    );
});

// Handle API requests with offline support
async function handleApiRequest(request) {
    try {
        // Try network first
        const response = await fetch(request);
        
        // Cache successful API responses
        if (response && response.status === 200) {
            const responseClone = response.clone();
            const cache = await caches.open(OFFLINE_CACHE);
            await cache.put(request, responseClone);
        }
        
        return response;
    } catch (error) {
        console.log('🌐 Network unavailable, trying cache...');
        
        // Try to serve from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline response for API calls
        return new Response(JSON.stringify({
            success: false,
            error: 'You are offline. Please check your connection.',
            offline: true
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'offline-actions') {
        event.waitUntil(syncOfflineActions());
    }
});

// Sync offline actions when connection is restored
async function syncOfflineActions() {
    try {
        const offlineActions = await getOfflineActions();
        
        for (const action of offlineActions) {
            try {
                await performOfflineAction(action);
                await removeOfflineAction(action.id);
            } catch (error) {
                console.error('❌ Failed to sync action:', action, error);
            }
        }
        
        console.log('✅ Offline actions synced successfully');
    } catch (error) {
        console.error('❌ Background sync failed:', error);
    }
}

// Get stored offline actions
async function getOfflineActions() {
    try {
        const result = await indexedDB.open('TutorOfflineDB', 1);
        const db = await result;
        const transaction = db.transaction(['offlineActions'], 'readonly');
        const store = transaction.objectStore('offlineActions');
        return await store.getAll();
    } catch (error) {
        console.error('❌ Failed to get offline actions:', error);
        return [];
    }
}

// Perform offline action
async function performOfflineAction(action) {
    const response = await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    
    return response;
}

// Remove completed offline action
async function removeOfflineAction(id) {
    try {
        const result = await indexedDB.open('TutorOfflineDB', 1);
        const db = await result;
        const transaction = db.transaction(['offlineActions'], 'readwrite');
        const store = transaction.objectStore('offlineActions');
        await store.delete(id);
    } catch (error) {
        console.error('❌ Failed to remove offline action:', error);
    }
}

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('📱 Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New learning content available!',
        icon: '/images/tution.app_emblem.jpg',
        badge: '/images/tution.app_emblem.jpg',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Start Learning',
                icon: '/images/tution.app_emblem.jpg'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/tution.app_emblem.jpg'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Tutor App', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Notification clicked:', event.action);
    
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/dashboard.html')
        );
    }
});

console.log('🎯 Service Worker loaded successfully');