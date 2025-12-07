import { useEffect, useRef, useCallback, useState, useMemo, type RefObject } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import type { TopicNode } from '../services/dataLoader';
import { generateConnectionArticle } from '../services/api';
import pocGeneratedData from '../data/pocGeneratedData.json';

interface GraphCanvas3DProps {
  onNodeSelect?: (nodeIds: string[]) => void;
  onArticleGenerated?: (result: any) => void;
  onNodeView?: (node: { id: string; title: string; content: string } | null) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  isGenerating?: boolean;
  generationProgress?: string;
}

interface GraphNode {
  id: string;
  label: string;
  content: string;
  isGenerated: boolean;
  isUncertainty: boolean;
  x?: number;
  y?: number;
  z?: number;
}

interface GraphLink {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const COLORS = {
  nodeSeed: '#22d3ee',         // Cyan for seed nodes - stands out well
  nodeGenerated: '#a78bfa',    // Soft violet for synthesized nodes
  nodeUncertainty: '#fbbf24',  // Yellow for uncertainty markers
  nodeHover: '#ffffff',
  nodeSelected: '#4ade80',     // Bright green for selected
  edge: '#6b7280',             // Medium gray for edges
  edgeHighlight: '#4ade80',    // Bright green for highlighted
  edgeHover: '#22d3ee',        // Cyan for hovered
  background: '#000000',       // Pure black
};

export default function GraphCanvas3D({
  onNodeSelect,
  onArticleGenerated,
  onNodeView,
  searchInputRef,
  isGenerating: externalIsGenerating,
  generationProgress,
}: GraphCanvas3DProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const topicsRef = useRef<TopicNode[]>([]);

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [tooltipNode, setTooltipNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TopicNode[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Calculate node connection counts for sizing
  const nodeConnections = useMemo(() => {
    const counts = new Map<string, number>();
    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
      counts.set(sourceId, (counts.get(sourceId) || 0) + 1);
      counts.set(targetId, (counts.get(targetId) || 0) + 1);
    });
    return counts;
  }, [graphData.links]);

  // Track container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Load the pre-generated knowledge graph
  const loadGraph = useCallback(() => {
    setLoadingStatus(`Loading knowledge graph (${pocGeneratedData.nodes.length} nodes)...`);

    // Use pre-generated POC data from JSON
    const nodes: GraphNode[] = pocGeneratedData.nodes.map((n: any) => ({
      id: n.id,
      label: n.title,
      content: n.content,
      isGenerated: !n.id.startsWith('seed-'),
      isUncertainty: n.title.startsWith('⚠️'),
    }));

    const links: GraphLink[] = pocGeneratedData.edges.map((e: any) => ({
      source: e.source,
      target: e.target,
    }));

    topicsRef.current = pocGeneratedData.nodes.map((n: any) => ({
      id: n.id,
      label: n.title,
      slug: n.id,
      content: n.content,
    }));

    setGraphData({ nodes, links });
    setIsLoading(false);

    // Zoom to fit after loading
    setTimeout(() => {
      fgRef.current?.zoomToFit(1000, 100);
    }, 500);
  }, []);

  // Load graph on mount
  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  // Configure force simulation after load
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      // Gentle forces for stable, readable layout
      fgRef.current.d3Force('charge')?.strength(-80);
      fgRef.current.d3Force('link')?.distance(120);
      
      // Initial camera position
      setTimeout(() => {
        fgRef.current?.zoomToFit(1000, 100);
      }, 1500);
    }
  }, [graphData]);

  // Node color based on state
  const getNodeColor = useCallback((node: GraphNode) => {
    if (selectedNodes.includes(node.id)) return COLORS.nodeSelected;
    if (hoveredNode === node.id) return COLORS.nodeHover;
    if (node.isUncertainty) return COLORS.nodeUncertainty;
    if (node.isGenerated) return COLORS.nodeGenerated;
    return COLORS.nodeSeed;
  }, [selectedNodes, hoveredNode]);

  // Node size based on type and connection count - LARGER for easier clicking
  const getNodeSize = useCallback((node: GraphNode) => {
    const connections = nodeConnections.get(node.id) || 1;
    
    // Base size by type - significantly larger
    let baseSize = 8;
    if (!node.isGenerated) baseSize = 12; // Seed nodes are larger
    if (node.isUncertainty) baseSize = 6; // Uncertainty nodes slightly smaller
    
    // Scale by connections (logarithmic to prevent huge nodes)
    const connectionBonus = Math.log2(connections + 1) * 2;
    baseSize += connectionBonus;
    
    // Apply interaction states
    if (selectedNodes.includes(node.id)) return baseSize * 1.2;
    if (hoveredNode === node.id) return baseSize * 1.1;
    return baseSize;
  }, [selectedNodes, hoveredNode, nodeConnections]);

  // Track clicks for double-click detection
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastClickedNodeRef = useRef<string | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  // Helper to create text sprite for node labels - optimized for performance
  const createTextSprite = useCallback((text: string, color: string, isSelected: boolean) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 512;
    canvas.height = 64;
    
    // Truncate long labels
    const maxChars = 25;
    const displayText = text.length > maxChars ? text.slice(0, maxChars) + '…' : text;
    
    // Simple font
    context.font = 'bold 24px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Simple shadow
    context.shadowColor = '#000';
    context.shadowBlur = 4;
    context.fillStyle = isSelected ? '#fff' : color;
    context.fillText(displayText, 256, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: isSelected ? 1 : 0.85,
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(50, 8, 1);
    
    return sprite;
  }, []);

  // Custom node rendering with THREE.js - simple sphere with label
  const nodeThreeObject = useCallback((node: GraphNode) => {
    const size = getNodeSize(node);
    const color = getNodeColor(node);
    const isSelected = selectedNodes.includes(node.id);
    const isDimmed = selectedNodes.length > 0 && !isSelected && hoveredNode !== node.id;

    // Create group to hold sphere and label
    const group = new THREE.Group();

    // Simple sphere - fewer segments for better performance
    const geometry = new THREE.SphereGeometry(size, 16, 16);
    const material = new THREE.MeshLambertMaterial({
      color,
      transparent: true,
      opacity: isDimmed ? 0.3 : 1,
    });
    const sphere = new THREE.Mesh(geometry, material);
    group.add(sphere);

    // Add text label above the node
    const labelColor = isDimmed ? 'rgba(150, 150, 150, 0.5)' : 'rgba(255, 255, 255, 0.9)';
    const textSprite = createTextSprite(node.label, labelColor, isSelected);
    textSprite.position.set(0, size + 15, 0);
    group.add(textSprite);

    return group;
  }, [getNodeColor, getNodeSize, selectedNodes, hoveredNode, createTextSprite]);

  // Store onNodeView in a ref to avoid recreating handleNodeClick
  const onNodeViewRef = useRef(onNodeView);
  onNodeViewRef.current = onNodeView;

  // Handle node click - IMMEDIATE selection, detect double-click for viewing
  const handleNodeClick = useCallback((node: GraphNode) => {
    const nodeId = node.id;
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    const sameNode = lastClickedNodeRef.current === nodeId;

    // Check for double-click on the SAME node within 300ms
    if (sameNode && timeSinceLastClick < 300) {
      // Double-click detected - view the article
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      lastClickedNodeRef.current = null;
      lastClickTimeRef.current = 0;

      // Remove the node from selection since we're viewing it
      setSelectedNodes((prev) => prev.filter((n) => n !== nodeId));

      if (onNodeViewRef.current) {
        onNodeViewRef.current({
          id: node.id,
          title: node.label,
          content: node.content,
        });
      }
      return;
    }

    // Record this click
    lastClickedNodeRef.current = nodeId;
    lastClickTimeRef.current = now;

    // IMMEDIATE selection toggle - no delay!
    // This fixes the multi-select issue
    setSelectedNodes((prev) => {
      const newSelection = prev.includes(nodeId)
        ? prev.filter((n) => n !== nodeId)
        : [...prev, nodeId];
      console.log('Selection updated:', newSelection);
      return newSelection;
    });

    // Set a timeout just to track potential double-click (for deselection on view)
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null;
    }, 300);
  }, []);

  // Handle right-click to also view article
  const handleNodeRightClick = useCallback((node: GraphNode) => {
    if (onNodeView) {
      onNodeView({
        id: node.id,
        title: node.label,
        content: node.content,
      });
    }
  }, [onNodeView]);

  // Handle background click - clear all selections
  const handleBackgroundClick = useCallback(() => {
    setSelectedNodes([]);
    // Reset click tracking
    lastClickedNodeRef.current = null;
    lastClickTimeRef.current = 0;
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
  }, []);

  // Update parent with selection
  useEffect(() => {
    onNodeSelect?.(selectedNodes);
  }, [selectedNodes, onNodeSelect]);

  // Search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = topicsRef.current
      .filter((t) => t.label.toLowerCase().includes(query))
      .slice(0, 10);
    setSearchResults(results);
  }, [searchQuery]);

  // Focus on node from search - ADD to selection, don't replace
  const selectFromSearch = useCallback((nodeId: string) => {
    setSelectedNodes((prev) => {
      if (prev.includes(nodeId)) return prev;
      return [...prev, nodeId];
    });
    setSearchQuery('');
    setIsSearchFocused(false);

    // Find node and focus camera on it
    const node = graphData.nodes.find((n) => n.id === nodeId) as GraphNode & { x?: number; y?: number; z?: number };
    if (node && fgRef.current && typeof node.x === 'number') {
      fgRef.current.cameraPosition(
        { x: node.x, y: node.y || 0, z: (node.z || 0) + 200 },
        { x: node.x, y: node.y || 0, z: node.z || 0 },
        1000
      );
    }
  }, [graphData.nodes]);

  // Generate connection
  const generateConnection = useCallback(async () => {
    if (selectedNodes.length < 2 || isGenerating) return;

    setIsGenerating(true);

    const selectedTopics = selectedNodes.map((id) => {
      const topic = topicsRef.current.find((t) => t.id === id);
      return { title: topic?.label || id, content: topic?.content || '' };
    });

    try {
      const result = await generateConnectionArticle(selectedTopics);
      const newNode = result.node;

      // Add new node and links
      const newGraphNode: GraphNode = {
        id: newNode.id,
        label: newNode.title,
        content: newNode.content,
        isGenerated: true,
        isUncertainty: result.isUncertainty || false,
      };

      const newLinks = selectedNodes.map((sourceId) => ({
        source: sourceId,
        target: newNode.id,
      }));

      setGraphData((prev) => ({
        nodes: [...prev.nodes, newGraphNode],
        links: [...prev.links, ...newLinks],
      }));

      topicsRef.current.push({
        id: newNode.id,
        label: newNode.title,
        slug: newNode.slug,
        content: newNode.content,
      });

      onArticleGenerated?.(result);
      setSelectedNodes([newNode.id]);

      // Zoom to fit after adding new node
      setTimeout(() => {
        fgRef.current?.zoomToFit(1000, 100);
      }, 500);
    } catch (error) {
      console.error('Error generating connection:', error);
      alert('Failed to generate connection. Please try again.');
    }

    setIsGenerating(false);
  }, [selectedNodes, isGenerating, onArticleGenerated, graphData.nodes]);

  // Get labels for selected nodes
  const getSelectedLabels = useCallback(() => {
    return selectedNodes.map((id) => {
      const topic = topicsRef.current.find((t) => t.id === id);
      return topic?.label || id;
    });
  }, [selectedNodes]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    if (fgRef.current) {
      const camera = fgRef.current.camera();
      const pos = camera.position;
      fgRef.current.cameraPosition(
        { x: pos.x * 0.8, y: pos.y * 0.8, z: pos.z * 0.8 },
        undefined,
        300
      );
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (fgRef.current) {
      const camera = fgRef.current.camera();
      const pos = camera.position;
      fgRef.current.cameraPosition(
        { x: pos.x * 1.25, y: pos.y * 1.25, z: pos.z * 1.25 },
        undefined,
        300
      );
    }
  }, []);

  const resetView = useCallback(() => {
    fgRef.current?.zoomToFit(1000, 100);
  }, []);

  // Link color based on selection state
  const linkColor = useCallback((link: any) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    if (selectedNodes.includes(sourceId) || selectedNodes.includes(targetId)) {
      return COLORS.edgeHighlight;
    }
    if (hoveredNode === sourceId || hoveredNode === targetId) {
      return COLORS.edgeHover;
    }
    return COLORS.edge;
  }, [selectedNodes, hoveredNode]);

  const linkWidth = useCallback((link: any) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    if (selectedNodes.includes(sourceId) || selectedNodes.includes(targetId)) {
      return 5; // Thicker for selected
    }
    if (hoveredNode === sourceId || hoveredNode === targetId) {
      return 4; // Thicker for hovered
    }
    return 2.5; // Base width - visible
  }, [selectedNodes, hoveredNode]);

  // Memoize the graph component to prevent re-renders
  const graphComponent = useMemo(() => (
    <ForceGraph3D
      ref={fgRef}
      width={dimensions.width}
      height={dimensions.height}
      graphData={graphData}
      nodeLabel={() => ''} // We render our own labels
      nodeThreeObject={nodeThreeObject}
      nodeThreeObjectExtend={false}
      linkColor={linkColor}
      linkWidth={linkWidth}
      linkOpacity={0.8}
      linkDirectionalParticles={1}
      linkDirectionalParticleWidth={2}
      linkDirectionalParticleSpeed={0.004}
      linkDirectionalParticleColor={(link: any) => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        if (selectedNodes.includes(sourceId) || selectedNodes.includes(targetId)) {
          return COLORS.edgeHighlight;
        }
        return '#888888';
      }}
      backgroundColor={COLORS.background}
      onNodeClick={handleNodeClick}
      onNodeRightClick={handleNodeRightClick}
      onNodeHover={(node: any, event: any) => {
        setHoveredNode(node?.id || null);
        if (node && event) {
          const foundNode = graphData.nodes.find(n => n.id === node.id);
          if (foundNode) {
            setTooltipNode(foundNode);
            setTooltipPos({ x: event.clientX, y: event.clientY });
          }
        } else {
          setTooltipNode(null);
        }
      }}
      onBackgroundClick={handleBackgroundClick}
      enableNodeDrag={true}
      enableNavigationControls={true}
      showNavInfo={false}
      cooldownTicks={100}
      warmupTicks={50}
    />
  ), [graphData, dimensions, nodeThreeObject, linkColor, linkWidth, selectedNodes, handleNodeClick, handleNodeRightClick, handleBackgroundClick]);

  return (
    <div className="graph-canvas-container" ref={containerRef}>
      {/* 3D Graph */}
      {!isLoading && graphComponent}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="graph-loading-overlay">
          <div className="graph-loading-content">
            <div className="spinner large" />
            <span className="loading-status">{loadingStatus}</span>
          </div>
        </div>
      )}

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
            placeholder="Search nodes... (⌘K)"
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
                <span className="result-action">focus</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Generating Indicator */}
      {(isGenerating || externalIsGenerating) && (
        <div className="generating-indicator">
          <div className="spinner" />
          <span>{generationProgress || 'synthesizing...'}</span>
        </div>
      )}

      {/* Selection Panel */}
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
                <span className="selected-dot" style={{ background: COLORS.nodeSelected }} />
                <span className="selected-label">{label}</span>
                <button
                  className="remove-selection"
                  onClick={() => setSelectedNodes((prev) => prev.filter((_, idx) => idx !== i))}
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
            <p className="selection-hint">
              click more nodes to add • double-click to view
            </p>
          )}
        </div>
      )}

      {/* Zoom Controls */}
      <div className="zoom-controls">
        <button className="zoom-btn" onClick={zoomIn} title="Zoom in">+</button>
        <button className="zoom-btn" onClick={zoomOut} title="Zoom out">−</button>
        <button className="zoom-btn" onClick={resetView} title="Reset view">⟲</button>
      </div>


      {/* Hover Tooltip - minimal */}
      {tooltipNode && !selectedNodes.includes(tooltipNode.id) && (
        <div 
          className="node-tooltip"
          style={{
            position: 'fixed',
            left: Math.min(tooltipPos.x + 15, window.innerWidth - 280),
            top: Math.min(tooltipPos.y + 15, window.innerHeight - 100),
            pointerEvents: 'none',
          }}
        >
          <h4 className="tooltip-title">{tooltipNode.label}</h4>
          <p className="tooltip-preview">
            {tooltipNode.content.slice(0, 100).replace(/[#*]/g, '').trim()}...
          </p>
        </div>
      )}

    </div>
  );
}
