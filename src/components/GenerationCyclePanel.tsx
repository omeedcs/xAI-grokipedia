// Generation Cycle Panel - Controls for running the priority-based generation cycle
import { useState, useCallback, useEffect } from 'react';
import type { PotentialEdge, GenerationCycleConfig } from '../types/knowledge';
import {
  identifyUnpressedEdges,
  calculateAllPriorityScores,
  selectBatch,
  executeBatch,
  getConfig,
  setConfig,
  updateEdgeMetrics,
  runMultipleIterations,
  type EdgeGenerationResult,
} from '../services/generationCycle';

interface GenerationCyclePanelProps {
  nodes: Array<{ id: string; label: string; content: string }>;
  edges: Array<{ source: string; target: string }>;
  onNewArticle?: (result: EdgeGenerationResult) => void;
  onClose: () => void;
}

export default function GenerationCyclePanel({
  nodes,
  edges,
  onNewArticle,
  onClose,
}: GenerationCyclePanelProps) {
  const [config, setLocalConfig] = useState<GenerationCycleConfig>(getConfig());
  const [unpressedEdges, setUnpressedEdges] = useState<PotentialEdge[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<PotentialEdge[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ phase: '', current: 0, total: 0 });
  const [results, setResults] = useState<EdgeGenerationResult[]>([]);
  const [generation, setGeneration] = useState(0);

  // Get node data helper
  const getNodeData = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return undefined;
      return {
        id: node.id,
        title: node.label,
        content: node.content,
        metrics: { integrityScore: node.id.startsWith('seed-') ? 1.0 : 0.5, isUncertaintyNode: false, resolutionBonus: 0 },
      };
    },
    [nodes]
  );

  // Analyze graph to find unpressed edges
  const analyzeGraph = useCallback(async () => {
    setIsAnalyzing(true);
    setProgress({ phase: 'Identifying unpressed edges...', current: 0, total: 1 });

    // Step 1: Find all unpressed edges
    const unpressed = identifyUnpressedEdges(nodes, edges);
    setProgress({ phase: 'Calculating causal distances...', current: 0, total: unpressed.length });

    // Step 2: Calculate metrics for edges that need it (limit to 20 for speed)
    const needsMetrics = unpressed.filter((e) => e.metrics.causalDistance === null).slice(0, 20);
    if (needsMetrics.length > 0) {
      await updateEdgeMetrics(needsMetrics, getNodeData, (current, total) => {
        setProgress({ phase: 'Calculating causal distances...', current, total });
      });
    }

    // Step 3: Calculate priority scores
    setProgress({ phase: 'Calculating priority scores...', current: 0, total: 1 });
    const scored = calculateAllPriorityScores(unpressed, getNodeData, config);

    // Step 4: Select top batch
    const batch = selectBatch(scored, config.batchSize);

    setUnpressedEdges(scored);
    setSelectedBatch(batch);
    setIsAnalyzing(false);
    setProgress({ phase: '', current: 0, total: 0 });
  }, [nodes, edges, config, getNodeData]);

  // Run generation cycle
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
        setProgress({ phase: `Generating article ${current}/${total}...`, current, total });
      }
    );

    setGeneration((g) => g + 1);
    setIsGenerating(false);
    setProgress({ phase: '', current: 0, total: 0 });

    // Re-analyze after generation
    await analyzeGraph();
  }, [selectedBatch, getNodeData, onNewArticle, analyzeGraph]);

  // Run 20 iterations for POC
  const runPOCIterations = useCallback(async () => {
    setIsGenerating(true);
    setResults([]);

    const iterationResult = await runMultipleIterations(
      20, // 20 iterations
      nodes,
      edges,
      getNodeData,
      (result) => {
        setResults((prev) => [...prev, result]);
        onNewArticle?.(result);
      },
      (iteration, total, phase) => {
        setProgress({
          phase: `Iteration ${iteration}/${total}: ${phase}`,
          current: iteration,
          total
        });
      }
    );

    setGeneration((g) => g + iterationResult.totalIterations);
    setIsGenerating(false);
    setProgress({ phase: '', current: 0, total: 0 });

    console.log('POC Complete:', iterationResult);
    alert(`POC Complete!\n\n` +
      `Generated: ${iterationResult.totalNodesGenerated} nodes\n` +
      `Uncertainty: ${iterationResult.totalUncertaintyNodes} nodes\n` +
      `Errors: ${iterationResult.totalErrors}\n` +
      `Duration: ${(iterationResult.duration / 1000).toFixed(1)}s`);

    // Re-analyze after all iterations
    await analyzeGraph();
  }, [nodes, edges, getNodeData, onNewArticle, analyzeGraph]);

  // Update config
  const handleConfigChange = (key: keyof GenerationCycleConfig, value: number) => {
    const newConfig = { ...config, [key]: value };
    setLocalConfig(newConfig);
    setConfig(newConfig);
  };

  // Initial analysis
  useEffect(() => {
    analyzeGraph();
  }, []);

  // Get edge label
  const getEdgeLabel = (edge: PotentialEdge) => {
    const sourceNode = nodes.find((n) => n.id === edge.sourceNodeId);
    const targetNode = nodes.find((n) => n.id === edge.targetNodeId);
    const source = sourceNode?.label?.slice(0, 25) || edge.sourceNodeId;
    const target = targetNode?.label?.slice(0, 25) || edge.targetNodeId;
    return `${source} ↔ ${target}`;
  };

  return (
    <div className="generation-cycle-panel">
      <div className="panel-header">
        <h3>Generation Cycle (N{generation})</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="panel-content">
        {/* Stats */}
        <div className="cycle-stats">
          <div className="stat">
            <span className="stat-value">{nodes.length}</span>
            <span className="stat-label">Nodes</span>
          </div>
          <div className="stat">
            <span className="stat-value">{edges.length}</span>
            <span className="stat-label">Edges</span>
          </div>
          <div className="stat">
            <span className="stat-value">{unpressedEdges.length}</span>
            <span className="stat-label">Unpressed</span>
          </div>
          <div className="stat">
            <span className="stat-value">{selectedBatch.length}</span>
            <span className="stat-label">Batch</span>
          </div>
        </div>

        {/* Config */}
        <div className="config-section">
          <h4>Priority Weights</h4>
          <div className="config-row">
            <label>α (Causal Distance): {config.alpha.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.alpha * 100}
              onChange={(e) => handleConfigChange('alpha', parseInt(e.target.value) / 100)}
            />
          </div>
          <div className="config-row">
            <label>β (Integrity Tension): {config.beta.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.beta * 100}
              onChange={(e) => handleConfigChange('beta', parseInt(e.target.value) / 100)}
            />
          </div>
          <div className="config-row">
            <label>γ (Query Frequency): {config.gamma.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.gamma * 100}
              onChange={(e) => handleConfigChange('gamma', parseInt(e.target.value) / 100)}
            />
          </div>
          <div className="config-row">
            <label>Batch Size (K): {config.batchSize}</label>
            <input
              type="range"
              min="1"
              max="20"
              value={config.batchSize}
              onChange={(e) => handleConfigChange('batchSize', parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* Formula display */}
        <div className="formula-section">
          <code>P = (α·D_C + β·T_I + γ·F_Q) × (1 + B_U)</code>
        </div>

        {/* Progress */}
        {(isAnalyzing || isGenerating) && progress.phase && (
          <div className="progress-section">
            <div className="progress-label">{progress.phase}</div>
            {progress.total > 0 && (
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Top priority edges */}
        <div className="batch-section">
          <h4>Top Priority Edges (Batch)</h4>
          <div className="edge-list">
            {selectedBatch.slice(0, 10).map((edge, i) => (
              <div key={edge.id} className="edge-item">
                <span className="edge-rank">#{i + 1}</span>
                <span className="edge-label">{getEdgeLabel(edge)}</span>
                <span className="edge-score">
                  P={edge.metrics.priorityScore?.toFixed(3) || '?'}
                </span>
                <span className="edge-metrics">
                  D_C={edge.metrics.causalDistance ?? '?'} |
                  T_I={edge.metrics.integrityTension?.toFixed(2) ?? '?'} |
                  F_Q={edge.metrics.queryFrequency}
                </span>
              </div>
            ))}
            {selectedBatch.length === 0 && !isAnalyzing && (
              <div className="no-edges">No unpressed edges found</div>
            )}
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="results-section">
            <h4>Generation Results</h4>
            <div className="results-list">
              {results.map((result, i) => (
                <div
                  key={i}
                  className={`result-item ${result.success ? 'success' : 'error'} ${result.result?.isUncertainty ? 'uncertainty' : ''}`}
                >
                  <span className="result-icon">
                    {result.success ? (result.result?.isUncertainty ? '⚠️' : '✓') : '✗'}
                  </span>
                  <span className="result-label">
                    {result.success
                      ? result.result?.node.title.slice(0, 40)
                      : result.error}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="actions-section">
          <button
            className="action-btn secondary"
            onClick={analyzeGraph}
            disabled={isAnalyzing || isGenerating}
          >
            {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
          </button>
          <button
            className="action-btn primary"
            onClick={runGeneration}
            disabled={isAnalyzing || isGenerating || selectedBatch.length === 0}
          >
            {isGenerating ? 'Generating...' : `Generate Batch (${selectedBatch.length})`}
          </button>
        </div>

        {/* POC Mode - 20 Iterations */}
        <div className="poc-section">
          <button
            className="action-btn poc"
            onClick={runPOCIterations}
            disabled={isAnalyzing || isGenerating}
          >
            {isGenerating ? `Running... (${progress.current}/${progress.total})` : '🚀 Run 20 Iterations (POC)'}
          </button>
          <p className="poc-hint">Max parallelization - generates all possible edges</p>
        </div>
      </div>
    </div>
  );
}
