const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Customer = require("../../models/customerModel");

// Login route
router.post("/app/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const customer = await Customer.findOne({ email });

    // If user doesn't exist
    if (!customer) {
      return res.status(404).json({ error: "User not found" }); // <-- 404 for user not found
    }

    // If password doesn't match
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" }); // <-- 401 for unauthorized
    }

    // Create JWT payload
    const payload = {
      customer: {
        id: customer.id,
        email: customer.email,
      },
    };

    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          console.error("JWT Signing Error:", err);
          return res.status(500).json({ error: "Failed to generate token" });
        }

        res.cookie("token", token, { httpOnly: true });
        res.status(200).json({
          token,
          customer: payload.customer,
          message: "Login successful",
        });
      }
    );
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Signup route
router.post('/app/signup', async (req, res) => {
  const { email, password, confirm_password } = req.body;

  try {
    // Check if passwords match
    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if customer already exists
    let existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new customer
    const newCustomer = new Customer({
      email,
      password: hashedPassword
    });

    await newCustomer.save();

    // Generate JWT token
    const payload = {
      user: {
        id: newCustomer.id,
        email: newCustomer.email
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error('JWT Error:', err);
          return res.status(500).json({ error: 'Failed to generate token' });
        }
        res.json({ token, message: 'Signup successful' });
      }
    );

  } catch (err) {
    console.error('Signup Error:', err.message);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

// routes/auth/customer.js
router.get("/app/logout", (req, res) => {
  console.log("Logout route hit"); // Debugging
  res.clearCookie("token", { path: "/" }); // Clear the token cookie
  res.locals.customer = null; // Clear the customer variable
  req.customer = null; // Clear the customer variable from req
  res.redirect("/app/login"); // Redirect to the login page
});

// // Get customer payments
// router.get("/:customerId/payments", async (req, res) => {
//     try {
//         const customer = await Customer.findById(req.params.customerId);
//         if (!customer) {
//             return res.status(404).json({ error: "Customer not found" });
//         }
//         res.json(customer.payments);
//     } catch (error) {
//         console.error("Error fetching payments:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

module.exports = router;