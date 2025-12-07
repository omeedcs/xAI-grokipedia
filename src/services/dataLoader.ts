export interface TopicNode {
  id: string;
  label: string;
  slug: string;
  content: string; // MD content
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
