// Compare View - Side-by-side comparison of two nodes
import type { KnowledgeNode } from '../types/knowledge';

interface CompareViewProps {
  nodeA: KnowledgeNode;
  nodeB: KnowledgeNode;
  onClose: () => void;
}

export default function CompareView({ nodeA, nodeB, onClose }: CompareViewProps) {
  const renderNode = (node: KnowledgeNode, side: 'left' | 'right') => (
    <div className={`compare-column compare-${side}`}>
      <h3>{node.title}</h3>
      
      <div className="compare-meta">
        <span className="confidence-badge" style={{ opacity: node.confidence }}>
          {Math.round(node.confidence * 100)}% confident
        </span>
        <span className="status-badge">{node.verificationStatus}</span>
      </div>
      
      <div className="compare-content">
        {node.content.split('\n').filter(p => p.trim()).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      
      {node.claims.length > 0 && (
        <div className="compare-section">
          <h4>Claims ({node.claims.length})</h4>
          <ul className="claims-list">
            {node.claims.map(claim => (
              <li key={claim.id} className={claim.verified ? 'verified' : ''}>
                {claim.verified ? '✓' : '○'} {claim.statement}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {node.citations.length > 0 && (
        <div className="compare-section">
          <h4>Sources ({node.citations.length})</h4>
          <ul className="sources-list">
            {node.citations.slice(0, 5).map((citation, i) => (
              <li key={i}>
                <a href={citation.url} target="_blank" rel="noopener noreferrer">
                  {citation.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="compare-section">
        <h4>Domains</h4>
        <div className="domain-tags">
          {node.domains.map(domain => (
            <span key={domain} className="domain-tag">{domain}</span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="compare-view">
      <div className="compare-header">
        <h2>Compare Nodes</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="compare-body">
        {renderNode(nodeA, 'left')}
        <div className="compare-divider" />
        {renderNode(nodeB, 'right')}
      </div>
    </div>
  );
}
