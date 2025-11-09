import { useState } from 'react';
import Toolbar from '../Toolbar';

export default function ToolbarExample() {
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [color, setColor] = useState('#3B82F6');
  const [strokeWidth, setStrokeWidth] = useState(3);

  return (
    <div className="w-full min-h-screen bg-background p-4 flex items-start justify-center">
      <Toolbar
        selectedTool={tool}
        onToolChange={(newTool) => {
          setTool(newTool);
          console.log('Tool changed to:', newTool);
        }}
        selectedColor={color}
        onColorChange={(newColor) => {
          setColor(newColor);
          console.log('Color changed to:', newColor);
        }}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={(width) => {
          setStrokeWidth(width);
          console.log('Stroke width changed to:', width);
        }}
      />
    </div>
  );
}
