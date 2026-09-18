import React from 'react';
import { TransactionsSummary } from '../../api/transactions';
import { Account } from '../../api/accounts';
import { Button } from '../ui/Button';
import {
  Printer, Download, X, TrendingUp, TrendingDown, DollarSign,
  Wallet, Calendar, Tag, BarChart2, ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react';
import { formatDate, MONTH_NAMES } from '../../lib/utils';

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

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CHECKING: 'Conta Corrente',
  SAVINGS: 'Poupança',
  INVESTMENT: 'Investimento',
  CREDIT_CARD: 'Cartão de Crédito',
  CASH: 'Dinheiro',
  OTHER: 'Outro',
};

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

  // --- Dados Corretos do Summary ---
  const totalIncomes = summary.current_month?.income ?? 0;
  const totalExpenses = summary.current_month?.expense ?? 0;
  const netResult = totalIncomes - totalExpenses;
  const savingsRate = totalIncomes > 0 ? (netResult / totalIncomes) * 100 : 0;
  const totalBalance = summary.total_balance ?? 0;
  const txCount = summary.current_month?.transactions_count ?? 0;

  // Comparação com mês anterior
  const prevIncome = summary.previous_month?.income ?? 0;
  const prevExpense = summary.previous_month?.expense ?? 0;
  const prevBalance = summary.previous_month?.balance ?? 0;

  const incomeDelta = prevIncome > 0 ? ((totalIncomes - prevIncome) / prevIncome) * 100 : null;
  const expenseDelta = prevExpense > 0 ? ((totalExpenses - prevExpense) / prevExpense) * 100 : null;
  const balanceDelta = prevBalance !== 0 ? ((netResult - prevBalance) / Math.abs(prevBalance)) * 100 : null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatPct = (val: number | null) => {
    if (val === null) return null;
    return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
  };

  const handlePrint = () => {
    window.print();
  };

  // Histórico dos últimos 6 meses
  const history = (summary.monthly_history ?? []).slice(-6);

  // Categorias de despesa (top 8)
  const expenseCategories = (summary.category_breakdown ?? [])
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  return (
    <>
      {/* CSS de impressão injetado inline para garantir que o PDF fique legível */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #financial-report-printable,
          #financial-report-printable * { visibility: visible !important; }
          #financial-report-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #1a1a2e !important;
            padding: 24px !important;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif !important;
          }
          #financial-report-printable .kpi-card {
            border: 1px solid #e2e8f0 !important;
            background: #f8fafc !important;
          }
          #financial-report-printable .kpi-label { color: #64748b !important; }
          #financial-report-printable .kpi-value-green { color: #16a34a !important; }
          #financial-report-printable .kpi-value-red { color: #dc2626 !important; }
          #financial-report-printable .kpi-value-blue { color: #0284c7 !important; }
          #financial-report-printable .kpi-value-neutral { color: #1a1a2e !important; }
          #financial-report-printable .section-title { color: #475569 !important; border-color: #e2e8f0 !important; }
          #financial-report-printable table { border-collapse: collapse !important; }
          #financial-report-printable th { background: #f1f5f9 !important; color: #475569 !important; }
          #financial-report-printable td { color: #334155 !important; border-color: #e2e8f0 !important; }
          #financial-report-printable .bar-fill { background: #16a34a !important; }
          #financial-report-printable .bar-fill-red { background: #dc2626 !important; }
          #financial-report-printable .header-brand { color: #16a34a !important; }
          #financial-report-printable .footer-text { color: #94a3b8 !important; border-color: #e2e8f0 !important; }
          #financial-report-printable .delta-positive { color: #16a34a !important; }
          #financial-report-printable .delta-negative { color: #dc2626 !important; }
          #financial-report-printable .divider { border-color: #e2e8f0 !important; }
          #financial-report-printable .hist-income { color: #16a34a !important; }
          #financial-report-printable .hist-expense { color: #dc2626 !important; }
          #financial-report-printable .hist-balance { color: #0284c7 !important; }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
        <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col">

          {/* Header Modal — Ações (não imprime) */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card-secondary shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-din-primary/10 border border-din-primary/20 flex items-center justify-center text-din-primary">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-din-text">Relatório Executivo Mensal</h2>
                <p className="text-xs text-din-muted">Visualização para exportação e impressão em PDF</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <Button
                onClick={handlePrint}
                className="py-2 px-3 sm:px-4 min-h-[44px] text-xs font-bold bg-din-primary hover:bg-din-primary-hover text-slate-950 shadow-md flex items-center space-x-1.5 touch-manipulation shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimir / Salvar PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl text-din-muted hover:text-din-text hover:bg-card-hover transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation shrink-0"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ===== CONTEÚDO IMPRIMÍVEL ===== */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: 'calc(95vh - 80px)' }}
          >
            <div id="financial-report-printable" className="p-6 sm:p-8 space-y-7 text-din-text">

              {/* ── Cabeçalho do Documento ── */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b-2 border-border divider gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-lg">
                      D
                    </div>
                    <span className="text-2xl font-black tracking-tight text-din-text header-brand">DIN</span>
                  </div>
                  <p className="text-xs text-din-muted kpi-label mt-1">Sistema de Gestão Financeira Inteligente</p>
                </div>

                <div className="sm:text-right">
                  <h3 className="text-lg font-black text-din-primary uppercase tracking-wide">
                    Demonstrativo Mensal: {monthName} / {year}
                  </h3>
                  <p className="text-xs text-din-muted kpi-label mt-0.5">
                    Titular: <span className="font-semibold text-din-text">{userName}</span>{userEmail && ` (${userEmail})`}
                  </p>
                  <p className="text-[11px] text-din-subtle kpi-label mt-0.5">Emitido em: {issuedAt}</p>
                  <p className="text-[11px] text-din-subtle kpi-label mt-0.5">{txCount} movimentações no período</p>
                </div>
              </div>

              {/* ── 1. KPIs Principais ── */}
              <div>
                <h4 className="section-title text-xs font-bold uppercase tracking-wider text-din-muted mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-din-primary" />
                  <span>1. Resumo do Fluxo de Caixa — {monthName} {year}</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Receitas */}
                  <div className="kpi-card p-4 rounded-xl border border-border bg-card-secondary/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="kpi-label text-[11px] font-semibold text-din-muted">Receitas Totais</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="kpi-value-green text-base sm:text-lg font-black text-emerald-500 font-mono block">
                      {formatCurrency(totalIncomes)}
                    </span>
                    {incomeDelta !== null && (
                      <span className={`text-[10px] font-semibold mt-0.5 block ${incomeDelta >= 0 ? 'delta-positive text-emerald-400' : 'delta-negative text-rose-400'}`}>
                        {formatPct(incomeDelta)} vs mês ant.
                      </span>
                    )}
                  </div>

                  {/* Despesas */}
                  <div className="kpi-card p-4 rounded-xl border border-border bg-card-secondary/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="kpi-label text-[11px] font-semibold text-din-muted">Despesas Totais</span>
                      <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <span className="kpi-value-red text-base sm:text-lg font-black text-rose-500 font-mono block">
                      {formatCurrency(totalExpenses)}
                    </span>
                    {expenseDelta !== null && (
                      <span className={`text-[10px] font-semibold mt-0.5 block ${expenseDelta <= 0 ? 'delta-positive text-emerald-400' : 'delta-negative text-rose-400'}`}>
                        {formatPct(expenseDelta)} vs mês ant.
                      </span>
                    )}
                  </div>

                  {/* Resultado Líquido */}
                  <div className="kpi-card p-4 rounded-xl border border-border bg-card-secondary/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="kpi-label text-[11px] font-semibold text-din-muted">Resultado Líquido</span>
                      {netResult >= 0
                        ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        : <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                      }
                    </div>
                    <span className={`text-base sm:text-lg font-black font-mono block ${netResult >= 0 ? 'kpi-value-green text-emerald-400' : 'kpi-value-red text-rose-400'}`}>
                      {netResult >= 0 ? '+' : ''}{formatCurrency(netResult)}
                    </span>
                    <span className="kpi-label text-[10px] text-din-muted block mt-0.5">
                      Taxa de poupança: <strong>{savingsRate.toFixed(1)}%</strong>
                    </span>
                  </div>

                  {/* Saldo Acumulado Total */}
                  <div className="kpi-card p-4 rounded-xl border border-border bg-card-secondary/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="kpi-label text-[11px] font-semibold text-din-muted">Saldo Acumulado</span>
                      <DollarSign className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <span className="kpi-value-blue text-base sm:text-lg font-black text-sky-400 font-mono block">
                      {formatCurrency(totalBalance)}
                    </span>
                    {balanceDelta !== null && (
                      <span className={`text-[10px] font-semibold mt-0.5 block ${balanceDelta >= 0 ? 'delta-positive text-emerald-400' : 'delta-negative text-rose-400'}`}>
                        {formatPct(balanceDelta)} vs mês ant.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── 2. Comparativo Mês Anterior ── */}
              {(prevIncome > 0 || prevExpense > 0) && (
                <div>
                  <h4 className="section-title text-xs font-bold uppercase tracking-wider text-din-muted mb-3 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-din-primary" />
                    <span>2. Comparativo com Mês Anterior</span>
                  </h4>
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-card-secondary/60 text-din-muted uppercase text-[10px] font-bold border-b border-border">
                        <tr>
                          <th className="py-2.5 px-4">Indicador</th>
                          <th className="py-2.5 px-4 text-right">Mês Anterior</th>
                          <th className="py-2.5 px-4 text-right">{monthName} {year}</th>
                          <th className="py-2.5 px-4 text-right">Variação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        <tr className="hover:bg-card-hover/30">
                          <td className="py-2.5 px-4 font-semibold text-din-text flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                            Receitas
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-din-muted">{formatCurrency(prevIncome)}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold kpi-value-green text-emerald-400">{formatCurrency(totalIncomes)}</td>
                          <td className={`py-2.5 px-4 text-right font-mono font-bold ${(incomeDelta ?? 0) >= 0 ? 'delta-positive text-emerald-400' : 'delta-negative text-rose-400'}`}>
                            {formatPct(incomeDelta) ?? '—'}
                          </td>
                        </tr>
                        <tr className="hover:bg-card-hover/30">
                          <td className="py-2.5 px-4 font-semibold text-din-text flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                            Despesas
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-din-muted">{formatCurrency(prevExpense)}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold kpi-value-red text-rose-400">{formatCurrency(totalExpenses)}</td>
                          <td className={`py-2.5 px-4 text-right font-mono font-bold ${(expenseDelta ?? 0) <= 0 ? 'delta-positive text-emerald-400' : 'delta-negative text-rose-400'}`}>
                            {formatPct(expenseDelta) ?? '—'}
                          </td>
                        </tr>
                        <tr className="hover:bg-card-hover/30">
                          <td className="py-2.5 px-4 font-semibold text-din-text flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                            Resultado
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-din-muted">{formatCurrency(prevBalance)}</td>
                          <td className={`py-2.5 px-4 text-right font-mono font-bold ${netResult >= 0 ? 'kpi-value-green text-emerald-400' : 'kpi-value-red text-rose-400'}`}>{formatCurrency(netResult)}</td>
                          <td className={`py-2.5 px-4 text-right font-mono font-bold ${(balanceDelta ?? 0) >= 0 ? 'delta-positive text-emerald-400' : 'delta-negative text-rose-400'}`}>
                            {formatPct(balanceDelta) ?? '—'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── 3. Saldos por Conta Bancária ── */}
              {accounts.length > 0 && (
                <div>
                  <h4 className="section-title text-xs font-bold uppercase tracking-wider text-din-muted mb-3 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-din-primary" />
                    <span>3. Saldos por Conta Bancária</span>
                  </h4>
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-card-secondary/60 text-din-muted uppercase text-[10px] font-bold border-b border-border">
                        <tr>
                          <th className="py-2.5 px-4">Instituição / Conta</th>
                          <th className="py-2.5 px-4">Tipo</th>
                          <th className="py-2.5 px-4 text-right">Receitas no Mês</th>
                          <th className="py-2.5 px-4 text-right">Despesas no Mês</th>
                          <th className="py-2.5 px-4 text-right">Saldo Atual</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {accounts.map((acc) => (
                          <tr key={acc.id} className="hover:bg-card-hover/30">
                            <td className="py-2.5 px-4 font-semibold text-din-text">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: acc.color || '#10b981' }} />
                                {acc.name}
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-din-muted kpi-label">
                              {ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono hist-income text-emerald-400">
                              {acc.month_income != null ? formatCurrency(acc.month_income) : '—'}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono hist-expense text-rose-400">
                              {acc.month_expense != null ? formatCurrency(acc.month_expense) : '—'}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold kpi-value-neutral text-din-text">
                              {formatCurrency(Number(acc.current_balance ?? 0))}
                            </td>
                          </tr>
                        ))}
                        {/* Total */}
                        <tr className="bg-card-secondary/30 font-black">
                          <td className="py-2.5 px-4 text-din-text" colSpan={4}>
                            Patrimônio Total (todas as contas)
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-black kpi-value-blue text-sky-400">
                            {formatCurrency(accounts.reduce((s, a) => s + Number(a.current_balance ?? 0), 0))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── 4. Categorias de Despesa ── */}
              {expenseCategories.length > 0 && (
                <div>
                  <h4 className="section-title text-xs font-bold uppercase tracking-wider text-din-muted mb-3 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-din-primary" />
                    <span>4. Principais Categorias de Despesa</span>
                  </h4>
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-card-secondary/60 text-din-muted uppercase text-[10px] font-bold border-b border-border">
                        <tr>
                          <th className="py-2.5 px-4">Categoria</th>
                          <th className="py-2.5 px-4 text-right">Qtd</th>
                          <th className="py-2.5 px-4 text-right">Valor Gasto</th>
                          <th className="py-2.5 px-4 text-right">% Total</th>
                          <th className="py-2.5 px-4 w-28">Participação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {expenseCategories.map((cat, idx) => {
                          const pct = totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0;
                          return (
                            <tr key={idx} className="hover:bg-card-hover/30">
                              <td className="py-2.5 px-4 font-semibold text-din-text">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#64748b' }} />
                                  {cat.name}
                                </div>
                              </td>
                              <td className="py-2.5 px-4 text-right text-din-muted kpi-label">{cat.count}</td>
                              <td className="py-2.5 px-4 text-right font-mono font-bold hist-expense text-rose-400">
                                {formatCurrency(cat.amount)}
                              </td>
                              <td className="py-2.5 px-4 text-right font-mono text-din-muted kpi-label">
                                {pct.toFixed(1)}%
                              </td>
                              <td className="py-2.5 px-4">
                                <div className="h-2 rounded-full bg-border overflow-hidden">
                                  <div
                                    className="h-full rounded-full bar-fill-red bg-rose-500"
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── 5. Histórico Mensal (últimos 6 meses) ── */}
              {history.length > 0 && (
                <div>
                  <h4 className="section-title text-xs font-bold uppercase tracking-wider text-din-muted mb-3 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-din-primary" />
                    <span>5. Histórico dos Últimos {history.length} Meses</span>
                  </h4>
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-card-secondary/60 text-din-muted uppercase text-[10px] font-bold border-b border-border">
                        <tr>
                          <th className="py-2.5 px-4">Mês</th>
                          <th className="py-2.5 px-4 text-right">Receitas</th>
                          <th className="py-2.5 px-4 text-right">Despesas</th>
                          <th className="py-2.5 px-4 text-right">Resultado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {history.map((h, idx) => {
                          const bal = h.income - h.expense;
                          const isCurrentMonth = h.month === String(month).padStart(2, '0') && h.year === year;
                          return (
                            <tr key={idx} className={`hover:bg-card-hover/30 ${isCurrentMonth ? 'bg-din-primary/5' : ''}`}>
                              <td className="py-2.5 px-4 font-semibold text-din-text">
                                {h.label}
                                {isCurrentMonth && (
                                  <span className="ml-2 text-[9px] uppercase font-black text-din-primary bg-din-primary/10 px-1.5 py-0.5 rounded">
                                    Atual
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-right font-mono hist-income text-emerald-400">{formatCurrency(h.income)}</td>
                              <td className="py-2.5 px-4 text-right font-mono hist-expense text-rose-400">{formatCurrency(h.expense)}</td>
                              <td className={`py-2.5 px-4 text-right font-mono font-bold ${bal >= 0 ? 'hist-income text-emerald-400' : 'hist-expense text-rose-400'}`}>
                                {bal >= 0 ? '+' : ''}{formatCurrency(bal)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── 6. Amostra de Movimentações Recentes ── */}
              {summary.recent_transactions && summary.recent_transactions.length > 0 && (
                <div>
                  <h4 className="section-title text-xs font-bold uppercase tracking-wider text-din-muted mb-3 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-din-primary" />
                    <span>6. Amostra de Movimentações Recentes</span>
                  </h4>
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-card-secondary/60 text-din-muted uppercase text-[10px] font-bold border-b border-border">
                        <tr>
                          <th className="py-2.5 px-4">Data</th>
                          <th className="py-2.5 px-4">Descrição</th>
                          <th className="py-2.5 px-4">Categoria</th>
                          <th className="py-2.5 px-4">Conta</th>
                          <th className="py-2.5 px-4 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {summary.recent_transactions.slice(0, 12).map((t) => {
                          const d = formatDate(t.date);
                          const isIncome = t.type === 'INCOME';
                          return (
                            <tr key={t.id} className="hover:bg-card-hover/30">
                              <td className="py-2 px-4 text-din-muted font-mono kpi-label">{d}</td>
                              <td className="py-2 px-4 font-semibold text-din-text max-w-[160px] truncate">{t.description}</td>
                              <td className="py-2 px-4 text-din-muted kpi-label">{t.category?.name || 'Geral'}</td>
                              <td className="py-2 px-4 text-din-muted kpi-label">{t.account?.name || '—'}</td>
                              <td className={`py-2 px-4 text-right font-mono font-bold ${isIncome ? 'hist-income text-emerald-400' : 'hist-expense text-rose-400'}`}>
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

              {/* ── Análise Executiva Resumida ── */}
              <div className="p-4 rounded-xl border border-border bg-card-secondary/30">
                <h4 className="section-title text-xs font-bold uppercase tracking-wider text-din-muted mb-2 flex items-center gap-1.5">
                  <Minus className="w-3.5 h-3.5 text-din-primary" />
                  <span>Análise Executiva</span>
                </h4>
                <p className="text-xs text-din-muted kpi-label leading-relaxed">
                  {netResult >= 0
                    ? `Em ${monthName} de ${year}, o resultado financeiro foi positivo com superávit de ${formatCurrency(netResult)}, representando uma taxa de poupança de ${savingsRate.toFixed(1)}% sobre as receitas totais.`
                    : `Em ${monthName} de ${year}, as despesas superaram as receitas em ${formatCurrency(Math.abs(netResult))}, configurando um déficit de ${Math.abs(savingsRate).toFixed(1)}% sobre as receitas.`
                  }
                  {expenseCategories.length > 0 && ` A principal categoria de gasto foi ${expenseCategories[0].name} (${formatCurrency(expenseCategories[0].amount)}).`}
                  {` Saldo total consolidado: ${formatCurrency(totalBalance)}.`}
                </p>
              </div>

              {/* ── Rodapé do Relatório ── */}
              <div className="pt-5 border-t border-border divider footer-text flex flex-col sm:flex-row items-center justify-between text-[10px] text-din-subtle gap-1.5">
                <span>MeuDino — Relatório Executivo confidencial gerado automaticamente pelo sistema</span>
                <span className="text-din-subtle">
                  {monthName}/{year} · {issuedAt} · {txCount} transações
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
