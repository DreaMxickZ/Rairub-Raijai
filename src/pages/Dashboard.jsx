import { useState, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTransactions } from '../hooks/useTransactions'
import TransactionModal from '../components/TransactionModal'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns'
import { th } from 'date-fns/locale'

const fmt = (n) => Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2 })

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const { transactions, loading, addTransaction, deleteTransaction, updateTransaction } = useTransactions(user?.id)
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const monthStart = useMemo(() => startOfMonth(parseISO(filterMonth + '-01')), [filterMonth])
  const monthEnd = useMemo(() => endOfMonth(parseISO(filterMonth + '-01')), [filterMonth])

  const monthlyTx = useMemo(() => transactions.filter(t => {
    const d = parseISO(t.date)
    return isWithinInterval(d, { start: monthStart, end: monthEnd })
  }), [transactions, monthStart, monthEnd])

  const filtered = useMemo(() => filterType === 'all' ? monthlyTx : monthlyTx.filter(t => t.type === filterType), [monthlyTx, filterType])

  const totalIncome = useMemo(() => monthlyTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0), [monthlyTx])
  const totalExpense = useMemo(() => monthlyTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0), [monthlyTx])
  const balance = totalIncome - totalExpense

  // Last 6 months chart data
  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i)
      const start = startOfMonth(d)
      const end = endOfMonth(d)
      const txs = transactions.filter(t => isWithinInterval(parseISO(t.date), { start, end }))
      return {
        month: format(d, 'MMM', { locale: th }),
        รายรับ: txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
        รายจ่าย: txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
      }
    })
  }, [transactions])

  const handleSave = async (data) => {
    if (editData) {
      await updateTransaction(editData.id, data)
    } else {
      await addTransaction(data)
    }
    setEditData(null)
  }

  const handleEdit = (tx) => {
    setEditData(tx)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    await deleteTransaction(id)
    setDeleteConfirm(null)
  }

  // Month navigation
  const prevMonth = () => {
    const d = subMonths(parseISO(filterMonth + '-01'), 1)
    setFilterMonth(format(d, 'yyyy-MM'))
  }
  const nextMonth = () => {
    const d = subMonths(parseISO(filterMonth + '-01'), -1)
    setFilterMonth(format(d, 'yyyy-MM'))
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">₿</span>
          <span className="logo-text">FinFlow</span>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active">📊 ภาพรวม</button>
        </nav>
        <div className="sidebar-user">
          <div className="user-email">{user?.email}</div>
          <button className="signout-btn" onClick={signOut}>ออกจากระบบ</button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="top-bar">
          <div className="month-nav">
            <button className="month-btn" onClick={prevMonth}>‹</button>
            <span className="month-label">
              {format(parseISO(filterMonth + '-01'), 'MMMM yyyy', { locale: th })}
            </span>
            <button className="month-btn" onClick={nextMonth}>›</button>
          </div>
          <button className="add-btn" onClick={() => { setEditData(null); setShowModal(true) }}>
            + เพิ่มรายการ
          </button>
        </div>

        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card income-card">
            <div className="card-label">รายรับ</div>
            <div className="card-amount">฿{fmt(totalIncome)}</div>
          </div>
          <div className="summary-card expense-card">
            <div className="card-label">รายจ่าย</div>
            <div className="card-amount">฿{fmt(totalExpense)}</div>
          </div>
          <div className={`summary-card balance-card ${balance >= 0 ? 'positive' : 'negative'}`}>
            <div className="card-label">คงเหลือ</div>
            <div className="card-amount">฿{fmt(balance)}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="chart-card">
          <h3 className="section-title">รายรับ-รายจ่าย 6 เดือนย้อนหลัง</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barGap={4}>
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value) => [`฿${fmt(value)}`]}
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
              />
              <Bar dataKey="รายรับ" fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="รายจ่าย" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction List */}
        <div className="tx-section">
          <div className="tx-header">
            <h3 className="section-title">รายการ</h3>
            <div className="filter-tabs">
              {['all', 'income', 'expense'].map(f => (
                <button
                  key={f}
                  className={`filter-tab ${filterType === f ? 'active' : ''}`}
                  onClick={() => setFilterType(f)}
                >
                  {f === 'all' ? 'ทั้งหมด' : f === 'income' ? 'รายรับ' : 'รายจ่าย'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="empty-state">กำลังโหลด...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">ไม่มีรายการในเดือนนี้</div>
          ) : (
            <div className="tx-list">
              {filtered.map(tx => (
                <div key={tx.id} className={`tx-item ${tx.type}`}>
                  <div className="tx-left">
                    <div className="tx-cat">{tx.category}</div>
                    <div className="tx-meta">
                      {tx.note && <span className="tx-note">{tx.note}</span>}
                      <span className="tx-date">{format(parseISO(tx.date), 'd MMM yyyy', { locale: th })}</span>
                    </div>
                  </div>
                  <div className="tx-right">
                    <div className={`tx-amount ${tx.type}`}>
                      {tx.type === 'income' ? '+' : '-'}฿{fmt(tx.amount)}
                    </div>
                    <div className="tx-actions">
                      <button className="action-btn edit" onClick={() => handleEdit(tx)}>✏️</button>
                      <button className="action-btn del" onClick={() => setDeleteConfirm(tx.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <TransactionModal
          onClose={() => { setShowModal(false); setEditData(null) }}
          onSave={handleSave}
          editData={editData}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-card" onClick={e => e.stopPropagation()}>
            <h3>ลบรายการนี้?</h3>
            <p>การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={() => setDeleteConfirm(null)}>ยกเลิก</button>
              <button className="delete-btn" onClick={() => handleDelete(deleteConfirm)}>ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
