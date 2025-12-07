// Annotation Panel - Add notes to nodes
import { useState } from 'react';
import type { KnowledgeNode, Annotation } from '../types/knowledge';

interface AnnotationPanelProps {
  node: KnowledgeNode;
  onAddAnnotation: (annotation: Omit<Annotation, 'id' | 'nodeId' | 'createdAt'>) => void;
  onClose: () => void;
}

export default function AnnotationPanel({ node, onAddAnnotation, onClose }: AnnotationPanelProps) {
  const [newNote, setNewNote] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [highlightStart, setHighlightStart] = useState(0);
  const [highlightEnd, setHighlightEnd] = useState(0);

  // Called from parent when text is selected in sidebar
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleTextSelection = (text: string) => {
    setSelectedText(text);
    const start = node.content.indexOf(text);
    if (start >= 0) {
      setHighlightStart(start);
      setHighlightEnd(start + text.length);
    }
  };

  const handleSubmit = () => {
    if (!newNote.trim()) return;
    
    onAddAnnotation({
      text: selectedText,
      highlightStart,
      highlightEnd,
      note: newNote.trim(),
    });
    
    setNewNote('');
    setSelectedText('');
    setHighlightStart(0);
    setHighlightEnd(0);
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="annotation-panel">
      <div className="panel-header">
        <h3>Annotations</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="panel-content">
        {/* Add new annotation */}
        <div className="add-annotation">
          <p className="annotation-help">
            Select text in the article to annotate, then add your note.
          </p>
          
          {selectedText && (
            <div className="selected-text">
              <span className="label">Selected:</span>
              <span className="text">"{selectedText.slice(0, 100)}{selectedText.length > 100 ? '...' : ''}"</span>
            </div>
          )}
          
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add your note..."
            rows={3}
          />
          
          <button 
            className="add-note-btn"
            onClick={handleSubmit}
            disabled={!newNote.trim()}
          >
            add note
          </button>
        </div>

        {/* Existing annotations */}
        {node.annotations.length > 0 && (
          <div className="annotations-list">
            <h4>Notes ({node.annotations.length})</h4>
            {node.annotations.map(ann => (
              <div key={ann.id} className="annotation-item">
                {ann.text && (
                  <div className="annotation-highlight">
                    "{ann.text.slice(0, 80)}{ann.text.length > 80 ? '...' : ''}"
                  </div>
                )}
                <div className="annotation-note">{ann.note}</div>
                <div className="annotation-date">{formatDate(ann.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
