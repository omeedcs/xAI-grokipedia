const fs = require('fs');
const dataFile = process.argv[2] || 'src/data/smallpoxPOCData.json';
console.log(`Analyzing: ${dataFile}\n`);
const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// Extract key phrases/metrics that repeat - auto-detect from content
const allContent = data.nodes.map(n => n.content).join(' ');

// Domain-specific phrases based on file
const keyPhrases = dataFile.includes('smallpox') ? [
  '36,000-dose',
  '750,000',
  '6.25%',
  '54,777',
  '10-15 million',
  'Foege',
  'Henderson',
  'Merca',
  'Ogoja',
  'December 1966',
  'October 1977',
  '99.9%',
  'ring vaccination',
  'surveillance-containment',
  'variola',
  '2 million deaths',
  'Ali Maow Maalin'
] : [
  'McLean',
  'ISO 668',
  'TEU',
  'break-bulk',
  'containerization',
  'Ideal X',
  'Pan-Atlantic',
  '20-foot',
  '40-foot',
  '60-75%',
  'labor costs',
  'intermodal',
  '1956',
  '1968',
  'longshoremen',
  'Sea-Land',
  'twist-lock',
  'port turnaround',
  '120 hours',
  'standardization'
];

console.log('=== KEY PHRASE FREQUENCY ACROSS ALL ARTICLES ===\n');

const phraseCount = {};
keyPhrases.forEach(phrase => {
  let count = 0;
  data.nodes.forEach(node => {
    const matches = (node.content.match(new RegExp(phrase, 'gi')) || []).length;
    count += matches;
  });
  phraseCount[phrase] = count;
});

Object.entries(phraseCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([phrase, count]) => {
    console.log(`${phrase}: ${count} occurrences`);
  });

// Check title similarity
console.log('\n=== TITLE SIMILARITY ANALYSIS ===\n');

const titles = data.nodes.map(n => n.title);
const titleWords = {};

titles.forEach(title => {
  const words = title.toLowerCase().split(/[\s\-:,]+/).filter(w => w.length > 4);
  words.forEach(word => {
    titleWords[word] = (titleWords[word] || 0) + 1;
  });
});

console.log('Most repeated words in titles:');
Object.entries(titleWords)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([word, count]) => {
    console.log(`  "${word}": ${count} titles`);
  });

// Check for near-duplicate titles
console.log('\n=== NEAR-DUPLICATE TITLES ===\n');
const seenPatterns = {};
titles.forEach((title, i) => {
  // Normalize
  const norm = title.toLowerCase()
    .replace(/[0-9,.\-:]+/g, 'NUM')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
  if (seenPatterns[norm]) {
    seenPatterns[norm].push(i);
  } else {
    seenPatterns[norm] = [i];
  }
});

let duplicateGroups = 0;
Object.entries(seenPatterns).forEach(([pattern, indices]) => {
  if (indices.length > 1) {
    duplicateGroups++;
    if (duplicateGroups <= 5) {
      console.log(`Pattern: "${pattern}"`);
      indices.forEach(i => console.log(`  - ${titles[i].slice(0, 80)}`));
      console.log('');
    }
  }
});
console.log(`Total near-duplicate groups: ${duplicateGroups}`);

// Content overlap - check first 500 chars
console.log('\n=== CONTENT STRUCTURE SIMILARITY ===\n');
const contentStarts = data.nodes.slice(5).map(n => {
  return n.content.slice(0, 300).replace(/[0-9,]+/g, 'N');
});

let structurallySimilar = 0;
for (let i = 0; i < contentStarts.length; i++) {
  for (let j = i + 1; j < contentStarts.length; j++) {
    // Simple word overlap
    const words1 = new Set(contentStarts[i].split(/\s+/));
    const words2 = new Set(contentStarts[j].split(/\s+/));
    const intersection = [...words1].filter(w => words2.has(w)).length;
    const union = new Set([...words1, ...words2]).size;
    const jaccard = intersection / union;
    if (jaccard > 0.6) {
      structurallySimilar++;
    }
  }
}
console.log(`Article pairs with >60% word overlap in first 300 chars: ${structurallySimilar}`);
console.log(`Total possible pairs: ${(contentStarts.length * (contentStarts.length - 1)) / 2}`);

// Unique section headers
console.log('\n=== SECTION HEADER DIVERSITY ===\n');
const allHeaders = [];
data.nodes.slice(5).forEach(node => {
  const headers = node.content.match(/^## .+$/gm) || [];
  headers.forEach(h => allHeaders.push(h.replace(/^## /, '')));
});

const headerCounts = {};
allHeaders.forEach(h => {
  const norm = h.toLowerCase().replace(/[0-9,.\-:$]+/g, 'N').trim();
  headerCounts[norm] = (headerCounts[norm] || 0) + 1;
});

console.log('Most repeated section headers (normalized):');
Object.entries(headerCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([header, count]) => {
    console.log(`  (${count}x) "${header.slice(0, 70)}"`);
  });

console.log(`\nTotal headers: ${allHeaders.length}`);
console.log(`Unique patterns: ${Object.keys(headerCounts).length}`);
