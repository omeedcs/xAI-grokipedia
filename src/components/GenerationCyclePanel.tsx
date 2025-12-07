// Generation Cycle Panel - Simplified, user-friendly interface
import { useState, useCallback, useEffect, useMemo, memo } from 'react';
import type { PotentialEdge, GenerationCycleConfig } from '../types/knowledge';
import {
  identifyUnpressedEdges,
  calculateAllPriorityScores,
  selectBatch,
  executeBatch,
  getConfig,
  setConfig,
  updateEdgeMetrics,
  type EdgeGenerationResult,
} from '../services/generationCycle';

interface GenerationCyclePanelProps {
  nodes: Array<{ id: string; label: string; content: string }>;
  edges: Array<{ source: string; target: string }>;
  onNewArticle?: (result: EdgeGenerationResult) => void;
  onClose: () => void;
}

// Memoized edge item to prevent re-renders
const EdgeItem = memo(({ 
  rank, 
  sourceLabel, 
  targetLabel 
}: { 
  rank: number; 
  sourceLabel: string; 
  targetLabel: string;
}) => (
  <div className="gen-edge-item">
    <div className="gen-edge-rank">{rank}</div>
    <div className="gen-edge-content">
      <div className="gen-edge-nodes">
        <span className="gen-edge-node">{sourceLabel}</span>
        <span className="gen-edge-arrow">→</span>
        <span className="gen-edge-node">{targetLabel}</span>
      </div>
    </div>
  </div>
));
EdgeItem.displayName = 'EdgeItem';

export default function GenerationCyclePanel({
  nodes,
  edges,
  onNewArticle,
  onClose,
}: GenerationCyclePanelProps) {
  const [config] = useState<GenerationCycleConfig>(getConfig());
  const [unpressedEdges, setUnpressedEdges] = useState<PotentialEdge[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<PotentialEdge[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, message: '' });
  const [results, setResults] = useState<EdgeGenerationResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batchSize, setBatchSize] = useState(config.batchSize);

  // Memoized node lookup map for O(1) access
  const nodeMap = useMemo(() => {
    const map = new Map<string, { id: string; label: string; content: string }>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Get node data helper - memoized
  const getNodeData = useCallback(
    (nodeId: string) => {
      const node = nodeMap.get(nodeId);
      if (!node) return undefined;
      return {
        id: node.id,
        title: node.label,
        content: node.content,
        metrics: { integrityScore: node.id.startsWith('seed-') ? 1.0 : 0.5, isUncertaintyNode: false, resolutionBonus: 0 },
      };
    },
    [nodeMap]
  );

  // Analyze graph - only runs once on mount
  const analyzeGraph = useCallback(async () => {
    setIsAnalyzing(true);
    setProgress({ current: 0, total: 3, message: 'Scanning knowledge graph...' });

    // Step 1: Find unpressed edges
    const unpressed = identifyUnpressedEdges(nodes, edges);
    setProgress({ current: 1, total: 3, message: 'Calculating priorities...' });

    // Step 2: Calculate metrics (limit for performance)
    const needsMetrics = unpressed.filter((e) => e.metrics.causalDistance === null).slice(0, 15);
    if (needsMetrics.length > 0) {
      await updateEdgeMetrics(needsMetrics, getNodeData, () => {});
    }

    // Step 3: Score and select batch
    setProgress({ current: 2, total: 3, message: 'Selecting best candidates...' });
    const scored = calculateAllPriorityScores(unpressed, getNodeData, config);
    const batch = selectBatch(scored, batchSize);

    setUnpressedEdges(scored);
    setSelectedBatch(batch);
    setIsAnalyzing(false);
    setProgress({ current: 0, total: 0, message: '' });
  }, [nodes, edges, config, batchSize, getNodeData]);

  // Run generation
  const runGeneration = useCallback(async () => {
    if (selectedBatch.length === 0) return;

    setIsGenerating(true);
    setResults([]);

    await executeBatch(
      selectedBatch,
      getNodeData,
      (result) => {
        setResults((prev) => [...prev, result]);
        onNewArticle?.(result);
      },
      (current, total) => {
        setProgress({ 
          current, 
          total, 
          message: `Creating article ${current} of ${total}...` 
        });
      }
    );

    setIsGenerating(false);
    setProgress({ current: 0, total: 0, message: '' });
    
    // Re-analyze after generation
    setTimeout(() => analyzeGraph(), 500);
  }, [selectedBatch, getNodeData, onNewArticle, analyzeGraph]);

  // Update batch size and reselect
  const handleBatchSizeChange = useCallback((size: number) => {
    setBatchSize(size);
    setConfig({ ...config, batchSize: size });
    if (unpressedEdges.length > 0) {
      setSelectedBatch(selectBatch(unpressedEdges, size));
    }
  }, [config, unpressedEdges]);

  // Initial analysis - only once
  useEffect(() => {
    analyzeGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate stats
  const successCount = results.filter(r => r.success && !r.result?.isUncertainty).length;
  const uncertaintyCount = results.filter(r => r.result?.isUncertainty).length;
  const errorCount = results.filter(r => !r.success).length;

  return (
    <div className="gen-panel">
      {/* Header */}
      <div className="gen-header">
        <div className="gen-header-left">
          <h2>Generate Articles</h2>
          <span className="gen-subtitle">AI-powered knowledge synthesis</span>
        </div>
        <button className="gen-close" onClick={onClose} aria-label="Close panel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="gen-quick-stats">
        <div className="gen-stat">
          <span className="gen-stat-value">{unpressedEdges.length}</span>
          <span className="gen-stat-label">Potential connections</span>
        </div>
        <div className="gen-stat highlight">
          <span className="gen-stat-value">{selectedBatch.length}</span>
          <span className="gen-stat-label">Ready to generate</span>
        </div>
      </div>

      {/* Batch Size Control */}
      <div className="gen-control">
        <label className="gen-control-label">
          Articles to generate
          <span className="gen-control-value">{batchSize}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={batchSize}
          onChange={(e) => handleBatchSizeChange(parseInt(e.target.value))}
          className="gen-slider"
        />
        <div className="gen-slider-labels">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      {/* Progress or Preview */}
      {(isAnalyzing || isGenerating) ? (
        <div className="gen-progress">
          <div className="gen-progress-bar">
            <div 
              className="gen-progress-fill" 
              style={{ width: progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : '100%' }}
            />
          </div>
          <span className="gen-progress-text">{progress.message || 'Processing...'}</span>
        </div>
      ) : selectedBatch.length > 0 ? (
        <div className="gen-preview">
          <div className="gen-preview-header">
            <span>Top candidates</span>
            <button 
              className="gen-preview-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide details' : 'Show details'}
            </button>
          </div>
          <div className="gen-edge-list">
            {selectedBatch.slice(0, showAdvanced ? 10 : 3).map((edge, i) => (
              <EdgeItem
                key={edge.id}
                rank={i + 1}
                sourceLabel={nodeMap.get(edge.sourceNodeId)?.label?.slice(0, 30) || 'Unknown'}
                targetLabel={nodeMap.get(edge.targetNodeId)?.label?.slice(0, 30) || 'Unknown'}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="gen-empty">
          <span>No more connections to explore</span>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="gen-results">
          <div className="gen-results-header">
            <span>Generated</span>
            <div className="gen-results-stats">
              {successCount > 0 && <span className="gen-result-badge success">{successCount} created</span>}
              {uncertaintyCount > 0 && <span className="gen-result-badge uncertainty">{uncertaintyCount} uncertain</span>}
              {errorCount > 0 && <span className="gen-result-badge error">{errorCount} failed</span>}
            </div>
          </div>
          <div className="gen-results-list">
            {results.slice(-5).map((result, i) => (
              <div key={i} className={`gen-result-item ${result.success ? (result.result?.isUncertainty ? 'uncertainty' : 'success') : 'error'}`}>
                <span className="gen-result-icon">
                  {result.success ? (result.result?.isUncertainty ? '⚠️' : '✓') : '✗'}
                </span>
                <span className="gen-result-title">
                  {result.success ? result.result?.node.title.slice(0, 50) : 'Generation failed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Action */}
      <button
        className="gen-action-btn"
        onClick={runGeneration}
        disabled={isAnalyzing || isGenerating || selectedBatch.length === 0}
      >
        {isGenerating ? (
          <>
            <span className="gen-spinner" />
            Generating...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Generate {selectedBatch.length} Article{selectedBatch.length !== 1 ? 's' : ''}
          </>
        )}
      </button>

      {/* Refresh link */}
      <button 
        className="gen-refresh"
        onClick={analyzeGraph}
        disabled={isAnalyzing || isGenerating}
      >
        {isAnalyzing ? 'Scanning...' : 'Refresh candidates'}
      </button>
    </div>
  );
}
