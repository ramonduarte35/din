import React from 'react';
import { NavLink } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Transaction } from '../../api/transactions';
import { ArrowUpRight, ArrowDownRight, MessageSquare, ArrowRight, ReceiptText } from 'lucide-react';

interface RecentTransactionsCardProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function RecentTransactionsCard({ transactions, isLoading }: RecentTransactionsCardProps) {
  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center animate-pulse">
        <div className="w-full space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-900/60 rounded-xl" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full bg-card border-border">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-sm font-bold text-din-text tracking-tight">Últimas Transações</h3>
          <p className="text-xs text-din-muted">Atividades registradas recentemente</p>
        </div>
        <NavLink
          to="/transactions"
          className="text-xs font-semibold text-din-primary hover:opacity-80 flex items-center gap-1 transition-colors"
        >
          <span>Ver todas</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </NavLink>
      </div>

      <div className="flex-1 mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {transactions.length === 0 ? (
          <div className="py-10 text-center">
            <ReceiptText className="w-8 h-8 text-din-muted mx-auto mb-2" />
            <p className="text-xs text-din-muted">Nenhuma transação registrada ainda.</p>
          </div>
        ) : (
          transactions.map((tx) => {
            const isIncome = tx.type === 'INCOME';
            const isWhatsApp = tx.origin.startsWith('WHATSAPP');

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-card-secondary border border-border hover:border-din-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`p-2 rounded-xl flex-shrink-0 ${
                      isIncome
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}
                  >
                    {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>

                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-din-text truncate">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-din-muted">{formatDate(tx.date)}</span>
                      {tx.category && (
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.2 rounded"
                          style={{
                            color: tx.category.color,
                            backgroundColor: `${tx.category.color}15`,
                          }}
                        >
                          {tx.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-2">
                  <span
                    className={`text-xs font-bold block ${
                      isIncome ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                  </span>
                  <div className="flex justify-end mt-0.5">
                    {isWhatsApp ? (
                      <Badge variant="whatsapp" className="text-[9px] py-0 px-1.5 gap-1">
                        <MessageSquare className="w-2.5 h-2.5" />
                        <span>WhatsApp</span>
                      </Badge>
                    ) : (
                      <Badge variant="manual" className="text-[9px] py-0 px-1.5">
                        Manual
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
