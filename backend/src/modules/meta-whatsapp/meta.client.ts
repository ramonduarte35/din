import axios from 'axios';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';

export interface MetaConnectionStatus {
  success: boolean;
  phoneNumberId?: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  qualityRating?: string;
  status?: string;
  error?: string;
}

export class MetaCloudApiClient {
  private readonly defaultGraphApiVersion = 'v21.0';
  private readonly baseUrl = 'https://graph.facebook.com';

  /**
   * Obtém a configuração salva da Meta no banco de dados
   */
  async getConfig() {
    const config = await prisma.whatsAppIntegrationConfig.findFirst({
      orderBy: { created_at: 'desc' },
    });
    return config;
  }

  /**
   * Envia uma mensagem de texto via WhatsApp Cloud API
   */
  async sendText(
    recipientNumber: string,
    message: string,
    options?: { phoneNumberId?: string; accessToken?: string }
  ): Promise<boolean> {
    try {
      const config = await this.getConfig();
      const phoneNumberId = options?.phoneNumberId || config?.meta_phone_number_id;
      const accessToken = options?.accessToken || config?.meta_access_token;

      if (!phoneNumberId || !accessToken) {
        console.warn('⚠️ [Meta Cloud API] Impossível enviar mensagem: Phone Number ID ou Access Token ausentes.');
        return false;
      }

      const cleanNumber = recipientNumber.replace(/\D/g, '');
      const url = `${this.baseUrl}/${this.defaultGraphApiVersion}/${phoneNumberId}/messages`;

      console.log(`📤 [Meta Cloud API] Enviando mensagem para "${cleanNumber}" via PhoneID "${phoneNumberId}"...`);

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanNumber,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      console.log(`✅ [Meta Cloud API] Mensagem enviada com sucesso:`, response.data);
      return true;
    } catch (error: any) {
      console.error(
        '❌ [Meta Cloud API] Erro ao enviar mensagem:',
        error.response?.data || error.message
      );
      return false;
    }
  }

  /**
   * Realiza o download de uma mídia de áudio recebida no webhook da Meta
   */
  async downloadAudioMedia(
    mediaId: string,
    options?: { accessToken?: string }
  ): Promise<{ buffer: Buffer; mimeType: string } | null> {
    try {
      const config = await this.getConfig();
      const accessToken = options?.accessToken || config?.meta_access_token;

      if (!accessToken) {
        console.error('❌ [Meta Cloud API] Access Token não configurado para download de mídia.');
        return null;
      }

      // Passo 1: Buscar a URL temporária da mídia na Graph API
      const metadataUrl = `${this.baseUrl}/${this.defaultGraphApiVersion}/${mediaId}`;
      const metaRes = await axios.get(metadataUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
      });

      const downloadUrl = metaRes.data?.url;
      const mimeType = metaRes.data?.mime_type || 'audio/ogg';

      if (!downloadUrl) {
        console.error('❌ [Meta Cloud API] URL de download não encontrada na resposta da Meta.');
        return null;
      }

      // Passo 2: Baixar o arquivo binário com o Bearer Token
      const mediaResponse = await axios.get(downloadUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'Din-AI-Finance-WhatsApp-Bot',
        },
        responseType: 'arraybuffer',
        timeout: 25000,
      });

      return {
        buffer: Buffer.from(mediaResponse.data),
        mimeType,
      };
    } catch (error: any) {
      console.error('❌ [Meta Cloud API] Erro ao baixar áudio da Meta:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Testa e valida as credenciais da Meta Cloud API
   */
  async testConnection(
    phoneNumberId?: string,
    accessToken?: string
  ): Promise<MetaConnectionStatus> {
    try {
      const config = await this.getConfig();
      const targetPhoneId = phoneNumberId || config?.meta_phone_number_id;
      const targetToken = accessToken || config?.meta_access_token;

      if (!targetPhoneId || !targetToken) {
        return {
          success: false,
          error: 'Phone Number ID e Access Token são obrigatórios para testar a conexão.',
        };
      }

      const url = `${this.baseUrl}/${this.defaultGraphApiVersion}/${targetPhoneId}?fields=id,verified_name,display_phone_number,quality_rating,code_verification_status`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${targetToken}`,
        },
        timeout: 10000,
      });

      const data = response.data;

      return {
        success: true,
        phoneNumberId: data.id,
        displayPhoneNumber: data.display_phone_number,
        verifiedName: data.verified_name,
        qualityRating: data.quality_rating,
        status: data.code_verification_status || 'VERIFIED',
      };
    } catch (error: any) {
      const metaError = error.response?.data?.error?.message || error.message;
      return {
        success: false,
        error: `Falha na verificação da Meta: ${metaError}`,
      };
    }
  }

  /**
   * Valida a assinatura HMAC-SHA256 do payload do webhook da Meta (X-Hub-Signature-256)
   */
  verifyWebhookSignature(rawBody: string, signatureHeader?: string, appSecret?: string): boolean {
    if (!appSecret || !signatureHeader) {
      // Se appSecret não estiver configurado, permite passar ou loga aviso
      return true;
    }

    try {
      const parts = signatureHeader.split('=');
      const signature = parts[1];

      if (!signature) return false;

      const hmac = crypto.createHmac('sha256', appSecret);
      const expectedSignature = hmac.update(rawBody).digest('hex');

      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch (e) {
      console.error('❌ [Meta Cloud API] Erro ao validar assinatura de Webhook:', e);
      return false;
    }
  }
}

export const metaClient = new MetaCloudApiClient();
