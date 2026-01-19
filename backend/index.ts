import app from "./src/app";
import { connectDB } from "./src/config/database";
import { createServer } from "http";
import { initializeSocket } from "./src/utils/socket";

// Define the port the server will listen on
const PORT = parseInt(process.env.PORT || "3000", 10);

const httpServer = createServer(app);

// Import and initialize socket connections
initializeSocket(httpServer);

// Connect to the database and then start the server
connectDB().then(() => {
  // Start the server and listen on the defined port
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
