import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RemoteCursorProps {
  userId: string;
  userName: string;
  color: string;
  x: number;
  y: number;
  isDrawing?: boolean;
}

export default function RemoteCursor({
  userId,
  userName,
  color,
  x,
  y,
  isDrawing = false
}: RemoteCursorProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hide cursor after 3 seconds of inactivity
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [x, y]);

  if (!visible && !isDrawing) return null;

  return (
    <div
      className="absolute pointer-events-none z-50 transition-opacity duration-200"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)'
      }}
      data-testid={`cursor-${userId}`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <path
          d="M5.5 3.5L19.5 12L11.5 14.5L8.5 20.5L5.5 3.5Z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      
      <div
        className={cn(
          "absolute top-6 left-0 px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-lg",
          "backdrop-blur-sm"
        )}
        style={{
          backgroundColor: `${color}20`,
          border: `1px solid ${color}`,
          color: color
        }}
      >
        {userName}
        {isDrawing && (
          <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        )}
      </div>
    </div>
  );
}
