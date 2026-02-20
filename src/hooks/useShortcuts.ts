'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function useShortcuts() {
  const {
    deleteSelected,
    undo,
    redo,
    copySelected,
    pasteClipboard,
    duplicateNode,
    selectedNodes,
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInput) return;

      // Use event.code for layout-independent shortcuts
      if (event.code === 'Delete' || event.code === 'Backspace') {
        deleteSelected();
      }

      if (event.ctrlKey || event.metaKey) {
        if (event.code === 'KeyZ') {
          event.preventDefault();
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
        if (event.code === 'KeyY') {
          event.preventDefault();
          redo();
        }
        if (event.code === 'KeyC') {
          event.preventDefault();
          copySelected();
        }
        if (event.code === 'KeyV') {
          event.preventDefault();
          pasteClipboard();
        }
        if (event.code === 'KeyD') {
          event.preventDefault();
          if (selectedNodes.length > 0) {
            duplicateNode(selectedNodes[0]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, undo, redo, copySelected, pasteClipboard, duplicateNode, selectedNodes]);
}
