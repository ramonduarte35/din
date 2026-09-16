export interface AsaasCustomerData {
    name: string;
    email: string;
    cpfCnpj?: string;
    phone?: string;
    mobilePhone?: string;
}
export interface AsaasPaymentData {
    customerId: string;
    billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'UNDEFINED';
    value: number;
    dueDate: string;
    description?: string;
}
export interface AsaasPixQrCodeResponse {
    encodedImage: string;
    payload: string;
    expirationDate: string;
}
export interface AsaasPaymentResponse {
    id: string;
    customer: string;
    value: number;
    netValue?: number;
    billingType: string;
    status: string;
    dueDate: string;
    invoiceUrl?: string;
    bankSlipUrl?: string;
}
export interface AsaasPaymentLinkData {
    name: string;
    description?: string;
    billingType?: 'UNDEFINED' | 'PIX' | 'CREDIT_CARD' | 'BOLETO';
    chargeType?: 'DETACHED' | 'RECURRENT' | 'INSTALLMENT';
    subscriptionCycle?: 'MONTHLY' | 'YEARLY' | 'BIWEEKLY' | 'QUARTERLY' | 'SEMIANNUALLY';
    value: number;
    dueDateLimitDays?: number;
    externalReference?: string;
    notificationEnabled?: boolean;
}
export interface AsaasPaymentLinkResponse {
    id: string;
    name: string;
    value: number;
    active: boolean;
    chargeType: string;
    url: string;
    billingType: string;
    subscriptionCycle?: string;
    description?: string;
    dueDateLimitDays?: number;
    externalReference?: string;
}
export declare class AsaasClient {
    private baseUrl;
    private apiKey;
    constructor();
    private isConfigured;
    private getHeaders;
    /**
     * Localiza cliente por email ou cria um novo cadastro no Asaas
     */
    findOrCreateCustomer(data: AsaasCustomerData): Promise<{
        id: string;
    }>;
    /**
     * Atualiza dados de um cliente existente no Asaas (ex: CPF/CNPJ ou telefone)
     */
    updateCustomer(customerId: string, data: Partial<AsaasCustomerData>): Promise<{
        id: string;
    }>;
    /**
     * Cria cobrança no Asaas (PIX, Cartão ou Boleto)
     */
    createPayment(data: AsaasPaymentData): Promise<AsaasPaymentResponse>;
    /**
     * Obtém QR Code PIX e chave Copia e Cola de um pagamento
     */
    getPixQrCode(paymentId: string): Promise<AsaasPixQrCodeResponse>;
    /**
     * Consulta status de um pagamento específico
     */
    getPayment(paymentId: string): Promise<AsaasPaymentResponse | null>;
    /**
     * Cria um Link de Pagamento (Checkout Asaas)
     */
    createPaymentLink(data: AsaasPaymentLinkData): Promise<AsaasPaymentLinkResponse>;
    /**
     * Obtém detalhes de um Link de Pagamento no Asaas
     */
    getPaymentLink(paymentLinkId: string): Promise<any>;
    /**
     * Exclui um Link de Pagamento no Asaas
     */
    deletePaymentLink(paymentLinkId: string): Promise<any>;
    /**
     * Obtém detalhes de uma Assinatura no Asaas
     */
    getSubscription(subscriptionId: string): Promise<any>;
    /**
     * Cancela uma Assinatura no Asaas
     */
    deleteSubscription(subscriptionId: string): Promise<any>;
}
export declare const asaasClient: AsaasClient;
