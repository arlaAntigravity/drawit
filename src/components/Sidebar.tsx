'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { NodeType } from '@/lib/types';
import { SHAPES } from '@/lib/shapes';
import { useStore } from '@/store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { TrashIcon, LayersIcon } from '@/components/icons';

interface SidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeType) => void;
}

export function Sidebar({ onDragStart }: SidebarProps) {
  const { templates, deleteTemplate } = useStore(useShallow(state => ({
    templates: state.templates,
    deleteTemplate: state.deleteTemplate,
  })));

  const onDragTemplateStart = (event: React.DragEvent, templateId: string) => {
    event.dataTransfer.setData('application/reactflow-template', templateId);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <p className="text-xs text-muted-foreground">Перетащите фигуру на холст</p>
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
          
          {templates.length > 0 && (
            <>
              <Separator className="my-4" />
              <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Мои шаблоны</h3>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((template) => (
                  <div key={template.id} className="relative group">
                    <Button
                      variant="outline"
                      className="h-20 w-full flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing hover:bg-accent hover:border-primary/50 transition-all sidebar-item hover-lift active-push"
                      draggable
                      onDragStart={(e) => onDragTemplateStart(e, template.id)}
                    >
                      <LayersIcon />
                      <span className="text-xs text-muted-foreground truncate w-full px-2 text-center" title={template.name}>
                        {template.name}
                      </span>
                    </Button>
                    <button
                      className="absolute top-1 right-1 p-1 bg-destructive/90 text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTemplate(template.id);
                      }}
                      title="Удалить шаблон"
                    >
                      <TrashIcon size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

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
