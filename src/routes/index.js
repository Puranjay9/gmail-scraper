import { Router } from 'express';
import authRoutes from './authRoutes.js';
import { PrismaClient } from '@prisma/client';

const router = Router();

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test passed');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

router.get('/health', async (req, res) => {
    await testDatabaseConnection();
    res.status(200).json({
    success: true,
    message: 'Service is healthy',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);

export default router;