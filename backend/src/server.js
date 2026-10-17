const app = require('./app');
const pool = require('./config/db');
const demo = require('./config/demo');
const { startScheduler } = require('./services/demoService');

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('Connected to MySQL');
  } catch (err) {
    console.error(`Could not connect to MySQL (${err.code || err.message}). Check backend/.env and that MySQL is running.`);
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}/api`);
    if (demo.enabled) {
      console.log(`Demo mode ON (max ${demo.maxStudents} students, min ${demo.minStudents}, reset every ${demo.resetEveryHours}h)`);
    }
  });
  startScheduler();
}

start();
