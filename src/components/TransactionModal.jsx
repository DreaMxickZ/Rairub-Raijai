import { useState, useEffect } from 'react'

const INCOME_CATEGORIES = ['เงินเดือน', 'โบนัส', 'ค่าจ้างพิเศษ', 'การลงทุน', 'ให้เช่า', 'ขายของ', 'อื่นๆ']
const EXPENSE_CATEGORIES = ['อาหาร', 'เดินทาง', 'ที่พัก', 'สาธารณูปโภค', 'ช้อปปิ้ง', 'บันเทิง', 'สุขภาพ', 'การศึกษา', 'ประกัน', 'ออม/ลงทุน', 'อื่นๆ']

export default function TransactionModal({ onClose, onSave, editData }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editData) {
      setType(editData.type)
      setAmount(String(editData.amount))
      setCategory(editData.category)
      setNote(editData.note || '')
      setDate(editData.date)
    }
  }, [editData])

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  useEffect(() => {
    if (!editData) setCategory('')
  }, [type, editData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!category) return
    setLoading(true)
    await onSave({ type, amount: parseFloat(amount), category, note, date })
    setLoading(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editData ? 'แก้ไขรายการ' : 'เพิ่มรายการ'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="type-toggle">
          <button
            className={`type-btn expense-btn ${type === 'expense' ? 'active' : ''}`}
            onClick={() => setType('expense')}
            type="button"
          >
            💸 รายจ่าย
          </button>
          <button
            className={`type-btn income-btn ${type === 'income' ? 'active' : ''}`}
            onClick={() => setType('income')}
            type="button"
          >
            💰 รายรับ
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field-group">
            <label className="field-label">จำนวนเงิน (บาท)</label>
            <input
              type="number"
              className="field-input amount-input"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">หมวดหมู่</label>
            <div className="category-grid">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`cat-chip ${category === cat ? 'selected' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">วันที่</label>
            <input
              type="date"
              className="field-input"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">หมายเหตุ (ถ้ามี)</label>
            <input
              type="text"
              className="field-input"
              placeholder="รายละเอียดเพิ่มเติม..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <button type="submit" className="save-btn" disabled={loading || !category}>
            {loading ? 'กำลังบันทึก...' : editData ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}
          </button>
        </form>
      </div>
    </div>
  )
}
