import type { Request, Response, NextFunction } from "express";

// Error handling middleware for Express
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Log the error message to the console
  console.log("Error:", err.message);

  // Set the status code to 500 if it is currently 200
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  // Send the error response as JSON
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};

// if status code is hit to 200 and there is an error, change it to 500
// respond with json message "Internal Server Error"
