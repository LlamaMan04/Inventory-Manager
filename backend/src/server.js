import express from 'express'
import 'dotenv/config.js'
import { connectDB, disconnectDB } from './config/db.js'

// Import routes
import stockRoutes from './routes/stockRoutes.js'
import authRoutes from './routes/authRoutes.js'

const startServer = async () => {
  // Connect to the database
  await connectDB();

  // Start the Express server
  const app = express();

  // Body parsing middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Apply routes
  app.use("/stock", stockRoutes);
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