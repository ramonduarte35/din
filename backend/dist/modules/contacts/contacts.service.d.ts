import { Prisma } from '@prisma/client';
import { CreateContactInput, UpdateContactInput, ListContactsQueryInput } from './contacts.schemas.js';
export declare class ContactsService {
    /**
     * Criar novo contato
     */
    createContact(userId: string, data: CreateContactInput): Promise<{
        _count: {
            bills: number;
            receivables: number;
        };
    } & {
        type: import("@prisma/client").$Enums.ContactType;
        name: string;
        id: string;
        email: string | null;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        notes: string | null;
        document: string | null;
        phone: string | null;
    }>;
    /**
     * Listar contatos com filtros e paginação
     */
    listContacts(userId: string, query: ListContactsQueryInput): Promise<{
        contacts: ({
            _count: {
                bills: number;
                receivables: number;
            };
        } & {
            type: import("@prisma/client").$Enums.ContactType;
            name: string;
            id: string;
            email: string | null;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            notes: string | null;
            document: string | null;
            phone: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Obter contato por ID
     */
    getContactById(userId: string, id: string): Promise<{
        bills: {
            status: import("@prisma/client").$Enums.BillStatus;
            id: string;
            description: string;
            amount: Prisma.Decimal;
            due_date: Date;
        }[];
        receivables: {
            status: import("@prisma/client").$Enums.ReceivableStatus;
            id: string;
            description: string;
            amount: Prisma.Decimal;
            due_date: Date;
        }[];
        _count: {
            bills: number;
            receivables: number;
        };
    } & {
        type: import("@prisma/client").$Enums.ContactType;
        name: string;
        id: string;
        email: string | null;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        notes: string | null;
        document: string | null;
        phone: string | null;
    }>;
    /**
     * Atualizar contato
     */
    updateContact(userId: string, id: string, data: UpdateContactInput): Promise<{
        _count: {
            bills: number;
            receivables: number;
        };
    } & {
        type: import("@prisma/client").$Enums.ContactType;
        name: string;
        id: string;
        email: string | null;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        notes: string | null;
        document: string | null;
        phone: string | null;
    }>;
    /**
     * Excluir contato (desvincula receivables e bills, não os exclui)
     */
    deleteContact(userId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
