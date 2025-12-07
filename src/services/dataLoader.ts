export interface TopicNode {
  id: string;
  label: string;
  slug: string;
  content: string; // MD content
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface PreGeneratedGraph {
  version: string;
  generatedAt: string;
  stats: {
    totalNodes: number;
    totalEdges: number;
    initialNodes: number;
    generatedNodes: number;
  };
  nodes: Record<string, { id: string; title: string; content: string }>;
  edges: GraphEdge[];
}

// Import all JSON files and MD files from data folder
const jsonModules = import.meta.glob('/data/*.json', { eager: true });
const mdModules = import.meta.glob('/data/*.md', { eager: true, query: '?raw', import: 'default' });

export function loadTopics(): TopicNode[] {
  const nodes: TopicNode[] = [];

  Object.entries(jsonModules).forEach(([path, module]) => {
    const data = module as { default?: any } | any;
    const topic = 'default' in data ? data.default : data;
    
    if (!topic.slug || !topic.title) return;

    // Get corresponding MD content
    const mdPath = path.replace('.json', '.md');
    const mdContent = (mdModules[mdPath] as string) || topic.content || '';

    nodes.push({
      id: topic.slug,
      label: topic.title,
      slug: topic.slug,
      content: mdContent,
    });
  });

  console.log(`Loaded ${nodes.length} topics`);
  return nodes;
}

export function getTopicContent(slug: string, topics: TopicNode[]): string {
  const topic = topics.find(t => t.id === slug);
  return topic?.content || '';
}

// Load the pre-generated graph from the public folder
export async function loadPreGeneratedGraph(): Promise<{
  nodes: TopicNode[];
  edges: GraphEdge[];
} | null> {
  try {
    const response = await fetch('/generated-graph.json');
    if (!response.ok) {
      console.warn('Pre-generated graph not found, falling back to individual topics');
      return null;
    }
    
    const data: PreGeneratedGraph = await response.json();
    console.log(`Loading pre-generated graph: ${data.stats.totalNodes} nodes, ${data.stats.totalEdges} edges`);
    
    // Convert nodes object to array
    const nodes: TopicNode[] = Object.values(data.nodes).map(node => ({
      id: node.id,
      label: node.title,
      slug: node.id,
      content: node.content,
    }));
    
    return {
      nodes,
      edges: data.edges,
    };
  } catch (error) {
    console.error('Error loading pre-generated graph:', error);
    return null;
  }
}
