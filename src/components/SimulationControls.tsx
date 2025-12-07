import { useState, useEffect, useCallback, useMemo } from 'react';

interface ScoredEdge {
  source: string;
  target: string;
  score: number;
  semanticDistance: number;
  novelty: number;
  degreeSum: number;
  recency: number;
}

interface SimulationNode {
  id: string;
  title: string;
  content: string;
}

interface SimulationStep {
  step: number;
  nodes: SimulationNode[];
  edges: { source: string; target: string }[];
  scoredEdges: ScoredEdge[];
  selectedEdge: ScoredEdge | null;
  generatedNode: SimulationNode | null;
  newEdges: { source: string; target: string }[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    generatedNodes: number;
  };
}

// Expanded sub-step for node-by-node playback
interface ExpandedSubStep {
  originalStepIndex: number;
  subStepIndex: number;
  nodes: SimulationNode[];
  edges: { source: string; target: string }[];
  generatedNode: SimulationNode | null;
  newEdges: { source: string; target: string }[];
  selectedEdge: ScoredEdge | null;
  stats: {
    totalNodes: number;
    totalEdges: number;
    generatedNodes: number;
  };
}

interface SimulationControlsProps {
  onStepChange: (step: SimulationStep) => void;
  isVisible: boolean;
  onClose: () => void;
}

// Helper function to expand steps into sub-steps (one node at a time)
function expandStepsToSubSteps(steps: SimulationStep[]): ExpandedSubStep[] {
  const subSteps: ExpandedSubStep[] = [];

  if (steps.length === 0) return subSteps;

  // First step (step 0) - just show the initial state
  const firstStep = steps[0];
  subSteps.push({
    originalStepIndex: 0,
    subStepIndex: 0,
    nodes: firstStep.nodes,
    edges: firstStep.edges,
    generatedNode: null,
    newEdges: [],
    selectedEdge: null,
    stats: firstStep.stats,
  });

  // For each subsequent step, find new nodes by comparing to previous step
  for (let i = 1; i < steps.length; i++) {
    const prevStep = steps[i - 1];
    const currStep = steps[i];

    // Find nodes that are in currStep but not in prevStep
    const prevNodeIds = new Set(prevStep.nodes.map(n => n.id));
    const newNodes = currStep.nodes.filter(n => !prevNodeIds.has(n.id));

    // Find edges that are in currStep but not in prevStep
    const prevEdgeKeys = new Set(prevStep.edges.map(e => `${e.source}--${e.target}`));
    const newEdges = currStep.edges.filter(e => !prevEdgeKeys.has(`${e.source}--${e.target}`));

    if (newNodes.length === 0) {
      // No new nodes - just show the step as-is
      subSteps.push({
        originalStepIndex: i,
        subStepIndex: 0,
        nodes: currStep.nodes,
        edges: currStep.edges,
        generatedNode: currStep.generatedNode,
        newEdges: newEdges,
        selectedEdge: currStep.selectedEdge,
        stats: currStep.stats,
      });
    } else {
      // Create sub-steps for each new node
      let cumulativeNodes = [...prevStep.nodes];
      let cumulativeEdges = [...prevStep.edges];

      for (let j = 0; j < newNodes.length; j++) {
        const newNode = newNodes[j];

        // Add this node to cumulative
        cumulativeNodes = [...cumulativeNodes, newNode];

        // Find edges for this specific node
        const nodeEdges = newEdges.filter(
          e => e.source === newNode.id || e.target === newNode.id
        );
        cumulativeEdges = [...cumulativeEdges, ...nodeEdges];

        // Calculate stats for this sub-step
        const genCount = cumulativeNodes.filter(
          n => n.id.startsWith('gen-') || n.id.startsWith('unc-')
        ).length;

        subSteps.push({
          originalStepIndex: i,
          subStepIndex: j,
          nodes: [...cumulativeNodes],
          edges: [...cumulativeEdges],
          generatedNode: newNode,
          newEdges: nodeEdges,
          selectedEdge: currStep.selectedEdge,
          stats: {
            totalNodes: cumulativeNodes.length,
            totalEdges: cumulativeEdges.length,
            generatedNodes: genCount,
          },
        });
      }
    }
  }

  return subSteps;
}

export default function SimulationControls({
  onStepChange,
  isVisible,
  onClose,
}: SimulationControlsProps) {
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [currentSubStepIndex, setCurrentSubStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2000); // ms between steps
  const [isLoading, setIsLoading] = useState(true);

  // Expand steps into sub-steps for node-by-node playback
  const subSteps = useMemo(() => expandStepsToSubSteps(steps), [steps]);

  // Load all simulation steps
  useEffect(() => {
    async function loadSteps() {
      setIsLoading(true);
      const loadedSteps: SimulationStep[] = [];

      // Try to load steps 0-20
      for (let i = 0; i <= 20; i++) {
        try {
          const stepNum = String(i).padStart(2, '0');
          const module = await import(`../data/simulation/step-${stepNum}.json`);
          loadedSteps.push(module.default || module);
        } catch {
          // Step doesn't exist yet
          break;
        }
      }

      setSteps(loadedSteps);
      setCurrentSubStepIndex(0);
      setIsLoading(false);
    }

    if (isVisible) {
      loadSteps();
    }
  }, [isVisible]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || subSteps.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSubStepIndex((prev) => {
        const next = prev + 1;
        if (next >= subSteps.length) {
          setIsPlaying(false);
          return prev;
        }
        return next;
      });
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, subSteps.length, playbackSpeed]);

  // Notify parent of step changes - convert subStep to SimulationStep format
  useEffect(() => {
    const currentSubStep = subSteps[currentSubStepIndex];
    if (currentSubStep) {
      // Create a SimulationStep-compatible object from the subStep
      const stepForParent: SimulationStep = {
        step: currentSubStepIndex,
        nodes: currentSubStep.nodes,
        edges: currentSubStep.edges,
        scoredEdges: [],
        selectedEdge: null,
        generatedNode: currentSubStep.generatedNode,
        newEdges: currentSubStep.newEdges,
        stats: currentSubStep.stats,
      };
      onStepChange(stepForParent);
    }
  }, [currentSubStepIndex, subSteps, onStepChange]);

  const goToStep = useCallback((index: number) => {
    setCurrentSubStepIndex(Math.max(0, Math.min(index, subSteps.length - 1)));
    setIsPlaying(false);
  }, [subSteps.length]);

  const currentSubStep = subSteps[currentSubStepIndex];

  if (!isVisible) return null;

  return (
    <div className="simulation-panel">
      <div className="sim-header">
        <div className="sim-header-left">
          <h2>Simulation Playback</h2>
          <span className="sim-subtitle">
            Node {currentSubStepIndex} of {subSteps.length - 1}
          </span>
        </div>
        <button className="sim-close" onClick={onClose}>×</button>
      </div>

      {isLoading ? (
        <div className="sim-loading">
          <div className="spinner" />
          <span>Loading simulation data...</span>
        </div>
      ) : subSteps.length === 0 ? (
        <div className="sim-empty">
          <p>No simulation data found.</p>
          <p className="sim-hint">Run the simulation script first:</p>
          <code>npx tsx scripts/runDemoSimulation.ts</code>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="sim-stats">
            <div className="sim-stat">
              <span className="sim-stat-value">{currentSubStep?.stats.totalNodes || 0}</span>
              <span className="sim-stat-label">Nodes</span>
            </div>
            <div className="sim-stat">
              <span className="sim-stat-value">{currentSubStep?.stats.totalEdges || 0}</span>
              <span className="sim-stat-label">Edges</span>
            </div>
            <div className="sim-stat highlight">
              <span className="sim-stat-value">{currentSubStep?.stats.generatedNodes || 0}</span>
              <span className="sim-stat-label">Generated</span>
            </div>
          </div>

          {/* P-Score Section */}
          {currentSubStep?.selectedEdge && (
            <div className="sim-score-section">
              <div className="sim-score-header">
                <span className="sim-score-title">Edge Selection Score</span>
                <span className="sim-score-value">
                  {(currentSubStep.selectedEdge.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="sim-score-breakdown">
                <div className="sim-score-item">
                  <span className="sim-score-item-label">Semantic</span>
                  <span className="sim-score-item-value">
                    {(currentSubStep.selectedEdge.semanticDistance * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="sim-score-item">
                  <span className="sim-score-item-label">Novelty</span>
                  <span className="sim-score-item-value">
                    {(currentSubStep.selectedEdge.novelty * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="sim-score-item">
                  <span className="sim-score-item-label">Degree</span>
                  <span className="sim-score-item-value">
                    {(currentSubStep.selectedEdge.degreeSum * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="sim-score-item">
                  <span className="sim-score-item-label">Recency</span>
                  <span className="sim-score-item-value">
                    {(currentSubStep.selectedEdge.recency * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="sim-timeline">
            <div className="sim-timeline-track">
              {subSteps.map((_, i) => (
                <button
                  key={i}
                  className={`sim-timeline-dot ${i === currentSubStepIndex ? 'active' : ''} ${i < currentSubStepIndex ? 'completed' : ''}`}
                  onClick={() => goToStep(i)}
                  title={`Node ${i}`}
                />
              ))}
            </div>
            <div className="sim-timeline-labels">
              <span>Start</span>
              <span>Node {subSteps.length - 1}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="sim-controls">
            <button
              className="sim-btn"
              onClick={() => goToStep(0)}
              disabled={currentSubStepIndex === 0}
              title="Go to start"
            >
              ⏮
            </button>
            <button
              className="sim-btn"
              onClick={() => goToStep(currentSubStepIndex - 1)}
              disabled={currentSubStepIndex === 0}
              title="Previous node"
            >
              ◀
            </button>
            <button
              className="sim-btn play"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              className="sim-btn"
              onClick={() => goToStep(currentSubStepIndex + 1)}
              disabled={currentSubStepIndex >= subSteps.length - 1}
              title="Next node"
            >
              ▶
            </button>
            <button
              className="sim-btn"
              onClick={() => goToStep(subSteps.length - 1)}
              disabled={currentSubStepIndex >= subSteps.length - 1}
              title="Go to end"
            >
              ⏭
            </button>
          </div>

          {/* Speed Control */}
          <div className="sim-speed">
            <label>Speed:</label>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            >
              <option value={500}>Fast (0.5s)</option>
              <option value={1000}>Normal (1s)</option>
              <option value={2000}>Slow (2s)</option>
              <option value={4000}>Very Slow (4s)</option>
            </select>
          </div>

          {/* Current Node Details */}
          {currentSubStep && currentSubStepIndex > 0 && (
            <div className="sim-step-details">
              <h3>Node {currentSubStepIndex} Details</h3>

              {/* New Edges */}
              {currentSubStep.newEdges.length > 0 && (
                <div className="sim-selected-edge">
                  <span className="sim-detail-label">New Connections:</span>
                  {currentSubStep.newEdges.map((edge, i) => {
                    const sourceNode = currentSubStep.nodes.find(n => n.id === edge.source);
                    const targetNode = currentSubStep.nodes.find(n => n.id === edge.target);
                    return (
                      <div key={i} className="sim-edge-display">
                        <span className="sim-edge-node">
                          {sourceNode?.title.slice(0, 25) || edge.source}
                        </span>
                        <span className="sim-edge-arrow">↔</span>
                        <span className="sim-edge-node">
                          {targetNode?.title.slice(0, 25) || edge.target}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Generated Node */}
              {currentSubStep.generatedNode && (
                <div className="sim-generated-node">
                  <span className="sim-detail-label">
                    {currentSubStep.generatedNode.id.startsWith('unc-') ? 'Uncertainty:' : 'Generated:'}
                  </span>
                  <div className="sim-generated-title">
                    {currentSubStep.generatedNode.title}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
