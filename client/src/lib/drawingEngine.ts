import { type DrawingOperation } from '@shared/schema';

export interface Point {
  x: number;
  y: number;
}

export class DrawingEngine {
  private ctx: CanvasRenderingContext2D;
  private operations: DrawingOperation[] = [];
  private redoStack: DrawingOperation[] = [];
  private currentPath: Point[] = [];
  private devicePixelRatio: number;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas context');
    }
    this.ctx = context;
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.initializeCanvas(canvas);
  }

  private initializeCanvas(canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * this.devicePixelRatio;
    canvas.height = rect.height * this.devicePixelRatio;
    
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    this.clearCanvas();
  }

  clearCanvas() {
    const canvas = this.ctx.canvas;
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  startPath(x: number, y: number) {
    this.currentPath = [{ x, y }];
  }

  addPoint(x: number, y: number) {
    this.currentPath.push({ x, y });
  }

  getCurrentPath(): Point[] {
    return [...this.currentPath];
  }

  endPath(): Point[] {
    const path = [...this.currentPath];
    this.currentPath = [];
    return path;
  }

  private renderPath(points: Point[], color: string, width: number, type: 'stroke' | 'erase') {
    if (points.length < 1) return;

    this.ctx.save();
    
    if (type === 'erase') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = width * 2;
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = width;
    }

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.beginPath();
    
    if (points.length === 1) {
      // Single point - draw a dot
      this.ctx.arc(points[0].x, points[0].y, width / 2, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (points.length === 2) {
      // Two points - simple line
      this.ctx.moveTo(points[0].x, points[0].y);
      this.ctx.lineTo(points[1].x, points[1].y);
      this.ctx.stroke();
    } else {
      // Multiple points - smooth curve
      this.ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length - 1; i++) {
        const currentPoint = points[i];
        const nextPoint = points[i + 1];
        const midX = (currentPoint.x + nextPoint.x) / 2;
        const midY = (currentPoint.y + nextPoint.y) / 2;
        
        this.ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, midX, midY);
      }
      
      // Draw to last point
      const lastPoint = points[points.length - 1];
      this.ctx.lineTo(lastPoint.x, lastPoint.y);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawOperation(operation: DrawingOperation) {
    this.renderPath(operation.points, operation.color, operation.width, operation.type);
  }

  drawPreview(operation: DrawingOperation) {
    // For preview, we need to redraw everything to avoid artifacts
    this.redrawAll();
    this.renderPath(operation.points, operation.color, operation.width, operation.type);
  }

  redrawAll() {
    this.clearCanvas();
    for (const operation of this.operations) {
      this.renderPath(operation.points, operation.color, operation.width, operation.type);
    }
  }

  addOperationToHistory(operation: DrawingOperation) {
    this.operations.push(operation);
    this.redoStack = [];
  }

  undo(): DrawingOperation | null {
    const operation = this.operations.pop();
    if (operation) {
      this.redoStack.push(operation);
      this.redrawAll();
      return operation;
    }
    return null;
  }

  redo(): DrawingOperation | null {
    const operation = this.redoStack.pop();
    if (operation) {
      this.operations.push(operation);
      this.renderPath(operation.points, operation.color, operation.width, operation.type);
      return operation;
    }
    return null;
  }

  removeOperation(operationId: string) {
    const index = this.operations.findIndex(op => op.id === operationId);
    if (index !== -1) {
      this.operations.splice(index, 1);
      this.redrawAll();
    }
  }

  syncOperations(operations: DrawingOperation[]) {
    this.operations = [...operations];
    this.redoStack = [];
    this.redrawAll();
  }

  getOperations(): DrawingOperation[] {
    return [...this.operations];
  }

  canUndo(): boolean {
    return this.operations.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  getOperationCount(): number {
    return this.operations.length;
  }

  resize(canvas: HTMLCanvasElement) {
    const currentOperations = [...this.operations];
    this.initializeCanvas(canvas);
    this.operations = currentOperations;
    this.redrawAll();
  }
}
