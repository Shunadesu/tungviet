import { useState, useEffect, useMemo } from 'react'
import { FiPlus, FiSave, FiDownload, FiTrash2 } from 'react-icons/fi'
import EstimateTable from '../components/EstimateTable'
import EstimateFormModal from '../components/EstimateFormModal'
import Skeleton, { TableSkeleton, StatsSkeleton, RFPHeaderSkeleton } from '../components/Skeleton'

const STORAGE_KEY = 'zuna-estimate-items'
const DEFAULT_ITEMS = [
  {
    id: 'init-frontend-pages',
    feature: 'Build basic client pages',
    description: 'Home, ProductList, ProductDetail, Cart, Checkout, OrderHistory',
    complexity: 'Medium',
    estimatedHours: 40,
    hourlyRate: 500000,
    totalCost: 20000000,
    estimatedDays: 5,
  },
  {
    id: 'init-admin-dashboard',
    feature: 'Build admin dashboard',
    description: 'Dashboard, product management, categories, orders',
    complexity: 'High',
    estimatedHours: 56,
    hourlyRate: 550000,
    totalCost: 30800000,
    estimatedDays: 7,
  },
  {
    id: 'backend-api',
    feature: 'Build backend API',
    description: 'Auth, products, categories, orders with MongoDB',
    complexity: 'High',
    estimatedHours: 48,
    hourlyRate: 500000,
    totalCost: 24000000,
    estimatedDays: 6,
  },
  {
    id: 'testing-deploy',
    feature: 'Testing & deployment',
    description: 'Integration testing, bug fixing, deployment guide',
    complexity: 'Medium',
    estimatedHours: 24,
    hourlyRate: 450000,
    totalCost: 10800000,
    estimatedDays: 3,
  },
]

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

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
        if (result.data && result.data.length > 0) {
          setItems(result.data.map((item) => ({ ...item, id: item._id })))
        }
      }
    } catch (error) {
      console.error('Failed to fetch estimates:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, loading])

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

  const handleDelete = (id) => {
    const next = items.filter((item) => item.id !== id)
    setItems(next)
  }

  const handleSubmit = (values) => {
    setItems((prev) => {
      if (values.id) {
        return prev.map((item) => (item.id === values.id ? { ...item, ...values } : item))
      }
      return [...prev, { ...values, id: generateId() }]
    })
    setModalOpen(false)
    setEditingItem(null)
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

  const handleSaveToServer = async () => {
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

      setSaveMessage('Saved to server successfully')
      fetchItems()
    } catch (error) {
      setSaveMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-50">
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
              <button onClick={handleSaveToServer} className="btn btn-secondary" disabled={saving || items.length === 0}>
                <FiSave className="mr-2" />
                {saving ? 'Saving...' : 'Save to Server'}
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
            Data is saved in your browser. You can add, edit, or delete any row.
          </p>
          <button onClick={() => localStorage.removeItem(STORAGE_KEY)} className="text-xs text-gray-500 underline">
            Clear saved data
          </button>
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
