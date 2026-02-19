import mongoose from 'mongoose';
import dns from 'dns';

let handlersAttached = false;
let retryTimer = null;
const RETRY_DELAY_MS = Number(process.env.MONGODB_RETRY_DELAY_MS || 5000);

const isSrvDnsRefusedError = (error) => {
  const msg = error?.message || '';
  return msg.includes('querySrv ECONNREFUSED') || msg.includes('_mongodb._tcp');
};

const setFallbackDnsServers = () => {
  const configured = process.env.MONGODB_DNS_SERVERS || '8.8.8.8,1.1.1.1';
  const servers = configured
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length > 0) {
    dns.setServers(servers);
    console.warn(`MongoDB SRV lookup failed. Retrying with DNS: ${servers.join(', ')}`);
  }
};

const connect = async () => {
  return mongoose.connect(process.env.MONGODB_URI, {
    family: 4
  });
};

const attachConnectionHandlers = () => {
  if (handlersAttached) return;
  handlersAttached = true;

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  });
};

const connectDB = async () => {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  try {
    const conn = await connect();
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    attachConnectionHandlers();
  } catch (error) {
    if (isSrvDnsRefusedError(error)) {
      try {
        setFallbackDnsServers();
        const conn = await connect();
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        attachConnectionHandlers();
        return;
      } catch (retryError) {
        console.error(`Error connecting to MongoDB after DNS fallback: ${retryError.message}`);
      }
    }
    else {
      console.error(`Error connecting to MongoDB: ${error.message}`);
    }

    // Keep backend alive and retry DB connection instead of crashing nodemon/app.
    retryTimer = setTimeout(() => {
      console.log(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s...`);
      connectDB();
    }, RETRY_DELAY_MS);
  }
};

export default connectDB;
