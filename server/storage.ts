import { type DrawingOperation, type RoomUser } from "@shared/schema";

export interface IStorage {
  // Room operations
  addOperation(roomId: string, operation: DrawingOperation): Promise<void>;
  getOperations(roomId: string): Promise<DrawingOperation[]>;
  removeOperation(roomId: string, operationId: string): Promise<void>;
  clearRoom(roomId: string): Promise<void>;
  
  // User management
  addUserToRoom(roomId: string, user: RoomUser): Promise<void>;
  removeUserFromRoom(roomId: string, userId: string): Promise<void>;
  getUsersInRoom(roomId: string): Promise<RoomUser[]>;
  updateUserDrawingState(roomId: string, userId: string, isDrawing: boolean): Promise<void>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, {
    operations: DrawingOperation[];
    users: Map<string, RoomUser>;
  }>;

  constructor() {
    this.rooms = new Map();
  }

  private ensureRoom(roomId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        operations: [],
        users: new Map()
      });
    }
  }

  async addOperation(roomId: string, operation: DrawingOperation): Promise<void> {
    this.ensureRoom(roomId);
    const room = this.rooms.get(roomId)!;
    room.operations.push(operation);
  }

  async getOperations(roomId: string): Promise<DrawingOperation[]> {
    this.ensureRoom(roomId);
    return [...(this.rooms.get(roomId)?.operations || [])];
  }

  async removeOperation(roomId: string, operationId: string): Promise<void> {
    this.ensureRoom(roomId);
    const room = this.rooms.get(roomId)!;
    room.operations = room.operations.filter(op => op.id !== operationId);
  }

  async clearRoom(roomId: string): Promise<void> {
    if (this.rooms.has(roomId)) {
      this.rooms.delete(roomId);
    }
  }

  async addUserToRoom(roomId: string, user: RoomUser): Promise<void> {
    this.ensureRoom(roomId);
    const room = this.rooms.get(roomId)!;
    room.users.set(user.id, user);
  }

  async removeUserFromRoom(roomId: string, userId: string): Promise<void> {
    const room = this.rooms.get(roomId);
    if (room) {
      room.users.delete(userId);
      
      // Clean up empty rooms after a delay
      if (room.users.size === 0) {
        setTimeout(() => {
          const currentRoom = this.rooms.get(roomId);
          if (currentRoom && currentRoom.users.size === 0) {
            this.rooms.delete(roomId);
          }
        }, 60000); // 1 minute cleanup delay
      }
    }
  }

  async getUsersInRoom(roomId: string): Promise<RoomUser[]> {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.users.values()) : [];
  }

  async updateUserDrawingState(roomId: string, userId: string, isDrawing: boolean): Promise<void> {
    const room = this.rooms.get(roomId);
    if (room) {
      const user = room.users.get(userId);
      if (user) {
        user.isDrawing = isDrawing;
        room.users.set(userId, user);
      }
    }
  }
}

export const storage = new MemStorage();
