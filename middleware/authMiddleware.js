const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  
  const authHeader = req.headers["authorization"];
    
  if (!authHeader) {
    return res.status(401).json({ message: "Not Authorized Sign In" });
  }
  
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.userEmail = decoded.email;
    
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { authMiddleware };
