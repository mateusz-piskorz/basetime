import { getAllUsers } from '@/actions/example';
import { useQuery } from '@tanstack/react-query';

export function ClientComponent() {
    const {data} = useQuery({ queryKey: ['getAllUsers'], queryFn: getAllUsers })
  return (
    <div>
      
      <pre style={{ background: '#27272a', padding: '12px', borderRadius: '4px', border: '1px solid #333', fontSize: '14px', overflowX: 'auto', color: '#fff' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
