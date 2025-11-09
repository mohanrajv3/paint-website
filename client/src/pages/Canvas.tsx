import { useState, useEffect, useRef, useCallback } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import Toolbar from '@/components/Toolbar';
import UserPresence, { User } from '@/components/UserPresence';
import ConnectionStatus, { ConnectionState } from '@/components/ConnectionStatus';
import CanvasControls from '@/components/CanvasControls';
import AppHeader from '@/components/AppHeader';
import RemoteCursor from '@/components/RemoteCursor';
import { WebSocketClient } from '@/lib/websocketClient';
import { DrawingEngine } from '@/lib/drawingEngine';
import { type DrawingOperation, type RoomUser, type CursorPosition } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export default function Canvas() {
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [color, setColor] = useState('#3B82F6');
  const [strokeWidth, setStrokeWidth] = useState(3);
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>('connecting');
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [remoteCursors, setRemoteCursors] = useState<Map<string, CursorPosition>>(new Map());
  const [drawingUsers, setDrawingUsers] = useState<Set<string>>(new Set());
  
  const wsClient = useRef<WebSocketClient | null>(null);
  const drawingEngine = useRef<DrawingEngine | null>(null);
  const roomId = useRef('canvas-demo-001');
  const { toast } = useToast();

  // Initialize WebSocket client
  useEffect(() => {
    const client = new WebSocketClient();
    wsClient.current = client;

    client.on('onConnectionChange', (state) => {
      setConnectionStatus(state);
      if (state === 'connected') {
        toast({
          title: 'Connected',
          description: 'Successfully connected to the server',
        });
      } else if (state === 'disconnected') {
        toast({
          title: 'Disconnected',
          description: 'Lost connection to server',
          variant: 'destructive'
        });
      }
    });

    client.on('onRoomJoined', (data) => {
      console.log('Room joined:', data);
      setCurrentUserId(data.userId);
      setUsers(data.users);
      
      // Sync canvas with existing operations
      if (drawingEngine.current) {
        drawingEngine.current.syncOperations(data.operations);
      }

      toast({
        title: 'Room joined',
        description: `Welcome to room ${roomId.current}`,
      });
    });

    client.on('onUserJoined', (user) => {
      setUsers(prev => [...prev, user]);
      toast({
        title: 'User joined',
        description: `${user.name} joined the canvas`,
      });
    });

    client.on('onUserLeft', (userId) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
      setRemoteCursors(prev => {
        const newCursors = new Map(prev);
        newCursors.delete(userId);
        return newCursors;
      });
      setDrawingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    client.on('onDrawStart', (data) => {
      setDrawingUsers(prev => new Set(prev).add(data.userId));
    });

    client.on('onDrawStroke', (operation) => {
      if (drawingEngine.current) {
        drawingEngine.current.drawOperation(operation, true);
      }
    });

    client.on('onDrawEnd', (data) => {
      setDrawingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
      
      if (drawingEngine.current) {
        drawingEngine.current.addOperationToHistory(data.operation);
      }
    });

    client.on('onCursorMove', (position) => {
      setRemoteCursors(prev => new Map(prev).set(position.userId, position));
    });

    client.on('onUndo', (data) => {
      if (drawingEngine.current) {
        drawingEngine.current.removeOperation(data.operationId);
      }
    });

    client.on('onRedo', (data) => {
      if (drawingEngine.current) {
        drawingEngine.current.addOperationToHistory(data.operation);
        drawingEngine.current.drawOperation(data.operation, true);
      }
    });

    client.on('onError', (error) => {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive'
      });
    });

    // Join room after connection
    setTimeout(() => {
      client.joinRoom(roomId.current, `User ${Math.floor(Math.random() * 1000)}`);
    }, 500);

    return () => {
      client.disconnect();
    };
  }, [toast]);

  const handleDrawStart = useCallback((operationId: string) => {
    wsClient.current?.emitDrawStart(operationId);
  }, []);

  const handleDrawStroke = useCallback((operation: DrawingOperation) => {
    wsClient.current?.emitDrawStroke(operation);
  }, []);

  const handleDrawEnd = useCallback((operation: DrawingOperation) => {
    wsClient.current?.emitDrawEnd(operation);
  }, []);

  const handleCursorMove = useCallback((x: number, y: number) => {
    wsClient.current?.emitCursorMove({ x, y, timestamp: Date.now() });
  }, []);

  const handleUndo = useCallback(() => {
    if (drawingEngine.current?.canUndo()) {
      const operation = drawingEngine.current.undo();
      if (operation) {
        wsClient.current?.emitUndo(operation.id);
      }
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (drawingEngine.current?.canRedo()) {
      const operation = drawingEngine.current.redo();
      if (operation) {
        wsClient.current?.emitRedo(operation);
      }
    }
  }, []);

  const handleEngineReady = useCallback((engine: DrawingEngine) => {
    drawingEngine.current = engine;
  }, []);

  // Convert RoomUser to User for UserPresence component
  const presenceUsers: User[] = users.map(u => ({
    id: u.id,
    name: u.name,
    color: u.color,
    isDrawing: drawingUsers.has(u.id)
  }));

  return (
    <div className="w-full h-screen bg-background flex flex-col overflow-hidden">
      <div className="p-4 pb-2">
        <AppHeader roomId={roomId.current} />
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
            onDrawStroke={handleDrawStroke}
            onDrawEnd={handleDrawEnd}
            onCursorMove={handleCursorMove}
            onEngineReady={handleEngineReady}
          />
          
          {Array.from(remoteCursors.entries()).map(([userId, cursor]) => {
            const user = users.find(u => u.id === userId);
            if (!user || userId === currentUserId) return null;
            
            return (
              <RemoteCursor
                key={userId}
                userId={userId}
                userName={user.name}
                color={user.color}
                x={cursor.x}
                y={cursor.y}
                isDrawing={drawingUsers.has(userId)}
              />
            );
          })}
        </div>

        <div className="hidden lg:block w-64 flex-shrink-0 space-y-4">
          <ConnectionStatus 
            status={connectionStatus} 
            latency={wsClient.current?.getLatency()} 
          />
          <UserPresence users={presenceUsers} currentUserId={currentUserId || undefined} />
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
            canUndo={drawingEngine.current?.canUndo() || false}
            canRedo={drawingEngine.current?.canRedo() || false}
            operationCount={drawingEngine.current?.getOperationCount() || 0}
          />
        </div>
      </div>
    </div>
  );
}
