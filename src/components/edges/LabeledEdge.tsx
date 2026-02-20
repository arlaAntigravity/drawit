'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
} from 'reactflow';
import { useStore } from '@/store/useStore';
import { EDGE_STYLE } from '@/lib/constants';
import { EdgeData } from '@/lib/types';

export function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected,
}: EdgeProps<EdgeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [labelText, setLabelText] = useState(data?.label || '');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get store actions
  const updateEdgeData = useStore((state) => state.updateEdgeData);
  const commitEdgeData = useStore((state) => state.commitEdgeData);

  // Sync label with data
  const [prevDataLabel, setPrevDataLabel] = useState(data?.label);
  if (data?.label !== prevDataLabel) {
    setPrevDataLabel(data?.label);
    if (!isEditing) {
      setLabelText(data?.label || '');
    }
  }

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  // Apply properties from data or defaults
  // Animation requires strokeDasharray to show marching ants
  const strokeDasharray = 
    data?.strokeStyle === 'dashed' ? '8 4' :
    data?.strokeStyle === 'dotted' ? '2 4' :
    data?.animated ? '5 5' :
    undefined;

  // Always show the real color; indicate selection with glow + thicker stroke
  const baseStrokeColor = data?.stroke || (style.stroke as string || EDGE_STYLE.stroke);
  const baseStrokeWidth = data?.strokeWidth || (style.strokeWidth as number || EDGE_STYLE.strokeWidth);
  const strokeColor = baseStrokeColor;
  const strokeWidth = selected ? baseStrokeWidth + 1 : baseStrokeWidth;

  const edgeStyle = {
    ...style,
    strokeDasharray,
    stroke: strokeColor,
    strokeWidth,
    transition: 'stroke 0.2s, filter 0.2s',
    filter: selected ? `drop-shadow(0 0 4px ${baseStrokeColor})` : 'none',
  };

  // Custom marker that changes color with selection
  const markerEnd = `url(#arrow-${id})`;

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const saveLabel = useCallback((newLabel: string) => {
    const trimmedLabel = newLabel.trim();
    if (trimmedLabel !== data?.label) {
      updateEdgeData(id, { label: trimmedLabel });
      commitEdgeData();
    }
  }, [data?.label, id, updateEdgeData, commitEdgeData]);

  const handleBlur = useCallback(() => {
    saveLabel(labelText);
    setIsEditing(false);
  }, [labelText, saveLabel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveLabel(labelText);
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setLabelText(data?.label || '');
      setIsEditing(false);
    }
    e.stopPropagation();
  }, [data?.label, labelText, saveLabel]);

  return (
    <>
      <defs>
        <marker
          id={`arrow-${id}`}
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="6"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M2,2 L10,6 L2,10 L4,6 Z"
            fill={strokeColor}
            style={{ transition: 'fill 0.2s' }}
          />
        </marker>
      </defs>
      
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
        onDoubleClick={handleDoubleClick}
      />
      
      <path
        d={edgePath}
        fill="none"
        stroke={edgeStyle.stroke}
        strokeWidth={edgeStyle.strokeWidth}
        strokeDasharray={edgeStyle.strokeDasharray}
        markerEnd={markerEnd}
        style={{
          transition: edgeStyle.transition,
          ...(data?.animated ? { animation: 'dashdraw 0.5s linear infinite' } : {}),
        }}
        onDoubleClick={handleDoubleClick}
      />
      
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
              ref={inputRef}
              type="text"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Введите подпись..."
              className="px-2 py-1 text-xs bg-card border border-border rounded shadow-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ minWidth: 100 }}
            />
          ) : labelText ? (
            <div
              className="px-2 py-1 text-xs bg-card/90 border border-border rounded shadow text-foreground cursor-pointer hover:bg-card transition-colors"
              title="Двойной клик для редактирования"
            >
              {labelText}
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

