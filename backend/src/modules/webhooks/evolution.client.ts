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

  async getLicenseStatus(): Promise<{ status: string; instance_id?: string; error?: string }> {
    try {
      const url = `${this.baseUrl}/license/status`;
      const response = await axios.get(url, { timeout: 4000 });
      return response.data;
    } catch (err: any) {
      if (err?.response?.data) {
        return err.response.data;
      }
      return { status: 'offline', error: err?.message || 'Evolution Go inacessível' };
    }
  }

  async getLicenseRegisterUrl(): Promise<{ register_url: string | null; status: string; instance_id?: string }> {
    try {
      const url = `${this.baseUrl}/license/register`;
      const response = await axios.get(url, { timeout: 4000 });
      return {
        register_url: response.data?.register_url || null,
        status: response.data?.status || 'unknown',
        instance_id: response.data?.instance_id,
      };
    } catch (err: any) {
      return {
        register_url: null,
        status: 'error',
      };
    }
  }

  async testConnection(): Promise<{
    is_online: boolean;
    base_url: string;
    api_key_configured: boolean;
    license: {
      status: string;
      instance_id?: string;
      register_url?: string | null;
    };
    instances_count: number;
    latency_ms: number;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      const [licenseRes, registerRes, instances] = await Promise.all([
        this.getLicenseStatus(),
        this.getLicenseRegisterUrl(),
        this.fetchInstances(),
      ]);

      const latency_ms = Date.now() - startTime;
      const is_online = licenseRes.status !== 'offline';

      return {
        is_online,
        base_url: this.baseUrl,
        api_key_configured: Boolean(this.apiKey && this.apiKey.length > 0),
        license: {
          status: licenseRes.status || 'unknown',
          instance_id: licenseRes.instance_id || registerRes.instance_id,
          register_url: registerRes.register_url,
        },
        instances_count: instances.length,
        latency_ms,
      };
    } catch (err: any) {
      return {
        is_online: false,
        base_url: this.baseUrl,
        api_key_configured: Boolean(this.apiKey && this.apiKey.length > 0),
        license: {
          status: 'offline',
        },
        instances_count: 0,
        latency_ms: Date.now() - startTime,
        error: err?.message || 'Falha ao conectar ao gateway Evolution Go',
      };
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
      const webhookUrl = 'http://api:3000/api/v1/webhooks/evolution';
      const response = await axios.post(
        url,
        {
          instanceName,
          token: instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
          reject_call: false,
          groupsIgnore: false,
          alwaysOnline: true,
          readMessages: false,
          readStatus: false,
          webhook: {
            enabled: true,
            url: webhookUrl,
            byEvents: false,
            base64: true,
            events: [
              'QRCODE_UPDATED',
              'CONNECTION_UPDATE',
              'MESSAGES_UPSERT',
            ],
          },
        },
        {
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.data?.message?.includes('already in use')) {
        return { status: 'EXISTS' };
      }
      console.error(`❌ [Evolution] Erro ao criar instância "${instanceName}":`, error?.response?.data || error?.message);
      throw error;
    }
  }

  async connectInstance(instanceName: string) {
    try {
      const url = `${this.baseUrl}/instance/connect/${encodeURIComponent(instanceName)}`;
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
      return response.data;
    } catch (error: any) {
      try {
        const qrUrl = `${this.baseUrl}/instance/qr?name=${encodeURIComponent(instanceName)}`;
        const qrRes = await axios.get(qrUrl, {
          headers: this.getHeaders(),
          timeout: 10000,
        });
        return qrRes.data;
      } catch {
        console.error(`❌ [Evolution] Erro ao conectar instância "${instanceName}":`, error?.response?.data || error?.message);
        throw error;
      }
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
