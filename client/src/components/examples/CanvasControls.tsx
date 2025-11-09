import { useState } from 'react';
import CanvasControls from '../CanvasControls';

export default function CanvasControlsExample() {
  const [operationCount, setOperationCount] = useState(5);
  const [canUndo, setCanUndo] = useState(true);
  const [canRedo, setCanRedo] = useState(true);

  const handleUndo = () => {
    if (operationCount > 0) {
      setOperationCount(operationCount - 1);
      console.log('Undo triggered');
    }
    if (operationCount <= 1) setCanUndo(false);
    setCanRedo(true);
  };

  const handleRedo = () => {
    setOperationCount(operationCount + 1);
    console.log('Redo triggered');
    setCanUndo(true);
  };

  return (
    <div className="w-full min-h-screen bg-background p-4 flex items-center justify-center">
      <CanvasControls
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        operationCount={operationCount}
      />
    </div>
  );
}
