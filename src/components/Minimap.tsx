// Minimap - Shows overview of graph for navigation
import { useEffect, useRef, useCallback } from 'react';
import Sigma from 'sigma';

interface MinimapProps {
  sigma: Sigma | null;
  width?: number;
  height?: number;
}

export default function Minimap({ sigma, width = 150, height = 100 }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    if (!sigma || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const graph = sigma.getGraph();
    const camera = sigma.getCamera();
    
    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height);
    
    // Get bounds
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    graph.forEachNode((_, attrs) => {
      minX = Math.min(minX, attrs.x);
      maxX = Math.max(maxX, attrs.x);
      minY = Math.min(minY, attrs.y);
      maxY = Math.max(maxY, attrs.y);
    });
    
    const padding = 10;
    const graphWidth = maxX - minX || 1;
    const graphHeight = maxY - minY || 1;
    const scale = Math.min(
      (width - padding * 2) / graphWidth,
      (height - padding * 2) / graphHeight
    );
    
    const offsetX = (width - graphWidth * scale) / 2;
    const offsetY = (height - graphHeight * scale) / 2;
    
    // Draw edges
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    graph.forEachEdge((_, _attrs, source, target) => {
      const sourceAttrs = graph.getNodeAttributes(source);
      const targetAttrs = graph.getNodeAttributes(target);
      
      const x1 = (sourceAttrs.x - minX) * scale + offsetX;
      const y1 = (sourceAttrs.y - minY) * scale + offsetY;
      const x2 = (targetAttrs.x - minX) * scale + offsetX;
      const y2 = (targetAttrs.y - minY) * scale + offsetY;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
    
    // Draw nodes
    graph.forEachNode((_, attrs) => {
      const x = (attrs.x - minX) * scale + offsetX;
      const y = (attrs.y - minY) * scale + offsetY;
      
      ctx.fillStyle = attrs.color || '#666';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw viewport rectangle
    const viewState = camera.getState();
    const vpWidth = (width / viewState.ratio) * scale * 0.5;
    const vpHeight = (height / viewState.ratio) * scale * 0.5;
    const vpX = (-viewState.x - minX) * scale + offsetX + width / 2 - vpWidth / 2;
    const vpY = (-viewState.y - minY) * scale + offsetY + height / 2 - vpHeight / 2;
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(vpX, vpY, vpWidth, vpHeight);
  }, [sigma, width, height]);

  // Click to navigate
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!sigma || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const graph = sigma.getGraph();
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    graph.forEachNode((_, attrs) => {
      minX = Math.min(minX, attrs.x);
      maxX = Math.max(maxX, attrs.x);
      minY = Math.min(minY, attrs.y);
      maxY = Math.max(maxY, attrs.y);
    });
    
    const graphWidth = maxX - minX || 1;
    const graphHeight = maxY - minY || 1;
    const scale = Math.min(
      (width - 20) / graphWidth,
      (height - 20) / graphHeight
    );
    
    const offsetX = (width - graphWidth * scale) / 2;
    const offsetY = (height - graphHeight * scale) / 2;
    
    const graphX = (x - offsetX) / scale + minX;
    const graphY = (y - offsetY) / scale + minY;
    
    sigma.getCamera().animate({ x: -graphX, y: -graphY }, { duration: 300 });
  }, [sigma, width, height]);

  useEffect(() => {
    if (!sigma) return;
    
    draw();
    
    // Redraw on camera move
    sigma.on('afterRender', draw);
    
    return () => {
      sigma.off('afterRender', draw);
    };
  }, [sigma, draw]);

  return (
    <div className="minimap">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleClick}
      />
    </div>
  );
}
