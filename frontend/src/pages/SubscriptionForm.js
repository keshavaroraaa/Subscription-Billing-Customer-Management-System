import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SubscriptionForm() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    plan_id: '',
    start_date: '',
    billing_cycle: 'monthly'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchPlans();
  }, []);

  async function fetchCustomers() {
    try {
      const response = await fetch('http://localhost:5000/api/customers?status=active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setCustomers(data);
    } catch (err) {}
  }

  async function fetchPlans() {
    try {
      const response = await fetch('http://localhost:5000/api/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setPlans(data.filter(p => p.status === 'active'));
    } catch (err) {}
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!formData.customer_id || !formData.plan_id || !formData.start_date) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      navigate('/subscriptions');
    } catch (err) {
      setError('Failed to create subscription');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Assign Plan to Customer</h1>
      </div>

      <div className="form-card">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer *</label>
            <select name="customer_id" value={formData.customer_id} onChange={handleChange}>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Plan *</label>
            <select name="plan_id" value={formData.plan_id} onChange={handleChange}>
              <option value="">Select plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ${parseFloat(p.monthly_price).toFixed(2)}/mo or ${parseFloat(p.yearly_price).toFixed(2)}/yr
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Billing Cycle *</label>
              <select name="billing_cycle" value={formData.billing_cycle} onChange={handleChange}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Subscription'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/subscriptions')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubscriptionForm;
