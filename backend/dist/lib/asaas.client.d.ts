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
}
export declare const asaasClient: AsaasClient;
