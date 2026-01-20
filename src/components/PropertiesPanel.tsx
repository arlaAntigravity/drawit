'use client';

import React from 'react';
import { useStore, NodeData } from '@/store/useStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const colorPresets = [
  '#1e1e2e', '#2d2d3f', '#3d3d52',
  '#6366f1', '#8b5cf6', '#ec4899',
  '#22c55e', '#f59e0b', '#06b6d4',
  '#ef4444', '#f97316', '#eab308',
];

export function PropertiesPanel() {
  const { nodes, selectedNodes, updateNodeData } = useStore();
  
  const selectedNode = nodes.find((n) => selectedNodes.includes(n.id));
  
  if (!selectedNode) {
    return (
      <div className="w-72 border-l border-border bg-card flex flex-col h-full">
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

  const data = selectedNode.data as NodeData;

  const handleChange = (key: keyof NodeData, value: string | number) => {
    updateNodeData(selectedNode.id, { [key]: value });
  };

  return (
    <div className="w-72 border-l border-border bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Свойства</h2>
        <p className="text-xs text-muted-foreground mt-1">{selectedNode.type}</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Text */}
          <div className="space-y-2">
            <Label htmlFor="label">Текст</Label>
            <Input
              id="label"
              value={data.label}
              onChange={(e) => handleChange('label', e.target.value)}
              className="bg-background"
            />
          </div>

          <Separator />

          {/* Colors */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Цвет заливки</Label>
              <div className="grid grid-cols-6 gap-1.5">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: data.backgroundColor === color ? '#fff' : 'transparent',
                    }}
                    onClick={() => handleChange('backgroundColor', color)}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={data.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="w-full h-8 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Label>Цвет обводки</Label>
              <div className="grid grid-cols-6 gap-1.5">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: data.borderColor === color ? '#fff' : 'transparent',
                    }}
                    onClick={() => handleChange('borderColor', color)}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={data.borderColor}
                onChange={(e) => handleChange('borderColor', e.target.value)}
                className="w-full h-8 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Label>Цвет текста</Label>
              <Input
                type="color"
                value={data.textColor}
                onChange={(e) => handleChange('textColor', e.target.value)}
                className="w-full h-8 cursor-pointer"
              />
            </div>
          </div>

          <Separator />

          {/* Size */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Ширина</Label>
                <span className="text-xs text-muted-foreground">{data.width}px</span>
              </div>
              <Slider
                value={[data.width]}
                onValueChange={([v]) => handleChange('width', v)}
                min={40}
                max={300}
                step={10}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Высота</Label>
                <span className="text-xs text-muted-foreground">{data.height}px</span>
              </div>
              <Slider
                value={[data.height]}
                onValueChange={([v]) => handleChange('height', v)}
                min={30}
                max={200}
                step={10}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Толщина обводки</Label>
                <span className="text-xs text-muted-foreground">{data.borderWidth}px</span>
              </div>
              <Slider
                value={[data.borderWidth]}
                onValueChange={([v]) => handleChange('borderWidth', v)}
                min={0}
                max={8}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Размер шрифта</Label>
                <span className="text-xs text-muted-foreground">{data.fontSize}px</span>
              </div>
              <Slider
                value={[data.fontSize]}
                onValueChange={([v]) => handleChange('fontSize', v)}
                min={8}
                max={32}
                step={1}
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
