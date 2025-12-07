// Graph State Management with Undo/Redo and History
import { useState, useCallback, useEffect } from 'react';
import type { KnowledgeNode, GraphEdge, HistoryEntry, Annotation } from '../types/knowledge';

const STORAGE_KEY = 'grokipedia-state-v2';
const MAX_HISTORY = 50;

export interface GraphState {
  nodes: Map<string, KnowledgeNode>;
  edges: GraphEdge[];
  positions: Map<string, { x: number; y: number }>;
}

interface UndoRedoState {
  past: HistoryEntry[];
  future: HistoryEntry[];
}

export function useGraphState() {
  const [state, setState] = useState<GraphState>({
    nodes: new Map(),
    edges: [],
    positions: new Map(),
  });
  
  const [history, setHistory] = useState<UndoRedoState>({ past: [], future: [] });
  const [filter, setFilter] = useState<{
    types: ('synthesis' | 'expansion' | 'import' | 'manual' | 'seed')[];
    domains: string[];
    minConfidence: number;
    searchQuery: string;
  }>({
    types: [],
    domains: [],
    minConfidence: 0,
    searchQuery: '',
  });
  
  const [viewPath, setViewPath] = useState<string[]>([]); // Breadcrumb path
  const [compareNodes, setCompareNodes] = useState<[string, string] | null>(null);

  // Load state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState({
          nodes: new Map(Object.entries(parsed.nodes || {})),
          edges: parsed.edges || [],
          positions: new Map(Object.entries(parsed.positions || {})),
        });
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    }
  }, []);

  // Save state on change
  const saveState = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        nodes: Object.fromEntries(state.nodes),
        edges: state.edges,
        positions: Object.fromEntries(state.positions),
      }));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [state]);

  // Add history entry
  const addHistory = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    setHistory(prev => ({
      past: [...prev.past.slice(-MAX_HISTORY), {
        ...entry,
        id: `hist-${Date.now()}`,
        timestamp: new Date().toISOString(),
      }],
      future: [], // Clear redo stack on new action
    }));
  }, []);

  // Undo
  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
      
      const lastAction = prev.past[prev.past.length - 1];
      
      // Reverse the action
      setState(currentState => {
        const newState = { ...currentState };
        
        if (lastAction.action === 'create_node' && lastAction.nodeId) {
          newState.nodes = new Map(currentState.nodes);
          newState.nodes.delete(lastAction.nodeId);
          newState.edges = currentState.edges.filter(
            e => e.source !== lastAction.nodeId && e.target !== lastAction.nodeId
          );
        } else if (lastAction.action === 'delete_node' && lastAction.previousState) {
          newState.nodes = new Map(currentState.nodes);
          newState.nodes.set(lastAction.nodeId!, lastAction.previousState as KnowledgeNode);
        } else if (lastAction.action === 'update_node' && lastAction.previousState && lastAction.nodeId) {
          newState.nodes = new Map(currentState.nodes);
          const existing = newState.nodes.get(lastAction.nodeId);
          if (existing) {
            newState.nodes.set(lastAction.nodeId, { ...existing, ...lastAction.previousState });
          }
        }
        
        return newState;
      });
      
      return {
        past: prev.past.slice(0, -1),
        future: [lastAction, ...prev.future],
      };
    });
  }, []);

  // Redo
  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;
      
      const nextAction = prev.future[0];
      
      // Re-apply the action
      setState(currentState => {
        const newState = { ...currentState };
        
        if (nextAction.action === 'create_node' && nextAction.newState) {
          newState.nodes = new Map(currentState.nodes);
          newState.nodes.set(nextAction.nodeId!, nextAction.newState as KnowledgeNode);
        } else if (nextAction.action === 'delete_node' && nextAction.nodeId) {
          newState.nodes = new Map(currentState.nodes);
          newState.nodes.delete(nextAction.nodeId);
        } else if (nextAction.action === 'update_node' && nextAction.newState && nextAction.nodeId) {
          newState.nodes = new Map(currentState.nodes);
          const existing = newState.nodes.get(nextAction.nodeId);
          if (existing) {
            newState.nodes.set(nextAction.nodeId, { ...existing, ...nextAction.newState });
          }
        }
        
        return newState;
      });
      
      return {
        past: [...prev.past, nextAction],
        future: prev.future.slice(1),
      };
    });
  }, []);

  // Add node
  const addNode = useCallback((node: KnowledgeNode, position?: { x: number; y: number }) => {
    setState(prev => {
      const newNodes = new Map(prev.nodes);
      newNodes.set(node.id, node);
      
      const newPositions = new Map(prev.positions);
      if (position) {
        newPositions.set(node.id, position);
      }
      
      return { ...prev, nodes: newNodes, positions: newPositions };
    });
    
    addHistory({
      action: 'create_node',
      nodeId: node.id,
      newState: node,
    });
  }, [addHistory]);

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    const node = state.nodes.get(nodeId);
    if (!node) return;
    
    setState(prev => {
      const newNodes = new Map(prev.nodes);
      newNodes.delete(nodeId);
      
      const newEdges = prev.edges.filter(
        e => e.source !== nodeId && e.target !== nodeId
      );
      
      const newPositions = new Map(prev.positions);
      newPositions.delete(nodeId);
      
      return { nodes: newNodes, edges: newEdges, positions: newPositions };
    });
    
    addHistory({
      action: 'delete_node',
      nodeId,
      previousState: node,
    });
  }, [state.nodes, addHistory]);

  // Update node
  const updateNode = useCallback((nodeId: string, updates: Partial<KnowledgeNode>) => {
    const node = state.nodes.get(nodeId);
    if (!node) return;
    
    setState(prev => {
      const newNodes = new Map(prev.nodes);
      newNodes.set(nodeId, { ...node, ...updates, updatedAt: new Date().toISOString() });
      return { ...prev, nodes: newNodes };
    });
    
    addHistory({
      action: 'update_node',
      nodeId,
      previousState: node,
      newState: updates,
    });
  }, [state.nodes, addHistory]);

  // Add edge
  const addEdge = useCallback((source: string, target: string, relationship: GraphEdge['relationship'] = 'synthesized_from') => {
    const edge: GraphEdge = {
      id: `edge-${Date.now()}`,
      source,
      target,
      relationship,
      weight: 1,
      createdAt: new Date().toISOString(),
    };
    
    setState(prev => ({
      ...prev,
      edges: [...prev.edges, edge],
    }));
    
    addHistory({
      action: 'create_edge',
      edgeId: edge.id,
    });
  }, [addHistory]);

  // Add annotation
  const addAnnotation = useCallback((nodeId: string, annotation: Omit<Annotation, 'id' | 'nodeId' | 'createdAt'>) => {
    const node = state.nodes.get(nodeId);
    if (!node) return;
    
    const newAnnotation: Annotation = {
      ...annotation,
      id: `ann-${Date.now()}`,
      nodeId,
      createdAt: new Date().toISOString(),
    };
    
    updateNode(nodeId, {
      annotations: [...node.annotations, newAnnotation],
    });
  }, [state.nodes, updateNode]);

  // Filter nodes
  const getFilteredNodes = useCallback(() => {
    const filtered: KnowledgeNode[] = [];
    
    state.nodes.forEach(node => {
      // Type filter
      if (filter.types.length > 0 && !filter.types.includes(node.generationMethod)) {
        return;
      }
      
      // Domain filter
      if (filter.domains.length > 0 && !node.domains.some(d => filter.domains.includes(d))) {
        return;
      }
      
      // Confidence filter
      if (node.confidence < filter.minConfidence) {
        return;
      }
      
      // Search filter
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        if (!node.title.toLowerCase().includes(query) && 
            !node.content.toLowerCase().includes(query)) {
          return;
        }
      }
      
      filtered.push(node);
    });
    
    return filtered;
  }, [state.nodes, filter]);

  // Export functions
  const exportJSON = useCallback(() => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      nodes: Object.fromEntries(state.nodes),
      edges: state.edges,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grokipedia-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const exportMarkdown = useCallback(() => {
    let md = `# Grokipedia Knowledge Export\n\nExported: ${new Date().toISOString()}\n\n`;
    
    state.nodes.forEach(node => {
      md += `## ${node.title}\n\n`;
      md += `*Confidence: ${(node.confidence * 100).toFixed(0)}% | Status: ${node.verificationStatus}*\n\n`;
      md += `${node.content}\n\n`;
      
      if (node.claims.length > 0) {
        md += `### Claims\n\n`;
        node.claims.forEach(claim => {
          const status = claim.verified ? '✓' : '○';
          md += `- ${status} ${claim.statement}\n`;
        });
        md += '\n';
      }
      
      if (node.citations.length > 0) {
        md += `### Sources\n\n`;
        node.citations.forEach(citation => {
          md += `- [${citation.title}](${citation.url})\n`;
        });
        md += '\n';
      }
      
      md += '---\n\n';
    });
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grokipedia-export-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  // Navigation
  const navigateTo = useCallback((nodeId: string) => {
    setViewPath(prev => [...prev, nodeId]);
  }, []);

  const navigateBack = useCallback(() => {
    setViewPath(prev => prev.slice(0, -1));
  }, []);

  return {
    state,
    history,
    filter,
    viewPath,
    compareNodes,
    
    // Actions
    addNode,
    deleteNode,
    updateNode,
    addEdge,
    addAnnotation,
    saveState,
    
    // Undo/Redo
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    
    // Filtering
    setFilter,
    getFilteredNodes,
    
    // Export
    exportJSON,
    exportMarkdown,
    
    // Navigation
    navigateTo,
    navigateBack,
    setCompareNodes,
  };
}
