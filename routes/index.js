const express = require("express");
const router = express.Router();
const Customer = require("../models/customerModel");
const authMiddleware = require("../middleware/auth");
const Transaction = require("../models/transactionModel");
const Wallet = require("../models/walletModel");    


// Public routes (no authentication required)
router.get("/app/login",async  (req, res) => {
    const alertMessage = req.query.alert;
    console.log("Alert Message in Route:", alertMessage); // Debugging

    // Fetch the balance for the logged-in user (if applicable)
    const balance = 0; // Default balance for non-logged-in users
    if (req.customer) {
        const wallet = await Wallet.findOne({ customer_id: req.customer.id });
        balance = wallet ? wallet.balance : 0;
    }

    res.render("pages/app/login", {
        customer: res.locals.customer,
        alert: alertMessage,
        balance: balance // Pass the balance to the EJS template
    });
});

router.get("/app/signup",async (req, res) => {
    const balance = 0; // Default balance for non-logged-in users
    if (req.customer) {
        const wallet = await Wallet.findOne({ customer_id: req.customer.id });
        balance = wallet ? wallet.balance : 0;
    }

    res.render("pages/app/sign_up", {
        error: "Signup failed. Please try again.",
        customer: res.locals.customer,
        balance: balance // Pass the balance to the EJS template
    });
});

router.get("/", (req, res) => {
    res.render("pages/index", { customer: res.locals.customer });
});


// Apply authMiddleware to all routes after this point
router.use(authMiddleware);

router.get("/contactus", (req, res) => {
    res.render("pages/contactus", { customer: res.locals.customer });
});
// Protected routes (authentication required for /app routes)
router.get("/app/payment", async (req, res) => {
    try {
        console.log("req.customer:", req.customer); // Debugging: Check if req.customer is set
        if (!req.customer || !req.customer.id) {
            return res.status(401).json({ error: "Unauthorized: Customer not authenticated" });
        }

        const customerId = req.customer.id;

        // Fetch the wallet balance for the customer
        const wallet = await Wallet.findOne({ customer_id: customerId });
        const balance = wallet ? wallet.balance : 0;

        // Fetch transactions for the customer
        const transactions = await Transaction.find({ customer_id: customerId }).sort({ createdAt: -1 });

        res.render("pages/app/payment", {
            customer: req.customer, // Use req.customer
            balance: balance, // Pass the balance to the EJS template
            stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/app/services", async (req, res) => {
    let balance = 0;

    if (req.customer) {
        const wallet = await Wallet.findOne({ customer_id: req.customer.id });
        balance = wallet ? wallet.balance : 0;
    }

    res.render("pages/app/services", {
        customer: req.customer || null,
        balance: balance
    });
});


router.get("/app/countries", async (req, res) => {
    let balance = 0;

    if (req.customer) {
        const wallet = await Wallet.findOne({ customer_id: req.customer.id });
        balance = wallet ? wallet.balance : 0;
    }

    res.render("pages/app/countries", {
        customer: req.customer || null,
        balance: balance
    });
});


router.get("/app/confirm", async (req, res) => {
    let balance = 0;

    if (req.customer) {
        const wallet = await Wallet.findOne({ customer_id: req.customer.id });
        balance = wallet ? wallet.balance : 0;
    }

    res.render("pages/app/confirm", {
        customer: req.customer || null,
        balance: balance
    });
});


router.get("/app/history", async (req, res) => {
    try {
        if (!req.customer || !req.customer.id) {
            return res.status(401).json({ error: "Unauthorized: Customer not authenticated" });
        }

        const customerId = req.customer.id;

        // Fetch the wallet balance for the customer
        const wallet = await Wallet.findOne({ customer_id: customerId });
        const balance = wallet ? wallet.balance : 0;

        res.render("pages/app/history", {
            customer: req.customer,
            balance: balance // Pass the balance to the EJS template
        });
    } catch (error) {
        console.error("Error fetching wallet balance:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/app/activation", async (req, res) => {
    try {
        if (!req.customer || !req.customer.id) {
            return res.status(401).json({ error: "Unauthorized: Customer not authenticated" });
        }

        const customerId = req.customer.id;

        // Fetch the wallet balance for the customer
        const wallet = await Wallet.findOne({ customer_id: customerId });
        const balance = wallet ? wallet.balance : 0;

        res.render("pages/app/activation", {
            customer: req.customer,
            balance: balance // Pass the balance to the EJS template
        });
    } catch (error) {
        console.error("Error fetching wallet balance:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/app/transactions", async (req, res) => {
    try {
        // Fetch transactions for the authenticated customer
        const transactions = await Transaction.find({ customer_id: req.customer.id }).sort({ createdAt: -1 });

        // Fetch the wallet balance
        const wallet = await Wallet.findOne({ customer_id: req.customer.id });
        const balance = wallet ? wallet.balance : 0;

        // Render the transactions page with fetched data
        res.render("pages/app/transactions", {
            customer: req.customer,
            transactions: transactions,
            balance: balance  // Add this line to pass the balance
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/auth/balance", authMiddleware, async (req, res) => {
    try {
        console.log("Customer ID:", req.customer.id); // Debugging
        const customerId = req.customer.id;

        // Fetch the wallet balance for the customer
        const wallet = await Wallet.findOne({ customer_id: customerId });
        // console.log("Wallet:", wallet); // Debugging
        const balance = wallet ? wallet.balance : 0;
        console.log("Balance:", balance); // Debugging

        res.json({ balance });
    } catch (error) {
        console.error("Error fetching wallet balance:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;
    