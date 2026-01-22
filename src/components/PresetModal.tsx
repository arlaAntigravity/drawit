'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/store/useStore';
import {
  PRESET_CATEGORIES,
  DIAGRAM_PRESETS,
  getPresetsByCategory,
  type PresetCategory,
  type DiagramPreset,
} from '@/lib/presets';
import { cn } from '@/lib/utils';

interface PresetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PresetModal({ open, onOpenChange }: PresetModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory>('basic');
  const [selectedPreset, setSelectedPreset] = useState<DiagramPreset | null>(null);
  const { setNodes, setEdges, pushHistory } = useStore();

  const filteredPresets = getPresetsByCategory(selectedCategory);

  const handleCreate = () => {
    if (!selectedPreset) return;

    pushHistory();
    setNodes(selectedPreset.nodes);
    setEdges(selectedPreset.edges);
    onOpenChange(false);
    setSelectedPreset(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedPreset(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Создать диаграмму</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 gap-4 min-h-0">
          {/* Sidebar - Categories */}
          <div className="w-48 shrink-0 border-r border-border pr-4">
            <ScrollArea className="h-full">
              <div className="space-y-1">
                {PRESET_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSelectedPreset(null);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    )}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main - Preset Grid */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-3 gap-4 p-1">
                {filteredPresets.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    isSelected={selectedPreset?.id === preset.id}
                    onClick={() => setSelectedPreset(preset)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button onClick={handleCreate} disabled={!selectedPreset}>
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Preset Card
// ============================================================================
interface PresetCardProps {
  preset: DiagramPreset;
  isSelected: boolean;
  onClick: () => void;
}

function PresetCard({ preset, isSelected, onClick }: PresetCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50',
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border bg-card hover:bg-accent/50'
      )}
    >
      {/* Preview placeholder */}
      <div className="aspect-video bg-background rounded mb-3 flex items-center justify-center border border-border">
        <PresetPreview preset={preset} />
      </div>
      <h3 className="font-medium text-sm truncate">{preset.name}</h3>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
        {preset.description}
      </p>
    </button>
  );
}

// ============================================================================
// Simple Preset Preview
// ============================================================================
function PresetPreview({ preset }: { preset: DiagramPreset }) {
  if (preset.nodes.length === 0) {
    return (
      <div className="text-muted-foreground text-xs">
        <span className="text-2xl">📄</span>
      </div>
    );
  }

  // Calculate bounding box
  const xs = preset.nodes.map((n) => n.position.x);
  const ys = preset.nodes.map((n) => n.position.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs) + 100;
  const maxY = Math.max(...ys) + 50;
  const width = maxX - minX + 20;
  const height = maxY - minY + 20;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full p-2">
      {/* Edges */}
      {preset.edges.map((edge) => {
        const source = preset.nodes.find((n) => n.id === edge.source);
        const target = preset.nodes.find((n) => n.id === edge.target);
        if (!source || !target) return null;

        const x1 = source.position.x - minX + 50;
        const y1 = source.position.y - minY + 25;
        const x2 = target.position.x - minX + 50;
        const y2 = target.position.y - minY + 25;

        return (
          <line
            key={edge.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.5"
          />
        );
      })}
      {/* Nodes */}
      {preset.nodes.map((node) => (
        <rect
          key={node.id}
          x={node.position.x - minX + 10}
          y={node.position.y - minY + 10}
          width="80"
          height="30"
          rx="4"
          fill="currentColor"
          opacity="0.3"
        />
      ))}
    </svg>
  );
}
