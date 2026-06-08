const db = require('../config/db');

exports.getCustomers = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT * FROM customers WHERE 1=1';
    let params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const [existing] = await db.query('SELECT id FROM customers WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Customer with this email already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO customers (name, email, phone, company) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, company || null]
    );

    const [newCustomer] = await db.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    res.status(201).json(newCustomer[0]);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, company, status } = req.body;
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (email) {
      const [emailCheck] = await db.query(
        'SELECT id FROM customers WHERE email = ? AND id != ?',
        [email, id]
      );
      if (emailCheck.length > 0) {
        return res.status(400).json({ message: 'Email already in use by another customer' });
      }
    }

    await db.query(
      'UPDATE customers SET name = ?, email = ?, phone = ?, company = ?, status = ? WHERE id = ?',
      [name, email, phone || null, company || null, status || 'active', id]
    );

    const [updated] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const customer = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    
    if (customer[0].length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const currentStatus = customer[0][0].status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    await db.query('UPDATE customers SET status = ? WHERE id = ?', [newStatus, req.params.id]);

    const [updated] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
