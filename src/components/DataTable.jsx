import React from 'react';

/**
 * DataTable – renders a scrollable table on md+ and a card list on mobile.
 * Props:
 *  - columns: string[]
 *  - data: any[]
 *  - renderRow: (item, idx) => <tr>…</tr>        — used on desktop
 *  - renderCard: (item, idx) => JSX               — used on mobile (optional fallback)
 */
const DataTable = ({ columns, data, renderRow, renderCard }) => {
  const containerClass = "bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col";

  if (data.length === 0) {
    return (
      <div className={`${containerClass} justify-center items-center text-center p-12`}>
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-500">No records found.</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop / Tablet Table ── */}
      <div className={`hidden md:block ${containerClass}`}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} scope="col">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, idx) => renderRow(item, idx))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile Card List ── */}
      <div className="md:hidden space-y-3 pb-20">
        {data.map((item, idx) =>
          renderCard ? renderCard(item, idx) : (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-2">
              {columns.map((col, cidx) => {
                const keys = Object.keys(item);
                return (
                  <div key={cidx} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-500 mr-2 shrink-0">{col}</span>
                    <span className="text-gray-900 text-right truncate max-w-[55%]">
                      {String(item[keys[cidx]] ?? '-')}
                    </span>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </>
  );
};

export default DataTable;
