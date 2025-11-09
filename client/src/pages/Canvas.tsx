import { useState } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import Toolbar from '@/components/Toolbar';
import UserPresence, { User } from '@/components/UserPresence';
import ConnectionStatus, { ConnectionState } from '@/components/ConnectionStatus';
import CanvasControls from '@/components/CanvasControls';
import AppHeader from '@/components/AppHeader';

export default function Canvas() {
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [color, setColor] = useState('#3B82F6');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [operationCount, setOperationCount] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo] = useState(false);
  
  const [connectionStatus] = useState<ConnectionState>('connected');
  const [latency] = useState(42);
  
  const [users] = useState<User[]>([
    { id: '1', name: 'You', color: '#3B82F6', isDrawing: false },
    { id: '2', name: 'Alice Chen', color: '#8B5CF6', isDrawing: false },
    { id: '3', name: 'Bob Smith', color: '#10B981', isDrawing: true },
  ]);

  const handleDrawStart = () => {
    console.log('Drawing started');
  };

  const handleDrawEnd = () => {
    setOperationCount(operationCount + 1);
    setCanUndo(true);
    console.log('Drawing ended');
  };

  const handleUndo = () => {
    if (canUndo) {
      console.log('Undo operation');
      setOperationCount(Math.max(0, operationCount - 1));
      if (operationCount <= 1) setCanUndo(false);
    }
  };

  const handleRedo = () => {
    console.log('Redo operation');
  };

  return (
    <div className="w-full h-screen bg-background flex flex-col overflow-hidden">
      <div className="p-4 pb-2">
        <AppHeader roomId="canvas-demo-001" />
      </div>

      <div className="flex-1 flex gap-4 p-4 pt-2 overflow-hidden">
        <div className="hidden md:block w-64 flex-shrink-0 space-y-4 overflow-y-auto">
          <Toolbar
            selectedTool={tool}
            onToolChange={setTool}
            selectedColor={color}
            onColorChange={setColor}
            strokeWidth={strokeWidth}
            onStrokeWidthChange={setStrokeWidth}
          />
        </div>

        <div className="flex-1 relative overflow-hidden rounded-lg">
          <DrawingCanvas
            tool={tool}
            color={color}
            strokeWidth={strokeWidth}
            onDrawStart={handleDrawStart}
            onDrawEnd={handleDrawEnd}
          />
        </div>

        <div className="hidden lg:block w-64 flex-shrink-0 space-y-4">
          <ConnectionStatus status={connectionStatus} latency={latency} />
          <UserPresence users={users} currentUserId="1" />
        </div>
      </div>

      <div className="p-4 pt-2 flex justify-between items-center">
        <div className="md:hidden">
          <Toolbar
            selectedTool={tool}
            onToolChange={setTool}
            selectedColor={color}
            onColorChange={setColor}
            strokeWidth={strokeWidth}
            onStrokeWidthChange={setStrokeWidth}
          />
        </div>
        
        <div className="ml-auto">
          <CanvasControls
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            operationCount={operationCount}
          />
        </div>
      </div>
    </div>
  );
}
