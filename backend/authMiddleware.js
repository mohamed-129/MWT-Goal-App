const jwt = require("jsonwebtoken");

const ensureAuthenticated = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.redirect("/api/auth/not-logged-in"); // Redirect to "Not Logged In" page
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Authentication Error:", err);
    res.redirect("/not-logged-in");
  }
};

module.exports = ensureAuthenticated;
