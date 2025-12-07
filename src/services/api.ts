// Grokipedia API Service - Real Search + Verification Pipeline
import type { KnowledgeNode, Claim, Citation, SearchResult, GenerationResult } from '../types/knowledge';

const API_URL = 'https://api.x.ai/v1/chat/completions';
const API_KEY = '';

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
    { "statement": "specific factual claim", "domain": "category" },
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
      statement: c.statement,
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
    console.log(`✓ Verifying: "${claim.statement.slice(0, 50)}..."`);
    
    try {
      const { content, sources } = await searchWithGrok(
        `Verify this claim with sources: "${claim.statement}"`
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
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`Generation API error: ${response.status}`);
  }

  const data = await response.json();
  let article: any;
  
  try {
    article = JSON.parse(data.choices[0]?.message?.content || '{}');
  } catch {
    article = { title: 'Synthesis Result', content: data.choices[0]?.message?.content || '', reasoning: '' };
  }
  
  // Collect all citations
  const allSources = [...researchSources];
  if (data.choices[0]?.message?.citations) {
    for (const c of data.choices[0].message.citations) {
      allSources.push({ title: c.title, url: c.url, snippet: c.snippet || '' });
    }
  }
  
  // Step 3: Extract claims
  console.log('📝 Step 3: Extracting claims...');
  const claims = await extractClaims(article.content || '', article.title || '');
  
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
    title: article.title || `Synthesis: ${topicNames}`,
    slug: (article.slug || `synthesis-${Date.now()}`).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    content: article.content || '',
    
    sourceNodes: topics.map((_, i) => `source-${i}`),
    createdAt: timestamp,
    updatedAt: timestamp,
    generationMethod: topics.length === 1 ? 'expansion' : 'synthesis',
    
    confidence: avgConfidence,
    verificationStatus,
    
    claims: verifiedClaims,
    citations: allSources.map(s => ({
      url: s.url,
      title: s.title,
      snippet: s.snippet,
      retrievedAt: timestamp,
    })),
    
    domains: extractDomains(article.content || ''),
    entities: extractEntities(article.content || ''),
    
    annotations: [],
    tags: [],
  };
  
  console.log(`✨ Generated node with ${verifiedClaims.length} claims, ${allSources.length} sources, confidence: ${(avgConfidence * 100).toFixed(0)}%`);
  
  return {
    node,
    searchResults: allSources,
    reasoning: article.reasoning || '',
  };
}

// ============================================
// PROMPTS with Chain-of-Thought + Few-Shot
// ============================================
const SYNTHESIS_SYSTEM_PROMPT = `You are a rigorous knowledge synthesis engine. You produce factual, verifiable content with explicit reasoning.

METHODOLOGY:
1. ANALYZE: Identify the core concepts in each source
2. CONNECT: Find specific causal mechanisms linking them
3. VERIFY: Only include claims you can support with evidence
4. SYNTHESIZE: Create atomic, verifiable knowledge

OUTPUT RULES:
- Every claim must be specific (names, dates, numbers)
- No filler phrases ("importantly", "interestingly", "notably")
- No hedging without reason ("might", "could", "possibly")
- Cite sources inline when possible
- Include your reasoning process

OUTPUT FORMAT (JSON):
{
  "reasoning": "Step-by-step analysis of how you connected the topics",
  "title": "Specific mechanism/process name (not generic)",
  "slug": "url-safe-lowercase-slug",
  "content": "2-3 paragraphs of verified facts with inline citations",
  "confidence": 0.0-1.0,
  "key_claims": ["claim1", "claim2", ...]
}`;

function buildSynthesisPrompt(
  topics: { title: string; content: string }[],
  research: string,
  sources: SearchResult[]
): string {
  const topicSections = topics.map((t, i) => 
    `=== TOPIC ${i + 1}: ${t.title} ===\n${t.content.slice(0, 2000)}`
  ).join('\n\n');
  
  const sourceList = sources.slice(0, 5).map(s => 
    `- ${s.title}: ${s.snippet?.slice(0, 200) || 'No snippet'} (${s.url})`
  ).join('\n');
  
  return `TASK: Synthesize a knowledge node connecting these ${topics.length} topics.

${topicSections}

=== RESEARCH FINDINGS ===
${research.slice(0, 3000)}

=== AVAILABLE SOURCES ===
${sourceList || 'No sources yet - search for more'}

INSTRUCTIONS:
1. First, explain your reasoning: What specific mechanism connects these topics?
2. Identify 3-5 key factual claims you can make
3. Write the synthesis article with inline source references
4. Rate your confidence based on source quality

Return valid JSON matching the schema.`;
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
