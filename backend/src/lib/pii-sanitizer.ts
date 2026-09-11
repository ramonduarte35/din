/**
 * @file pii-sanitizer.ts
 * @description Utilitário de sanitização de PII (Personal Identifiable Information)
 * para uso nos serializers e hooks do logger Pino.
 *
 * Expurga dados sensíveis de strings e objetos antes de qualquer escrita em log,
 * garantindo conformidade com LGPD (Art. 46 — medidas técnicas de segurança).
 *
 * Regra: NUNCA alterar o payload real das respostas — apenas o que vai para o log.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Padrões de PII compilados uma única vez (custo zero em runtime)
// ─────────────────────────────────────────────────────────────────────────────
const PII_PATTERNS: ReadonlyArray<{ readonly pattern: RegExp; readonly replacement: string }> = [
  // CPF: formatos 000.000.000-00 e 00000000000
  { pattern: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, replacement: '[CPF_REDACTED]' },
  // E-mails
  { pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL_REDACTED]' },
  // Bearer tokens em Authorization headers
  { pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, replacement: 'Bearer [TOKEN_REDACTED]' },
  // Telefones BR: +55 (11) 99999-9999 e variações
  { pattern: /(\+?55\s?)?\(?\d{2}\)?\s?\d{4,5}[\-\s]?\d{4}/g, replacement: '[PHONE_REDACTED]' },
  // Cartões de crédito (16 dígitos com separadores)
  { pattern: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g, replacement: '[CARD_REDACTED]' },
];

/** Campos que devem ser completamente redatados pelo nome da chave. */
const ALWAYS_REDACT_KEYS = new Set([
  'password', 'senha', 'password_hash', 'passwordhash',
  'secret', 'token', 'refreshtoken', 'accesstoken',
  'authorization', 'cpf', 'cardnumber', 'cvv', 'pin',
]);

/**
 * Sanitiza uma string substituindo padrões de PII.
 */
export function sanitizeString(value: string): string {
  let result = value;
  for (const { pattern, replacement } of PII_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Sanitiza recursivamente qualquer estrutura de dados.
 * Opera de forma imutável — não modifica o objeto original.
 */
export function sanitizeValue(value: unknown, depth = 0): unknown {
  if (depth > 8) return '[MAX_DEPTH_REDACTED]';

  if (typeof value === 'string') return sanitizeString(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1));
  }

  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (ALWAYS_REDACT_KEYS.has(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeValue(val, depth + 1);
      }
    }
    return sanitized;
  }

  return value;
}

/**
 * Serializer para o objeto `req` do Fastify — usado no Pino.
 * Remove headers sensíveis e sanitiza a URL.
 */
export function serializeRequest(request: {
  method?: string;
  url?: string;
  headers?: Record<string, unknown>;
  ip?: string;
}) {
  return {
    method:  request.method,
    url:     request.url ? sanitizeString(request.url) : undefined,
    headers: {
      'content-type': request.headers?.['content-type'],
      'user-agent':   request.headers?.['user-agent'],
      'x-request-id': request.headers?.['x-request-id'],
      // Authorization é deliberadamente OMITIDA dos logs
    },
    ip: request.ip,
  };
}

/**
 * Serializer para erros — sanitiza mensagem e omite stack em produção.
 * Retorna always stack como string para satisfazer o tipo do Fastify.
 */
export function serializeError(error: Error) {
  return {
    type:    error.constructor.name,
    message: sanitizeString(error.message),
    // Stack como string vazia em produção — nunca undefined (Fastify exige string)
    stack:   process.env.NODE_ENV !== 'production' ? (error.stack ?? '') : '',
  };
}
