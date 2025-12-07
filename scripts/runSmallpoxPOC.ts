// POC Runner - WHO Smallpox Eradication Program (1967-1980)
// Run with: npx tsx scripts/runSmallpoxPOC.ts

const API_URL = 'https://api.x.ai/v1/chat/completions';
const API_KEY = process.env.VITE_XAI_API_KEY || '';

if (!API_KEY) {
  console.error('❌ VITE_XAI_API_KEY not set. Set it in your environment.');
  process.exit(1);
}

// Seed articles for WHO Smallpox Eradication POC
const seedArticles = [
  {
    id: 'seed-1',
    title: 'The Global Burden of Smallpox (Pre-1967)',
    content: `By 1967, smallpox (variola major and variola minor) remained endemic in 31 countries across Africa, Asia, and South America. The disease caused 10-15 million cases annually, with approximately 2 million deaths per year—a 20-30% case fatality rate for variola major. Survivors often suffered permanent disfigurement (facial scarring in 65-80% of cases) and blindness (1% of survivors). The economic burden exceeded $1.35 billion annually in endemic countries through healthcare costs, lost productivity, and trade restrictions. Despite Edward Jenner's 1796 vaccination discovery, 171 years later the virus persisted due to inadequate vaccine distribution, cold chain failures, and the impossibility of reaching remote populations.`,
  },
  {
    id: 'seed-2',
    title: 'The Failure of Mass Vaccination (1959-1966)',
    content: `In 1959, the World Health Assembly passed Resolution WHA11.54 calling for global smallpox eradication through mass vaccination. The strategy required achieving 80% population immunity—the estimated herd immunity threshold. However, by 1966, the program had largely failed. Key obstacles included: (1) Cold chain logistics: the freeze-dried vaccine required -20°C storage, impossible in tropical regions lacking refrigeration; (2) Vaccine potency loss: 50% of doses lost effectiveness before administration; (3) Coverage gaps: mass campaigns reached only 40-60% in rural Africa and South Asia; (4) Jet injector failures: the Ped-O-Jet devices contaminated 1 in 50,000 doses and required maintenance unavailable in field conditions. Annual global cases remained at 10-15 million, virtually unchanged from 1959 levels. The WHO budget allocation of $2.4 million proved insufficient, and donor nations questioned continued investment.`,
  },
  {
    id: 'seed-3',
    title: 'The Strategic Pivot to Surveillance-Containment (1967)',
    content: `In January 1967, D.A. Henderson was appointed to lead the WHO Smallpox Eradication Unit, initiating a fundamental strategic shift. The pivot was catalyzed by William Foege's December 1966 discovery in Ogoja, Nigeria: facing a vaccine shortage that limited coverage to 750,000 doses for 12 million people (6.25%), Foege deployed surveillance teams to identify active cases, then vaccinated only the contacts and geographic neighbors within a defined radius. This "ring vaccination" approach contained the outbreak using 10% of the vaccine originally deemed necessary. Henderson formalized this into the surveillance-containment strategy: (1) Active case detection via 24-hour reporting networks; (2) Rapid response teams deployed within 48 hours of notification; (3) Targeted vaccination of contacts and contacts-of-contacts; (4) House-by-house search in a 1-mile radius. The strategy reduced required coverage from 80% to approximately 50% in endemic areas, making eradication feasible within existing budgets.`,
  },
  {
    id: 'seed-4',
    title: 'The Ring Vaccination Protocol',
    content: `Ring vaccination exploited smallpox's unique epidemiological characteristics: a 7-17 day incubation period (average 12 days), transmission only after visible symptoms (rash onset), and vaccine-induced immunity within 4 days post-exposure. The protocol operated in concentric layers: Ring 1 (household contacts, 100% vaccination within 24 hours); Ring 2 (neighbors within 1/4 mile, vaccination within 48 hours); Ring 3 (village/community level, vaccination within 72 hours). Success metrics required: (a) case identification within 48 hours of rash onset; (b) containment team arrival within 24 hours of notification; (c) Ring 1 completion before the index case became maximally infectious (day 3-4 of rash). When executed within the 4-day window, ring vaccination achieved 99.9% containment—only 1 in 1,000 contacts developed secondary infections. The protocol reduced cost-per-case-prevented from $250 (mass vaccination) to $15 (ring vaccination), enabling the stretched WHO budget to cover all endemic regions.`,
  },
  {
    id: 'seed-5',
    title: 'The Last Natural Case and Global Certification (1977-1980)',
    content: `On October 26, 1977, Ali Maow Maalin, a 23-year-old hospital cook in Merca, Somalia, developed the world's last natural case of smallpox (variola minor). He had guided two infected patients to an isolation camp and, despite working in healthcare, had never been vaccinated. The Merca containment response deployed within 14 hours: 54,777 people were vaccinated in the surrounding region over 2 weeks, creating a vaccination barrier that prevented further transmission. Maalin recovered and later became a polio vaccination advocate. Following WHO protocol, a two-year surveillance period confirmed no new cases. On May 8, 1980, the 33rd World Health Assembly formally declared smallpox eradicated—the first (and still only) human disease deliberately eliminated. The total program cost was $298 million over 13 years, yielding estimated savings of $1-2 billion annually in vaccination costs, treatment, and productivity losses. The eradication represented a return on investment exceeding 450:1 within the first decade.`,
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

const SYSTEM_PROMPT = `You are the Grokipedia Knowledge Synthesizer. Generate comprehensive, encyclopedic articles connecting two parent concepts.

## CORE REQUIREMENTS
1. **Causal Atomicity**: Identify the specific mechanism connecting A₁ to A₂
2. **Efficiency Delta**: Include measurable changes (cost, time, energy, safety)
3. **Encyclopedic Neutrality**: No opinions or speculation—facts only

## CITATIONS (MANDATORY)
- Use inline citations [1], [2], [3] for ALL quantitative claims and historical facts
- End with ## References listing all sources
- Format: [n] Author. "Title." Publication, Year.

## ARTICLE STRUCTURE

# [Specific Title Describing the Connection]

[LEAD: 2-3 paragraphs summarizing the connection, its significance, key figures, and outcomes. Include citations.]

[BODY: 5-8 sections covering the topic comprehensively]

## References
[List all citations]

---

## CRITICAL: DYNAMIC SECTION HEADERS

DO NOT use generic headers. Every section header must be SPECIFIC and DESCRIPTIVE of its content.

BAD (generic) → GOOD (specific):
- "Background" → "10-15 Million Annual Cases: The 1967 Endemic Baseline"
- "Mechanism" → "Foege's 6.25% Coverage Discovery in Ogoja, Nigeria"
- "Impact" → "From $250 to $15 Per Case: The Ring Vaccination Cost Revolution"
- "Challenges" → "Cold Chain Collapse: 50% Vaccine Potency Loss in Tropical Regions"
- "Development" → "December 1966: The Vaccine Shortage That Forced Innovation"
- "Current Status" → "May 8, 1980: The 33rd World Health Assembly Declaration"

Your headers should:
- Include specific dates, numbers, or names when relevant
- Tell the reader exactly what the section covers
- Be unique to this specific article's content
- Read like newspaper headlines, not generic labels

## CONTENT REQUIREMENTS
- 1500+ words
- 15+ inline citations [n]
- 5-8 uniquely-titled sections
- 1+ data table with Source column
- Timeline of key events where relevant

---

If you CANNOT establish a verifiable causal connection, output JSON:
{"node_type":"Uncertainty","reason_code":"CONTRADICTION|MISSING_DATA|ABSTRACTION_BREACH","null_hypothesis":"[question]","required_data_type":"[data needed]","analysis_summary":"[why it failed]"}`;

// Generate synthesis between two nodes
async function synthesize(nodeA: Node, nodeB: Node): Promise<{ success: boolean; node?: Node; isUncertainty?: boolean }> {
  const contentA = nodeA.content.slice(0, 3000);
  const contentB = nodeB.content.slice(0, 3000);

  const prompt = `## PARENT ARTICLE A₁: ${nodeA.title}

${contentA}

---

## PARENT ARTICLE A₂: ${nodeB.title}

${contentB}

---

## YOUR TASK

Write a comprehensive Grokipedia article that synthesizes the connection between A₁ and A₂.

**Requirements:**
1. Identify the specific causal mechanism linking these two topics
2. Create a detailed, encyclopedic article following the exact structure specified
3. Include quantitative data, tables, and specific metrics
4. Write at least 1500 words with 6+ major sections
5. Maintain academic tone with encyclopedic neutrality

If you cannot establish a clear, verifiable causal connection with measurable outcomes, respond with the Uncertainty JSON instead.`;

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
        search_parameters: { mode: 'auto', max_search_results: 10, return_citations: true },
        temperature: 0.4,
        max_tokens: 8000,
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
  if (nodeId.startsWith('uncertainty-')) return 0.0;
  if (nodeId.startsWith('node-')) return 0.7;
  return 0.5;
}

// Count how many edges a node is involved in (for diversity)
function getNodeDegree(nodeId: string): number {
  return edges.filter(e => e.source === nodeId || e.target === nodeId).length;
}

// Calculate priority score for an edge
function calculatePriority(sourceId: string, targetId: string, causalDistance: number): number {
  const D_C = causalDistance / 10;
  const avgIntegrity = (getIntegrityScore(sourceId) + getIntegrityScore(targetId)) / 2;
  const maxDegree = Math.max(10, edges.length / nodes.length * 2);
  const avgDegree = (getNodeDegree(sourceId) + getNodeDegree(targetId)) / 2;
  const diversity = 1 - (avgDegree / maxDegree);
  const P = ALPHA * D_C + BETA * avgIntegrity + GAMMA * diversity;
  return P;
}

// Estimate causal distance based on node types
function estimateCausalDistance(sourceId: string, targetId: string): number {
  if (sourceId.startsWith('seed-') && targetId.startsWith('seed-')) return 8;
  if ((sourceId.startsWith('seed-') && targetId.startsWith('node-')) ||
      (targetId.startsWith('seed-') && sourceId.startsWith('node-'))) return 6;
  if (sourceId.startsWith('node-') && targetId.startsWith('node-')) return 5;
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

      // SKIP: Don't involve uncertainty nodes
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

  unpressed.sort((a, b) => b.priority - a.priority);
  return unpressed;
}

// Main POC runner - 10 iterations
async function runPOC() {
  console.log('🦠 GROKIPEDIA POC - WHO SMALLPOX ERADICATION (1967-1980)');
  console.log('='.repeat(70));
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
      const nodeA = nodes.find(n => n.id === sourceId)!;
      const nodeB = nodes.find(n => n.id === targetId)!;

      console.log(`   🎯 P=${priority.toFixed(3)}: ${nodeA.title.slice(0, 25)} ↔ ${nodeB.title.slice(0, 25)}`);

      const result = await synthesize(nodeA, nodeB);

      if (result.success && result.node) {
        nodes.push(result.node);
        edges.push({ source: sourceId, target: targetId });
        edges.push({ source: sourceId, target: result.node.id });
        edges.push({ source: targetId, target: result.node.id });

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

  console.log('\n' + '═'.repeat(70));
  console.log('🏁 POC COMPLETE - WHO SMALLPOX ERADICATION');
  console.log('═'.repeat(70));
  console.log(`Total nodes: ${nodes.length}`);
  console.log(`Generated: ${totalGenerated}`);
  console.log(`Uncertainty: ${totalUncertainty}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`Duration: ${duration.toFixed(1)}s`);
  console.log('\n📊 FINAL GRAPH:');
  nodes.forEach(n => console.log(`   - ${n.title.slice(0, 80)}`));

  // Save to file for UI import
  const fs = await import('fs');
  const outputPath = './src/data/smallpoxPOCData.json';
  fs.writeFileSync(outputPath, JSON.stringify({ nodes, edges }, null, 2));
  console.log(`\n📁 Saved to ${outputPath}`);
}

runPOC().catch(console.error);
