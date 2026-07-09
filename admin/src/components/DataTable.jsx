const DataTable = ({ columns, data, actions }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="table-header">
            {columns.map((col, index) => (
              <th key={index} className="px-3 py-2 text-left">{col.header}</th>
            ))}
            {actions && <th className="px-3 py-2 text-right">Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="table-row">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-3 py-2 text-xs">
                  {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                </td>
              ))}
              {actions && (
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    {actions(row)}
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
