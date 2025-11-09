import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface User {
  id: string;
  name: string;
  color: string;
  isDrawing: boolean;
}

interface UserPresenceProps {
  users: User[];
  currentUserId?: string;
}

export default function UserPresence({ users, currentUserId }: UserPresenceProps) {
  return (
    <div className="glass-panel rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Online Users</p>
        <Badge variant="secondary" data-testid="badge-user-count" className="font-mono text-xs">
          {users.length}
        </Badge>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {users.map((user) => (
          <div
            key={user.id}
            data-testid={`user-card-${user.id}`}
            className="flex items-center gap-3 p-2 rounded-md hover-elevate"
          >
            <div className="relative">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: user.color }}
              />
              {user.isDrawing && (
                <div
                  className="absolute inset-0 w-2 h-2 rounded-full pulse-ring"
                  style={{ backgroundColor: user.color }}
                />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm truncate",
                user.id === currentUserId && "font-semibold"
              )}>
                {user.name} {user.id === currentUserId && '(You)'}
              </p>
            </div>

            {user.isDrawing && (
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ borderColor: user.color, color: user.color }}
              >
                drawing
              </Badge>
            )}
          </div>
        ))}

        {users.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No users online
          </p>
        )}
      </div>
    </div>
  );
}
