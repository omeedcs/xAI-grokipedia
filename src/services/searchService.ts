// Article Search Service - Grokipedia v1.0
// Text search + Grok API for semantic expansion

import type {
  SearchableArticle,
  SearchMatch,
  SearchIndex,
  GenerationAttemptResult,
} from '../types/search';

const API_URL = 'https://api.x.ai/v1/chat/completions';
const API_KEY = import.meta.env.VITE_XAI_API_KEY || '';

// Stub functions for backward compatibility
export function isModelReady(): boolean { return false; }
export function getEmbeddingsCount(): number { return 0; }
export function getPrecomputeProgress(): { done: number; total: number } { return { done: 0, total: 0 }; }

// ============================================
// SEARCH INDEX - In-memory for fast access
// ============================================
let searchIndex: SearchIndex | null = null;

export function getSearchIndex(): SearchIndex | null {
  return searchIndex;
}

// Cache for semantic search results
let semanticCache: Map<string, string[]> = new Map();

export function initializeSearchIndex(
  articles: Array<{ id: string; title: string; slug?: string; content: string }>
): SearchIndex {
  console.log(`🔍 Initializing search index with ${articles.length} articles...`);
  const startTime = performance.now();

  const index: SearchIndex = {
    articles: new Map(),
    titleIndex: new Map(),
    keywordIndex: new Map(),
    lastUpdated: new Date().toISOString(),
  };

  for (const article of articles) {
    const searchable = createSearchableArticle(article);
    index.articles.set(article.id, searchable);

    // Index title words
    const titleWords = tokenize(searchable.titleLower);
    for (const word of titleWords) {
      if (!index.titleIndex.has(word)) {
        index.titleIndex.set(word, []);
      }
      index.titleIndex.get(word)!.push(article.id);
    }

    // Index keywords
    for (const keyword of searchable.keywords) {
      if (!index.keywordIndex.has(keyword)) {
        index.keywordIndex.set(keyword, []);
      }
      index.keywordIndex.get(keyword)!.push(article.id);
    }
  }

  searchIndex = index;
  const elapsed = (performance.now() - startTime).toFixed(1);
  console.log(`✅ Search index ready: ${index.articles.size} articles, ${index.titleIndex.size} terms (${elapsed}ms)`);
  
  return index;
}

/**
 * Add a single article to the search index (efficient for new articles)
 */
export function addArticleToIndex(
  article: { id: string; title: string; slug?: string; content: string }
): void {
  if (!searchIndex) {
    console.warn('Cannot add article: search index not initialized');
    return;
  }

  // Check if article already exists
  if (searchIndex.articles.has(article.id)) {
    console.log(`Article ${article.id} already in index, updating...`);
    // Remove old index entries
    removeArticleFromIndex(article.id);
  }

  const searchable = createSearchableArticle(article);
  searchIndex.articles.set(article.id, searchable);

  // Index title words
  const titleWords = tokenize(searchable.titleLower);
  for (const word of titleWords) {
    if (!searchIndex.titleIndex.has(word)) {
      searchIndex.titleIndex.set(word, []);
    }
    searchIndex.titleIndex.get(word)!.push(article.id);
  }

  // Index keywords
  for (const keyword of searchable.keywords) {
    if (!searchIndex.keywordIndex.has(keyword)) {
      searchIndex.keywordIndex.set(keyword, []);
    }
    searchIndex.keywordIndex.get(keyword)!.push(article.id);
  }

  searchIndex.lastUpdated = new Date().toISOString();
  console.log(`✅ Added "${article.title}" to search index (${searchIndex.articles.size} total)`);
}

/**
 * Remove an article from the search index
 */
function removeArticleFromIndex(articleId: string): void {
  if (!searchIndex) return;

  const article = searchIndex.articles.get(articleId);
  if (!article) return;

  // Remove from title index
  const titleWords = tokenize(article.titleLower);
  for (const word of titleWords) {
    const ids = searchIndex.titleIndex.get(word);
    if (ids) {
      const filtered = ids.filter(id => id !== articleId);
      if (filtered.length > 0) {
        searchIndex.titleIndex.set(word, filtered);
      } else {
        searchIndex.titleIndex.delete(word);
      }
    }
  }

  // Remove from keyword index
  for (const keyword of article.keywords) {
    const ids = searchIndex.keywordIndex.get(keyword);
    if (ids) {
      const filtered = ids.filter(id => id !== articleId);
      if (filtered.length > 0) {
        searchIndex.keywordIndex.set(keyword, filtered);
      } else {
        searchIndex.keywordIndex.delete(keyword);
      }
    }
  }

  searchIndex.articles.delete(articleId);
}

function createSearchableArticle(
  article: { id: string; title: string; slug?: string; content: string }
): SearchableArticle {
  const titleLower = article.title.toLowerCase();
  const contentClean = article.content
    .replace(/[#*\[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    id: article.id,
    title: article.title,
    slug: article.slug || article.id,
    content: article.content,
    titleLower,
    contentPreview: contentClean.slice(0, 300),
    keywords: extractKeywords(article.title, article.content),
  };
}

function extractKeywords(title: string, content: string): string[] {
  const text = `${title} ${content}`.toLowerCase();
  const words = tokenize(text);
  
  // Count word frequency
  const freq = new Map<string, number>();
  for (const word of words) {
    if (word.length > 3 && !STOP_WORDS.has(word)) {
      freq.set(word, (freq.get(word) || 0) + 1);
    }
  }

  // Return top keywords by frequency
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
}

const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
  'then', 'now', 'look', 'only', 'come', 'its', 'over', 'also', 'back', 'after',
  'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new',
  'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was',
  'are', 'been', 'has', 'had', 'were', 'said', 'each', 'may', 'such', 'more',
]);

// ============================================
// MAIN SEARCH FUNCTION
// ============================================

export interface SearchOptions {
  maxResults?: number;
  minScore?: number;
}

/**
 * No-op for backward compatibility (embeddings disabled)
 */
export async function precomputeArticleEmbeddings(): Promise<void> {
  console.log('🔍 Search ready (text-based + Grok semantic expansion)');
}

/**
 * Simple text-based search fallback when embeddings unavailable
 */
function textSearch(query: string, maxResults: number): SearchMatch[] {
  if (!searchIndex) return [];
  
  const queryLower = query.toLowerCase().trim();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  const results: SearchMatch[] = [];

  for (const [, article] of searchIndex.articles) {
    let score = 0;
    
    // Exact title match
    if (article.titleLower === queryLower) {
      score = 1.0;
    }
    // Title contains query
    else if (article.titleLower.includes(queryLower)) {
      score = 0.8;
    }
    // Query contains title
    else if (queryLower.includes(article.titleLower)) {
      score = 0.7;
    }
    // Word overlap
    else {
      const titleWords = article.titleLower.split(/\s+/);
      const matches = queryWords.filter(w => titleWords.some(t => t.includes(w) || w.includes(t)));
      score = matches.length / Math.max(queryWords.length, 1) * 0.6;
    }
    
    // Content match bonus
    if (article.content.toLowerCase().includes(queryLower)) {
      score = Math.max(score, 0.5);
    }

    if (score > 0.2) {
      results.push({
        article,
        score,
        matchType: score >= 0.8 ? 'exact' : 'fuzzy',
        matchedOn: 'text',
        highlight: article.contentPreview.slice(0, 100),
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults);
}

/**
 * Search articles using text matching (fast, synchronous part)
 */
export function searchArticlesSync(
  query: string,
  options: SearchOptions = {}
): SearchMatch[] {
  const { maxResults = 15 } = options;

  if (!searchIndex || query.trim().length === 0) {
    return [];
  }

  return textSearch(query, maxResults);
}

/**
 * Search articles using text matching + semantic expansion
 * Returns text results immediately, then can be called again for semantic
 */
export async function searchArticles(
  query: string,
  options: SearchOptions = {}
): Promise<SearchMatch[]> {
  const { maxResults = 15 } = options;

  console.log(`🔍 Searching for: "${query}"`);

  if (!searchIndex || query.trim().length === 0) {
    return [];
  }

  // Start with text-based search (fast)
  const textResults = textSearch(query, maxResults);
  console.log(`Text search found ${textResults.length} results`);
  
  // Return text results immediately - semantic enhancement happens separately
  return textResults;
}

/**
 * Get semantic search results (async, slower - call separately)
 */
export async function getSemanticResults(
  query: string,
  existingIds: Set<string>,
  maxResults: number = 10
): Promise<SearchMatch[]> {
  if (!API_KEY || query.length < 3) {
    return [];
  }
  
  try {
    const semanticResults = await semanticSearch(query, maxResults);
    // Filter out duplicates
    return semanticResults.filter(r => !existingIds.has(r.article.id));
  } catch (error) {
    console.warn('Semantic search failed:', error);
    return [];
  }
}

// ============================================
// SEMANTIC SEARCH USING GROK API
// ============================================

/**
 * Use Grok to find semantically related terms (cached) - fallback
 */
async function getRelatedTerms(query: string): Promise<string[]> {
  if (!API_KEY) return [];
  
  // Check cache first
  const cacheKey = query.toLowerCase().trim();
  if (semanticCache.has(cacheKey)) {
    console.log('📦 Using cached related terms for:', query);
    return semanticCache.get(cacheKey)!;
  }
  
  try {
    console.log('🔍 Getting related terms for:', query);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-3-mini-fast',
        messages: [
          {
            role: 'system',
            content: 'Output ONLY a JSON array of 8-12 closely related topics, ingredients, categories, or associated concepts. Include both specific items and broader categories. No explanation.',
          },
          {
            role: 'user',
            content: `What topics/items are closely related to "${query}"? Think: ingredients, recipes, categories, cuisines, scientific classifications, historical context, common pairings.`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '[]';
    
    try {
      const terms = JSON.parse(content.replace(/```json?|```/g, '').trim());
      console.log('Related terms:', terms);
      const result = Array.isArray(terms) ? terms : [];
      
      // Cache the result
      if (result.length > 0) {
        semanticCache.set(cacheKey, result);
      }
      
      return result;
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Related terms error:', error);
    return [];
  }
}

/**
 * Semantic search using Grok API for related terms
 */
export async function semanticSearch(
  query: string,
  topK: number = 10
): Promise<SearchMatch[]> {
  if (!searchIndex || !API_KEY) {
    console.warn('Semantic search unavailable: missing index or API key');
    return [];
  }

  console.log('🔮 Starting semantic search for:', query);

  try {
    // Use Grok to find semantically related terms
    const relatedTerms = await getRelatedTerms(query);
    
    if (relatedTerms.length === 0) {
      console.log('No related terms found');
      return [];
    }

    console.log('Found related terms:', relatedTerms);

    // Search for each related term in our index
    const allResults = new Map<string, SearchMatch>();
    
    for (const term of relatedTerms) {
      const termLower = term.toLowerCase();
      
      // Direct title/content search for this term
      for (const [, article] of searchIndex.articles) {
        if (allResults.has(article.id)) continue;
        
        const titleMatch = article.titleLower.includes(termLower);
        const contentMatch = article.content.toLowerCase().includes(termLower);
        
        if (titleMatch || contentMatch) {
          const score = titleMatch ? 0.7 : 0.5;
          allResults.set(article.id, {
            article,
            score,
            matchType: 'semantic',
            matchedOn: `related: ${term}`,
            highlight: titleMatch ? article.title : article.contentPreview.slice(0, 100),
          });
        }
      }
    }

    const results = [...allResults.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
    
    console.log(`✅ Semantic search found ${results.length} results`);
    return results;
  } catch (error) {
    console.error('Semantic search error:', error);
    return [];
  }
}

// ============================================
// ARTICLE GENERATION FROM SEARCH
// ============================================

const GENERATION_PROMPT = `Generate a concise, factual article on the given topic.

REQUIREMENTS:
1. Factual: All statements must be verifiable facts from public sources
2. Objective: No opinions, emotions, or speculation
3. Concise: 2-4 focused paragraphs covering the core topic
4. Informative: Include key dates, figures, or measurable data where relevant

For broad topics (e.g., "potato", "music"), write about the most essential, widely-known facts.
For specific queries, focus precisely on that aspect.

OUTPUT FORMAT:

# [Topic Title]

[2-4 paragraphs of factual content]

## Key Facts
- [Verifiable fact 1]
- [Verifiable fact 2]
- [Verifiable fact 3]

---

Only respond with {"null": true, "reason": "..."} if the topic is:
- Fictional/non-existent
- Purely opinion-based with no factual basis
- Harmful or inappropriate`;

export async function generateArticleFromSearch(
  query: string,
  similarArticles: SearchableArticle[] = []
): Promise<GenerationAttemptResult> {
  if (!API_KEY) {
    return {
      success: false,
      isNull: true,
      reason: 'API key not configured',
      sourceArticles: [],
    };
  }

  const contextSnippets = similarArticles
    .slice(0, 3)
    .map(a => `**${a.title}**: ${a.contentPreview}`)
    .join('\n\n');

  const userPrompt = similarArticles.length > 0
    ? `Query: "${query}"\n\nRelated existing articles for context:\n${contextSnippets}\n\nGenerate a new article that addresses this specific query, building on but distinct from the existing articles.`
    : `Query: "${query}"\n\nGenerate a concise article addressing this topic.`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast',
        messages: [
          { role: 'system', content: GENERATION_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        search_parameters: {
          mode: 'auto',
          max_search_results: 5,
          return_citations: true,
        },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Check for null response
    if (content.includes('"null"') && content.includes('true')) {
      try {
        const nullResponse = JSON.parse(content.replace(/```json?|```/g, '').trim());
        if (nullResponse.null) {
          return {
            success: false,
            isNull: true,
            reason: nullResponse.reason || 'Unable to generate verifiable content',
            sourceArticles: similarArticles.map(a => a.id),
          };
        }
      } catch {
        // Not a null response, continue
      }
    }

    // Extract title from content
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : query;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);

    return {
      success: true,
      article: {
        id: `generated-${Date.now()}`,
        title,
        slug,
        content,
      },
      isNull: false,
      sourceArticles: similarArticles.map(a => a.id),
    };
  } catch (error) {
    console.error('Article generation error:', error);
    return {
      success: false,
      isNull: true,
      reason: error instanceof Error ? error.message : 'Generation failed',
      sourceArticles: similarArticles.map(a => a.id),
    };
  }
}

// ============================================
// FIND SIMILAR ARTICLES
// ============================================

export async function findSimilarArticles(
  articleId: string,
  topK: number = 5
): Promise<SearchMatch[]> {
  if (!searchIndex) return [];

  const article = searchIndex.articles.get(articleId);
  if (!article) return [];

  // Use title + keywords for similarity
  const searchTerms = [article.title, ...article.keywords.slice(0, 5)].join(' ');
  const results = await searchArticles(searchTerms, { maxResults: topK + 1, minScore: 0.2 });

  // Filter out the source article
  return results.filter((r: SearchMatch) => r.article.id !== articleId).slice(0, topK);
}

// ============================================
// EXPORT UTILITIES
// ============================================

export function getArticleById(id: string): SearchableArticle | undefined {
  return searchIndex?.articles.get(id);
}

export function getAllArticleTitles(): string[] {
  if (!searchIndex) return [];
  return [...searchIndex.articles.values()].map(a => a.title);
}

export function getArticleCount(): number {
  return searchIndex?.articles.size || 0;
}
