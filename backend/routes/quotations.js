const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/quotationController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get  ('/',          ctrl.getQuotations);
router.post ('/',          ctrl.createQuotation);
router.get  ('/:id',       ctrl.getQuotation);
router.put  ('/:id',       ctrl.updateQuotation);
router.patch('/:id/status',ctrl.updateStatus);
router.delete('/:id',      ctrl.deleteQuotation);

module.exports = router;
