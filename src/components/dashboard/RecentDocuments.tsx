import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, THead, TBody, Tr, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function RecentDocuments() {
  const { data, isLoading, error } = useSWR('/api/files', fetcher, { revalidateOnFocus: true });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent documents</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
        )}
        {!isLoading && error && <div className="text-red-300">Failed to load documents.</div>}
        {!isLoading && !error && (
          <Table>
            <THead>
              <Tr>
                <Th>Name</Th>
                <Th>Status</Th>
                <Th>Size</Th>
                <Th>Uploaded</Th>
                <Th></Th>
              </Tr>
            </THead>
            <TBody>
              {data?.files?.slice(0, 6).map((f: any) => (
                <Tr key={f.id}>
                  <Td className="text-white">{f.file_name}</Td>
                  <Td>
                    <Badge color={f.status === 'processed' ? 'green' : f.status === 'processing' ? 'yellow' : 'gray'}>
                      {f.status}
                    </Badge>
                  </Td>
                  <Td>{(f.file_size / (1024 * 1024)).toFixed(2)} MB</Td>
                  <Td>{new Date(f.created_at).toLocaleString()}</Td>
                  <Td className="text-right">
                    <Link href="/dashboard/documents" className="text-fuchsia-300 hover:underline">
                      Open
                    </Link>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
