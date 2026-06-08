const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, subscriptionController.getSubscriptions);
router.get('/:id', authenticateToken, subscriptionController.getSubscription);
router.post('/', authenticateToken, subscriptionController.createSubscription);
router.put('/:id/upgrade', authenticateToken, subscriptionController.upgradeSubscription);
router.put('/:id/downgrade', authenticateToken, subscriptionController.downgradeSubscription);
router.put('/:id/cancel', authenticateToken, subscriptionController.cancelSubscription);
router.put('/:id/renew', authenticateToken, subscriptionController.renewSubscription);

module.exports = router;
