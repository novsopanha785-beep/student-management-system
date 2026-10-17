const GENDERS = ['Male', 'Female', 'Other'];
const STATUSES = ['Active', 'Inactive'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

const str = (v) => (typeof v === 'string' ? v.trim() : v);

/**
 * Validates and normalises the student payload for POST and PUT.
 * Puts the cleaned data in req.studentData or responds with 400.
 */
function validateStudent(req, res, next) {
  const b = req.body || {};
  const errors = {};

  const data = {
    student_id: str(b.student_id),
    full_name: str(b.full_name),
    gender: str(b.gender),
    date_of_birth: str(b.date_of_birth),
    email: typeof b.email === 'string' ? b.email.trim().toLowerCase() : b.email,
    phone: str(b.phone),
    course: str(b.course),
    academic_year: b.academic_year === '' ? undefined : Number(b.academic_year),
    class_name: str(b.class_name),
    address: str(b.address),
    enrollment_date: str(b.enrollment_date),
    status: str(b.status) || 'Active',
  };

  const required = (field, label) => {
    if (data[field] === undefined || data[field] === null || data[field] === '' ||
        (typeof data[field] === 'number' && Number.isNaN(data[field]))) {
      errors[field] = `${label} is required`;
      return false;
    }
    return true;
  };

  if (required('student_id', 'Student ID')) {
    if (typeof data.student_id !== 'string' || data.student_id.length > 30) {
      errors.student_id = 'Student ID must be at most 30 characters';
    }
  }
  if (required('full_name', 'Full name')) {
    if (typeof data.full_name !== 'string' || data.full_name.length > 120) {
      errors.full_name = 'Full name must be at most 120 characters';
    }
  }
  if (required('gender', 'Gender') && !GENDERS.includes(data.gender)) {
    errors.gender = `Gender must be one of: ${GENDERS.join(', ')}`;
  }
  if (required('date_of_birth', 'Date of birth')) {
    if (!isValidDate(data.date_of_birth)) errors.date_of_birth = 'Date of birth must be a valid date (YYYY-MM-DD)';
    else if (new Date(data.date_of_birth) > new Date()) errors.date_of_birth = 'Date of birth cannot be in the future';
  }
  if (required('email', 'Email')) {
    if (typeof data.email !== 'string' || !EMAIL_RE.test(data.email) || data.email.length > 150) {
      errors.email = 'Email must be a valid email address';
    }
  }
  if (required('phone', 'Phone number')) {
    if (typeof data.phone !== 'string' || !/^[0-9+()\-\s]{6,30}$/.test(data.phone)) {
      errors.phone = 'Phone number must be 6-30 characters (digits, spaces, +, -, parentheses)';
    }
  }
  if (required('course', 'Course') && (typeof data.course !== 'string' || data.course.length > 100)) {
    errors.course = 'Course must be at most 100 characters';
  }
  if (required('academic_year', 'Academic year')) {
    if (!Number.isInteger(data.academic_year) || data.academic_year < 1 || data.academic_year > 8) {
      errors.academic_year = 'Academic year must be a whole number between 1 and 8';
    }
  }
  if (required('class_name', 'Class') && (typeof data.class_name !== 'string' || data.class_name.length > 50)) {
    errors.class_name = 'Class must be at most 50 characters';
  }
  if (required('address', 'Address') && (typeof data.address !== 'string' || data.address.length > 255)) {
    errors.address = 'Address must be at most 255 characters';
  }
  if (required('enrollment_date', 'Enrollment date') && !isValidDate(data.enrollment_date)) {
    errors.enrollment_date = 'Enrollment date must be a valid date (YYYY-MM-DD)';
  }
  if (!STATUSES.includes(data.status)) {
    errors.status = `Status must be one of: ${STATUSES.join(', ')}`;
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  req.studentData = data;
  next();
}

/** Ensures :id is a positive integer. */
function validateIdParam(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ success: false, message: 'Invalid student id' });
  }
  req.studentPk = id;
  next();
}

module.exports = { validateStudent, validateIdParam };
