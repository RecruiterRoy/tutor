// public/sw.js
// Service Worker for TUTOR.AI - Basic offline support

const CACHE_NAME = 'tutorai-v1.0.4';
const CACHE_VERSION = '1.0.4';

// Essential assets to cache for offline functionality
const ESSENTIAL_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/dashboard.html',
  '/public/error.html',
  '/public/js/config.js',
  '/public/js/auth.js',
  '/public/js/dashboard.js',
  '/public/js/textToSpeech.js',
  '/public/js/subjectManager.js',
  '/public/js/supabaseClient.js',
  '/public/images/favicon.ico',
          '/public/images/tution.app_logo.jpg',
  '/public/images/roy_sir.jpg',
  '/public/images/miss_sapana.jpg'
];

// API endpoints to cache
const API_CACHE = [
  '/api/health',
  '/api/chat',
  '/api/enhanced-chat'
];

// Static assets that should be cached aggressively
const STATIC_ASSETS = [
  '/public/js/',
  '/public/images/',
  '/public/css/'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: 'cache-first',
  // Network first for dynamic content
  NETWORK_FIRST: 'network-first',
  // Cache only for offline fallbacks
  CACHE_ONLY: 'cache-only'
};

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching essential assets');
        return cache.addAll(ESSENTIAL_ASSETS.map(url => {
          // Handle relative URLs
          return new Request(url, { mode: 'no-cors' });
        }));
      })
      .catch((error) => {
        console.error('Failed to cache assets:', error);
        // Don't fail installation if caching fails
        return Promise.resolve();
      })
  );
  
  // Force immediate activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Claim all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Determine cache strategy based on request type
  let strategy = getCacheStrategy(request);
  
  event.respondWith(
    handleRequest(request, strategy)
      .catch((error) => {
        console.error('Fetch failed:', error);
        return handleFallback(request);
      })
  );
});

function getCacheStrategy(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Network first for JS to avoid stale app code
  if (pathname.startsWith('/public/js/') || pathname.endsWith('.js')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }

  // Cache first for static assets (images, fonts, css)
  if (pathname.match(/\.(css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf)$/)) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // Network first for HTML to always fetch latest
  if (pathname.match(/\.(html)$/) || pathname === '/') {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  // Network first for API calls and dynamic content
  if (pathname.includes('/api/') || url.hostname.includes('supabase')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  // Default to network first
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return handleCacheFirst(request);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return handleNetworkFirst(request);
    
    case CACHE_STRATEGIES.CACHE_ONLY:
      return handleCacheOnly(request);
    
    default:
      return handleNetworkFirst(request);
  }
}

async function handleCacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background if possible
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  // If not in cache, fetch from network and cache
  const networkResponse = await fetch(request);
  await cacheResponse(request, networkResponse.clone());
  return networkResponse;
}

async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request, {
      timeout: 5000 // 5 second timeout
    });
    
    // Cache successful responses
    if (networkResponse.ok) {
      await cacheResponse(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fall back to cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function handleCacheOnly(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  throw new Error('Resource not available offline');
}

async function cacheResponse(request, response) {
  // Only cache successful responses
  if (!response || response.status !== 200 || response.type !== 'basic') {
    return;
  }
  
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response);
  } catch (error) {
    console.error('Failed to cache response:', error);
  }
}

function updateCacheInBackground(request) {
  // Update cache in background without blocking response
  fetch(request)
    .then(response => {
      if (response.ok) {
        return cacheResponse(request, response.clone());
      }
    })
    .catch(error => {
      console.log('Background cache update failed:', error);
    });
}

async function handleFallback(request) {
  const url = new URL(request.url);
  
  // For HTML pages, return error page
  if (request.headers.get('accept').includes('text/html')) {
    const errorPage = await caches.match('/public/error.html');
    if (errorPage) {
      return errorPage;
    }
  }
  
  // For other requests, return a generic offline response
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'This resource is not available offline'
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'CLEAR_CACHE':
        clearAllCaches();
        break;
        
      case 'UPDATE_CACHE':
        updateEssentialAssets();
        break;
        
      default:
        console.log('Unknown message type:', event.data.type);
    }
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('All caches cleared');
}

async function updateEssentialAssets() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(ESSENTIAL_ASSETS);
  console.log('Essential assets updated');
}

// Periodic cache cleanup (runs when SW is idle)
self.addEventListener('idle', () => {
  cleanupOldCaches();
});

async function cleanupOldCaches() {
  try {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
      name.startsWith('tutorai-') && name !== CACHE_NAME
    );
    
    await Promise.all(
      oldCaches.map(cacheName => caches.delete(cacheName))
    );
    
    if (oldCaches.length > 0) {
      console.log('Cleaned up old caches:', oldCaches);
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
} 