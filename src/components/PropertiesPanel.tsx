'use client';

import { useStore } from '@/store/useStore';
import { NodeData } from '@/lib/types';
import { COLOR_PRESETS } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/color-picker';
import { SliderField } from '@/components/ui/slider-field';

export function PropertiesPanel() {
  const { nodes, selectedNodes, updateNodeData, commitNodeData } = useStore();
  
  const selectedNode = nodes.find((n) => selectedNodes.includes(n.id));
  
  if (!selectedNode) {
    return <EmptyState />;
  }

  const data = selectedNode.data as NodeData;

  const handleChange = (key: keyof NodeData, value: string | number) => {
    updateNodeData(selectedNode.id, { [key]: value });
  };

  const handleColorChange = (key: keyof NodeData, value: string) => {
    updateNodeData(selectedNode.id, { [key]: value });
    commitNodeData();
  };

  return (
    <div className="w-72 border-l border-border bg-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Свойства</h2>
        <p className="text-xs text-muted-foreground mt-1">{selectedNode.type}</p>
      </div>
      
      {/* Properties */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
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
                className="w-full h-8 cursor-pointer"
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
        </div>
      </ScrollArea>
    </div>
  );
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
