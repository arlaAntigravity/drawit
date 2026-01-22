'use client';

import React from 'react';
import { useReactFlow } from 'reactflow';
import { SnapGuide } from '@/hooks/useSnapGuides';

interface SnapGuidesProps {
  guides: SnapGuide[];
}

export function SnapGuides({ guides }: SnapGuidesProps) {
  const { getViewport } = useReactFlow();
  const viewport = getViewport();

  if (guides.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-50"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    >
      <g
        transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}
      >
        {guides.map((guide, index) => (
          <GuideLine key={`${guide.type}-${guide.position}-${index}`} guide={guide} />
        ))}
      </g>
    </svg>
  );
}

function GuideLine({ guide }: { guide: SnapGuide }) {
  const GUIDE_LENGTH = 10000; // Large enough to span canvas
  
  if (guide.type === 'vertical') {
    return (
      <line
        x1={guide.position}
        y1={-GUIDE_LENGTH / 2}
        x2={guide.position}
        y2={GUIDE_LENGTH / 2}
        stroke="#f59e0b"
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.8}
      />
    );
  }

  return (
    <line
      x1={-GUIDE_LENGTH / 2}
      y1={guide.position}
      x2={GUIDE_LENGTH / 2}
      y2={guide.position}
      stroke="#f59e0b"
      strokeWidth={1}
      strokeDasharray="4 4"
      opacity={0.8}
    />
  );
}
