import axios from 'axios';
import { env } from '../../config/env.js';

export interface EvolutionInstanceInfo {
  instanceName: string;
  owner?: string;
  profileName?: string;
  profilePictureUrl?: string;
  status: 'open' | 'close' | 'connecting' | 'qrcode' | string;
  qrcode?: {
    code?: string;
    base64?: string;
    pairingCode?: string;
  };
}

export class EvolutionClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = env.EVOLUTION_API_URL.replace(/\/$/, '');
    this.apiKey = env.EVOLUTION_GLOBAL_API_KEY;
  }

  private getHeaders() {
    return {
      apikey: this.apiKey,
      'Content-Type': 'application/json',
    };
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
          headers: this.getHeaders(),
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

  async fetchInstances(): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/instance/fetchInstances`;
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        timeout: 8000,
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error(`❌ [Evolution] Erro ao buscar instâncias:`, error?.response?.data || error?.message);
      return [];
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
          integration: 'WHATSAPP-BAILEYS',
        },
        {
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(`❌ [Evolution] Erro ao criar instância "${instanceName}":`, error?.response?.data || error?.message);
      throw error;
    }
  }

  async connectInstance(instanceName: string) {
    try {
      const url = `${this.baseUrl}/instance/connect/${instanceName}`;
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
      return response.data;
    } catch (error: any) {
      console.error(`❌ [Evolution] Erro ao conectar instância "${instanceName}":`, error?.response?.data || error?.message);
      throw error;
    }
  }

  async getConnectionState(instanceName: string): Promise<{ state: string }> {
    try {
      const url = `${this.baseUrl}/instance/connectionState/${instanceName}`;
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        timeout: 6000,
      });
      const state = response.data?.instance?.state || response.data?.state || 'close';
      return { state };
    } catch (error: any) {
      return { state: 'close' };
    }
  }

  async restartInstance(instanceName: string) {
    try {
      const url = `${this.baseUrl}/instance/restart/${instanceName}`;
      const response = await axios.post(url, {}, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
      return response.data;
    } catch (error: any) {
      console.error(`❌ [Evolution] Erro ao reiniciar instância "${instanceName}":`, error?.response?.data || error?.message);
      throw error;
    }
  }

  async logoutInstance(instanceName: string) {
    try {
      const url = `${this.baseUrl}/instance/logout/${instanceName}`;
      const response = await axios.delete(url, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
      return response.data;
    } catch (error: any) {
      console.error(`❌ [Evolution] Erro ao deslogar instância "${instanceName}":`, error?.response?.data || error?.message);
      throw error;
    }
  }

  async deleteInstance(instanceName: string) {
    try {
      const url = `${this.baseUrl}/instance/delete/${instanceName}`;
      const response = await axios.delete(url, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
      return response.data;
    } catch (error: any) {
      console.error(`❌ [Evolution] Erro ao deletar instância "${instanceName}":`, error?.response?.data || error?.message);
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
          headers: this.getHeaders(),
          timeout: 10000,
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
