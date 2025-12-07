import { useEffect, useRef, useCallback, useState, useMemo, type RefObject } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import type { TopicNode } from '../services/dataLoader';
import { generateConnectionArticle } from '../services/api';
import { useArticleSearch, initializeSearch, addToSearchIndex } from '../hooks/useArticleSearch';
import simulationStep00 from '../data/simulation/step-00.json';

interface GraphCanvas3DProps {
  onNodeSelect?: (nodeIds: string[]) => void;
  onArticleGenerated?: (result: any) => void;
  onNodeView?: (node: { id: string; title: string; content: string } | null) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  isGenerating?: boolean;
  generationProgress?: string;
  simulationData?: {
    nodes: Array<{ id: string; title: string; content: string }>;
    edges: Array<{ source: string; target: string }>;
    generatedNode: { id: string; title: string; content: string } | null;
  } | null;
  // For articles generated from App.tsx search
  newGeneratedArticle?: {
    id: string;
    title: string;
    content: string;
    neighborIds: string[];
  } | null;
  onNewArticleProcessed?: () => void;
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

// Encyclopedia Galactica - Space/Cosmic Theme
const COLORS = {
  // Stars - warm celestial tones
  nodeSeed: '#fbbf24',         // Golden stars - primary knowledge
  nodeGenerated: '#c084fc',    // Nebula purple - synthesized knowledge
  nodeUncertainty: '#fb923c',  // Orange dwarf - uncertain claims
  nodeHover: '#fff7ed',        // Warm white glow
  nodeSelected: '#fef3c7',     // Bright stellar selection
  // Cosmic connections
  edge: 'rgba(148, 163, 184, 0.35)',  // Starlight trails
  edgeHighlight: 'rgba(251, 191, 36, 0.6)', // Golden connection
  edgeHover: 'rgba(192, 132, 252, 0.6)',    // Purple nebula glow
  background: 'rgba(0,0,0,0)', // Transparent - let stars show through
};

// Procedural celestial body textures (no CORS issues)
const textureCache = new Map<string, THREE.Texture>();

// Planet color palettes for variety
const PLANET_PALETTES = [
  { name: 'earth', colors: ['#1a365d', '#2563eb', '#22c55e', '#166534'] },
  { name: 'mars', colors: ['#7c2d12', '#dc2626', '#f97316', '#fdba74'] },
  { name: 'jupiter', colors: ['#fef3c7', '#f59e0b', '#d97706', '#92400e'] },
  { name: 'neptune', colors: ['#0c4a6e', '#0284c7', '#38bdf8', '#7dd3fc'] },
  { name: 'venus', colors: ['#fef9c3', '#fde047', '#eab308', '#ca8a04'] },
  { name: 'saturn', colors: ['#fef3c7', '#d4a574', '#a16207', '#713f12'] },
  { name: 'uranus', colors: ['#ccfbf1', '#5eead4', '#14b8a6', '#0f766e'] },
  { name: 'purple', colors: ['#fae8ff', '#e879f9', '#a855f7', '#7c3aed'] },
];

// Create procedural planet texture
const createPlanetTexture = (seed: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  const palette = PLANET_PALETTES[seed % PLANET_PALETTES.length];
  
  // Base gradient
  const baseGradient = ctx.createLinearGradient(0, 0, 256, 256);
  baseGradient.addColorStop(0, palette.colors[0]);
  baseGradient.addColorStop(0.5, palette.colors[1]);
  baseGradient.addColorStop(1, palette.colors[2]);
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, 256, 256);
  
  // Add bands/stripes for gas giants
  const numBands = 3 + (seed % 5);
  for (let i = 0; i < numBands; i++) {
    const y = (256 / numBands) * i + (seed * 7) % 20;
    const height = 15 + (seed * 3) % 25;
    ctx.fillStyle = palette.colors[(i + 1) % palette.colors.length];
    ctx.globalAlpha = 0.3 + (i % 3) * 0.1;
    ctx.fillRect(0, y, 256, height);
  }
  ctx.globalAlpha = 1;
  
  // Add subtle surface details
  for (let i = 0; i < 12; i++) {
    const x = (seed * 17 + i * 23) % 256;
    const y = (seed * 13 + i * 31) % 256;
    const r = 10 + (seed * i) % 20;
    const detailGradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    detailGradient.addColorStop(0, palette.colors[3]);
    detailGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = detailGradient;
    ctx.globalAlpha = 0.2;
    ctx.fillRect(0, 0, 256, 256);
  }
  ctx.globalAlpha = 1;
  
  // Spherical shading overlay
  const sphereGradient = ctx.createRadialGradient(90, 90, 0, 128, 128, 180);
  sphereGradient.addColorStop(0, 'rgba(255,255,255,0.3)');
  sphereGradient.addColorStop(0.5, 'rgba(255,255,255,0)');
  sphereGradient.addColorStop(0.8, 'rgba(0,0,0,0.2)');
  sphereGradient.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = sphereGradient;
  ctx.fillRect(0, 0, 256, 256);
  
  return new THREE.CanvasTexture(canvas);
};

// Create sun/star texture
const createSunTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  // Fiery gradient
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.1, '#fffbeb');
  gradient.addColorStop(0.3, '#fbbf24');
  gradient.addColorStop(0.5, '#f59e0b');
  gradient.addColorStop(0.7, '#d97706');
  gradient.addColorStop(1, '#92400e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  
  // Solar flares
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const dist = 40 + Math.sin(i * 3) * 20;
    const x = 128 + Math.cos(angle) * dist;
    const y = 128 + Math.sin(angle) * dist;
    const flareGrad = ctx.createRadialGradient(x, y, 0, x, y, 25);
    flareGrad.addColorStop(0, 'rgba(255,255,200,0.5)');
    flareGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = flareGrad;
    ctx.fillRect(0, 0, 256, 256);
  }
  
  return new THREE.CanvasTexture(canvas);
};

// Create moon texture
const createMoonTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  // Gray base
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(0, 0, 256, 256);
  
  // Craters
  for (let i = 0; i < 15; i++) {
    const x = (i * 37) % 256;
    const y = (i * 53) % 256;
    const r = 8 + (i * 7) % 20;
    const craterGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    craterGrad.addColorStop(0, '#374151');
    craterGrad.addColorStop(0.7, '#4b5563');
    craterGrad.addColorStop(1, '#6b7280');
    ctx.fillStyle = craterGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Spherical shading
  const sphereGrad = ctx.createRadialGradient(90, 90, 0, 128, 128, 180);
  sphereGrad.addColorStop(0, 'rgba(255,255,255,0.2)');
  sphereGrad.addColorStop(0.5, 'transparent');
  sphereGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = sphereGrad;
  ctx.fillRect(0, 0, 256, 256);
  
  return new THREE.CanvasTexture(canvas);
};

// Get or create texture by type
const getTexture = (type: 'sun' | 'planet' | 'moon', seed: number = 0): THREE.Texture => {
  const key = `${type}-${seed}`;
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }
  
  let texture: THREE.Texture;
  if (type === 'sun') {
    texture = createSunTexture();
  } else if (type === 'moon') {
    texture = createMoonTexture();
  } else {
    texture = createPlanetTexture(seed);
  }
  
  textureCache.set(key, texture);
  return texture;
};

// Hash function for consistent texture assignment
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export default function GraphCanvas3D({
  onNodeSelect,
  onArticleGenerated,
  onNodeView,
  searchInputRef,
  isGenerating: externalIsGenerating,
  generationProgress,
  simulationData,
  newGeneratedArticle,
  onNewArticleProcessed,
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showGeneratePanel, setShowGeneratePanel] = useState(false);
  const [newlyGeneratedNodeId, setNewlyGeneratedNodeId] = useState<string | null>(null);

  // Enhanced article search with embedding similarity
  const articleSearch = useArticleSearch({
    debounceMs: 300, // Slightly longer debounce for embedding search
    maxResults: 12,
    minScore: 0.3,
    onSelect: (article) => {
      selectFromSearch(article.id);
    },
  });

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

  // Track container size with ResizeObserver for accurate dimensions
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Use floor to avoid subpixel issues that cause stretching
        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    };
    
    updateSize();
    
    // Use ResizeObserver for more reliable size tracking
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateSize);
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    window.addEventListener('resize', updateSize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Load the pre-generated knowledge graph (simulation step 0 as default)
  const loadGraph = useCallback(() => {
    setLoadingStatus(`Loading knowledge graph (${simulationStep00.nodes.length} nodes)...`);

    // Use simulation step-00 data as default
    const nodes: GraphNode[] = simulationStep00.nodes.map((n: any) => ({
      id: n.id,
      label: n.title,
      content: n.content,
      isGenerated: n.id.startsWith('gen-'),
      isUncertainty: n.id.startsWith('unc-') || n.title.startsWith('⚠️'),
    }));

    const links: GraphLink[] = simulationStep00.edges.map((e: any) => ({
      source: e.source,
      target: e.target,
    }));

    topicsRef.current = simulationStep00.nodes.map((n: any) => ({
      id: n.id,
      label: n.title,
      slug: n.id,
      content: n.content,
    }));

    setGraphData({ nodes, links });
    setIsLoading(false);
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

      // Set camera position immediately - no animation
      fgRef.current.cameraPosition({ x: 0, y: 0, z: 450 }, { x: 0, y: 0, z: 0 }, 0);
    }
  }, [graphData]);

  // Update graph when simulation data changes (for replay mode)
  useEffect(() => {
    if (simulationData) {
      const nodes: GraphNode[] = simulationData.nodes.map((n) => ({
        id: n.id,
        label: n.title,
        content: n.content,
        isGenerated: n.id.startsWith('gen-'),
        isUncertainty: n.id.startsWith('unc-') || n.title.startsWith('⚠️'),
      }));

      const links: GraphLink[] = simulationData.edges.map((e) => ({
        source: e.source,
        target: e.target,
      }));

      // Update topicsRef to match simulation data (important for search!)
      topicsRef.current = simulationData.nodes.map((n) => ({
        id: n.id,
        label: n.title,
        slug: n.id,
        content: n.content,
      }));

      // Highlight newly generated node
      if (simulationData.generatedNode) {
        setNewlyGeneratedNodeId(simulationData.generatedNode.id);
        setTimeout(() => setNewlyGeneratedNodeId(null), 2000);
      }

      setGraphData({ nodes, links });
    }
  }, [simulationData]);

  // ========================================
  // Handle new articles generated from App.tsx search
  // ========================================
  useEffect(() => {
    if (!newGeneratedArticle) return;

    console.log('🌟 [GraphCanvas3D] Adding new article from App.tsx:', newGeneratedArticle.title);
    console.log('   Neighbor IDs:', newGeneratedArticle.neighborIds);

    // Find neighbor nodes to position near
    const neighborIds = newGeneratedArticle.neighborIds || [];
    const neighborNode = neighborIds.length > 0
      ? graphData.nodes.find(n => neighborIds.includes(n.id)) as GraphNode & { x?: number; y?: number; z?: number }
      : null;

    // Set initial position near neighbor, or at center if no neighbor
    const initialX = (neighborNode?.x ?? 0) + (Math.random() - 0.5) * 100;
    const initialY = (neighborNode?.y ?? 0) + (Math.random() - 0.5) * 100;
    const initialZ = (neighborNode?.z ?? 0) + (Math.random() - 0.5) * 100;

    console.log('   Position near:', neighborNode?.label || 'center');
    console.log('   Initial pos:', { x: initialX.toFixed(1), y: initialY.toFixed(1), z: initialZ.toFixed(1) });

    const newNode: GraphNode & { x: number; y: number; z: number } = {
      id: newGeneratedArticle.id,
      label: newGeneratedArticle.title,
      content: newGeneratedArticle.content,
      isGenerated: true,
      isUncertainty: false,
      x: initialX,
      y: initialY,
      z: initialZ,
    };

    // Create edges to neighbors
    const newLinks = neighborIds
      .filter(id => graphData.nodes.some(n => n.id === id))
      .map(neighborId => ({
        source: neighborId,
        target: newGeneratedArticle.id,
      }));

    console.log('   Creating', newLinks.length, 'edges');

    // Update graph data
    const updatedGraphData = {
      nodes: [...graphData.nodes, newNode],
      links: [...graphData.links, ...newLinks],
    };

    setGraphData(updatedGraphData);

    // Reheat simulation after state update to animate new node into position
    setTimeout(() => {
      if (fgRef.current) {
        fgRef.current.d3ReheatSimulation();
        console.log('   🔥 Reheated simulation');
      }
    }, 150);

    // Add to topics ref
    topicsRef.current.push({
      id: newGeneratedArticle.id,
      label: newGeneratedArticle.title,
      slug: newGeneratedArticle.id,
      content: newGeneratedArticle.content,
    });

    // Mark as newly generated for visual highlight
    setNewlyGeneratedNodeId(newGeneratedArticle.id);
    setSelectedNodes([newGeneratedArticle.id]);

    // Clear highlight after 8 seconds
    setTimeout(() => {
      setNewlyGeneratedNodeId(null);
    }, 8000);

    // Notify parent that we've processed the article
    onNewArticleProcessed?.();
  }, [newGeneratedArticle, graphData.nodes, graphData.links, onNewArticleProcessed]);


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
    
    // Elegant star sizes - not too large
    let baseSize = 6;
    if (!node.isGenerated) baseSize = 8; // Primary stars slightly larger
    if (node.isUncertainty) baseSize = 5; // Dim stars smaller
    
    // Subtle connection bonus
    const connectionBonus = Math.log2(connections + 1) * 1.5;
    baseSize += connectionBonus;
    
    // Interaction glow
    if (selectedNodes.includes(node.id)) return baseSize * 1.3;
    if (hoveredNode === node.id) return baseSize * 1.15;
    return baseSize;
  }, [selectedNodes, hoveredNode, nodeConnections]);

  // Track clicks for double-click detection
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastClickedNodeRef = useRef<string | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  // Helper to create text sprite - HIGH RESOLUTION labels
  const createTextSprite = useCallback((text: string, color: string, isSelected: boolean, isNewlyGenerated: boolean = false) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    // Higher resolution for crisp text
    const scale = 2; // 2x resolution
    canvas.width = 1024 * scale;
    canvas.height = 128 * scale;
    context.scale(scale, scale);
    
    // Truncate long labels
    const maxChars = 28;
    const displayText = text.length > maxChars ? text.slice(0, maxChars) + '…' : text;
    
    // Larger, crisper font - matching Grokipedia's Georgia serif
    const fontSize = isSelected ? 56 : 50;
    context.font = `${isSelected ? '500' : '400'} ${fontSize}px Georgia, 'Times New Roman', serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Better shadow for readability
    context.shadowColor = 'rgba(0, 0, 0, 0.9)';
    context.shadowBlur = 12;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 2;
    
    // Newly generated nodes get a special glow
    if (isNewlyGenerated) {
      context.shadowColor = 'rgba(34, 211, 238, 0.8)';
      context.shadowBlur = 20;
    }
    
    context.fillStyle = isNewlyGenerated ? '#22d3ee' : (isSelected ? '#ffffff' : color);
    context.fillText(displayText, 512, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: isSelected || isNewlyGenerated ? 1 : 0.85,
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(55, 9, 1);
    
    return sprite;
  }, []);

  // Custom node rendering - Procedural textured celestial bodies
  const nodeThreeObject = useCallback((node: GraphNode) => {
    const size = getNodeSize(node);
    getNodeColor(node); // Call for dependency tracking
    const isSelected = selectedNodes.includes(node.id);
    const isHovered = hoveredNode === node.id;
    const isDimmed = selectedNodes.length > 0 && !isSelected && !isHovered;

    const group = new THREE.Group();

    // Get procedural texture based on node type
    const seed = hashString(node.id);
    const texture = node.isUncertainty 
      ? getTexture('moon', seed)
      : node.isGenerated 
        ? getTexture('planet', seed)
        : getTexture('sun', seed);

    // Main celestial body with NASA texture
    const bodyGeometry = new THREE.SphereGeometry(size, 32, 32);
    const bodyMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: isDimmed ? 0.4 : 1,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Slow rotation for visual interest
    body.rotation.y = Date.now() * 0.0001 + node.id.charCodeAt(0);
    group.add(body);

    // Atmospheric glow for all bodies
    const glowGeometry = new THREE.SphereGeometry(size * 1.15, 16, 16);
    const glowColor = node.isUncertainty ? '#94a3b8' : node.isGenerated ? '#c084fc' : '#fbbf24';
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: isDimmed ? 0.05 : (isSelected ? 0.3 : 0.12),
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);

    // Ring for Saturn-like planets (some generated nodes)
    const hasSaturnRing = node.isGenerated && (node.id.charCodeAt(0) % 4 === 0);
    if (hasSaturnRing && !isDimmed) {
      const ringGeometry = new THREE.RingGeometry(size * 1.3, size * 1.8, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: '#d4a574',
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2.2;
      group.add(ring);
    }

    // Corona for sun/stars (seed nodes)
    if (!node.isGenerated && !node.isUncertainty && !isDimmed) {
      const coronaGeometry = new THREE.SphereGeometry(size * 1.4, 16, 16);
      const coronaMaterial = new THREE.MeshBasicMaterial({
        color: '#fef3c7',
        transparent: true,
        opacity: isSelected ? 0.35 : 0.15,
      });
      const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
      group.add(corona);
    }

    // Selection/hover aura
    if (isSelected || isHovered) {
      const auraGeometry = new THREE.SphereGeometry(size * 2.2, 16, 16);
      const auraMaterial = new THREE.MeshBasicMaterial({
        color: isSelected ? '#fef3c7' : '#ffffff',
        transparent: true,
        opacity: isSelected ? 0.25 : 0.15,
      });
      const aura = new THREE.Mesh(auraGeometry, auraMaterial);
      group.add(aura);
    }

    // Special glow ring for newly generated nodes
    const isNewlyGenerated = node.id === newlyGeneratedNodeId;
    if (isNewlyGenerated) {
      // Pulsing outer ring
      const pulseGeometry = new THREE.RingGeometry(size * 2.5, size * 3, 64);
      const pulseMaterial = new THREE.MeshBasicMaterial({
        color: '#22d3ee',
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      const pulseRing = new THREE.Mesh(pulseGeometry, pulseMaterial);
      pulseRing.rotation.x = Math.PI / 2;
      group.add(pulseRing);
      
      // Inner glow
      const innerGlowGeometry = new THREE.SphereGeometry(size * 1.8, 32, 32);
      const innerGlowMaterial = new THREE.MeshBasicMaterial({
        color: '#22d3ee',
        transparent: true,
        opacity: 0.25,
      });
      const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
      group.add(innerGlow);
    }

    // Label - elegant positioning
    const labelColor = isDimmed ? 'rgba(100, 100, 100, 0.3)' : 'rgba(255, 255, 255, 0.9)';
    const textSprite = createTextSprite(node.label, labelColor, isSelected, isNewlyGenerated);
    textSprite.position.set(0, size * 2 + 10, 0);
    group.add(textSprite);

    return group;
  }, [getNodeColor, getNodeSize, selectedNodes, hoveredNode, createTextSprite, newlyGeneratedNodeId]);

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

  // Track if we've initialized search (to avoid re-init on simulation changes)
  const hasInitializedSearchRef = useRef(false);

  // Initialize search index only on initial graph load (not on simulation changes)
  // App.tsx handles search index updates for simulation replay
  useEffect(() => {
    if (topicsRef.current.length > 0 && !hasInitializedSearchRef.current && !simulationData) {
      hasInitializedSearchRef.current = true;
      initializeSearch(
        topicsRef.current.map(t => ({
          id: t.id,
          title: t.label,
          slug: t.slug,
          content: t.content,
        }))
      );
    }
  }, [graphData.nodes.length, simulationData]);

  // Handle article generation from search
  const handleGenerateFromSearch = useCallback(async () => {
    if (!articleSearch.canGenerate) return;
    
    setShowGeneratePanel(false);
    setIsGenerating(true);
    
    try {
      const result = await articleSearch.generateArticle();
      
      if (result?.success && result.article) {
        // ========================================
        // ADD GENERATED ARTICLE TO GRAPH
        // ========================================
        console.log('🌟 ADDING NEW NODE TO GRAPH:', result.article.title);
        console.log('   Node ID:', result.article.id);
        console.log('   Parent neighbors (sourceArticles):', result.sourceArticles);

        // Link to parent/neighbor articles
        const newLinks = result.sourceArticles
          .filter(id => graphData.nodes.some(n => n.id === id))
          .map(sourceId => ({
            source: sourceId,
            target: result.article!.id,
          }));

        // Find a neighbor node to position near (CRITICAL for visibility)
        const neighborId = newLinks.length > 0 ? newLinks[0].source : null;
        const neighborNode = neighborId
          ? graphData.nodes.find(n => n.id === neighborId) as GraphNode & { x?: number; y?: number; z?: number }
          : null;

        // Set initial position near neighbor, or at center if no neighbor
        const initialX = (neighborNode?.x ?? 0) + (Math.random() - 0.5) * 80;
        const initialY = (neighborNode?.y ?? 0) + (Math.random() - 0.5) * 80;
        const initialZ = (neighborNode?.z ?? 0) + (Math.random() - 0.5) * 80;

        console.log('   Initial position:', { x: initialX.toFixed(1), y: initialY.toFixed(1), z: initialZ.toFixed(1) });
        console.log('   Neighbor node:', neighborNode?.label || 'none');

        const newNode: GraphNode & { x: number; y: number; z: number } = {
          id: result.article.id,
          label: result.article.title,
          content: result.article.content,
          isGenerated: true,
          isUncertainty: false,
          x: initialX,
          y: initialY,
          z: initialZ,
        };

        console.log('   Creating edges to neighbors:', newLinks.length);
        newLinks.forEach((link, i) => {
          const sourceNode = graphData.nodes.find(n => n.id === link.source);
          console.log(`   Edge ${i + 1}: "${sourceNode?.label}" → "${result.article!.title}"`);
        });

        // Update graph data with new node and edges
        // CRITICAL: Create completely new data object for react-force-graph to detect change
        const updatedGraphData = {
          nodes: [...graphData.nodes, newNode],
          links: [...graphData.links, ...newLinks],
        };

        console.log('   ✅ Updating graph:', updatedGraphData.nodes.length, 'nodes,', updatedGraphData.links.length, 'edges');

        // Update React state
        setGraphData(updatedGraphData);

        // Reheat simulation after state update
        setTimeout(() => {
          if (fgRef.current) {
            fgRef.current.d3ReheatSimulation();
            console.log('   🔥 Reheated simulation for new node');
          }
        }, 150);

        topicsRef.current.push({
          id: result.article.id,
          label: result.article.title,
          slug: result.article.slug,
          content: result.article.content,
        });

        // Add new article to search index (efficient single-article update)
        addToSearchIndex({
          id: result.article.id,
          title: result.article.title,
          slug: result.article.slug,
          content: result.article.content,
        });
        
        // Clear search so user can immediately search for the new article
        articleSearch.clearSearch();

        onArticleGenerated?.({
          node: {
            id: result.article.id,
            title: result.article.title,
            slug: result.article.slug,
            content: result.article.content,
          },
          searchResults: [],
          reasoning: '',
        });

        setSelectedNodes([result.article.id]);

        // Mark as newly generated for visual highlight
        setNewlyGeneratedNodeId(result.article.id);

        // Clear the "newly generated" highlight after 8 seconds
        setTimeout(() => {
          setNewlyGeneratedNodeId(null);
        }, 8000);
      } else if (result?.isNull) {
        // Show the reason why generation failed
        alert(`Cannot generate article: ${result.reason || 'The query cannot be answered with verifiable information.'}`);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate article. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [articleSearch, graphData.nodes, onArticleGenerated]);

  // Focus on node from search - ADD to selection, don't replace
  const selectFromSearch = useCallback((nodeId: string) => {
    setSelectedNodes((prev) => {
      if (prev.includes(nodeId)) return prev;
      return [...prev, nodeId];
    });
    articleSearch.clearSearch();
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

      // Smooth camera reset after adding node
      setTimeout(() => {
        fgRef.current?.cameraPosition({ x: 0, y: 0, z: 450 }, { x: 0, y: 0, z: 0 }, 500);
      }, 300);
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
    fgRef.current?.cameraPosition({ x: 0, y: 0, z: 450 }, { x: 0, y: 0, z: 0 }, 500);
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

  // Link widths - visible but not overpowering
  const linkWidth = useCallback((link: any) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;

    if (selectedNodes.includes(sourceId) || selectedNodes.includes(targetId)) {
      return 3; // Highlighted
    }
    if (hoveredNode === sourceId || hoveredNode === targetId) {
      return 2.5;
    }
    return 1.5; // Base width - visible
  }, [selectedNodes, hoveredNode]);

  // Memoize the graph component to prevent re-renders
  // NOTE: Do NOT use dynamic key - it destroys the scene and loses node positions
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
      linkOpacity={0.6}
      linkDirectionalParticles={0}
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
      controlType="orbit"
      showNavInfo={false}
      cooldownTicks={100}
      warmupTicks={50}
      rendererConfig={{ 
        alpha: true, 
        antialias: true,
        powerPreference: 'high-performance'
      }}
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

      {/* Enhanced Search */}
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
            placeholder={articleSearch.isEmbeddingModelReady ? "Semantic search... (⌘K)" : "Loading AI model... (⌘K)"}
            value={articleSearch.query}
            onChange={(e) => articleSearch.setQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
          />
          {articleSearch.query && (
            <button className="search-clear" onClick={() => articleSearch.clearSearch()}>×</button>
          )}
          {articleSearch.isSearching && (
            <div className="search-spinner" />
          )}
          {/* Embedding status indicator */}
          {articleSearch.isEmbeddingModelReady && articleSearch.embeddingsCount > 0 && (
            <span className="embedding-status" title={`${articleSearch.embeddingsCount} articles indexed with AI embeddings`}>
              🧠
            </span>
          )}
        </div>

        {/* Search Results with Similarity Scores */}
        {isSearchFocused && articleSearch.query.length > 0 && (
          <div className="search-results enhanced">
            {/* Results */}
            {articleSearch.results.length > 0 ? (
              <>
                {articleSearch.results.map((match) => (
                  <div
                    key={match.article.id}
                    className={`search-result-item ${
                      articleSearch.selectedForGeneration.some(a => a.id === match.article.id) ? 'selected-for-gen' : ''
                    }`}
                    onClick={() => selectFromSearch(match.article.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && selectFromSearch(match.article.id)}
                  >
                    <div className="result-main">
                      <span className="result-label">{match.article.title}</span>
                      <span className="result-preview">{match.article.contentPreview.slice(0, 80)}...</span>
                    </div>
                    <div className="result-meta">
                      <span className={`result-score ${match.score >= 0.8 ? 'high' : match.score >= 0.5 ? 'medium' : 'low'}`}>
                        {Math.round(match.score * 100)}%
                      </span>
                      <span className="result-type">{match.matchType}</span>
                      <button
                        className="result-use-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          articleSearch.toggleGenerationSelection(match.article);
                        }}
                        title="Use as context for new article"
                      >
                        {articleSearch.selectedForGeneration.some(a => a.id === match.article.id) ? '✓' : '+'}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Generation Option */}
                {!articleSearch.hasExactMatch && articleSearch.query.length >= 5 && (
                  <div className="search-generate-section">
                    <div className="generate-divider">
                      <span>No exact match found</span>
                    </div>
                    {articleSearch.selectedForGeneration.length > 0 ? (
                      <button
                        className="generate-from-similar-btn"
                        onClick={handleGenerateFromSearch}
                        disabled={articleSearch.isGenerating}
                      >
                        <span className="gen-icon">✨</span>
                        Generate from {articleSearch.selectedForGeneration.length} selected article{articleSearch.selectedForGeneration.length > 1 ? 's' : ''}
                      </button>
                    ) : (
                      <button
                        className="generate-new-btn"
                        onClick={() => setShowGeneratePanel(true)}
                      >
                        <span className="gen-icon">+</span>
                        Create new article: "{articleSearch.query}"
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              // No results - offer to generate
              articleSearch.query.length >= 3 && !articleSearch.isSearching && (
                <div className="search-no-results">
                  <p>No matching articles found</p>
                  {articleSearch.query.length >= 5 && (
                    <button
                      className="generate-new-btn primary"
                      onClick={() => setShowGeneratePanel(true)}
                    >
                      <span className="gen-icon">+</span>
                      Generate: "{articleSearch.query}"
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Generate New Article Panel */}
      {showGeneratePanel && (
        <div className="generate-panel">
          <div className="generate-panel-header">
            <h3>Generate New Article</h3>
            <button className="close-btn" onClick={() => setShowGeneratePanel(false)}>×</button>
          </div>
          <div className="generate-panel-content">
            <p className="generate-query">Topic: <strong>"{articleSearch.query}"</strong></p>
            
            {articleSearch.results.length > 0 && (
              <div className="similar-articles-section">
                <p className="section-label">Similar articles found ({articleSearch.results.length}):</p>
                <p className="section-hint">Select articles to use as context, or generate standalone.</p>
                <div className="similar-list">
                  {articleSearch.results.slice(0, 5).map((match) => (
                    <label key={match.article.id} className="similar-item">
                      <input
                        type="checkbox"
                        checked={articleSearch.selectedForGeneration.some(a => a.id === match.article.id)}
                        onChange={() => articleSearch.toggleGenerationSelection(match.article)}
                      />
                      <span className="similar-title">{match.article.title}</span>
                      <span className="similar-score">{Math.round(match.score * 100)}%</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="generate-actions">
              <button
                className="generate-btn primary"
                onClick={handleGenerateFromSearch}
                disabled={articleSearch.isGenerating}
              >
                {articleSearch.isGenerating ? (
                  <>Generating...</>
                ) : articleSearch.selectedForGeneration.length > 0 ? (
                  <>Generate from {articleSearch.selectedForGeneration.length} article{articleSearch.selectedForGeneration.length > 1 ? 's' : ''}</>
                ) : (
                  <>Generate Standalone Article</>
                )}
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowGeneratePanel(false)}
              >
                Cancel
              </button>
            </div>

            <p className="generate-note">
              Articles are generated as the smallest verifiable information unit. 
              If the topic cannot be verified, generation will return null.
            </p>
          </div>
        </div>
      )}

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


    </div>
  );
}
