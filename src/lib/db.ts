import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedConnection: { 
  conn: typeof mongoose | null; 
  promise: Promise<typeof mongoose> | null;
  isConnecting: boolean;
  retryCount: number;
} = {
  conn: null,
  promise: null,
  isConnecting: false,
  retryCount: 0,
};

const MAX_RETRY_COUNT = 3;
const RETRY_INTERVAL = 5000; // 5 seconds

export async function connectToDatabase() {
  // If we already have a connection, return it
  if (cachedConnection.conn) {
    return cachedConnection.conn;
  }

  // If we're already trying to connect, wait for that promise
  if (cachedConnection.promise && cachedConnection.isConnecting) {
    try {
      return await cachedConnection.promise;
    } catch (error) {
      console.error('Error while waiting for existing connection:', error);
      // If the existing promise fails, we'll try again below
    }
  }

  // Set up connection options with better timeout settings
  const opts = {
    bufferCommands: true,
    serverSelectionTimeoutMS: 10000, // 10 seconds
    socketTimeoutMS: 45000, // 45 seconds
    family: 4, // Use IPv4, skip trying IPv6
  };

  // Clear any existing promise
  cachedConnection.promise = null;
  cachedConnection.isConnecting = true;
  cachedConnection.retryCount = 0;

  // Define a function to attempt connection with retries
  const connectWithRetry = async (): Promise<typeof mongoose> => {
    try {
      console.log(`MongoDB connection attempt ${cachedConnection.retryCount + 1}/${MAX_RETRY_COUNT + 1}`);
      const db = await mongoose.connect(MONGODB_URI!, opts);
      console.log('MongoDB connected successfully');
      cachedConnection.isConnecting = false;
      cachedConnection.retryCount = 0;
      return db;
    } catch (error: any) {
      console.error('MongoDB connection error:', error.message);
      
      // If we haven't reached max retries, try again
      if (cachedConnection.retryCount < MAX_RETRY_COUNT) {
        cachedConnection.retryCount++;
        console.log(`Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
        return connectWithRetry();
      }
      
      // If we've reached max retries, clear connection state and throw
      cachedConnection.isConnecting = false;
      cachedConnection.retryCount = 0;
      throw new Error(`Failed to connect to MongoDB after ${MAX_RETRY_COUNT + 1} attempts: ${error.message}`);
    }
  };

  // Create a new connection promise
  cachedConnection.promise = connectWithRetry();

  try {
    // Wait for the connection
    cachedConnection.conn = await cachedConnection.promise;
    return cachedConnection.conn;
  } catch (error) {
    // Clear the promise on error
    cachedConnection.promise = null;
    throw error;
  }
} 