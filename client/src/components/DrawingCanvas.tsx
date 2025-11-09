import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { DrawingEngine, Point } from '@/lib/drawingEngine';
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
  onRemoteOperation?: (operation: DrawingOperation) => void;
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
  onRemoteOperation,
  onCursorMove,
  engine: externalEngine,
  onEngineReady
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<DrawingEngine | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentOperationId = useRef<string | null>(null);
  const throttleTimer = useRef<number | null>(null);

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

  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
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
    
    onDrawStart?.(currentOperationId.current);
  }, [engine, getCanvasCoordinates, onDrawStart]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !engine || !currentOperationId.current) return;

    const { x, y } = getCanvasCoordinates(e);
    engine.addPoint(x, y);

    // Create operation for current stroke state
    const operation: DrawingOperation = {
      id: currentOperationId.current,
      userId: 'local', // Will be set by WebSocket client
      type: tool === 'eraser' ? 'erase' : 'stroke',
      points: engine.endPath(),
      color,
      width: strokeWidth,
      timestamp: Date.now()
    };

    // Draw locally
    engine.drawOperation(operation, true);
    
    // Restart path for continuous drawing
    engine.startPath(x, y);

    // Throttle stroke events to reduce network traffic
    if (throttleTimer.current) {
      clearTimeout(throttleTimer.current);
    }
    
    throttleTimer.current = window.setTimeout(() => {
      onDrawStroke?.(operation);
    }, 16); // ~60fps throttle

    // Handle cursor movement
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

      engine.addOperationToHistory(operation);
      onDrawEnd?.(operation);
    }

    setIsDrawing(false);
    currentOperationId.current = null;
  }, [isDrawing, engine, tool, color, strokeWidth, onDrawEnd]);

  // Handle remote operations
  useEffect(() => {
    if (onRemoteOperation && engine) {
      // This effect is handled by parent component
    }
  }, [onRemoteOperation, engine]);

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
