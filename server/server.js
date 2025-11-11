import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-analytics';

const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your-mongodb-connection-string-here') {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    } else {
      console.log('⚠️  Using mock data - MongoDB not configured');
    }
  } catch (error) {
    console.log('❌ MongoDB connection failed - using mock data');
  }
};

connectDB();

// ===== ROUTES =====

// Root route - to fix "Cannot GET /" error
app.get('/', (req, res) => {
  res.json({
    message: '🚀 AI Analytics Backend Server is running!',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      analytics: '/api/analytics',
      auth: {
        register: '/api/auth/register',
        login: '/api/auth/login'
      }
    },
    documentation: 'See /api/health for server status'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Analytics Server is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Users route
app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
      { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'user' },
      { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'admin' }
    ],
    total: 4,
    timestamp: new Date().toISOString()
  });
});

// Analytics route
app.get('/api/analytics', (req, res) => {
  res.json({
    revenue: 45231,
    users: 1234,
    growth: 12.5,
    activeUsers: 892,
    sessions: 2457,
    conversion: 24.5,
    chartData: [65, 78, 90, 81, 56, 55, 40],
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
  res.json({ 
    message: 'User registered successfully',
    user: { id: 1, name: 'Demo User', email: 'demo@example.com', role: 'user' },
    token: 'demo-jwt-token',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ 
    message: 'Login successful',
    user: { id: 1, name: 'Demo User', email: 'demo@example.com', role: 'admin' },
    token: 'demo-jwt-token',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/users', 
      'GET /api/analytics',
      'POST /api/auth/register',
      'POST /api/auth/login'
    ]
  });
});

// Socket.io for real-time updates
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  // Send real-time data every 3 seconds
  const interval = setInterval(() => {
    socket.emit('analyticsUpdate', {
      value: Math.random() * 100,
      timestamp: new Date().toISOString()
    });
  }, 3000);
  
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    clearInterval(interval);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Root: http://localhost:${PORT}/`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 Users: http://localhost:${PORT}/api/users`);
});