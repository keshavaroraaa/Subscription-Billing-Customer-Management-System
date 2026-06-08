const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, customerController.getCustomers);
router.get('/:id', authenticateToken, customerController.getCustomer);
router.post('/', authenticateToken, customerController.createCustomer);
router.put('/:id', authenticateToken, customerController.updateCustomer);
router.patch('/:id/toggle-status', authenticateToken, customerController.toggleStatus);

module.exports = router;
