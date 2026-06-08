import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchSubscriptions();
    fetchPlans();
  }, [statusFilter]);

  async function fetchSubscriptions() {
    try {
      let url = 'http://localhost:5000/api/subscriptions?';
      if (statusFilter) url += `status=${statusFilter}&`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setSubscriptions(data);
    } catch (err) {
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlans() {
    try {
      const response = await fetch('http://localhost:5000/api/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setPlans(data);
    } catch (err) {}
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this subscription?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/subscriptions/${id}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchSubscriptions();
      }
    } catch (err) {
      setError('Failed to cancel subscription');
    }
  }

  async function handleRenew(id) {
    if (!window.confirm('Renew this subscription?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/subscriptions/${id}/renew`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchSubscriptions();
      }
    } catch (err) {
      setError('Failed to renew subscription');
    }
  }

  async function handleUpgrade(subId) {
    const currentPlanId = subscriptions.find(s => s.id === subId)?.plan_id;
    const higherPlans = plans.filter(p => p.id > currentPlanId);
    
    if (higherPlans.length === 0) {
      setError('No higher plans available for upgrade');
      return;
    }

    const newPlanId = higherPlans[0].id;
    if (!window.confirm(`Upgrade to ${higherPlans[0].name}?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/subscriptions/${subId}/upgrade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_plan_id: newPlanId })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      fetchSubscriptions();
    } catch (err) {
      setError('Failed to upgrade subscription');
    }
  }

  async function handleDowngrade(subId) {
    const currentPlanId = subscriptions.find(s => s.id === subId)?.plan_id;
    const lowerPlans = plans.filter(p => p.id < currentPlanId);
    
    if (lowerPlans.length === 0) {
      setError('No lower plans available for downgrade');
      return;
    }

    const newPlanId = lowerPlans[lowerPlans.length - 1].id;
    if (!window.confirm(`Downgrade to ${lowerPlans[lowerPlans.length - 1].name}?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/subscriptions/${subId}/downgrade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_plan_id: newPlanId })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      fetchSubscriptions();
    } catch (err) {
      setError('Failed to downgrade subscription');
    }
  }

  if (loading) return <div className="empty-state"><p>Loading subscriptions...</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Subscriptions</h1>
        <Link to="/subscriptions/new" className="btn btn-primary">Assign Plan</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-bar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {subscriptions.length === 0 ? (
        <div className="empty-state"><p>No subscriptions found</p></div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Plan</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Renewal Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.customer_name}</td>
                <td>{sub.plan_name}</td>
                <td>{new Date(sub.start_date).toLocaleDateString()}</td>
                <td>{new Date(sub.end_date).toLocaleDateString()}</td>
                <td>{sub.renewal_date ? new Date(sub.renewal_date).toLocaleDateString() : '-'}</td>
                <td>
                  <span className={`status-badge status-${sub.status}`}>
                    {sub.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {sub.status === 'active' && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => handleUpgrade(sub.id)}>
                          Upgrade
                        </button>
                        <button className="btn btn-warning btn-sm" onClick={() => handleDowngrade(sub.id)}>
                          Downgrade
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(sub.id)}>
                          Cancel
                        </button>
                      </>
                    )}
                    {(sub.status === 'expired' || sub.status === 'cancelled') && (
                      <button className="btn btn-success btn-sm" onClick={() => handleRenew(sub.id)}>
                        Renew
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

export default Subscriptions;
