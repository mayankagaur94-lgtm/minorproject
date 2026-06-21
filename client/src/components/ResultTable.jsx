import React from 'react';

const flattenObject = (obj, prefix = '') => {
  let result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Exclude mongodb internal fields from pollution if they are not useful, but keep _id if needed
      if (key === '__v') continue;
      
      const newKey = prefix ? `${prefix}.${key}` : key;
      const val = obj[key];
      
      if (val === null || val === undefined) {
        result[newKey] = '-';
      } else if (typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        if (val.$oid) {
          result[newKey] = val.$oid;
        } else if (val.$date) {
          result[newKey] = new Date(val.$date).toLocaleDateString();
        } else {
          Object.assign(result, flattenObject(val, newKey));
        }
      } else if (Array.isArray(val)) {
        if (val.length === 0) {
          result[newKey] = '[]';
        } else {
          // If it is an array of objects, flatten them or join them
          result[newKey] = val.map(item => {
            if (typeof item === 'object' && item !== null) {
              return JSON.stringify(item);
            }
            return item.toString();
          }).join(', ');
        }
      } else {
        result[newKey] = val;
      }
    }
  }
  return result;
};

const ResultTable = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  // Flatten all rows to handle nested join data
  const flattenedData = data.map(row => flattenObject(row));
  
  // Collect all unique columns across all rows (in case some rows lack some optional fields)
  const columns = Array.from(
    new Set(flattenedData.reduce((acc, row) => acc.concat(Object.keys(row)), []))
  );

  return (
    <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-white/5 sticky top-0 backdrop-blur-md z-10">
          <tr>
            {columns.map(col => (
              <th key={col} className="px-4 py-2.5 font-semibold border-b border-white/10 uppercase tracking-tight opacity-70 whitespace-nowrap">
                {col.replace(/_/g, ' ').replace(/\./g, ' ➔ ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {flattenedData.map((row, i) => (
            <tr key={i} className="hover:bg-white/5 transition-colors">
              {columns.map(col => {
                const cellValue = row[col];
                return (
                  <td key={col} className="px-4 py-3 whitespace-nowrap text-white/80 max-w-xs truncate" title={cellValue !== undefined ? cellValue.toString() : ''}>
                    {cellValue !== undefined && cellValue !== null ? cellValue.toString() : '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
