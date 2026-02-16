export function serviceWorkerScript(id: string): string {
  return `\
importScripts('https://assets.magicbell.io/web-push-notifications/sw.js');

const INBOX_ID = '${id}';
const DB_NAME = 'installable-inbox-' + INBOX_ID;

// Badge increment on push
self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    if (!navigator.setAppBadge) return;

    const db = await openBadgeDB();
    const current = await getCount(db) || 0;
    const newCount = current + 1;
    await setCount(db, newCount);
    await navigator.setAppBadge(newCount);
  })());
});

function openBadgeDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('badge');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getCount(db) {
  return new Promise((resolve) => {
    const tx = db.transaction('badge', 'readonly');
    const req = tx.objectStore('badge').get('count');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(0);
  });
}

function setCount(db, count) {
  return new Promise((resolve) => {
    const tx = db.transaction('badge', 'readwrite');
    tx.objectStore('badge').put(count, 'count');
    tx.oncomplete = () => resolve();
  });
}
`
}
