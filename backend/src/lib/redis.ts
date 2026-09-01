import { Redis } from 'ioredis';
import { env } from '../config/env.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.warn('⚠️ [Redis] Aviso de conexão:', err.message);
});

redis.on('connect', () => {
  console.log('⚡ [Redis] Conectado com sucesso.');
});
