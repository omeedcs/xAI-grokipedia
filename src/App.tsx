// Grokipedia v0.3 - Knowledge Synthesizer
import { useState, useCallback, useRef, useEffect } from 'react';
import GraphCanvas from './components/GraphCanvas';
import HistoryPanel from './components/HistoryPanel';
import FilterPanel from './components/FilterPanel';
import CompareView from './components/CompareView';
import AnnotationPanel from './components/AnnotationPanel';
import Minimap from './components/Minimap';
import { useGraphState } from './hooks/useGraphState';
import { generateConnectionArticle } from './services/api';
import type { KnowledgeNode } from './types/knowledge';
import type Sigma from 'sigma';
import './App.css';

function App() {
  // Graph state with undo/redo
  const graphState = useGraphState();
  
  // UI state
  const [viewingNode, setViewingNode] = useState<KnowledgeNode | null>(null);
  const [selectionPopup, setSelectionPopup] = useState<{ x: number; y: number; text: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  
  // Panels
  const [showHistory, setShowHistory] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Sigma reference for minimap
  const [sigmaInstance, setSigmaInstance] = useState<Sigma | null>(null);
  
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
      
      // ⌘E - Export menu
      if (cmdKey && e.key === 'e') {
        e.preventDefault();
        setShowExportMenu(prev => !prev);
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
        setShowExportMenu(false);
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
  const synthesizedCount = Array.from(graphState.state.nodes.values())
    .filter(n => n.generationMethod === 'synthesis' || n.generationMethod === 'expansion').length;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <h1 className="logo-text">grokipedia v0.3</h1>
          </div>
          
          {/* Breadcrumbs */}
          {graphState.viewPath.length > 0 && (
            <div className="breadcrumbs">
              <button onClick={() => graphState.navigateBack()}>←</button>
              {graphState.viewPath.map((nodeId, i) => {
                const node = graphState.state.nodes.get(nodeId);
                return (
                  <span key={nodeId}>
                    {i > 0 && ' / '}
                    <span className="breadcrumb">{node?.title || nodeId}</span>
                  </span>
                );
              })}
            </div>
          )}
          
          <div className="header-actions">
            {/* Undo/Redo */}
            <div className="action-group">
              <button 
                className="action-btn" 
                onClick={graphState.undo} 
                disabled={!graphState.canUndo}
                title="Undo (⌘Z)"
              >
                ↶
              </button>
              <button 
                className="action-btn" 
                onClick={graphState.redo} 
                disabled={!graphState.canRedo}
                title="Redo (⌘⇧Z)"
              >
                ↷
              </button>
            </div>
            
            {/* Panel toggles */}
            <button 
              className={`action-btn ${showFilter ? 'active' : ''}`}
              onClick={() => setShowFilter(prev => !prev)}
              title="Filter (⌘F)"
            >
              filter
            </button>
            
            <button 
              className={`action-btn ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(prev => !prev)}
              title="History (⌘H)"
            >
              history
            </button>
            
            {/* Export dropdown */}
            <div className="dropdown">
              <button 
                className="action-btn"
                onClick={() => setShowExportMenu(prev => !prev)}
                title="Export (⌘E)"
              >
                export
              </button>
              {showExportMenu && (
                <div className="dropdown-menu">
                  <button onClick={() => { graphState.exportJSON(); setShowExportMenu(false); }}>
                    Export JSON
                  </button>
                  <button onClick={() => { graphState.exportMarkdown(); setShowExportMenu(false); }}>
                    Export Markdown
                  </button>
                </div>
              )}
            </div>
            
            {/* Stats */}
            <div className="header-stats">
              <span className="stat">
                <span className="stat-value">{nodeCount}</span>
                <span className="stat-label">nodes</span>
              </span>
              {synthesizedCount > 0 && (
                <span className="stat">
                  <span className="stat-value">{synthesizedCount}</span>
                  <span className="stat-label">synthesized</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <GraphCanvas 
          onArticleGenerated={handleArticleGenerated}
          onNodeView={handleNodeView}
          onSigmaReady={setSigmaInstance}
          searchInputRef={searchInputRef}
          graphState={graphState}
          isGenerating={isGenerating}
          generationProgress={generationProgress}
        />
        
        {/* Minimap */}
        <div className="minimap-container">
          <Minimap sigma={sigmaInstance} />
        </div>
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

      {/* Keyboard shortcuts hint */}
      <div className="keyboard-hints">
        <span>⌘K search</span>
        <span>⌘Z undo</span>
        <span>⌘⇧Z redo</span>
        <span>esc close</span>
      </div>
    </div>
  );
}

export default App;
