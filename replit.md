# CollabCanvas - Real-Time Collaborative Drawing Application

## Overview

CollabCanvas is a real-time multi-user collaborative drawing application that enables multiple users to draw simultaneously on a shared canvas with instant synchronization. The application features a premium, vibrant interface inspired by creative tools like Figma, Miro, and Procreate, emphasizing smooth user experience and visual appeal.

**Core Functionality:**
- Real-time collaborative drawing with multiple simultaneous users
- Advanced drawing tools (brush, eraser) with customizable colors and stroke widths
- Live cursor tracking showing other users' positions
- Global undo/redo system synchronized across all users
- User presence indicators and online status tracking

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite for fast development and optimized production builds
- **UI Components:** shadcn/ui components built on Radix UI primitives
- **Styling:** Tailwind CSS with custom design tokens for vibrant color palette
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** React hooks + TanStack Query for server state

**Canvas Rendering:**
- HTML5 Canvas API for direct drawing operations
- Custom `DrawingEngine` class handles all canvas operations without external drawing libraries
- Implements efficient path optimization and layer management for smooth drawing
- High-frequency mouse event handling with batching to prevent performance degradation
- Device pixel ratio awareness for crisp rendering on high-DPI displays

**Component Architecture:**
- Modular component structure with clear separation of concerns
- Glass-morphism design pattern for floating control panels
- Custom drawing canvas component manages local drawing state
- Remote cursor components for visualizing other users' positions
- Real-time presence indicators with pulsing animations for active drawers

**Design System:**
- Typography: Inter for UI, JetBrains Mono for technical displays
- Color palette emphasizes psychology-driven vibrant colors (electric blue, energetic purple, vibrant green)
- Deep slate background reduces eye strain during extended use
- Semi-transparent glass panels with backdrop blur effects
- Consistent spacing using Tailwind's 2/3/4/6/8 unit system

### Backend Architecture

**Server Stack:**
- **Runtime:** Node.js with Express.js
- **WebSocket:** Socket.IO for bidirectional real-time communication
- **Build:** esbuild for production bundling
- **Type Safety:** TypeScript throughout with shared schemas

**Real-Time Communication:**
- Socket.IO server manages room-based connections
- Custom message schema using Zod for runtime validation
- Event-driven architecture for drawing operations (draw:start, draw:stroke, draw:end)
- Cursor position broadcasting with throttling to reduce bandwidth
- Connection state management with automatic reconnection logic

**Data Flow:**
- In-memory storage implementation (`MemStorage` class)
- Operations stored per-room with efficient lookup
- User color assignment system prevents color conflicts within rooms
- Drawing operations include: operation ID, user ID, type (stroke/erase), points array, color, width, timestamp

**Conflict Resolution:**
- Operation-based CRDT-like approach where all operations are timestamped
- Global undo/redo works by removing/adding operations to the shared operation stack
- Last-write-wins for overlapping drawing areas
- Optimistic UI updates with server confirmation

### External Dependencies

**UI Framework & Components:**
- **@radix-ui/react-***: Comprehensive set of unstyled, accessible UI primitives (accordion, dialog, dropdown, popover, tooltip, etc.)
- **class-variance-authority**: Type-safe variant styling system
- **tailwindcss**: Utility-first CSS framework with custom configuration
- **lucide-react**: Icon library for UI elements

**Real-Time Communication:**
- **socket.io**: WebSocket library for client-server communication
- **socket.io-client**: Client-side Socket.IO implementation

**Data Management:**
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe ORM (configured but not actively used for drawing data)
- **@neondatabase/serverless**: PostgreSQL driver for serverless environments
- **zod**: Schema validation library for type-safe data structures

**Form Handling:**
- **react-hook-form**: Performant form state management
- **@hookform/resolvers**: Validation resolver integrations

**Utilities:**
- **nanoid**: Unique ID generation for operations and users
- **date-fns**: Date manipulation and formatting
- **clsx / tailwind-merge**: Conditional className utilities

**Development Tools:**
- **vite**: Fast build tool with HMR
- **@vitejs/plugin-react**: React support for Vite
- **tsx**: TypeScript execution for Node.js
- **@replit/vite-plugin-***: Replit-specific development enhancements

**Database (Configured):**
- **PostgreSQL**: Via Neon serverless driver and Drizzle ORM
- Connection configured through `DATABASE_URL` environment variable
- Schema migrations managed by drizzle-kit
- Currently using in-memory storage; database integration available for persistence

**Session Management:**
- **connect-pg-simple**: PostgreSQL session store for Express sessions (configured but not actively used in current implementation)