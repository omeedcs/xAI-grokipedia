import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArticleSearch, initializeSearch, addToSearchIndex } from '../hooks/useArticleSearch';
import type { TopicNode } from '../services/dataLoader';

interface GrokSearchProps {
  topics: TopicNode[];
  onSelectArticle: (article: { id: string; title: string; content: string }) => void;
  onArticleGenerated: (article: { id: string; title: string; content: string; slug: string }, neighborIds?: string[]) => void;
  isCompact?: boolean;
}

export default function GrokSearch({
  topics,
  onSelectArticle,
  onArticleGenerated,
  isCompact = false,
}: GrokSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const articleSearch = useArticleSearch({
    debounceMs: 200,
    maxResults: 8,
    minScore: 0.3,
    onSelect: (article) => {
      onSelectArticle({
        id: article.id,
        title: article.title,
        content: article.content || '',
      });
      articleSearch.clearSearch();
      setIsFocused(false);
    },
  });

  // Initialize search when topics change
  useEffect(() => {
    if (topics.length > 0) {
      initializeSearch(
        topics.map(t => ({
          id: t.id,
          title: t.label,
          slug: t.slug,
          content: t.content,
        }))
      );
    }
  }, [topics]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setIsFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!articleSearch.query || articleSearch.query.length < 3) return;

    setIsGenerating(true);
    try {
      const result = await articleSearch.generateArticle();

      if (result?.success && result.article) {
        // Add to search index
        addToSearchIndex({
          id: result.article.id,
          title: result.article.title,
          slug: result.article.slug,
          content: result.article.content,
        });

        // Pass neighborIds for edge creation
        onArticleGenerated(result.article, result.neighborIds);
        articleSearch.clearSearch();
        setIsFocused(false);
      } else if (result?.isNull) {
        alert(`Cannot generate: ${result.reason || 'Topic cannot be verified.'}`);
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [articleSearch, onArticleGenerated]);

  const handleSubmit = useCallback(() => {
    if (articleSearch.results.length > 0) {
      const first = articleSearch.results[0].article;
      onSelectArticle({
        id: first.id,
        title: first.title,
        content: first.content || '',
      });
      articleSearch.clearSearch();
      setIsFocused(false);
    } else if (articleSearch.query.length >= 3) {
      handleGenerate();
    }
  }, [articleSearch, onSelectArticle, handleGenerate]);

  return (
    <div className={`grok-search ${isCompact ? 'compact' : ''}`}>
      <motion.div
        className="grok-search-box"
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <svg className="grok-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        
        <input
          ref={inputRef}
          type="text"
          className="grok-search-input"
          placeholder={isCompact ? "Search..." : "Search Grokipedia..."}
          value={articleSearch.query}
          onChange={(e) => articleSearch.setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        {articleSearch.isSearching && (
          <div className="grok-search-spinner" />
        )}

        <button
          className="grok-search-submit"
          onClick={handleSubmit}
          disabled={isGenerating || (!articleSearch.query && articleSearch.results.length === 0)}
        >
          {isGenerating ? (
            <div className="grok-search-spinner" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </motion.div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isFocused && articleSearch.query.length > 0 && (
          <motion.div
            className="grok-search-results"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {articleSearch.results.length > 0 ? (
              <>
                {articleSearch.results.map((match, index) => (
                  <motion.button
                    key={match.article.id}
                    className="grok-result-item"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => {
                      onSelectArticle({
                        id: match.article.id,
                        title: match.article.title,
                        content: match.article.content || '',
                      });
                      articleSearch.clearSearch();
                    }}
                  >
                    <div className="grok-result-content">
                      <span className="grok-result-title">{match.article.title}</span>
                      <span className="grok-result-preview">
                        {match.article.contentPreview?.slice(0, 60)}...
                      </span>
                    </div>
                    <span className="grok-result-time">
                      {Math.round(match.score * 100)}% match
                    </span>
                  </motion.button>
                ))}
                
                {/* Generate option if no exact match */}
                {!articleSearch.hasExactMatch && articleSearch.query.length >= 5 && (
                  <motion.button
                    className="grok-result-generate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    <span className="grok-generate-icon">✨</span>
                    <span>Generate article: "{articleSearch.query}"</span>
                  </motion.button>
                )}
              </>
            ) : (
              !articleSearch.isSearching && articleSearch.query.length >= 3 && (
                <motion.div
                  className="grok-no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p>No articles found</p>
                  {articleSearch.query.length >= 5 && (
                    <button
                      className="grok-generate-btn"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Generating...' : `Generate: "${articleSearch.query}"`}
                    </button>
                  )}
                </motion.div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
