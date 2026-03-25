import { useEffect, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ALL_CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import './Dashboard.css';

export const Dashboard = () => {
  const {
    totals,
    filters,
    setFilters,
    setRangePreset,
    expenseByCategory,
    loading,
    error,
  } = useFinance();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const topCategories = useMemo(() => expenseByCategory.slice(0, 6), [expenseByCategory]);
  const maxCat = useMemo(
    () => Math.max(1, ...topCategories.map((c) => c.amount)),
    [topCategories]
  );

  useEffect(() => {
    const allowed =
      filters.type === 'income'
        ? INCOME_CATEGORIES
        : filters.type === 'expense'
          ? EXPENSE_CATEGORIES
          : ALL_CATEGORIES;
    if (filters.category && !allowed.includes(filters.category)) {
      setFilters((prev) => ({ ...prev, category: '' }));
    }
  }, [filters.type]); // eslint-disable-line react-hooks/exhaustive-deps

  const rangeButton = (preset, label) => (
    <button
      type="button"
      className={`range-btn ${filters.rangePreset === preset ? 'active' : ''}`}
      onClick={() => setRangePreset(preset)}
    >
      {label}
    </button>
  );

  return (
    <div className="dashboard">
      <div className="summary-card glass-panel balance-card">
        <h3>Total Balance</h3>
        <p className={`amount ${totals.balance >= 0 ? '' : 'negative'}`}>
          {formatCurrency(totals.balance)}
        </p>
        <div className="balance-subtext">
          {totals.balance >= 0 ? 'You’re up for the month.' : 'Spending has been heavier than income.'}
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card glass-panel income-card">
          <div className="card-header">
            <div className="icon income-icon">↓</div>
            <h3>Income</h3>
          </div>
          <p className="amount success-text">{formatCurrency(totals.income)}</p>
        </div>

        <div className="summary-card glass-panel expense-card">
          <div className="card-header">
            <div className="icon expense-icon">↑</div>
            <h3>Expenses</h3>
          </div>
          <p className="amount danger-text">{formatCurrency(totals.expense)}</p>
        </div>
      </div>

      <div className="insights-grid">
        <div className="glass-panel insight-card cashflow-card">
          <div className="insight-head">
            <h3>Cashflow Snapshot</h3>
            <span className="chip">{loading ? 'Loading...' : 'Live'}</span>
          </div>
          <div className="cashflow-bars">
            <div className="bar-row">
              <div className="bar-label">Income</div>
              <div className="bar-track">
                <div
                  className="bar-fill income-fill"
                  style={{
                    width: `${
                      Math.round(
                        (totals.income / Math.max(totals.income + totals.expense, 1)) * 100
                      )
                    }%`,
                  }}
                />
              </div>
              <div className="bar-value">{formatCurrency(totals.income)}</div>
            </div>
            <div className="bar-row">
              <div className="bar-label">Expenses</div>
              <div className="bar-track">
                <div
                  className="bar-fill expense-fill"
                  style={{
                    width: `${
                      Math.round(
                        (totals.expense / Math.max(totals.income + totals.expense, 1)) * 100
                      )
                    }%`,
                  }}
                />
              </div>
              <div className="bar-value">{formatCurrency(totals.expense)}</div>
            </div>
          </div>
        </div>

        <div className="glass-panel insight-card category-card">
          <div className="insight-head">
            <h3>Top Expense Categories</h3>
            <span className="chip">Top {topCategories.length}</span>
          </div>

          {error ? <div className="error-banner">{error}</div> : null}

          {topCategories.length === 0 ? (
            <div className="empty-soft">Add an expense to see insights.</div>
          ) : (
            <div className="category-list">
              {topCategories.map((c) => (
                <div key={c.category} className="category-row">
                  <div className="category-name">{c.category}</div>
                  <div className="category-track">
                    <div
                      className="category-fill"
                      style={{ width: `${Math.round((c.amount / maxCat) * 100)}%` }}
                    />
                  </div>
                  <div className="category-amount">{formatCurrency(c.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel filters-card">
        <div className="filters-head">
          <h3>Filters</h3>
          <span className="chip">Search + category</span>
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label>Range</label>
            <div className="range-buttons">
              {rangeButton('thisMonth', 'This month')}
              {rangeButton('last30', 'Last 30')}
              {rangeButton('all', 'All')}
            </div>
          </div>

          <div className="filter-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All</option>
              {(filters.type === 'income' ? INCOME_CATEGORIES : filters.type === 'expense' ? EXPENSE_CATEGORIES : ALL_CATEGORIES).map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="filter-group">
            <label>Search</label>
            <input
              value={filters.q}
              onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
              placeholder="Description or category..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
