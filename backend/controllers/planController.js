const db = require('../config/db');

exports.getPlans = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM plans ORDER BY monthly_price ASC');
    res.json(rows);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPlan = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM plans WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const { name, description, monthly_price, yearly_price, features } = req.body;

    if (!name || !monthly_price || !yearly_price) {
      return res.status(400).json({ message: 'Name, monthly price, and yearly price are required' });
    }

    const [result] = await db.query(
      'INSERT INTO plans (name, description, monthly_price, yearly_price, features) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, monthly_price, yearly_price, features || null]
    );

    const [newPlan] = await db.query('SELECT * FROM plans WHERE id = ?', [result.insertId]);
    res.status(201).json(newPlan[0]);
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { name, description, monthly_price, yearly_price, features, status } = req.body;
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM plans WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    await db.query(
      'UPDATE plans SET name = ?, description = ?, monthly_price = ?, yearly_price = ?, features = ?, status = ? WHERE id = ?',
      [name, description || null, monthly_price, yearly_price, features || null, status || 'active', id]
    );

    const [updated] = await db.query('SELECT * FROM plans WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM plans WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const [subscriptions] = await db.query(
      'SELECT id FROM subscriptions WHERE plan_id = ?',
      [req.params.id]
    );

    if (subscriptions.length > 0) {
      return res.status(400).json({ message: 'Cannot delete plan with active subscriptions' });
    }

    await db.query('DELETE FROM plans WHERE id = ?', [req.params.id]);
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
