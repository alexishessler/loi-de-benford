'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { BenfordResult } from '@/lib/benford';

type Props = {
  result: BenfordResult;
};

export default function BenfordChart({ result }: Props) {
  const data = Array.from({ length: 9 }, (_, i) => ({
    digit: String(i + 1),
    'Benford (attendu)': result.expected[i],
    'Vos données': result.observed[i],
  }));

  return (
    <div className="card-elevated p-4 sm:p-6 animate-fade-in-up">
      <h3 className="text-sm font-bold text-[var(--text)] mb-1">
        Distribution des premiers chiffres
      </h3>
      <p className="text-[11px] text-[var(--text-tertiary)] mb-4">
        Comparaison entre la loi de Benford th&eacute;orique et vos donn&eacute;es
      </p>

      <div className="w-full h-[300px] sm:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            barGap={2}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="digit"
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
              domain={[0, 35]}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-md)',
                fontSize: '12px',
              }}
              formatter={(value: unknown) => [`${Number(value).toFixed(2)}%`]}
              labelFormatter={(label: unknown) => `Chiffre ${label}`}
            />
            <Legend
              iconType="square"
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            />
            <Bar
              dataKey="Benford (attendu)"
              fill="var(--french-blue)"
              opacity={0.35}
              radius={[4, 4, 0, 0]}
              animationDuration={800}
              animationBegin={0}
            />
            <Bar
              dataKey="Vos données"
              fill="var(--french-red)"
              opacity={0.85}
              radius={[4, 4, 0, 0]}
              animationDuration={800}
              animationBegin={200}
            />
            <ReferenceLine y={0} stroke="var(--border)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Digit counts */}
      <div className="mt-4 flex justify-center gap-1">
        {result.digitCounts.map((count, i) => (
          <div key={i} className="text-center px-2">
            <div className="text-[10px] font-bold text-[var(--french-red)]">{count}</div>
            <div className="text-[9px] text-[var(--text-tertiary)]">{i + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
