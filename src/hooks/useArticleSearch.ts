// Article Search Hook - Grokipedia v1.0
// React hook for fast article search with similarity matching

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { SearchMatch, SearchableArticle, GenerationAttemptResult } from '../types/search';
import {
  searchArticles,
  getSemanticResults,
  generateArticleFromSearch,
  initializeSearchIndex,
  addArticleToIndex,
  precomputeArticleEmbeddings,
  getSearchIndex,
  getArticleCount,
  isModelReady,
  getEmbeddingsCount,
  getPrecomputeProgress,
} from '../services/searchService';

export interface UseArticleSearchOptions {
  debounceMs?: number;
  maxResults?: number;
  minScore?: number;
  onSelect?: (article: SearchableArticle) => void;
}

export interface UseArticleSearchReturn {
  // Search state
  query: string;
  setQuery: (query: string) => void;
  results: SearchMatch[];
  isSearching: boolean;
  isSemanticSearching: boolean;
  
  // Match analysis
  hasExactMatch: boolean;
  hasSimilarMatches: boolean;
  topScore: number;
  
  // Generation flow
  selectedForGeneration: SearchableArticle[];
  toggleGenerationSelection: (article: SearchableArticle) => void;
  clearGenerationSelection: () => void;
  canGenerate: boolean;
  isGenerating: boolean;
  generateArticle: () => Promise<GenerationAttemptResult | null>;
  lastGenerationResult: GenerationAttemptResult | null;
  
  // Actions
  selectArticle: (article: SearchableArticle) => void;
  clearSearch: () => void;
  
  // Status
  isIndexReady: boolean;
  indexedCount: number;
  
  // Embedding status
  isEmbeddingModelReady: boolean;
  embeddingsCount: number;
  embeddingProgress: { done: number; total: number };
}

export function useArticleSearch(
  options: UseArticleSearchOptions = {}
): UseArticleSearchReturn {
  const {
    debounceMs = 150,
    maxResults = 15,
    minScore = 0.25,
    onSelect,
  } = options;

  // Core state
  const [query, setQueryRaw] = useState('');
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [isIndexReady, setIsIndexReady] = useState(false);

  // Generation flow state
  const [selectedForGeneration, setSelectedForGeneration] = useState<SearchableArticle[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerationResult, setLastGenerationResult] = useState<GenerationAttemptResult | null>(null);

  // Debounce timer
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef('');

  // Check index status on mount
  useEffect(() => {
    const checkIndex = () => {
      const index = getSearchIndex();
      setIsIndexReady(!!index);
    };
    checkIndex();
    
    // Poll until ready (in case initialization is async)
    const interval = setInterval(() => {
      checkIndex();
      if (getSearchIndex()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Debounced search
  const setQuery = useCallback((newQuery: string) => {
    setQueryRaw(newQuery);
    lastQueryRef.current = newQuery;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!newQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    debounceRef.current = setTimeout(async () => {
      // Only search if query hasn't changed
      if (lastQueryRef.current === newQuery) {
        try {
          // Fast text search first (immediate results)
          const textResults = await searchArticles(newQuery, {
            maxResults,
            minScore,
          });
          
          // Show text results immediately
          if (lastQueryRef.current === newQuery) {
            setResults(textResults);
            setIsSearching(false);
          }
          
          // If few text results, get semantic results in background
          if (textResults.length < 5 && newQuery.length >= 3) {
            setIsSemanticSearching(true);
            const existingIds = new Set(textResults.map(r => r.article.id));
            
            try {
              const semanticResults = await getSemanticResults(newQuery, existingIds, maxResults);
              
              // Merge semantic results if query still matches
              if (lastQueryRef.current === newQuery && semanticResults.length > 0) {
                setResults(prev => {
                  const merged = [...prev];
                  for (const result of semanticResults) {
                    if (!prev.some(p => p.article.id === result.article.id)) {
                      merged.push({ ...result, score: result.score * 0.9 });
                    }
                  }
                  return merged.sort((a, b) => b.score - a.score).slice(0, maxResults);
                });
              }
            } finally {
              setIsSemanticSearching(false);
            }
          }
        } catch (err) {
          console.warn('Search failed:', err);
          setIsSearching(false);
        }
      }
    }, debounceMs);
  }, [debounceMs, maxResults, minScore]);

  // Clear debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Match analysis
  const hasExactMatch = useMemo(() => {
    return results.some(r => r.score >= 0.95 && r.matchType === 'exact');
  }, [results]);

  const hasSimilarMatches = useMemo(() => {
    return results.length > 0 && results[0].score >= minScore;
  }, [results, minScore]);

  const topScore = useMemo(() => {
    return results.length > 0 ? results[0].score : 0;
  }, [results]);

  // Generation selection
  const toggleGenerationSelection = useCallback((article: SearchableArticle) => {
    setSelectedForGeneration(prev => {
      const exists = prev.some(a => a.id === article.id);
      if (exists) {
        return prev.filter(a => a.id !== article.id);
      }
      return [...prev, article];
    });
  }, []);

  const clearGenerationSelection = useCallback(() => {
    setSelectedForGeneration([]);
  }, []);

  const canGenerate = useMemo(() => {
    // Can generate if:
    // 1. No exact match and query is specific enough
    // 2. Or user has selected similar articles to build from
    return (
      query.trim().length >= 5 &&
      (!hasExactMatch || selectedForGeneration.length > 0)
    );
  }, [query, hasExactMatch, selectedForGeneration]);

  // Generate article
  const generateArticle = useCallback(async (): Promise<GenerationAttemptResult | null> => {
    if (!canGenerate || isGenerating) return null;

    setIsGenerating(true);
    try {
      // Only pass context articles if user explicitly selected them
      // For standalone generation, pass empty array
      const result = await generateArticleFromSearch(
        query,
        selectedForGeneration
      );
      
      setLastGenerationResult(result);
      
      if (result.success) {
        // Clear selection on success
        setSelectedForGeneration([]);
      }
      
      return result;
    } finally {
      setIsGenerating(false);
    }
  }, [canGenerate, isGenerating, query, selectedForGeneration]);

  // Select article action
  const selectArticle = useCallback((article: SearchableArticle) => {
    onSelect?.(article);
  }, [onSelect]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQueryRaw('');
    setResults([]);
    setSelectedForGeneration([]);
    setLastGenerationResult(null);
  }, []);

  return {
    // Search state
    query,
    setQuery,
    results,
    isSearching,
    isSemanticSearching,
    
    // Match analysis
    hasExactMatch,
    hasSimilarMatches,
    topScore,
    
    // Generation flow
    selectedForGeneration,
    toggleGenerationSelection,
    clearGenerationSelection,
    canGenerate,
    isGenerating,
    generateArticle,
    lastGenerationResult,
    
    // Actions
    selectArticle,
    clearSearch,
    
    // Status
    isIndexReady,
    indexedCount: getArticleCount(),
    
    // Embedding status
    isEmbeddingModelReady: isModelReady(),
    embeddingsCount: getEmbeddingsCount(),
    embeddingProgress: getPrecomputeProgress(),
  };
}

// ============================================
// INDEX INITIALIZATION HELPER
// ============================================

export async function initializeSearch(
  articles: Array<{ id: string; title: string; slug?: string; content: string }>
) {
  const index = initializeSearchIndex(articles);
  
  // Start precomputing embeddings in background
  console.log('🚀 Starting embedding precomputation...');
  precomputeArticleEmbeddings().catch(err => {
    console.error('Embedding precomputation failed:', err);
  });
  
  return index;
}

/**
 * Add a single article to the search index (efficient for new articles)
 */
export function addToSearchIndex(
  article: { id: string; title: string; slug?: string; content: string }
): void {
  addArticleToIndex(article);
}
