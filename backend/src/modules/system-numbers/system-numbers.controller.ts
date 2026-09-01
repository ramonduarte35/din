import { FastifyRequest, FastifyReply } from 'fastify';
import { SystemNumbersService } from './system-numbers.service.js';

const systemNumbersService = new SystemNumbersService();

export class SystemNumbersController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const numbers = await systemNumbersService.listActiveNumbers();
    return reply.send({ system_numbers: numbers });
  }
}
