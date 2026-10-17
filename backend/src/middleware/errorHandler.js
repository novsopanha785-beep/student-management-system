function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Duplicate unique key (student_id or email)
  if (err && err.code === 'ER_DUP_ENTRY') {
    const msg = String(err.sqlMessage || '');
    const errors = {};
    let message = 'Duplicate value';
    if (msg.includes('uq_students_email')) {
      errors.email = 'A student with this email already exists';
      message = errors.email;
    } else if (msg.includes('uq_students_student_id')) {
      errors.student_id = 'A student with this Student ID already exists';
      message = errors.student_id;
    }
    return res.status(409).json({ success: false, message, errors });
  }

  // Malformed JSON body
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }

  // Database unreachable
  if (err && ['ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR'].includes(err.code)) {
    console.error('Database error:', err.code, err.message);
    return res.status(503).json({ success: false, message: 'Database unavailable. Check the backend DB settings.' });
  }

  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
}

module.exports = { notFound, errorHandler };
