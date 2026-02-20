'use client';

import { useStore } from '@/store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { NodeData, EdgeData } from '@/lib/types';
import { COLOR_PRESETS } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/color-picker';
import { SliderField } from '@/components/ui/slider-field';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  ChevronDownIcon, 
  UploadIcon,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';
import { toast } from 'sonner';

export function PropertiesPanel() {
  const { 
    nodes, 
    selectedNodes, 
    updateNodeData, 
    commitNodeData,
    edges,
    selectedEdges,
    updateEdgeData,
    commitEdgeData
  } = useStore(useShallow((state) => ({
    nodes: state.nodes,
    selectedNodes: state.selectedNodes,
    updateNodeData: state.updateNodeData,
    commitNodeData: state.commitNodeData,
    edges: state.edges,
    selectedEdges: state.selectedEdges,
    updateEdgeData: state.updateEdgeData,
    commitEdgeData: state.commitEdgeData,
  })));
  
  const selectedNode = nodes.find((n) => selectedNodes.includes(n.id));
  const selectedEdge = edges.find((e) => selectedEdges.includes(e.id));
  
  if (!selectedNode && !selectedEdge) {
    return <EmptyState />;
  }

  if (selectedNode) {
    const data = selectedNode.data as NodeData;

    const handleChange = (key: keyof NodeData, value: string | number) => {
      updateNodeData(selectedNode.id, { [key]: value });
    };

    const handleColorChange = (key: keyof NodeData, value: string) => {
      updateNodeData(selectedNode.id, { [key]: value });
      commitNodeData();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Файл слишком большой. Максимум 5 MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        handleChange('imageUrl', result);
        commitNodeData();
      };
      reader.readAsDataURL(file);
    };

    return (
      <div className="w-72 border-l border-border bg-card flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Свойства узла</h2>
          <p className="text-xs text-muted-foreground mt-1">{selectedNode.type}</p>
        </div>
        
        {/* Properties */}
        <ScrollArea className="flex-1 h-full">
          <div className="p-4 space-y-6 pb-24">
            {/* Text Label */}
            <div className="space-y-2">
              <Label htmlFor="label">Текст</Label>
              <Input
                id="label"
                value={data.label}
                onChange={(e) => handleChange('label', e.target.value)}
                onBlur={commitNodeData}
                className="bg-background"
              />
            </div>

            {selectedNode.type === 'image' && (
              <>
                <Separator />
                {/* Image Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">URL Изображения</Label>
                    <Input
                      id="imageUrl"
                      value={data.imageUrl || ''}
                      onChange={(e) => handleChange('imageUrl', e.target.value)}
                      onBlur={commitNodeData}
                      placeholder="https://..."
                      className="bg-background text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Или загрузите файл</Label>
                    <div className="flex items-center">
                      <Input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <Button variant="outline" className="w-full bg-background" onClick={() => document.getElementById('imageUpload')?.click()}>
                        <UploadIcon className="w-4 h-4 mr-2" />
                        Выбрать изображение
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Colors Section */}
            <div className="space-y-4">
              <ColorPicker
                label="Цвет заливки"
                value={data.backgroundColor}
                presets={COLOR_PRESETS}
                onChange={(color) => handleColorChange('backgroundColor', color)}
              />

              <ColorPicker
                label="Цвет обводки"
                value={data.borderColor}
                presets={COLOR_PRESETS}
                onChange={(color) => handleColorChange('borderColor', color)}
              />

              <div className="space-y-2">
                <Label>Цвет текста</Label>
                <Input
                  type="color"
                  value={data.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  onBlur={commitNodeData}
                  className="w-full h-8 cursor-pointer shadow-none p-0 border-none"
                />
              </div>
            </div>

            <Separator />

            {/* Size Section */}
            <div className="space-y-4">
              <SliderField
                label="Ширина"
                value={data.width}
                min={40}
                max={300}
                step={10}
                onChange={(v) => handleChange('width', v)}
                onCommit={commitNodeData}
              />

              <SliderField
                label="Высота"
                value={data.height}
                min={30}
                max={200}
                step={10}
                onChange={(v) => handleChange('height', v)}
                onCommit={commitNodeData}
              />

              <SliderField
                label="Толщина обводки"
                value={data.borderWidth}
                min={0}
                max={8}
                step={1}
                onChange={(v) => handleChange('borderWidth', v)}
                onCommit={commitNodeData}
              />

              <SliderField
                label="Размер шрифта"
                value={data.fontSize}
                min={8}
                max={32}
                step={1}
                onChange={(v) => handleChange('fontSize', v)}
                onCommit={commitNodeData}
              />
            </div>

            <Separator />

            {/* Formatting Section */}
            <div className="space-y-4 pb-4">
              <Label>Форматирование текста</Label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-1 bg-muted/50 p-1 rounded-md w-fit text-muted-foreground p-1 border border-border">
                  <Button 
                    variant={data.fontWeight === 'bold' ? 'secondary' : 'ghost'} 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => { handleChange('fontWeight', data.fontWeight === 'bold' ? 'normal' : 'bold'); commitNodeData(); }}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={data.fontStyle === 'italic' ? 'secondary' : 'ghost'} 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => { handleChange('fontStyle', data.fontStyle === 'italic' ? 'normal' : 'italic'); commitNodeData(); }}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={data.textDecoration === 'underline' ? 'secondary' : 'ghost'} 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => { handleChange('textDecoration', data.textDecoration === 'underline' ? 'none' : 'underline'); commitNodeData(); }}
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-1 bg-muted/50 p-1 rounded-md w-fit text-muted-foreground p-1 border border-border">
                  <Button 
                    variant={data.textAlign === 'left' ? 'secondary' : 'ghost'} 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => { handleChange('textAlign', 'left'); commitNodeData(); }}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={data.textAlign === 'center' ? 'secondary' : 'ghost'} 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => { handleChange('textAlign', 'center'); commitNodeData(); }}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={data.textAlign === 'right' ? 'secondary' : 'ghost'} 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => { handleChange('textAlign', 'right'); commitNodeData(); }}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={data.textAlign === 'justify' ? 'secondary' : 'ghost'} 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => { handleChange('textAlign', 'justify'); commitNodeData(); }}
                  >
                    <AlignJustify className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Edge Properties
  if (selectedEdge) {
    const data: EdgeData = {
      label: '',
      animated: false,
      strokeStyle: 'solid',
      stroke: '#8b5cf6',
      strokeWidth: 2,
      ...(selectedEdge.data || {}),
    };

    const handleChange = (key: keyof EdgeData, value: string | number | boolean) => {
      updateEdgeData(selectedEdge.id, { [key]: value });
    };

    const handleColorChange = (value: string) => {
      updateEdgeData(selectedEdge.id, { stroke: value });
      commitEdgeData();
    };

    const lineStyles: { value: EdgeData['strokeStyle']; label: string }[] = [
      { value: 'solid', label: 'Сплошная' },
      { value: 'dashed', label: 'Пунктир' },
      { value: 'dotted', label: 'Точки' },
    ];

    return (
      <div className="w-72 border-l border-border bg-card flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Свойства связи</h2>
        </div>
        
        {/* Properties */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Edge Label */}
            <div className="space-y-2">
              <Label htmlFor="edge-label">Текст</Label>
              <Input
                id="edge-label"
                value={data.label}
                onChange={(e) => handleChange('label', e.target.value)}
                onBlur={commitEdgeData}
                placeholder="Текст связи..."
                className="bg-background"
              />
            </div>

            <Separator />

            {/* Edge Style */}
            <div className="space-y-4">
              <ColorPicker
                label="Цвет линии"
                value={data.stroke || '#8b5cf6'}
                presets={COLOR_PRESETS}
                onChange={handleColorChange}
              />

              <SliderField
                label="Толщина линии"
                value={data.strokeWidth || 2}
                min={1}
                max={8}
                step={1}
                onChange={(v) => handleChange('strokeWidth', v)}
                onCommit={commitEdgeData}
              />

              <div className="space-y-2">
                <Label>Тип линии</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-background">
                      {lineStyles.find(s => s.value === data.strokeStyle)?.label || 'Сплошная'}
                      <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                    {lineStyles.map((style) => (
                      <DropdownMenuItem 
                        key={style.value}
                        onClick={() => {
                          handleChange('strokeStyle', style.value);
                          commitEdgeData();
                        }}
                      >
                        {style.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="animated">Анимация</Label>
                <input
                  id="animated"
                  type="checkbox"
                  checked={data.animated}
                  onChange={(e) => {
                    handleChange('animated', e.target.checked);
                    commitEdgeData();
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return <EmptyState />;
}

function EmptyState() {
  return (
    <div className="w-72 border-l border-border bg-card flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Свойства</h2>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground text-center">
          Выберите элемент для редактирования свойств
        </p>
      </div>
    </div>
  );
}
