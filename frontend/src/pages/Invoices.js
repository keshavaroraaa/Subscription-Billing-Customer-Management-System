import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchInvoices();
  }, [paymentFilter]);

  async function fetchInvoices() {
    setError('');
    try {
      let url = 'http://localhost:5000/api/invoices?';
      if (paymentFilter) url += `payment_status=${paymentFilter}&`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setInvoices(data);
    } catch (err) {
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }

  async function markPaid(id) {
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/invoices/${id}/mark-paid`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchInvoices();
      }
    } catch (err) {
      setError('Failed to update invoice');
    }
  }

  async function markUnpaid(id) {
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/invoices/${id}/mark-unpaid`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchInvoices();
      }
    } catch (err) {
      setError('Failed to update invoice');
    }
  }

  if (loading) return <div className="empty-state"><p>Loading invoices...</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Invoices</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-bar">
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
          <option value="">All Payment Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      {invoices.length === 0 ? (
        <div className="empty-state"><p>No invoices found</p></div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Invoice Date</th>
              <th>Due Date</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.invoice_number}</td>
                <td>{inv.customer_name}</td>
                <td>{inv.plan_name}</td>
                <td>₹{parseFloat(inv.amount).toFixed(2)}</td>
                <td>₹{parseFloat(inv.tax).toFixed(2)}</td>
                <td><strong>₹{parseFloat(inv.total_amount).toFixed(2)}</strong></td>
                <td>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                <td>{new Date(inv.due_date).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${inv.payment_status}`}>
                    {inv.payment_status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {inv.payment_status === 'unpaid' ? (
                      <button className="btn btn-sm btn-primary" onClick={() => markPaid(inv.id)}>
                        Mark Paid
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-warning" onClick={() => markUnpaid(inv.id)}>
                        Mark Unpaid
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Invoices;
