import React from 'react';

const ResultTable = ({ data }) => {
  if (!data || data.length === 0) return null;
  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto max-h-[400px]">
      <table className="w-full text-left text-xs">
        <thead className="bg-white/5 sticky top-0">
          <tr>
            {columns.map(col => (
              <th key={col} className="px-4 py-2 font-semibold border-b border-border/50 uppercase tracking-tight opacity-70">
                {col.replace('_', ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-white/5 transition-colors">
              {columns.map(col => (
                <td key={col} className="px-4 py-3 whitespace-nowrap">
                  {row[col] !== null ? row[col].toString() : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
