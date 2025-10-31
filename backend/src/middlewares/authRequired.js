import jwt from 'jsonwebtoken';

export function authRequired(req, res, next) {
  const { token } = req.cookies || {};
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
