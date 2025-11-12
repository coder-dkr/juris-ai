require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5100;

app.use(cors());
app.use(express.json());

// Connect to MongoDB if URL provided
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jurisai';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.warn('MongoDB connection warning:', err.message));

// API routes
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('JurisAI backend running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

