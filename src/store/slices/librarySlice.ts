import { Template } from '@/lib/types';
import { DiagramState } from '../useStore';

export interface LibrarySlice {
  templates: Template[];
  saveTemplate: (name: string) => void;
  deleteTemplate: (id: string) => void;
}

export const createLibrarySlice = (
  set: (partial: Partial<DiagramState> | ((state: DiagramState) => Partial<DiagramState>)) => void,
  get: () => DiagramState,
): LibrarySlice => ({
  templates: [],

  saveTemplate: (name: string) => {
    const { nodes, edges, selectedNodes, selectedEdges } = get();
    
    // Filter to selected elements only
    const templateNodes = nodes.filter(n => selectedNodes.includes(n.id));
    const templateEdges = edges.filter(e => selectedEdges.includes(e.id));
    
    if (templateNodes.length === 0) return;

    // Normalize positions so the template is centered around (0,0) or top-left
    const minX = Math.min(...templateNodes.map(n => n.position.x));
    const minY = Math.min(...templateNodes.map(n => n.position.y));

    const normalizedNodes = templateNodes.map(n => ({
      ...n,
      position: {
        x: n.position.x - minX,
        y: n.position.y - minY,
      }
    }));

    const newTemplate: Template = {
      id: `template-${Date.now()}`,
      name,
      nodes: normalizedNodes,
      edges: templateEdges,
    };

    set({ templates: [...get().templates, newTemplate] });
  },

  deleteTemplate: (id: string) => {
    set({ templates: get().templates.filter(t => t.id !== id) });
  },
});
