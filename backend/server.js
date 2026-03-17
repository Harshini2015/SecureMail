const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models/index');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'SecureMail API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

const PORT = process.env.PORT || 5000;

// Start server immediately so it's reachable for testing
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

sequelize.authenticate()
  .then(() => {
    console.log('PostgreSQL connected');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Database synced');
  })
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    console.log('Server is running without DB connection.');
  });