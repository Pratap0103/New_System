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
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 px-6 py-12 text-center text-sm text-gray-500 shadow-sm">
        No records found.
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop / Tablet Table ── */}
      <div className="hidden md:block overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="data-table">
          <thead className="bg-gray-50">
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

      {/* ── Mobile Card List ── */}
      <div className="md:hidden space-y-3">
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
