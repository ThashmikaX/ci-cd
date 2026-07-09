import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import tasksRouter from './routes/tasks.js';

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskforge';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/tasks', tasksRouter);

// Liveness: process is up. Readiness: process is up AND DB is reachable.
app.get('/healthz', (req, res) => res.send('ok'));
app.get('/readyz', (req, res) => {
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).send();
});

mongoose.connect(MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`taskforge-backend listening on ${PORT}`));
}).catch((err) => {
  console.error('mongo connection failed', err);
  process.exit(1);
});
