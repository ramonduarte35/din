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

  // --- Dados Consolidados ---
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

  // Histórico dos últimos 6 meses
  const history = (summary.monthly_history ?? []).slice(-6);

  // Categorias de despesa (top 8)
  const expenseCategories = (summary.category_breakdown ?? [])
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  const totalPatrimony = accounts.reduce((s, a) => s + Number(a.current_balance ?? 0), 0);

  // Gera o HTML autocontido para impressão limpa e fiel em PDF via iframe
  const generatePrintHtml = (): string => {
    const isSuperavit = netResult >= 0;

    const kpisHtml = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-title">Receitas Totais</div>
          <div class="kpi-val text-green">${formatCurrency(totalIncomes)}</div>
          ${incomeDelta !== null ? `<div class="kpi-delta ${incomeDelta >= 0 ? 'text-green' : 'text-red'}">${formatPct(incomeDelta)} vs mês ant.</div>` : ''}
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Despesas Totais</div>
          <div class="kpi-val text-red">${formatCurrency(totalExpenses)}</div>
          ${expenseDelta !== null ? `<div class="kpi-delta ${expenseDelta <= 0 ? 'text-green' : 'text-red'}">${formatPct(expenseDelta)} vs mês ant.</div>` : ''}
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Resultado Líquido</div>
          <div class="kpi-val ${isSuperavit ? 'text-green' : 'text-red'}">${isSuperavit ? '+' : ''}${formatCurrency(netResult)}</div>
          <div class="kpi-sub">Taxa de poupança: <strong>${savingsRate.toFixed(1)}%</strong></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Saldo Consolidado</div>
          <div class="kpi-val text-blue">${formatCurrency(totalBalance)}</div>
          ${balanceDelta !== null ? `<div class="kpi-delta ${balanceDelta >= 0 ? 'text-green' : 'text-red'}">${formatPct(balanceDelta)} vs mês ant.</div>` : ''}
        </div>
      </div>
    `;

    const comparisonHtml = (prevIncome > 0 || prevExpense > 0) ? `
      <div class="section-block">
        <div class="section-heading">2. Comparativo com Mês Anterior</div>
        <table>
          <thead>
            <tr>
              <th>Indicador</th>
              <th style="text-align: right;">Mês Anterior</th>
              <th style="text-align: right;">${monthName} ${year}</th>
              <th style="text-align: right;">Variação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Receitas</strong></td>
              <td style="text-align: right;">${formatCurrency(prevIncome)}</td>
              <td style="text-align: right; font-weight: 700;" class="text-green">${formatCurrency(totalIncomes)}</td>
              <td style="text-align: right; font-weight: 700;" class="${(incomeDelta ?? 0) >= 0 ? 'text-green' : 'text-red'}">${formatPct(incomeDelta) ?? '—'}</td>
            </tr>
            <tr>
              <td><strong>Despesas</strong></td>
              <td style="text-align: right;">${formatCurrency(prevExpense)}</td>
              <td style="text-align: right; font-weight: 700;" class="text-red">${formatCurrency(totalExpenses)}</td>
              <td style="text-align: right; font-weight: 700;" class="${(expenseDelta ?? 0) <= 0 ? 'text-green' : 'text-red'}">${formatPct(expenseDelta) ?? '—'}</td>
            </tr>
            <tr>
              <td><strong>Resultado</strong></td>
              <td style="text-align: right;">${formatCurrency(prevBalance)}</td>
              <td style="text-align: right; font-weight: 700;" class="${isSuperavit ? 'text-green' : 'text-red'}">${formatCurrency(netResult)}</td>
              <td style="text-align: right; font-weight: 700;" class="${(balanceDelta ?? 0) >= 0 ? 'text-green' : 'text-red'}">${formatPct(balanceDelta) ?? '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    ` : '';

    const accountsHtml = accounts.length > 0 ? `
      <div class="section-block">
        <div class="section-heading">3. Saldos por Conta Bancária</div>
        <table>
          <thead>
            <tr>
              <th>Instituição / Conta</th>
              <th>Tipo</th>
              <th style="text-align: right;">Receitas no Mês</th>
              <th style="text-align: right;">Despesas no Mês</th>
              <th style="text-align: right;">Saldo Atual</th>
            </tr>
          </thead>
          <tbody>
            ${accounts.map(acc => `
              <tr>
                <td><strong>${acc.name}</strong></td>
                <td style="color: #64748b;">${ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}</td>
                <td style="text-align: right;" class="text-green">${acc.month_income != null ? formatCurrency(acc.month_income) : '—'}</td>
                <td style="text-align: right;" class="text-red">${acc.month_expense != null ? formatCurrency(acc.month_expense) : '—'}</td>
                <td style="text-align: right; font-weight: 700;">${formatCurrency(Number(acc.current_balance ?? 0))}</td>
              </tr>
            `).join('')}
            <tr style="background: #f1f5f9; font-weight: 800;">
              <td colspan="4">Patrimônio Consolidado (todas as contas)</td>
              <td style="text-align: right;" class="text-blue">${formatCurrency(totalPatrimony)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    ` : '';

    const categoriesHtml = expenseCategories.length > 0 ? `
      <div class="section-block">
        <div class="section-heading">4. Principais Categorias de Despesa</div>
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th style="text-align: right;">Lançamentos</th>
              <th style="text-align: right;">Valor Gasto</th>
              <th style="text-align: right;">% das Despesas</th>
              <th style="width: 140px;">Participação</th>
            </tr>
          </thead>
          <tbody>
            ${expenseCategories.map(cat => {
              const pct = totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0;
              return `
                <tr>
                  <td><strong>${cat.name}</strong></td>
                  <td style="text-align: right; color: #64748b;">${cat.count}</td>
                  <td style="text-align: right; font-weight: 700;" class="text-red">${formatCurrency(cat.amount)}</td>
                  <td style="text-align: right; color: #64748b;">${pct.toFixed(1)}%</td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${Math.min(pct, 100)}%;"></div>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    const historyHtml = history.length > 0 ? `
      <div class="section-block">
        <div class="section-heading">5. Histórico dos Últimos ${history.length} Meses</div>
        <table>
          <thead>
            <tr>
              <th>Período</th>
              <th style="text-align: right;">Receitas</th>
              <th style="text-align: right;">Despesas</th>
              <th style="text-align: right;">Resultado</th>
            </tr>
          </thead>
          <tbody>
            ${history.map(h => {
              const bal = h.income - h.expense;
              const isCurrent = h.month === String(month).padStart(2, '0') && h.year === year;
              return `
                <tr style="${isCurrent ? 'background: #ecfdf5; font-weight: 700;' : ''}">
                  <td>${h.label} ${isCurrent ? '<span class="badge-current">Atual</span>' : ''}</td>
                  <td style="text-align: right;" class="text-green">${formatCurrency(h.income)}</td>
                  <td style="text-align: right;" class="text-red">${formatCurrency(h.expense)}</td>
                  <td style="text-align: right; font-weight: 700;" class="${bal >= 0 ? 'text-green' : 'text-red'}">
                    ${bal >= 0 ? '+' : ''}${formatCurrency(bal)}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    const transactionsHtml = (summary.recent_transactions && summary.recent_transactions.length > 0) ? `
      <div class="section-block">
        <div class="section-heading">6. Amostra de Movimentações Recentes</div>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Conta</th>
              <th style="text-align: right;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${summary.recent_transactions.slice(0, 12).map(t => {
              const isIncome = t.type === 'INCOME';
              return `
                <tr>
                  <td style="color: #64748b;">${formatDate(t.date)}</td>
                  <td><strong>${t.description}</strong></td>
                  <td style="color: #64748b;">${t.category?.name || 'Geral'}</td>
                  <td style="color: #64748b;">${t.account?.name || '—'}</td>
                  <td style="text-align: right; font-weight: 700;" class="${isIncome ? 'text-green' : 'text-red'}">
                    ${isIncome ? '+' : '-'}${formatCurrency(Number(t.amount))}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Relatorio_Executivo_${monthName}_${year}_${userName.replace(/\s+/g, '_')}</title>
        <style>
          @page {
            size: A4;
            margin: 12mm 14mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.45;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 14px;
            border-bottom: 2px solid #059669;
            margin-bottom: 16px;
          }
          .brand-logo {
            display: inline-block;
            background: #059669;
            color: #ffffff;
            font-weight: 900;
            font-size: 16px;
            padding: 4px 10px;
            border-radius: 6px;
            margin-right: 8px;
          }
          .brand-title {
            font-size: 20px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #0f172a;
          }
          .brand-subtitle {
            font-size: 10px;
            color: #64748b;
            margin-top: 2px;
          }
          .report-meta {
            text-align: right;
          }
          .report-title {
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
            color: #059669;
            letter-spacing: 0.5px;
          }
          .report-user {
            font-size: 10.5px;
            color: #334155;
            margin-top: 3px;
          }
          .report-date {
            font-size: 9.5px;
            color: #94a3b8;
            margin-top: 2px;
          }
          .section-heading {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #475569;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-bottom: 16px;
          }
          .kpi-card {
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            border-radius: 8px;
            padding: 10px;
            page-break-inside: avoid;
          }
          .kpi-title {
            font-size: 9.5px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .kpi-val {
            font-size: 15px;
            font-weight: 900;
            margin-top: 3px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          }
          .kpi-delta {
            font-size: 9px;
            font-weight: 700;
            margin-top: 2px;
          }
          .kpi-sub {
            font-size: 9px;
            color: #64748b;
            margin-top: 2px;
          }
          .text-green { color: #059669 !important; }
          .text-red { color: #dc2626 !important; }
          .text-blue { color: #0284c7 !important; }
          .section-block {
            margin-bottom: 16px;
            page-break-inside: avoid;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
          }
          thead th {
            background: #f1f5f9;
            color: #475569;
            text-transform: uppercase;
            font-size: 8.5px;
            font-weight: 800;
            letter-spacing: 0.5px;
            padding: 7px 10px;
            border-bottom: 1px solid #e2e8f0;
            text-align: left;
          }
          tbody td {
            padding: 6px 10px;
            border-bottom: 1px solid #f1f5f9;
            color: #1e293b;
          }
          tbody tr:last-child td {
            border-bottom: none;
          }
          tbody tr:nth-child(even) {
            background: #fafafa;
          }
          .progress-bar {
            height: 6px;
            background: #e2e8f0;
            border-radius: 3px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: #dc2626;
            border-radius: 3px;
          }
          .badge-current {
            display: inline-block;
            background: #059669;
            color: #ffffff;
            font-size: 8px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 1px 5px;
            border-radius: 4px;
            margin-left: 4px;
          }
          .analysis-box {
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            border-radius: 8px;
            padding: 10px 14px;
            margin-bottom: 16px;
            page-break-inside: avoid;
          }
          .analysis-title {
            font-size: 9.5px;
            font-weight: 800;
            text-transform: uppercase;
            color: #059669;
            margin-bottom: 4px;
          }
          .analysis-text {
            font-size: 10px;
            color: #334155;
            line-height: 1.5;
            margin: 0;
          }
          .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div style="display: flex; align-items: center;">
              <span class="brand-logo">D</span>
              <span class="brand-title">MeuDino</span>
            </div>
            <div class="brand-subtitle">Gestão Financeira Pessoal Inteligente</div>
          </div>
          <div class="report-meta">
            <div class="report-title">Demonstrativo Mensal: ${monthName} / ${year}</div>
            <div class="report-user">Titular: <strong>${userName}</strong>${userEmail ? ` (${userEmail})` : ''}</div>
            <div class="report-date">Emitido em: ${issuedAt} · ${txCount} transações</div>
          </div>
        </div>

        <div class="section-heading">1. Resumo do Fluxo de Caixa — ${monthName} ${year}</div>
        ${kpisHtml}

        ${comparisonHtml}

        ${accountsHtml}

        ${categoriesHtml}

        ${historyHtml}

        ${transactionsHtml}

        <div class="analysis-box">
          <div class="analysis-title">Análise Executiva da Gestão</div>
          <p class="analysis-text">
            ${isSuperavit
              ? `Em ${monthName} de ${year}, o resultado financeiro foi positivo com superávit de <strong>${formatCurrency(netResult)}</strong>, representando uma taxa de poupança de <strong>${savingsRate.toFixed(1)}%</strong> sobre as receitas totais.`
              : `Em ${monthName} de ${year}, as despesas superaram as receitas em <strong>${formatCurrency(Math.abs(netResult))}</strong>, configurando um déficit de <strong>${Math.abs(savingsRate).toFixed(1)}%</strong> sobre as receitas.`
            }
            ${expenseCategories.length > 0 ? ` A principal categoria de despesa no mês foi <strong>${expenseCategories[0].name}</strong> (${formatCurrency(expenseCategories[0].amount)}).` : ''}
            ${` O saldo patrimonial consolidado nas contas cadastradas totaliza <strong>${formatCurrency(totalBalance)}</strong>.`}
          </p>
        </div>

        <div class="footer">
          <span>MeuDino — Documento confidencial do titular gerado automaticamente</span>
          <span>Período: ${monthName}/${year} · Emissão: ${issuedAt}</span>
        </div>
      </body>
      </html>
    `;
  };

  // Dispara a impressão criando um iframe invisível com HTML autocontido
  const handlePrint = () => {
    const reportHtml = generatePrintHtml();
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(reportHtml);
    doc.close();

    // Aguarda parsing e rendering no iframe antes de chamar a janela de impressão
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Falha ao imprimir via iframe:', e);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 250);
  };

  return (
    <>
      {/* Estilos para o caso do usuário usar o atalho de teclado do navegador (Ctrl+P / Cmd+P) */}
      <style>{`
        @media print {
          /* Desativa elementos externos e destrava o modal */
          .no-print { display: none !important; }
          .modal-backdrop-print {
            position: static !important;
            padding: 0 !important;
            background: #ffffff !important;
            backdrop-filter: none !important;
            overflow: visible !important;
          }
          .modal-container-print {
            position: static !important;
            border: none !important;
            box-shadow: none !important;
            max-width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #0f172a !important;
          }
          .modal-scroll-print {
            max-height: none !important;
            overflow: visible !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in modal-backdrop-print">
        <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col modal-container-print">

          {/* Header Modal — Ações (não imprime) */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card-secondary shrink-0 no-print">
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

          {/* ===== CONTEÚDO VISUAL DO MODAL (Preview em tela) ===== */}
          <div
            className="overflow-y-auto modal-scroll-print"
            style={{ maxHeight: 'calc(95vh - 80px)' }}
          >
            <div id="financial-report-printable" className="p-6 sm:p-8 space-y-7 text-din-text">

              {/* ── Cabeçalho do Documento ── */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b-2 border-border gap-4">
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
                    Titular: <span className="font-semibold text-din-text">{userName}</span>{userEmail && ` (${userEmail})`}
                  </p>
                  <p className="text-[11px] text-din-subtle mt-0.5">Emitido em: {issuedAt}</p>
                  <p className="text-[11px] text-din-subtle mt-0.5">{txCount} movimentações no período</p>
                </div>
              </div>

              {/* ── 1. KPIs Principais ── */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-din-muted mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-din-primary" />
                  <span>1. Resumo do Fluxo de Caixa — {monthName} {year}</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Receitas */}
                  <div className="p-4 rounded-xl border border-border bg-card-secondary/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-din-muted">Receitas Totais</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-base sm:text-lg font-black text-emerald-500 font-mono block">
                      {formatCurrency(totalIncomes)}
                    </span>
                    {incomeDelta !== null && (
                      <span className={`text-[10px] font-semibold mt-0.5 block ${incomeDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatPct(incomeDelta)} vs mês ant.
                      </span>
                    )}
                  </div>

                  {/* Despesas */}
                  <div className="p-4 rounded-xl border border-border bg-card-secondary/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-din-muted">Despesas Totais</span>
                      <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <span className="text-base sm:text-lg font-black text-rose-500 font-mono block">
                      {formatCurrency(totalExpenses)}
                    </span>
                    {expenseDelta !== null && (
                      <span className={`text-[10px] font-semibold mt-0.5 block ${expenseDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatPct(expenseDelta)} vs mês ant.
                      </span>
                    )}
                  </div>

                  {/* Resultado Líquido */}
                  <div className="p-4 rounded-xl border border-border bg-card-secondary/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-din-muted">Resultado Líquido</span>
                      {netResult >= 0
                        ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        : <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                      }
                    </div>
                    <span className={`text-base sm:text-lg font-black font-mono block ${netResult >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {netResult >= 0 ? '+' : ''}{formatCurrency(netResult)}
                    </span>
                    <span className="text-[10px] text-din-muted block mt-0.5">
                      Taxa de poupança: <strong>{savingsRate.toFixed(1)}%</strong>
                    </span>
                  </div>

                  {/* Saldo Acumulado Total */}
                  <div className="p-4 rounded-xl border border-border bg-card-secondary/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-din-muted">Saldo Acumulado</span>
                      <DollarSign className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <span className="text-base sm:text-lg font-black text-sky-400 font-mono block">
                      {formatCurrency(totalBalance)}
                    </span>
                    {balanceDelta !== null && (
                      <span className={`text-[10px] font-semibold mt-0.5 block ${balanceDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatPct(balanceDelta)} vs mês ant.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── 2. Comparativo Mês Anterior ── */}
              {(prevIncome > 0 || prevExpense > 0) && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-din-muted mb-3 flex items-center gap-1.5">
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
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">{formatCurrency(totalIncomes)}</td>
                          <td className={`py-2.5 px-4 text-right font-mono font-bold ${(incomeDelta ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatPct(incomeDelta) ?? '—'}
                          </td>
                        </tr>
                        <tr className="hover:bg-card-hover/30">
                          <td className="py-2.5 px-4 font-semibold text-din-text flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                            Despesas
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-din-muted">{formatCurrency(prevExpense)}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-400">{formatCurrency(totalExpenses)}</td>
                          <td className={`py-2.5 px-4 text-right font-mono font-bold ${(expenseDelta ?? 0) <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatPct(expenseDelta) ?? '—'}
                          </td>
                        </tr>
                        <tr className="hover:bg-card-hover/30">
                          <td className="py-2.5 px-4 font-semibold text-din-text flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                            Resultado
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-din-muted">{formatCurrency(prevBalance)}</td>
                          <td className={`py-2.5 px-4 text-right font-mono font-bold ${netResult >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatCurrency(netResult)}</td>
                          <td className={`py-2.5 px-4 text-right font-mono font-bold ${(balanceDelta ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
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
                  <h4 className="text-xs font-bold uppercase tracking-wider text-din-muted mb-3 flex items-center gap-1.5">
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
                            <td className="py-2.5 px-4 text-din-muted">
                              {ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-emerald-400">
                              {acc.month_income != null ? formatCurrency(acc.month_income) : '—'}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-rose-400">
                              {acc.month_expense != null ? formatCurrency(acc.month_expense) : '—'}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-din-text">
                              {formatCurrency(Number(acc.current_balance ?? 0))}
                            </td>
                          </tr>
                        ))}
                        {/* Total */}
                        <tr className="bg-card-secondary/30 font-black">
                          <td className="py-2.5 px-4 text-din-text" colSpan={4}>
                            Patrimônio Total (todas as contas)
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-black text-sky-400">
                            {formatCurrency(totalPatrimony)}
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
                  <h4 className="text-xs font-bold uppercase tracking-wider text-din-muted mb-3 flex items-center gap-1.5">
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
                              <td className="py-2.5 px-4 text-right text-din-muted">{cat.count}</td>
                              <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-400">
                                {formatCurrency(cat.amount)}
                              </td>
                              <td className="py-2.5 px-4 text-right font-mono text-din-muted">
                                {pct.toFixed(1)}%
                              </td>
                              <td className="py-2.5 px-4">
                                <div className="h-2 rounded-full bg-border overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-rose-500"
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
                  <h4 className="text-xs font-bold uppercase tracking-wider text-din-muted mb-3 flex items-center gap-1.5">
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
                              <td className="py-2.5 px-4 text-right font-mono text-emerald-400">{formatCurrency(h.income)}</td>
                              <td className="py-2.5 px-4 text-right font-mono text-rose-400">{formatCurrency(h.expense)}</td>
                              <td className={`py-2.5 px-4 text-right font-mono font-bold ${bal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
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
                  <h4 className="text-xs font-bold uppercase tracking-wider text-din-muted mb-3 flex items-center gap-1.5">
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
                              <td className="py-2 px-4 text-din-muted font-mono">{d}</td>
                              <td className="py-2 px-4 font-semibold text-din-text max-w-[160px] truncate">{t.description}</td>
                              <td className="py-2 px-4 text-din-muted">{t.category?.name || 'Geral'}</td>
                              <td className="py-2 px-4 text-din-muted">{t.account?.name || '—'}</td>
                              <td className={`py-2 px-4 text-right font-mono font-bold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-din-muted mb-2 flex items-center gap-1.5">
                  <Minus className="w-3.5 h-3.5 text-din-primary" />
                  <span>Análise Executiva</span>
                </h4>
                <p className="text-xs text-din-muted leading-relaxed">
                  {netResult >= 0
                    ? `Em ${monthName} de ${year}, o resultado financeiro foi positivo com superávit de ${formatCurrency(netResult)}, representando uma taxa de poupança de ${savingsRate.toFixed(1)}% sobre as receitas totais.`
                    : `Em ${monthName} de ${year}, as despesas superaram as receitas em ${formatCurrency(Math.abs(netResult))}, configurando um déficit de ${Math.abs(savingsRate).toFixed(1)}% sobre as receitas.`
                  }
                  {expenseCategories.length > 0 && ` A principal categoria de gasto foi ${expenseCategories[0].name} (${formatCurrency(expenseCategories[0].amount)}).`}
                  {` Saldo total consolidado: ${formatCurrency(totalBalance)}.`}
                </p>
              </div>

              {/* ── Rodapé do Relatório ── */}
              <div className="pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between text-[10px] text-din-subtle gap-1.5">
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
