import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Mount auth routes
app.use('/auth', authRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Heirloom backend running');
});

// Only start server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

export default app;
