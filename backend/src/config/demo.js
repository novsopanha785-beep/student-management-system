require('dotenv').config();

const int = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

/**
 * Demo mode protects a public portfolio deployment.
 * Locally (DEMO_MODE unset/false) none of these limits apply.
 */
module.exports = {
  enabled: String(process.env.DEMO_MODE).toLowerCase() === 'true',
  maxStudents: int(process.env.DEMO_MAX_STUDENTS, 50), // no new students beyond this
  minStudents: int(process.env.DEMO_MIN_STUDENTS, 3), // deleting is blocked at or below this
  resetEveryHours: int(process.env.DEMO_RESET_HOURS, 24), // automatic reset of the sample data
  writeLimit: int(process.env.DEMO_WRITE_LIMIT, 30), // create/update/delete requests per IP...
  writeWindowMinutes: int(process.env.DEMO_WRITE_WINDOW_MINUTES, 10), // ...per this many minutes
  manualResetCooldownSeconds: 60,
};
