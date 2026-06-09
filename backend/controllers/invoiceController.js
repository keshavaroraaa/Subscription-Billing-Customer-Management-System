const db = require('../config/db');

exports.getInvoices = async (req, res) => {
  try {
    const { payment_status } = req.query;
    let query = `
      SELECT i.*, c.name as customer_name, c.company as customer_company,
             p.name as plan_name
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      JOIN plans p ON i.plan_id = p.id
      WHERE 1=1
    `;
    let params = [];

    if (payment_status) {
      query += ' AND i.payment_status = ?';
      params.push(payment_status);
    }

    query += ' ORDER BY i.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT i.*, c.name as customer_name, c.email as customer_email, 
              c.company as customer_company, c.phone as customer_phone,
              p.name as plan_name, p.description as plan_description
       FROM invoices i
       JOIN customers c ON i.customer_id = c.id
       JOIN plans p ON i.plan_id = p.id
       WHERE i.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markPaid = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM invoices WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await db.query('UPDATE invoices SET payment_status = ? WHERE id = ?', ['paid', req.params.id]);

    const [updated] = await db.query(
      `SELECT i.*, c.name as customer_name, p.name as plan_name
       FROM invoices i
       JOIN customers c ON i.customer_id = c.id
       JOIN plans p ON i.plan_id = p.id
       WHERE i.id = ?`,
      [req.params.id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Mark paid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markUnpaid = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM invoices WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await db.query('UPDATE invoices SET payment_status = ? WHERE id = ?', ['unpaid', req.params.id]);

    const [updated] = await db.query(
      `SELECT i.*, c.name as customer_name, p.name as plan_name
       FROM invoices i
       JOIN customers c ON i.customer_id = c.id
       JOIN plans p ON i.plan_id = p.id
       WHERE i.id = ?`,
      [req.params.id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Mark unpaid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


