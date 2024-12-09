const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Use method-override to support "_method" field in forms
app.use(methodOverride("_method"));

// Middleware to parse cookies
app.use(cookieParser());

// Database Connection
mongoose
  .connect(
    "mongodb+srv://abdimalik:goalapp@cluster0.3oncz.mongodb.net/GoalApp?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));
require("dotenv").config({ path: path.join(__dirname, ".env") });
console.log("JWT_SECRET:", process.env.JWT_SECRET);

// View engine setup
app.set("views", "./frontend/views"); // Path to pug templates
app.set("view engine", "pug");

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes/indexRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/goals", require("./routes/goalRoutes"));
app.use("/api/friends", require("./routes/friendRoutes"));

// Server
app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`));
