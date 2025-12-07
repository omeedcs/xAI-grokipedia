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

// Synthesis prompt matching runDemoSimulation.ts for consistency
const SYNTHESIS_PROMPT = `You are the Grokipedia Knowledge Synthesizer. Generate comprehensive, encyclopedic articles that connect two parent articles with academic rigor.

## SYNTHESIS CONSTRAINTS
1. **Causal Atomicity**: Identify the smallest verifiable mechanism connecting A₁ to A₂
2. **Utilitarian Focus**: Detail specific, non-subjective processes (cause → effect)
3. **Efficiency Delta**: Include measurable changes (cost, time, energy, safety)
4. **Impersonal/Factual**: No opinions, emotions, or speculation—encyclopedic neutrality

## ARTICLE STRUCTURE (Required Format)

# [Descriptive, Specific Title]

[LEAD SECTION: A dense 2-3 paragraph introduction that summarizes the connection, its significance, key facts, and measurable impact.]

## Background and Context
[Historical context, what existed before this connection, why it matters. 2-3 paragraphs with specific details.]

## Mechanism of Connection
[The specific causal process linking A₁ → A₂. Explain HOW the connection works mechanistically. 3-4 paragraphs.]

## Quantitative Impact
[Measurable outcomes with specific metrics, data, and comparisons]

## Historical Development
[Timeline of how this connection emerged and evolved.]

## Current Status
[Modern relevance, ongoing applications, or contemporary developments]

## References
[MANDATORY: You MUST include AT LEAST 10 references. This is NON-NEGOTIABLE. Each reference must be:
- A real, verifiable source with full URL
- From academic papers, official documentation, news sources, or authoritative websites
- Formatted as a numbered list [1], [2], etc. with clickable URLs
- If you cannot find 10 real sources, you MUST use the Uncertainty Protocol instead]

## WRITING STYLE
- Academic rigor with specific data
- Encyclopedic neutrality
- 800-1200 words minimum
- Inline citations [1], [2], [3] for EVERY factual claim throughout the article
- MANDATORY: Minimum 10 unique references - articles with fewer than 10 references are INVALID
- Every paragraph must have at least one citation

---

## UNCERTAINTY PROTOCOL
If you CANNOT meet all synthesis constraints (causal atomicity, efficiency delta, impersonal/factual), you MUST output this JSON instead of an article:

{"node_type":"Uncertainty","reason_code":"CONTRADICTION|MISSING_DATA|ABSTRACTION_BREACH","null_hypothesis":"[the question/connection that failed]","required_data_type":"[what data would be needed]","analysis_summary":"[why the connection cannot be established]"}

Use CONTRADICTION when sources conflict, MISSING_DATA when information is unavailable, ABSTRACTION_BREACH when the connection is too vague or philosophical to establish causally.`;

// Simple standalone generation prompt (fallback when no neighbors found)
const STANDALONE_PROMPT = `Generate a comprehensive, encyclopedic article on the given topic.

REQUIREMENTS:
1. Factual: All statements must be verifiable facts from public sources
2. Objective: No opinions, emotions, or speculation
3. Comprehensive: Cover the topic thoroughly with specific data
4. Well-referenced: Include at least 5 references with URLs

OUTPUT FORMAT:

# [Topic Title]

[3-4 paragraphs of factual content with inline citations]

## Key Facts
- [Verifiable fact 1]
- [Verifiable fact 2]
- [Verifiable fact 3]

## References
[Numbered list with URLs]

---

Only respond with {"null": true, "reason": "..."} if the topic is:
- Fictional/non-existent
- Purely opinion-based with no factual basis
- Harmful or inappropriate`;

// ============================================
// SEMANTIC NEIGHBOR FINDING
// ============================================

/**
 * Compute semantic distance between two texts (Jaccard-based)
 */
function computeSemanticDistance(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(w => w.length > 2));

  let intersection = 0;
  words1.forEach(w => { if (words2.has(w)) intersection++; });

  const union = words1.size + words2.size - intersection;
  const jaccard = intersection / union;

  // Invert: low similarity = high distance = more interesting connection
  return 1 - jaccard;
}

/**
 * Find the two closest semantic neighbors to a query
 * Returns articles sorted by semantic relevance (closest first)
 */
export function findTwoClosestNeighbors(
  query: string
): { article: SearchableArticle; distance: number }[] {
  if (!searchIndex) return [];

  const results: { article: SearchableArticle; distance: number }[] = [];

  for (const [, article] of searchIndex.articles) {
    // Compute semantic distance based on title + content preview
    const articleText = `${article.title} ${article.contentPreview}`;
    const distance = computeSemanticDistance(query, articleText);

    // We want CLOSEST neighbors, so lower distance is better
    // But we also want some semantic distance for interesting synthesis
    // Score articles that are related but not identical
    const relevanceScore = 1 - distance; // Higher = more similar

    if (relevanceScore > 0.1) { // Must have some relevance
      results.push({ article, distance });
    }
  }

  // Sort by relevance (lower distance = more similar = first)
  results.sort((a, b) => a.distance - b.distance);

  // Return top 2
  return results.slice(0, 2);
}

/**
 * Find closest articles for edge creation (fallback when no semantic neighbors found)
 * Uses text matching as a simpler fallback
 */
function findClosestArticlesForEdges(query: string, count: number = 2): SearchableArticle[] {
  if (!searchIndex) return [];

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  const results: { article: SearchableArticle; score: number }[] = [];

  for (const article of searchIndex.articles.values()) {
    let score = 0;

    // Check title matches
    const titleLower = article.titleLower;
    for (const word of queryWords) {
      if (titleLower.includes(word)) {
        score += 0.3;
      }
    }

    // Check keyword matches
    for (const keyword of article.keywords) {
      const keywordLower = keyword.toLowerCase();
      for (const word of queryWords) {
        if (keywordLower.includes(word) || word.includes(keywordLower)) {
          score += 0.2;
        }
      }
    }

    // Check content preview
    const contentLower = article.contentPreview.toLowerCase();
    for (const word of queryWords) {
      if (contentLower.includes(word)) {
        score += 0.1;
      }
    }

    if (score > 0) {
      results.push({ article, score });
    }
  }

  // If no matches, just return random articles
  if (results.length === 0) {
    const allArticles = Array.from(searchIndex.articles.values());
    return allArticles.slice(0, count);
  }

  // Sort by score and return top N
  results.sort((a, b) => b.score - a.score);
  console.log(`🔗 Found ${results.length} articles for edges via text match:`,
    results.slice(0, count).map(r => `${r.article.title} (score: ${r.score.toFixed(2)})`));

  return results.slice(0, count).map(r => r.article);
}

/**
 * Find semantically similar articles to use as additional context
 * When the query is very close to existing articles, we include their "neighbors"
 */
function findAdditionalContext(
  primaryNeighbors: { article: SearchableArticle; distance: number }[],
  _query: string,
  maxAdditional: number = 3
): SearchableArticle[] {
  if (!searchIndex || primaryNeighbors.length < 2) return [];

  const additionalContext: SearchableArticle[] = [];
  const primaryIds = new Set(primaryNeighbors.map(n => n.article.id));

  // For each primary neighbor, find articles that are semantically close to IT
  for (const neighbor of primaryNeighbors) {
    if (neighbor.distance < 0.5) { // High similarity - include related articles
      for (const [, article] of searchIndex.articles) {
        if (primaryIds.has(article.id) || additionalContext.some(a => a.id === article.id)) {
          continue;
        }

        const neighborText = `${neighbor.article.title} ${neighbor.article.contentPreview}`;
        const articleText = `${article.title} ${article.contentPreview}`;
        const distance = computeSemanticDistance(neighborText, articleText);

        // Include articles that are related to the neighbor
        if (distance < 0.6 && additionalContext.length < maxAdditional) {
          additionalContext.push(article);
        }
      }
    }
  }

  return additionalContext;
}

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

  // Find the two closest semantic neighbors for synthesis
  const neighbors = findTwoClosestNeighbors(query);
  console.log(`🔗 Found ${neighbors.length} semantic neighbors for synthesis:`,
    neighbors.map(n => `${n.article.title} (dist: ${n.distance.toFixed(2)})`));

  // Use neighbors if found, otherwise fall back to provided similarArticles
  const contextArticles = neighbors.length >= 2
    ? neighbors.map(n => n.article)
    : similarArticles.slice(0, 2);

  // Find additional context from connected nodes when similarity is high
  const additionalContext = findAdditionalContext(neighbors, query);
  if (additionalContext.length > 0) {
    console.log(`📚 Including ${additionalContext.length} additional context articles:`,
      additionalContext.map(a => a.title));
  }

  // Choose prompt based on whether we have neighbors for synthesis
  const useSynthesis = contextArticles.length >= 2;
  const systemPrompt = useSynthesis ? SYNTHESIS_PROMPT : STANDALONE_PROMPT;

  let userPrompt: string;
  if (useSynthesis) {
    // Full synthesis mode with two parent articles
    const node1 = contextArticles[0];
    const node2 = contextArticles[1];

    // Build additional context section if we have related articles
    let additionalContextSection = '';
    if (additionalContext.length > 0) {
      additionalContextSection = `\n\n---\n\n## RELATED CONTEXT (for reference):\n${additionalContext.map(a =>
        `### ${a.title}\n${a.contentPreview}`
      ).join('\n\n')}`;
    }

    userPrompt = `Synthesize a new article about "${query}" by connecting these two parent articles:

## PARENT ARTICLE A₁: ${node1.title}
${node1.content?.slice(0, 2000) || node1.contentPreview}

---

## PARENT ARTICLE A₂: ${node2.title}
${node2.content?.slice(0, 2000) || node2.contentPreview}${additionalContextSection}

---

Generate an encyclopedic article about "${query}" that identifies the specific mechanism, technology, or causal link between these concepts. The title should be specific and descriptive.

If you cannot establish a clear causal connection with measurable outcomes, respond with the Uncertainty JSON format specified in your instructions.`;
  } else {
    // Standalone generation (no neighbors found)
    userPrompt = `Query: "${query}"\n\nGenerate a comprehensive article addressing this topic.`;
  }

  try {
    console.log(`📝 Generating article with ${useSynthesis ? 'synthesis' : 'standalone'} mode`);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-non-reasoning',  // Fast model for quick generation
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        search_parameters: {
          mode: 'auto',
          max_search_results: 20,
          return_citations: true,
        },
        temperature: 0.5,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Check for null/uncertainty response
    if (content.includes('"null"') || content.includes('"node_type"')) {
      try {
        const parsed = JSON.parse(content.replace(/```json?|```/g, '').trim());
        if (parsed.null || parsed.node_type === 'Uncertainty') {
          return {
            success: false,
            isNull: true,
            reason: parsed.reason || parsed.analysis_summary || 'Unable to generate verifiable content',
            sourceArticles: contextArticles.map(a => a.id),
          };
        }
      } catch {
        // Not a JSON response, continue
      }
    }

    // Extract title from content
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : query;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);

    // Return with neighbor IDs for edge creation
    return {
      success: true,
      article: {
        id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        slug,
        content,
      },
      isNull: false,
      sourceArticles: contextArticles.map(a => a.id),
      // Always include neighbor IDs for edge creation
      // Even in standalone mode, connect to closest articles in the graph
      neighborIds: contextArticles.length > 0
        ? contextArticles.map(a => a.id)
        : findClosestArticlesForEdges(query, 2).map(a => a.id),
    };
  } catch (error) {
    console.error('Article generation error:', error);
    return {
      success: false,
      isNull: true,
      reason: error instanceof Error ? error.message : 'Generation failed',
      sourceArticles: contextArticles.map(a => a.id),
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
