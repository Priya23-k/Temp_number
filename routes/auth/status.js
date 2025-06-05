const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');

router.get("/status", (req, res) => {
  const token = req.cookies.token || req.headers['authorization']; // Retrieve token from cookies or headers

  if (!token) {
    return res.status(401).json({ isLoggedIn: false, message: "User not logged in" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.customer = decoded.user; // Set the customer object
    res.json({ isLoggedIn: true, customer: req.customer });
  } catch (err) {
    console.error('JWT Error:', err);
    res.status(401).json({ isLoggedIn: false, message: "Invalid token" });
  }
});

module.exports = router;