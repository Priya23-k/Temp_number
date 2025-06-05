const express = require('express');
const path = require('path');
const app = express();
const connectDB = require('./config/db');
const mongoose = require("mongoose");
require("dotenv").config();  
const MONGO_URI = process.env.MONGO_URI;  
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middleware/auth"); 
const cors = require('cors');
const indexRoutes = require('./routes/index');
connectDB();
const apiRouter = require('./routes/api');
const authCustomerRoutes = require('./routes/auth/customer');
const statusRoutes = require('./routes/auth/status'); // Add this line
const protectedRoutes = require('./routes/protected'); // Add this line
const adminRoutes = require('./routes/admin'); // Add this line
// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Failed:", err));

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); 
app.use(authMiddleware);
app.use(indexRoutes);
app.use(authCustomerRoutes);
app.use('/api', apiRouter);
app.use('/auth', statusRoutes); // Add this line
app.use((req, res, next) => {
  console.log("Authenticated Customer:", req.customer);
  res.locals.customer = req.customer || null;
  next();
});

app.use('/app', protectedRoutes); 
app.use('/admin', adminRoutes); 

console.log("Views Directory:", path.join(__dirname, "views"));


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});