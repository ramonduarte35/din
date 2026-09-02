import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import { evolutionClient } from '../webhooks/evolution.client.js';
import { normalizePhoneNumber } from '../../utils/phone.js';
import { CreateInstanceInput, UpdateInstanceInput, LogsQueryInput } from './admin.whatsapp.schemas.js';

export class AdminWhatsAppService {
  async listInstances() {
    const dbNumbers = await prisma.systemWhatsAppNumber.findMany({
      orderBy: { created_at: 'desc' },
    });

    // Enriquecer cada registro com o status de conexão em tempo real do Evolution Go
    const enriched = await Promise.all(
      dbNumbers.map(async (item) => {
        try {
          const stateRes = await evolutionClient.getConnectionState(item.instance_name);
          return {
            ...item,
            connection_status: stateRes.state, // 'open' | 'close' | 'connecting'
            is_connected: stateRes.state === 'open',
          };
        } catch (error) {
          return {
            ...item,
            connection_status: 'close',
            is_connected: false,
          };
        }
      })
    );

    return enriched;
  }

  async createInstance(data: CreateInstanceInput) {
    const normalizedPhone = normalizePhoneNumber(data.phone_number);

    const existing = await prisma.systemWhatsAppNumber.findUnique({
      where: { instance_name: data.instance_name },
    });

    if (existing) {
      throw { statusCode: 409, message: `Uma instância com o nome "${data.instance_name}" já existe.` };
    }

    // 1. Criar no gateway Evolution Go
    try {
      await evolutionClient.createInstance(data.instance_name);
    } catch (err: any) {
      console.warn(`[Admin] Aviso ao criar instância no Evolution Go (pode já existir no gateway):`, err?.message);
    }

    // 2. Configurar o Webhook
    try {
      const webhookUrl = 'http://api:3000/api/v1/webhooks/evolution';
      await evolutionClient.setWebhook(data.instance_name, webhookUrl);
    } catch (err: any) {
      console.warn(`[Admin] Aviso ao configurar webhook:`, err?.message);
    }

    // 3. Salvar no banco de dados local
    const newNumber = await prisma.systemWhatsAppNumber.create({
      data: {
        instance_name: data.instance_name,
        phone_number: normalizedPhone,
        label: data.label,
        is_active: data.is_active ?? true,
      },
    });

    return newNumber;
  }

  async getQrCode(id: string) {
    const instance = await prisma.systemWhatsAppNumber.findUnique({
      where: { id },
    });

    if (!instance) {
      throw { statusCode: 404, message: 'Instância não encontrada.' };
    }

    try {
      let connectData: any = null;
      try {
        connectData = await evolutionClient.connectInstance(instance.instance_name);
      } catch (connErr: any) {
        // Se a instância não existe ainda no gateway, cria agora
        const createRes = await evolutionClient.createInstance(instance.instance_name);
        connectData = createRes?.qrcode || createRes;
      }

      if (!connectData || (!connectData.base64 && !connectData.code && !connectData.qrcode)) {
        try {
          const createRes = await evolutionClient.createInstance(instance.instance_name);
          connectData = createRes?.qrcode || createRes;
        } catch (createErr) {
          // pode já existir
        }
      }

      let base64 = connectData?.base64 || connectData?.qrcode?.base64 || connectData?.code;
      const pairingCode = connectData?.pairingCode || connectData?.pairing_code;
      const count = connectData?.count;

      // Se não veio no retorno imediato, verifica no Redis se o webhook recebeu o evento qrcode.updated
      if (!base64) {
        base64 = await redis.get(`qrcode:${instance.instance_name}`);
      }

      // Se ainda não, aguarda 1 segundo e tenta no Redis novamente
      if (!base64) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        base64 = await redis.get(`qrcode:${instance.instance_name}`);
      }

      return {
        instance_name: instance.instance_name,
        base64: base64 || null,
        code: connectData?.code || null,
        pairingCode: pairingCode || null,
        count: count || 0,
      };
    } catch (error: any) {
      console.error(`[Admin] Erro ao obter QR Code para "${instance.instance_name}":`, error?.message);
      if (
        error?.response?.data?.code === 'LICENSE_REQUIRED' ||
        error?.response?.data?.error === 'service not activated'
      ) {
        throw {
          statusCode: 402,
          message:
            'A licença do Evolution Go ainda não foi ativada. Acesse http://<ip-do-servidor>:4000/manager para ativar a licença gratuita em 1 clique.',
        };
      }
      throw { statusCode: 502, message: 'Não foi possível gerar o QR Code no gateway Evolution Go.' };
    }
  }

  async getInstanceStatus(id: string) {
    const instance = await prisma.systemWhatsAppNumber.findUnique({
      where: { id },
    });

    if (!instance) {
      throw { statusCode: 404, message: 'Instância não encontrada.' };
    }

    const stateRes = await evolutionClient.getConnectionState(instance.instance_name);
    return {
      id: instance.id,
      instance_name: instance.instance_name,
      connection_status: stateRes.state,
      is_connected: stateRes.state === 'open',
    };
  }

  async restartInstance(id: string) {
    const instance = await prisma.systemWhatsAppNumber.findUnique({
      where: { id },
    });

    if (!instance) {
      throw { statusCode: 404, message: 'Instância não encontrada.' };
    }

    await evolutionClient.restartInstance(instance.instance_name);
    return { message: `Instância "${instance.instance_name}" reiniciada com sucesso.` };
  }

  async logoutInstance(id: string) {
    const instance = await prisma.systemWhatsAppNumber.findUnique({
      where: { id },
    });

    if (!instance) {
      throw { statusCode: 404, message: 'Instância não encontrada.' };
    }

    await evolutionClient.logoutInstance(instance.instance_name);
    return { message: `Sessão do WhatsApp deslogada com sucesso para "${instance.instance_name}".` };
  }

  async updateInstance(id: string, data: UpdateInstanceInput) {
    const instance = await prisma.systemWhatsAppNumber.findUnique({
      where: { id },
    });

    if (!instance) {
      throw { statusCode: 404, message: 'Instância não encontrada.' };
    }

    let normalizedPhone = undefined;
    if (data.phone_number) {
      normalizedPhone = normalizePhoneNumber(data.phone_number);
    }

    const updated = await prisma.systemWhatsAppNumber.update({
      where: { id },
      data: {
        label: data.label,
        phone_number: normalizedPhone,
        is_active: data.is_active,
      },
    });

    return updated;
  }

  async deleteInstance(id: string) {
    const instance = await prisma.systemWhatsAppNumber.findUnique({
      where: { id },
    });

    if (!instance) {
      throw { statusCode: 404, message: 'Instância não encontrada.' };
    }

    try {
      await evolutionClient.deleteInstance(instance.instance_name);
    } catch (err: any) {
      console.warn(`[Admin] Aviso ao remover instância do Evolution Go:`, err?.message);
    }

    await prisma.systemWhatsAppNumber.delete({
      where: { id },
    });

    return { message: `Instância "${instance.instance_name}" removida com sucesso.` };
  }

  async getLogs(query: LogsQueryInput) {
    const { page, limit, status, sender } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (sender) {
      where.sender_number = { contains: sender.replace(/\D/g, '') };
    }

    const [total, logs] = await Promise.all([
      prisma.whatsAppLog.count({ where }),
      prisma.whatsAppLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEvolutionStatus() {
    return await evolutionClient.testConnection();
  }

  async getEvolutionLicense() {
    const [statusRes, registerRes] = await Promise.all([
      evolutionClient.getLicenseStatus(),
      evolutionClient.getLicenseRegisterUrl(),
    ]);

    return {
      status: statusRes.status,
      instance_id: statusRes.instance_id || registerRes.instance_id,
      register_url: registerRes.register_url,
    };
  }

  async testEvolutionConnection() {
    return await evolutionClient.testConnection();
  }
}

export const adminWhatsAppService = new AdminWhatsAppService();

