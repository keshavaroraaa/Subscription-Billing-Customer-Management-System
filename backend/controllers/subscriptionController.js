const db = require('../config/db');

exports.getSubscriptions = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT s.*, c.name as customer_name, c.email as customer_email, 
             p.name as plan_name, p.monthly_price, p.yearly_price
      FROM subscriptions s
      JOIN customers c ON s.customer_id = c.id
      JOIN plans p ON s.plan_id = p.id
      WHERE 1=1
    `;
    let params = [];

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    query += ' ORDER BY s.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, c.name as customer_name, c.email as customer_email, 
              p.name as plan_name, p.monthly_price, p.yearly_price
       FROM subscriptions s
       JOIN customers c ON s.customer_id = c.id
       JOIN plans p ON s.plan_id = p.id
       WHERE s.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

function generateInvoiceNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
}

async function createInvoice(subscriptionId, customerId, planId, amount, startDate) {
  try {
    const tax = Math.round(amount * 0.16 * 100) / 100;
    const totalAmount = amount + tax;
    const invoiceNumber = generateInvoiceNumber();
    const invoiceDate = new Date(startDate);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 15);

    await db.query(
      `INSERT INTO invoices (invoice_number, subscription_id, customer_id, plan_id, amount, tax, total_amount, invoice_date, due_date, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid')`,
      [invoiceNumber, subscriptionId, customerId, planId, amount, tax, totalAmount, invoiceDate, dueDate]
    );
  } catch (error) {
    console.error('Create invoice error:', error);
  }
}

exports.createSubscription = async (req, res) => {
  try {
    const { customer_id, plan_id, start_date, billing_cycle } = req.body;

    if (!customer_id || !plan_id || !start_date || !billing_cycle) {
      return res.status(400).json({ message: 'Customer, plan, start date, and billing cycle are required' });
    }

    const [customer] = await db.query('SELECT id FROM customers WHERE id = ? AND status = ?', [customer_id, 'active']);
    if (customer.length === 0) {
      return res.status(400).json({ message: 'Customer not found or inactive' });
    }

    const [plan] = await db.query('SELECT * FROM plans WHERE id = ? AND status = ?', [plan_id, 'active']);
    if (plan.length === 0) {
      return res.status(400).json({ message: 'Plan not found or inactive' });
    }

    const [activeSub] = await db.query(
      'SELECT id FROM subscriptions WHERE customer_id = ? AND status = ?',
      [customer_id, 'active']
    );
    if (activeSub.length > 0) {
      return res.status(400).json({ message: 'Customer already has an active subscription' });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(startDate);
    let amount;

    if (billing_cycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
      amount = parseFloat(plan[0].yearly_price);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
      amount = parseFloat(plan[0].monthly_price);
    }

    const renewalDate = new Date(endDate);
    renewalDate.setDate(renewalDate.getDate() - 30);

    const [result] = await db.query(
      `INSERT INTO subscriptions (customer_id, plan_id, start_date, end_date, renewal_date, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [customer_id, plan_id, startDate, endDate, renewalDate]
    );

    await createInvoice(result.insertId, customer_id, plan_id, amount, startDate);

    const [newSub] = await db.query(
      `SELECT s.*, c.name as customer_name, p.name as plan_name
       FROM subscriptions s
       JOIN customers c ON s.customer_id = c.id
       JOIN plans p ON s.plan_id = p.id
       WHERE s.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newSub[0]);
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.upgradeSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_plan_id } = req.body;

    const [subscription] = await db.query(
      `SELECT s.*, p.monthly_price, p.yearly_price 
       FROM subscriptions s 
       JOIN plans p ON s.plan_id = p.id 
       WHERE s.id = ?`,
      [id]
    );

    if (subscription.length === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const [newPlan] = await db.query('SELECT * FROM plans WHERE id = ? AND status = ?', [new_plan_id, 'active']);
    if (newPlan.length === 0) {
      return res.status(400).json({ message: 'New plan not found or inactive' });
    }

    if (parseFloat(newPlan[0].monthly_price) <= parseFloat(subscription[0].monthly_price)) {
      return res.status(400).json({ message: 'New plan must have a higher price than current plan' });
    }

    const sub = subscription[0];
    const amountDiff = parseFloat(newPlan[0].monthly_price) - parseFloat(sub.monthly_price);

    await db.query('UPDATE subscriptions SET plan_id = ? WHERE id = ?', [new_plan_id, id]);

    await createInvoice(id, sub.customer_id, new_plan_id, amountDiff, new Date());

    const [updated] = await db.query(
      `SELECT s.*, c.name as customer_name, p.name as plan_name
       FROM subscriptions s
       JOIN customers c ON s.customer_id = c.id
       JOIN plans p ON s.plan_id = p.id
       WHERE s.id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.downgradeSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_plan_id } = req.body;

    const [subscription] = await db.query(
      `SELECT s.*, p.monthly_price 
       FROM subscriptions s 
       JOIN plans p ON s.plan_id = p.id 
       WHERE s.id = ?`,
      [id]
    );

    if (subscription.length === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const [newPlan] = await db.query('SELECT * FROM plans WHERE id = ? AND status = ?', [new_plan_id, 'active']);
    if (newPlan.length === 0) {
      return res.status(400).json({ message: 'New plan not found or inactive' });
    }

    if (parseFloat(newPlan[0].monthly_price) >= parseFloat(subscription[0].monthly_price)) {
      return res.status(400).json({ message: 'New plan must have a lower price than current plan' });
    }

    await db.query('UPDATE subscriptions SET plan_id = ? WHERE id = ?', [new_plan_id, id]);
    await db.query('DELETE FROM invoices WHERE subscription_id = ? AND payment_status = ?', [id, 'unpaid']);

    const sub = subscription[0];
    const creditAmount = parseFloat(sub.monthly_price) - parseFloat(newPlan[0].monthly_price);
    await createInvoice(id, sub.customer_id, new_plan_id, creditAmount, new Date());

    const [updated] = await db.query(
      `SELECT s.*, c.name as customer_name, p.name as plan_name
       FROM subscriptions s
       JOIN customers c ON s.customer_id = c.id
       JOIN plans p ON s.plan_id = p.id
       WHERE s.id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Downgrade subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM subscriptions WHERE id = ? AND status = ?', [req.params.id, 'active']);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Active subscription not found' });
    }

    await db.query('UPDATE subscriptions SET status = ? WHERE id = ?', ['cancelled', req.params.id]);

    const [updated] = await db.query(
      `SELECT s.*, c.name as customer_name, p.name as plan_name
       FROM subscriptions s
       JOIN customers c ON s.customer_id = c.id
       JOIN plans p ON s.plan_id = p.id
       WHERE s.id = ?`,
      [req.params.id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.renewSubscription = async (req, res) => {
  try {
    const [subscription] = await db.query(
      `SELECT s.*, p.monthly_price, p.yearly_price
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.id = ?`,
      [req.params.id]
    );

    if (subscription.length === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const sub = subscription[0];
    const currentEnd = new Date(sub.end_date);
    const newEnd = new Date(currentEnd);
    newEnd.setFullYear(newEnd.getFullYear() + 1);

    const newRenewal = new Date(newEnd);
    newRenewal.setDate(newRenewal.getDate() - 30);

    await db.query(
      'UPDATE subscriptions SET status = ?, end_date = ?, renewal_date = ? WHERE id = ?',
      ['active', newEnd, newRenewal, req.params.id]
    );

    await createInvoice(req.params.id, sub.customer_id, sub.plan_id, parseFloat(sub.yearly_price), new Date());

    const [updated] = await db.query(
      `SELECT s.*, c.name as customer_name, p.name as plan_name
       FROM subscriptions s
       JOIN customers c ON s.customer_id = c.id
       JOIN plans p ON s.plan_id = p.id
       WHERE s.id = ?`,
      [req.params.id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
