'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
  MarkerType,
} from 'reactflow';
import { useStore } from '@/store/useStore';
import { EDGE_STYLE, SELECTED_EDGE_COLOR } from '@/lib/constants';

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
  data,
  selected,
}: EdgeProps<LabeledEdgeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [labelText, setLabelText] = useState(data?.label || '');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get store actions
  const edges = useStore((state) => state.edges);
  const setEdges = useStore((state) => state.setEdges);
  const pushHistory = useStore((state) => state.pushHistory);

  // Sync label with data
  useEffect(() => {
    if (!isEditing) {
      setLabelText(data?.label || '');
    }
  }, [data?.label, isEditing]);

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

  // Apply stroke style
  const strokeDasharray = 
    data?.strokeStyle === 'dashed' ? '8 4' :
    data?.strokeStyle === 'dotted' ? '2 4' :
    undefined;

  // Selected color - only change color, keep same strokeWidth
  const strokeColor = selected ? SELECTED_EDGE_COLOR : (style.stroke as string || EDGE_STYLE.stroke);

  const edgeStyle = {
    ...style,
    strokeDasharray,
    stroke: strokeColor,
    strokeWidth: style.strokeWidth || EDGE_STYLE.strokeWidth,
    transition: 'stroke 0.2s',
  };

  // Custom marker that changes color with selection
  const markerEnd = `url(#arrow-${id})`;

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const saveLabel = useCallback((newLabel: string) => {
    const trimmedLabel = newLabel.trim();
    // Update edge data in store
    setEdges(
      edges.map((edge) =>
        edge.id === id
          ? { ...edge, data: { ...edge.data, label: trimmedLabel } }
          : edge
      )
    );
    pushHistory();
  }, [edges, id, setEdges, pushHistory]);

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
      {/* Custom marker definition - same size, only color changes */}
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
      
      {/* Invisible hit area for double-click */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
        onDoubleClick={handleDoubleClick}
      />
      
      {/* Visible edge */}
      <path
        d={edgePath}
        fill="none"
        stroke={edgeStyle.stroke}
        strokeWidth={edgeStyle.strokeWidth}
        strokeDasharray={edgeStyle.strokeDasharray}
        markerEnd={markerEnd}
        style={{ transition: edgeStyle.transition }}
        className={data?.animated ? 'react-flow__edge-path-animated' : ''}
        onDoubleClick={handleDoubleClick}
      />
      
      {/* Label renderer */}
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

