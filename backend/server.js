const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');  
const authRoutes = require('./routes/authRoutes');  
const settingsRoutes = require('./routes/settingsRoutes');  


const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.log(err)
    process.exit(1);
  });
  

// Routes
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.get('/protected', (req,res) => {
  
})

app.use('/api/user',userRoutes);
app.use('/api/auth',authRoutes);
app.use('/api/settings/', settingsRoutes);


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
