import { env } from '../config/env.js';

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
  dueDate: string; // YYYY-MM-DD
  description?: string;
}

export interface AsaasPixQrCodeResponse {
  encodedImage: string; // Base64 image
  payload: string;      // PIX Copia e Cola
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

export class AsaasClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.apiKey = (env.ASAAS_API_KEY || '').trim();
    this.baseUrl =
      env.ASAAS_ENVIRONMENT === 'production'
        ? 'https://api.asaas.com/v3'
        : 'https://sandbox.asaas.com/v3';
  }

  private isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'access_token': this.apiKey,
      'User-Agent': 'Din-Financial-SaaS/1.0',
    };
  }

  /**
   * Localiza cliente por email ou cria um novo cadastro no Asaas
   */
  async findOrCreateCustomer(data: AsaasCustomerData): Promise<{ id: string }> {
    if (!this.isConfigured()) {
      console.log(`ℹ️ [Asaas Mock] API Key não configurada. Simulando cliente Asaas para: ${data.email}`);
      return { id: `cus_mock_${Buffer.from(data.email).toString('hex').slice(0, 14)}` };
    }

    try {
      // 1. Tentar buscar por e-mail
      const searchRes = await fetch(`${this.baseUrl}/customers?email=${encodeURIComponent(data.email)}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (searchRes.ok) {
        const searchData = (await searchRes.json()) as { data?: Array<{ id: string }> };
        if (searchData.data && searchData.data.length > 0) {
          return { id: searchData.data[0].id };
        }
      }

      // 2. Se não existir, criar novo cliente
      const createRes = await fetch(`${this.baseUrl}/customers`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          cpfCnpj: data.cpfCnpj?.replace(/\D/g, '') || undefined,
          mobilePhone: data.mobilePhone?.replace(/\D/g, '') || data.phone?.replace(/\D/g, '') || undefined,
        }),
      });

      const createData = (await createRes.json()) as { id?: string; errors?: Array<{ description: string }> };

      if (!createRes.ok || !createData.id) {
        const errorMsg = createData.errors?.map((e) => e.description).join(', ') || 'Erro desconhecido ao criar cliente Asaas';
        throw new Error(`Falha no Asaas: ${errorMsg}`);
      }

      return { id: createData.id };
    } catch (err: any) {
      console.error('❌ [Asaas Client] Erro em findOrCreateCustomer:', err.message);
      throw err;
    }
  }

  /**
   * Cria cobrança no Asaas (PIX, Cartão ou Boleto)
   */
  async createPayment(data: AsaasPaymentData): Promise<AsaasPaymentResponse> {
    if (!this.isConfigured()) {
      console.log(`ℹ️ [Asaas Mock] API Key não configurada. Simulando cobrança no valor de R$ ${data.value}`);
      const mockId = `pay_mock_${Date.now()}`;
      return {
        id: mockId,
        customer: data.customerId,
        value: data.value,
        netValue: data.value * 0.98,
        billingType: data.billingType,
        status: 'PENDING',
        dueDate: data.dueDate,
        invoiceUrl: `https://sandbox.asaas.com/i/${mockId}`,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          customer: data.customerId,
          billingType: data.billingType,
          value: data.value,
          dueDate: data.dueDate,
          description: data.description || 'Assinatura Din PRO',
          postalService: false,
        }),
      });

      const resData = (await response.json()) as any;

      if (!response.ok || !resData.id) {
        const errorMsg = resData.errors?.map((e: any) => e.description).join(', ') || 'Erro ao criar cobrança no Asaas';
        throw new Error(`Falha no Asaas: ${errorMsg}`);
      }

      return {
        id: resData.id,
        customer: resData.customer,
        value: resData.value,
        netValue: resData.netValue,
        billingType: resData.billingType,
        status: resData.status,
        dueDate: resData.dueDate,
        invoiceUrl: resData.invoiceUrl,
        bankSlipUrl: resData.bankSlipUrl,
      };
    } catch (err: any) {
      console.error('❌ [Asaas Client] Erro em createPayment:', err.message);
      throw err;
    }
  }

  /**
   * Obtém QR Code PIX e chave Copia e Cola de um pagamento
   */
  async getPixQrCode(paymentId: string): Promise<AsaasPixQrCodeResponse> {
    if (!this.isConfigured() || paymentId.startsWith('pay_mock_')) {
      const mockPayload = `00020126580014br.gov.bcb.pix0136mock-din-pro-${paymentId}520400005303986540519.905802BR5909DIN_PRO6008BRASILIA62070503***6304ABCD`;
      // SVG / 1x1 pixel PNG placeholder em base64
      const mockImage =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const expDate = new Date();
      expDate.setHours(expDate.getHours() + 24);

      return {
        encodedImage: mockImage,
        payload: mockPayload,
        expirationDate: expDate.toISOString(),
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}/pixQrCode`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const resData = (await response.json()) as any;

      if (!response.ok || !resData.payload) {
        const errorMsg = resData.errors?.map((e: any) => e.description).join(', ') || 'Erro ao obter PIX no Asaas';
        throw new Error(`Falha no Asaas PIX: ${errorMsg}`);
      }

      return {
        encodedImage: resData.encodedImage,
        payload: resData.payload,
        expirationDate: resData.expirationDate,
      };
    } catch (err: any) {
      console.error('❌ [Asaas Client] Erro em getPixQrCode:', err.message);
      throw err;
    }
  }

  /**
   * Consulta status de um pagamento específico
   */
  async getPayment(paymentId: string): Promise<AsaasPaymentResponse | null> {
    if (!this.isConfigured() || paymentId.startsWith('pay_mock_')) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) return null;
      return (await response.json()) as AsaasPaymentResponse;
    } catch (err: any) {
      console.error('❌ [Asaas Client] Erro em getPayment:', err.message);
      return null;
    }
  }
}

export const asaasClient = new AsaasClient();
