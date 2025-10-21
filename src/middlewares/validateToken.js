import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';

// Igual que en el video: solo valida cookie
export function validateToken(req, res, next) {
  const { token } = req.cookies || {};
  if (!token) {
    return res.status(401).json({ message: 'No token, unauthorized' });
  }

  try {
    const payload = jwt.verify(token, TOKEN_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
