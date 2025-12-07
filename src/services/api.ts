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
    article = { status: 'success', title: 'Synthesis Result', content: data.choices[0]?.message?.content || '' };
  }
  
  // Collect all citations
  const allSources = [...researchSources];
  if (data.choices[0]?.message?.citations) {
    for (const c of data.choices[0].message.citations) {
      allSources.push({ title: c.title, url: c.url, snippet: c.snippet || '' });
    }
  }
  
  // Handle UNCERTAINTY PROTOCOL
  if (article.status === 'uncertainty' || article.node_type === 'Uncertainty') {
    console.log('⚠️ Uncertainty Protocol triggered:', article.reason_code);
    
    const uncertaintyContent = `## Uncertainty Node

**Reason:** ${article.reason_code || 'ABSTRACTION_BREACH'}

**Null Hypothesis:** ${article.null_hypothesis || 'Unable to determine specific causal connection.'}

**Required Data:** ${article.required_data_type || 'Additional source documentation needed.'}

**Analysis:** ${article.analysis_summary || 'The connection between these topics requires more granular data to establish a verifiable causal link.'}`;

    const node: KnowledgeNode = {
      id: nodeId,
      title: `[Uncertainty] ${topicNames}`,
      slug: `uncertainty-${Date.now()}`,
      content: uncertaintyContent,
      
      sourceNodes: topics.map((_, i) => `source-${i}`),
      createdAt: timestamp,
      updatedAt: timestamp,
      generationMethod: 'synthesis',
      
      confidence: 0.2,
      verificationStatus: 'pending',
      
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
      tags: ['uncertainty', article.reason_code?.toLowerCase() || 'unresolved'],
    };
    
    return {
      node,
      searchResults: allSources,
      reasoning: article.analysis_summary || '',
      isUncertainty: true,
    };
  }
  
  // SUCCESSFUL SYNTHESIS
  console.log('✅ Successful synthesis with causal mechanism:', article.causal_mechanism?.slice(0, 100));
  
  // Step 3: Extract claims (use key_claims from response if available)
  console.log('📝 Step 3: Extracting claims...');
  let claims: Claim[] = [];
  if (article.key_claims && Array.isArray(article.key_claims)) {
    claims = article.key_claims.map((c: string, i: number) => ({
      id: `claim-${nodeId}-${i}`,
      text: c,
      verified: false,
      confidence: article.confidence || 0.7,
      sourceNodeId: nodeId,
    }));
  } else {
    claims = await extractClaims(article.content || '', article.title || '');
  }
  
  // Step 4: Verify claims
  console.log('✅ Step 4: Verifying claims...');
  const verifiedClaims = await verifyClaims(claims);
  
  // Calculate overall confidence (use article confidence if provided)
  const avgConfidence = article.confidence || (verifiedClaims.length > 0 
    ? verifiedClaims.reduce((sum, c) => sum + c.confidence, 0) / verifiedClaims.length 
    : 0.5);
  
  const verifiedCount = verifiedClaims.filter(c => c.verified).length;
  const verificationStatus = verifiedCount === verifiedClaims.length ? 'verified' 
    : verifiedCount > 0 ? 'disputed' 
    : 'pending';

  // Enhance content with efficiency delta and causal mechanism
  let enhancedContent = article.content || '';
  if (article.efficiency_delta) {
    enhancedContent += `\n\n**Efficiency Delta:** ${article.efficiency_delta}`;
  }
  if (article.causal_mechanism) {
    enhancedContent += `\n\n**Causal Mechanism:** ${article.causal_mechanism}`;
  }

  // Build knowledge node
  const node: KnowledgeNode = {
    id: nodeId,
    title: article.title || `Synthesis: ${topicNames}`,
    slug: (article.slug || `synthesis-${Date.now()}`).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    content: enhancedContent,
    
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
    reasoning: article.causal_mechanism || '',
  };
}

// ============================================
// PROMPTS - Grokipedia Knowledge Synthesizer
// ============================================
const SYNTHESIS_SYSTEM_PROMPT = `Your task is to act as the Grokipedia Knowledge Synthesizer. You must generate a single, new article that represents the most granular and atomic logical connection between the provided Parent Articles. This article will serve as the causal link between them in the Grokipedia knowledge graph.

MANDATORY SYNTHESIS CONSTRAINTS (Utilitarian & Granularity):
Your synthesis must strictly adhere to the following standards. Failure to meet any of these criteria requires engaging the Uncertainty Protocol:

1. CAUSAL ATOMICITY: The generated article must describe the smallest verifiable step or mechanism that directly connects the parent articles. The output must be at the lowest possible level of abstraction.

2. UTILITARIAN FOCUS: The content must detail the specific, non-subjective mechanism by which the state of A₁ necessitated the change or resulted in the consequence of A₂.

3. EFFICIENCY DELTA: The article must include a measurable statement on the change in efficiency, utility, or resource allocation (cost, time, energy, safety) created by this causal step.

4. IMPERSONAL AND FACTUAL: Strictly exclude all subjective elements, including: individual emotions, personal opinions, speculative intent, or political rhetoric.

OUTPUT INSTRUCTIONS:

A. SUCCESSFUL SYNTHESIS (All Constraints Met):
If you successfully meet all four constraints, output JSON:
{
  "status": "success",
  "title": "Precise mechanism/process name",
  "slug": "url-safe-lowercase-slug",
  "content": "Full text of the highly granular article (2-4 paragraphs)",
  "efficiency_delta": "Quantified change in efficiency/utility/resources",
  "causal_mechanism": "The specific atomic mechanism connecting A₁ to A₂",
  "confidence": 0.0-1.0,
  "key_claims": ["verifiable claim 1", "verifiable claim 2", ...]
}

B. UNCERTAINTY PROTOCOL (Constraints NOT Met):
If you cannot meet all four constraints (due to logical contradiction, missing data, or unavoidable high abstraction), generate an Uncertainty Node instead:
{
  "status": "uncertainty",
  "node_type": "Uncertainty",
  "reason_code": "CONTRADICTION | MISSING_DATA | ABSTRACTION_BREACH",
  "null_hypothesis": "The exact question the granular article was trying to answer but failed to resolve",
  "required_data_type": "Type of external information needed (e.g., 'Documented corporate emails', 'Financial audit data', 'Technical specifications')",
  "analysis_summary": "2-3 sentence summary of why the articles cannot be granularly connected, citing the specific constraint that failed"
}`;

function buildSynthesisPrompt(
  topics: { title: string; content: string }[],
  research: string,
  sources: SearchResult[]
): string {
  // Build parent article sections
  const parentArticles = topics.map((t, i) => {
    const truncatedContent = t.content.slice(0, 3000);
    const role = i === 0 ? 'Source of Cause' : i === topics.length - 1 ? 'Result/Consequence' : `Intermediate ${i}`;
    return `=== PARENT ARTICLE A${i + 1} (${role}): ${t.title} ===\n${truncatedContent}`;
  }).join('\n\n---\n\n');
  
  const sourceList = sources.slice(0, 8).map(s => 
    `• [${s.title}](${s.url}): ${s.snippet?.slice(0, 150) || 'No snippet'}`
  ).join('\n');

  const topicLabels = topics.map((t, i) => `A${i + 1}=${t.title}`).join(', ');
  
  return `SYNTHESIS TASK: Generate the causal link between ${topics.length} parent articles.

${parentArticles}

=== RESEARCH CONTEXT ===
${research.slice(0, 4000)}

=== VERIFIED SOURCES ===
${sourceList || 'No external sources available - rely on article content and your knowledge'}

---

TOPICS TO CONNECT: ${topicLabels}

APPLY THE FOUR CONSTRAINTS:
1. CAUSAL ATOMICITY - What is the smallest, most specific mechanism linking these?
2. UTILITARIAN FOCUS - What non-subjective process connects cause to effect?
3. EFFICIENCY DELTA - What measurable change in resources/efficiency occurred?
4. IMPERSONAL/FACTUAL - Exclude all subjective elements, opinions, rhetoric

If you can satisfy ALL FOUR constraints → Output successful synthesis JSON
If you CANNOT satisfy all constraints → Output Uncertainty Protocol JSON

Return ONLY valid JSON.`;
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
