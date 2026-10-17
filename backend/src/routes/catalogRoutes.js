const router = require('express').Router();
const { classSummary, courseSummary } = require('../controllers/catalogController');

router.get('/classes', classSummary);
router.get('/courses', courseSummary);

module.exports = router;
