const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("../routes/authRoutes");
const taskRoutes = require("../routes/taskRoutes");
const adminRoutes = require("../routes/adminRoutes");
console.log("🔥 Docker mount is  test2!");
//dsv4er
// Load .env from project root
dotenv.config({
    path: path.join(__dirname, "../.env")
});


const app = express();


// Middleware
app.use(express.json());


// Port
const PORT = process.env.PORT;


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);


// Home route
app.get("/", (req, res) => {
    res.send("Task Manager API is running!");
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});