/**
 * useSyncQueue.ts
 *
 * Hook que monitora conectividade e processa a fila offline
 * automaticamente quando o dispositivo volta a ter internet.
 */

import { useEffect, useCallback, useState } from 'react';
import { getQueue, dequeue, getQueueCount, QueuedOperation } from '../lib/offlineQueue';
import { createTransactionRequest, updateTransactionRequest, deleteTransactionRequest } from '../api/transactions';
import { useToast } from '../contexts/ToastContext';

export function useSyncQueue() {
  const toast = useToast();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Atualiza contador de pendentes
  const refreshCount = useCallback(async () => {
    const count = await getQueueCount();
    setPendingCount(count);
  }, []);

  // Processa e sincroniza toda a fila
  const syncQueue = useCallback(async () => {
    const queue = await getQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    let syncedCount = 0;
    let failedCount = 0;

    for (const op of queue) {
      try {
        await processOperation(op);
        await dequeue(op.id);
        syncedCount++;
      } catch (err) {
        console.error(`[Din Sync] Falha ao sincronizar operação ${op.id}:`, err);
        failedCount++;
      }
    }

    setIsSyncing(false);
    await refreshCount();

    if (syncedCount > 0) {
      toast.success(
        '✅ Sincronização concluída',
        `${syncedCount} operação${syncedCount > 1 ? 'ões' : ''} sincronizada${syncedCount > 1 ? 's' : ''} com sucesso.`
      );
    }
    if (failedCount > 0) {
      toast.error(
        'Falha parcial na sincronização',
        `${failedCount} operação${failedCount > 1 ? 'ões' : ''} não puderam ser enviadas.`
      );
    }
  }, [toast, refreshCount]);

  // Monitora eventos de conectividade do navegador
  useEffect(() => {
    refreshCount();

    const handleOnline = () => {
      console.log('[Din PWA] Conectividade restaurada — iniciando sync da fila');
      syncQueue();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncQueue, refreshCount]);

  return { pendingCount, isSyncing, syncQueue };
}

/** Executa a operação correta baseada no tipo da fila */
async function processOperation(op: QueuedOperation): Promise<void> {
  switch (op.type) {
    case 'CREATE_TRANSACTION':
      await createTransactionRequest(op.payload as Parameters<typeof createTransactionRequest>[0]);
      break;

    case 'UPDATE_TRANSACTION': {
      const { id, ...rest } = op.payload as { id: string } & Record<string, unknown>;
      await updateTransactionRequest(id, rest as Parameters<typeof updateTransactionRequest>[1]);
      break;
    }

    case 'DELETE_TRANSACTION':
      await deleteTransactionRequest(op.payload.id as string);
      break;

    default:
      throw new Error(`Tipo de operação desconhecido: ${(op as QueuedOperation).type}`);
  }
}
