const pool = require('../config/db');

exports.getStats = async (req, res, next) => {
  try {
    const [[counts]] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(DISTINCT course) AS courses,
         COUNT(DISTINCT class_name) AS classes,
         COALESCE(SUM(status = 'Active'), 0)   AS active,
         COALESCE(SUM(status = 'Inactive'), 0) AS inactive
       FROM students`
    );
    const [recent] = await pool.query('SELECT * FROM students ORDER BY created_at DESC, id DESC LIMIT 5');
    res.json({
      success: true,
      data: {
        totalStudents: Number(counts.total),
        activeStudents: Number(counts.active),
        inactiveStudents: Number(counts.inactive),
        totalCourses: Number(counts.courses),
        totalClasses: Number(counts.classes),
        recentStudents: recent,
      },
    });
  } catch (err) { next(err); }
};
