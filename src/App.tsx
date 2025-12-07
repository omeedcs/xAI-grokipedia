// Grokipedia - 3D Knowledge Graph Explorer
import { useState, useCallback, useRef, useEffect } from 'react';
import GraphCanvas3D from './components/GraphCanvas3D';
import HistoryPanel from './components/HistoryPanel';
import FilterPanel from './components/FilterPanel';
import CompareView from './components/CompareView';
import AnnotationPanel from './components/AnnotationPanel';
import { useGraphState } from './hooks/useGraphState';
import { generateConnectionArticle } from './services/api';
import type { KnowledgeNode } from './types/knowledge';
import './App.css';

function App() {
  // Graph state with undo/redo
  const graphState = useGraphState();
  
  // UI state
  const [viewingNode, setViewingNode] = useState<KnowledgeNode | null>(null);
  const [selectionPopup, setSelectionPopup] = useState<{ x: number; y: number; text: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  
  // Panels (kept for keyboard shortcuts)
  const [showHistory, setShowHistory] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  
  // Refs
  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;
      
      // ⌘K - Focus search
      if (cmdKey && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // ⌘Z - Undo
      if (cmdKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (graphState.canUndo) graphState.undo();
      }
      
      // ⌘⇧Z - Redo
      if (cmdKey && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (graphState.canRedo) graphState.redo();
      }
      
      
      // ⌘H - History
      if (cmdKey && e.key === 'h') {
        e.preventDefault();
        setShowHistory(prev => !prev);
      }
      
      // ⌘F - Filter
      if (cmdKey && e.key === 'f') {
        e.preventDefault();
        setShowFilter(prev => !prev);
      }
      
      // Escape - Close panels
      if (e.key === 'Escape') {
        setViewingNode(null);
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
    }
    setIsGenerating(false);
    setGenerationProgress('');
  }, [graphState]);

  // Handle node view (double-click)
  const handleNodeView = useCallback((node: { id: string; title: string; content: string } | null) => {
    if (node) {
      const fullNode = graphState.state.nodes.get(node.id);
      setViewingNode(fullNode || node as any);
    } else {
      setViewingNode(null);
    }
  }, [graphState.state.nodes]);

  // Text selection for expansion
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !sidebarRef.current) {
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

  // Get available domains for filter
  const availableDomains = [...new Set(
    Array.from(graphState.state.nodes.values()).flatMap(n => n.domains || [])
  )];

  // Node count for stats
  const nodeCount = graphState.state.nodes.size;
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <h1 className="logo-text">grokipedia</h1>
          </div>
          
          
          <div className="header-actions">
            <span className="header-node-count">{nodeCount} nodes</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <GraphCanvas3D
          onArticleGenerated={handleArticleGenerated}
          onNodeView={handleNodeView}
          searchInputRef={searchInputRef}
          isGenerating={isGenerating}
          generationProgress={generationProgress}
        />
      </main>

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

      {/* Sidebar for viewing node */}
      {viewingNode && (
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">
              <h2>{viewingNode.title}</h2>
              {viewingNode.confidence !== undefined && (
                <span 
                  className="confidence-indicator" 
                  style={{ opacity: viewingNode.confidence }}
                  title={`${Math.round(viewingNode.confidence * 100)}% confident`}
                >
                  {Math.round(viewingNode.confidence * 100)}%
                </span>
              )}
            </div>
            <div className="sidebar-actions">
              <button 
                className="sidebar-btn"
                onClick={() => setShowAnnotations(prev => !prev)}
                title="Add notes"
              >
                notes
              </button>
              <button className="close-sidebar" onClick={() => setViewingNode(null)}>×</button>
            </div>
          </div>
          
          <div 
            className="sidebar-content" 
            ref={sidebarRef}
            onMouseUp={handleTextSelection}
          >
            {/* Meta info */}
            <div className="article-meta">
              {viewingNode.generationMethod && (
                <span className="article-badge">{viewingNode.generationMethod}</span>
              )}
              {viewingNode.verificationStatus && (
                <span className={`status-badge ${viewingNode.verificationStatus}`}>
                  {viewingNode.verificationStatus}
                </span>
              )}
              {viewingNode.domains && viewingNode.domains.length > 0 && (
                <div className="domain-tags">
                  {viewingNode.domains.map(d => (
                    <span key={d} className="domain-tag">{d}</span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="article-content">
              {viewingNode.content.split('\n').filter(p => p.trim()).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            
            {/* Claims */}
            {viewingNode.claims && viewingNode.claims.length > 0 && (
              <div className="claims-section">
                <h4>Verified Claims ({viewingNode.claims.filter(c => c.verified).length}/{viewingNode.claims.length})</h4>
                <ul className="claims-list">
                  {viewingNode.claims.map(claim => (
                    <li key={claim.id} className={claim.verified ? 'verified' : ''}>
                      <span className="claim-status">{claim.verified ? '✓' : '○'}</span>
                      <span className="claim-text">{claim.statement}</span>
                      <span className="claim-confidence">{Math.round(claim.confidence * 100)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Citations */}
            {viewingNode.citations && viewingNode.citations.length > 0 && (
              <div className="citations-section">
                <h4>Sources ({viewingNode.citations.length})</h4>
                <ul className="citations-list">
                  {viewingNode.citations.map((citation, i) => (
                    <li key={i}>
                      <a href={citation.url} target="_blank" rel="noopener noreferrer">
                        {citation.title || citation.url}
                      </a>
                      {citation.snippet && (
                        <p className="citation-snippet">{citation.snippet.slice(0, 150)}...</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Hint */}
            <div className="article-hint">
              <span>select text to expand into new node</span>
            </div>
          </div>
        </aside>
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

      {/* Selection popup */}
      {selectionPopup && (
        <div 
          className="selection-popup"
          style={{ left: selectionPopup.x, top: selectionPopup.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button onClick={generateFromSelection} disabled={isGenerating}>
            {isGenerating ? 'expanding...' : 'expand to node'}
          </button>
        </div>
      )}

      {/* Generation overlay */}
      {isGenerating && (
        <div className="generating-overlay">
          <div className="spinner" />
          <span>{generationProgress || 'synthesizing...'}</span>
        </div>
      )}

    </div>
  );
}

export default App;
