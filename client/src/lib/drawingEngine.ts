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

  endPath(): Point[] {
    const path = [...this.currentPath];
    this.currentPath = [];
    return path;
  }

  drawOperation(operation: DrawingOperation, isPreview: boolean = false) {
    if (operation.points.length < 2) return;

    this.ctx.save();
    
    if (operation.type === 'erase') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = operation.width * 2;
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = operation.color;
      this.ctx.lineWidth = operation.width;
    }

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Optimized path rendering with quadratic curves for smoothness
    this.ctx.beginPath();
    this.ctx.moveTo(operation.points[0].x, operation.points[0].y);

    if (operation.points.length === 2) {
      // Simple line for just two points
      this.ctx.lineTo(operation.points[1].x, operation.points[1].y);
    } else {
      // Smooth curve through points
      for (let i = 1; i < operation.points.length - 1; i++) {
        const currentPoint = operation.points[i];
        const nextPoint = operation.points[i + 1];
        const midX = (currentPoint.x + nextPoint.x) / 2;
        const midY = (currentPoint.y + nextPoint.y) / 2;
        
        this.ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, midX, midY);
      }
      
      // Draw to last point
      const lastPoint = operation.points[operation.points.length - 1];
      this.ctx.lineTo(lastPoint.x, lastPoint.y);
    }

    this.ctx.stroke();
    this.ctx.restore();

    if (!isPreview) {
      this.operations.push(operation);
      this.redoStack = []; // Clear redo stack on new operation
    }
  }

  redrawAll() {
    this.clearCanvas();
    for (const operation of this.operations) {
      this.drawOperation(operation, true);
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
      this.drawOperation(operation, true);
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
    this.operations = operations;
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
