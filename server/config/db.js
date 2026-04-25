import mongoose from "mongoose"; //mongoose gives you functions to define schemas/models and to manage a connection

/* Defines an async arrow function named connectDB.
Because it’s async, it can use await inside and returns a Promise */

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); //Calls mongoose.connect() to open a connection to MongoDB. process.env.MONGO_URI is expected to be a connection string provided in environment variables
    //returns a Promise — await waits for the connection to succeed (or throw).
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB Connection Failed");
    process.exit(1);
  }
};

//Exports the connectDB function so other files can import
export default connectDB;
