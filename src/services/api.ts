// Grokipedia API Service - Real Search + Verification Pipeline
import type { KnowledgeNode, Claim, Citation, SearchResult, GenerationResult } from '../types/knowledge';

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
// CLAIM EXTRACTION
// ============================================
async function extractClaims(content: string, title: string): Promise<Claim[]> {
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
          content: `You extract atomic factual claims from text. Each claim should be:
- A single verifiable statement
- Contain specific data (numbers, dates, names) when present
- Independent of other claims

Return JSON array of claims.`
        },
        {
          role: 'user',
          content: `Extract all factual claims from this article titled "${title}":

${content}

Return JSON:
{
  "claims": [
    { "text": "specific factual claim", "domain": "category" },
    ...
  ]
}`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) return [];

  const data = await response.json();
  try {
    const parsed = JSON.parse(data.choices[0]?.message?.content || '{}');
    return (parsed.claims || []).map((c: any, i: number) => ({
      id: `claim-${Date.now()}-${i}`,
      text: c.text || c.statement, // Support both field names
      domain: c.domain || 'general',
      confidence: 0.5, // Initial confidence before verification
      verified: false,
      citations: [],
    }));
  } catch {
    return [];
  }
}

// ============================================
// CLAIM VERIFICATION
// ============================================
async function verifyClaims(claims: Claim[]): Promise<Claim[]> {
  const verifiedClaims: Claim[] = [];
  
  for (const claim of claims.slice(0, 5)) { // Verify top 5 claims to avoid rate limits
    const claimText = claim.text || '';
    console.log(`✓ Verifying: "${claimText.slice(0, 50)}..."`);
    
    try {
      const { content, sources } = await searchWithGrok(
        `Verify this claim with sources: "${claimText}"`
      );
      
      // Check if verification found supporting evidence
      const isSupported = content.toLowerCase().includes('true') || 
                          content.toLowerCase().includes('correct') ||
                          content.toLowerCase().includes('accurate') ||
                          sources.length > 0;
      
      verifiedClaims.push({
        ...claim,
        verified: isSupported,
        confidence: sources.length > 0 ? Math.min(0.9, 0.5 + sources.length * 0.1) : 0.3,
        citations: sources.map(s => ({
          url: s.url,
          title: s.title,
          snippet: s.snippet,
          retrievedAt: new Date().toISOString(),
        })),
      });
    } catch (error) {
      verifiedClaims.push({ ...claim, verified: false, confidence: 0.2 });
    }
  }
  
  // Add unverified claims back
  for (const claim of claims.slice(5)) {
    verifiedClaims.push({ ...claim, verified: false, confidence: 0.3 });
  }
  
  return verifiedClaims;
}

// ============================================
// MAIN GENERATION with Chain-of-Thought
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
        max_search_results: 5,
        return_citations: true,
      },
      temperature: 0.3,
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
  
  // Step 3: Extract claims from the article content
  console.log('📝 Step 3: Extracting claims...');
  const claims = await extractClaims(articleContent, articleTitle);
  
  // Step 4: Verify claims
  console.log('✅ Step 4: Verifying claims...');
  const verifiedClaims = await verifyClaims(claims);
  
  // Calculate overall confidence
  const avgConfidence = verifiedClaims.length > 0 
    ? verifiedClaims.reduce((sum, c) => sum + c.confidence, 0) / verifiedClaims.length 
    : 0.5;
  
  const verifiedCount = verifiedClaims.filter(c => c.verified).length;
  const verificationStatus = verifiedCount === verifiedClaims.length ? 'verified' 
    : verifiedCount > 0 ? 'disputed' 
    : 'pending';

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
    
    claims: verifiedClaims,
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
  
  console.log(`✨ Generated node with ${verifiedClaims.length} claims, ${allSources.length} sources, confidence: ${(avgConfidence * 100).toFixed(0)}%`);
  
  return {
    node,
    searchResults: allSources,
    reasoning: '', // No separate reasoning field for plain text articles
  };
}

// ============================================
// PROMPTS - Grokipedia Knowledge Synthesizer
// ============================================
const SYNTHESIS_SYSTEM_PROMPT = `Task Directive:

"Your task is to act as the Grokipedia Knowledge Synthesizer. You must generate a single, new article that represents the most granular and atomic logical connection between the two provided Parent Articles ($A_1$ and $A_2$). This article will serve as the causal link between them in the Grokipedia knowledge graph."

Mandatory Synthesis Constraints (Utilitarian & Granularity):

Your synthesis must strictly adhere to the following standards. Failure to meet any of these criteria requires engaging the Uncertainty Protocol below:

1. Causal Atomicity: The generated article must describe the smallest verifiable step or mechanism that directly connects $A_1$ to $A_2$. The output must be at the lowest possible level of abstraction.

2. Utilitarian Focus: The content must detail the specific, non-subjective mechanism by which the state of $A_1$ necessitated the change or resulted in the consequence of $A_2$.

3. Efficiency Delta: The article must include a measurable statement on the change in efficiency, utility, or resource allocation (cost, time, energy, safety) created by this causal step.

4. Impersonal and Factual: Strictly exclude all subjective elements, including: individual emotions, personal opinions, speculative intent, or political rhetoric.

OUTPUT INSTRUCTIONS:

A. SUCCESSFUL SYNTHESIS (Constraints Met):

If you successfully meet all four constraints, output ONLY the full text of the new, highly granular article. Do not include JSON formatting, metadata, or any additional structure. Output only the article content itself.

B. UNCERTAINTY PROTOCOL (Constraints NOT Met):

If you cannot meet all four constraints (due to logical contradiction, missing data, or unavoidable high abstraction), you must generate an Uncertainty Node ($U$) instead of an article. Output the following JSON structure:

{
  "node_type": "Uncertainty",
  "reason_code": "[State the PRIMARY reason: CONTRADICTION, MISSING_DATA, or ABSTRACTION_BREACH]",
  "null_hypothesis": "[State the exact, specific question the granular article was trying to answer but failed to resolve.]",
  "required_data_type": "[Specify the type of external information needed to resolve this uncertainty (e.g., 'Documented corporate emails', '1987 financial audit', 'Declassified technical specifications').]",
  "analysis_summary": "[Provide a brief (2-3 sentence) summary of why A1 and A2 cannot be logically or granularly connected, citing the specific constraint that failed.]"
}`;

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
  
  // Build parent article sections with full text
  const parentArticleA1 = `Parent Article A1 (Source of Cause):

${topic1.content}`;

  const parentArticleA2 = `Parent Article A2 (Result/Consequence):

${topic2.content}`;
  
  const sourceList = sources.slice(0, 8).map(s => 
    `• [${s.title}](${s.url}): ${s.snippet?.slice(0, 150) || 'No snippet'}`
  ).join('\n');
  
  return `Input Articles:

${parentArticleA1}

---

${parentArticleA2}

=== RESEARCH CONTEXT ===
${research.slice(0, 4000)}

=== VERIFIED SOURCES ===
${sourceList || 'No external sources available - rely on article content and your knowledge'}

---

Apply the four mandatory constraints:
1. Causal Atomicity - What is the smallest, most specific mechanism linking $A_1$ to $A_2$?
2. Utilitarian Focus - What non-subjective process connects cause to effect?
3. Efficiency Delta - What measurable change in resources/efficiency occurred?
4. Impersonal/Factual - Exclude all subjective elements, opinions, rhetoric

If you can satisfy ALL FOUR constraints → Output ONLY the full text of the article (no JSON, no metadata)
If you CANNOT satisfy all constraints → Output the Uncertainty Protocol JSON structure exactly as specified`;
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
