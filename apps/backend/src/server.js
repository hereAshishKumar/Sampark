import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { startSmtpServer } from './smtp.js';
import authRoutes from './routes/auth.js';
import emailRoutes from './routes/emails.js';
import telephonyRoutes from './routes/telephony.js';
import aiRoutes from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 5000;
const SMTP_PORT = process.env.SMTP_PORT || 2525;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'healthy',
    service: 'sampark-backend',
    version: '1.0.0',
    time: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/telephony', telephonyRoutes);
app.use('/api/ai', aiRoutes);

// Start HTTP Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🌾 संपर्क (Sampark) Backend Engine Online`);
  console.log(`📡 REST API & WebSockets: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});

// Start Local SMTP Receiver
startSmtpServer(SMTP_PORT);

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
