import { PieChart } from '@mui/x-charts/PieChart';

type ChartEntry = {
  name: string;
  value: number;
  color?: string;
};

const defaultData = [
  { name: 'Group A', value: 400, color: '#0088FE' },
  { name: 'Group B', value: 300, color: '#00C49F' },
  { name: 'Group C', value: 300, color: '#FFBB28' },
  { name: 'Group D', value: 200, color: '#FF8042' },
];

const settings = {
  margin: { right: 5 },
  width: 200,
  height: 200,
  hideLegend: true,
};

export default function Piechart({ data = defaultData }: { data?: ChartEntry[] }) {
  const chartData = (data.length ? data : defaultData).map(({ name, value, color }, index) => ({
    id: index,
    label: name,
    value,
    color: color ?? defaultData[index % defaultData.length].color,
  }));

  return (
    <PieChart
      series={[{ innerRadius: 50, outerRadius: 100, data: chartData, arcLabel: 'value' }]}
      {...settings}
    />
  );
}
