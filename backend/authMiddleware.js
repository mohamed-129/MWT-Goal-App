const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.authToken; // Get token from cookies

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = decoded; // Attach decoded user data to the request object
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
