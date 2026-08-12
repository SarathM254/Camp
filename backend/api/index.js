import app from '../server.js';
import connectDB from '../config/db.js';

// Ensure DB is connected for serverless invocations
connectDB().catch(console.error);

export default app;
