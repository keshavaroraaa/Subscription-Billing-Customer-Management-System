const db = require('../config/db');

exports.getDashboardData = async (req, res) => {
  try {
    const [totalCustomers] = await db.query('SELECT COUNT(*) as count FROM customers');
    
    const [activeSubscriptions] = await db.query(
      "SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'"
    );
    
    const [expiredSubscriptions] = await db.query(
      "SELECT COUNT(*) as count FROM subscriptions WHERE status = 'expired'"
    );
    
    const [monthlyRevenue] = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM invoices 
       WHERE payment_status = 'paid' 
       AND MONTH(invoice_date) = MONTH(CURRENT_DATE()) 
       AND YEAR(invoice_date) = YEAR(CURRENT_DATE())`
    );
    
    const [pendingPayments] = await db.query(
      "SELECT COUNT(*) as count FROM invoices WHERE payment_status = 'unpaid'"
    );

    const [pendingAmount] = await db.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices WHERE payment_status = 'unpaid'"
    );

    const [recentInvoices] = await db.query(
      `SELECT i.*, c.name as customer_name, p.name as plan_name
       FROM invoices i
       JOIN customers c ON i.customer_id = c.id
       JOIN plans p ON i.plan_id = p.id
       ORDER BY i.created_at DESC
       LIMIT 5`
    );

    res.json({
      totalCustomers: totalCustomers[0].count,
      activeSubscriptions: activeSubscriptions[0].count,
      expiredSubscriptions: expiredSubscriptions[0].count,
      monthlyRevenue: monthlyRevenue[0].total,
      pendingPayments: pendingPayments[0].count,
      pendingAmount: pendingAmount[0].total,
      recentInvoices
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
