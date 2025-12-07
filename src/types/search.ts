// Article Search Types - Grokipedia v1.0
// Production-grade search with similarity matching

export interface SearchableArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  // Pre-computed for fast search
  titleLower: string;
  contentPreview: string;
  keywords: string[];
}

export interface SearchMatch {
  article: SearchableArticle;
  score: number;           // 0-1, higher is better
  matchType: 'exact' | 'fuzzy' | 'semantic' | 'keyword';
  matchedOn: string;       // What matched (title, content, keyword)
  highlight?: string;      // Snippet with match highlighted
}

export interface SearchState {
  query: string;
  results: SearchMatch[];
  isSearching: boolean;
  hasExactMatch: boolean;
  // For article generation flow
  selectedForGeneration: SearchableArticle[];
  showGenerateOption: boolean;
  generationMode: 'from_similar' | 'new_topic' | null;
}

export interface SearchConfig {
  maxResults: number;
  minScore: number;           // Minimum similarity score to include
  fuzzyThreshold: number;     // Levenshtein distance threshold
  enableSemantic: boolean;    // Use embedding-based search
  debounceMs: number;
}

export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  maxResults: 15,
  minScore: 0.3,
  fuzzyThreshold: 0.6,
  enableSemantic: true,
  debounceMs: 150,
};

// Result from article generation attempt
export interface GenerationAttemptResult {
  success: boolean;
  article?: {
    id: string;
    title: string;
    slug: string;
    content: string;
  };
  isNull: boolean;           // True if generation returned null (not verifiable)
  reason?: string;           // Why generation was null or failed
  sourceArticles: string[];  // IDs of articles used as context
}

// Search index for fast lookups
export interface SearchIndex {
  articles: Map<string, SearchableArticle>;
  titleIndex: Map<string, string[]>;    // word -> article IDs
  keywordIndex: Map<string, string[]>;  // keyword -> article IDs
  embeddings?: Map<string, number[]>;   // article ID -> embedding vector
  lastUpdated: string;
}
