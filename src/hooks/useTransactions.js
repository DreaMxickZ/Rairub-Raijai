import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTransactions(userId) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTransactions = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setTransactions(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransaction = async (tx) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...tx, user_id: userId }])
      .select()
      .single()

    if (!error && data) {
      setTransactions(prev => [data, ...prev])
    }
    return { data, error }
  }

  const deleteTransaction = async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (!error) {
      setTransactions(prev => prev.filter(t => t.id !== id))
    }
    return { error }
  }

  const updateTransaction = async (id, updates) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setTransactions(prev => prev.map(t => t.id === id ? data : t))
    }
    return { data, error }
  }

  return { transactions, loading, error, addTransaction, deleteTransaction, updateTransaction, refetch: fetchTransactions }
}
