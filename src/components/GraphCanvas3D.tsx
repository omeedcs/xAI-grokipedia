import { useEffect, useRef, useCallback, useState, useMemo, type RefObject } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { loadTopics, loadPreGeneratedGraph, type TopicNode, type GraphEdge } from '../services/dataLoader';
import { generateConnectionArticle } from '../services/api';
import pocGeneratedData from '../data/pocGeneratedData.json';
import GenerationCyclePanel from './GenerationCyclePanel';
import type { EdgeGenerationResult } from '../services/generationCycle';

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
  node: '#888888',
  nodeHover: '#ffffff',
  nodeSelected: '#00ff88',
  nodeGenerated: '#ff8800',
  nodeUncertainty: '#ff4444',
  edge: '#ffffff',
  edgeHighlight: '#00ff88',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TopicNode[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [showCyclePanel, setShowCyclePanel] = useState(false);
  const [usePOCMode, setUsePOCMode] = useState(false);

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

  // Load POC pre-generated graph (105 nodes from 10 iterations)
  const loadPOCGraph = useCallback(() => {
    setLoadingStatus(`Loading ISO 668 POC graph (${pocGeneratedData.nodes.length} nodes)...`);

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
    setUsePOCMode(true);
    setIsLoading(false);

    // Zoom to fit after loading
    setTimeout(() => {
      fgRef.current?.zoomToFit(1000, 100);
    }, 500);
  }, []);

  // Load graph data
  useEffect(() => {
    const loadGraph = async () => {
      setLoadingStatus('Loading graph data...');

      const preGenerated = await loadPreGeneratedGraph();

      let topics: TopicNode[];
      let edges: GraphEdge[] = [];

      if (preGenerated) {
        setLoadingStatus(`Loading ${preGenerated.nodes.length} nodes...`);
        topics = preGenerated.nodes;
        edges = preGenerated.edges;
      } else {
        setLoadingStatus('Loading individual topics...');
        topics = loadTopics();
      }

      topicsRef.current = topics;

      // Convert to force-graph format
      const nodes: GraphNode[] = topics.map((topic) => ({
        id: topic.id,
        label: topic.label,
        content: topic.content,
        isGenerated: topic.id.startsWith('generated-'),
        isUncertainty: topic.label.startsWith('[Uncertainty]'),
      }));

      const links: GraphLink[] = edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
      }));

      setLoadingStatus('Rendering graph...');
      setGraphData({ nodes, links });
      setIsLoading(false);
    };

    loadGraph();
  }, []);

  // Handle new article from generation cycle
  const handleCycleArticle = useCallback((result: EdgeGenerationResult) => {
    if (!result.success || !result.result) return;

    const newNode = result.result.node;
    const newGraphNode: GraphNode = {
      id: newNode.id,
      label: newNode.title,
      content: newNode.content,
      isGenerated: true,
      isUncertainty: result.result.isUncertainty || false,
    };

    // Add links to source and target nodes
    const newLinks: GraphLink[] = [
      { source: result.edge.sourceNodeId, target: newNode.id },
      { source: result.edge.targetNodeId, target: newNode.id },
    ];

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

    onArticleGenerated?.(result.result);
  }, [onArticleGenerated]);

  // Configure force simulation after load
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      // Adjust forces for better layout
      fgRef.current.d3Force('charge')?.strength(-50);
      fgRef.current.d3Force('link')?.distance(100);
      
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
    return COLORS.node;
  }, [selectedNodes, hoveredNode]);

  // Node size based on connections
  const getNodeSize = useCallback((node: GraphNode) => {
    const baseSize = node.isGenerated ? 6 : 4;
    if (selectedNodes.includes(node.id)) return baseSize * 1.5;
    if (hoveredNode === node.id) return baseSize * 1.3;
    return baseSize;
  }, [selectedNodes, hoveredNode]);

  // Track clicks for double-click detection
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastClickedNodeRef = useRef<string | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  // Custom node rendering with THREE.js
  const nodeThreeObject = useCallback((node: GraphNode) => {
    const size = getNodeSize(node);
    const color = getNodeColor(node);

    const geometry = new THREE.SphereGeometry(size, 16, 16);
    const material = new THREE.MeshLambertMaterial({
      color,
      transparent: true,
      opacity: selectedNodes.length > 0 && !selectedNodes.includes(node.id) && hoveredNode !== node.id ? 0.3 : 1,
    });

    return new THREE.Mesh(geometry, material);
  }, [getNodeColor, getNodeSize, selectedNodes, hoveredNode]);

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

  // Search
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
      // Add to selection if not already selected
      if (prev.includes(nodeId)) {
        return prev; // Already selected, just focus camera
      }
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

  // Link styling
  const linkColor = useCallback((link: any) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    if (selectedNodes.includes(sourceId) || selectedNodes.includes(targetId)) {
      return COLORS.edgeHighlight;
    }
    return COLORS.edge;
  }, [selectedNodes]);

  const linkWidth = useCallback((link: any) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    if (selectedNodes.includes(sourceId) || selectedNodes.includes(targetId)) {
      return 3;
    }
    return 1.5;
  }, [selectedNodes]);

  // Memoize the graph component to prevent re-renders
  const graphComponent = useMemo(() => (
    <ForceGraph3D
      ref={fgRef}
      width={dimensions.width}
      height={dimensions.height}
      graphData={graphData}
      nodeLabel={(node: any) => node.label}
      nodeThreeObject={nodeThreeObject}
      nodeThreeObjectExtend={false}
      linkColor={linkColor}
      linkWidth={linkWidth}
      linkOpacity={0.8}
      backgroundColor="#000000"
      onNodeClick={handleNodeClick}
      onNodeRightClick={handleNodeRightClick}
      onNodeHover={(node: any) => setHoveredNode(node?.id || null)}
      onBackgroundClick={handleBackgroundClick}
      enableNodeDrag={true}
      enableNavigationControls={true}
      showNavInfo={false}
    />
  ), [graphData, dimensions, nodeThreeObject, linkColor, linkWidth, handleNodeClick, handleNodeRightClick, handleBackgroundClick]);

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

      {/* POC / Cycle Controls */}
      <div className="poc-controls" style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        display: 'flex',
        gap: '8px',
        zIndex: 100,
      }}>
        <button
          className="zoom-btn"
          onClick={loadPOCGraph}
          title="Load ISO 668 POC"
          style={{ padding: '8px 12px', fontSize: '11px' }}
        >
          📦 POC
        </button>
        <button
          className="zoom-btn"
          onClick={() => setShowCyclePanel(!showCyclePanel)}
          title="Generation Cycle"
          style={{
            padding: '8px 12px',
            fontSize: '11px',
            background: showCyclePanel ? '#00ff88' : undefined,
            color: showCyclePanel ? '#000' : undefined,
          }}
        >
          ⚡ Cycle
        </button>
        {usePOCMode && (
          <span style={{
            padding: '8px 12px',
            background: 'rgba(255, 136, 0, 0.2)',
            border: '1px solid #ff8800',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#ff8800',
          }}>
            POC Mode: ISO 668
          </span>
        )}
      </div>

      {/* Generation Cycle Panel */}
      {showCyclePanel && (
        <GenerationCyclePanel
          nodes={graphData.nodes.map((n) => ({ id: n.id, label: n.label, content: n.content }))}
          edges={graphData.links.map((l) => ({
            source: typeof l.source === 'object' ? (l.source as any).id : l.source,
            target: typeof l.target === 'object' ? (l.target as any).id : l.target,
          }))}
          onNewArticle={handleCycleArticle}
          onClose={() => setShowCyclePanel(false)}
        />
      )}

      {/* Instructions */}
      <div className="instructions">
        <span>drag to rotate • scroll to zoom • click to select • double-click to view</span>
      </div>

      {/* Legend */}
      <div className="graph-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: COLORS.node }} />
          <span>topic</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: COLORS.nodeGenerated }} />
          <span>synthesized</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: COLORS.nodeSelected }} />
          <span>selected</span>
        </div>
        {usePOCMode && (
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#4488ff' }} />
            <span>seed (N₀)</span>
          </div>
        )}
      </div>
    </div>
  );
}
