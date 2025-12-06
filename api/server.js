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



const __filename = fileURLToPath(import.meta.url);



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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
export const handler = async (req, res) => {
  try {
    await user_DB(); // Ensure MongoDB is connected
    return serverless(app)(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
