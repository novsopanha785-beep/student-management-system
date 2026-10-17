const pool = require('../config/db');

const COLUMNS = [
  'student_id', 'full_name', 'gender', 'date_of_birth', 'email', 'phone',
  'course', 'academic_year', 'class_name', 'address', 'enrollment_date', 'status',
];

const SORTABLE = ['id', 'student_id', 'full_name', 'course', 'class_name', 'academic_year', 'enrollment_date', 'status', 'created_at'];

// Escape LIKE wildcards in user input
const likeEscape = (s) => s.replace(/[\\%_]/g, '\\$&');

exports.getStudents = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (search) {
      const like = `%${likeEscape(search)}%`;
      where.push('(student_id LIKE ? OR full_name LIKE ? OR email LIKE ? OR course LIKE ? OR class_name LIKE ?)');
      params.push(like, like, like, like, like);
    }
    if (typeof req.query.course === 'string' && req.query.course.trim()) {
      where.push('course = ?');
      params.push(req.query.course.trim());
    }
    if (typeof req.query.class_name === 'string' && req.query.class_name.trim()) {
      where.push('class_name = ?');
      params.push(req.query.class_name.trim());
    }
    if (['Active', 'Inactive'].includes(req.query.status)) {
      where.push('status = ?');
      params.push(req.query.status);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sortBy = SORTABLE.includes(req.query.sortBy) ? req.query.sortBy : 'id';
    const sortDir = String(req.query.sortDir).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM students ${whereSql}`, params);
    const [rows] = await pool.query(
      `SELECT * FROM students ${whereSql} ORDER BY ${sortBy} ${sortDir} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (err) { next(err); }
};

exports.getCourses = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT course FROM students ORDER BY course');
    res.json({ success: true, data: rows.map((r) => r.course) });
  } catch (err) { next(err); }
};

exports.getClasses = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT class_name FROM students ORDER BY class_name');
    res.json({ success: true, data: rows.map((r) => r.class_name) });
  } catch (err) { next(err); }
};

exports.getStudentById = async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM students WHERE id = ?', [req.studentPk]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

exports.createStudent = async (req, res, next) => {
  try {
    const d = req.studentData;
    const [result] = await pool.execute(
      `INSERT INTO students (${COLUMNS.join(', ')}) VALUES (${COLUMNS.map(() => '?').join(', ')})`,
      COLUMNS.map((c) => d[c])
    );
    const [rows] = await pool.execute('SELECT * FROM students WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Student created successfully', data: rows[0] });
  } catch (err) { next(err); }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const d = req.studentData;
    const [result] = await pool.execute(
      `UPDATE students SET ${COLUMNS.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
      [...COLUMNS.map((c) => d[c]), req.studentPk]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    const [rows] = await pool.execute('SELECT * FROM students WHERE id = ?', [req.studentPk]);
    res.json({ success: true, message: 'Student updated successfully', data: rows[0] });
  } catch (err) { next(err); }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM students WHERE id = ?', [req.studentPk]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) { next(err); }
};
