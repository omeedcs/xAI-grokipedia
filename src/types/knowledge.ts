// Knowledge Graph Data Models with Full Provenance

export interface Citation {
  url: string;
  title: string;
  snippet: string;
  retrievedAt: string;
}

export interface Claim {
  id: string;
  statement: string;
  confidence: number; // 0-1
  verified: boolean;
  citations: Citation[];
  domain: string;
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
  generationMethod: 'synthesis' | 'expansion' | 'import' | 'manual';
  
  // Quality metrics
  confidence: number;         // 0-1 overall confidence
  verificationStatus: 'pending' | 'verified' | 'disputed' | 'unverifiable';
  
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
}
