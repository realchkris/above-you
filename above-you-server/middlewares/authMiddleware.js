const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach user data to the request
    next();
    
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

};

module.exports = authMiddleware;