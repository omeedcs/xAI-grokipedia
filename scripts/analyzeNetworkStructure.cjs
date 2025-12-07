// Network Structure Analysis
// Run with: node scripts/analyzeNetworkStructure.cjs

const fs = require('fs');
const path = require('path');

// Load the final simulation state
const simDir = path.join(__dirname, '../src/data/simulation');
const files = fs.readdirSync(simDir).filter(f => f.startsWith('step-')).sort();
const lastStepFile = files[files.length - 1];

if (!lastStepFile) {
  console.log('No simulation data found. Run the simulation first.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(path.join(simDir, lastStepFile), 'utf8'));
const { nodes, edges } = data;

console.log('═'.repeat(60));
console.log('NETWORK STRUCTURE ANALYSIS');
console.log('═'.repeat(60));
console.log(`\nStep: ${data.step}`);
console.log(`Nodes: ${nodes.length}`);
console.log(`Edges: ${edges.length}`);

// Build adjacency list
const adj = new Map();
nodes.forEach(n => adj.set(n.id, []));
edges.forEach(e => {
  adj.get(e.source)?.push(e.target);
  adj.get(e.target)?.push(e.source);
});

// Calculate degree distribution
const degrees = nodes.map(n => adj.get(n.id)?.length || 0);
const degreeCount = {};
degrees.forEach(d => {
  degreeCount[d] = (degreeCount[d] || 0) + 1;
});

console.log('\n─── DEGREE DISTRIBUTION ───');
const sortedDegrees = Object.keys(degreeCount).map(Number).sort((a, b) => a - b);
sortedDegrees.forEach(k => {
  const count = degreeCount[k];
  const bar = '█'.repeat(Math.min(count * 2, 40));
  console.log(`  k=${k}: ${bar} (${count} nodes, ${(count/nodes.length*100).toFixed(1)}%)`);
});

// Basic statistics
const meanDegree = degrees.reduce((a, b) => a + b, 0) / degrees.length;
const variance = degrees.reduce((sum, d) => sum + Math.pow(d - meanDegree, 2), 0) / degrees.length;
const stdDev = Math.sqrt(variance);
const maxDegree = Math.max(...degrees);
const minDegree = Math.min(...degrees);

console.log('\n─── DEGREE STATISTICS ───');
console.log(`  Mean degree ⟨k⟩: ${meanDegree.toFixed(2)}`);
console.log(`  Std deviation σ: ${stdDev.toFixed(2)}`);
console.log(`  Min degree: ${minDegree}`);
console.log(`  Max degree: ${maxDegree}`);
console.log(`  Degree range: ${maxDegree - minDegree}`);

// Identify hubs (top 3 by degree)
const nodesByDegree = nodes.map(n => ({
  id: n.id,
  title: n.title.slice(0, 40),
  degree: adj.get(n.id)?.length || 0,
  isSeed: n.id.startsWith('seed-')
})).sort((a, b) => b.degree - a.degree);

console.log('\n─── TOP HUBS ───');
nodesByDegree.slice(0, 5).forEach((n, i) => {
  const tag = n.isSeed ? '[SEED]' : '[GEN]';
  console.log(`  ${i + 1}. ${tag} k=${n.degree} "${n.title}..."`);
});

// Seed vs Generated comparison
const seedNodes = nodesByDegree.filter(n => n.isSeed);
const genNodes = nodesByDegree.filter(n => !n.isSeed);
const seedMeanDegree = seedNodes.reduce((a, b) => a + b.degree, 0) / seedNodes.length;
const genMeanDegree = genNodes.length > 0 ? genNodes.reduce((a, b) => a + b.degree, 0) / genNodes.length : 0;

console.log('\n─── SEED vs GENERATED ───');
console.log(`  Seed nodes: ${seedNodes.length}, mean degree: ${seedMeanDegree.toFixed(2)}`);
console.log(`  Generated nodes: ${genNodes.length}, mean degree: ${genMeanDegree.toFixed(2)}`);

// Check for power-law fit (log-log linearity)
console.log('\n─── POWER-LAW CHECK ───');
const logLogData = sortedDegrees.filter(k => k > 0).map(k => ({
  logK: Math.log(k),
  logP: Math.log(degreeCount[k] / nodes.length)
}));

if (logLogData.length >= 3) {
  // Simple linear regression on log-log
  const n = logLogData.length;
  const sumX = logLogData.reduce((a, b) => a + b.logK, 0);
  const sumY = logLogData.reduce((a, b) => a + b.logP, 0);
  const sumXY = logLogData.reduce((a, b) => a + b.logK * b.logP, 0);
  const sumX2 = logLogData.reduce((a, b) => a + b.logK * b.logK, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R² calculation
  const yMean = sumY / n;
  const ssTotal = logLogData.reduce((a, b) => a + Math.pow(b.logP - yMean, 2), 0);
  const ssResidual = logLogData.reduce((a, b) => {
    const predicted = slope * b.logK + intercept;
    return a + Math.pow(b.logP - predicted, 2);
  }, 0);
  const r2 = 1 - ssResidual / ssTotal;

  console.log(`  Log-log slope (γ estimate): ${(-slope).toFixed(2)}`);
  console.log(`  R² fit: ${r2.toFixed(3)}`);

  if (r2 > 0.8 && -slope > 1.5 && -slope < 4) {
    console.log(`  → Likely POWER-LAW with γ ≈ ${(-slope).toFixed(1)}`);
  } else if (r2 > 0.5) {
    console.log(`  → Possibly heavy-tailed but NOT strict power-law`);
  } else {
    console.log(`  → NOT power-law (poor log-log fit)`);
  }
}

// Clustering coefficient (local)
console.log('\n─── CLUSTERING COEFFICIENT ───');
let totalClustering = 0;
let countable = 0;

nodes.forEach(n => {
  const neighbors = adj.get(n.id) || [];
  const k = neighbors.length;
  if (k < 2) return; // Need at least 2 neighbors for triangles

  // Count edges between neighbors
  let triangles = 0;
  for (let i = 0; i < neighbors.length; i++) {
    for (let j = i + 1; j < neighbors.length; j++) {
      const n1Neighbors = adj.get(neighbors[i]) || [];
      if (n1Neighbors.includes(neighbors[j])) {
        triangles++;
      }
    }
  }

  const maxTriangles = (k * (k - 1)) / 2;
  const localC = triangles / maxTriangles;
  totalClustering += localC;
  countable++;
});

const avgClustering = countable > 0 ? totalClustering / countable : 0;
console.log(`  Average clustering coefficient: ${avgClustering.toFixed(4)}`);
if (avgClustering < 0.1) {
  console.log(`  → LOW clustering (tree-like structure)`);
} else if (avgClustering < 0.3) {
  console.log(`  → MODERATE clustering`);
} else {
  console.log(`  → HIGH clustering (community structure)`);
}

// Network density
const maxEdges = (nodes.length * (nodes.length - 1)) / 2;
const density = edges.length / maxEdges;
console.log('\n─── NETWORK DENSITY ───');
console.log(`  Density: ${density.toFixed(4)} (${(density * 100).toFixed(2)}%)`);
console.log(`  Edges: ${edges.length} / ${maxEdges} possible`);

// Assortativity (degree correlation)
console.log('\n─── ASSORTATIVITY ───');
let sumProduct = 0;
let sumDegree = 0;
let sumDegree2 = 0;
let edgeCount = 0;

edges.forEach(e => {
  const d1 = adj.get(e.source)?.length || 0;
  const d2 = adj.get(e.target)?.length || 0;
  sumProduct += d1 * d2;
  sumDegree += d1 + d2;
  sumDegree2 += d1 * d1 + d2 * d2;
  edgeCount++;
});

const M = edgeCount;
const term1 = sumProduct / M;
const term2 = Math.pow(sumDegree / (2 * M), 2);
const term3 = sumDegree2 / (2 * M);
const assortativity = (term1 - term2) / (term3 - term2);

console.log(`  Assortativity coefficient: ${assortativity.toFixed(4)}`);
if (assortativity < -0.1) {
  console.log(`  → DISASSORTATIVE (hubs connect to low-degree nodes)`);
} else if (assortativity > 0.1) {
  console.log(`  → ASSORTATIVE (hubs connect to hubs)`);
} else {
  console.log(`  → NEUTRAL mixing`);
}

console.log('\n' + '═'.repeat(60));
console.log('SUMMARY');
console.log('═'.repeat(60));
console.log(`
Network Type: ${assortativity < -0.1 ? 'Disassortative' : 'Mixed'} ${avgClustering < 0.1 ? 'tree-like' : 'clustered'} graph
- NOT a random Erdős-Rényi network (structured edge selection)
- ${seedMeanDegree > genMeanDegree * 1.5 ? 'Seed nodes act as HUBS' : 'Hub distribution is distributed'}
- Clustering is ${avgClustering < 0.1 ? 'LOW (no triangle-closing mechanism)' : 'present'}
`);
