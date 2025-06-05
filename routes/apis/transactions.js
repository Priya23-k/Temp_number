const express = require("express");
const router = express.Router();
const Transaction = require("../../models/transactionModel");

// Middleware to ensure customer is authenticated
const authenticateCustomer = (req, res, next) => {
    if (!req.session.customer || !req.session.customer._id) {
        return res.status(401).json({ error: "Unauthorized: Customer not authenticated" });
    }
    req.customer = req.session.customer;
    next();
};

router.get("/", authenticateCustomer, async (req, res) => {
    try {
        const customerId = req.customer._id;
        const transactions = await Transaction.find({ customer_id: customerId }).sort({ createdAt: -1 });
        res.render("pages/app/transaction", {
            customer: req.customer,
            transactions: transactions
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;