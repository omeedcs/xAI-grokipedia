// Grokipedia Generation Cycle Service
// Implements the automated graph expansion algorithm with priority scoring

import type {
  KnowledgeNode,
  NodeMetrics,
  EdgeMetrics,
  PotentialEdge,
  GenerationCycleConfig,
  GenerationResult,
} from '../types/knowledge';
import { generateConnectionArticle } from './api';

// ============================================
// STORAGE KEYS
// ============================================
const STORAGE_KEYS = {
  NODES: 'grokipedia-nodes-v1',
  POTENTIAL_EDGES: 'grokipedia-potential-edges-v1',
  CYCLE_CONFIG: 'grokipedia-cycle-config-v1',
  QUERY_LOG: 'grokipedia-query-log-v1',
};

// ============================================
// DEFAULT CONFIGURATION
// ============================================
const DEFAULT_CONFIG: GenerationCycleConfig = {
  alpha: 0.4,   // Weight for Causal Distance
  beta: 0.3,    // Weight for Integrity Tension
  gamma: 0.3,   // Weight for Query Frequency
  batchSize: 20,
  cycleIntervalMs: 3600000, // 1 hour
};

// ============================================
// API CONFIGURATION
// ============================================
const API_URL = 'https://api.x.ai/v1/chat/completions';
const API_KEY = import.meta.env.VITE_XAI_API_KEY || '';

// ============================================
// NODE METRICS HELPERS
// ============================================

/**
 * Create default metrics for a seed node (high confidence)
 */
export function createSeedNodeMetrics(): NodeMetrics {
  return {
    integrityScore: 1.0,  // Seed nodes start at 1.0
    isUncertaintyNode: false,
    resolutionBonus: 0,
  };
}

/**
 * Create default metrics for a generated node (pending validation)
 */
export function createGeneratedNodeMetrics(): NodeMetrics {
  return {
    integrityScore: 0.5,  // Generated nodes start at 0.5
    isUncertaintyNode: false,
    resolutionBonus: 0,
  };
}

/**
 * Create metrics for an uncertainty node
 */
export function createUncertaintyNodeMetrics(): NodeMetrics {
  return {
    integrityScore: 0.2,  // Low confidence
    isUncertaintyNode: true,
    resolutionBonus: 1.0,  // High priority for resolution
  };
}

// ============================================
// EDGE METRICS HELPERS
// ============================================

/**
 * Create default metrics for a potential edge (uncalculated)
 */
export function createPotentialEdgeMetrics(): EdgeMetrics {
  return {
    causalDistance: null,      // Requires Grok calculation
    queryFrequency: 0,         // Starts at 0
    priorityScore: null,       // Calculated from other metrics
    integrityTension: null,    // Calculated from node scores
    isPressed: false,          // No article generated yet
    lastUpdated: new Date().toISOString(),
  };
}

// ============================================
// STORAGE LAYER
// ============================================

interface GraphStore {
  nodes: Map<string, KnowledgeNode>;
  potentialEdges: Map<string, PotentialEdge>;
}

let store: GraphStore = {
  nodes: new Map(),
  potentialEdges: new Map(),
};

/**
 * Load stored graph data from localStorage
 */
export function loadGraphStore(): GraphStore {
  try {
    const nodesData = localStorage.getItem(STORAGE_KEYS.NODES);
    const edgesData = localStorage.getItem(STORAGE_KEYS.POTENTIAL_EDGES);

    if (nodesData) {
      const parsed = JSON.parse(nodesData);
      store.nodes = new Map(Object.entries(parsed));
    }

    if (edgesData) {
      const parsed = JSON.parse(edgesData);
      store.potentialEdges = new Map(Object.entries(parsed));
    }
  } catch (e) {
    console.error('Failed to load graph store:', e);
  }

  return store;
}

/**
 * Save graph store to localStorage
 */
export function saveGraphStore(): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.NODES,
      JSON.stringify(Object.fromEntries(store.nodes))
    );
    localStorage.setItem(
      STORAGE_KEYS.POTENTIAL_EDGES,
      JSON.stringify(Object.fromEntries(store.potentialEdges))
    );
  } catch (e) {
    console.error('Failed to save graph store:', e);
  }
}

/**
 * Get current configuration
 */
export function getConfig(): GenerationCycleConfig {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CYCLE_CONFIG);
    if (data) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load config:', e);
  }
  return DEFAULT_CONFIG;
}

/**
 * Update configuration
 */
export function setConfig(config: Partial<GenerationCycleConfig>): void {
  const current = getConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(STORAGE_KEYS.CYCLE_CONFIG, JSON.stringify(updated));
}

// ============================================
// STEP 2.1: IDENTIFY UNPRESSED EDGES
// ============================================

/**
 * Generate a unique edge ID from two node IDs (order-independent)
 */
export function getEdgeId(nodeA: string, nodeB: string): string {
  const sorted = [nodeA, nodeB].sort();
  return `edge-${sorted[0]}-${sorted[1]}`;
}

/**
 * Identify all unpressed edges in the graph.
 * An unpressed edge is a potential connection between two nodes
 * that does not yet have a generated article.
 */
export function identifyUnpressedEdges(
  nodes: Map<string, KnowledgeNode> | Array<{ id: string; label: string; content: string }>,
  existingEdges: Array<{ source: string; target: string }>
): PotentialEdge[] {
  const nodeIds: string[] = [];

  // Handle both Map and Array input
  if (nodes instanceof Map) {
    nodes.forEach((_, id) => nodeIds.push(id));
  } else {
    nodes.forEach((n) => nodeIds.push(n.id));
  }

  // Create set of existing (pressed) edge IDs
  const pressedEdgeIds = new Set<string>();
  for (const edge of existingEdges) {
    pressedEdgeIds.add(getEdgeId(edge.source, edge.target));
  }

  // Find all potential edges that are not pressed
  const unpressedEdges: PotentialEdge[] = [];

  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      const edgeId = getEdgeId(nodeIds[i], nodeIds[j]);

      if (!pressedEdgeIds.has(edgeId)) {
        // Check if we already have metrics for this edge
        const existingEdge = store.potentialEdges.get(edgeId);

        if (existingEdge) {
          unpressedEdges.push(existingEdge);
        } else {
          // Create new potential edge with default metrics
          const newEdge: PotentialEdge = {
            id: edgeId,
            sourceNodeId: nodeIds[i],
            targetNodeId: nodeIds[j],
            metrics: createPotentialEdgeMetrics(),
            createdAt: new Date().toISOString(),
          };
          store.potentialEdges.set(edgeId, newEdge);
          unpressedEdges.push(newEdge);
        }
      }
    }
  }

  return unpressedEdges;
}

// ============================================
// STEP 2.2: CALCULATE/UPDATE CORE METRICS
// ============================================

/**
 * Calculate Causal Distance using Grok API.
 * Asks Grok to rate the logical leap between two topics on a 1-10 scale.
 */
export async function calculateCausalDistance(
  nodeA: { title: string; content: string },
  nodeB: { title: string; content: string }
): Promise<number> {
  console.log(`📏 Calculating causal distance: ${nodeA.title} ↔ ${nodeB.title}`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast',
        messages: [
          {
            role: 'system',
            content:
              'You are a knowledge distance calculator. Rate the logical leap between concepts on a scale of 1-10. ' +
              '1 = directly related, same domain. 10 = completely unrelated, requires many intermediate steps. ' +
              'Respond with ONLY a single integer 1-10.',
          },
          {
            role: 'user',
            content: `Rate the logical leap between these two topics (1-10):

Topic A: ${nodeA.title}
Summary: ${nodeA.content.slice(0, 500)}

Topic B: ${nodeB.title}
Summary: ${nodeB.content.slice(0, 500)}

Respond with only a number 1-10.`,
          },
        ],
        temperature: 0.1,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      console.warn('Causal distance API error, using default');
      return 5; // Default middle value
    }

    const data = await response.json();
    const rawResponse = data.choices[0]?.message?.content?.trim() || '5';
    const distance = parseInt(rawResponse, 10);

    return isNaN(distance) ? 5 : Math.max(1, Math.min(10, distance));
  } catch (error) {
    console.error('Failed to calculate causal distance:', error);
    return 5; // Default on error
  }
}

/**
 * Calculate Integrity Tension between two nodes.
 * T_I = |S_A_i - S_A_j|
 */
export function calculateIntegrityTension(
  nodeA: KnowledgeNode | { metrics?: NodeMetrics },
  nodeB: KnowledgeNode | { metrics?: NodeMetrics }
): number {
  const scoreA = nodeA.metrics?.integrityScore ?? 0.5;
  const scoreB = nodeB.metrics?.integrityScore ?? 0.5;
  return Math.abs(scoreA - scoreB);
}

/**
 * Increment query frequency for an edge.
 * Called when users interact with nodes that would benefit from this connection.
 */
export function incrementQueryFrequency(edgeId: string): void {
  const edge = store.potentialEdges.get(edgeId);
  if (edge) {
    edge.metrics.queryFrequency++;
    edge.metrics.lastUpdated = new Date().toISOString();
    saveGraphStore();
  }
}

/**
 * Log a query and update relevant edge frequencies.
 * Called when users select or view nodes.
 */
export function logNodeQuery(nodeId: string): void {
  const timestamp = new Date().toISOString();

  // Store in query log
  try {
    const logData = localStorage.getItem(STORAGE_KEYS.QUERY_LOG);
    const log: Array<{ nodeId: string; timestamp: string }> = logData
      ? JSON.parse(logData)
      : [];
    log.push({ nodeId, timestamp });

    // Keep only last 1000 entries
    if (log.length > 1000) {
      log.splice(0, log.length - 1000);
    }

    localStorage.setItem(STORAGE_KEYS.QUERY_LOG, JSON.stringify(log));
  } catch (e) {
    console.error('Failed to log query:', e);
  }

  // Increment frequency for all unpressed edges involving this node
  store.potentialEdges.forEach((edge) => {
    if (
      (edge.sourceNodeId === nodeId || edge.targetNodeId === nodeId) &&
      !edge.metrics.isPressed
    ) {
      edge.metrics.queryFrequency++;
      edge.metrics.lastUpdated = new Date().toISOString();
    }
  });
}

/**
 * Update metrics for a batch of edges IN PARALLEL.
 * Calculates causal distance for edges where it's null.
 */
export async function updateEdgeMetrics(
  edges: PotentialEdge[],
  getNodeData: (
    nodeId: string
  ) => { title: string; content: string; metrics?: NodeMetrics } | undefined,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  let completed = 0;
  const total = edges.length;

  // Process all edges in parallel
  const promises = edges.map(async (edge) => {
    const nodeA = getNodeData(edge.sourceNodeId);
    const nodeB = getNodeData(edge.targetNodeId);

    if (!nodeA || !nodeB) {
      console.warn(`Missing node data for edge ${edge.id}`);
      completed++;
      onProgress?.(completed, total);
      return;
    }

    // Calculate Causal Distance if null
    if (edge.metrics.causalDistance === null) {
      edge.metrics.causalDistance = await calculateCausalDistance(nodeA, nodeB);
    }

    // Calculate Integrity Tension
    edge.metrics.integrityTension = calculateIntegrityTension(
      nodeA as KnowledgeNode,
      nodeB as KnowledgeNode
    );

    edge.metrics.lastUpdated = new Date().toISOString();
    store.potentialEdges.set(edge.id, edge);

    completed++;
    onProgress?.(completed, total);
  });

  await Promise.all(promises);
  saveGraphStore();
}

// ============================================
// STEP 2.3: CALCULATE PRIORITY SCORE
// ============================================

/**
 * Calculate Priority Score for an edge.
 * P = (α·D_C + β·T_I + γ·F_Q) × (1 + B_U)
 *
 * Where:
 * - D_C = Causal Distance (normalized 0-1)
 * - T_I = Integrity Tension (0-1)
 * - F_Q = Query Frequency (normalized)
 * - B_U = Resolution Bonus (0 or 1.0 for uncertainty nodes)
 */
export function calculatePriorityScore(
  edge: PotentialEdge,
  getNodeData: (
    nodeId: string
  ) => { metrics?: NodeMetrics } | undefined,
  config: GenerationCycleConfig = getConfig(),
  maxQueryFreq: number = 1
): number {
  const metrics = edge.metrics;

  // Normalize Causal Distance to 0-1 (was 1-10)
  const normalizedDC = metrics.causalDistance !== null ? metrics.causalDistance / 10 : 0.5;

  // Integrity Tension is already 0-1
  const TI = metrics.integrityTension ?? 0;

  // Normalize Query Frequency
  const normalizedFQ = maxQueryFreq > 0 ? metrics.queryFrequency / maxQueryFreq : 0;

  // Calculate base score
  const baseScore =
    config.alpha * normalizedDC + config.beta * TI + config.gamma * normalizedFQ;

  // Get Resolution Bonus from adjacent nodes
  const nodeA = getNodeData(edge.sourceNodeId);
  const nodeB = getNodeData(edge.targetNodeId);

  const bonusA = nodeA?.metrics?.resolutionBonus ?? 0;
  const bonusB = nodeB?.metrics?.resolutionBonus ?? 0;
  const maxBonus = Math.max(bonusA, bonusB);

  // Apply bonus multiplier
  const priorityScore = baseScore * (1 + maxBonus);

  return priorityScore;
}

/**
 * Calculate priority scores for all unpressed edges.
 */
export function calculateAllPriorityScores(
  edges: PotentialEdge[],
  getNodeData: (nodeId: string) => { metrics?: NodeMetrics } | undefined,
  config?: GenerationCycleConfig
): PotentialEdge[] {
  // Find max query frequency for normalization
  const maxQueryFreq = Math.max(1, ...edges.map((e) => e.metrics.queryFrequency));

  for (const edge of edges) {
    edge.metrics.priorityScore = calculatePriorityScore(
      edge,
      getNodeData,
      config,
      maxQueryFreq
    );
    store.potentialEdges.set(edge.id, edge);
  }

  saveGraphStore();
  return edges;
}

// ============================================
// STEP 2.4: BATCH SELECTION AND EXECUTION
// ============================================

/**
 * Select top K edges with highest priority scores.
 */
export function selectBatch(
  edges: PotentialEdge[],
  batchSize: number = getConfig().batchSize
): PotentialEdge[] {
  // Filter edges that have calculated priority scores
  const scoredEdges = edges.filter((e) => e.metrics.priorityScore !== null);

  // Sort by priority score descending
  scoredEdges.sort(
    (a, b) => (b.metrics.priorityScore ?? 0) - (a.metrics.priorityScore ?? 0)
  );

  // Return top K
  return scoredEdges.slice(0, batchSize);
}

/**
 * Result of a single edge generation attempt.
 */
export interface EdgeGenerationResult {
  edge: PotentialEdge;
  success: boolean;
  result?: GenerationResult;
  error?: string;
}

/**
 * Execute generation for a single edge.
 */
async function generateSingleEdge(
  edge: PotentialEdge,
  getNodeData: (
    nodeId: string
  ) => { id: string; title: string; content: string; metrics?: NodeMetrics } | undefined
): Promise<EdgeGenerationResult> {
  const nodeA = getNodeData(edge.sourceNodeId);
  const nodeB = getNodeData(edge.targetNodeId);

  if (!nodeA || !nodeB) {
    return {
      edge,
      success: false,
      error: 'Missing node data',
    };
  }

  try {
    console.log(`🔄 Generating: ${nodeA.title} ↔ ${nodeB.title}`);

    // Execute f_LC
    const genResult = await generateConnectionArticle([
      { title: nodeA.title, content: nodeA.content },
      { title: nodeB.title, content: nodeB.content },
    ]);

    // Mark edge as pressed
    edge.metrics.isPressed = true;
    edge.metrics.lastUpdated = new Date().toISOString();
    store.potentialEdges.set(edge.id, edge);

    // Update source node integrity scores (increment slightly on successful synthesis)
    if (!genResult.isUncertainty) {
      const incrementScore = (nodeId: string) => {
        const node = store.nodes.get(nodeId);
        if (node && node.metrics) {
          node.metrics.integrityScore = Math.min(1.0, node.metrics.integrityScore + 0.05);
          store.nodes.set(nodeId, node);
        }
      };
      incrementScore(edge.sourceNodeId);
      incrementScore(edge.targetNodeId);
    }

    return {
      edge,
      success: true,
      result: genResult,
    };
  } catch (error) {
    return {
      edge,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Execute generation for a batch of edges IN PARALLEL.
 * For each edge, generates a connecting article using f_LC.
 */
export async function executeBatch(
  batch: PotentialEdge[],
  getNodeData: (
    nodeId: string
  ) => { id: string; title: string; content: string; metrics?: NodeMetrics } | undefined,
  onResult?: (result: EdgeGenerationResult) => void,
  onProgress?: (current: number, total: number) => void
): Promise<EdgeGenerationResult[]> {
  let completed = 0;
  const total = batch.length;

  // Create all promises and execute in parallel
  const promises = batch.map(async (edge) => {
    const result = await generateSingleEdge(edge, getNodeData);

    // Update progress and notify
    completed++;
    onProgress?.(completed, total);
    onResult?.(result);

    return result;
  });

  // Wait for all to complete
  const results = await Promise.all(promises);

  saveGraphStore();
  return results;
}

// ============================================
// FULL GENERATION CYCLE
// ============================================

export interface GenerationCycleResult {
  cycleId: string;
  startTime: string;
  endTime: string;
  totalUnpressedEdges: number;
  edgesProcessed: number;
  successfulGenerations: number;
  uncertaintyNodes: number;
  errors: number;
  results: EdgeGenerationResult[];
}

/**
 * Run a full generation cycle.
 * This is the main loop that:
 * 1. Identifies unpressed edges
 * 2. Calculates/updates metrics
 * 3. Calculates priority scores
 * 4. Selects and executes batch
 */
export async function runGenerationCycle(
  nodes: Map<string, KnowledgeNode> | Array<{ id: string; label: string; content: string }>,
  existingEdges: Array<{ source: string; target: string }>,
  getNodeData: (
    nodeId: string
  ) => { id: string; title: string; content: string; metrics?: NodeMetrics } | undefined,
  options?: {
    batchSize?: number;
    onProgress?: (phase: string, current: number, total: number) => void;
    onResult?: (result: EdgeGenerationResult) => void;
  }
): Promise<GenerationCycleResult> {
  const cycleId = `cycle-${Date.now()}`;
  const startTime = new Date().toISOString();
  const config = getConfig();
  const batchSize = options?.batchSize ?? config.batchSize;

  console.log(`🚀 Starting generation cycle ${cycleId}`);

  // Step 2.1: Identify unpressed edges
  options?.onProgress?.('Identifying unpressed edges', 0, 1);
  const unpressedEdges = identifyUnpressedEdges(nodes, existingEdges);
  console.log(`📊 Found ${unpressedEdges.length} unpressed edges`);

  // Step 2.2: Update metrics (only for edges needing calculation)
  const edgesNeedingMetrics = unpressedEdges.filter(
    (e) => e.metrics.causalDistance === null
  );

  if (edgesNeedingMetrics.length > 0) {
    console.log(`📏 Calculating metrics for ${edgesNeedingMetrics.length} edges`);
    await updateEdgeMetrics(edgesNeedingMetrics, getNodeData, (current, total) => {
      options?.onProgress?.('Calculating metrics', current, total);
    });
  }

  // Step 2.3: Calculate priority scores
  options?.onProgress?.('Calculating priority scores', 0, 1);
  calculateAllPriorityScores(unpressedEdges, getNodeData, config);

  // Step 2.4: Select batch and execute
  const batch = selectBatch(unpressedEdges, batchSize);
  console.log(`🎯 Selected ${batch.length} edges for generation`);

  const results = await executeBatch(batch, getNodeData, options?.onResult, (current, total) => {
    options?.onProgress?.('Generating articles', current, total);
  });

  const endTime = new Date().toISOString();

  const cycleResult: GenerationCycleResult = {
    cycleId,
    startTime,
    endTime,
    totalUnpressedEdges: unpressedEdges.length,
    edgesProcessed: batch.length,
    successfulGenerations: results.filter((r) => r.success && !r.result?.isUncertainty).length,
    uncertaintyNodes: results.filter((r) => r.success && r.result?.isUncertainty).length,
    errors: results.filter((r) => !r.success).length,
    results,
  };

  console.log(
    `✅ Cycle complete: ${cycleResult.successfulGenerations} generated, ` +
    `${cycleResult.uncertaintyNodes} uncertainty, ${cycleResult.errors} errors`
  );

  return cycleResult;
}

// ============================================
// MULTI-ITERATION GENERATION (POC Mode)
// ============================================

export interface MultiIterationResult {
  totalIterations: number;
  totalNodesGenerated: number;
  totalUncertaintyNodes: number;
  totalErrors: number;
  allResults: EdgeGenerationResult[];
  duration: number;
}

/**
 * Run multiple generation iterations with maximum parallelization.
 * Each iteration generates a batch, then new edges are identified for the next iteration.
 */
export async function runMultipleIterations(
  iterations: number,
  nodes: Array<{ id: string; label: string; content: string }>,
  existingEdges: Array<{ source: string; target: string }>,
  getNodeData: (
    nodeId: string
  ) => { id: string; title: string; content: string; metrics?: NodeMetrics } | undefined,
  onNewNode: (result: EdgeGenerationResult) => void,
  onProgress?: (iteration: number, total: number, phase: string) => void
): Promise<MultiIterationResult> {
  const startTime = Date.now();
  const config = getConfig();
  const allResults: EdgeGenerationResult[] = [];

  // Track nodes and edges as they grow
  let currentNodes = [...nodes];
  let currentEdges = [...existingEdges];

  console.log(`🚀 Starting ${iterations} iterations with batch size ${config.batchSize}`);

  for (let i = 0; i < iterations; i++) {
    onProgress?.(i + 1, iterations, 'Analyzing graph...');
    console.log(`\n📍 === ITERATION ${i + 1}/${iterations} ===`);
    console.log(`   Nodes: ${currentNodes.length}, Edges: ${currentEdges.length}`);

    // Step 1: Identify unpressed edges
    const unpressedEdges = identifyUnpressedEdges(currentNodes, currentEdges);
    console.log(`   Unpressed edges: ${unpressedEdges.length}`);

    if (unpressedEdges.length === 0) {
      console.log('   ⚠️ No more unpressed edges - stopping early');
      break;
    }

    // Step 2: Calculate metrics in parallel (limit to speed up)
    onProgress?.(i + 1, iterations, 'Calculating distances...');
    const needsMetrics = unpressedEdges.filter(e => e.metrics.causalDistance === null).slice(0, 30);
    if (needsMetrics.length > 0) {
      await updateEdgeMetrics(needsMetrics, getNodeData);
    }

    // Step 3: Calculate priority scores
    onProgress?.(i + 1, iterations, 'Scoring priorities...');
    calculateAllPriorityScores(unpressedEdges, getNodeData, config);

    // Step 4: Select batch
    const batch = selectBatch(unpressedEdges, config.batchSize);
    console.log(`   Selected batch: ${batch.length} edges`);

    if (batch.length === 0) {
      console.log('   ⚠️ No edges selected - stopping');
      break;
    }

    // Step 5: Execute batch IN PARALLEL
    onProgress?.(i + 1, iterations, `Generating ${batch.length} articles...`);

    const iterationResults = await executeBatch(
      batch,
      getNodeData,
      (result) => {
        allResults.push(result);
        if (result.success && result.result) {
          // Add new node to tracking
          const newNode = result.result.node;
          currentNodes.push({
            id: newNode.id,
            label: newNode.title,
            content: newNode.content,
          });

          // Add edges from new node to its parents
          currentEdges.push(
            { source: result.edge.sourceNodeId, target: newNode.id },
            { source: result.edge.targetNodeId, target: newNode.id }
          );

          // Notify UI
          onNewNode(result);
        }
      }
    );

    const successes = iterationResults.filter(r => r.success && !r.result?.isUncertainty).length;
    const uncertainties = iterationResults.filter(r => r.success && r.result?.isUncertainty).length;
    const errors = iterationResults.filter(r => !r.success).length;

    console.log(`   Results: ✅ ${successes} success, ⚠️ ${uncertainties} uncertainty, ❌ ${errors} errors`);
  }

  const duration = Date.now() - startTime;

  const result: MultiIterationResult = {
    totalIterations: iterations,
    totalNodesGenerated: allResults.filter(r => r.success && !r.result?.isUncertainty).length,
    totalUncertaintyNodes: allResults.filter(r => r.success && r.result?.isUncertainty).length,
    totalErrors: allResults.filter(r => !r.success).length,
    allResults,
    duration,
  };

  console.log(`\n🏁 COMPLETE: ${result.totalNodesGenerated} nodes in ${(duration / 1000).toFixed(1)}s`);

  return result;
}

// ============================================
// UTILITY EXPORTS
// ============================================

export { store };
