'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';

interface EditableLabelProps {
  nodeId: string;
  label: string;
  textColor: string;
  fontSize: number;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline" | "line-through";
  textAlign?: "left" | "center" | "right" | "justify";
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
  fontWeight = "normal",
  fontStyle = "normal",
  textDecoration = "none",
  textAlign = "center",
  className = '',
}: EditableLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(label);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const updateNodeData = useStore((state) => state.updateNodeData);

  // Sync with prop changes when not editing
  const [prevLabel, setPrevLabel] = useState(label);
  if (label !== prevLabel) {
    setPrevLabel(label);
    if (!isEditing) {
      setEditText(label);
    }
  }

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
      <textarea
        ref={inputRef}
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`nodrag nopan px-1 bg-transparent border border-white/50 rounded outline-none focus:border-primary resize-none w-full min-h-[1.5em] overflow-hidden leading-snug ${className}`}
        style={{
          color: textColor,
          fontSize,
          fontWeight,
          fontStyle,
          textDecoration,
          textAlign,
          minWidth: 40,
        }}
        rows={editText.split('\n').length || 1}
      />
    );
  }

  return (
    <span
      onDoubleClick={handleDoubleClick}
      style={{
        color: textColor,
        fontSize,
        fontWeight,
        fontStyle,
        textDecoration,
        textAlign,
        whiteSpace: "pre-wrap",
        display: "block",
        width: "100%",
        lineHeight: "1.375",
      }}
      className={`px-2 cursor-inherit select-none ${className}`}
      title="Двойной клик для редактирования"
    >
      {label}
    </span>
  );
}
