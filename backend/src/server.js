import express from 'express'
import cors from 'cors'
import 'dotenv/config.js'
import { connectDB, disconnectDB } from './config/db.js'

// Import routes
import stockRoutes from './routes/stockRoutes.js'
import authRoutes from './routes/authRoutes.js'
import itemRoutes from './routes/itemRoutes.js'
import locationRoutes from './routes/locationRoutes.js'

const startServer = async () => {
  // Connect to the database
  await connectDB();

  // Start the Express server
  const app = express();

  // Enable CORS for specific routes
  app.use(cors({
    origin: ['http://localhost:5173'], // Adjust this to your frontend URL
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
  }));

  // Body parsing middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Apply routes
  app.use("/stock", stockRoutes);
  app.use("/item", itemRoutes);
  app.use("/location", locationRoutes);
  app.use("/auth", authRoutes);

  const PORT = process.env.SERVER_PORT || 5001;
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close( async () => {
      await disconnectDB();
      process.exit(1);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', async (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    await disconnectDB();
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
      await disconnectDB();
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

startServer();