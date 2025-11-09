import { z } from "zod";

// Drawing operation types
export const drawingOperationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['stroke', 'erase']),
  points: z.array(z.object({
    x: z.number(),
    y: z.number()
  })),
  color: z.string(),
  width: z.number(),
  timestamp: z.number()
});

export type DrawingOperation = z.infer<typeof drawingOperationSchema>;

// User cursor position
export const cursorPositionSchema = z.object({
  userId: z.string(),
  x: z.number(),
  y: z.number(),
  timestamp: z.number()
});

export type CursorPosition = z.infer<typeof cursorPositionSchema>;

// Room user info
export const roomUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  isDrawing: z.boolean(),
  joinedAt: z.number()
});

export type RoomUser = z.infer<typeof roomUserSchema>;

// WebSocket message types
export const wsMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('draw:start'),
    userId: z.string(),
    operationId: z.string()
  }),
  z.object({
    type: z.literal('draw:stroke'),
    operation: drawingOperationSchema
  }),
  z.object({
    type: z.literal('draw:end'),
    userId: z.string(),
    operation: drawingOperationSchema
  }),
  z.object({
    type: z.literal('cursor:move'),
    position: cursorPositionSchema
  }),
  z.object({
    type: z.literal('operation:undo'),
    operationId: z.string(),
    userId: z.string()
  }),
  z.object({
    type: z.literal('operation:redo'),
    operationId: z.string(),
    userId: z.string()
  }),
  z.object({
    type: z.literal('user:joined'),
    user: roomUserSchema
  }),
  z.object({
    type: z.literal('user:left'),
    userId: z.string()
  }),
  z.object({
    type: z.literal('room:sync'),
    operations: z.array(drawingOperationSchema),
    users: z.array(roomUserSchema)
  })
]);

export type WSMessage = z.infer<typeof wsMessageSchema>;

// User color palette for assignment
export const USER_COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#A855F7', // violet
  '#14B8A6', // teal
  '#F43F5E'  // rose
];
