import app from "./src/app";
import { connectDB } from "./src/config/database";

// Define the port the server will listen on
const PORT = (process.env.PORT as string) || 3000;

// Connect to the database and then start the server
connectDB().then(() => {
  // Start the server and listen on the defined port
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
