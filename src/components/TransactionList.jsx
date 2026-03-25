import { useFinance } from '../context/FinanceContext';
import './TransactionList.css';

export const TransactionList = ({ onEdit, editingId }) => {
  const { transactions, deleteTransaction, loading, error } = useFinance();

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
    } catch {
      // errors are surfaced via FinanceContext.error on reload
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', options);
  };

  return (
    <div className="transaction-list-container glass-panel">
      <h3>Transactions</h3>

      {loading ? <div className="empty-state">Loading...</div> : null}
      {error ? <div className="error-banner">{error}</div> : null}
      
      {!loading && transactions.length === 0 ? (
        <div className="empty-state">
          <p>No transactions yet.</p>
          <span>Add one above to get started!</span>
        </div>
      ) : (
        <ul className="transaction-list">
          {transactions.map((transaction) => (
            <li 
              key={transaction.id} 
              className={`transaction-item ${transaction.type} ${editingId === transaction.id ? 'active' : ''}`}
            >
              <div className="transaction-info">
                <span className="description">{transaction.description}</span>
                {transaction.category ? (
                  <span className="category-badge">{transaction.category}</span>
                ) : null}
                <span className="date">{formatDate(transaction.date)}</span>
              </div>
              
              <div className="transaction-actions">
                <span className={`amount ${transaction.type}-text`}>
                  {transaction.type === 'expense' ? '-' : '+'}
                  {formatCurrency(transaction.amount)}
                </span>
                <button
                  type="button"
                  className="edit-btn"
                  onClick={() => onEdit?.(transaction)}
                  aria-label="Edit transaction"
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(transaction.id)}
                  aria-label="Delete transaction"
                  type="button"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
