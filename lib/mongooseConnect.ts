import mongoose from 'mongoose';

// @ts-ignore
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Extend the NodeJS global type to include our mongoose cache
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

async function mongooseConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    // console.log('Using cached Mongoose connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering (recommended)
      // Add other options here if needed, e.g.:
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // connectTimeoutMS: 10000,
    };

    // console.log('Creating new Mongoose connection...');
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      // console.log('Mongoose connection successful!');
      return mongooseInstance;
    }).catch(error => {
        console.error('Mongoose connection error:', error);
        cached.promise = null; // Clear promise cache on error
        throw error; // Rethrow error
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default mongooseConnect; 