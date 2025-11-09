import { io, Socket } from 'socket.io-client';
import { type DrawingOperation, type RoomUser, type CursorPosition } from '@shared/schema';

export type ConnectionState = 'connected' | 'connecting' | 'disconnected';

interface WebSocketClientEvents {
  onConnectionChange: (state: ConnectionState) => void;
  onRoomJoined: (data: { userId: string; user: RoomUser; operations: DrawingOperation[]; users: RoomUser[] }) => void;
  onUserJoined: (user: RoomUser) => void;
  onUserLeft: (userId: string) => void;
  onDrawStart: (data: { userId: string; operationId: string }) => void;
  onDrawStroke: (operation: DrawingOperation) => void;
  onDrawEnd: (data: { userId: string; operation: DrawingOperation }) => void;
  onCursorMove: (position: CursorPosition) => void;
  onUndo: (data: { operationId: string; userId: string }) => void;
  onRedo: (data: { operation: DrawingOperation; userId: string }) => void;
  onError: (error: string) => void;
}

export class WebSocketClient {
  private socket: Socket | null = null;
  private events: Partial<WebSocketClientEvents> = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private currentRoomId: string | null = null;

  constructor() {
    this.connect();
  }

  private connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.events.onConnectionChange?.('connected');
      
      // Rejoin room if we were in one
      if (this.currentRoomId) {
        this.joinRoom(this.currentRoomId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.events.onConnectionChange?.('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.events.onConnectionChange?.('disconnected');
        this.events.onError?.('Failed to connect to server');
      } else {
        this.events.onConnectionChange?.('connecting');
      }
    });

    this.socket.on('room:joined', (data) => {
      console.log('Joined room:', data);
      this.events.onRoomJoined?.(data);
    });

    this.socket.on('user:joined', (data) => {
      console.log('User joined:', data.user);
      this.events.onUserJoined?.(data.user);
    });

    this.socket.on('user:left', (data) => {
      console.log('User left:', data.userId);
      this.events.onUserLeft?.(data.userId);
    });

    this.socket.on('draw:start', (data) => {
      this.events.onDrawStart?.(data);
    });

    this.socket.on('draw:stroke', (data) => {
      this.events.onDrawStroke?.(data.operation);
    });

    this.socket.on('draw:end', (data) => {
      this.events.onDrawEnd?.(data);
    });

    this.socket.on('cursor:move', (data) => {
      this.events.onCursorMove?.(data.position);
    });

    this.socket.on('operation:undo', (data) => {
      this.events.onUndo?.(data);
    });

    this.socket.on('operation:redo', (data) => {
      this.events.onRedo?.(data);
    });

    this.socket.on('error', (data) => {
      console.error('Server error:', data);
      this.events.onError?.(data.message);
    });
  }

  on<K extends keyof WebSocketClientEvents>(
    event: K,
    handler: WebSocketClientEvents[K]
  ) {
    this.events[event] = handler;
  }

  joinRoom(roomId: string, userName?: string) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, will join room after connection');
      this.currentRoomId = roomId;
      return;
    }

    this.currentRoomId = roomId;
    this.socket.emit('room:join', { roomId, userName });
  }

  leaveRoom() {
    if (this.socket?.connected && this.currentRoomId) {
      this.socket.emit('room:leave');
      this.currentRoomId = null;
    }
  }

  emitDrawStart(operationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('draw:start', { operationId });
    }
  }

  emitDrawStroke(operation: DrawingOperation) {
    if (this.socket?.connected) {
      this.socket.emit('draw:stroke', { operation });
    }
  }

  emitDrawEnd(operation: DrawingOperation) {
    if (this.socket?.connected) {
      this.socket.emit('draw:end', { operation });
    }
  }

  emitCursorMove(position: Omit<CursorPosition, 'userId'>) {
    if (this.socket?.connected) {
      this.socket.emit('cursor:move', { position });
    }
  }

  emitUndo(operationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('operation:undo', { operationId });
    }
  }

  emitRedo(operation: DrawingOperation) {
    if (this.socket?.connected) {
      this.socket.emit('operation:redo', { operation });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getLatency(): number {
    // Simple ping-based latency estimation
    return Math.floor(Math.random() * 50) + 20; // Placeholder
  }

  disconnect() {
    this.leaveRoom();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
