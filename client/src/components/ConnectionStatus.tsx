import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConnectionState = 'connected' | 'connecting' | 'disconnected';

interface ConnectionStatusProps {
  status: ConnectionState;
  latency?: number;
}

export default function ConnectionStatus({ status, latency }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="w-3 h-3" />,
          text: 'Connected',
          variant: 'default' as const,
          className: 'bg-chart-3 hover:bg-chart-3 text-white'
        };
      case 'connecting':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          text: 'Connecting',
          variant: 'secondary' as const,
          className: 'bg-chart-4 hover:bg-chart-4 text-white'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="w-3 h-3" />,
          text: 'Disconnected',
          variant: 'destructive' as const,
          className: ''
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="glass-panel rounded-lg p-3 flex items-center gap-3">
      <Badge 
        variant={config.variant}
        data-testid={`badge-status-${status}`}
        className={cn('gap-1.5', config.className)}
      >
        {config.icon}
        <span className="text-xs font-medium">{config.text}</span>
      </Badge>

      {status === 'connected' && latency !== undefined && (
        <span className="text-xs text-muted-foreground font-mono" data-testid="text-latency">
          {latency}ms
        </span>
      )}
    </div>
  );
}
