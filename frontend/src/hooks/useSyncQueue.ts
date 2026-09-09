/**
 * useSyncQueue.ts
 *
 * Hook que monitora conectividade e processa a fila offline
 * automaticamente quando o dispositivo volta a ter internet.
 */

import { useEffect, useCallback, useState } from 'react';
import {
  getQueue,
  dequeue,
  getQueueCount,
  incrementRetry,
  MAX_QUEUE_RETRIES,
  QueuedOperation,
} from '../lib/offlineQueue';
import {
  createTransactionRequest,
  updateTransactionRequest,
  deleteTransactionRequest,
} from '../api/transactions';
import { payBill } from '../api/bills';
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
    let discardedCount = 0;

    for (const op of queue) {
      try {
        await processOperation(op);
        await dequeue(op.id);
        syncedCount++;
      } catch (err) {
        console.error(`[Din Sync] Falha ao sincronizar operação ${op.id}:`, err);
        const discarded = await incrementRetry(op.id);
        if (discarded) {
          discardedCount++;
          console.warn(`[Din Sync] Operação ${op.id} descartada após ${MAX_QUEUE_RETRIES} tentativas consecutivas sem sucesso.`);
        }
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
    if (discardedCount > 0) {
      toast.error(
        'Falha no envio de operações',
        `${discardedCount} operação${discardedCount > 1 ? 'ões' : ''} não puderam ser sincronizadas após várias tentativas e foram removidas.`
      );
    } else if (failedCount > 0) {
      toast.error(
        'Falha parcial na sincronização',
        `${failedCount} operação${failedCount > 1 ? 'ões' : ''} não puderam ser enviadas no momento. Tentaremos novamente na próxima reconexão.`
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

    case 'PAY_BILL': {
      const { id, ...payData } = op.payload as { id: string } & Parameters<typeof payBill>[1];
      await payBill(id, payData);
      break;
    }

    default:
      throw new Error(`Tipo de operação desconhecido: ${(op as QueuedOperation).type}`);
  }
}
