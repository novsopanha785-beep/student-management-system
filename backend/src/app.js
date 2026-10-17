require('dotenv').config();
const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const demoRoutes = require('./routes/demoRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const { writeRateLimit } = require('./middleware/demoGuard');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1); // hosts like Render sit behind a proxy; needed for the real client IP
const origins = (process.env.CORS_ORIGIN || 'http://localhost:4200').split(',').map((o) => o.trim());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));
app.use('/api', writeRateLimit);
app.use('/api/students', studentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', catalogRoutes);
app.use('/api/demo', demoRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
