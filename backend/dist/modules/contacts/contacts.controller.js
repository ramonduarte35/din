"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsController = void 0;
const contacts_service_js_1 = require("./contacts.service.js");
const contacts_schemas_js_1 = require("./contacts.schemas.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const contactsService = new contacts_service_js_1.ContactsService();
class ContactsController {
    async create(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const data = contacts_schemas_js_1.createContactSchema.parse(request.body);
            const contact = await contactsService.createContact(userId, data);
            return reply.status(201).send(contact);
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({ message: error.errors[0]?.message || 'Dados inválidos' });
            }
            return reply.status(400).send({ message: error.message || 'Erro ao criar contato' });
        }
    }
    async list(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const query = contacts_schemas_js_1.listContactsQuerySchema.parse(request.query);
            const result = await contactsService.listContacts(userId, query);
            return reply.send(result);
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({ message: error.errors[0]?.message || 'Parâmetros inválidos' });
            }
            return reply.status(500).send({ message: 'Erro ao listar contatos' });
        }
    }
    async getById(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const { id } = request.params;
            const contact = await contactsService.getContactById(userId, id);
            return reply.send(contact);
        }
        catch (error) {
            return reply.status(404).send({ message: error.message || 'Contato não encontrado' });
        }
    }
    async update(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const { id } = request.params;
            const data = contacts_schemas_js_1.updateContactSchema.parse(request.body);
            const updated = await contactsService.updateContact(userId, id, data);
            return reply.send(updated);
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({ message: error.errors[0]?.message || 'Dados inválidos' });
            }
            return reply.status(400).send({ message: error.message || 'Erro ao atualizar contato' });
        }
    }
    async delete(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const { id } = request.params;
            const result = await contactsService.deleteContact(userId, id);
            return reply.send(result);
        }
        catch (error) {
            return reply.status(400).send({ message: error.message || 'Erro ao excluir contato' });
        }
    }
}
exports.ContactsController = ContactsController;
