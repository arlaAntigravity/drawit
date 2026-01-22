'use client';

import React, { useState, useCallback } from 'react';
import {
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow';

interface LabeledEdgeData {
  label?: string;
  animated?: boolean;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
}

export function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps<LabeledEdgeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [labelText, setLabelText] = useState(data?.label || '');

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  // Apply stroke style
  const strokeDasharray = 
    data?.strokeStyle === 'dashed' ? '8 4' :
    data?.strokeStyle === 'dotted' ? '2 4' :
    undefined;

  // Animation class
  const animatedClass = data?.animated ? 'react-flow__edge-path-animated' : '';

  const edgeStyle = {
    ...style,
    strokeDasharray,
    stroke: selected ? '#f59e0b' : (style.stroke || '#6366f1'),
    strokeWidth: selected ? 3 : (style.strokeWidth || 2),
    transition: 'stroke 0.2s, stroke-width 0.2s',
  };

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    // Here you would update the edge data in the store
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      setLabelText(data?.label || '');
      setIsEditing(false);
    }
  }, [data?.label]);

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={edgeStyle}
      />
      {(labelText || isEditing) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
            onDoubleClick={handleDoubleClick}
          >
            {isEditing ? (
              <input
                type="text"
                value={labelText}
                onChange={(e) => setLabelText(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="px-2 py-1 text-xs bg-card border border-border rounded shadow-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ minWidth: 60 }}
              />
            ) : (
              <div
                className="px-2 py-1 text-xs bg-card/90 border border-border rounded shadow text-foreground cursor-pointer hover:bg-card transition-colors"
                title="Двойной клик для редактирования"
              >
                {labelText}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
