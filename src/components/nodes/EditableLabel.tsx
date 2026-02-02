'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';

interface EditableLabelProps {
  nodeId: string;
  label: string;
  textColor: string;
  fontSize: number;
  className?: string;
}

/**
 * Editable label component for nodes.
 * Double-click to edit, Enter to save, Escape to cancel.
 */
export function EditableLabel({
  nodeId,
  label,
  textColor,
  fontSize,
  className = '',
}: EditableLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateNodeData = useStore((state) => state.updateNodeData);

  // Sync with prop changes when not editing
  useEffect(() => {
    if (!isEditing) {
      setEditText(label);
    }
  }, [label, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(() => {
    const trimmedText = editText.trim();
    if (trimmedText && trimmedText !== label) {
      updateNodeData(nodeId, { label: trimmedText });
    } else {
      setEditText(label); // Reset to original if empty
    }
    setIsEditing(false);
  }, [editText, label, nodeId, updateNodeData]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditText(label);
      setIsEditing(false);
    }
    // Prevent node selection/deletion while editing
    e.stopPropagation();
  }, [handleSave, label]);

  const handleBlur = useCallback(() => {
    handleSave();
  }, [handleSave]);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="nodrag nopan px-1 bg-transparent border border-white/50 rounded text-center outline-none focus:border-primary"
        style={{
          color: textColor,
          fontSize,
          minWidth: 40,
          maxWidth: '100%',
        }}
      />
    );
  }

  return (
    <span
      onDoubleClick={handleDoubleClick}
      style={{
        color: textColor,
        fontSize,
      }}
      className={`text-center px-2 cursor-text select-none ${className}`}
      title="Двойной клик для редактирования"
    >
      {label}
    </span>
  );
}
