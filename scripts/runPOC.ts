// POC Runner - 20 iterations of generation cycle
// Run with: npx tsx scripts/runPOC.ts

const API_URL = 'https://api.x.ai/v1/chat/completions';
const API_KEY = process.env.VITE_XAI_API_KEY || '';

if (!API_KEY) {
  console.error('❌ VITE_XAI_API_KEY not set. Set it in your environment.');
  process.exit(1);
}

// Seed articles for ISO 668 POC
const seedArticles = [
  {
    id: 'seed-1',
    title: 'Concept of Intermodalism',
    content: `Intermodalism refers to the use of multiple modes of transportation (ship, rail, truck) in a single, seamless journey for cargo. The key innovation is that goods remain in the same container throughout, eliminating the need to unload and reload at each transfer point. This concept revolutionized global trade by dramatically reducing handling costs, transit times, and cargo damage.`,
  },
  {
    id: 'seed-2',
    title: "Malcolm McLean's Acquisition of Pan-Atlantic Steamship (1955)",
    content: `In 1955, trucking magnate Malcolm McLean purchased the Pan-Atlantic Steamship Company. This acquisition was strategic: McLean envisioned converting ships to carry truck trailers directly, eliminating the costly break-bulk process. His first converted tanker, the Ideal X, sailed from Newark to Houston on April 26, 1956, carrying 58 trailer containers. This voyage is considered the birth of modern container shipping.`,
  },
  {
    id: 'seed-3',
    title: 'Inefficient Status Quo: Break-Bulk Shipping (1950)',
    content: `Before containerization, cargo was loaded piece-by-piece (break-bulk). A typical ship required 100+ longshoremen working 5-7 days to load/unload. Labor costs consumed 60-75% of total shipping expenses. Cargo theft (pilferage) was rampant, and damage rates exceeded 10%. Ships spent more time in port than at sea, making ocean transport slow and expensive.`,
  },
  {
    id: 'seed-4',
    title: 'Necessity of a Standard Container Dimension',
    content: `Early container shipping faced chaos: each company used different container sizes. McLean's containers were 35 feet; Matson used 24 feet; others varied wildly. This incompatibility prevented true intermodalism—a container that fit one ship might not fit another's crane, or a railroad's flatcar. Industry leaders recognized that without standardization, containerization would remain fragmented and inefficient.`,
  },
  {
    id: 'seed-5',
    title: 'Establishment of ISO 668 (1968)',
    content: `ISO 668, published in 1968, established the global standard for container dimensions. It defined the 20-foot container (TEU) and 40-foot container (FEU) as standard units. Key specifications: external width of 8 feet, heights of 8'6" or 9'6", and corner castings at precise locations for universal crane compatibility. This standard enabled any container to be loaded onto any compliant ship, train, or truck worldwide.`,
  },
];

interface Node {
  id: string;
  title: string;
  content: string;
}

interface Edge {
  source: string;
  target: string;
}

// Track state
let nodes: Node[] = [...seedArticles];
let edges: Edge[] = [];
let totalGenerated = 0;
let totalUncertainty = 0;
let totalErrors = 0;

const SYSTEM_PROMPT = `You are the Grokipedia Knowledge Synthesizer. Generate a concise article connecting two parent articles.

CONSTRAINTS:
1. Causal Atomicity: Describe the smallest verifiable mechanism connecting A₁ to A₂
2. Utilitarian Focus: Detail the specific, non-subjective process (cause → effect)
3. Efficiency Delta: Include measurable change (cost, time, energy, safety)
4. Impersonal/Factual: No opinions, emotions, or speculation

OUTPUT FORMAT (if constraints met):

# [Descriptive Title]

**Causal Link**: [One sentence describing A₁ → A₂ connection]

## Mechanism
[2-3 paragraphs explaining the specific causal process]

## Efficiency Delta
- **Metric**: [Specific measurable change]
- **Before**: [Quantified state before]
- **After**: [Quantified state after]

## Key Facts
- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3]

---

If you CANNOT meet all constraints, output this JSON instead:
{"node_type":"Uncertainty","reason_code":"CONTRADICTION|MISSING_DATA|ABSTRACTION_BREACH","null_hypothesis":"[question that failed]","required_data_type":"[data needed]","analysis_summary":"[why connection failed]"}`;

// Generate synthesis between two nodes
async function synthesize(nodeA: Node, nodeB: Node): Promise<{ success: boolean; node?: Node; isUncertainty?: boolean }> {
  const contentA = nodeA.content.slice(0, 1500);
  const contentB = nodeB.content.slice(0, 1500);

  const prompt = `**A₁**: ${nodeA.title}
${contentA}

**A₂**: ${nodeB.title}
${contentB}

Generate a concise synthesis article connecting A₁ → A₂. Use the format specified.`;

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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        search_parameters: { mode: 'auto', max_search_results: 5 },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Check if uncertainty
    try {
      const parsed = JSON.parse(content);
      if (parsed.node_type === 'Uncertainty') {
        return {
          success: true,
          isUncertainty: true,
          node: {
            id: `uncertainty-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title: `⚠️ [UNCERTAINTY] ${nodeA.title} ↔ ${nodeB.title}`,
            content: `Reason: ${parsed.reason_code}\n${parsed.analysis_summary}`,
          }
        };
      }
    } catch {
      // Not JSON - successful synthesis
    }

    // Extract title from content
    const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').slice(0, 100);

    return {
      success: true,
      isUncertainty: false,
      node: {
        id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: firstLine || `Synthesis: ${nodeA.title} + ${nodeB.title}`,
        content,
      }
    };
  } catch (error) {
    return { success: false };
  }
}

// Priority weights
const ALPHA = 0.5;  // Causal Distance weight (higher = prefer distant concepts)
const BETA = 0.3;   // Integrity Score weight (higher = prefer high-quality nodes)
const GAMMA = 0.2;  // Diversity weight (prefer less-connected nodes)

// Node integrity scores (seed = 1.0, generated = 0.7, uncertainty = 0.0)
function getIntegrityScore(nodeId: string): number {
  if (nodeId.startsWith('seed-')) return 1.0;
  if (nodeId.startsWith('uncertainty-')) return 0.0; // Uncertainty nodes are LOW priority
  if (nodeId.startsWith('node-')) return 0.7; // Successfully generated nodes
  return 0.5;
}

// Count how many edges a node is involved in (for diversity)
function getNodeDegree(nodeId: string): number {
  return edges.filter(e => e.source === nodeId || e.target === nodeId).length;
}

// Calculate priority score for an edge
// Prefer: high causal distance, high integrity nodes, low-degree nodes
function calculatePriority(sourceId: string, targetId: string, causalDistance: number): number {
  // Normalize causal distance (1-10 scale to 0-1)
  const D_C = causalDistance / 10;

  // Average integrity of both nodes (prefer connecting good nodes)
  const avgIntegrity = (getIntegrityScore(sourceId) + getIntegrityScore(targetId)) / 2;

  // Diversity: prefer nodes with fewer connections (inverse of degree)
  const maxDegree = Math.max(10, edges.length / nodes.length * 2);
  const avgDegree = (getNodeDegree(sourceId) + getNodeDegree(targetId)) / 2;
  const diversity = 1 - (avgDegree / maxDegree);

  // Priority formula: prefer distant, high-quality, under-connected nodes
  const P = ALPHA * D_C + BETA * avgIntegrity + GAMMA * diversity;

  return P;
}

// Estimate causal distance based on node types
function estimateCausalDistance(sourceId: string, targetId: string): number {
  // Seeds to seeds = high distance (original unconnected concepts)
  if (sourceId.startsWith('seed-') && targetId.startsWith('seed-')) return 8;

  // Seed to generated = medium-high (bridging)
  if ((sourceId.startsWith('seed-') && targetId.startsWith('node-')) ||
      (targetId.startsWith('seed-') && sourceId.startsWith('node-'))) return 6;

  // Generated to generated = medium (synthesizing syntheses)
  if (sourceId.startsWith('node-') && targetId.startsWith('node-')) return 5;

  // Anything with uncertainty = low (not useful)
  if (sourceId.startsWith('uncertainty-') || targetId.startsWith('uncertainty-')) return 2;

  return 5;
}

interface ScoredEdge {
  sourceId: string;
  targetId: string;
  priority: number;
}

// Get all unpressed edges with priority scores, sorted by P descending
function getUnpressedEdges(): ScoredEdge[] {
  const pressed = new Set(edges.map(e => [e.source, e.target].sort().join('-')));
  const unpressed: ScoredEdge[] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const sourceId = nodes[i].id;
      const targetId = nodes[j].id;

      // SKIP: Don't involve uncertainty nodes at all (they just create more uncertainty)
      if (sourceId.startsWith('uncertainty-') || targetId.startsWith('uncertainty-')) {
        continue;
      }

      const key = [sourceId, targetId].sort().join('-');
      if (!pressed.has(key)) {
        const causalDistance = estimateCausalDistance(sourceId, targetId);
        const priority = calculatePriority(sourceId, targetId, causalDistance);

        unpressed.push({ sourceId, targetId, priority });
      }
    }
  }

  // Sort by priority descending (highest P first)
  unpressed.sort((a, b) => b.priority - a.priority);

  return unpressed;
}

// Main POC runner
async function runPOC() {
  console.log('🚀 GROKIPEDIA POC - 20 ITERATIONS');
  console.log('='.repeat(60));
  console.log(`Starting with ${nodes.length} seed articles\n`);

  const startTime = Date.now();
  const BATCH_SIZE = 10; // Parallel requests per iteration

  for (let iteration = 1; iteration <= 10; iteration++) {
    console.log(`\n📍 ITERATION ${iteration}/10`);
    console.log(`   Nodes: ${nodes.length} | Edges: ${edges.length}`);

    const unpressed = getUnpressedEdges();
    console.log(`   Unpressed edges: ${unpressed.length}`);

    if (unpressed.length === 0) {
      console.log('   ⚠️ No more edges to generate - stopping');
      break;
    }

    // Select batch (top N by priority score)
    const batch = unpressed.slice(0, BATCH_SIZE);
    console.log(`   Batch size: ${batch.length} (top P scores: ${batch.slice(0, 3).map(e => e.priority.toFixed(3)).join(', ')}...)`);

    // Execute in parallel
    const promises = batch.map(async ({ sourceId, targetId, priority }) => {
      console.log(`   🎯 P=${priority.toFixed(3)}: ${nodes.find(n => n.id === sourceId)?.title.slice(0, 20)} ↔ ${nodes.find(n => n.id === targetId)?.title.slice(0, 20)}`);

      const nodeA = nodes.find(n => n.id === sourceId)!;
      const nodeB = nodes.find(n => n.id === targetId)!;

      const result = await synthesize(nodeA, nodeB);

      if (result.success && result.node) {
        // Add new node
        nodes.push(result.node);

        // Mark edge as pressed
        edges.push({ source: sourceId, target: targetId });

        if (result.isUncertainty) {
          totalUncertainty++;
          console.log(`   ⚠️ ${nodeA.title.slice(0, 25)} ↔ ${nodeB.title.slice(0, 25)} → UNCERTAINTY`);
        } else {
          totalGenerated++;
          console.log(`   ✅ ${nodeA.title.slice(0, 25)} ↔ ${nodeB.title.slice(0, 25)} → ${result.node.title.slice(0, 40)}`);
        }
      } else {
        totalErrors++;
        console.log(`   ❌ ${nodeA.title.slice(0, 25)} ↔ ${nodeB.title.slice(0, 25)} → ERROR`);
      }

      return result;
    });

    await Promise.all(promises);

    console.log(`   Iteration complete: ${nodes.length} total nodes`);
  }

  const duration = (Date.now() - startTime) / 1000;

  console.log('\n' + '='.repeat(60));
  console.log('🏁 POC COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total nodes: ${nodes.length}`);
  console.log(`Generated: ${totalGenerated}`);
  console.log(`Uncertainty: ${totalUncertainty}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`Duration: ${duration.toFixed(1)}s`);
  console.log('\n📊 FINAL GRAPH:');
  nodes.forEach(n => console.log(`   - ${n.title.slice(0, 70)}`));

  // Save to file for UI import
  const fs = await import('fs');
  const outputPath = './src/data/pocGeneratedData.json';
  fs.writeFileSync(outputPath, JSON.stringify({ nodes, edges }, null, 2));
  console.log(`\n📁 Saved to ${outputPath}`);
}

runPOC().catch(console.error);
