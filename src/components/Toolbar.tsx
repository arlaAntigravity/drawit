'use client';

import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStore } from '@/store/useStore';
import { useAutoLayout } from '@/hooks/useAutoLayout';
import { toPng, toSvg } from 'html-to-image';
import {
  UndoIcon,
  RedoIcon,
  DownloadIcon,
  UploadIcon,
  TrashIcon,
  ImageIcon,
  LayersIcon,
  FileIcon,
  LayoutVerticalIcon,
  LayoutHorizontalIcon,
  LayoutTreeIcon,
  PlusIcon,
  AlignLeftIcon,
  AlignCenterHorizontalIcon,
  AlignRightIcon,
  AlignTopIcon,
  AlignCenterVerticalIcon,
  AlignBottomIcon,
  SunIcon,
  MoonIcon,
} from '@/components/icons';
import { PresetModal } from '@/components/PresetModal';

export function Toolbar() {
  const { nodes, edges, undo, redo, setNodes, setEdges, history, historyIndex, alignNodes, selectedNodes } = useStore();
  const { layoutVertical, layoutHorizontal, layoutTree } = useAutoLayout();
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasNodes = nodes.length > 0;

  const handleExportPNG = useCallback(async () => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element || nodes.length === 0) return;

    try {
      const dataUrl = await toPng(element, {
        backgroundColor: '#0f0f17',
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      downloadFile(dataUrl, 'diagram.png');
    } catch (err) {
      console.error('Failed to export PNG:', err);
    }
  }, [nodes]);

  const handleExportSVG = useCallback(async () => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element || nodes.length === 0) return;

    try {
      const dataUrl = await toSvg(element, { backgroundColor: '#0f0f17' });
      downloadFile(dataUrl, 'diagram.svg');
    } catch (err) {
      console.error('Failed to export SVG:', err);
    }
  }, [nodes]);

  const handleExportJSON = useCallback(() => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'diagram.json');
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleImportJSON = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      } catch (err) {
        console.error('Failed to import JSON:', err);
      }
    };
    input.click();
  }, [setNodes, setEdges]);

  const handleClear = useCallback(() => {
    if (confirm('Очистить все элементы?')) {
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  return (
    <TooltipProvider>
      <div className="h-12 border-b border-border bg-card flex items-center px-4 gap-2">
        {/* New */}
        <ToolbarButton
          icon={<PlusIcon />}
          label="Новый"
          tooltip="Создать из шаблона"
          onClick={() => setPresetModalOpen(true)}
        />

        <Separator orientation="vertical" className="h-6" />

        {/* Undo/Redo */}
        <ToolbarButton 
          icon={<UndoIcon />} 
          tooltip="Отменить (Ctrl+Z)" 
          onClick={undo} 
          disabled={!canUndo} 
        />
        <ToolbarButton 
          icon={<RedoIcon />} 
          tooltip="Повтор (Ctrl+Y)" 
          onClick={redo} 
          disabled={!canRedo} 
        />

        <Separator orientation="vertical" className="h-6" />

        {/* Export Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <DownloadIcon />
              Экспорт
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleExportPNG}>
              <ImageIcon className="mr-2" />
              PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportSVG}>
              <LayersIcon className="mr-2" />
              SVG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJSON}>
              <FileIcon className="mr-2" />
              JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Import */}
        <ToolbarButton
          icon={<UploadIcon />}
          label="Импорт"
          tooltip="Загрузить JSON"
          onClick={handleImportJSON}
        />

        <Separator orientation="vertical" className="h-6" />

        {/* Layout Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2" disabled={!hasNodes}>
              <LayersIcon />
              Раскладка
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={layoutVertical}>
              <LayoutVerticalIcon className="mr-2" />
              Вертикальная
            </DropdownMenuItem>
            <DropdownMenuItem onClick={layoutHorizontal}>
              <LayoutHorizontalIcon className="mr-2" />
              Горизонтальная
            </DropdownMenuItem>
            <DropdownMenuItem onClick={layoutTree}>
              <LayoutTreeIcon className="mr-2" />
              Дерево
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6" />

        {/* Alignment Tools */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            icon={<AlignLeftIcon />}
            tooltip="Выровнять по левому краю"
            onClick={() => alignNodes('left')}
            disabled={selectedNodes.length < 2}
            data-testid="align-left"
          />
          <ToolbarButton
            icon={<AlignCenterHorizontalIcon />}
            tooltip="Выровнять по горизонтальному центру"
            onClick={() => alignNodes('v-center')}
            disabled={selectedNodes.length < 2}
            data-testid="align-h-center"
          />
          <ToolbarButton
            icon={<AlignRightIcon />}
            tooltip="Выровнять по правому краю"
            onClick={() => alignNodes('right')}
            disabled={selectedNodes.length < 2}
            data-testid="align-right"
          />
          <Separator orientation="vertical" className="h-4 mx-1" />
          <ToolbarButton
            icon={<AlignTopIcon />}
            tooltip="Выровнять по верхнему краю"
            onClick={() => alignNodes('top')}
            disabled={selectedNodes.length < 2}
            data-testid="align-top"
          />
          <ToolbarButton
            icon={<AlignCenterVerticalIcon />}
            tooltip="Выровнять по вертикальному центру"
            onClick={() => alignNodes('h-center')}
            disabled={selectedNodes.length < 2}
            data-testid="align-v-center"
          />
          <ToolbarButton
            icon={<AlignBottomIcon />}
            tooltip="Выровнять по нижнему краю"
            onClick={() => alignNodes('bottom')}
            disabled={selectedNodes.length < 2}
            data-testid="align-bottom"
          />
        </div>

        <div className="flex-1" />

        <ToolbarButton
          icon={theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          tooltip={theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
          onClick={toggleTheme}
          data-testid="theme-toggle"
        />

        <Separator orientation="vertical" className="h-6" />

        {/* Clear */}
        <ToolbarButton 
          icon={<TrashIcon />} 
          tooltip="Очистить всё" 
          onClick={handleClear} 
        />
      </div>
      <PresetModal open={presetModalOpen} onOpenChange={setPresetModalOpen} />
    </TooltipProvider>
  );
}

// ============================================================================
// Helper Components
// ============================================================================
interface ToolbarButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  'data-testid'?: string;
}

function ToolbarButton({ icon, tooltip, onClick, disabled, label, 'data-testid': testId }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size={label ? 'sm' : 'icon'} 
          onClick={onClick} 
          disabled={disabled}
          className={label ? 'gap-2' : ''}
          data-testid={testId}
        >
          {icon}
          {label}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function downloadFile(href: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = href;
  link.click();
}
