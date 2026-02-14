import mongoose from 'mongoose';
import dns from 'dns';

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
        process.exit(1);
      }
    }

    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
