import { Brush, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  selectedTool: 'brush' | 'eraser';
  onToolChange: (tool: 'brush' | 'eraser') => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
}

const COLORS = [
  '#000000', '#FFFFFF', '#3B82F6', '#8B5CF6',
  '#10B981', '#F59E0B', '#EF4444', '#EC4899',
  '#06B6D4', '#84CC16', '#F97316', '#A855F7'
];

export default function Toolbar({
  selectedTool,
  onToolChange,
  selectedColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange
}: ToolbarProps) {
  return (
    <div className="glass-panel rounded-lg p-4 space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Tools</p>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant={selectedTool === 'brush' ? 'default' : 'outline'}
            onClick={() => onToolChange('brush')}
            data-testid="button-tool-brush"
            className={cn(selectedTool === 'brush' && 'bg-primary')}
          >
            <Brush className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant={selectedTool === 'eraser' ? 'default' : 'outline'}
            onClick={() => onToolChange('eraser')}
            data-testid="button-tool-eraser"
            className={cn(selectedTool === 'eraser' && 'bg-primary')}
          >
            <Eraser className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Color</p>
        <div className="grid grid-cols-4 gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              data-testid={`button-color-${color}`}
              onClick={() => onColorChange(color)}
              className={cn(
                'w-8 h-8 rounded-full border-2 transition-all hover-elevate active-elevate-2',
                selectedColor === color 
                  ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background' 
                  : 'border-border'
              )}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Stroke Width</p>
          <span className="text-xs text-muted-foreground font-mono" data-testid="text-stroke-width">
            {strokeWidth}px
          </span>
        </div>
        <Slider
          value={[strokeWidth]}
          onValueChange={([value]) => onStrokeWidthChange(value)}
          min={1}
          max={20}
          step={1}
          data-testid="slider-stroke-width"
          className="w-full"
        />
        <div 
          className="mx-auto rounded-full bg-foreground"
          style={{ 
            width: `${strokeWidth}px`, 
            height: `${strokeWidth}px`,
            maxWidth: '20px',
            maxHeight: '20px'
          }}
        />
      </div>
    </div>
  );
}
