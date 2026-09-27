/**
 * PWA Service Worker Registration & Auto-Update Service
 */

export interface PWAUpdateHandler {
  onUpdateAvailable: () => void;
}

let registration: ServiceWorkerRegistration | null = null;
let updateAvailable = false;
const listeners: Array<() => void> = [];

export function isPWAUpdateAvailable(): boolean {
  return updateAvailable;
}

export function subscribeToUpdate(listener: () => void): () => void {
  listeners.push(listener);
  if (updateAvailable) {
    listener();
  }
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

function notifyUpdate() {
  updateAvailable = true;
  listeners.forEach((fn) => fn());
}

export function registerPWA(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    // Relative SW registration works whether at domain root or under a subpath
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => {
        registration = reg;
        console.log('[PWA] Service Worker registered with scope:', reg.scope);

        // Check if there's already a worker waiting
        if (reg.waiting) {
          notifyUpdate();
          return;
        }

        // Listen for new update installed
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New version ready to activate!');
              notifyUpdate();
            }
          });
        });

        // Periodic check for updates every 30 minutes
        setInterval(() => {
          reg.update().catch((err) => console.warn('[PWA] SW update check failed:', err));
        }, 30 * 60 * 1000);
      })
      .catch((err) => {
        console.warn('[PWA] Service worker registration note:', err);
      });
  });
}

/**
 * Trigger immediate activation of the new version and reload
 */
export function applyUpdate(): void {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  } else {
    window.location.reload();
  }
}

/**
 * Force clear all offline caches and unregister service workers (Bust Cache)
 */
export async function forceClearCacheAndReload(): Promise<void> {
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) {
        await r.unregister();
      }
    }
  } catch (err) {
    console.error('Error clearing cache:', err);
  } finally {
    window.location.reload();
  }
}
