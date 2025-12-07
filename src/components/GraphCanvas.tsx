import { useEffect, useRef, useCallback, useState, type RefObject } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';
import { loadTopics, type TopicNode } from '../services/dataLoader';
import { generateConnectionArticle } from '../services/api';
import type { useGraphState } from '../hooks/useGraphState';

interface GraphCanvasProps {
  onNodeSelect?: (nodeIds: string[]) => void;
  onArticleGenerated?: (result: any) => void;
  onNodeView?: (node: { id: string; title: string; content: string } | null) => void;
  onSigmaReady?: (sigma: Sigma | null) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  graphState?: ReturnType<typeof useGraphState>;
  isGenerating?: boolean;
  generationProgress?: string;
}

const COLORS = {
  node: '#666666',
  nodeHover: '#ffffff',
  nodeSelected: '#ffffff',
  nodeGenerated: '#888888',
  nodeSearchMatch: '#ffffff',
  nodeMuted: '#333333',
  edge: '#222222',
  edgeConnected: '#444444',
  edgeNew: '#555555',
};

// Storage keys
const STORAGE_KEYS = {
  nodes: 'grokipedia-nodes',
  edges: 'grokipedia-edges',
  positions: 'grokipedia-positions',
  generatedTopics: 'grokipedia-generated',
};

export default function GraphCanvas({ 
  onNodeSelect, 
  onArticleGenerated, 
  onNodeView,
  onSigmaReady,
  searchInputRef,
  isGenerating: externalIsGenerating,
  generationProgress,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const topicsRef = useRef<TopicNode[]>([]);
  
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TopicNode[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Initialize graph
  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph();
    graphRef.current = graph;

    const sigma = new Sigma(graph, containerRef.current, {
      renderLabels: true,
      renderEdgeLabels: false,
      labelFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      labelSize: 12,
      labelWeight: '400',
      labelColor: { color: '#888888' },
      defaultNodeColor: COLORS.node,
      defaultNodeType: 'circle',
      defaultEdgeColor: COLORS.edge,
      defaultEdgeType: 'line',
      labelDensity: 0.8,
      labelGridCellSize: 100,
      labelRenderedSizeThreshold: 5,
      zIndex: true,
      minCameraRatio: 0.1,
      maxCameraRatio: 4,
      stagePadding: 50,
      allowInvalidContainer: true,
      
      nodeReducer: (node, data) => {
        const res = { ...data };
        const isSelected = selectedNodes.includes(node);
        const isSearchMatch = searchQuery && data.label?.toLowerCase().includes(searchQuery.toLowerCase());
        const isHovered = hoveredNode === node;
        
        // Check if connected to hovered or selected node
        let isConnected = false;
        const checkNodes = hoveredNode ? [hoveredNode, ...selectedNodes] : selectedNodes;
        for (const n of checkNodes) {
          if (n !== node && (graph.hasEdge(node, n) || graph.hasEdge(n, node))) {
            isConnected = true;
            break;
          }
        }
        
        // Determine state
        if (isSelected) {
          res.color = COLORS.nodeSelected;
          res.size = (data.size || 4) * 1.4;
        } else if (isHovered) {
          res.color = COLORS.nodeHover;
          res.size = (data.size || 4) * 1.3;
        } else if (isSearchMatch) {
          res.color = COLORS.nodeSearchMatch;
        } else if (searchQuery && !isSearchMatch) {
          res.color = COLORS.nodeMuted;
          res.label = '';
        } else if (isConnected) {
          res.color = COLORS.nodeHover;
          res.size = (data.size || 4) * 1.1;
        } else if (hoveredNode || selectedNodes.length > 0) {
          res.color = COLORS.nodeMuted;
        }
        
        return res;
      },
      
      edgeReducer: (edge, data) => {
        const res = { ...data };
        if (hoveredNode) {
          const [source, target] = graph.extremities(edge);
          if (source !== hoveredNode && target !== hoveredNode) {
            res.color = 'rgba(255, 255, 255, 0.05)';
          }
        }
        return res;
      },
    });

    sigmaRef.current = sigma;
    onSigmaReady?.(sigma);

    // Load topics
    const topics = loadTopics();
    topicsRef.current = topics;

    // Scatter nodes randomly in a circular area
    const radius = Math.sqrt(topics.length) * 60;
    topics.forEach((topic) => {
      const angle = Math.random() * 2 * Math.PI;
      const r = Math.random() * radius;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);

      graph.addNode(topic.id, {
        label: topic.label,
        x,
        y,
        size: 4,
        color: COLORS.node,
      });
    });

    sigma.refresh();

    // Hover effects
    sigma.on('enterNode', ({ node }) => {
      setHoveredNode(node);
      containerRef.current!.style.cursor = 'pointer';
    });

    sigma.on('leaveNode', () => {
      setHoveredNode(null);
      containerRef.current!.style.cursor = 'default';
    });

    // Click to select (multi-select any number)
    sigma.on('clickNode', ({ node }) => {
      setSelectedNodes((prev) => {
        if (prev.includes(node)) {
          // Deselect if already selected
          return prev.filter((n) => n !== node);
        } else {
          // Add to selection
          return [...prev, node];
        }
      });
    });

    // Double-click to view article
    sigma.on('doubleClickNode', ({ node }) => {
      const topic = topicsRef.current.find((t) => t.id === node);
      if (topic && onNodeView) {
        onNodeView({
          id: topic.id,
          title: topic.label,
          content: topic.content,
        });
      }
    });

    // Click stage to deselect all
    sigma.on('clickStage', () => {
      setSelectedNodes([]);
    });

    // Load saved state
    const savedEdges = localStorage.getItem(STORAGE_KEYS.edges);
    const savedPositions = localStorage.getItem(STORAGE_KEYS.positions);
    const savedGenerated = localStorage.getItem(STORAGE_KEYS.generatedTopics);
    
    if (savedEdges) {
      try {
        const edges = JSON.parse(savedEdges);
        edges.forEach((e: { source: string; target: string }) => {
          if (graph.hasNode(e.source) && graph.hasNode(e.target) && !graph.hasEdge(e.source, e.target)) {
            graph.addEdge(e.source, e.target, { color: COLORS.edgeNew, size: 1 });
          }
        });
      } catch (err) { console.error('Failed to load edges', err); }
    }
    
    if (savedPositions) {
      try {
        const positions = JSON.parse(savedPositions);
        Object.entries(positions).forEach(([nodeId, pos]: [string, any]) => {
          if (graph.hasNode(nodeId)) {
            graph.setNodeAttribute(nodeId, 'x', pos.x);
            graph.setNodeAttribute(nodeId, 'y', pos.y);
          }
        });
      } catch (err) { console.error('Failed to load positions', err); }
    }
    
    if (savedGenerated) {
      try {
        const generated = JSON.parse(savedGenerated);
        generated.forEach((t: TopicNode) => {
          if (!graph.hasNode(t.id)) {
            graph.addNode(t.id, {
              label: t.label,
              x: Math.random() * 500 - 250,
              y: Math.random() * 500 - 250,
              size: 5,
              color: COLORS.nodeGenerated,
            });
            topicsRef.current.push(t);
          }
        });
      } catch (err) { console.error('Failed to load generated', err); }
    }
    
    sigma.refresh();

    return () => {
      sigma.kill();
    };
  }, []);

  // Save state to localStorage
  const saveState = useCallback(() => {
    if (!graphRef.current) return;
    const graph = graphRef.current;
    
    // Save edges
    const edges: { source: string; target: string }[] = [];
    graph.forEachEdge((_, __, source, target) => {
      edges.push({ source, target });
    });
    localStorage.setItem(STORAGE_KEYS.edges, JSON.stringify(edges));
    
    // Save positions
    const positions: Record<string, { x: number; y: number }> = {};
    graph.forEachNode((node) => {
      positions[node] = {
        x: graph.getNodeAttribute(node, 'x'),
        y: graph.getNodeAttribute(node, 'y'),
      };
    });
    localStorage.setItem(STORAGE_KEYS.positions, JSON.stringify(positions));
    
    // Save generated topics
    const generated = topicsRef.current.filter(t => t.id.startsWith('generated-'));
    localStorage.setItem(STORAGE_KEYS.generatedTopics, JSON.stringify(generated));
  }, []);

  // Smooth animated force layout
  const animateLayout = useCallback((duration = 2000) => {
    if (!graphRef.current || !sigmaRef.current) return;
    const graph = graphRef.current;
    const sigma = sigmaRef.current;
    
    // Store initial positions
    const initialPositions: Record<string, { x: number; y: number }> = {};
    const targetPositions: Record<string, { x: number; y: number }> = {};
    
    graph.forEachNode((node) => {
      initialPositions[node] = {
        x: graph.getNodeAttribute(node, 'x'),
        y: graph.getNodeAttribute(node, 'y'),
      };
      targetPositions[node] = { ...initialPositions[node] };
    });
    
    // Calculate target positions using force simulation
    const iterations = 100;
    const attraction = 0.08;
    const repulsion = 800;
    const damping = 0.9;
    
    for (let i = 0; i < iterations; i++) {
      const forces: Record<string, { x: number; y: number }> = {};
      
      Object.keys(targetPositions).forEach((node) => {
        forces[node] = { x: 0, y: 0 };
      });
      
      // Attraction between connected nodes
      graph.forEachEdge((_, __, source, target) => {
        const sx = targetPositions[source].x;
        const sy = targetPositions[source].y;
        const tx = targetPositions[target].x;
        const ty = targetPositions[target].y;
        
        const dx = tx - sx;
        const dy = ty - sy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const idealDist = 120;
        
        const force = (dist - idealDist) * attraction;
        forces[source].x += (dx / dist) * force;
        forces[source].y += (dy / dist) * force;
        forces[target].x -= (dx / dist) * force;
        forces[target].y -= (dy / dist) * force;
      });
      
      // Repulsion between all nodes
      const nodes = Object.keys(targetPositions);
      for (let j = 0; j < nodes.length; j++) {
        for (let k = j + 1; k < nodes.length; k++) {
          const n1 = nodes[j];
          const n2 = nodes[k];
          const dx = targetPositions[n2].x - targetPositions[n1].x;
          const dy = targetPositions[n2].y - targetPositions[n1].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const force = repulsion / (dist * dist);
          forces[n1].x -= (dx / dist) * force;
          forces[n1].y -= (dy / dist) * force;
          forces[n2].x += (dx / dist) * force;
          forces[n2].y += (dy / dist) * force;
        }
      }
      
      // Apply forces with damping
      Object.keys(targetPositions).forEach((node) => {
        targetPositions[node].x += forces[node].x * 0.1 * damping;
        targetPositions[node].y += forces[node].y * 0.1 * damping;
      });
    }
    
    // Animate from initial to target
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      
      graph.forEachNode((node) => {
        const initial = initialPositions[node];
        const target = targetPositions[node];
        graph.setNodeAttribute(node, 'x', initial.x + (target.x - initial.x) * eased);
        graph.setNodeAttribute(node, 'y', initial.y + (target.y - initial.y) * eased);
      });
      
      sigma.refresh();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        saveState();
      }
    };
    
    requestAnimationFrame(animate);
  }, [saveState]);

  // Manual reorganize button
  const reorganizeGraph = useCallback(() => {
    animateLayout(1500);
  }, [animateLayout]);

  // Update sigma when selection or search changes
  useEffect(() => {
    sigmaRef.current?.refresh();
    onNodeSelect?.(selectedNodes);
  }, [selectedNodes, hoveredNode, searchQuery, onNodeSelect]);

  // Update search results when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const matches = topicsRef.current
      .filter((t) => t.label.toLowerCase().includes(query))
      .slice(0, 8); // Limit to 8 results
    setSearchResults(matches);
  }, [searchQuery]);

  // Focus camera on a specific node
  const focusOnNode = useCallback((nodeId: string) => {
    if (!sigmaRef.current || !graphRef.current) return;
    
    const nodePosition = sigmaRef.current.getNodeDisplayData(nodeId);
    if (nodePosition) {
      sigmaRef.current.getCamera().animate(
        { x: nodePosition.x, y: nodePosition.y, ratio: 0.3 },
        { duration: 400 }
      );
    }
    setSearchQuery('');
    setIsSearchFocused(false);
  }, []);

  // Select node from search
  const selectFromSearch = useCallback((nodeId: string) => {
    setSelectedNodes((prev) => {
      if (prev.includes(nodeId)) return prev;
      return [...prev, nodeId]; // Allow unlimited selections
    });
    focusOnNode(nodeId);
  }, [focusOnNode]);

  // Generate connection between selected nodes (requires 2+)
  const generateConnection = useCallback(async () => {
    if (selectedNodes.length < 2 || !graphRef.current || !sigmaRef.current) return;

    // Get all selected topics
    const selectedTopics = selectedNodes
      .map(id => topicsRef.current.find(t => t.id === id))
      .filter((t): t is TopicNode => t !== undefined);

    if (selectedTopics.length < 2) return;

    setIsGenerating(true);

    try {
      const newArticle = await generateConnectionArticle(
        selectedTopics.map(t => ({ title: t.label, content: t.content }))
      );

      const graph = graphRef.current;
      const newNodeId = `generated-${Date.now()}`;

      // Position new node at the centroid of all selected nodes
      let sumX = 0, sumY = 0;
      selectedNodes.forEach(id => {
        sumX += graph.getNodeAttribute(id, 'x');
        sumY += graph.getNodeAttribute(id, 'y');
      });
      const newX = sumX / selectedNodes.length;
      const newY = sumY / selectedNodes.length;

      // Add new node
      graph.addNode(newNodeId, {
        label: newArticle.title,
        x: newX,
        y: newY,
        size: 5,
        color: COLORS.nodeGenerated,
      });

      // Add edges to ALL selected nodes
      selectedNodes.forEach(id => {
        graph.addEdge(id, newNodeId, { color: COLORS.edgeNew, size: 1 });
      });

      // Store the new topic
      topicsRef.current.push({
        id: newNodeId,
        label: newArticle.title,
        slug: newArticle.slug,
        content: newArticle.content,
      });

      sigmaRef.current.refresh();

      // Notify parent
      onArticleGenerated?.(newArticle);

      // Clear selection
      setSelectedNodes([]);

      // Animate camera to new node then run layout
      const nodePosition = sigmaRef.current.getNodeDisplayData(newNodeId);
      if (nodePosition) {
        sigmaRef.current.getCamera().animate(
          { x: nodePosition.x, y: nodePosition.y, ratio: 0.6 },
          { duration: 400 }
        );
      }
      
      // Auto-cluster after a short delay
      setTimeout(() => {
        animateLayout(1200);
      }, 500);
      
    } catch (error) {
      console.error('Error generating connection:', error);
      alert('Failed to generate connection. Please try again.');
    }

    setIsGenerating(false);
  }, [selectedNodes, onArticleGenerated, animateLayout]);

  // Get labels for selected nodes
  const getSelectedLabels = () => {
    return selectedNodes.map((id) => {
      const topic = topicsRef.current.find((t) => t.id === id);
      return topic?.label || id;
    });
  };

  // Zoom controls
  const zoomIn = useCallback(() => {
    sigmaRef.current?.getCamera().animatedZoom({ duration: 200 });
  }, []);

  const zoomOut = useCallback(() => {
    sigmaRef.current?.getCamera().animatedUnzoom({ duration: 200 });
  }, []);

  const resetZoom = useCallback(() => {
    sigmaRef.current?.getCamera().animatedReset({ duration: 300 });
  }, []);

  return (
    <div className="graph-canvas-container">
      <div ref={containerRef} className="graph-canvas" />

      {/* Search */}
      <div className="search-container">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>
        
        {isSearchFocused && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((topic) => (
              <button
                key={topic.id}
                className="search-result-item"
                onClick={() => selectFromSearch(topic.id)}
              >
                <span className="result-label">{topic.label}</span>
                <span className="result-action">select</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {(isGenerating || externalIsGenerating) && (
        <div className="generating-indicator">
          <div className="spinner" />
          <span>{generationProgress || 'synthesizing...'}</span>
        </div>
      )}

      {/* Selection */}
      {selectedNodes.length > 0 && !isGenerating && (
        <div className="selection-panel">
          <div className="selection-header">
            <div className="selection-title">
              <span className="selection-count">{selectedNodes.length} selected</span>
              {selectedNodes.length >= 2 && <span className="selection-badge">ready</span>}
            </div>
            <button className="clear-btn" onClick={() => setSelectedNodes([])}>clear</button>
          </div>
          
          <div className="selected-items">
            {getSelectedLabels().map((label, i) => (
              <div key={i} className="selected-item">
                <span className="selected-dot" style={{ background: '#fff' }} />
                <span className="selected-label">{label}</span>
                <button 
                  className="remove-selection"
                  onClick={() => setSelectedNodes(prev => prev.filter((_, idx) => idx !== i))}
                >×</button>
              </div>
            ))}
          </div>

          {selectedNodes.length >= 2 && (
            <button
              className="generate-btn"
              onClick={generateConnection}
              disabled={isGenerating}
            >
              {isGenerating ? 'synthesizing...' : 'synthesize'}
            </button>
          )}

          {selectedNodes.length === 1 && (
            <p className="selection-hint">select one more to synthesize</p>
          )}
        </div>
      )}

      {/* Zoom */}
      <div className="zoom-controls">
        <button className="zoom-btn" onClick={zoomIn}>+</button>
        <button className="zoom-btn" onClick={resetZoom}>○</button>
        <button className="zoom-btn" onClick={zoomOut}>−</button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <button className="toolbar-btn" onClick={reorganizeGraph}>cluster</button>
        <button className="toolbar-btn" onClick={saveState}>save</button>
      </div>

      {/* Instructions */}
      {selectedNodes.length === 0 && !searchQuery && (
        <div className="instructions">
          <span>click to select · double-click to view · select 2+ to synthesize</span>
        </div>
      )}
    </div>
  );
}
