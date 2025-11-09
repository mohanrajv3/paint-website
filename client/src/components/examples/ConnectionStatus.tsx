import { useState } from 'react';
import ConnectionStatus, { ConnectionState } from '../ConnectionStatus';
import { Button } from '@/components/ui/button';

export default function ConnectionStatusExample() {
  const [status, setStatus] = useState<ConnectionState>('connected');
  const [latency, setLatency] = useState(42);

  const cycleStatus = () => {
    setStatus((current) => {
      if (current === 'connected') return 'connecting';
      if (current === 'connecting') return 'disconnected';
      return 'connected';
    });
    setLatency(Math.floor(Math.random() * 100) + 20);
  };

  return (
    <div className="w-full min-h-screen bg-background p-4 flex flex-col items-center justify-center gap-4">
      <ConnectionStatus status={status} latency={latency} />
      <Button onClick={cycleStatus} variant="outline" size="sm">
        Cycle Status
      </Button>
    </div>
  );
}
