import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

export const verifyToken = async (req, res, next) => {
  let token;

  if (req.header('Authorization') && req.header('Authorization').startsWith('Bearer')) {
    token = req.header('Authorization').replace('Bearer ', '');
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ status: 'fail', message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Not authorized to access this route' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ status: 'fail', message: 'Not authorized to access this route' });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ status: 'fail', message: 'Access denied.' });
  }
  next();
}