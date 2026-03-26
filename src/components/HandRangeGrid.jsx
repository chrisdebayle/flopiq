import { Fragment } from 'react';
import { RANKS_ORDER, ACTION_LABELS } from '../data/handCharts.js';

function HandRangeGrid({ chart, highlightCell = null }) {
  const labels = RANKS_ORDER.map(r => r === 'T' ? '10' : r);

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `36px repeat(13, 1fr)`,
        gap: 1,
        fontSize: 11,
        fontWeight: 600,
        maxWidth: 520,
      }}>
        {/* Header row */}
        <div />
        {labels.map((l, i) => (
          <div key={`h-${i}`} style={{
            textAlign: 'center', padding: '4px 0', color: '#ccc', fontSize: 10,
          }}>{l}</div>
        ))}

        {/* Grid rows */}
        {chart.map((row, ri) => (
          <Fragment key={`row-${ri}`}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ccc', fontSize: 10,
            }}>{labels[ri]}</div>
            {row.map((action, ci) => {
              const isHighlight = highlightCell && highlightCell.row === ri && highlightCell.col === ci;
              const info = ACTION_LABELS[action];
              // Determine hand notation
              let hand;
              if (ri === ci) hand = `${RANKS_ORDER[ri]}${RANKS_ORDER[ri]}`;
              else if (ri < ci) hand = `${RANKS_ORDER[ri]}${RANKS_ORDER[ci]}s`;
              else hand = `${RANKS_ORDER[ci]}${RANKS_ORDER[ri]}o`;

              return (
                <div
                  key={`${ri}-${ci}`}
                  title={`${hand}: ${info.description}`}
                  style={{
                    background: info.color,
                    color: '#fff',
                    textAlign: 'center',
                    padding: '3px 1px',
                    borderRadius: 3,
                    fontSize: 9,
                    lineHeight: 1.3,
                    border: isHighlight ? '2px solid #f39c12' : '1px solid rgba(0,0,0,0.1)',
                    boxShadow: isHighlight ? '0 0 8px rgba(243,156,18,0.6)' : 'none',
                    cursor: 'default',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {hand}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', fontSize: 11 }}>
        {Object.entries(ACTION_LABELS).map(([key, info]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 12, height: 12, borderRadius: 2, background: info.color,
            }} />
            <span style={{ color: '#ccc' }}>{info.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HandRangeGrid;
