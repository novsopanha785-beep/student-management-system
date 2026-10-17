const router = require('express').Router();
const ctrl = require('../controllers/studentController');
const { validateStudent, validateIdParam } = require('../middleware/validateStudent');
const { limitCreate, protectDelete } = require('../middleware/demoGuard');

router.get('/', ctrl.getStudents);
router.get('/courses', ctrl.getCourses); // must stay above '/:id'
router.get('/classes', ctrl.getClasses);
router.get('/:id', validateIdParam, ctrl.getStudentById);
router.post('/', validateStudent, limitCreate, ctrl.createStudent);
router.put('/:id', validateIdParam, validateStudent, ctrl.updateStudent);
router.delete('/:id', validateIdParam, protectDelete, ctrl.deleteStudent);

module.exports = router;
