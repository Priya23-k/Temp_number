// routes/protected.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Import the middleware

// Protected route example
router.get('/dashboard', authMiddleware, (req, res) => {
  // Access the authenticated user from the request object
  res.json({
    msg: 'This is a protected route',
    user: req.user, // Contains user info from the JWT payload
  });
});

module.exports = router;