import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { MonthlyHistoryItem } from '../../api/transactions';

interface MonthlyComparisonChartProps {
  data: MonthlyHistoryItem[];
  isLoading: boolean;
}

export function MonthlyComparisonChart({ data, isLoading }: MonthlyComparisonChartProps) {
  const { maskValue, isPrivate } = usePrivacy();

  if (isLoading) {
    return (
      <Card className="h-[380px] flex items-center justify-center animate-pulse">
        <div className="w-full h-full bg-slate-900/40 rounded-xl" />
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
      const expense = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
      const balance = income - expense;

      return (
        <div className="bg-[#0b1120] border border-slate-700/80 p-3.5 rounded-xl shadow-2xl backdrop-blur-md min-w-[160px]">
          <p className="text-xs font-bold text-slate-300 pb-1.5 border-b border-slate-800">
            {label}
          </p>
          <div className="space-y-1 mt-2 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="text-emerald-400 font-medium">Receitas:</span>
              <span className="font-semibold text-white font-mono">{maskValue(income)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-rose-400 font-medium">Despesas:</span>
              <span className="font-semibold text-white font-mono">{maskValue(expense)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800 text-slate-300 font-bold">
              <span>Saldo:</span>
              <span className={`font-mono ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {maskValue(balance)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col h-[380px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Comparativo Mensal</h3>
          <p className="text-xs text-slate-400">Receitas vs Despesas nos últimos 6 meses</p>
        </div>
      </div>

      <div className="flex-1 w-full mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `R$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
              formatter={(value) => (value === 'income' ? 'Receitas' : 'Despesas')}
            />
            <Bar
              dataKey="income"
              name="income"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="expense"
              name="expense"
              fill="#f43f5e"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
