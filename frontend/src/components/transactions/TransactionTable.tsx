import React from 'react';
import { Transaction } from '../../api/transactions';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TableSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatDate } from '../../lib/utils';
import {
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  Landmark,
} from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onNewTransaction?: () => void;
}

export function TransactionTable({
  transactions,
  isLoading,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onNewTransaction,
}: TransactionTableProps) {
  const { maskValue } = usePrivacy();

  if (isLoading) {
    return <TableSkeleton rows={6} />;
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptText className="w-8 h-8" />}
        title="Nenhum lançamento encontrado"
        description="Não encontramos nenhuma transação com os filtros selecionados. Tente ajustar os filtros ou registrar um novo lançamento."
        actionText={onNewTransaction ? "Nova Transação" : undefined}
        onAction={onNewTransaction}
        variant="slate"
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Visualização em Tabela (Desktop / Tablet) */}
      <div className="hidden md:block overflow-x-auto rounded-3xl border border-border bg-card backdrop-blur-md shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-card-secondary text-din-muted font-bold uppercase tracking-wider border-b border-border">
            <tr>
              <th className="py-4 px-4">Tipo & Data</th>
              <th className="py-4 px-4">Descrição</th>
              <th className="py-4 px-4">Conta Bancária</th>
              <th className="py-4 px-4">Categoria</th>
              <th className="py-4 px-4">Origem</th>
              <th className="py-4 px-4 text-right">Valor</th>
              <th className="py-4 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              const isWhatsApp = tx.origin.startsWith('WHATSAPP');

              return (
                <tr key={tx.id} className="hover:bg-card-hover transition-colors group">
                  {/* Tipo & Data */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-xl ${
                          isIncome
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}
                      >
                        {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="font-semibold text-din-text block">{formatDate(tx.date)}</span>
                        <span className="text-[10px] text-din-muted font-mono">
                          {new Date(tx.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Descrição */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-din-text block group-hover:text-din-primary transition-colors">
                      {tx.description}
                    </span>
                    {tx.raw_text && (
                      <span className="text-[10px] text-din-muted flex items-center gap-1 mt-0.5 max-w-xs truncate">
                        <MessageSquare className="w-2.5 h-2.5 flex-shrink-0 text-din-muted" />
                        "{tx.raw_text}"
                      </span>
                    )}
                  </td>

                  {/* Conta Bancária */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {tx.account ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-sm"
                        style={{
                          color: tx.account.color || '#10b981',
                          backgroundColor: `${tx.account.color || '#10b981'}15`,
                          borderColor: `${tx.account.color || '#10b981'}30`,
                        }}
                      >
                        <Landmark className="w-3 h-3" />
                        {tx.account.name}
                      </span>
                    ) : (
                      <span className="text-din-muted text-xs italic">Sem conta vinculada</span>
                    )}
                  </td>

                  {/* Categoria */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {tx.category ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-sm"
                        style={{
                          color: tx.category.color,
                          backgroundColor: `${tx.category.color}15`,
                          borderColor: `${tx.category.color}30`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: tx.category.color }}
                        />
                        {tx.category.name}
                      </span>
                    ) : (
                      <span className="text-din-muted text-xs italic">Sem categoria</span>
                    )}
                  </td>

                  {/* Origem */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isWhatsApp ? (
                      <Badge variant="whatsapp" className="text-[10px] py-0.5 px-2">
                        WhatsApp IA
                      </Badge>
                    ) : (
                      <Badge variant="manual" className="text-[10px] py-0.5 px-2">
                        Manual
                      </Badge>
                    )}
                  </td>

                  {/* Valor */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span
                      className={`text-sm font-bold font-mono tracking-tight ${
                        isIncome ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {isIncome ? '+ ' : '- '}
                      {maskValue(tx.amount)}
                    </span>
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1.5 rounded-lg text-din-muted hover:text-din-text hover:bg-card-hover transition-colors"
                        title="Editar lançamento"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(tx.id)}
                        className="p-1.5 rounded-lg text-din-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Excluir lançamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Visualização em Cards (Mobile First) */}
      <div className="md:hidden space-y-3">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'INCOME';
          const isWhatsApp = tx.origin.startsWith('WHATSAPP');

          return (
            <div
              key={tx.id}
              className="p-4 rounded-3xl bg-card border border-border shadow-lg space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl flex-shrink-0 ${
                      isIncome
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}
                  >
                    {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-din-text">{tx.description}</h4>
                    <span className="text-[11px] text-din-muted font-medium">
                      {formatDate(tx.date)}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-base font-bold font-mono tracking-tight shrink-0 ${
                    isIncome ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {isIncome ? '+ ' : '- '}
                  {maskValue(tx.amount)}
                </span>
              </div>

              {tx.raw_text && (
                <p className="text-[11px] text-din-muted bg-card-secondary p-2 rounded-xl border border-border flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-din-muted shrink-0" />
                  <span className="truncate">"{tx.raw_text}"</span>
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                {tx.account && (
                  <span
                    className="px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1"
                    style={{
                      color: tx.account.color || '#10b981',
                      backgroundColor: `${tx.account.color || '#10b981'}15`,
                      borderColor: `${tx.account.color || '#10b981'}30`,
                    }}
                  >
                    <Landmark className="w-3 h-3" />
                    {tx.account.name}
                  </span>
                )}

                {tx.category && (
                  <span
                    className="px-2.5 py-0.5 rounded-full font-semibold border"
                    style={{
                      color: tx.category.color,
                      backgroundColor: `${tx.category.color}15`,
                      borderColor: `${tx.category.color}30`,
                    }}
                  >
                    {tx.category.name}
                  </span>
                )}

                {isWhatsApp ? (
                  <Badge variant="whatsapp" className="text-[10px] py-0 px-2">
                    WhatsApp IA
                  </Badge>
                ) : (
                  <Badge variant="manual" className="text-[10px] py-0 px-2">
                    Manual
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => onEdit(tx)}
                  className="p-2 text-din-muted hover:text-din-primary min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-card-hover transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(tx.id)}
                  className="p-2 text-din-muted hover:text-rose-500 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-rose-500/10 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pt-2 text-xs text-din-muted">
          <p>
            Página <span className="font-bold text-din-text">{pagination.page}</span> de{' '}
            <span className="font-bold text-din-text">{pagination.totalPages}</span> ({pagination.total}{' '}
            lançamentos)
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="h-10 px-4 min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4 mr-0.5" />
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="h-10 px-4 min-h-[44px]"
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
