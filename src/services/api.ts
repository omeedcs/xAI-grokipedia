// Grokipedia API Service - Real Search + Verification Pipeline
import type { KnowledgeNode, SearchResult, GenerationResult } from '../types/knowledge';
import { createGeneratedNodeMetrics, createUncertaintyNodeMetrics } from './generationCycle';

const API_URL = 'https://api.x.ai/v1/chat/completions';
const API_KEY = import.meta.env.VITE_XAI_API_KEY || '';

// ============================================
// REAL SEARCH using Grok's Live Search
// ============================================
async function searchWithGrok(query: string): Promise<{ content: string; sources: SearchResult[] }> {
  console.log('🔍 Real search:', query);
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-4-1-fast',
      messages: [
        {
          role: 'system',
          content: 'You are a research assistant. Provide factual, sourced information. Always cite your sources.'
        },
        {
          role: 'user', 
          content: query
        }
      ],
      search_parameters: {
        mode: "auto",           // Enables live web search
        max_search_results: 10, // Get up to 10 sources
        return_citations: true, // Return source citations
        from_date: "2020-01-01" // Recent information
      },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error(`Search API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';
  
  // Extract citations from response
  const sources: SearchResult[] = [];
  if (data.choices[0]?.message?.citations) {
    for (const citation of data.choices[0].message.citations) {
      sources.push({
        title: citation.title || 'Source',
        url: citation.url || '',
        snippet: citation.snippet || '',
        publishedDate: citation.published_date,
      });
    }
  }
  
  console.log(`📚 Found ${sources.length} sources`);
  return { content, sources };
}

// ============================================
// MAIN GENERATION (Fast Mode)
// ============================================
export async function generateConnectionArticle(
  topics: { title: string; content: string }[]
): Promise<GenerationResult> {
  const timestamp = new Date().toISOString();
  const nodeId = `node-${Date.now()}`;
  
  // Step 1: Research with real search
  console.log('📖 Step 1: Researching topics...');
  const topicNames = topics.map(t => t.title).join(', ');
  const { content: researchContent, sources: researchSources } = await searchWithGrok(
    `Find the specific causal connections and relationships between: ${topicNames}. 
    Focus on: mechanisms, processes, events, data, and verified facts that link these topics.`
  );
  
  // Step 2: Generate with chain-of-thought
  console.log('🧠 Step 2: Synthesizing with reasoning...');
  
  // Ensure exactly 2 topics for A1/A2 format (mandatory requirement)
  if (topics.length !== 2) {
    throw new Error(`Synthesis requires exactly 2 parent articles (A₁ and A₂), got ${topics.length}. Please select exactly 2 nodes.`);
  }
  
  const synthesisPrompt = buildSynthesisPrompt(topics, researchContent, researchSources);
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-4-1-fast',
      messages: [
        { role: 'system', content: SYNTHESIS_SYSTEM_PROMPT },
        { role: 'user', content: synthesisPrompt }
      ],
      search_parameters: {
        mode: "auto",
        max_search_results: 10,
        return_citations: true,
      },
      temperature: 0.4, // Slightly higher for more natural, varied writing
      max_tokens: 8000, // Allow longer, comprehensive articles
      // NO response_format - we need to detect text vs JSON
    }),
  });

  if (!response.ok) {
    throw new Error(`Generation API error: ${response.status}`);
  }

  const data = await response.json();
  const rawContent = data.choices[0]?.message?.content || '';
  
  // Detect if response is JSON (Uncertainty Protocol) or plain text (Successful Synthesis)
  let article: any;
  let isUncertainty = false;
  
  try {
    // Try parsing as JSON first
    const parsed = JSON.parse(rawContent);
    if (parsed.node_type === 'Uncertainty') {
      // Uncertainty Protocol triggered
      isUncertainty = true;
      article = parsed;
    } else {
      // Unexpected JSON format - treat as successful synthesis with metadata
      article = { status: 'success', content: rawContent, ...parsed };
    }
  } catch {
    // Not JSON - this is a successful synthesis (plain text article)
    article = { 
      status: 'success', 
      content: rawContent,
      title: '', // Will be extracted from content
    };
  }
  
  // Collect all citations
  const allSources = [...researchSources];
  if (data.choices[0]?.message?.citations) {
    for (const c of data.choices[0].message.citations) {
      allSources.push({ title: c.title, url: c.url, snippet: c.snippet || '' });
    }
  }
  
  // Handle UNCERTAINTY PROTOCOL
  if (isUncertainty || article.node_type === 'Uncertainty') {
    console.log('⚠️ Uncertainty Protocol triggered:', article.reason_code);
    
    // Format uncertainty content with clear demarcation
    const uncertaintyContent = `# ⚠️ UNCERTAINTY NODE

**Reason Code:** ${article.reason_code || 'ABSTRACTION_BREACH'}

**Null Hypothesis:** ${article.null_hypothesis || 'Unable to determine specific causal connection.'}

**Required Data Type:** ${article.required_data_type || 'Additional source documentation needed.'}

**Analysis Summary:** ${article.analysis_summary || 'The connection between these topics requires more granular data to establish a verifiable causal link.'}

---

*This node represents an unresolved connection between the parent articles. The Uncertainty Protocol was triggered because the four mandatory synthesis constraints could not be satisfied.*`;

    const node: KnowledgeNode = {
      id: nodeId,
      title: `⚠️ [UNCERTAINTY] ${topicNames}`, // Clearly marked with warning symbol
      slug: `uncertainty-${Date.now()}`,
      content: uncertaintyContent,

      sourceNodes: topics.map((_, i) => `source-${i}`),
      createdAt: timestamp,
      updatedAt: timestamp,
      generationMethod: 'synthesis',

      confidence: 0.2,
      verificationStatus: 'unverifiable', // Uncertainty nodes are unverifiable

      // Graph Metrics (v0.5) - Uncertainty Node
      metrics: createUncertaintyNodeMetrics(),

      claims: [],
      citations: allSources.map(s => ({
        url: s.url,
        title: s.title,
        snippet: s.snippet,
        retrievedAt: timestamp,
      })),

      domains: ['uncertainty'],
      entities: [],
      annotations: [],
      tags: ['uncertainty', article.reason_code?.toLowerCase() || 'unresolved', 'protocol-triggered'],
    };

    return {
      node,
      searchResults: allSources,
      reasoning: article.analysis_summary || '',
      isUncertainty: true,
    };
  }
  
  // SUCCESSFUL SYNTHESIS (plain text article received)
  console.log('✅ Successful synthesis - plain text article received');

  const articleContent = article.content || '';

  // Extract title from content (first line or first sentence)
  let articleTitle = article.title || '';
  if (!articleTitle && articleContent) {
    const firstLine = articleContent.split('\n')[0].trim();
    // Remove markdown headers if present
    articleTitle = firstLine.replace(/^#+\s*/, '').slice(0, 100);
    if (!articleTitle) {
      // Fallback to first sentence
      const firstSentence = articleContent.split(/[.!?]/)[0].trim();
      articleTitle = firstSentence.slice(0, 100) || `Synthesis: ${topicNames}`;
    }
  }

  // FAST MODE: Skip claim extraction and verification for speed
  // Claims can be verified later in a background process
  const avgConfidence = 0.7; // Default confidence for synthesized content
  const verificationStatus = 'pending' as const;

  // Build knowledge node
  const node: KnowledgeNode = {
    id: nodeId,
    title: articleTitle,
    slug: (article.slug || `synthesis-${Date.now()}`).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    content: articleContent, // Use content as-is (already includes efficiency delta if mentioned)

    sourceNodes: topics.map((_, i) => `source-${i}`),
    createdAt: timestamp,
    updatedAt: timestamp,
    generationMethod: 'synthesis',

    confidence: avgConfidence,
    verificationStatus,

    // Graph Metrics (v0.5) - Generated Node
    metrics: createGeneratedNodeMetrics(),

    claims: [], // Claims extracted in fast mode - can be populated later
    citations: allSources.map(s => ({
      url: s.url,
      title: s.title,
      snippet: s.snippet,
      retrievedAt: timestamp,
    })),

    domains: extractDomains(articleContent),
    entities: extractEntities(articleContent),

    annotations: [],
    tags: [],
  };
  
  console.log(`✨ Generated node with ${allSources.length} sources, confidence: ${(avgConfidence * 100).toFixed(0)}%`);
  
  return {
    node,
    searchResults: allSources,
    reasoning: '', // No separate reasoning field for plain text articles
  };
}

// ============================================
// PROMPTS - Grokipedia Knowledge Synthesizer
// ============================================
const SYNTHESIS_SYSTEM_PROMPT = `You are the Grokipedia Knowledge Synthesizer. Generate comprehensive, encyclopedic articles that connect two parent articles with academic rigor.

## SYNTHESIS CONSTRAINTS
1. **Causal Atomicity**: Identify the smallest verifiable mechanism connecting A₁ to A₂
2. **Utilitarian Focus**: Detail specific, non-subjective processes (cause → effect)
3. **Efficiency Delta**: Include measurable changes (cost, time, energy, safety)
4. **Impersonal/Factual**: No opinions, emotions, or speculation—encyclopedic neutrality

## ARTICLE STRUCTURE (Required Format)

# [Descriptive, Specific Title]

[LEAD SECTION: A dense 2-3 paragraph introduction that summarizes the connection, its significance, key facts, and measurable impact. This should stand alone as a complete summary. Include specific dates, figures, and outcomes.]

## Background and Context
[Historical context, what existed before this connection, why it matters. 2-3 paragraphs with specific details.]

### [Relevant Subsection]
[Deeper exploration of a specific aspect]

## Mechanism of Connection
[The specific causal process linking A₁ → A₂. Explain HOW the connection works mechanistically. Use technical terminology with accessible explanations. 3-4 paragraphs.]

### Technical Details
[Specific implementation details, processes, or systems involved]

## Quantitative Impact
[Measurable outcomes with specific metrics, data, and comparisons]

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| [Metric 1] | [Value] | [Value] | [%/Δ] |
| [Metric 2] | [Value] | [Value] | [%/Δ] |

### Economic Effects
[Cost savings, revenue impact, market changes with specific figures]

### Operational Changes
[Efficiency gains, process improvements, time savings]

## Historical Development
[Timeline of how this connection emerged and evolved. Use chronological structure.]

- **[Year]**: [Event and its significance]
- **[Year]**: [Event and its significance]

## Broader Implications
[How this connection affected related systems, industries, or domains]

### [Domain-Specific Impact]
[Detailed exploration of effects in a specific area]

## Challenges and Limitations
[Objective discussion of problems, criticisms, or constraints. Present multiple perspectives.]

## Current Status
[Modern relevance, ongoing applications, or contemporary developments]

## Key Entities
- **[Entity 1]**: [Brief description and role]
- **[Entity 2]**: [Brief description and role]

---

## WRITING STYLE REQUIREMENTS
- **Academic rigor**: Support claims with specific data and verifiable facts
- **Encyclopedic neutrality**: Present information objectively, acknowledge debates
- **Formal but accessible**: Use technical terms with explanations
- **Comprehensive depth**: Each section should be substantive (3+ paragraphs minimum for major sections)
- **Hierarchical organization**: Use ### subsections to break down complex topics
- **Data-driven**: Include tables, metrics, percentages, and specific figures throughout
- **Cross-referencing**: Mention related concepts that could be explored further

## MINIMUM REQUIREMENTS
- At least 1500 words
- At least 6 major sections (##)
- At least 3 subsections (###)
- At least 1 data table
- At least 5 specific quantitative claims
- Chronological timeline where relevant

---

If you CANNOT meet all synthesis constraints (causal atomicity, efficiency delta, impersonal/factual), output this JSON instead:
{"node_type":"Uncertainty","reason_code":"CONTRADICTION|MISSING_DATA|ABSTRACTION_BREACH","null_hypothesis":"[question that failed]","required_data_type":"[data needed]","analysis_summary":"[why connection failed]"}`;

function buildSynthesisPrompt(
  topics: { title: string; content: string }[],
  research: string,
  sources: SearchResult[]
): string {
  // Ensure exactly 2 topics (A1 and A2)
  if (topics.length !== 2) {
    console.warn(`Expected 2 topics, got ${topics.length}. Using first 2.`);
  }
  const [topic1, topic2] = topics.slice(0, 2);

  // Allow more content for comprehensive synthesis
  const maxContentLength = 3000;
  const a1Content = topic1.content.slice(0, maxContentLength);
  const a2Content = topic2.content.slice(0, maxContentLength);

  // Format sources for citation
  const sourceList = sources.slice(0, 8).map((s, i) =>
    `[${i + 1}] ${s.title} - ${s.url}`
  ).join('\n');

  return `## PARENT ARTICLE A₁: ${topic1.title}

${a1Content}

---

## PARENT ARTICLE A₂: ${topic2.title}

${a2Content}

---

## RESEARCH FINDINGS

${research.slice(0, 3000)}

## AVAILABLE SOURCES FOR CITATION
${sourceList || 'No external sources available - use information from parent articles.'}

---

## YOUR TASK

Write a comprehensive Grokipedia article that synthesizes the connection between A₁ and A₂.

**Requirements:**
1. Identify the specific causal mechanism linking these two topics
2. Create a detailed, encyclopedic article following the exact structure specified
3. Include quantitative data, tables, and specific metrics
4. Write at least 1500 words with 6+ major sections
5. Maintain academic tone with encyclopedic neutrality
6. Reference the sources where applicable using [n] notation

If you cannot establish a clear, verifiable causal connection with measurable outcomes, respond with the Uncertainty JSON instead.`;
}

// ============================================
// HELPERS
// ============================================
function extractDomains(content: string): string[] {
  const domains: string[] = [];
  const domainKeywords: Record<string, string[]> = {
    'science': ['research', 'study', 'experiment', 'hypothesis', 'theory'],
    'technology': ['software', 'hardware', 'algorithm', 'computing', 'digital'],
    'economics': ['market', 'price', 'trade', 'gdp', 'inflation', 'economy'],
    'politics': ['government', 'policy', 'election', 'legislation', 'political'],
    'health': ['medical', 'disease', 'treatment', 'health', 'clinical'],
    'history': ['century', 'historical', 'ancient', 'war', 'civilization'],
  };
  
  const lower = content.toLowerCase();
  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some(k => lower.includes(k))) {
      domains.push(domain);
    }
  }
  
  return domains.length > 0 ? domains : ['general'];
}

function extractEntities(content: string): string[] {
  // Simple entity extraction - matches capitalized phrases
  const matches = content.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
  const unique = [...new Set(matches)].filter(e => e.length > 2 && !['The', 'This', 'That', 'These', 'Those'].includes(e));
  return unique.slice(0, 20);
}

// Legacy export for backward compatibility
export interface GeneratedArticle {
  title: string;
  slug: string;
  content: string;
}
