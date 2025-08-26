import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function ProcessingQueue() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Processing queue</CardTitle>
			</CardHeader>
			<CardContent className="text-sm text-white/60">
				No active processing jobs.
			</CardContent>
		</Card>
	);
}
