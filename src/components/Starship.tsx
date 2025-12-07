// Starship Component - Flying spacecraft for Encyclopedia Galactica
import { useEffect, useRef } from 'react';
import './Starship.css';

interface StarshipProps {
  className?: string;
}

export default function Starship({ className = '' }: StarshipProps) {
  const shipRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 10, y: 30, angle: 0, speed: 0.3 });
  const targetRef = useRef({ x: 120, y: 80 });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      if (!shipRef.current) return;

      const pos = positionRef.current;
      const target = targetRef.current;

      // Calculate direction to target
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // If close to target, pick new random target
      if (dist < 5) {
        targetRef.current = {
          x: Math.random() * 100 + 10,
          y: Math.random() * 60 + 20,
        };
      }

      // Smooth steering towards target
      const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      let angleDiff = targetAngle - pos.angle;
      
      // Normalize angle difference
      while (angleDiff > 180) angleDiff -= 360;
      while (angleDiff < -180) angleDiff += 360;
      
      // Gradual turn
      pos.angle += angleDiff * 0.02;

      // Move forward
      const radAngle = pos.angle * (Math.PI / 180);
      pos.x += Math.cos(radAngle) * pos.speed;
      pos.y += Math.sin(radAngle) * pos.speed;

      // Wrap around screen
      if (pos.x > 120) pos.x = -20;
      if (pos.x < -20) pos.x = 120;
      if (pos.y > 100) pos.y = 0;
      if (pos.y < 0) pos.y = 100;

      // Apply position and rotation
      shipRef.current.style.left = `${pos.x}%`;
      shipRef.current.style.top = `${pos.y}%`;
      shipRef.current.style.transform = `rotate(${pos.angle}deg)`;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div ref={shipRef} className={`starship ${className}`}>
      {/* Ship body */}
      <div className="starship-body">
        {/* Main hull */}
        <div className="starship-hull" />
        {/* Cockpit */}
        <div className="starship-cockpit" />
        {/* Wings */}
        <div className="starship-wing-top" />
        <div className="starship-wing-bottom" />
        {/* Engine glow */}
        <div className="starship-engine">
          <div className="starship-flame" />
          <div className="starship-flame-inner" />
        </div>
      </div>
      {/* Trail particles */}
      <div className="starship-trail">
        <div className="trail-particle" style={{ animationDelay: '0s' }} />
        <div className="trail-particle" style={{ animationDelay: '0.1s' }} />
        <div className="trail-particle" style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  );
}
