import { FastifyRequest, FastifyReply } from 'fastify';
import { ContactsService } from './contacts.service.js';
import { createContactSchema, updateContactSchema, listContactsQuerySchema } from './contacts.schemas.js';
import { getUserId } from '../../middleware/auth.middleware.js';

const contactsService = new ContactsService();

export class ContactsController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const data = createContactSchema.parse(request.body);
      const contact = await contactsService.createContact(userId, data);
      return reply.status(201).send(contact);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ message: error.errors[0]?.message || 'Dados inválidos' });
      }
      return reply.status(400).send({ message: error.message || 'Erro ao criar contato' });
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const query = listContactsQuerySchema.parse(request.query);
      const result = await contactsService.listContacts(userId, query);
      return reply.send(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ message: error.errors[0]?.message || 'Parâmetros inválidos' });
      }
      return reply.status(500).send({ message: 'Erro ao listar contatos' });
    }
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const { id } = request.params;
      const contact = await contactsService.getContactById(userId, id);
      return reply.send(contact);
    } catch (error: any) {
      return reply.status(404).send({ message: error.message || 'Contato não encontrado' });
    }
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const { id } = request.params;
      const data = updateContactSchema.parse(request.body);
      const updated = await contactsService.updateContact(userId, id, data);
      return reply.send(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ message: error.errors[0]?.message || 'Dados inválidos' });
      }
      return reply.status(400).send({ message: error.message || 'Erro ao atualizar contato' });
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const { id } = request.params;
      const result = await contactsService.deleteContact(userId, id);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || 'Erro ao excluir contato' });
    }
  }
}
