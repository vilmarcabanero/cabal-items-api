import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { itemRouter } from './route/item.route';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.use('/item', itemRouter);

// MongoDB connection
const mongoDBUri = process.env.MONGODB_URI;
if (!mongoDBUri) {
  console.error('Missing MongoDB URI');
  process.exit(1);
}

mongoose.connect(mongoDBUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
