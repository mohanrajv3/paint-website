# Design Guidelines: Real-Time Collaborative Drawing Canvas

## Design Approach

**Selected Approach**: Experience-focused with creative tool aesthetics inspired by Figma, Miro, and Procreate
**Core Principle**: Premium, vibrant interface that energizes creativity while maintaining professional polish

## Typography

**Font Families**:
- Primary: Inter or DM Sans (UI elements, controls, labels)
- Monospace: JetBrains Mono (technical indicators, user IDs, coordinates)

**Hierarchy**:
- App Title/Branding: 24px, semibold
- Tool Labels: 14px, medium
- Status Text: 12px, regular
- User Names: 13px, medium
- Technical Info: 11px, monospace

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 3, 4, 6, and 8 for consistent rhythm
- Control panels: p-4
- Tool buttons: p-3, gap-2
- Section spacing: space-y-4
- Icon padding: p-2

**App Structure**:
- Full-screen canvas with floating control panels
- Top toolbar (left-aligned): Drawing tools, color picker, stroke controls
- Right sidebar: Online users panel with presence indicators
- Bottom-right: Undo/redo controls with operation counter
- Top-right: Room info and connection status

## Color System

**Vibrant Palette** (Psychology-driven):
- Primary Accent: Electric blue (#3B82F6) - stimulates creativity
- Secondary: Energetic purple (#8B5CF6) - inspires imagination
- Success/Active: Vibrant green (#10B981) - positive reinforcement
- Warning: Warm orange (#F59E0B) - attention without alarm
- Error: Coral red (#EF4444) - urgent but not harsh

**Surface Colors**:
- App Background: Deep slate (#0F172A) - reduces eye strain
- Panel Backgrounds: Semi-transparent glass effect (rgba(255,255,255,0.1) with backdrop blur)
- Canvas: Pure white (#FFFFFF) - clean drawing surface
- Hover States: Lighter variants with 10% opacity increase

**User Color Assignment**: Rotate through 12 vibrant, distinct colors for user cursors and strokes (rainbow spectrum)

## Component Library

### Canvas Controls
- **Tool Buttons**: 40×40px, rounded-lg, glass-morphism background, active state with colored border
- **Color Swatches**: 32×32px circles in grid layout (4×3), selected state with ring indicator
- **Stroke Width Slider**: Custom thumb with current width preview, gradient track
- **Undo/Redo**: Icon buttons with operation count badge, disabled state at 50% opacity

### User Presence Panel
- **User Cards**: Horizontal layout, 8px colored dot indicator, username, "drawing" status tag
- **Cursor Indicators**: Floating SVG cursors on canvas with username labels, matching user colors
- **Online Count**: Pill-shaped badge with pulsing animation

### Real-time Feedback
- **Connection Status**: Top-right indicator - green dot (connected), yellow (reconnecting), red (disconnected)
- **Latency Display**: Small text showing ping in ms (optional performance metric)
- **Operation Toast**: Bottom-left temporary notifications for undo/redo events

### Glass Morphism Effects
Apply to all floating panels:
- Background: rgba(255, 255, 255, 0.08)
- Backdrop filter: blur(12px)
- Border: 1px solid rgba(255, 255, 255, 0.15)
- Shadow: 0 8px 32px rgba(0, 0, 0, 0.3)

## Animations

**Strategic Use Only**:
- Cursor movements: Smooth CSS transitions (100ms ease-out)
- Tool selection: Scale animation (transform: scale(1.05))
- User join/leave: Fade in/out (200ms)
- Drawing strokes: No animation (performance critical)
- Panel slides: Slide-in from edges (300ms ease-out) on first load

## Images

**No hero images needed** - This is a full-screen application tool, not a marketing site. The canvas itself is the visual centerpiece.

## Accessibility

- Keyboard shortcuts for all tools (B=brush, E=eraser, Z=undo, Shift+Z=redo)
- High contrast mode toggle in settings
- Focus indicators on all interactive elements (2px colored outline)
- ARIA labels for icon-only buttons
- Color-blind friendly user color palette option

## Premium Details

- Smooth gradient backgrounds for control panels (subtle 5-10% color shifts)
- Micro-interactions: Tools "bounce" slightly on selection
- Polished icons from Heroicons (outline style for inactive, solid for active)
- Custom cursor designs for different tools (not system defaults)
- Glow effects on active drawing area boundaries
- Professional loading states with skeleton screens

## Mobile Considerations

While desktop-focused, ensure:
- Touch-friendly button sizes (minimum 44×44px)
- Simplified toolbar for smaller screens (collapse to drawer)
- Pinch-to-zoom canvas support