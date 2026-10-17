const pool = require('../config/db');

// Summary of students grouped by a column (class or course). The column name comes from
// a fixed whitelist below, never from user input.
function summaryBy(column) {
  return async (req, res, next) => {
    try {
      const [rows] = await pool.query(
        `SELECT ${column} AS name,
                COUNT(*) AS total,
                COALESCE(SUM(status = 'Active'), 0)   AS active,
                COALESCE(SUM(status = 'Inactive'), 0) AS inactive
           FROM students
          GROUP BY ${column}
          ORDER BY ${column}`
      );
      res.json({
        success: true,
        data: rows.map((r) => ({
          name: r.name,
          total: Number(r.total),
          active: Number(r.active),
          inactive: Number(r.inactive),
        })),
      });
    } catch (err) { next(err); }
  };
}

exports.classSummary = summaryBy('class_name');
exports.courseSummary = summaryBy('course');
