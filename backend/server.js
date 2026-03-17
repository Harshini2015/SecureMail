const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models/index');

const app = express();

app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'SecureMail API is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

// Start server immediately, then attempt DB connection
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

sequelize.authenticate()
  .then(() => {
    console.log('PostgreSQL connected');
    return sequelize.sync({ alter: false }); // Creates tables if they don't exist
  })
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    console.log('Server will continue running without DB (check your DATABASE_URL)');
  });