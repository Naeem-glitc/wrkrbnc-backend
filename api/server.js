import express from 'express';
import user_DB from '../config/user_DB.js';
import router from '../routes/user_routes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { check_worker } from '../auth/middleware.js';




const app = express();
const corsOptions = {
  origin: ['https://wrkrbnc.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Authorization'],
  maxAge: 86400
};

app.use(cors(corsOptions)); 

// Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  
  // Allow specific origins
  const allowedOrigins = [
    'https://wrkrbnc.vercel.app',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // ✅ CRITICAL: Handle OPTIONS (preflight) requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  
  next();
});



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/checkworker", check_worker)
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({
    message: 'WorkerBNC Backend API',
    status: 'Running',
    mongoDB: 'Connected',
    timestamp: new Date().toISOString(),
    endpoints: ['/health', '/api/*'] // List your actual endpoints
  });
});
// Routes
app.use("/", router);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Test successful' });
});


// Connect DB and start server
user_DB().then(() => {
  console.log('MongoDB connection initialized');
}).catch(err => {
  console.error('MongoDB init error:', err);
});

export default app;
