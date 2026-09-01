import axios from 'axios';
import { env } from '../../config/env.js';

export class EvolutionClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = env.EVOLUTION_API_URL.replace(/\/$/, '');
    this.apiKey = env.EVOLUTION_GLOBAL_API_KEY;
  }

  async sendText(instanceName: string, recipientNumber: string, message: string): Promise<boolean> {
    try {
      const cleanNumber = recipientNumber.replace(/\D/g, '');
      const url = `${this.baseUrl}/message/sendText/${instanceName}`;

      console.log(`📤 [Evolution] Enviando mensagem via instância "${instanceName}" para "${cleanNumber}"...`);

      const response = await axios.post(
        url,
        {
          number: cleanNumber,
          text: message,
          delay: 1000,
        },
        {
          headers: {
            apikey: this.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log(`✅ [Evolution] Mensagem enviada com sucesso:`, response.status);
      return true;
    } catch (error: any) {
      console.error(
        `❌ [Evolution] Falha ao enviar mensagem via "${instanceName}":`,
        error?.response?.data || error?.message
      );
      return false;
    }
  }

  async createInstance(instanceName: string) {
    try {
      const url = `${this.baseUrl}/instance/create`;
      const response = await axios.post(
        url,
        {
          instanceName,
          qrcode: true,
        },
        {
          headers: {
            apikey: this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(`❌ [Evolution] Erro ao criar instância "${instanceName}":`, error?.response?.data || error?.message);
      throw error;
    }
  }

  async setWebhook(instanceName: string, webhookUrl: string) {
    try {
      const url = `${this.baseUrl}/webhook/set/${instanceName}`;
      const response = await axios.post(
        url,
        {
          url: webhookUrl,
          webhook_by_events: false,
          events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE'],
        },
        {
          headers: {
            apikey: this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(`❌ [Evolution] Erro ao setar webhook para "${instanceName}":`, error?.response?.data || error?.message);
      throw error;
    }
  }
}

export const evolutionClient = new EvolutionClient();
