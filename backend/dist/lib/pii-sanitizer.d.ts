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
/**
 * Sanitiza uma string substituindo padrões de PII.
 */
export declare function sanitizeString(value: string): string;
/**
 * Sanitiza recursivamente qualquer estrutura de dados.
 * Opera de forma imutável — não modifica o objeto original.
 */
export declare function sanitizeValue(value: unknown, depth?: number): unknown;
/**
 * Serializer para o objeto `req` do Fastify — usado no Pino.
 * Remove headers sensíveis e sanitiza a URL.
 */
export declare function serializeRequest(request: {
    method?: string;
    url?: string;
    headers?: Record<string, unknown>;
    ip?: string;
}): {
    method: string | undefined;
    url: string | undefined;
    headers: {
        'content-type': unknown;
        'user-agent': unknown;
        'x-request-id': unknown;
    };
    ip: string | undefined;
};
/**
 * Serializer para erros — sanitiza mensagem e omite stack em produção.
 * Retorna always stack como string para satisfazer o tipo do Fastify.
 */
export declare function serializeError(error: Error): {
    type: string;
    message: string;
    stack: string;
};
