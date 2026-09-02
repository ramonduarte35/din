import React from 'react';
import { Transaction } from '../../api/transactions';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../lib/utils';
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
}

export function TransactionTable({
  transactions,
  isLoading,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 p-8">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <ReceiptText className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-200">Nenhuma transação encontrada</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
          Não encontramos nenhum lançamento com os filtros selecionados. Tente ajustar a busca ou adicionar um novo lançamento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Visualização em Tabela (Desktop) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Tipo & Data</th>
              <th className="py-3.5 px-4">Descrição</th>
              <th className="py-3.5 px-4">Conta Bancária</th>
              <th className="py-3.5 px-4">Categoria</th>
              <th className="py-3.5 px-4">Origem</th>
              <th className="py-3.5 px-4 text-right">Valor</th>
              <th className="py-3.5 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              const isWhatsApp = tx.origin.startsWith('WHATSAPP');

              return (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors group">
                  {/* Tipo & Data */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isIncome
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-200 block">{formatDate(tx.date)}</span>
                        <span className="text-[10px] text-slate-500">
                          {isIncome ? 'Receita' : 'Despesa'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Descrição */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-bold text-slate-100 truncate">{tx.description}</p>
                    {tx.raw_message && (
                      <p className="text-[10px] text-slate-400 italic truncate" title={tx.raw_message}>
                        "{tx.raw_message}"
                      </p>
                    )}
                  </td>

                  {/* Conta Bancária */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {tx.account ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
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
                      <span className="text-slate-500 text-[11px]">Conta Padrão</span>
                    )}
                  </td>

                  {/* Categoria */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {tx.category ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
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
                      <span className="text-slate-500 text-[11px]">Sem categoria</span>
                    )}
                  </td>

                  {/* Origem */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isWhatsApp ? (
                      <Badge variant="whatsapp" className="text-[10px] gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </Badge>
                    ) : (
                      <Badge variant="manual" className="text-[10px]">
                        Manual
                      </Badge>
                    )}
                  </td>

                  {/* Valor */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span
                      className={`text-sm font-bold ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(tx)}
                        title="Editar transação"
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(tx.id)}
                        title="Excluir transação"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
      <div className="md:hidden space-y-2.5">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'INCOME';
          const isWhatsApp = tx.origin.startsWith('WHATSAPP');

          return (
            <div
              key={tx.id}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-2.5 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-xl ${
                      isIncome
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{tx.description}</h4>
                    <p className="text-[10px] text-slate-400">{formatDate(tx.date)}</p>
                  </div>
                </div>

                <span
                  className={`text-sm font-bold ${
                    isIncome ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                </span>
              </div>

              {/* Badges de Conta e Categoria */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                {tx.account && (
                  <span
                    className="px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1"
                    style={{
                      color: tx.account.color || '#10b981',
                      backgroundColor: `${tx.account.color || '#10b981'}15`,
                      borderColor: `${tx.account.color || '#10b981'}30`,
                    }}
                  >
                    <Landmark className="w-2.5 h-2.5" />
                    {tx.account.name}
                  </span>
                )}

                {tx.category && (
                  <span
                    className="px-2 py-0.5 rounded-full font-semibold border"
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
                  <Badge variant="whatsapp" className="text-[9px] py-0 px-1.5">
                    WhatsApp
                  </Badge>
                ) : (
                  <Badge variant="manual" className="text-[9px] py-0 px-1.5">
                    Manual
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => onEdit(tx)}
                  className="p-2 text-slate-400 hover:text-indigo-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(tx.id)}
                  className="p-2 text-slate-400 hover:text-rose-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pt-2 text-xs text-slate-400">
          <p>
            Página <span className="font-bold text-slate-200">{pagination.page}</span> de{' '}
            <span className="font-bold text-slate-200">{pagination.totalPages}</span> ({pagination.total}{' '}
            lançamentos)
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="h-10 px-3 min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4 mr-0.5" />
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="h-10 px-3 min-h-[44px]"
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
