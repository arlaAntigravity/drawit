'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { NodeType } from '@/store/useStore';

interface ShapeItem {
  type: NodeType;
  label: string;
  icon: React.ReactNode;
}

const shapes: ShapeItem[] = [
  {
    type: 'rectangle',
    label: 'Прямоугольник',
    icon: (
      <svg width="40" height="24" viewBox="0 0 40 24" className="stroke-indigo-400">
        <rect x="2" y="2" width="36" height="20" fill="none" strokeWidth="2" />
      </svg>
    ),
  },
  {
    type: 'roundedRect',
    label: 'Скруглённый',
    icon: (
      <svg width="40" height="24" viewBox="0 0 40 24" className="stroke-green-400">
        <rect x="2" y="2" width="36" height="20" rx="6" fill="none" strokeWidth="2" />
      </svg>
    ),
  },
  {
    type: 'diamond',
    label: 'Ромб',
    icon: (
      <svg width="40" height="30" viewBox="0 0 40 30" className="stroke-amber-400">
        <polygon points="20,2 38,15 20,28 2,15" fill="none" strokeWidth="2" />
      </svg>
    ),
  },
  {
    type: 'ellipse',
    label: 'Эллипс',
    icon: (
      <svg width="40" height="24" viewBox="0 0 40 24" className="stroke-pink-400">
        <ellipse cx="20" cy="12" rx="18" ry="10" fill="none" strokeWidth="2" />
      </svg>
    ),
  },
  {
    type: 'text',
    label: 'Текст',
    icon: (
      <svg width="40" height="24" viewBox="0 0 40 24" className="fill-violet-400">
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="bold">
          Aa
        </text>
      </svg>
    ),
  },
  {
    type: 'cylinder',
    label: 'База данных',
    icon: (
      <svg width="32" height="36" viewBox="0 0 32 36" className="stroke-cyan-400">
        <ellipse cx="16" cy="6" rx="14" ry="5" fill="none" strokeWidth="2" />
        <line x1="2" y1="6" x2="2" y2="30" strokeWidth="2" />
        <line x1="30" y1="6" x2="30" y2="30" strokeWidth="2" />
        <ellipse cx="16" cy="30" rx="14" ry="5" fill="none" strokeWidth="2" />
      </svg>
    ),
  },
];

interface SidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeType) => void;
}

export function Sidebar({ onDragStart }: SidebarProps) {
  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-indigo-400">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          DrawIt
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Перетащите фигуру на холст</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Основные фигуры</h3>
          <div className="grid grid-cols-2 gap-2">
            {shapes.map((shape) => (
              <Button
                key={shape.type}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing hover:bg-accent hover:border-primary/50 transition-all"
                draggable
                onDragStart={(e) => onDragStart(e, shape.type)}
              >
                {shape.icon}
                <span className="text-xs text-muted-foreground">{shape.label}</span>
              </Button>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="px-1 text-xs text-muted-foreground space-y-2">
            <p className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Del</kbd>
              Удалить выбранное
            </p>
            <p className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+Z</kbd>
              Отменить
            </p>
            <p className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+Y</kbd>
              Повтор
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
