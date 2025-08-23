import { Card, CardContent } from '@/components/ui/Card';

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="group cursor-default">
      <CardContent className="flex items-center justify-between">
        <div className="transition-all duration-300 group-hover:translate-x-1">
          <div className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">{label}</div>
          <div className="mt-2 text-2xl font-semibold text-white transition-all duration-300 group-hover:brightness-110">{value}</div>
        </div>
        <div className="h-12 w-12 rounded-xl bg-white text-black grid place-items-center transition-all duration-300 group-hover:rotate-12 group-hover:shadow-lg group-hover:shadow-blue-400/30">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
