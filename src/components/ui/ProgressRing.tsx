import React from 'react';

interface ProgressRingProps {
  radius: number;
  stroke: number;
  progress: number; // 0-100
  tooltip?: string;
  color?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ radius, stroke, progress, tooltip, color = '#3b82f6' }) => {
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div title={tooltip} style={{ display: 'inline-block' }}>
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <span style={{ position: 'absolute', left: -9999 }}>{progress}%</span>
    </div>
  );
};

export default ProgressRing;
