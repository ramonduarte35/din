import React, { useState, useEffect } from 'react';
import { Contact, ContactType, createContact, updateContact } from '../../api/contacts';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AlertCircle, User, Building2 } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contact?: Contact | null;
}

// Máscara CPF: 000.000.000-00
function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// Máscara CNPJ: 00.000.000/0000-00
function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

// Máscara telefone: (00) 00000-0000
function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSuccess, contact }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<ContactType>('PF');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!contact;

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (contact) {
        setName(contact.name);
        setType(contact.type);
        setDocument(contact.document || '');
        setEmail(contact.email || '');
        setPhone(contact.phone || '');
        setNotes(contact.notes || '');
      } else {
        setName('');
        setType('PF');
        setDocument('');
        setEmail('');
        setPhone('');
        setNotes('');
      }
    }
  }, [isOpen, contact]);

  function handleDocumentChange(value: string) {
    const masked = type === 'PF' ? maskCPF(value) : maskCNPJ(value);
    setDocument(masked);
  }

  function handlePhoneChange(value: string) {
    setPhone(maskPhone(value));
  }

  function handleTypeChange(newType: ContactType) {
    setType(newType);
    setDocument(''); // Limpa documento ao trocar tipo
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        type,
        document: document.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        notes: notes.trim() || null,
      };

      if (isEditing && contact) {
        await updateContact(contact.id, payload);
      } else {
        await createContact(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao salvar contato');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Contato' : 'Novo Contato'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tipo PF / PJ */}
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">Tipo de Contato</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange('PF')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                type === 'PF'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-border/40 bg-card/50 text-foreground/60 hover:border-border'
              }`}
            >
              <User className="w-4 h-4" />
              Pessoa Física
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('PJ')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                type === 'PJ'
                  ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                  : 'border-border/40 bg-card/50 text-foreground/60 hover:border-border'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Pessoa Jurídica
            </button>
          </div>
        </div>

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1.5">
            {type === 'PF' ? 'Nome Completo' : 'Razão Social / Nome Fantasia'}
            <span className="text-red-400 ml-0.5">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === 'PF' ? 'Ex: João da Silva' : 'Ex: Empresa ABC Ltda'}
            required
          />
        </div>

        {/* Documento CPF / CNPJ */}
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1.5">
            {type === 'PF' ? 'CPF' : 'CNPJ'}
          </label>
          <Input
            value={document}
            onChange={(e) => handleDocumentChange(e.target.value)}
            placeholder={type === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
            inputMode="numeric"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1.5">E-mail</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
          />
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1.5">Telefone / WhatsApp</label>
          <Input
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(00) 00000-0000"
            inputMode="numeric"
          />
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1.5">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Informações adicionais sobre o contato..."
            rows={3}
            className="w-full bg-background border border-border/40 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all resize-none"
          />
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1" disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Contato'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
