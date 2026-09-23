const DataTable = ({ columns, data, actions, selectable, selected, onSelectChange }) => {
  // Strip Quill-generated empty HTML tags so cells show blank instead of <p></p>
  const stripEmptyHtml = (val) => {
    if (typeof val !== 'string') return val;
    return val.replace(/<p>(\s*|<br\s*\/?>)*<\/p>/gi, '').trim() || val;
  };

  const toggleAll = () => {
    if (selected?.length === data.length) {
      onSelectChange?.([]);
    } else {
      onSelectChange?.(data.map((r) => r._id));
    }
  };

  const toggleOne = (id) => {
    if (selected?.includes(id)) {
      onSelectChange?.(selected.filter((x) => x !== id));
    } else {
      onSelectChange?.([...(selected || []), id]);
    }
  };

  const allChecked = data.length > 0 && selected?.length === data.length;
  const someChecked = selected?.length > 0 && selected.length < data.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="table-header">
            {selectable && (
              <th className="px-3 py-2 w-10">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = someChecked;
                  }}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
              </th>
            )}
            {columns.map((col, index) => (
              <th key={index} className="px-3 py-2 text-left">{col.header}</th>
            ))}
            {actions && <th className="px-3 py-2 text-right">Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row._id ?? rowIndex}
              className={`table-row ${selected?.includes(row._id) ? 'bg-primary/5' : ''}`}
            >
              {selectable && (
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected?.includes(row._id) || false}
                    onChange={() => toggleOne(row._id)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </td>
              )}
              {columns.map((col, colIndex) => {
                const raw = col.render ? col.render(row[col.accessor], row, rowIndex) : row[col.accessor];
                const display = typeof raw === 'string' && /<[a-z]/i.test(raw)
                  ? <span dangerouslySetInnerHTML={{ __html: stripEmptyHtml(raw) }} />
                  : stripEmptyHtml(raw);
                return (
                  <td key={colIndex} className="px-3 py-2 text-xs">
                    {display}
                  </td>
                );
              })}
              {actions && (
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    {actions(row, rowIndex)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
