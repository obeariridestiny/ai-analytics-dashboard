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
  origin: [
    "http://localhost:3000",
    "https://ai-analytics-dashboard.vercel.app",
    "https://ai-analytics-dashboard-*.vercel.app",
    "https://*.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
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

// ===== ENHANCED AUTHENTICATION SYSTEM =====
const usersDB = []; // In-memory storage for demo (use MongoDB in production)

// Auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }
  
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [userId, email, timestamp] = decoded.split(':');
    
    // Check if token is expired (24 hours)
    if (Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    const user = usersDB.find(u => u.id === parseInt(userId) && u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// ===== ROUTES =====

// Root route - to fix "Cannot GET /" error
app.get('/', (req, res) => {
  res.json({
    message: '🚀 AI Analytics Backend Server is running!',
    version: '2.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        register: '/api/auth/register (POST)',
        login: '/api/auth/login (POST)',
        profile: '/api/profile (GET)'
      },
      analytics: {
        health: '/api/health (GET)',
        users: '/api/users (GET)',
        analytics: '/api/analytics (GET)'
      },
      ai: {
        predict: '/api/ai/predict (POST)',
        detect_anomalies: '/api/ai/detect-anomalies (POST)',
        statistics: '/api/ai/statistics (POST)'
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
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    users_registered: usersDB.length
  });
});

// ===== AUTHENTICATION ROUTES =====

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Check if user exists
    const existingUser = usersDB.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Create new user
    const newUser = {
      id: usersDB.length + 1,
      name,
      email,
      password: Buffer.from(password).toString('base64'), // Simple encoding
      role: 'user',
      createdAt: new Date().toISOString(),
      isActive: true,
      lastLogin: null
    };
    
    usersDB.push(newUser);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user
    const user = usersDB.find(u => u.email === email && u.password === Buffer.from(password).toString('base64'));
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    
    // Generate token
    const tokenData = `${user.id}:${user.email}:${Date.now()}`;
    const token = Buffer.from(tokenData).toString('base64');
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      token,
      expiresIn: '24h'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Protected profile route
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin
    }
  });
});

// ===== ANALYTICS ROUTES =====

// Users route
app.get('/api/users', (req, res) => {
  // Return both mock users and registered users
  const allUsers = [
    ...usersDB.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: 'active',
      joinDate: user.createdAt.split('T')[0]
    })),
    { id: 1001, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', joinDate: '2024-01-15' },
    { id: 1002, name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active', joinDate: '2024-02-20' },
    { id: 1003, name: 'Mike Johnson', email: 'mike@example.com', role: 'user', status: 'inactive', joinDate: '2024-01-08' }
  ];
  
  res.json({
    users: allUsers,
    total: allUsers.length,
    registered: usersDB.length,
    timestamp: new Date().toISOString()
  });
});

// Analytics route
app.get('/api/analytics', (req, res) => {
  res.json({
    revenue: 45231,
    users: 1234 + usersDB.length, // Include registered users in count
    growth: 12.5,
    activeUsers: 892,
    sessions: 2457,
    conversion: 24.5,
    chartData: [65, 78, 90, 81, 56, 55, 40],
    registeredUsers: usersDB.length,
    timestamp: new Date().toISOString()
  });
});

// ===== AI/ML FEATURES (Implemented in JavaScript) =====

// AI Prediction Engine
app.post('/api/ai/predict', (req, res) => {
  try {
    const data = req.body.data || [50, 60, 55, 65, 70, 75, 80];
    
    if (data.length < 3) {
      return res.status(400).json({
        error: "Need at least 3 data points for prediction"
      });
    }

    // Advanced prediction algorithm
    const weights = [0.1, 0.15, 0.25, 0.5]; // Weight recent data more heavily
    let weightedSum = 0;
    let weightTotal = 0;
    
    for (let i = 0; i < Math.min(data.length, weights.length); i++) {
      const weight = weights[i];
      const value = data[data.length - 1 - i]; // Get from end (most recent)
      weightedSum += value * weight;
      weightTotal += weight;
    }
    
    const basePrediction = weightedSum / weightTotal;
    const trend = data[data.length - 1] - data[0];
    const volatility = Math.sqrt(
      data.reduce((sum, val) => sum + Math.pow(val - basePrediction, 2), 0) / data.length
    );
    
    // Smart prediction with trend and volatility
    const prediction = basePrediction + (trend * 0.3) + (Math.random() * volatility - volatility / 2);
    const confidence = Math.max(0.6, 0.9 - (volatility / 50));

    res.json({
      prediction: Math.round(prediction * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      model_used: "advanced_weighted_regression",
      data_points: data.length,
      trend: Math.round(trend * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
      message: "AI prediction generated successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Prediction failed",
      message: error.message 
    });
  }
});

// Advanced Anomaly Detection
app.post('/api/ai/detect-anomalies', (req, res) => {
  try {
    const data = req.body.data || [10, 12, 15, 100, 14, 13, 11, 16, 200, 12];
    
    if (data.length < 5) {
      return res.json({
        anomalies: [],
        total_points: data.length,
        anomaly_count: 0,
        method: "insufficient_data",
        message: "Need at least 5 data points for reliable anomaly detection"
      });
    }
    
    // Multiple anomaly detection methods
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const std = Math.sqrt(data.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / data.length);
    
    let zScoreAnomalies = [];
    let iqrAnomalies = [];
    
    // Method 1: Z-Score (for normal distributions)
    if (std > 0) {
      zScoreAnomalies = data.map((value, index) => {
        const zScore = Math.abs((value - avg) / std);
        return zScore > 2.5 ? index : -1;
      }).filter(index => index !== -1);
    }
    
    // Method 2: IQR (for skewed distributions)
    const sorted = [...data].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    iqrAnomalies = data.map((value, index) => {
      return (value < lowerBound || value > upperBound) ? index : -1;
    }).filter(index => index !== -1);
    
    // Combine results from both methods
    const allAnomalies = [...new Set([...zScoreAnomalies, ...iqrAnomalies])];
    
    res.json({
      anomalies: allAnomalies,
      total_points: data.length,
      anomaly_count: allAnomalies.length,
      method: "combined_zscore_iqr",
      confidence: Math.round((allAnomalies.length / data.length < 0.3) ? 0.8 : 0.6 * 100) / 100,
      detected_by: {
        z_score: zScoreAnomalies.length,
        iqr: iqrAnomalies.length,
        combined: allAnomalies.length
      },
      message: `Found ${allAnomalies.length} potential anomalies using advanced detection`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Anomaly detection failed",
      message: error.message 
    });
  }
});

// Comprehensive Statistics
app.post('/api/ai/statistics', (req, res) => {
  try {
    const data = req.body.data || [10, 20, 30, 40, 50, 45, 35, 25, 15, 60];
    
    const sorted = [...data].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const avg = sum / sorted.length;
    
    // Advanced statistics
    const variance = sorted.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / sorted.length;
    const std = Math.sqrt(variance);
    const range = sorted[sorted.length - 1] - sorted[0];
    
    // Percentiles
    const percentiles = {
      p10: sorted[Math.floor(sorted.length * 0.1)],
      p25: sorted[Math.floor(sorted.length * 0.25)],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p75: sorted[Math.floor(sorted.length * 0.75)],
      p90: sorted[Math.floor(sorted.length * 0.9)]
    };
    
    res.json({
      basic: {
        count: sorted.length,
        sum: Math.round(sum * 100) / 100,
        mean: Math.round(avg * 100) / 100,
        median: sorted[Math.floor(sorted.length / 2)],
        mode: findMode(sorted),
        range: Math.round(range * 100) / 100
      },
      variability: {
        variance: Math.round(variance * 100) / 100,
        standard_deviation: Math.round(std * 100) / 100,
        coefficient_of_variation: std > 0 ? Math.round((std / avg) * 10000) / 100 : 0
      },
      distribution: {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        quartiles: {
          q1: percentiles.p25,
          q2: percentiles.p50,
          q3: percentiles.p75
        },
        percentiles: percentiles,
        skewness: calculateSkewness(sorted, avg, std)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Statistics calculation failed",
      message: error.message 
    });
  }
});

// Helper functions for statistics
function findMode(arr) {
  const frequency = {};
  let maxFreq = 0;
  let mode = arr[0];
  
  arr.forEach(value => {
    frequency[value] = (frequency[value] || 0) + 1;
    if (frequency[value] > maxFreq) {
      maxFreq = frequency[value];
      mode = value;
    }
  });
  
  return mode;
}

function calculateSkewness(arr, mean, std) {
  if (std === 0) return 0;
  const n = arr.length;
  const skewness = arr.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / n;
  return Math.round(skewness * 100) / 100;
}

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
      'POST /api/auth/login',
      'GET /api/profile (Protected)',
      'POST /api/ai/predict',
      'POST /api/ai/detect-anomalies',
      'POST /api/ai/statistics'
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
      timestamp: new Date().toISOString(),
      activeUsers: usersDB.length
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
  console.log(`📍 Auth: http://localhost:${PORT}/api/auth/register`);
  console.log(`🤖 AI Features: http://localhost:${PORT}/api/ai/predict`);
});