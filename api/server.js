import express from 'express';
import user_DB from '../config/user_DB.js';
import router from '../routes/user_routes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { check_worker } from '../auth/middleware.js';
import serverless from "serverless-http";




const app = express();

// Middleware
app.use(cors({
  origin: ["https://wrkrbnc-frontend.vercel.app",
    /\.vercel\.app$/,   
    "http://localhost:3000"
  ],

  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/checkworker", check_worker)
app.use(cookieParser());

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

export default serverless(app);
