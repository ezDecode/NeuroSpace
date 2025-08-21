import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';

// TODO: Replace mock data with a live endpoint
const jobs = [
  { id: 'a', name: 'Quarterly_Report.pdf', step: 'Embedding', progress: 70 },
  { id: 'b', name: 'Notes.txt', step: 'Extracting', progress: 35 },
];

export default function ProcessingQueue() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs.map((j) => (
          <div key={j.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="text-white">{j.name}</div>
              <div className="text-white/60">{j.step}</div>
            </div>
            <Progress value={j.progress} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
