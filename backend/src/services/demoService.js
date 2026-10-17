const pool = require('../config/db');
const demo = require('../config/demo');
const seed = require('../../database/seedData');

const COLUMNS = [
  'student_id', 'full_name', 'gender', 'date_of_birth', 'email', 'phone',
  'course', 'academic_year', 'class_name', 'address', 'enrollment_date', 'status',
];

let lastManualReset = 0;

/** Small table that remembers when the data was last reset (survives server restarts). */
async function ensureMetaTable() {
  await pool.query(
    'CREATE TABLE IF NOT EXISTS demo_meta (id TINYINT UNSIGNED NOT NULL PRIMARY KEY, last_reset_ms BIGINT NOT NULL)'
  );
}

async function resetDemoData() {
  await ensureMetaTable();
  const conn = await pool.getConnection();
  try {
    await conn.query('DELETE FROM students');
    try {
      await conn.query('ALTER TABLE students AUTO_INCREMENT = 1'); // nice to have; not supported everywhere
    } catch {
      /* ignore: ids simply keep counting up */
    }
    await conn.beginTransaction();
    await conn.query(`INSERT INTO students (${COLUMNS.join(', ')}) VALUES ?`, [seed]);
    await conn.query(
      'INSERT INTO demo_meta (id, last_reset_ms) VALUES (1, ?) ON DUPLICATE KEY UPDATE last_reset_ms = VALUES(last_reset_ms)',
      [Date.now()]
    );
    await conn.commit();
  } catch (err) {
    try { await conn.rollback(); } catch { /* ignore */ }
    throw err;
  } finally {
    conn.release();
  }
}

async function getLastResetMs() {
  await ensureMetaTable();
  const [rows] = await pool.query('SELECT last_reset_ms FROM demo_meta WHERE id = 1');
  return rows.length ? Number(rows[0].last_reset_ms) : 0;
}

/** Resets the data if the configured interval has passed (also covers hosts that sleep). */
async function resetIfDue() {
  if (!demo.enabled || demo.resetEveryHours === 0) return false;
  const last = await getLastResetMs();
  if (Date.now() - last >= demo.resetEveryHours * 3600 * 1000) {
    await resetDemoData();
    console.log('Demo data reset (scheduled)');
    return true;
  }
  return false;
}

function startScheduler() {
  if (!demo.enabled) return;
  const check = () => resetIfDue().catch((e) => console.error('Demo reset check failed:', e.message));
  check();
  setInterval(check, 30 * 60 * 1000).unref(); // check every 30 minutes
}

/** Manual reset with a cooldown so it cannot be spammed. Returns seconds to wait, or 0 if done. */
async function manualReset() {
  const wait = Math.ceil((lastManualReset + demo.manualResetCooldownSeconds * 1000 - Date.now()) / 1000);
  if (wait > 0) return wait;
  lastManualReset = Date.now();
  await resetDemoData();
  return 0;
}

async function status() {
  let nextResetAt = null;
  if (demo.enabled && demo.resetEveryHours > 0) {
    nextResetAt = new Date((await getLastResetMs()) + demo.resetEveryHours * 3600 * 1000).toISOString();
  }
  return {
    demoMode: demo.enabled,
    maxStudents: demo.enabled ? demo.maxStudents : null,
    minStudents: demo.enabled ? demo.minStudents : null,
    resetEveryHours: demo.enabled ? demo.resetEveryHours : null,
    nextResetAt,
  };
}

module.exports = { resetDemoData, resetIfDue, startScheduler, manualReset, status };
