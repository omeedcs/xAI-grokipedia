import { motion } from 'framer-motion';
import TypewriterText from './TypewriterText';
import type { KnowledgeNode } from '../types/knowledge';

interface ArticleViewProps {
  article: KnowledgeNode;
  onClose: () => void;
  isNewlyGenerated?: boolean;
}

export default function ArticleView({ article, onClose, isNewlyGenerated = false }: ArticleViewProps) {
  return (
    <motion.article
      className="article-view"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="article-view-header">
        <motion.h1
          className="article-view-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {article.title}
        </motion.h1>
        <button className="article-close-btn" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <motion.div
        className="article-view-meta"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {article.generationMethod && (
          <span className="article-tag">{article.generationMethod}</span>
        )}
        {article.verificationStatus && (
          <span className={`article-status ${article.verificationStatus}`}>
            {article.verificationStatus}
          </span>
        )}
        {article.domains?.map(domain => (
          <span key={domain} className="article-domain">{domain}</span>
        ))}
      </motion.div>

      <div className="article-view-content">
        {isNewlyGenerated ? (
          <TypewriterText
            text={article.content}
            speed={150}
            className="article-text"
          />
        ) : (
          <motion.div
            className="article-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {article.content.split('\n').filter(p => p.trim()).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </motion.div>
        )}
      </div>

      {/* Claims Section */}
      {article.claims && article.claims.length > 0 && (
        <motion.div
          className="article-view-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Verified Claims ({article.claims.filter(c => c.verified).length}/{article.claims.length})</h3>
          <ul className="claims-list">
            {article.claims.map(claim => (
              <li key={claim.id} className={claim.verified ? 'verified' : ''}>
                <span className="claim-icon">{claim.verified ? '✓' : '○'}</span>
                <span className="claim-statement">{claim.statement}</span>
                <span className="claim-score">{Math.round(claim.confidence * 100)}%</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Citations Section */}
      {article.citations && article.citations.length > 0 && (
        <motion.div
          className="article-view-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>Sources ({article.citations.length})</h3>
          <ul className="citations-list">
            {article.citations.map((citation, i) => (
              <li key={i}>
                <a href={citation.url} target="_blank" rel="noopener noreferrer">
                  {citation.title || citation.url}
                </a>
                {citation.snippet && (
                  <p className="citation-excerpt">{citation.snippet.slice(0, 150)}...</p>
                )}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <motion.div
        className="article-view-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Select text to expand into a new article
      </motion.div>
    </motion.article>
  );
}
