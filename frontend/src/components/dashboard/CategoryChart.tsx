import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';
import { CategoryBreakdownItem } from '../../api/transactions';
import { PieChart as PieIcon } from 'lucide-react';

interface CategoryChartProps {
  data: CategoryBreakdownItem[];
  isLoading: boolean;
}

export function CategoryChart({ data, isLoading }: CategoryChartProps) {
  if (isLoading) {
    return (
      <Card className="h-[380px] flex items-center justify-center animate-pulse">
        <div className="w-48 h-48 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin" />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-[380px] flex flex-col items-center justify-center text-center p-6">
        <div className="p-3 rounded-2xl bg-slate-800/80 text-slate-400 mb-3">
          <PieIcon className="w-8 h-8" />
        </div>
        <h4 className="text-base font-semibold text-slate-200">Sem despesas no período</h4>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Nenhuma despesa foi registrada no mês atual para compor o gráfico de categorias.
        </p>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as CategoryBreakdownItem;
      return (
        <div className="bg-[#0b1120] border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <p className="text-xs font-semibold text-slate-200">{item.name}</p>
          </div>
          <p className="text-sm font-bold text-white mt-1">{formatCurrency(item.amount)}</p>
          <p className="text-[11px] text-slate-400">{item.percentage}% do total de despesas</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col h-[380px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Despesas por Categoria</h3>
          <p className="text-xs text-slate-400">Distribuição percentual do mês atual</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
        {/* Gráfico Donut */}
        <div className="w-full md:w-1/2 h-[180px] md:h-[230px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || '#64748b'}
                    stroke="#0b1120"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda Customizada com barras de progresso */}
        <div className="w-full md:w-1/2 max-h-[220px] overflow-y-auto pr-1 space-y-2.5">
          {data.slice(0, 5).map((cat) => (
            <div key={cat.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
                <span className="text-slate-100 font-semibold">{formatCurrency(cat.amount)}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
