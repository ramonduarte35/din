import React, { useState, useEffect, useCallback } from 'react';
import { Contact, fetchContacts, deleteContact, ContactType } from '../api/contacts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { ContactModal } from '../components/contacts/ContactModal';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  Building2,
  Mail,
  Phone,
  FileText,
  TrendingUp,
  ReceiptText,
  X,
  ContactRound,
} from 'lucide-react';

const TYPE_LABELS: Record<ContactType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PF: {
    label: 'Pessoa Física',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    icon: <User className="w-3 h-3" />,
  },
  PJ: {
    label: 'Pessoa Jurídica',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
    icon: <Building2 className="w-3 h-3" />,
  },
};

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<ContactType | 'ALL'>('ALL');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const confirm = useConfirm();
  const toast = useToast();

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page: pagination.page, limit: 50 };
      if (search.trim()) params.search = search.trim();
      if (filterType !== 'ALL') params.type = filterType;
      const result = await fetchContacts(params);
      setContacts(result.contacts);
      setPagination((p) => ({ ...p, total: result.pagination.total, totalPages: result.pagination.totalPages }));
    } catch {
      toast.error('Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  }, [search, filterType, pagination.page]);

  useEffect(() => {
    const timer = setTimeout(() => loadContacts(), search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [search, filterType, pagination.page]);

  function handleNewContact() {
    setSelectedContact(null);
    setIsModalOpen(true);
  }

  function handleEditContact(contact: Contact) {
    setSelectedContact(contact);
    setIsModalOpen(true);
  }

  async function handleDeleteContact(contact: Contact) {
    const receivablesCount = contact._count?.receivables ?? 0;
    const billsCount = contact._count?.bills ?? 0;
    const totalLinked = receivablesCount + billsCount;
    const extraMsg = totalLinked > 0
      ? ` Este contato possui ${receivablesCount > 0 ? `${receivablesCount} conta(s) a receber` : ''}${receivablesCount > 0 && billsCount > 0 ? ' e ' : ''}${billsCount > 0 ? `${billsCount} conta(s) a pagar` : ''} vinculada(s), que serão desvinculadas mas não excluídas.`
      : '';

    const confirmed = await confirm({
      title: 'Excluir Contato',
      message: `Tem certeza que deseja excluir "${contact.name}"?${extraMsg}`,
      confirmText: 'Excluir',
    });
    if (!confirmed) return;

    try {
      await deleteContact(contact.id);
      toast.success('Contato excluído com sucesso!');
      loadContacts();
    } catch {
      toast.error('Erro ao excluir contato');
    }
  }

  function handleSuccess() {
    loadContacts();
  }

  const filteredContacts = contacts;
  const pfCount = contacts.filter((c) => c.type === 'PF').length;
  const pjCount = contacts.filter((c) => c.type === 'PJ').length;

  return (
    <div className="space-y-5 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ContactRound className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Contatos</h1>
            <p className="text-xs text-foreground/50">
              {pagination.total} contato{pagination.total !== 1 ? 's' : ''} cadastrado{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button
          onClick={handleNewContact}
          className="flex items-center gap-2 w-full sm:w-auto justify-center min-h-[44px] bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          Novo Contato
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{pagination.total}</div>
          <div className="text-xs text-foreground/50 mt-0.5 flex items-center justify-center gap-1">
            <Users className="w-3 h-3" /> Total
          </div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{pfCount}</div>
          <div className="text-xs text-foreground/50 mt-0.5 flex items-center justify-center gap-1">
            <User className="w-3 h-3" /> Pessoa Física
          </div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-violet-400">{pjCount}</div>
          <div className="text-xs text-foreground/50 mt-0.5 flex items-center justify-center gap-1">
            <Building2 className="w-3 h-3" /> Pessoa Jurídica
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou documento..."
            className="pl-9 min-h-[44px]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {(['ALL', 'PF', 'PJ'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all min-h-[44px] ${
                filterType === t
                  ? t === 'PF'
                    ? 'bg-blue-500/15 border-blue-500 text-blue-400'
                    : t === 'PJ'
                    ? 'bg-violet-500/15 border-violet-500 text-violet-400'
                    : 'bg-foreground/10 border-foreground/30 text-foreground'
                  : 'bg-card border-border/40 text-foreground/60 hover:border-border'
              }`}
            >
              {t === 'ALL' ? 'Todos' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-card/60 animate-pulse" />
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        <EmptyState
          icon={<ContactRound className="w-12 h-12 text-foreground/20" />}
          title={search || filterType !== 'ALL' ? 'Nenhum contato encontrado' : 'Nenhum contato cadastrado'}
          description={
            search || filterType !== 'ALL'
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece cadastrando quem vai te pagar — clientes, empresas ou pessoas físicas.'
          }
          actionText={!search && filterType === 'ALL' ? 'Cadastrar Primeiro Contato' : undefined}
          onAction={!search && filterType === 'ALL' ? handleNewContact : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filteredContacts.map((contact) => {
            const typeInfo = TYPE_LABELS[contact.type];
            return (
              <Card
                key={contact.id}
                className="p-4 hover:border-cyan-500/30 transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${typeInfo.bg}`}
                  >
                    <span className={`${typeInfo.color}`}>
                      {contact.type === 'PF' ? <User className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground text-base truncate">{contact.name}</h3>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeInfo.bg} ${typeInfo.color}`}
                      >
                        {typeInfo.icon}
                        {contact.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                      {contact.document && (
                        <span className="text-xs text-foreground/50 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {contact.document}
                        </span>
                      )}
                      {contact.email && (
                        <span className="text-xs text-foreground/50 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {contact.email}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="text-xs text-foreground/50 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {contact.phone}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(contact._count?.receivables ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full font-medium">
                          <TrendingUp className="w-3 h-3" />
                          {contact._count!.receivables} a receber
                        </span>
                      )}
                      {(contact._count?.bills ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                          <ReceiptText className="w-3 h-3" />
                          {contact._count!.bills} a pagar
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditContact(contact)}
                      className="p-2 rounded-xl hover:bg-card-hover transition-colors text-foreground/60 hover:text-blue-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact)}
                      className="p-2 rounded-xl hover:bg-red-500/10 transition-colors text-foreground/60 hover:text-red-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
            disabled={pagination.page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-foreground/50">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="ghost"
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
          >
            Próximo
          </Button>
        </div>
      )}

      {/* Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        contact={selectedContact}
      />
    </div>
  );
};
