import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import mariadb from 'mariadb'

let prisma;

const connectDB = async () => {
  // Create a connection pool if it doesn't exist
  if (true) {
    const adapter = new PrismaMariaDb({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectionLimit: 10,
    });

    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'warn', 'error'] 
        : ['error'],
      adapter: adapter, 
    })
  }

  // Open database connection and handle errors
  try {
    await prisma.$connect()
    console.log("Database connected successfully")
  } catch (error) {
    console.error('Error connecting to the database:', error.message)
    process.exit(1) // Exit the process with failure
  }
}

const disconnectDB = async () => {
  await prisma.$disconnect();
}

export { prisma, connectDB, disconnectDB }