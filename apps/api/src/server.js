const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const http = require('http');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { setupWebSocket } = require('./websocket/socket');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const studentRoutes = require('./modules/students/student.routes');
const roomRoutes = require('./modules/rooms/room.routes');
const allocationRoutes = require('./modules/rooms/allocation.routes');
const feeRoutes = require('./modules/fees/fee.routes');
const complaintRoutes = require('./modules/complaints/complaint.routes');
const visitorRoutes = require('./modules/visitors/visitor.routes');
const attendanceRoutes = require('./modules/attendance/attendance.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const structureRoutes = require('./modules/rooms/structure.routes');
const foodRoutes = require('./modules/food/food.routes');
const billRoutes = require('./modules/bills/bill.routes');
const { swaggerUi, specs } = require('./config/swagger');
const { startScheduler } = require('./config/scheduler');

const app = express();
let server;
let io;

if (process.env.VERCEL !== '1') {
  server = http.createServer(app);
  io = setupWebSocket(server);
  app.set('io', io);
} else {
  app.set('io', null);
}

// Global middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://smart-hostel-web.vercel.app', // Update this with your final Vercel URL
    /\.vercel\.app$/ // Allows all vercel preview deployments
  ],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { error: 'Too many auth requests, please try again later.' },
});
app.use('/api/v1/auth/', authLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/allocations', allocationRoutes);
app.use('/api/v1/fees', feeRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/visitors', visitorRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/structure', structureRoutes);
app.use('/api/v1/food', foodRoutes);
app.use('/api/v1/bills', billRoutes);

// Static Files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

if (process.env.VERCEL !== '1') {
  server.listen(PORT, () => {
    console.log(`🚀 Hostel Management API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔌 WebSocket server ready`);
    
    // Start background task scheduler
    try {
      startScheduler();
    } catch (err) {
      console.error('Failed to start background task scheduler:', err);
    }
  });
} else {
  console.log('Running in Vercel serverless mode; websockets and scheduled background tasks are disabled.');
}

module.exports = app;
