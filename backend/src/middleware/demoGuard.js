const pool = require('../config/db');
const demo = require('../config/demo');

const hits = new Map(); // ip -> [timestamps of recent write requests]

/** Limits create/update/delete requests per IP while in demo mode. */
function writeRateLimit(req, res, next) {
  if (!demo.enabled || ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.path.startsWith('/demo/')) return next(); // the reset endpoint has its own cooldown

  const windowMs = demo.writeWindowMinutes * 60 * 1000;
  const now = Date.now();
  const recent = (hits.get(req.ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= demo.writeLimit) {
    const retry = Math.ceil((recent[0] + windowMs - now) / 1000);
    res.set('Retry-After', String(retry));
    return res.status(429).json({
      success: false,
      message: `Demo limit: too many changes from your address. Try again in ${Math.ceil(retry / 60)} minute(s).`,
    });
  }
  recent.push(now);
  hits.set(req.ip, recent);
  next();
}

// Drop stale entries so the map cannot grow forever
setInterval(() => {
  const cutoff = Date.now() - demo.writeWindowMinutes * 60 * 1000;
  for (const [ip, times] of hits) {
    if (!times.some((t) => t > cutoff)) hits.delete(ip);
  }
}, 10 * 60 * 1000).unref();

async function count() {
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM students');
  return Number(total);
}

/** Blocks creating students once the demo cap is reached. */
async function limitCreate(req, res, next) {
  if (!demo.enabled) return next();
  try {
    if ((await count()) >= demo.maxStudents) {
      return res.status(403).json({
        success: false,
        message: `Demo limit reached: at most ${demo.maxStudents} students. Delete one or use "Reset demo data" in Settings.`,
      });
    }
    next();
  } catch (err) { next(err); }
}

/** Blocks deleting when it would leave the table (almost) empty. */
async function protectDelete(req, res, next) {
  if (!demo.enabled) return next();
  try {
    if ((await count()) <= demo.minStudents) {
      return res.status(403).json({
        success: false,
        message: `Demo protection: at least ${demo.minStudents} students must remain. Add one first, or use "Reset demo data" in Settings.`,
      });
    }
    next();
  } catch (err) { next(err); }
}

module.exports = { writeRateLimit, limitCreate, protectDelete };
