const db = require('../config/db');
const PDFDocument = require('pdfkit');

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

exports.downloadInvoicePDF = async (req, res) => {
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

    const invoice = rows[0];

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoice_number}.pdf`);

    doc.pipe(res);

    doc.fontSize(24).text('INVOICE', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10).text(`Invoice #: ${invoice.invoice_number}`, { align: 'right' });
    doc.text(`Invoice Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, { align: 'right' });
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(2);

    doc.fontSize(14).text('Bill To:');
    doc.fontSize(11);
    doc.text(invoice.customer_name);
    if (invoice.customer_company) doc.text(invoice.customer_company);
    doc.text(invoice.customer_email);
    if (invoice.customer_phone) doc.text(invoice.customer_phone);
    doc.moveDown(2);

    const tableTop = doc.y;
    doc.fontSize(11);

    doc.rect(50, tableTop, 500, 20).fill('#f0f0f0');
    doc.fillColor('#000000');
    doc.text('Description', 60, tableTop + 5, { width: 300 });
    doc.text('Amount', 400, tableTop + 5, { width: 100, align: 'right' });

    doc.moveDown(1);
    const rowY = doc.y;
    doc.text(invoice.plan_name, 60, rowY, { width: 300 });
    doc.text(`$${parseFloat(invoice.amount).toFixed(2)}`, 400, rowY, { width: 100, align: 'right' });

    doc.moveDown(1.5);
    const taxY = doc.y;
    doc.text('Tax (16%)', 60, taxY, { width: 300 });
    doc.text(`$${parseFloat(invoice.tax).toFixed(2)}`, 400, taxY, { width: 100, align: 'right' });

    doc.moveDown(0.5);
    doc.rect(50, doc.y, 500, 1).fill('#000000');

    doc.moveDown(1);
    const totalY = doc.y;
    doc.fontSize(14);
    doc.text('Total:', 60, totalY, { width: 300 });
    doc.text(`$${parseFloat(invoice.total_amount).toFixed(2)}`, 400, totalY, { width: 100, align: 'right' });

    doc.moveDown(2);
    doc.fontSize(10).fillColor('#666666');
    doc.text(`Payment Status: ${invoice.payment_status.toUpperCase()}`, 60, doc.y);

    doc.end();
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
