'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { NodeType } from '@/lib/types';
import { SHAPES } from '@/lib/shapes';
import { LogoIcon } from '@/components/icons';

interface SidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeType) => void;
}

export function Sidebar({ onDragStart }: SidebarProps) {
  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <LogoIcon className="text-indigo-400" />
          DrawIt
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Перетащите фигуру на холст</p>
      </div>
      
      {/* Shapes List */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Основные фигуры</h3>
          <div className="grid grid-cols-2 gap-2">
            {SHAPES.map((shape) => (
              <Button
                key={shape.type}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing hover:bg-accent hover:border-primary/50 transition-all sidebar-item hover-lift active-push"
                draggable
                onDragStart={(e) => onDragStart(e, shape.type)}
              >
                {shape.icon}
                <span className="text-xs text-muted-foreground">{shape.label}</span>
              </Button>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          {/* Keyboard Shortcuts */}
          <KeyboardShortcuts />
        </div>
      </ScrollArea>
    </div>
  );
}

function KeyboardShortcuts() {
  const shortcuts = [
    { key: 'Del', description: 'Удалить выбранное' },
    { key: 'Ctrl+Z', description: 'Отменить' },
    { key: 'Ctrl+Y', description: 'Повтор' },
  ];

  return (
    <div className="px-1 text-xs text-muted-foreground space-y-2">
      {shortcuts.map(({ key, description }) => (
        <p key={key} className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">{key}</kbd>
          {description}
        </p>
      ))}
    </div>
  );
}
