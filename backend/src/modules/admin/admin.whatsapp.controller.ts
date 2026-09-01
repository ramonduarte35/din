import { FastifyRequest, FastifyReply } from 'fastify';
import { adminWhatsAppService } from './admin.whatsapp.service.js';
import {
  createInstanceSchema,
  updateInstanceSchema,
  logsQuerySchema,
} from './admin.whatsapp.schemas.js';

export class AdminWhatsAppController {
  async listInstances(request: FastifyRequest, reply: FastifyReply) {
    const instances = await adminWhatsAppService.listInstances();
    return reply.status(200).send({ instances });
  }

  async createInstance(request: FastifyRequest, reply: FastifyReply) {
    const parsed = createInstanceSchema.parse(request.body);
    const instance = await adminWhatsAppService.createInstance(parsed);
    return reply.status(201).send({ message: 'Instância criada com sucesso!', instance });
  }

  async getQrCode(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const qrData = await adminWhatsAppService.getQrCode(id);
    return reply.status(200).send(qrData);
  }

  async getInstanceStatus(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const statusData = await adminWhatsAppService.getInstanceStatus(id);
    return reply.status(200).send(statusData);
  }

  async restartInstance(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const result = await adminWhatsAppService.restartInstance(id);
    return reply.status(200).send(result);
  }

  async logoutInstance(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const result = await adminWhatsAppService.logoutInstance(id);
    return reply.status(200).send(result);
  }

  async updateInstance(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const parsed = updateInstanceSchema.parse(request.body);
    const updated = await adminWhatsAppService.updateInstance(id, parsed);
    return reply.status(200).send({ message: 'Instância atualizada com sucesso!', instance: updated });
  }

  async deleteInstance(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const result = await adminWhatsAppService.deleteInstance(id);
    return reply.status(200).send(result);
  }

  async getLogs(request: FastifyRequest, reply: FastifyReply) {
    const parsed = logsQuerySchema.parse(request.query);
    const logs = await adminWhatsAppService.getLogs(parsed);
    return reply.status(200).send(logs);
  }
}

export const adminWhatsAppController = new AdminWhatsAppController();
