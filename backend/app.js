require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(express.json());

//connection
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

//routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/goals", require("./routes/goalRoutes"));
app.use("/api/friends", require("./routes/friendRoutes"));

//Server
app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`));
