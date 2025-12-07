// Grokipedia - The Universal Granular Encyclopedia
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GraphCanvas3D from './components/GraphCanvas3D';
import StarBackground from './components/StarBackground';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Starship removed - was distracting
import HistoryPanel from './components/HistoryPanel';
import FilterPanel from './components/FilterPanel';
import CompareView from './components/CompareView';
import AnnotationPanel from './components/AnnotationPanel';
import SimulationControls from './components/SimulationControls';
import { useGraphState } from './hooks/useGraphState';
import { generateConnectionArticle } from './services/api';
import { useArticleSearch, initializeSearch, addToSearchIndex } from './hooks/useArticleSearch';
import { initializeSearchIndex } from './services/searchService';
import type { KnowledgeNode } from './types/knowledge';
import simulationStep00 from './data/simulation/step-00.json';
import './App.css';
import './grokipedia.css';

// Smoother spring settings for buttery animations
const smoothSpring = { type: 'spring' as const, stiffness: 200, damping: 28, mass: 0.8 };

// Animation variants for the split layout transition
const leftPanelVariants = {
  home: { 
    width: '100%',
    transition: smoothSpring
  },
  viewing: { 
    width: '50%',
    transition: smoothSpring
  }
};

const headerVariants = {
  home: { 
    scale: 1,
    transition: smoothSpring
  },
  viewing: { 
    scale: 0.7,
    transition: smoothSpring
  }
};

const taglineVariants = {
  home: { 
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const }
  },
  viewing: { 
    opacity: 0,
    height: 0,
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] as const }
  }
};

const articlePanelVariants = {
  hidden: { 
    x: '100%',
    opacity: 0,
  },
  visible: { 
    x: 0,
    opacity: 1,
    transition: smoothSpring
  },
  exit: { 
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const }
  }
};

function App() {
  // Graph state with undo/redo
  const graphState = useGraphState();
  
  // UI state
  const [viewingNode, setViewingNode] = useState<KnowledgeNode | null>(null);
  const [_isNewArticle, setIsNewArticle] = useState(false);
  const [selectionPopup, setSelectionPopup] = useState<{ x: number; y: number; text: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  
  // Panels (kept for keyboard shortcuts)
  const [showHistory, setShowHistory] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);

  // Simulation replay state
  const [simulationData, setSimulationData] = useState<{
    nodes: Array<{ id: string; title: string; content: string }>;
    edges: Array<{ source: string; target: string }>;
    generatedNode: { id: string; title: string; content: string } | null;
  } | null>(null);

  // Track newly generated articles to pass to GraphCanvas3D
  const [newGeneratedArticle, setNewGeneratedArticle] = useState<{
    id: string;
    title: string;
    content: string;
    neighborIds: string[];
  } | null>(null);


  // Refs
  const articleRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Determine layout state
  const layoutState = viewingNode ? 'viewing' : 'home';

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;
      
      if (cmdKey && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      if (cmdKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (graphState.canUndo) graphState.undo();
      }
      
      if (cmdKey && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (graphState.canRedo) graphState.redo();
      }
      
      if (cmdKey && e.key === 'h') {
        e.preventDefault();
        setShowHistory(prev => !prev);
      }
      
      if (cmdKey && e.key === 'f') {
        e.preventDefault();
        setShowFilter(prev => !prev);
      }
      
      if (e.key === 'Escape') {
        setViewingNode(null);
        setIsNewArticle(false);
        setShowHistory(false);
        setShowFilter(false);
        setShowAnnotations(false);
        setSelectionPopup(null);
        if (graphState.compareNodes) graphState.setCompareNodes(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [graphState]);

  // Handle article generation (from GraphCanvas)
  const handleArticleGenerated = useCallback((result: any) => {
    if (result.node) {
      graphState.addNode(result.node);
      setViewingNode(result.node);
      setIsNewArticle(true);
    }
    setIsGenerating(false);
    setGenerationProgress('');
  }, [graphState]);

  // Handle node view (double-click)
  const handleNodeView = useCallback((node: { id: string; title: string; content: string } | null) => {
    if (node) {
      const fullNode = graphState.state.nodes.get(node.id);
      setViewingNode(fullNode || node as any);
      setIsNewArticle(false);
    } else {
      setViewingNode(null);
      setIsNewArticle(false);
    }
  }, [graphState.state.nodes]);

  // Text selection for expansion
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !articleRef.current) {
      setSelectionPopup(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length < 10) {
      setSelectionPopup(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    setSelectionPopup({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      text: selectedText,
    });
  }, []);

  // Generate from selection
  const generateFromSelection = useCallback(async () => {
    if (!selectionPopup || !viewingNode) return;
    
    setIsGenerating(true);
    setSelectionPopup(null);
    setGenerationProgress('Researching...');
    
    try {
      const result = await generateConnectionArticle([
        { title: viewingNode.title, content: selectionPopup.text }
      ]);
      
      handleArticleGenerated(result);
    } catch (error) {
      console.error('Failed to generate:', error);
      setIsGenerating(false);
    }
  }, [selectionPopup, viewingNode, handleArticleGenerated]);

  // Handle simulation step changes - update graph, search index, and article count
  const handleSimulationStepChange = useCallback((step: any) => {
    setSimulationData({
      nodes: step.nodes,
      edges: step.edges,
      generatedNode: step.generatedNode,
    });

    // Re-initialize search index with current simulation nodes (no embedding restart)
    const articles = step.nodes.map((n: any) => ({
      id: n.id,
      title: n.title,
      slug: n.id,
      content: n.content,
    }));
    initializeSearchIndex(articles);
    console.log(`🔍 Search index updated with ${articles.length} articles`);
  }, []);

  // Get available domains for filter
  const availableDomains = [...new Set(
    Array.from(graphState.state.nodes.values()).flatMap(n => n.domains || [])
  )];

  // Initialize search with article data
  useEffect(() => {
    const articles = simulationStep00.nodes.map((n: any) => ({
      id: n.id,
      title: n.title,
      slug: n.id,
      content: n.content,
    }));
    initializeSearch(articles);
  }, []);

  // Article search hook
  const articleSearch = useArticleSearch({
    debounceMs: 200,
    maxResults: 8,
    minScore: 0.3,
    onSelect: (article) => {
      // When user clicks a result, show the article
      const node = graphState.state.nodes.get(article.id);
      if (node) {
        setViewingNode(node);
        setIsNewArticle(false);
      } else {
        // Create a temporary node from the article
        setViewingNode({
          id: article.id,
          title: article.title,
          content: article.content || '',
          slug: article.id,
        } as any);
        setIsNewArticle(false);
      }
      articleSearch.clearSearch();
    },
  });

  // Debug search state
  useEffect(() => {
    if (articleSearch.query) {
      console.log('Search state:', {
        query: articleSearch.query,
        resultsCount: articleSearch.results.length,
        isSearching: articleSearch.isSearching,
        isIndexReady: articleSearch.isIndexReady,
      });
    }
  }, [articleSearch.query, articleSearch.results.length, articleSearch.isSearching, articleSearch.isIndexReady]);

  // Handle article generation from search
  const handleGenerate = useCallback(async () => {
    if (!articleSearch.query || articleSearch.query.length < 5 || isGenerating) return;
    
    setIsGenerating(true);
    setGenerationProgress('Researching...');
    
    try {
      const result = await articleSearch.generateArticle();
      
      if (result?.success && result.article) {
        // Add the new article to the graph state
        const newNode = {
          id: result.article.id,
          title: result.article.title,
          content: result.article.content,
          slug: result.article.slug,
          generationMethod: 'search',
          verificationStatus: 'pending' as const,
          confidence: 0.8,
        };
        
        graphState.addNode(newNode as any);
        
        // Add to search index so it's immediately searchable
        addToSearchIndex({
          id: result.article.id,
          title: result.article.title,
          slug: result.article.slug,
          content: result.article.content,
        });

        // CRITICAL: Pass the new article to GraphCanvas3D so it appears on the graph
        setNewGeneratedArticle({
          id: result.article.id,
          title: result.article.title,
          content: result.article.content,
          neighborIds: result.neighborIds || result.sourceArticles || [],
        });

        setViewingNode(newNode as any);
        setIsNewArticle(true);
        articleSearch.clearSearch();
      } else if (result?.isNull) {
        // Show the reason why generation failed
        alert(`Cannot generate article: ${result.reason || 'The topic cannot be verified with available sources.'}`);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate article. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  }, [articleSearch, graphState, isGenerating]);

  // Handle search submit (Enter key)
  const handleSearchSubmit = useCallback(() => {
    if (articleSearch.results.length > 0) {
      // Select first result
      const first = articleSearch.results[0].article;
      const node = graphState.state.nodes.get(first.id);
      if (node) {
        setViewingNode(node);
      } else {
        setViewingNode({
          id: first.id,
          title: first.title,
          content: first.content || '',
          slug: first.id,
        } as any);
      }
      setIsNewArticle(true);
      articleSearch.clearSearch();
    } else if (articleSearch.query.length >= 5) {
      // No results - trigger generation
      handleGenerate();
    }
  }, [articleSearch, graphState.state.nodes, handleGenerate]);

  return (
    <motion.div 
      className={`grok-app ${viewingNode ? 'viewing' : ''}`}
      initial="home"
      animate={layoutState}
    >
      {/* Star Background */}
      <StarBackground />

      {/* Main Layout Container */}
      <div className="grok-layout">
        {/* Left Panel - Branding, Graph, Search */}
        <motion.div 
          className="grok-left-panel"
          variants={leftPanelVariants}
          initial="home"
          animate={layoutState}
        >
          {/* Header Section - Top 25% */}
          <motion.header 
            className="grok-header"
            variants={headerVariants}
            initial="home"
            animate={layoutState}
          >
            <h1 className="grok-logo">Grokipedia</h1>
            <motion.p 
              className="grok-tagline"
              variants={taglineVariants}
              initial="home"
              animate={layoutState}
            >
              the universal granular encyclopedia
            </motion.p>
          </motion.header>

          {/* Graph Section - Middle, with smooth animation */}
          <motion.div 
            className="grok-graph-container"
            animate={{
              scale: viewingNode ? 0.85 : 1,
              x: viewingNode ? '-5%' : '0%',
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 25,
              mass: 0.8
            }}
          >
            <GraphCanvas3D
              onArticleGenerated={handleArticleGenerated}
              onNodeView={handleNodeView}
              searchInputRef={searchInputRef}
              isGenerating={isGenerating}
              generationProgress={generationProgress}
              simulationData={simulationData}
              newGeneratedArticle={newGeneratedArticle}
              onNewArticleProcessed={() => setNewGeneratedArticle(null)}
            />
          </motion.div>

        </motion.div>

        {/* Search Section - Fixed at bottom, shifts up when results/no-results show */}
        <div className={`grok-search-section ${articleSearch.results.length > 0 || (articleSearch.query.length >= 3 && !articleSearch.isSearching && articleSearch.results.length === 0) ? 'has-results' : ''}`}>
          <div className="grok-search-wrapper">
            {/* Results - shown above search box with smooth animations */}
            <AnimatePresence>
              {articleSearch.results.length > 0 && (
                <motion.div 
                  key="search-results"
                  className="grok-search-results"
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {articleSearch.results.map((match, index) => (
                    <motion.button
                      key={match.article.id}
                      className="grok-result-item"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                      onClick={() => {
                        const node = graphState.state.nodes.get(match.article.id);
                        if (node) {
                          setViewingNode(node);
                        } else {
                          setViewingNode({
                            id: match.article.id,
                            title: match.article.title,
                            content: match.article.content || '',
                            slug: match.article.id,
                          } as any);
                        }
                        setIsNewArticle(true);
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
                        {Math.round(match.score * 100)}%
                      </span>
                    </motion.button>
                  ))}
                  
                  {/* Semantic search loading indicator */}
                  {articleSearch.isSemanticSearching && (
                    <motion.div 
                      className="grok-semantic-loading"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="grok-semantic-spinner"></div>
                      <span>Finding related topics...</span>
                    </motion.div>
                  )}
                  
                  {/* Generate option when no exact match */}
                  {!articleSearch.hasExactMatch && articleSearch.query.length >= 5 && (
                    <motion.button
                      className="grok-result-generate"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="grok-generate-icon">✨</span>
                      <span>{isGenerating ? 'Generating...' : `Generate: "${articleSearch.query}"`}</span>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* No results state - separate from results */}
            <AnimatePresence>
              {articleSearch.query.length >= 3 && articleSearch.results.length === 0 && !articleSearch.isSearching && (
                <motion.div 
                  key="no-results"
                  className="grok-search-results"
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <div className="grok-no-results">
                    <p>No articles found for "{articleSearch.query}"</p>
                    {articleSearch.query.length >= 5 && (
                      <motion.button
                        className="grok-generate-btn"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isGenerating ? (
                          <>
                            <span className="grok-spinner-small"></span>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            <span>Generate "{articleSearch.query}"</span>
                          </>
                        )}
                      </motion.button>
                    )}
                    {articleSearch.query.length < 5 && (
                      <p className="grok-hint-text">Type at least 5 characters to generate a new article</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Box */}
            <div className="grok-search-box">
              <svg className="grok-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                className="grok-search-input"
                placeholder="Search or generate any topic..."
                value={articleSearch.query}
                onChange={(e) => articleSearch.setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
              />
              {!articleSearch.query && (
                <span className="grok-search-shortcut">⌘K</span>
              )}
              {articleSearch.isSearching ? (
                <div className="grok-search-spinner" />
              ) : (
                <button 
                  className="grok-search-submit"
                  onClick={handleSearchSubmit}
                  disabled={articleSearch.results.length === 0 && articleSearch.query.length < 5}
                  title={articleSearch.results.length > 0 ? 'Go to first result' : articleSearch.query.length >= 5 ? 'Generate article' : 'Type at least 5 characters'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Article View */}
        <AnimatePresence mode="wait">
          {viewingNode && (
            <motion.aside
              className="grok-article-panel"
              variants={articlePanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="grok-article-header">
                <motion.h2 
                  className="grok-article-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {viewingNode.title}
                </motion.h2>
                <button 
                  className="grok-close-btn"
                  onClick={() => { setViewingNode(null); setIsNewArticle(false); }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <motion.div 
                className="grok-article-meta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {viewingNode.generationMethod && (
                  <span className="grok-tag">{viewingNode.generationMethod}</span>
                )}
                {viewingNode.verificationStatus && (
                  <span className={`grok-status ${viewingNode.verificationStatus}`}>
                    {viewingNode.verificationStatus}
                  </span>
                )}
                {viewingNode.confidence !== undefined && (
                  <span className="grok-confidence">
                    {Math.round(viewingNode.confidence * 100)}% confidence
                  </span>
                )}
              </motion.div>

              <div
                className="grok-article-content"
                ref={articleRef}
                onMouseUp={handleTextSelection}
              >
                <motion.div
                  className="grok-article-text markdown-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {viewingNode.content}
                  </ReactMarkdown>
                </motion.div>

                {/* Domains */}
                {viewingNode.domains && viewingNode.domains.length > 0 && (
                  <motion.div 
                    className="grok-domains"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {viewingNode.domains.map(d => (
                      <span key={d} className="grok-domain">{d}</span>
                    ))}
                  </motion.div>
                )}

                {/* Claims */}
                {viewingNode.claims && viewingNode.claims.length > 0 && (
                  <motion.section 
                    className="grok-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <h3>Verified Claims ({viewingNode.claims.filter(c => c.verified).length}/{viewingNode.claims.length})</h3>
                    <ul className="grok-claims">
                      {viewingNode.claims.map(claim => (
                        <li key={claim.id} className={claim.verified ? 'verified' : ''}>
                          <span className="claim-icon">{claim.verified ? '✓' : '○'}</span>
                          <span className="claim-text">{claim.statement}</span>
                          <span className="claim-score">{Math.round(claim.confidence * 100)}%</span>
                        </li>
                      ))}
                    </ul>
                  </motion.section>
                )}

                {/* Citations */}
                {viewingNode.citations && viewingNode.citations.length > 0 && (
                  <motion.section 
                    className="grok-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3>Sources ({viewingNode.citations.length})</h3>
                    <ul className="grok-citations">
                      {viewingNode.citations.map((citation, i) => (
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
                  </motion.section>
                )}

                {/* Selection hint */}
                <motion.div 
                  className="grok-hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Select text to expand into a new article
                </motion.div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Legal Links */}
      <div className="grok-legal">
        <a href="https://x.ai/legal/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a>
        <span>•</span>
        <a href="https://x.ai/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        <span>•</span>
        <a href="https://x.ai/legal/acceptable-use-policy" target="_blank" rel="noopener noreferrer">AUP</a>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <FilterPanel
          filter={graphState.filter}
          onFilterChange={graphState.setFilter}
          availableDomains={availableDomains}
          onClose={() => setShowFilter(false)}
        />
      )}

      {/* History Panel */}
      {showHistory && (
        <HistoryPanel
          history={graphState.history.past}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Annotation Panel */}
      {showAnnotations && viewingNode && (
        <AnnotationPanel
          node={viewingNode}
          onAddAnnotation={(ann) => graphState.addAnnotation(viewingNode.id, ann)}
          onClose={() => setShowAnnotations(false)}
        />
      )}

      {/* Compare View */}
      {graphState.compareNodes && (
        <CompareView
          nodeA={graphState.state.nodes.get(graphState.compareNodes[0])!}
          nodeB={graphState.state.nodes.get(graphState.compareNodes[1])!}
          onClose={() => graphState.setCompareNodes(null)}
        />
      )}

      {/* Simulation Replay Button */}
      <motion.button
        className="grok-sim-button"
        onClick={() => setShowSimulation(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Replay Knowledge Synthesis"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <span>Replay</span>
      </motion.button>

      {/* Simulation Controls Panel */}
      <SimulationControls
        onStepChange={handleSimulationStepChange}
        isVisible={showSimulation}
        onClose={() => {
          setShowSimulation(false);
          setSimulationData(null); // Reset to show POC data
        }}
      />

      {/* Selection popup */}
      <AnimatePresence>
        {selectionPopup && (
          <motion.div 
            className="grok-selection-popup"
            style={{ left: selectionPopup.x, top: selectionPopup.y }}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button onClick={generateFromSelection} disabled={isGenerating}>
              {isGenerating ? 'expanding...' : 'expand to article'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generation overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            className="grok-generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grok-spinner" />
            <span>{generationProgress || 'synthesizing...'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default App;
