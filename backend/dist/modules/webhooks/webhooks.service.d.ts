import { TransactionOrigin } from '@prisma/client';
export declare class WebhooksService {
    /**
     * Envio unificado de mensagem via canais (Evolution Go, Meta Cloud API Oficial ou Telegram Bot)
     */
    private sendWhatsAppReply;
    /**
     * Validação do handshake de Webhook da Meta (GET /api/v1/webhooks/meta)
     */
    verifyMetaWebhook(mode?: string, token?: string, challenge?: string): Promise<{
        success: boolean;
        challenge: string | undefined;
    } | {
        success: boolean;
        challenge?: undefined;
    }>;
    /**
     * Processamento de mensagens recebidas da Meta Cloud API Oficial (POST /api/v1/webhooks/meta)
     */
    processMetaMessage(payload: any): Promise<{
        status: string;
    }>;
    /**
     * Processamento de eventos e mensagens recebidas do Telegram Bot API (POST /api/v1/webhooks/telegram)
     */
    processTelegramMessage(payload: any): Promise<{
        status: string;
    } | {
        status: string;
        userId: string;
    }>;
    processEvolutionMessage(payload: any): Promise<{
        status: string;
    }>;
    /**
     * Pipeline Financeiro Unificado (WhatsApp Evolution, WhatsApp Meta e Telegram Bot)
     */
    processUserFinancialMessage(user: any, instance: string, remoteJid: string, trimmedText: string, origin?: TransactionOrigin, senderIdentifier?: string): Promise<{
        status: string;
    }>;
    /**
     * Extração com OpenAI (gpt-4o-mini com Structured Outputs via JSON Schema)
     */
    private extractWithAI;
    /**
     * Helper para localizar conta correspondente por texto
     */
    private findMatchingAccountName;
    /**
     * Parser Local Resiliente de Fallback com suporte a regexes avançadas
     */
    private fallbackLocalParser;
    /**
     * Trata o cadastro de uma nova conta a pagar via WhatsApp
     */
    private handleRegisterBill;
    /**
     * Trata a consulta de contas a pagar / boletos pendentes via WhatsApp
     */
    private handleQueryBills;
    /**
     * Trata a liquidação / pagamento de uma conta a pagar debitando da conta bancária
     */
    private handlePayBill;
    /**
     * Consulta de saldo por WhatsApp (com suporte a múltiplas contas)
     */
    private handleBalanceQuery;
    /**
     * Registro de transações com direcionamento para a conta bancária correta
     */
    private handleTransactionsRegistration;
    /**
     * Responde com guia de uso amigável
     */
    private handleUnknownMessage;
    /**
     * Obtém a configuração do sistema sobre responder apenas a números cadastrados
     */
    private getReplyOnlyRegisteredSetting;
}
