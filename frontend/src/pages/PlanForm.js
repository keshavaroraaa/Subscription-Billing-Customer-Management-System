import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthly_price: '',
    yearly_price: '',
    features: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchPlan();
    }
  }, [id]);

  async function fetchPlan() {
    try {
      const response = await fetch(`http://localhost:5000/api/plans/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setFormData({
        name: data.name || '',
        description: data.description || '',
        monthly_price: data.monthly_price || '',
        yearly_price: data.yearly_price || '',
        features: data.features || ''
      });
    } catch (err) {
      setError('Failed to load plan');
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.monthly_price || !formData.yearly_price) {
      setError('Name, monthly price, and yearly price are required');
      return;
    }

    setLoading(true);

    try {
      const url = isEdit
        ? `http://localhost:5000/api/plans/${id}`
        : 'http://localhost:5000/api/plans';

      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
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

      navigate('/plans');
    } catch (err) {
      setError('Failed to save plan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? 'Edit Plan' : 'Create Plan'}</h1>
      </div>

      <div className="form-card">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Plan Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter plan name"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter plan description"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Monthly Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                name="monthly_price"
                value={formData.monthly_price}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Yearly Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                name="yearly_price"
                value={formData.yearly_price}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Features (comma separated)</label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleChange}
              placeholder="e.g. Basic analytics, Email support, 5 projects"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Plan' : 'Create Plan')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/plans')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PlanForm;
