// Demo Simulation Runner - 20 iterations with step-by-step saves
// Follows the edge priority algorithm: P = w₁·S + w₂·N + w₃·D + w₄·R
// Run with: VITE_XAI_API_KEY=your-key npx tsx scripts/runDemoSimulation.ts

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://api.x.ai/v1/chat/completions';
const API_KEY = process.env.VITE_XAI_API_KEY || '';

if (!API_KEY) {
  console.error('❌ VITE_XAI_API_KEY not set');
  process.exit(1);
}

// Load demo seed data
const demoData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/demoData.json'), 'utf8')
);

interface Node {
  id: string;
  title: string;
  content: string;
  isUncertainty?: boolean;
  reasonCode?: string;
}

interface Edge {
  source: string;
  target: string;
}

interface ScoredEdge extends Edge {
  score: number;
  semanticDistance: number;
  novelty: number;
  degreeSum: number;
  recency: number;
}

interface SimulationStep {
  step: number;
  nodes: Node[];
  edges: Edge[];
  scoredEdges: ScoredEdge[];
  selectedEdge: ScoredEdge | null;
  generatedNode: Node | null;
  newEdges: Edge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    generatedNodes: number;
  };
}

// State
let nodes: Node[] = [...demoData.nodes];
let edges: Edge[] = [...demoData.edges];
const steps: SimulationStep[] = [];

// Priority weights - REBALANCED for exploration
// Reduced D and R to avoid "cluster trap" (hot clusters attracting all generations)
const WEIGHTS = {
  semantic: 0.5,    // S: semantic distance (higher = more different = more interesting)
  novelty: 0.4,     // N: novelty (edges not yet explored)
  degree: 0.05,     // D: degree centrality - reduced to avoid preferential attachment
  recency: 0.05,    // R: recency - reduced to not favor hot clusters
};

// Number of edges to select per iteration (top-N generation)
const EDGES_PER_ITERATION = 5;

// Track which edges have been used for generation
const exploredEdges = new Set<string>();

// Track node creation times (step number)
const nodeCreationStep = new Map<string, number>();
demoData.nodes.forEach((n: Node) => nodeCreationStep.set(n.id, 0));

// Track parent relationships (to avoid generating from a node and its immediate parent)
const nodeParents = new Map<string, Set<string>>();
demoData.nodes.forEach((n: Node) => nodeParents.set(n.id, new Set()));

// Simple semantic distance based on title/content overlap
function computeSemanticDistance(node1: Node, node2: Node): number {
  const words1 = new Set((node1.title + ' ' + node1.content).toLowerCase().split(/\W+/));
  const words2 = new Set((node2.title + ' ' + node2.content).toLowerCase().split(/\W+/));

  let intersection = 0;
  words1.forEach(w => { if (words2.has(w)) intersection++; });

  const union = words1.size + words2.size - intersection;
  const jaccard = intersection / union;

  // Invert: low similarity = high distance = higher score
  return 1 - jaccard;
}

// Compute degree of a node
function getNodeDegree(nodeId: string): number {
  return edges.filter(e => e.source === nodeId || e.target === nodeId).length;
}

// Get all possible edges (including potential new ones)
function getAllPossibleEdges(): ScoredEdge[] {
  const possibleEdges: ScoredEdge[] = [];
  const currentStep = steps.length;

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];
      const edgeKey = [node1.id, node2.id].sort().join('--');

      // Skip if already explored
      if (exploredEdges.has(edgeKey)) continue;

      // Skip if either node is an uncertainty node (don't build on uncertain foundations)
      if (node1.isUncertainty || node2.isUncertainty) continue;

      // Skip if one is a parent of the other (avoid redundant synthesis)
      const node1Parents = nodeParents.get(node1.id) || new Set();
      const node2Parents = nodeParents.get(node2.id) || new Set();
      if (node1Parents.has(node2.id) || node2Parents.has(node1.id)) continue;

      // Compute factors
      const semanticDistance = computeSemanticDistance(node1, node2);
      const novelty = exploredEdges.has(edgeKey) ? 0 : 1;
      const degreeSum = (getNodeDegree(node1.id) + getNodeDegree(node2.id)) / 10; // normalize

      // Recency: favor edges with at least one recent node
      const recency1 = 1 - (currentStep - (nodeCreationStep.get(node1.id) || 0)) / Math.max(currentStep, 1);
      const recency2 = 1 - (currentStep - (nodeCreationStep.get(node2.id) || 0)) / Math.max(currentStep, 1);
      const recency = Math.max(recency1, recency2);

      // Compute priority score
      const score =
        WEIGHTS.semantic * semanticDistance +
        WEIGHTS.novelty * novelty +
        WEIGHTS.degree * degreeSum +
        WEIGHTS.recency * recency;

      possibleEdges.push({
        source: node1.id,
        target: node2.id,
        score,
        semanticDistance,
        novelty,
        degreeSum,
        recency,
      });
    }
  }

  // Sort by score descending
  possibleEdges.sort((a, b) => b.score - a.score);

  return possibleEdges;
}

const SYSTEM_PROMPT = `You are the Grokipedia Knowledge Synthesizer. Generate comprehensive, encyclopedic articles that connect two parent articles with academic rigor.

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
[CRITICAL: Include AT LEAST 10 references with full URLs. Each reference must be a real, verifiable source. Format as numbered list with clickable URLs. Draw from academic papers, official documentation, news sources, and authoritative websites.]

## WRITING STYLE
- Academic rigor with specific data
- Encyclopedic neutrality
- 800-1200 words minimum
- Inline citations [1], [2], [3] for claims throughout the article
- MINIMUM 10 references required - this is non-negotiable
- Every factual claim must have a citation

---

## UNCERTAINTY PROTOCOL
If you CANNOT meet all synthesis constraints (causal atomicity, efficiency delta, impersonal/factual), you MUST output this JSON instead of an article:

{"node_type":"Uncertainty","reason_code":"CONTRADICTION|MISSING_DATA|ABSTRACTION_BREACH","null_hypothesis":"[the question/connection that failed]","required_data_type":"[what data would be needed]","analysis_summary":"[why the connection cannot be established]"}

Use CONTRADICTION when sources conflict, MISSING_DATA when information is unavailable, ABSTRACTION_BREACH when the connection is too vague or philosophical to establish causally.`;

async function generateConnection(node1: Node, node2: Node): Promise<Node | null> {
  const userPrompt = `Synthesize a new article connecting these two parent articles:

## PARENT ARTICLE A₁: ${node1.title}
${node1.content.slice(0, 2000)}

---

## PARENT ARTICLE A₂: ${node2.title}
${node2.content.slice(0, 2000)}

---

Generate an encyclopedic article that identifies the specific mechanism, technology, or causal link between these concepts. The title should be specific and descriptive.

If you cannot establish a clear causal connection with measurable outcomes, respond with the Uncertainty JSON format specified in your instructions.`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-3',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 6000,
        search_parameters: {
          mode: 'auto',
          max_search_results: 20,
          return_citations: true,
        },
      }),
    });

    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    // Detect Uncertainty Protocol (JSON response)
    let isUncertainty = false;
    let uncertaintyData: any = null;

    try {
      const parsed = JSON.parse(rawContent);
      if (parsed.node_type === 'Uncertainty') {
        isUncertainty = true;
        uncertaintyData = parsed;
      }
    } catch {
      // Not JSON - this is a successful synthesis
    }

    if (isUncertainty && uncertaintyData) {
      console.log(`⚠️ UNCERTAINTY: ${uncertaintyData.reason_code}`);
      console.log(`   Null hypothesis: ${uncertaintyData.null_hypothesis}`);

      // Create Uncertainty node with special formatting
      const uncertaintyContent = `# ⚠️ UNCERTAINTY NODE

**Reason Code:** ${uncertaintyData.reason_code || 'ABSTRACTION_BREACH'}

**Null Hypothesis:** ${uncertaintyData.null_hypothesis || 'Unable to determine specific causal connection.'}

**Required Data Type:** ${uncertaintyData.required_data_type || 'Additional source documentation needed.'}

**Analysis Summary:** ${uncertaintyData.analysis_summary || 'The connection between these topics requires more granular data.'}

---

*This node represents an unresolved connection between the parent articles. The Uncertainty Protocol was triggered because the synthesis constraints could not be satisfied.*`;

      return {
        id: `unc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: `⚠️ [UNCERTAINTY] ${node1.title} ↔ ${node2.title}`,
        content: uncertaintyContent,
        isUncertainty: true,
        reasonCode: uncertaintyData.reason_code,
      };
    }

    // Successful synthesis - extract title from first line
    const firstLine = rawContent.split('\n')[0].replace(/^#+\s*/, '').trim();
    const title = firstLine.slice(0, 100) || `${node1.title} ↔ ${node2.title}`;

    return {
      id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      content: rawContent,
    };
  } catch (error) {
    console.error('Generation error:', error);
    return null;
  }
}

async function runIteration(iterNum: number): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`ITERATION ${iterNum + 1}/20 (generating top ${EDGES_PER_ITERATION} edges)`);
  console.log(`${'='.repeat(60)}`);

  // Get all possible edges with scores
  const scoredEdges = getAllPossibleEdges();

  if (scoredEdges.length === 0) {
    console.log('No more edges to explore!');
    return;
  }

  // Show top candidates
  console.log(`\nTop ${Math.min(scoredEdges.length, 8)} edge candidates:`);
  scoredEdges.slice(0, 8).forEach((e, i) => {
    const n1 = nodes.find(n => n.id === e.source)?.title.slice(0, 30);
    const n2 = nodes.find(n => n.id === e.target)?.title.slice(0, 30);
    const selected = i < EDGES_PER_ITERATION ? '→' : ' ';
    console.log(`  ${selected} ${i + 1}. [P=${e.score.toFixed(3)}] "${n1}" ↔ "${n2}"`);
    console.log(`       S=${e.semanticDistance.toFixed(2)} N=${e.novelty} D=${e.degreeSum.toFixed(2)} R=${e.recency.toFixed(2)}`);
  });

  // Select top N edges
  const selectedEdges = scoredEdges.slice(0, Math.min(EDGES_PER_ITERATION, scoredEdges.length));
  const generatedNodes: Node[] = [];
  const allNewEdges: Edge[] = [];

  console.log(`\n🎯 Selected ${selectedEdges.length} edges for PARALLEL generation:`);

  // Mark all edges as explored upfront
  for (const selectedEdge of selectedEdges) {
    const edgeKey = [selectedEdge.source, selectedEdge.target].sort().join('--');
    exploredEdges.add(edgeKey);
  }

  // Prepare generation tasks
  const generationTasks = selectedEdges.map((selectedEdge, i) => {
    const node1 = nodes.find(n => n.id === selectedEdge.source)!;
    const node2 = nodes.find(n => n.id === selectedEdge.target)!;
    console.log(`  [${i + 1}] "${node1.title}" ↔ "${node2.title}"`);
    return { selectedEdge, node1, node2 };
  });

  // Run all generations in parallel
  console.log(`\n⏳ Generating ${generationTasks.length} syntheses in parallel...`);
  const results = await Promise.all(
    generationTasks.map(({ node1, node2 }) => generateConnection(node1, node2))
  );

  // Process results
  for (let i = 0; i < results.length; i++) {
    const generatedNode = results[i];
    const { selectedEdge, node1, node2 } = generationTasks[i];

    if (generatedNode) {
      const nodeType = generatedNode.isUncertainty ? '⚠️ UNCERTAINTY' : '✅ SUCCESS';
      console.log(`[${i + 1}] ${nodeType}: "${generatedNode.title.slice(0, 60)}..."`);

      // Add node
      nodes.push(generatedNode);
      generatedNodes.push(generatedNode);
      nodeCreationStep.set(generatedNode.id, iterNum + 1);

      // Track parent relationships (to avoid redundant synthesis later)
      nodeParents.set(generatedNode.id, new Set([selectedEdge.source, selectedEdge.target]));

      // Add edges to both parents
      const newEdges = [
        { source: selectedEdge.source, target: generatedNode.id },
        { source: selectedEdge.target, target: generatedNode.id },
      ];
      edges.push(...newEdges);
      allNewEdges.push(...newEdges);
    } else {
      console.log(`[${i + 1}] ❌ Generation failed for "${node1.title}" ↔ "${node2.title}"`);
    }
  }

  // Save step with all generated nodes from this iteration
  const step: SimulationStep = {
    step: iterNum + 1,
    nodes: JSON.parse(JSON.stringify(nodes)),
    edges: JSON.parse(JSON.stringify(edges)),
    scoredEdges: scoredEdges.slice(0, 10), // Top 10 for reference
    selectedEdge: selectedEdges[0] || null, // Primary selected edge for UI compatibility
    generatedNode: generatedNodes[0] || null, // Primary generated node for UI compatibility
    newEdges: allNewEdges,
    stats: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      generatedNodes: nodes.length - demoData.nodes.length,
    },
  };
  steps.push(step);

  // Save individual step file
  const stepPath = path.join(__dirname, '../src/data/simulation', `step-${String(iterNum + 1).padStart(2, '0')}.json`);
  fs.mkdirSync(path.dirname(stepPath), { recursive: true });
  fs.writeFileSync(stepPath, JSON.stringify(step, null, 2));
  console.log(`\n💾 Saved: ${stepPath}`);
  console.log(`   Generated ${generatedNodes.length} nodes (${generatedNodes.filter(n => n.isUncertainty).length} uncertainty)`);
}

async function main() {
  console.log('🚀 Starting Demo Simulation (20 iterations)');
  console.log(`📊 Initial state: ${nodes.length} nodes, ${edges.length} edges`);
  console.log(`⚖️ Weights: S=${WEIGHTS.semantic} N=${WEIGHTS.novelty} D=${WEIGHTS.degree} R=${WEIGHTS.recency}`);
  console.log(`🔢 Edges per iteration: ${EDGES_PER_ITERATION}`);
  console.log(`⚠️ Uncertainty Protocol: ENABLED`);

  // Save initial state as step 0
  const initialStep: SimulationStep = {
    step: 0,
    nodes: JSON.parse(JSON.stringify(nodes)),
    edges: JSON.parse(JSON.stringify(edges)),
    scoredEdges: getAllPossibleEdges().slice(0, 10),
    selectedEdge: null,
    generatedNode: null,
    newEdges: [],
    stats: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      generatedNodes: 0,
    },
  };

  const simDir = path.join(__dirname, '../src/data/simulation');
  fs.mkdirSync(simDir, { recursive: true });
  fs.writeFileSync(path.join(simDir, 'step-00.json'), JSON.stringify(initialStep, null, 2));
  steps.push(initialStep);

  // Run 20 iterations
  for (let i = 0; i < 20; i++) {
    await runIteration(i);

    // Rate limit
    if (i < 19) {
      console.log('⏸️ Waiting 2s...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Save complete simulation
  const completePath = path.join(simDir, 'simulation-complete.json');
  fs.writeFileSync(completePath, JSON.stringify({
    metadata: {
      totalSteps: steps.length,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      generatedNodes: nodes.length - demoData.nodes.length,
      weights: WEIGHTS,
      timestamp: new Date().toISOString(),
    },
    steps,
  }, null, 2));

  console.log(`\n${'='.repeat(60)}`);
  console.log('✨ SIMULATION COMPLETE');
  console.log(`${'='.repeat(60)}`);
  console.log(`Total nodes: ${nodes.length}`);
  console.log(`Total edges: ${edges.length}`);
  console.log(`Generated: ${nodes.length - demoData.nodes.length} new nodes`);
  console.log(`\nFiles saved to: ${simDir}`);
}

main().catch(console.error);
