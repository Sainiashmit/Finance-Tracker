/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const FinanceContext = createContext(null);

export const useFinance = () => useContext(FinanceContext);

function isoDate(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function startOfMonth(d) {
  const dt = new Date(d);
  return new Date(dt.getFullYear(), dt.getMonth(), 1);
}

function computeRange(preset) {
  const now = new Date();
  const to = isoDate(now);

  if (preset === 'all') return { from: '', to: '' };

  if (preset === 'last30') {
    const from = isoDate(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
    return { from, to };
  }

  // Default: thisMonth
  const from = isoDate(startOfMonth(now));
  return { from, to };
}

export const FinanceProvider = ({ children }) => {
  const { token } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(() => {
    const { from, to } = computeRange('thisMonth');
    return {
      rangePreset: 'thisMonth',
      from,
      to,
      type: 'all', // all | income | expense
      category: '',
      q: '',
    };
  });
  const [error, setError] = useState('');

  const fetchTransactions = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      if (filters.type !== 'all') params.set('type', filters.type);
      if (filters.category) params.set('category', filters.category);
      if (filters.q) params.set('q', filters.q);

      const qs = params.toString();
      const res = await fetch(`/api/transactions${qs ? `?${qs}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error || 'Failed to load transactions');
      }

      const data = await res.json();
      setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
    } catch (e) {
      setError(e?.message || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const setRangePreset = useCallback((preset) => {
    const range = computeRange(preset);
    setFilters((prev) => ({ ...prev, rangePreset: preset, from: range.from, to: range.to }));
  }, []);

  const addTransaction = useCallback(
    async (transaction) => {
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transaction),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error || 'Failed to add transaction');
      }

      await fetchTransactions();
    },
    [token, fetchTransactions]
  );

  const updateTransaction = useCallback(
    async (id, transaction) => {
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transaction),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error || 'Failed to update transaction');
      }

      await fetchTransactions();
    },
    [token, fetchTransactions]
  );

  const deleteTransaction = useCallback(
    async (id) => {
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error || 'Failed to delete transaction');
      }

      await fetchTransactions();
    },
    [token, fetchTransactions]
  );

  const totals = useMemo(() => {
    const next = transactions.reduce(
      (acc, curr) => {
        if (curr.type === 'income') acc.income += Number(curr.amount || 0);
        if (curr.type === 'expense') acc.expense += Number(curr.amount || 0);
        return acc;
      },
      { income: 0, expense: 0 }
    );
    next.balance = next.income - next.expense;
    return next;
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const map = {};
    for (const t of transactions) {
      if (t.type !== 'expense') continue;
      const key = t.category || 'Other';
      map[key] = (map[key] || 0) + Number(t.amount || 0);
    }
    const rows = Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
    return rows;
  }, [transactions]);

  const value = useMemo(
    () => ({
      transactions,
      loading,
      error,
      filters,
      setFilters,
      setRangePreset,
      totals,
      expenseByCategory,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      refetch: fetchTransactions,
    }),
    [
      transactions,
      loading,
      error,
      filters,
      setFilters,
      setRangePreset,
      totals,
      expenseByCategory,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      fetchTransactions,
    ]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};
