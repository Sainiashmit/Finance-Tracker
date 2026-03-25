import { useState } from 'react';
import { FinanceProvider } from '../context/FinanceContext';
import { Header } from '../components/Header';
import { Dashboard } from '../components/Dashboard';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';

export default function DashboardPage() {
  const [editingTransaction, setEditingTransaction] = useState(null);

  return (
    <FinanceProvider>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <div className="left-panel">
            <Dashboard />
            <TransactionForm
              editingTransaction={editingTransaction}
              onCancelEdit={() => setEditingTransaction(null)}
            />
          </div>
          <div className="right-panel">
            <TransactionList
              onEdit={(tx) => setEditingTransaction(tx)}
              editingId={editingTransaction?.id}
            />
          </div>
        </main>
      </div>
    </FinanceProvider>
  );
}

