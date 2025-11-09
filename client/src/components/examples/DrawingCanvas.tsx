import { useState } from 'react';
import DrawingCanvas from '../DrawingCanvas';

export default function DrawingCanvasExample() {
  const [tool] = useState<'brush' | 'eraser'>('brush');
  const [color] = useState('#3B82F6');
  const [strokeWidth] = useState(3);

  return (
    <div className="w-full h-screen bg-background p-4">
      <DrawingCanvas 
        tool={tool}
        color={color}
        strokeWidth={strokeWidth}
        onDrawStart={() => console.log('Drawing started')}
        onDrawEnd={() => console.log('Drawing ended')}
      />
    </div>
  );
}
