'use client';

import React, { useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Sidebar } from '@/components/Sidebar';
import { Canvas } from '@/components/Canvas';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { Toolbar } from '@/components/Toolbar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NodeType } from '@/lib/types';

export default function Home() {
  const onDragStart = useCallback((event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-background">
        <Toolbar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar onDragStart={onDragStart} />
          <ErrorBoundary>
            <Canvas />
          </ErrorBoundary>
          <PropertiesPanel />
        </div>
      </div>
    </ReactFlowProvider>
  );
}

