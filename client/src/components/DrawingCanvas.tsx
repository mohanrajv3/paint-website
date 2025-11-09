import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface DrawingCanvasProps {
  tool: 'brush' | 'eraser';
  color: string;
  strokeWidth: number;
  className?: string;
  onDrawStart?: () => void;
  onDrawEnd?: () => void;
}

export default function DrawingCanvas({
  tool,
  color,
  strokeWidth,
  className,
  onDrawStart,
  onDrawEnd
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    setContext(ctx);

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;
    setIsDrawing(true);
    onDrawStart?.();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
    context.lineCap = 'round';
    context.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
      context.lineWidth = strokeWidth * 2;
    } else {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = color;
      context.lineWidth = strokeWidth;
    }

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    onDrawEnd?.();
    context?.closePath();
  };

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
