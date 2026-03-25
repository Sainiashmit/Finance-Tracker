/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import './TransactionForm.css';

export const TransactionForm = ({ editingTransaction, onCancelEdit }) => {
  const { addTransaction, updateTransaction } = useFinance();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Other');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!editingTransaction) return;

    setDescription(editingTransaction.description || '');
    setAmount(String(editingTransaction.amount ?? ''));
    setType(editingTransaction.type || 'expense');
    setCategory(editingTransaction.category || 'Other');
    setDate(editingTransaction.date || new Date().toISOString().slice(0, 10));
  }, [editingTransaction]);

  useEffect(() => {
    // Keep category compatible with the selected type.
    const options = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (category && options.includes(category)) return;
    setCategory('Other');
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editingTransaction) return;
    // Fresh create mode: reset to defaults.
    setDescription('');
    setAmount('');
    setType('expense');
    setCategory('Other');
    setDate(new Date().toISOString().slice(0, 10));
  }, [editingTransaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description || !amount) return;

    const payload = {
      description: String(description).trim(),
      amount: parseFloat(amount),
      type,
      date,
      category: category ? String(category).trim() : null,
    };

    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, payload);
      onCancelEdit?.();
      return;
    }

    await addTransaction(payload);
  };

  const categoryOptions = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="transaction-form glass-panel">
      <h3>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Groceries"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div className="form-group half-width">
            <label>Type</label>
            <div className="type-toggle">
              <button
                type="button"
                className={`toggle-btn expense ${type === 'expense' ? 'active' : ''}`}
                onClick={() => setType('expense')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`toggle-btn income ${type === 'income' ? 'active' : ''}`}
                onClick={() => setType('income')}
              >
                Income
              </button>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group half-width">
            <label htmlFor="date">Date</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="form-actions">
          {editingTransaction ? (
            <button type="button" className="secondary-btn" onClick={onCancelEdit}>
              Cancel
            </button>
          ) : null}
          <button type="submit" className="submit-btn">
            {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};
