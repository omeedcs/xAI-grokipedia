// History Panel - Shows past actions with timestamps
import type { HistoryEntry } from '../types/knowledge';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onClose: () => void;
}

export default function HistoryPanel({ history, onClose }: HistoryPanelProps) {
  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatAction = (entry: HistoryEntry) => {
    switch (entry.action) {
      case 'create_node':
        return `Created "${(entry.newState as any)?.title || 'node'}"`;
      case 'delete_node':
        return `Deleted "${(entry.previousState as any)?.title || 'node'}"`;
      case 'update_node':
        return `Updated "${(entry.previousState as any)?.title || 'node'}"`;
      case 'create_edge':
        return 'Created connection';
      case 'delete_edge':
        return 'Removed connection';
      case 'annotate':
        return 'Added annotation';
      default:
        return entry.action;
    }
  };

  return (
    <div className="history-panel">
      <div className="panel-header">
        <h3>History</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="panel-content">
        {history.length === 0 ? (
          <p className="empty-message">No history yet</p>
        ) : (
          <ul className="history-list">
            {[...history].reverse().map((entry, i) => (
              <li key={entry.id || i} className="history-item">
                <span className="history-time">{formatTime(entry.timestamp)}</span>
                <span className="history-action">{formatAction(entry)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
