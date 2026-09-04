/**
 * offlineQueue.ts
 *
 * Fila de sincronização offline usando IndexedDB.
 * Quando o usuário cria/edita/deleta uma transação sem internet,
 * a operação é guardada aqui e enviada automaticamente quando reconectar.
 */

export type QueuedOperation = {
  id: string;
  type: 'CREATE_TRANSACTION' | 'UPDATE_TRANSACTION' | 'DELETE_TRANSACTION' | 'PAY_BILL';
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
};

const DB_NAME = 'din-offline-db';
const DB_VERSION = 1;
const STORE_NAME = 'sync-queue';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Adiciona uma operação à fila */
export async function enqueue(op: Omit<QueuedOperation, 'id' | 'createdAt' | 'retries'>): Promise<void> {
  const db = await openDB();
  const item: QueuedOperation = {
    ...op,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
    retries: 0,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Retorna todas as operações pendentes */
export async function getQueue(): Promise<QueuedOperation[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as QueuedOperation[]);
    req.onerror = () => reject(req.error);
  });
}

/** Remove uma operação da fila (após sync bem-sucedido) */
export async function dequeue(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Retorna quantidade de itens pendentes */
export async function getQueueCount(): Promise<number> {
  const items = await getQueue();
  return items.length;
}
