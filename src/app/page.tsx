'use client';

import React, { useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Canvas } from '@/components/Canvas';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { Toolbar } from '@/components/Toolbar';
import { NodeType } from '@/store/useStore';

export default function Home() {
  const onDragStart = useCallback((event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onDragStart={onDragStart} />
        <Canvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}
