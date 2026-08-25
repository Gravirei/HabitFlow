/**
 * IndexedDB-based image storage for large images (banners, covers, etc.)
 *
 * localStorage has a ~5 MB limit per origin, which is easily exceeded by
 * base64-encoded cover photos. IndexedDB supports hundreds of MB, making
 * it the right tier for persisting user-uploaded images client-side.
 */

const DB_NAME = 'habitflow-images'
const DB_VERSION = 1
const STORE_NAME = 'images'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Save a base64 data-URL (or any string blob) under the given key.
 */
export async function saveImage(key: string, dataUrl: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(dataUrl, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Load a previously saved image by key. Returns `null` when not found.
 */
export async function loadImage(key: string): Promise<string | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(key)
    req.onsuccess = () => resolve((req.result as string) ?? null)
    req.onerror = () => reject(req.error)
  })
}

/**
 * Remove an image by key. No-op if the key doesn't exist.
 */
export async function removeImage(key: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
