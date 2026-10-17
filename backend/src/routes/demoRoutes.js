const router = require('express').Router();
const demo = require('../config/demo');
const service = require('../services/demoService');

router.get('/status', async (req, res, next) => {
  try {
    res.json({ success: true, data: await service.status() });
  } catch (err) { next(err); }
});

router.post('/reset', async (req, res, next) => {
  if (!demo.enabled) {
    return res.status(403).json({ success: false, message: 'Reset is only available in demo mode' });
  }
  try {
    const wait = await service.manualReset();
    if (wait > 0) {
      res.set('Retry-After', String(wait));
      return res.status(429).json({ success: false, message: `Please wait ${wait}s before resetting again` });
    }
    res.json({ success: true, message: 'Demo data has been reset' });
  } catch (err) { next(err); }
});

module.exports = router;
