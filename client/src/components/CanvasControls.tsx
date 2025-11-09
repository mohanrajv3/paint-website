import { Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CanvasControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  operationCount?: number;
}

export default function CanvasControls({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  operationCount = 0
}: CanvasControlsProps) {
  return (
    <div className="glass-panel rounded-lg p-3 flex items-center gap-2">
      <Button
        size="icon"
        variant="outline"
        onClick={onUndo}
        disabled={!canUndo}
        data-testid="button-undo"
        className="relative"
      >
        <Undo className="w-4 h-4" />
      </Button>

      <Button
        size="icon"
        variant="outline"
        onClick={onRedo}
        disabled={!canRedo}
        data-testid="button-redo"
      >
        <Redo className="w-4 h-4" />
      </Button>

      {operationCount > 0 && (
        <Badge 
          variant="secondary" 
          className="ml-1 font-mono text-xs"
          data-testid="badge-operation-count"
        >
          {operationCount}
        </Badge>
      )}
    </div>
  );
}
