import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface PriceHistoryChartProps {
  dates: string[];
  prices: number[];
  bsr: number[];
  currency: string;
}

export default function PriceHistoryChart({ dates, prices, bsr, currency }: PriceHistoryChartProps) {
  if (!dates.length) return <div className="text-sm text-muted-foreground text-center py-8">No history data available</div>;

  const chartData = dates.map((date, i) => ({
    date,
    price: prices[i] != null ? Math.round(prices[i] * 100) / 100 : null,
    bsr: bsr[i] != null ? Math.round(bsr[i]) : null,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={v => v.slice(5)}
          interval={Math.floor(chartData.length / 6)}
        />
        <YAxis
          yAxisId="price"
          tick={{ fontSize: 10, fill: 'hsl(var(--primary))' }}
          tickFormatter={v => `${currency}${v}`}
          width={60}
        />
        <YAxis
          yAxisId="bsr"
          orientation="right"
          tick={{ fontSize: 10, fill: 'hsl(var(--accent))' }}
          tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          width={50}
          reversed
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            fontSize: '12px',
          }}
          formatter={(value: number, name: string) => [
            name === 'price' ? `${currency}${value.toFixed(2)}` : value.toLocaleString(),
            name === 'price' ? 'Price' : 'BSR',
          ]}
        />
        <Line yAxisId="price" type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
        <Line yAxisId="bsr" type="monotone" dataKey="bsr" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
