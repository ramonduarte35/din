import React from 'react';
import { TransactionsSummary } from '../../api/transactions';
import { Account } from '../../api/accounts';
import { Button } from '../ui/Button';
import { Printer, Download, X, Sparkles, TrendingUp, TrendingDown, DollarSign, Wallet, Calendar, ShieldCheck, Tag } from 'lucide-react';

interface FinancialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: TransactionsSummary | null;
  accounts: Account[];
  month: number;
  year: number;
  userName?: string;
  userEmail?: string;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function FinancialReportModal({
  isOpen,
  onClose,
  summary,
  accounts,
  month,
  year,
  userName = 'Usuário',
  userEmail = '',
}: FinancialReportModalProps) {
  if (!isOpen || !summary) return null;

  const monthName = MONTH_NAMES[month - 1];
  const now = new Date();
  const issuedAt = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalIncomes = summary.total_income || 0;
  const totalExpenses = summary.total_expense || 0;
  const netSavings = totalIncomes - totalExpenses;
  const savingsRate = totalIncomes > 0 ? Math.round((netSavings / totalIncomes) * 100) : 0;
  const totalBalance = summary.current_balance || 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in no-print-backdrop">
      <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header Modal (Ações) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card-secondary no-print">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-din-primary/10 border border-din-primary/20 flex items-center justify-center text-din-primary">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-din-text">Relatório Executivo Mensal</h2>
              <p className="text-xs text-din-muted">Visualização para exportação e impressão em PDF</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handlePrint}
              className="py-2 px-4 min-h-[40px] text-xs font-bold bg-din-primary hover:bg-din-primary-hover text-slate-950 shadow-md flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-din-muted hover:text-din-text hover:bg-card-hover transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo Imprimível do Relatório */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-din-text" id="financial-report-printable">
          {/* Cabeçalho do Documento */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-border/80 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-lg">
                  D
                </div>
                <span className="text-2xl font-black tracking-tight text-din-text">DIN</span>
              </div>
              <p className="text-xs text-din-muted mt-1">Sistema de Gestão Financeira Inteligente</p>
            </div>

            <div className="sm:text-right">
              <h3 className="text-lg font-black text-din-primary uppercase tracking-wide">
                Demonstrativo Mensal: {monthName} / {year}
              </h3>
              <p className="text-xs text-din-muted mt-0.5">
                Titular: <span className="font-semibold text-din-text">{userName}</span> {userEmail && `(${userEmail})`}
              </p>
              <p className="text-[11px] text-din-subtle mt-0.5">Emitido em: {issuedAt}</p>
            </div>
          </div>

          {/* Resumo Executivo / KPIs Principais */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-din-muted mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-din-primary" />
              <span>1. Resumo do Fluxo de Caixa</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-border bg-card-secondary/40">
                <span className="text-[11px] font-semibold text-din-muted block">Receitas Totais</span>
                <span className="text-base sm:text-lg font-black text-emerald-500 font-mono mt-1 block">
                  {formatCurrency(totalIncomes)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-card-secondary/40">
                <span className="text-[11px] font-semibold text-din-muted block">Despesas Totais</span>
                <span className="text-base sm:text-lg font-black text-rose-500 font-mono mt-1 block">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-card-secondary/40">
                <span className="text-[11px] font-semibold text-din-muted block">Resultado Líquido</span>
                <span className={`text-base sm:text-lg font-black font-mono mt-1 block ${
                  netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {netSavings >= 0 ? '+' : ''}{formatCurrency(netSavings)}
                </span>
                <span className="text-[10px] text-din-muted block mt-0.5">
                  Taxa de Poupança: {savingsRate}%
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-card-secondary/40">
                <span className="text-[11px] font-semibold text-din-muted block">Saldo Acumulado</span>
                <span className="text-base sm:text-lg font-black text-sky-400 font-mono mt-1 block">
                  {formatCurrency(totalBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Distribuição por Contas Bancárias */}
          {accounts.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-din-muted mb-3 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-din-primary" />
                <span>2. Saldos por Conta Bancária</span>
              </h4>
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-card-secondary/60 text-din-muted uppercase text-[10px] font-bold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-4">Instituição / Conta</th>
                      <th className="py-2.5 px-4">Tipo</th>
                      <th className="py-2.5 px-4 text-right">Saldo Atual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {accounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-card-hover/30">
                        <td className="py-2 px-4 font-semibold text-din-text flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: acc.color || '#10b981' }} />
                          {acc.name}
                        </td>
                        <td className="py-2 px-4 text-din-muted capitalize">{acc.type.toLowerCase()}</td>
                        <td className="py-2 px-4 text-right font-mono font-bold text-din-text">
                          {formatCurrency(Number(acc.initial_balance || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Principais Categorias de Despesa */}
          {summary.category_breakdown && summary.category_breakdown.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-din-muted mb-3 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-din-primary" />
                <span>3. Principais Categorias de Despesa</span>
              </h4>
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-card-secondary/60 text-din-muted uppercase text-[10px] font-bold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-4">Categoria</th>
                      <th className="py-2.5 px-4 text-right">Valor Gasto</th>
                      <th className="py-2.5 px-4 text-right">% das Despesas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {summary.category_breakdown.slice(0, 8).map((cat, idx) => {
                      const pct = totalExpenses > 0 ? Math.round((cat.amount / totalExpenses) * 100) : 0;
                      return (
                        <tr key={idx} className="hover:bg-card-hover/30">
                          <td className="py-2 px-4 font-semibold text-din-text flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color || '#64748b' }} />
                            {cat.name}
                          </td>
                          <td className="py-2 px-4 text-right font-mono font-bold text-rose-400">
                            {formatCurrency(cat.amount)}
                          </td>
                          <td className="py-2 px-4 text-right font-mono text-din-muted">
                            {pct}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transações Recentes do Período */}
          {summary.recent_transactions && summary.recent_transactions.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-din-muted mb-3 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-din-primary" />
                <span>4. Amostra de Movimentações Recentes</span>
              </h4>
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-card-secondary/60 text-din-muted uppercase text-[10px] font-bold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-4">Data</th>
                      <th className="py-2.5 px-4">Descrição</th>
                      <th className="py-2.5 px-4">Categoria</th>
                      <th className="py-2.5 px-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {summary.recent_transactions.slice(0, 10).map((t) => {
                      const d = new Date(t.date).toLocaleDateString('pt-BR');
                      const isIncome = t.type === 'INCOME';
                      return (
                        <tr key={t.id} className="hover:bg-card-hover/30">
                          <td className="py-2 px-4 text-din-muted font-mono">{d}</td>
                          <td className="py-2 px-4 font-semibold text-din-text">{t.description}</td>
                          <td className="py-2 px-4 text-din-muted">{t.category?.name || 'Geral'}</td>
                          <td className={`py-2 px-4 text-right font-mono font-bold ${
                            isIncome ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {isIncome ? '+' : '-'}{formatCurrency(Number(t.amount))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rodapé do Relatório */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-[11px] text-din-subtle gap-2">
            <span>Din Gestão Financeira Inteligente — Relatório confidencial do titular</span>
            <span>Página 1 de 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
