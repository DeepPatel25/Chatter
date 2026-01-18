import mongoose from "mongoose";

// Function to connect to the MongoDB database
export const connectDB = async () => {
  try {
    // Connect to MongoDB using the connection string from environment variables
    await mongoose.connect(process.env.MONGODB_URI as string);

    // Log a success message upon successful connection
    console.log("Connected to MongoDB");
  } catch (error) {
    // Log any errors that occur during the connection attempt
    console.error("Error connecting to MongoDB:", error);

    // 1 for exit the process with failure
    // 0 for exit the process with success
    process.exit(1);
  }
};
