import { ReactNode } from 'react';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuShortcut,
} from '@/components/ui/context-menu';
import { TrashIcon, CopyIcon, PlusIcon, UndoIcon, RedoIcon, ImageIcon, SaveIcon } from '@/components/icons';
import { NodeType } from '@/lib/types';

interface CanvasContextMenuProps {
  children: ReactNode;
  menuType: 'pane' | 'node' | 'edge';
  handleMenuAction: (action: string) => void;
  undo: () => void;
  redo: () => void;
  onAddNode: (type: NodeType, position: { x: number, y: number }) => void;
  screenToFlowPosition: (position: { x: number, y: number }) => { x: number, y: number };
}

export function CanvasContextMenu({
  children,
  menuType,
  handleMenuAction,
  undo,
  redo,
  onAddNode,
  screenToFlowPosition,
}: CanvasContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="h-full w-full">
        {children}
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-56">
        {menuType === 'node' && (
          <>
            <ContextMenuLabel>Узел</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => handleMenuAction('duplicate')}>
              <CopyIcon className="mr-2" />
              Дублировать
              <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleMenuAction('save_template')}>
              <SaveIcon className="mr-2" />
              Сохранить как шаблон
            </ContextMenuItem>
            <ContextMenuItem variant="destructive" onClick={() => handleMenuAction('delete')}>
              <TrashIcon className="mr-2" />
              Удалить
              <ContextMenuShortcut>Del</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        )}

        {menuType === 'edge' && (
          <>
            <ContextMenuLabel>Связь</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive" onClick={() => handleMenuAction('delete')}>
              <TrashIcon className="mr-2" />
              Удалить
            </ContextMenuItem>
          </>
        )}

        {menuType === 'pane' && (
          <>
            <ContextMenuLabel>Полотно</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => undo()}>
              <UndoIcon className="mr-2" />
              Отменить
              <ContextMenuShortcut>Ctrl+Z</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => redo()}>
              <RedoIcon className="mr-2" />
              Повторить
              <ContextMenuShortcut>Ctrl+Y</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuLabel>Добавить быстрые фигуры</ContextMenuLabel>
            <ContextMenuItem onClick={() => onAddNode('rectangle', screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }))}>
              <PlusIcon className="mr-2" />
              Прямоугольник
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAddNode('roundedRect', screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }))}>
              <PlusIcon className="mr-2" />
              Закругленный блок
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAddNode('image', screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }))}>
              <ImageIcon className="mr-2" />
              Изображение
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
