'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  onCommit?: () => void;
}

export function SliderField({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  unit = 'px',
  onChange,
  onCommit,
}: SliderFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">{value}{unit}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        onValueCommit={onCommit ? () => onCommit() : undefined}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}
