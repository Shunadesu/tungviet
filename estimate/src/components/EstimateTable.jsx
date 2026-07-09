import { FiEdit2, FiTrash2 } from 'react-icons/fi'

const COMPLEXITY_OPTIONS = [
  { value: 'Low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'Medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'High', label: 'High', color: 'bg-red-100 text-red-800' },
]

function formatCurrency(value) {
  const safe = Number(value) || 0
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(safe)
}

function EstimateTable({ items, onEdit, onDelete }) {
  const totalCost = items.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0)
  const totalDays = items.reduce((sum, item) => sum + (Number(item.estimatedDays) || 0), 0)
  const totalHours = items.reduce((sum, item) => sum + (Number(item.estimatedHours) || 0), 0)

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-primary-50">
          <tr>
            <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-12">STT</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Feature</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Requirement</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Complexity</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Hours</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Days</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total Cost</th>
            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-20">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-2 py-3 text-center text-sm font-medium text-gray-900">{item.stt || index + 1}</td>
              <td className="px-3 py-3 text-sm font-medium text-gray-900">{item.feature}</td>
              <td className="px-3 py-3 text-sm text-gray-600 max-w-xs min-w-[200px]">
                {item.requirement ? (
                  <div
                    className="prose prose-sm max-w-none ql-content"
                    dangerouslySetInnerHTML={{ __html: item.requirement }}
                  />
                ) : (
                  '-'
                )}
              </td>
              <td className="px-3 py-3 text-sm text-gray-600 max-w-xs min-w-[200px]">
                {item.description ? (
                  <div
                    className="prose prose-sm max-w-none ql-content"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                ) : (
                  '-'
                )}
              </td>
              <td className="px-3 py-3">
                {(() => {
                  const option = COMPLEXITY_OPTIONS.find((opt) => opt.value === item.complexity) || COMPLEXITY_OPTIONS[1]
                  return (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${option.color}`}>
                      {option.label}
                    </span>
                  )
                })()}
              </td>
              <td className="px-3 py-3 text-sm text-right text-gray-700">{item.estimatedHours}</td>
              <td className="px-3 py-3 text-sm text-right text-gray-700">{item.estimatedDays}</td>
              <td className="px-3 py-3 text-sm text-right font-medium text-gray-900">{formatCurrency(item.totalCost)}</td>
              <td className="px-3 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-primary hover:bg-primary-50"
                    title="Edit"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={9} className="px-3 py-8 text-center text-sm text-gray-500">
                No estimate rows yet. Click "Add Row" to start.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="bg-primary-50/60">
            <td colSpan={5} className="px-3 py-3 text-right text-sm font-semibold text-gray-900">
              Total
            </td>
            <td className="px-3 py-3 text-right text-sm font-bold text-primary">{totalHours}</td>
            <td className="px-3 py-3 text-right text-sm font-bold text-primary">{totalDays}</td>
            <td className="px-3 py-3 text-right text-sm font-bold text-primary">{formatCurrency(totalCost)}</td>
            <td className="px-3 py-3" />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default EstimateTable
