// Knowledge Graph Data Models with Full Provenance
// Grokipedia v0.5 - Graph Metrics & Generation Cycle

export interface Citation {
  url: string;
  title: string;
  snippet: string;
  retrievedAt: string;
}

// ============================================
// NODE METRICS - Stored on every node
// ============================================
export interface NodeMetrics {
  // Integrity Score (S_A): Confidence in the node's accuracy
  // Seed Nodes: S_A = 1.0 (High confidence)
  // Generated Nodes: Start at S_A = 0.5 (Pending validation)
  integrityScore: number;

  // Is this an Uncertainty Node?
  isUncertaintyNode: boolean;

  // Resolution Bonus (B_U) for Uncertainty Nodes
  // B_U = 1.0 for Uncertainty Nodes (High Priority)
  // Adjacent unpressed edges inherit this bonus
  resolutionBonus: number;
}

// ============================================
// EDGE METRICS - Stored on every potential edge
// ============================================
export interface EdgeMetrics {
  // Causal Distance (D_C): 1-10 scale of logical leap between nodes
  // Null/Uncalculated initially, requires Grok input
  causalDistance: number | null;

  // Query Frequency (F_Q): How often this edge is queried by users
  // Starts at F_Q = 0, incremented by external usage
  queryFrequency: number;

  // Priority Score (P): Calculated weighted score
  // P = (α·D_C + β·T_I + γ·F_Q) × (1 + B_U)
  priorityScore: number | null;

  // Integrity Tension (T_I): |S_A_i - S_A_j|
  // Calculated internally from node integrity scores
  integrityTension: number | null;

  // Has this edge been "pressed" (generated article exists)?
  isPressed: boolean;

  // Timestamp of last metric update
  lastUpdated: string;
}

// ============================================
// POTENTIAL EDGE - Represents a possible connection
// ============================================
export interface PotentialEdge {
  id: string;
  sourceNodeId: string;  // A_i
  targetNodeId: string;  // A_j
  metrics: EdgeMetrics;
  createdAt: string;
}

// ============================================
// GENERATION CYCLE CONFIG
// ============================================
export interface GenerationCycleConfig {
  // Weight coefficients for Priority Score calculation
  alpha: number;  // Weight for Causal Distance (D_C)
  beta: number;   // Weight for Integrity Tension (T_I)
  gamma: number;  // Weight for Query Frequency (F_Q)

  // Batch size for each generation cycle
  batchSize: number;  // K edges to process per cycle

  // Cycle interval in milliseconds (e.g., 3600000 = 1 hour)
  cycleIntervalMs: number;
}

export interface Claim {
  id: string;
  text: string;           // The claim statement
  statement?: string;     // Alias for text (backwards compat)
  confidence: number;     // 0-1
  verified: boolean;
  citations?: Citation[];
  domain?: string;
  sourceNodeId?: string;
}

export interface KnowledgeNode {
  id: string;
  title: string;
  slug: string;
  content: string;

  // Provenance
  sourceNodes: string[];      // IDs of nodes this was synthesized from
  createdAt: string;          // ISO timestamp
  updatedAt: string;
  generationMethod: 'synthesis' | 'expansion' | 'import' | 'manual' | 'seed';

  // Quality metrics
  confidence: number;         // 0-1 overall confidence
  verificationStatus: 'pending' | 'verified' | 'disputed' | 'unverifiable';

  // Graph Metrics (v0.5)
  metrics: NodeMetrics;

  // Structured content
  claims: Claim[];            // Extracted atomic claims
  citations: Citation[];      // Sources used

  // Classification
  domains: string[];          // Topic areas
  entities: string[];         // Extracted named entities

  // User additions
  annotations: Annotation[];
  tags: string[];
}

export interface Annotation {
  id: string;
  nodeId: string;
  text: string;
  highlightStart: number;
  highlightEnd: number;
  note: string;
  createdAt: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: 'synthesized_from' | 'related_to' | 'contradicts' | 'supports' | 'derived_from';
  weight: number;
  createdAt: string;
}

export interface GraphState {
  nodes: Map<string, KnowledgeNode>;
  edges: GraphEdge[];
  positions: Map<string, { x: number; y: number }>;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  action: 'create_node' | 'delete_node' | 'create_edge' | 'delete_edge' | 'update_node' | 'annotate';
  nodeId?: string;
  edgeId?: string;
  previousState?: Partial<KnowledgeNode>;
  newState?: Partial<KnowledgeNode>;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

export interface GenerationResult {
  node: KnowledgeNode;
  searchResults: SearchResult[];
  reasoning: string;
  isUncertainty?: boolean;  // True if Uncertainty Protocol was triggered
}
