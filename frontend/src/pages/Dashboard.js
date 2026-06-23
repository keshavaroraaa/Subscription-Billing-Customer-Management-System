import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../api/config';
import '../styles/dashboard.css';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setError('');
    try {
      const response = await fetch(apiUrl('/api/dashboard'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message);
        return;
      }

      setData(result);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="empty-state"><p>Loading dashboard...</p></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <div className="empty-state"><p>No data available</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Customers</h3>
          <div className="stat-value">{data.totalCustomers}</div>
        </div>
        <div className="stat-card">
          <h3>Active Subscriptions</h3>
          <div className="stat-value">{data.activeSubscriptions}</div>
        </div>
        <div className="stat-card">
          <h3>Expired Subscriptions</h3>
          <div className="stat-value">{data.expiredSubscriptions}</div>
        </div>
        <div className="stat-card revenue">
          <h3>Monthly Revenue</h3>
          <div className="stat-value">₹{parseFloat(data.monthlyRevenue).toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <div className="stat-value">{data.pendingPayments}</div>
          <div className="stat-sub">₹{parseFloat(data.pendingAmount).toFixed(2)}</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Invoices</h2>
        {data.recentInvoices.length === 0 ? (
          <div className="empty-state"><p>No recent invoices</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.invoice_number}</td>
                  <td>{inv.customer_name}</td>
                  <td>{inv.plan_name}</td>
                  <td>₹{parseFloat(inv.total_amount).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${inv.payment_status}`}>
                      {inv.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
