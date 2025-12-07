// Embeddings service for semantic search with cosine similarity

const API_URL = 'https://api.x.ai/v1/embeddings';
const API_KEY = import.meta.env.VITE_XAI_API_KEY || '';

export interface EmbeddingResult {
  embedding: number[];
  text: string;
}

// Cache embeddings in memory to avoid re-computing
const embeddingCache = new Map<string, number[]>();

// Get embedding for a single text
export async function getEmbedding(text: string): Promise<number[]> {
  // Check cache first
  const cacheKey = text.slice(0, 500); // Use first 500 chars as key
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'v1', // xAI embedding model
      input: text.slice(0, 8000), // Limit input size
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.status}`);
  }

  const data = await response.json();
  const embedding = data.data[0].embedding as number[];

  // Cache the result
  embeddingCache.set(cacheKey, embedding);

  return embedding;
}

// Get embeddings for multiple texts (batched)
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  // Check which texts need embedding
  const needsEmbedding: { text: string; index: number }[] = [];
  const results: number[][] = new Array(texts.length);

  texts.forEach((text, i) => {
    const cacheKey = text.slice(0, 500);
    if (embeddingCache.has(cacheKey)) {
      results[i] = embeddingCache.get(cacheKey)!;
    } else {
      needsEmbedding.push({ text, index: i });
    }
  });

  // Batch request for uncached embeddings
  if (needsEmbedding.length > 0) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'v1',
        input: needsEmbedding.map(item => item.text.slice(0, 8000)),
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`);
    }

    const data = await response.json();

    data.data.forEach((item: { embedding: number[] }, i: number) => {
      const { text, index } = needsEmbedding[i];
      const embedding = item.embedding;

      // Cache and store result
      embeddingCache.set(text.slice(0, 500), embedding);
      results[index] = embedding;
    });
  }

  return results;
}

// Cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (normA * normB);
}

// Find top-k most similar items
export function findTopK(
  queryEmbedding: number[],
  itemEmbeddings: { id: string; embedding: number[] }[],
  k: number
): { id: string; score: number }[] {
  const scores = itemEmbeddings.map(item => ({
    id: item.id,
    score: cosineSimilarity(queryEmbedding, item.embedding),
  }));

  scores.sort((a, b) => b.score - a.score);

  return scores.slice(0, k);
}

// Pre-compute embeddings for all nodes (call once on load)
export async function precomputeNodeEmbeddings(
  nodes: { id: string; title: string; content: string }[]
): Promise<Map<string, number[]>> {
  console.log(`📊 Pre-computing embeddings for ${nodes.length} nodes...`);

  const nodeEmbeddings = new Map<string, number[]>();

  // Process in batches of 20 to avoid rate limits
  const batchSize = 20;
  for (let i = 0; i < nodes.length; i += batchSize) {
    const batch = nodes.slice(i, i + batchSize);
    const texts = batch.map(n => `${n.title}\n\n${n.content.slice(0, 1000)}`);

    try {
      const embeddings = await getEmbeddings(texts);
      batch.forEach((node, j) => {
        nodeEmbeddings.set(node.id, embeddings[j]);
      });
    } catch (error) {
      console.error(`Error embedding batch ${i}:`, error);
    }

    // Small delay between batches
    if (i + batchSize < nodes.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`✅ Embeddings computed for ${nodeEmbeddings.size} nodes`);
  return nodeEmbeddings;
}

// Semantic search with threshold
export interface SemanticSearchResult {
  id: string;
  title: string;
  score: number;
  isRelevant: boolean; // score > threshold
}

export function semanticSearch(
  queryEmbedding: number[],
  nodeEmbeddings: Map<string, number[]>,
  nodes: { id: string; title: string }[],
  threshold: number = 0.3, // Minimum similarity score to be considered relevant
  topK: number = 10
): SemanticSearchResult[] {
  const results: SemanticSearchResult[] = [];

  for (const node of nodes) {
    const embedding = nodeEmbeddings.get(node.id);
    if (!embedding) continue;

    const score = cosineSimilarity(queryEmbedding, embedding);
    results.push({
      id: node.id,
      title: node.title,
      score,
      isRelevant: score >= threshold,
    });
  }

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topK);
}
