import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const COMPLEXITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
]

const EMPTY_FORM = {
  feature: '',
  requirement: '',
  description: '',
  complexity: 'Medium',
  estimatedHours: '',
  hourlyRate: '',
  totalCost: '',
  estimatedDays: '',
}

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'],
  ],
}

function EstimateFormModal({ open, initialValues, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [quillRequirement, setQuillRequirement] = useState('')
  const [quillDescription, setQuillDescription] = useState('')
  const isEdit = Boolean(initialValues?.id)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM)
      setQuillRequirement('')
      setQuillDescription('')
      return
    }
    if (initialValues) {
      setForm({
        feature: initialValues.feature || '',
        requirement: initialValues.requirement || '',
        description: initialValues.description || '',
        complexity: initialValues.complexity || 'Medium',
        estimatedHours: initialValues.estimatedHours ?? '',
        hourlyRate: initialValues.hourlyRate ?? '',
        totalCost: initialValues.totalCost ?? '',
        estimatedDays: initialValues.estimatedDays ?? '',
      })
      setQuillRequirement(initialValues.requirement || '')
      setQuillDescription(initialValues.description || '')
    }
  }, [open, initialValues])

  if (!open) {
    return null
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.feature.trim()) {
      return
    }
    onSubmit({
      id: initialValues?.id,
      stt: initialValues?.stt || 0,
      feature: form.feature.trim(),
      requirement: quillRequirement,
      description: quillDescription,
      complexity: form.complexity,
      estimatedHours: Number(form.estimatedHours) || 0,
      hourlyRate: Number(form.hourlyRate) || 0,
      totalCost: Number(form.totalCost) || 0,
      estimatedDays: Number(form.estimatedDays) || 0,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900">{isEdit ? 'Edit estimate row' : 'Add estimate row'}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Feature</label>
            <input
              name="feature"
              value={form.feature}
              onChange={handleChange}
              className="mt-1 input"
              placeholder="e.g. Estimate quotation page"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirement</label>
            <ReactQuill
              theme="snow"
              value={quillRequirement}
              onChange={setQuillRequirement}
              modules={quillModules}
              className="bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <ReactQuill
              theme="snow"
              value={quillDescription}
              onChange={setQuillDescription}
              modules={quillModules}
              className="bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Complexity</label>
            <select name="complexity" value={form.complexity} onChange={handleChange} className="mt-1 input">
              {COMPLEXITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Cost (VND)</label>
              <input
                type="number"
                min="0"
                name="totalCost"
                value={form.totalCost}
                onChange={handleChange}
                className="mt-1 input"
                placeholder="e.g. 10000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Days</label>
              <input
                type="number"
                min="0"
                name="estimatedDays"
                value={form.estimatedDays}
                onChange={handleChange}
                className="mt-1 input"
                placeholder="e.g. 5"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save Changes' : 'Add Row'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EstimateFormModal
