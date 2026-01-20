import express from "express";
import path from "path";

import { clerkMiddleware } from "@clerk/express";

import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Clerk authentication middleware
app.use(clerkMiddleware());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running." });
});

// Mounting route handlers
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware for handling errors globally.
app.use(errorHandler);

// serve frontend in production
if (process.env.NODE_ENV === "production") {
  // Serve static files from the web/dist directory
  app.use(express.static(path.join(__dirname, "../../web/dist")));

  app.get("/{*any}", (_req, res) => {
    res.sendFile(path.join(__dirname, "../../web/dist", "index.html"));
  });
}

export default app;
