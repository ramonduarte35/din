import React, { useState, useEffect } from 'react';
import { Bill, fetchBillSummary } from '../../api/bills';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PayBillModal } from '../bills/PayBillModal';
import { BillsWidgetSkeleton } from '../ui/Skeleton';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { CalendarClock, AlertTriangle, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BillsWidget: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payingBill, setPayingBill] = useState<Bill | null>(null);
  const { maskValue } = usePrivacy();

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    try {
      const data = await fetchBillSummary();
      setSummary(data);
    } catch (err) {
      console.error('Erro ao carregar resumo de contas a pagar:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <BillsWidgetSkeleton />;
  }

  const overdueCount = summary?.total_overdue?.count || 0;
  const overdueAmount = summary?.total_overdue?.amount || 0;
  const upcomingBills: Bill[] = summary?.upcoming_bills || [];

  return (
    <>
      <Card className="p-4 sm:p-5 border-slate-700/60 bg-gradient-to-br from-[#0c1322] via-[#0b1220] to-[#080e1b] backdrop-blur-md shadow-xl animate-fade-in">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Contas a Vencer</h3>
              <p className="text-xs text-slate-400">Próximos compromissos e boletos</p>
            </div>
          </div>
          <Link
            to="/bills"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1 transition-colors min-h-[44px] sm:min-h-0 py-1 px-2"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Alerta de Contas Vencidas se houver */}
        {overdueCount > 0 && (
          <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center space-x-2 text-red-400 min-w-0 pr-2">
              <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse text-red-400" />
              <span className="truncate">
                <strong>{overdueCount} {overdueCount === 1 ? 'conta atrasada' : 'contas atrasadas'}</strong> ({maskValue(overdueAmount)})
              </span>
            </div>
            <Link
              to="/bills"
              className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors min-h-[36px] flex items-center"
            >
              Resolver
            </Link>
          </div>
        )}

        {/* Lista de Contas que Vencem nos Próximos 7 Dias */}
        {upcomingBills.length === 0 ? (
          <div className="p-4 text-center rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <CheckCircle2 className="w-6 h-6 text-emerald-400/80 mx-auto mb-1.5" />
            <p className="text-xs text-slate-200 font-semibold">Tudo em dia para os próximos 7 dias!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Nenhuma conta pendente prestes a vencer.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcomingBills.slice(0, 3).map((bill) => {
              const dueDate = new Date(bill.due_date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              dueDate.setHours(0, 0, 0, 0);
              const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

              let badgeText = '';
              let badgeColor = '';
              if (diffDays === 0) {
                badgeText = 'Vence Hoje!';
                badgeColor = 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse font-bold';
              } else if (diffDays === 1) {
                badgeText = 'Vence Amanhã';
                badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30 font-medium';
              } else {
                badgeText = `Em ${diffDays} dias`;
                badgeColor = 'bg-slate-800/80 text-slate-300 border-slate-700/60 font-medium';
              }

              return (
                <div
                  key={bill.id}
                  className="p-3 bg-slate-900/60 hover:bg-slate-850 border border-slate-800/80 rounded-2xl flex items-center justify-between transition-all duration-200 shadow-sm"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs sm:text-sm text-white truncate max-w-[140px] sm:max-w-[200px]">
                        {bill.description}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border ${badgeColor}`}>
                        {badgeText}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-emerald-400 mt-0.5 font-mono">
                      {maskValue(bill.amount)}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => setPayingBill(bill)}
                    className="shrink-0 text-xs py-1.5 px-3 min-h-[44px] sm:min-h-[36px] bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1 font-bold"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Pagar</span>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal de Pagamento Rápido */}
      <PayBillModal
        isOpen={Boolean(payingBill)}
        onClose={() => setPayingBill(null)}
        onSuccess={() => {
          setPayingBill(null);
          loadSummary();
        }}
        bill={payingBill}
      />
    </>
  );
};
