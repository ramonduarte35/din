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
      const url = `${this.baseUrl}/send/text`;

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
            apikey: instanceName,
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

  async activateLicense(code: string): Promise<{ success: boolean; message?: string; error?: string; details?: any }> {
    try {
      const url = `${this.baseUrl}/license/activate`;
      const response = await axios.get(url, {
        params: { code: code.trim() },
        headers: this.getHeaders(),
        timeout: 10000,
      });
      return { success: true, message: 'Licença ativada com sucesso!', details: response.data };
    } catch (err: any) {
      const errorMsg = err?.response?.data?.details || err?.response?.data?.error || err?.message || 'Falha ao ativar a licença.';
      return { success: false, error: errorMsg };
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
      const url = `${this.baseUrl}/instance/all`;
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        timeout: 8000,
      });
      return Array.isArray(response.data?.data) ? response.data.data : [];
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
          name: instanceName,
          token: instanceName,
          client_name: 'Din',
          alwaysOnline: true,
        },
        {
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error?.response?.data?.message?.includes('already exists') || error?.response?.data?.error?.includes('already')) {
        return { status: 'EXISTS' };
      }
      console.warn(`[Evolution] Erro/Aviso ao criar instância "${instanceName}":`, error?.response?.data || error?.message);
      return { status: 'EXISTS' };
    }
  }

  async connectInstance(instanceName: string) {
    try {
      // 1. Garantir que a instância existe no Evolution Go
      await this.createInstance(instanceName);

      // 2. Iniciar conexão com webhook e eventos
      const connectUrl = `${this.baseUrl}/instance/connect`;
      const webhookUrl = 'http://api:3000/api/v1/webhooks/evolution';
      
      try {
        await axios.post(
          connectUrl,
          {
            webhookUrl,
            eventString: 'MESSAGE,QRCODE,CONNECTION',
            events: ['MESSAGE', 'QRCODE', 'CONNECTION', 'MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'],
            subscribe: [
              'MESSAGE',
              'QRCODE',
              'CONNECTION',
              'MESSAGES_UPSERT',
              'CONNECTION_UPDATE',
              'QRCODE_UPDATED',
            ],
          },
          {
            headers: { apikey: instanceName },
            timeout: 10000,
          }
        );
      } catch (connErr) {
        // Pode já estar conectando
      }

      // 3. Obter QR Code
      let qrcode: string | null = null;
      let code: string | null = null;

      try {
        const qrUrl = `${this.baseUrl}/instance/qr`;
        const qrRes = await axios.get(qrUrl, {
          headers: { apikey: instanceName },
          timeout: 10000,
        });

        qrcode = qrRes.data?.data?.qrcode || qrRes.data?.qrcode || null;
        code = qrRes.data?.data?.code || qrRes.data?.code || null;
      } catch (qrErr: any) {
        const errorText = qrErr?.response?.data?.error || qrErr?.response?.data?.message || qrErr?.message || '';
        if (errorText.includes('already logged in') || errorText.includes('already')) {
          console.log(`✅ [Evolution] Instância "${instanceName}" já está autenticada e conectada.`);
          return {
            base64: null,
            code: null,
            qrcode: { base64: null },
            connected: true,
          };
        }
        throw qrErr;
      }

      return {
        base64: qrcode,
        code,
        qrcode: { base64: qrcode },
      };
    } catch (error: any) {
      console.error(`❌ [Evolution] Erro ao conectar instância "${instanceName}":`, error?.response?.data || error?.message);
      throw error;
    }
  }

  async getConnectionState(instanceName: string): Promise<{ state: string }> {
    try {
      const instances = await this.fetchInstances();
      const target = instances.find(
        (inst: any) =>
          inst.name === instanceName ||
          inst.token === instanceName ||
          inst.id === instanceName
      );
      if (target && (target.connected === true || target.status === 'open')) {
        return { state: 'open' };
      }
      return { state: 'close' };
    } catch (error: any) {
      return { state: 'close' };
    }
  }

  async restartInstance(instanceName: string) {
    try {
      // No Evolution Go reconectar chama connect
      return await this.connectInstance(instanceName);
    } catch (error: any) {
      console.error(`❌ [Evolution] Erro ao reiniciar instância "${instanceName}":`, error?.response?.data || error?.message);
      throw error;
    }
  }

  async logoutInstance(instanceName: string) {
    try {
      const url = `${this.baseUrl}/instance/logout`;
      const response = await axios.delete(url, {
        headers: { apikey: instanceName },
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
      const url = `${this.baseUrl}/instance/delete/${encodeURIComponent(instanceName)}`;
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
      const url = `${this.baseUrl}/instance/connect`;
      const response = await axios.post(
        url,
        {
          webhookUrl,
          eventString: 'MESSAGE,QRCODE,CONNECTION',
          events: ['MESSAGE', 'QRCODE', 'CONNECTION', 'MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'],
          subscribe: [
            'MESSAGE',
            'QRCODE',
            'CONNECTION',
            'MESSAGES_UPSERT',
            'CONNECTION_UPDATE',
            'QRCODE_UPDATED',
          ],
        },
        {
          headers: { apikey: instanceName },
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
