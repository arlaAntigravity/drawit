'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  label: string;
  value: string;
  presets: string[];
  onChange: (color: string) => void;
}

export function ColorPicker({ label, value, presets, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-6 gap-1.5">
        {presets.map((color) => (
          <button
            key={color}
            className="w-8 h-8 rounded border-2 transition-all hover:scale-110"
            style={{
              backgroundColor: color,
              borderColor: value === color ? '#fff' : 'transparent',
            }}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
      <Input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 cursor-pointer"
      />
    </div>
  );
}
