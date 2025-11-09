import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { DrawingEngine } from '@/lib/drawingEngine';
import { type DrawingOperation } from '@shared/schema';
import { nanoid } from 'nanoid';

interface DrawingCanvasProps {
  tool: 'brush' | 'eraser';
  color: string;
  strokeWidth: number;
  className?: string;
  onDrawStart?: (operationId: string) => void;
  onDrawStroke?: (operation: DrawingOperation) => void;
  onDrawEnd?: (operation: DrawingOperation) => void;
  onCursorMove?: (x: number, y: number) => void;
  engine?: DrawingEngine | null;
  onEngineReady?: (engine: DrawingEngine) => void;
}

export default function DrawingCanvas({
  tool,
  color,
  strokeWidth,
  className,
  onDrawStart,
  onDrawStroke,
  onDrawEnd,
  onCursorMove,
  engine: externalEngine,
  onEngineReady
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<DrawingEngine | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentOperationId = useRef<string | null>(null);
  const strokeBatchTimer = useRef<number | null>(null);
  const lastBroadcastTime = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const drawEngine = externalEngine || new DrawingEngine(canvas);
    setEngine(drawEngine);
    onEngineReady?.(drawEngine);

    const handleResize = () => {
      drawEngine.resize(canvas);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [externalEngine, onEngineReady]);

  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engine) return;
    
    const { x, y } = getCanvasCoordinates(e);
    
    currentOperationId.current = nanoid();
    engine.startPath(x, y);
    setIsDrawing(true);
    lastBroadcastTime.current = 0;
    
    onDrawStart?.(currentOperationId.current);
  }, [engine, getCanvasCoordinates, onDrawStart]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !engine || !currentOperationId.current) return;

    const { x, y } = getCanvasCoordinates(e);
    engine.addPoint(x, y);

    // Draw preview locally (without adding to history yet)
    const previewOp: DrawingOperation = {
      id: currentOperationId.current,
      userId: 'local',
      type: tool === 'eraser' ? 'erase' : 'stroke',
      points: engine.getCurrentPath(),
      color,
      width: strokeWidth,
      timestamp: Date.now()
    };

    engine.drawPreview(previewOp);

    // Throttle network broadcasts to ~60fps (16ms)
    const now = Date.now();
    if (now - lastBroadcastTime.current >= 16) {
      lastBroadcastTime.current = now;
      
      if (strokeBatchTimer.current) {
        clearTimeout(strokeBatchTimer.current);
      }
      
      strokeBatchTimer.current = window.setTimeout(() => {
        onDrawStroke?.(previewOp);
      }, 16);
    }

    // Update cursor position
    onCursorMove?.(x, y);
  }, [isDrawing, engine, tool, color, strokeWidth, getCanvasCoordinates, onDrawStroke, onCursorMove]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing || !engine || !currentOperationId.current) return;

    const points = engine.endPath();
    
    if (points.length > 0) {
      const operation: DrawingOperation = {
        id: currentOperationId.current,
        userId: 'local',
        type: tool === 'eraser' ? 'erase' : 'stroke',
        points,
        color,
        width: strokeWidth,
        timestamp: Date.now()
      };

      // Add to local history
      engine.addOperationToHistory(operation);
      
      // Broadcast final operation
      onDrawEnd?.(operation);
    }

    setIsDrawing(false);
    currentOperationId.current = null;
    
    if (strokeBatchTimer.current) {
      clearTimeout(strokeBatchTimer.current);
      strokeBatchTimer.current = null;
    }
  }, [isDrawing, engine, tool, color, strokeWidth, onDrawEnd]);

  const cursorClass = tool === 'eraser' ? 'cursor-eraser' : 'cursor-crosshair';

  return (
    <canvas
      ref={canvasRef}
      data-testid="canvas-drawing"
      className={cn('w-full h-full bg-white rounded-md', cursorClass, className)}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
}
