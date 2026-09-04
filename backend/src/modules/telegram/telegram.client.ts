import axios from 'axios';
import { prisma } from '../../lib/prisma.js';

export interface TelegramBotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
}

export interface TelegramWebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  last_error_date?: number;
  last_error_message?: string;
  max_connections?: number;
  ip_address?: string;
}

export interface TelegramStatusResponse {
  success: boolean;
  bot?: TelegramBotInfo;
  webhook?: TelegramWebhookInfo;
  is_active?: boolean;
  error?: string;
}

export class TelegramClient {
  private readonly baseUrl = 'https://api.telegram.org';

  /**
   * Obtém a configuração de integração salva no banco de dados
   */
  async getConfig() {
    const config = await prisma.whatsAppIntegrationConfig.findFirst({
      orderBy: { created_at: 'desc' },
    });
    return config;
  }

  /**
   * Obtém o token configurado (do banco ou passado explicitamente)
   */
  async getEffectiveToken(token?: string): Promise<string | null> {
    if (token && token.trim()) {
      return token.trim();
    }
    const config = await this.getConfig();
    return config?.telegram_bot_token?.trim() || null;
  }

  /**
   * Testa a validade do token e obtém os dados do bot (getMe)
   */
  async getMe(token?: string): Promise<{ success: boolean; bot?: TelegramBotInfo; error?: string }> {
    try {
      const effectiveToken = await this.getEffectiveToken(token);
      if (!effectiveToken) {
        return { success: false, error: 'Token do Telegram Bot não informado ou não configurado.' };
      }

      const url = `${this.baseUrl}/bot${effectiveToken}/getMe`;
      const response = await axios.get(url, { timeout: 10000 });

      if (response.data?.ok && response.data?.result) {
        return { success: true, bot: response.data.result };
      }

      return { success: false, error: response.data?.description || 'Falha ao validar bot do Telegram.' };
    } catch (err: any) {
      console.error('❌ [Telegram Client] Erro no getMe:', err.response?.data || err.message);
      return {
        success: false,
        error: err.response?.data?.description || err.message || 'Erro ao conectar aos servidores do Telegram.',
      };
    }
  }

  /**
   * Obtém as informações do webhook configurado no Telegram (getWebhookInfo)
   */
  async getWebhookInfo(token?: string): Promise<{ success: boolean; webhook?: TelegramWebhookInfo; error?: string }> {
    try {
      const effectiveToken = await this.getEffectiveToken(token);
      if (!effectiveToken) {
        return { success: false, error: 'Token do Telegram Bot não configurado.' };
      }

      const url = `${this.baseUrl}/bot${effectiveToken}/getWebhookInfo`;
      const response = await axios.get(url, { timeout: 10000 });

      if (response.data?.ok && response.data?.result) {
        return { success: true, webhook: response.data.result };
      }

      return { success: false, error: response.data?.description || 'Falha ao buscar webhook do Telegram.' };
    } catch (err: any) {
      console.error('❌ [Telegram Client] Erro no getWebhookInfo:', err.response?.data || err.message);
      return {
        success: false,
        error: err.response?.data?.description || err.message || 'Erro ao buscar status do webhook.',
      };
    }
  }

  /**
   * Registra ou atualiza o webhook do Telegram (setWebhook)
   */
  async setWebhook(
    webhookUrl: string,
    secretToken?: string,
    token?: string
  ): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const effectiveToken = await this.getEffectiveToken(token);
      if (!effectiveToken) {
        return { success: false, message: 'Token não configurado', error: 'Token do Telegram Bot não configurado.' };
      }

      const url = `${this.baseUrl}/bot${effectiveToken}/setWebhook`;
      const payload: any = {
        url: webhookUrl,
        allowed_updates: ['message', 'edited_message', 'callback_query'],
        drop_pending_updates: false,
      };

      if (secretToken) {
        payload.secret_token = secretToken;
      }

      console.log(`📤 [Telegram Client] Configurando Webhook para "${webhookUrl}"...`);
      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });

      if (response.data?.ok) {
        console.log(`✅ [Telegram Client] Webhook configurado com sucesso no Telegram:`, response.data);
        return { success: true, message: response.data.description || 'Webhook configurado com sucesso!' };
      }

      return {
        success: false,
        message: 'Falha ao configurar webhook',
        error: response.data?.description || 'Erro desconhecido do Telegram.',
      };
    } catch (err: any) {
      console.error('❌ [Telegram Client] Erro no setWebhook:', err.response?.data || err.message);
      return {
        success: false,
        message: 'Erro na requisição',
        error: err.response?.data?.description || err.message || 'Falha ao registrar webhook.',
      };
    }
  }

  /**
   * Remove o webhook configurado (deleteWebhook)
   */
  async deleteWebhook(token?: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const effectiveToken = await this.getEffectiveToken(token);
      if (!effectiveToken) {
        return { success: false, message: 'Token não configurado', error: 'Token não configurado.' };
      }

      const url = `${this.baseUrl}/bot${effectiveToken}/deleteWebhook`;
      const response = await axios.post(url, {}, { timeout: 10000 });

      if (response.data?.ok) {
        return { success: true, message: 'Webhook removido com sucesso.' };
      }
      return { success: false, message: 'Falha ao remover webhook', error: response.data?.description };
    } catch (err: any) {
      return { success: false, message: 'Erro ao remover webhook', error: err.message };
    }
  }

  /**
   * Envia uma mensagem para o chat do Telegram
   */
  async sendMessage(
    chatId: string | number,
    text: string,
    options?: {
      reply_markup?: any;
      parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      token?: string;
    }
  ): Promise<boolean> {
    try {
      const effectiveToken = await this.getEffectiveToken(options?.token);
      if (!effectiveToken) {
        console.warn('⚠️ [Telegram Client] Impossível enviar mensagem: Token do Telegram ausente.');
        return false;
      }

      const url = `${this.baseUrl}/bot${effectiveToken}/sendMessage`;
      const payload: any = {
        chat_id: chatId,
        text,
      };

      if (options?.parse_mode) {
        payload.parse_mode = options.parse_mode;
      }

      if (options?.reply_markup) {
        payload.reply_markup = options.reply_markup;
      }

      console.log(`📤 [Telegram Client] Enviando mensagem para ChatID "${chatId}"...`);
      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });

      if (response.data?.ok) {
        console.log(`✅ [Telegram Client] Mensagem enviada com sucesso para ${chatId}`);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('❌ [Telegram Client] Erro ao enviar mensagem:', err.response?.data || err.message);
      return false;
    }
  }

  /**
   * Baixa arquivo de áudio / voz do Telegram para transcrição
   */
  async downloadVoiceAudio(
    fileId: string,
    token?: string
  ): Promise<{ buffer: Buffer; mimeType: string } | null> {
    try {
      const effectiveToken = await this.getEffectiveToken(token);
      if (!effectiveToken) {
        console.error('❌ [Telegram Client] Token não configurado para download de mídia.');
        return null;
      }

      // Passo 1: Obter caminho do arquivo via getFile
      const getFileUrl = `${this.baseUrl}/bot${effectiveToken}/getFile?file_id=${fileId}`;
      const getFileRes = await axios.get(getFileUrl, { timeout: 10000 });

      if (!getFileRes.data?.ok || !getFileRes.data?.result?.file_path) {
        console.error('❌ [Telegram Client] Não foi possível obter caminho do arquivo de áudio:', getFileRes.data);
        return null;
      }

      const filePath = getFileRes.data.result.file_path;
      const downloadUrl = `${this.baseUrl}/file/bot${effectiveToken}/${filePath}`;

      console.log(`📥 [Telegram Client] Baixando arquivo de áudio do Telegram: ${filePath}`);
      const downloadRes = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      const buffer = Buffer.from(downloadRes.data);
      let mimeType = 'audio/ogg';
      if (filePath.endsWith('.mp3')) mimeType = 'audio/mp3';
      else if (filePath.endsWith('.m4a')) mimeType = 'audio/m4a';
      else if (filePath.endsWith('.wav')) mimeType = 'audio/wav';

      return { buffer, mimeType };
    } catch (err: any) {
      console.error('❌ [Telegram Client] Erro ao baixar áudio do Telegram:', err.response?.data || err.message);
      return null;
    }
  }
}

export const telegramClient = new TelegramClient();
