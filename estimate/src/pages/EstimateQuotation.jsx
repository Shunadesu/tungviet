import { useState, useEffect, useMemo } from 'react'
import { FiPlus, FiSave, FiDownload, FiTrash2 } from 'react-icons/fi'
import EstimateTable from '../components/EstimateTable'
import EstimateFormModal from '../components/EstimateFormModal'
import SEO from '../components/SEO'
import Skeleton, { TableSkeleton, StatsSkeleton, RFPHeaderSkeleton } from '../components/Skeleton'

function EstimateQuotation() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/estimates')
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setItems(result.data.map((item) => ({ ...item, id: item._id })))
        }
      }
    } catch (error) {
      console.error('Failed to fetch estimates:', error)
    } finally {
      setLoading(false)
    }
  }

  const totals = useMemo(() => {
    const totalCost = items.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0)
    const totalDays = items.reduce((sum, item) => sum + (Number(item.estimatedDays) || 0), 0)
    return { totalCost, totalDays }
  }, [items])

  const handleAdd = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    const previousItems = items
    const next = items.filter((item) => item.id !== id)
    setItems(next)

    const isServerId = typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id)
    if (!isServerId) return

    try {
      const response = await fetch(`/api/estimates/item/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete on server')
      }
      setSaveMessage('Deleted successfully')
    } catch (error) {
      console.error('Delete on server failed, rolling back:', error)
      setSaveMessage(error.message || 'Failed to delete on server')
      setItems(previousItems)
    }
  }

  const handleSubmit = async (values) => {
    const isEdit = Boolean(values.id && /^[a-f0-9]{24}$/i.test(values.id))
    const previousItems = items
    setModalOpen(false)
    setEditingItem(null)

    try {
      if (isEdit) {
        const response = await fetch(`/api/estimates/item/${values.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })
        if (!response.ok) throw new Error('Failed to update on server')
        const result = await response.json()
        setItems((prev) =>
          prev.map((item) =>
            item.id === values.id ? { ...item, ...values, _id: result.data._id } : item
          )
        )
        setSaveMessage('Updated successfully')
      } else {
        const response = await fetch('/api/estimates/item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })
        if (!response.ok) throw new Error('Failed to create on server')
        const result = await response.json()
        setItems((prev) => [
          ...prev,
          { ...values, id: result.data._id, _id: result.data._id },
        ])
        setSaveMessage('Added successfully')
      }
    } catch (error) {
      console.error('Save on server failed:', error)
      setSaveMessage(error.message || 'Failed to save on server')
      setItems(previousItems)
    }
  }

  const handleReset = () => {
    fetchItems()
  }

  const handleClear = () => {
    setItems([])
  }

  const handleExport = () => {
    const lines = [
      'STT,Feature,Description,Complexity,Estimated Hours,Hourly Rate,Total Cost,Estimated Days',
      ...items.map((item, index) =>
        [
          index + 1,
          item.feature,
          item.description || '',
          item.complexity,
          item.estimatedHours,
          item.hourlyRate,
          item.totalCost,
          item.estimatedDays,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(','),
      ),
      `,,,,,,${totals.totalCost},${totals.totalDays}`,
    ]
    const csv = '\uFEFF' + lines.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'estimate-quotation.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleSaveAll = async () => {
    setSaving(true)
    setSaveMessage('')
    try {
      const response = await fetch('/api/estimates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save estimate')
      }

      setSaveMessage('Saved successfully')
      fetchItems()
    } catch (error) {
      setSaveMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <SEO
        title="Project Estimate & Quote"
        description="Professional cost and timeline estimation tool for Tung Viet website development project."
        keywords="estimate, quote, web development, project cost, RFP, Tung Viet"
        url="/estimate"
      />
      <header className="border-b border-primary-100 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary">Development Estimate Quotation</h1>
              <p className="text-sm text-gray-600">
                Estimate project cost and timeline by feature
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleAdd} className="btn btn-primary">
                <FiPlus className="mr-2" />
                Add Row
              </button>
              <button onClick={handleSaveAll} className="btn btn-secondary" disabled={saving || items.length === 0}>
                <FiSave className="mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={handleExport} className="btn btn-secondary">
                <FiDownload className="mr-2" />
                Export CSV
              </button>
              <button onClick={handleReset} className="btn btn-secondary">
                Load from Server
              </button>
              <button onClick={handleClear} className="btn btn-danger">
                <FiTrash2 className="mr-2" />
                Clear All
              </button>
            </div>
          </div>
          {saveMessage && (
            <p className="mt-2 text-xs text-gray-600">{saveMessage}</p>
          )}
        </div>
      </header>

      {/* RFP Header Section */}
      {loading ? (
        <RFPHeaderSkeleton />
      ) : (
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold mb-4">
            Redesign Tung Viet Website - Request for Proposal Requirements
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="https://www.komotac.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1 rounded-lg bg-white/10 p-4 hover:bg-white/20 transition-colors"
            >
              <span className="text-xs text-white/70">Reference Website</span>
              <span className="font-semibold">Komotac</span>
              <span className="text-xs text-white/80">www.komotac.com</span>
            </a>
            <a
              href="https://www.lawter.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1 rounded-lg bg-white/10 p-4 hover:bg-white/20 transition-colors"
            >
              <span className="text-xs text-white/70">Reference Website</span>
              <span className="font-semibold">Lawter</span>
              <span className="text-xs text-white/80">www.lawter.com</span>
            </a>
            <a
              href="https://vietwooltd.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1 rounded-lg bg-white/10 p-4 hover:bg-white/20 transition-colors"
            >
              <span className="text-xs text-white/70">Agency Project Reference</span>
              <span className="font-semibold">Vietwoo Ltd</span>
              <span className="text-xs text-white/80">vietwooltd.com</span>
            </a>
            <a
              href="https://tungviet.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1 rounded-lg bg-white/10 p-4 hover:bg-white/20 transition-colors"
            >
              <span className="text-xs text-white/70">Current Website</span>
              <span className="font-semibold">Tung Viet</span>
              <span className="text-xs text-white/80">tungviet.com</span>
            </a>
          </div>
        </div>
      </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="card p-4">
          {loading ? <TableSkeleton /> : <EstimateTable items={items} onEdit={handleEdit} onDelete={handleDelete} />}
        </div>

        {loading ? <StatsSkeleton /> : (
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="card p-4">
            <p className="text-sm text-gray-600">Total estimate rows</p>
            <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600">Estimated total cost</p>
            <p className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.totalCost)}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600">Estimated total days</p>
            <p className="text-2xl font-bold text-primary">{totals.totalDays} days</p>
          </div>
        </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Data is synced with the server. You can add, edit, or delete any row.
          </p>
        </div>
      </main>

      <EstimateFormModal
        open={modalOpen}
        initialValues={editingItem}
        onClose={() => {
          setModalOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default EstimateQuotation
