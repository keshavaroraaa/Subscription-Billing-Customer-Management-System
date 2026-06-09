import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter]);

  async function fetchCustomers() {
    setError('');
    try {
      let url = 'http://localhost:5000/api/customers?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter) url += `status=${statusFilter}&`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setCustomers(data);
    } catch (err) {
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(id) {
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/customers/${id}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchCustomers();
      }
    } catch (err) {
      setError('Failed to update customer status');
    }
  }

  if (loading) return <div className="empty-state"><p>Loading customers...</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <Link to="/customers/new" className="btn btn-primary">Add Customer</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {customers.length === 0 ? (
        <div className="empty-state"><p>No customers found</p></div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone || '-'}</td>
                <td>{customer.company || '-'}</td>
                <td>
                  <span className={`status-badge status-${customer.status}`}>
                    {customer.status}
                  </span>
                </td>
                <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/customers/edit/${customer.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className={`btn btn-sm ${customer.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => toggleStatus(customer.id)}
                    >
                      {customer.status === 'active' ? 'Deactivate' : 'Activate'}
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

export default Customers;
