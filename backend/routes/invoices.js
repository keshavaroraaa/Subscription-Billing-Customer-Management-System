const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, invoiceController.getInvoices);
router.get('/:id', authenticateToken, invoiceController.getInvoice);
router.put('/:id/mark-paid', authenticateToken, invoiceController.markPaid);
router.put('/:id/mark-unpaid', authenticateToken, invoiceController.markUnpaid);

module.exports = router;
