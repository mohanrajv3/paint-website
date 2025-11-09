import { Palette } from 'lucide-react';

interface AppHeaderProps {
  roomId?: string;
}

export default function AppHeader({ roomId }: AppHeaderProps) {
  return (
    <div className="glass-panel rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Palette className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold" data-testid="text-app-title">
            CollabCanvas
          </h1>
        </div>
        
        {roomId && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>Room:</span>
            <code className="px-2 py-1 rounded bg-muted" data-testid="text-room-id">
              {roomId}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
