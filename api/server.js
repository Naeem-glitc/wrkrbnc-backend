import express from 'express';
import user_DB from '../config/user_DB.js';
import router from '../routes/user_routes.js';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { check_worker } from '../auth/middleware.js';
import serverless from "serverless-http";




dotenv.config();

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



// Connect DB and start server
user_DB().then(() => {
  console.log("MongoDB connected");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

export default serverless(app);
