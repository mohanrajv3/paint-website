import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { 
  type DrawingOperation, 
  type RoomUser, 
  type CursorPosition,
  USER_COLORS,
  wsMessageSchema 
} from "@shared/schema";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Track user color assignments per room
  const roomColorAssignments = new Map<string, Set<string>>();

  function assignUserColor(roomId: string): string {
    if (!roomColorAssignments.has(roomId)) {
      roomColorAssignments.set(roomId, new Set());
    }
    
    const usedColors = roomColorAssignments.get(roomId)!;
    
    // Find first available color
    const availableColor = USER_COLORS.find(color => !usedColors.has(color));
    const color = availableColor || USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
    
    usedColors.add(color);
    return color;
  }

  function releaseUserColor(roomId: string, color: string) {
    const usedColors = roomColorAssignments.get(roomId);
    if (usedColors) {
      usedColors.delete(color);
      if (usedColors.size === 0) {
        roomColorAssignments.delete(roomId);
      }
    }
  }

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    let currentRoomId: string | null = null;
    let currentUser: RoomUser | null = null;

    // Join room
    socket.on("room:join", async (data: { roomId: string; userName?: string }) => {
      try {
        const { roomId, userName = `User ${socket.id.slice(0, 4)}` } = data;
        
        // Leave previous room if any
        if (currentRoomId && currentUser) {
          await handleLeaveRoom();
        }

        currentRoomId = roomId;
        const userColor = assignUserColor(roomId);
        
        currentUser = {
          id: socket.id,
          name: userName,
          color: userColor,
          isDrawing: false,
          joinedAt: Date.now()
        };

        await storage.addUserToRoom(roomId, currentUser);
        socket.join(roomId);

        // Send current state to joining user
        const operations = await storage.getOperations(roomId);
        const users = await storage.getUsersInRoom(roomId);
        
        socket.emit("room:joined", {
          userId: socket.id,
          user: currentUser,
          operations,
          users
        });

        // Notify others about new user
        socket.to(roomId).emit("user:joined", { user: currentUser });
        
        console.log(`User ${socket.id} joined room ${roomId}`);
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Handle drawing start
    socket.on("draw:start", async (data: { operationId: string }) => {
      if (!currentRoomId || !currentUser) return;
      
      try {
        await storage.updateUserDrawingState(currentRoomId, socket.id, true);
        socket.to(currentRoomId).emit("draw:start", {
          userId: socket.id,
          operationId: data.operationId
        });
      } catch (error) {
        console.error("Error on draw start:", error);
      }
    });

    // Handle drawing stroke
    socket.on("draw:stroke", async (data: { operation: DrawingOperation }) => {
      if (!currentRoomId) return;
      
      try {
        const operation = data.operation;
        await storage.addOperation(currentRoomId, operation);
        
        // Broadcast to others in room
        socket.to(currentRoomId).emit("draw:stroke", { operation });
      } catch (error) {
        console.error("Error on draw stroke:", error);
      }
    });

    // Handle drawing end
    socket.on("draw:end", async (data: { operation: DrawingOperation }) => {
      if (!currentRoomId || !currentUser) return;
      
      try {
        await storage.updateUserDrawingState(currentRoomId, socket.id, false);
        socket.to(currentRoomId).emit("draw:end", {
          userId: socket.id,
          operation: data.operation
        });
      } catch (error) {
        console.error("Error on draw end:", error);
      }
    });

    // Handle cursor movement
    socket.on("cursor:move", async (data: { position: CursorPosition }) => {
      if (!currentRoomId) return;
      
      socket.to(currentRoomId).emit("cursor:move", { 
        position: { ...data.position, userId: socket.id }
      });
    });

    // Handle undo
    socket.on("operation:undo", async (data: { operationId: string }) => {
      if (!currentRoomId) return;
      
      try {
        await storage.removeOperation(currentRoomId, data.operationId);
        
        // Broadcast undo to all users in room
        io.to(currentRoomId).emit("operation:undo", {
          operationId: data.operationId,
          userId: socket.id
        });
      } catch (error) {
        console.error("Error on undo:", error);
      }
    });

    // Handle redo
    socket.on("operation:redo", async (data: { operation: DrawingOperation }) => {
      if (!currentRoomId) return;
      
      try {
        await storage.addOperation(currentRoomId, data.operation);
        
        // Broadcast redo to all users in room
        io.to(currentRoomId).emit("operation:redo", {
          operation: data.operation,
          userId: socket.id
        });
      } catch (error) {
        console.error("Error on redo:", error);
      }
    });

    // Handle leave room
    async function handleLeaveRoom() {
      if (!currentRoomId || !currentUser) return;
      
      try {
        await storage.removeUserFromRoom(currentRoomId, socket.id);
        releaseUserColor(currentRoomId, currentUser.color);
        
        socket.to(currentRoomId).emit("user:left", { userId: socket.id });
        socket.leave(currentRoomId);
        
        console.log(`User ${socket.id} left room ${currentRoomId}`);
        currentRoomId = null;
        currentUser = null;
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    }

    socket.on("room:leave", handleLeaveRoom);

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.id}`);
      await handleLeaveRoom();
    });
  });

  return httpServer;
}
