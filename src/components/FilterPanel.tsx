// Filter Panel - Filter nodes by type, domain, confidence
interface FilterPanelProps {
  filter: {
    types: ('synthesis' | 'expansion' | 'import' | 'manual' | 'seed')[];
    domains: string[];
    minConfidence: number;
    searchQuery: string;
  };
  onFilterChange: (filter: FilterPanelProps['filter']) => void;
  availableDomains: string[];
  onClose: () => void;
}

const NODE_TYPES = [
  { value: 'synthesis', label: 'Synthesized' },
  { value: 'expansion', label: 'Expanded' },
  { value: 'import', label: 'Imported' },
  { value: 'manual', label: 'Manual' },
  { value: 'seed', label: 'Seed' },
] as const;

export default function FilterPanel({ filter, onFilterChange, availableDomains, onClose }: FilterPanelProps) {
  const toggleType = (type: typeof NODE_TYPES[number]['value']) => {
    const newTypes = filter.types.includes(type)
      ? filter.types.filter(t => t !== type)
      : [...filter.types, type];
    onFilterChange({ ...filter, types: newTypes });
  };

  const toggleDomain = (domain: string) => {
    const newDomains = filter.domains.includes(domain)
      ? filter.domains.filter(d => d !== domain)
      : [...filter.domains, domain];
    onFilterChange({ ...filter, domains: newDomains });
  };

  const clearFilters = () => {
    onFilterChange({
      types: [],
      domains: [],
      minConfidence: 0,
      searchQuery: '',
    });
  };

  const hasActiveFilters = filter.types.length > 0 || filter.domains.length > 0 || filter.minConfidence > 0;

  return (
    <div className="filter-panel">
      <div className="panel-header">
        <h3>Filters</h3>
        <div className="panel-actions">
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>clear</button>
          )}
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
      </div>
      
      <div className="panel-content">
        {/* Node Type Filter */}
        <div className="filter-section">
          <h4>Node Type</h4>
          <div className="filter-chips">
            {NODE_TYPES.map(type => (
              <button
                key={type.value}
                className={`filter-chip ${filter.types.includes(type.value) ? 'active' : ''}`}
                onClick={() => toggleType(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Domain Filter */}
        {availableDomains.length > 0 && (
          <div className="filter-section">
            <h4>Domain</h4>
            <div className="filter-chips">
              {availableDomains.map(domain => (
                <button
                  key={domain}
                  className={`filter-chip ${filter.domains.includes(domain) ? 'active' : ''}`}
                  onClick={() => toggleDomain(domain)}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Confidence Filter */}
        <div className="filter-section">
          <h4>Min Confidence: {Math.round(filter.minConfidence * 100)}%</h4>
          <input
            type="range"
            min="0"
            max="100"
            value={filter.minConfidence * 100}
            onChange={(e) => onFilterChange({ ...filter, minConfidence: parseInt(e.target.value) / 100 })}
            className="confidence-slider"
          />
        </div>
      </div>
    </div>
  );
}
