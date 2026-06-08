import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    try {
      const response = await fetch('http://localhost:5000/api/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setPlans(data);
    } catch (err) {
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  }

  async function deletePlan(id) {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/plans/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      fetchPlans();
    } catch (err) {
      setError('Failed to delete plan');
    }
  }

  function getFeaturesList(features) {
    if (!features) return [];
    return features.split(',').map(f => f.trim());
  }

  if (loading) return <div className="empty-state"><p>Loading plans...</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Plans</h1>
        <Link to="/plans/new" className="btn btn-primary">Create Plan</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {plans.length === 0 ? (
        <div className="empty-state"><p>No plans found</p></div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Plan Name</th>
              <th>Description</th>
              <th>Monthly Price</th>
              <th>Yearly Price</th>
              <th>Features</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td><strong>{plan.name}</strong></td>
                <td>{plan.description || '-'}</td>
                <td>${parseFloat(plan.monthly_price).toFixed(2)}</td>
                <td>${parseFloat(plan.yearly_price).toFixed(2)}</td>
                <td>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
                    {getFeaturesList(plan.features).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <span className={`status-badge status-${plan.status}`}>
                    {plan.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/plans/edit/${plan.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deletePlan(plan.id)}
                    >
                      Delete
                    </button>
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

export default Plans;
