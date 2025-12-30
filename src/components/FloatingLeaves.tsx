import React, { useState, useCallback, useMemo } from 'react';
import { Leaf } from 'lucide-react';

const LEAF_COLORS = [
  'text-white/70',
  'text-green-300/60',
  'text-green-400/50',
  'text-emerald-300/60',
  'text-lime-300/50',
  'text-teal-300/50',
];

interface LeafData {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  swayDuration: number;
  rotation: number;
}

const FloatingLeaves: React.FC = () => {
  const [hoveredLeaves, setHoveredLeaves] = useState<Record<number, { x: number; y: number }>>({});

  const leaves = useMemo<LeafData[]>(() => 
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      size: 20 + Math.random() * 24,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 12 + Math.random() * 10,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      swayDuration: 2 + Math.random() * 2,
      rotation: Math.random() * 360,
    })),
  []);

  const handleMouseEnter = useCallback((id: number, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Calculate direction away from mouse
    const dirX = centerX - mouseX;
    const dirY = centerY - mouseY;
    const distance = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    
    // Normalize and amplify
    const pushX = (dirX / distance) * 80;
    const pushY = (dirY / distance) * 80;
    
    setHoveredLeaves(prev => ({ ...prev, [id]: { x: pushX, y: pushY } }));
  }, []);

  const handleMouseLeave = useCallback((id: number) => {
    setHoveredLeaves(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden z-0">
      {leaves.map((leaf) => {
        const hoverOffset = hoveredLeaves[leaf.id];
        return (
          <div
            key={leaf.id}
            className="absolute animate-float cursor-pointer pointer-events-auto"
            style={{
              left: `${leaf.left}%`,
              top: '-5%',
              animationDelay: `${leaf.delay}s`,
              animationDuration: `${leaf.duration}s`,
              transform: hoverOffset 
                ? `translate(${hoverOffset.x}px, ${hoverOffset.y}px)` 
                : undefined,
              transition: hoverOffset ? 'transform 0.3s ease-out' : 'transform 0.8s ease-out',
            }}
            onMouseEnter={(e) => handleMouseEnter(leaf.id, e)}
            onMouseLeave={() => handleMouseLeave(leaf.id)}
          >
            <div
              className="animate-sway"
              style={{
                animationDuration: `${leaf.swayDuration}s`,
                animationDelay: `${leaf.delay * 0.5}s`,
              }}
            >
              <Leaf
                className={`${leaf.color} drop-shadow-lg transition-all duration-200 hover:scale-125`}
                style={{
                  width: leaf.size,
                  height: leaf.size,
                  transform: `rotate(${leaf.rotation}deg)`,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FloatingLeaves;
