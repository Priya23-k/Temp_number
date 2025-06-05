const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Customer = require("../../models/customerModel");
const Transaction = require("../../models/transactionModel");
const Wallet = require("../../models/walletModel"); // Import the Wallet model

router.post("/", async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Debugging
        const { amount, customerId } = req.body;

        if (!amount || amount <= 0 || !customerId) {
            return res.status(400).json({ error: "Invalid amount or customer ID" });
        }

        // Fetch the customer
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        // Fetch or create the wallet for the customer
        let wallet = await Wallet.findOne({ customer_id: customerId });
        if (!wallet) {
            wallet = new Wallet({
                customer_id: customerId,
                balance: 0, 
                status: "active"
            });
        }

        // Calculate the new balance
        const newBalance = wallet.balance + amount;

        // Update the wallet balance
        wallet.balance = newBalance;
        await wallet.save();

        // Create a transaction record
        const transaction = new Transaction({
            customer_id: customerId,
            amount: amount,
            type: "credit",
            status: "completed",
            balance: newBalance // Store the updated balance
        });
        await transaction.save();

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Test Product",
                        },
                        unit_amount: amount * 100, // Convert dollars to cents
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: "http://localhost:3000/app/payment",
            cancel_url: "http://localhost:3000/cancel",
        });

        // Return the session ID and updated wallet balance
        res.json({ sessionId: session.id, balance: newBalance });
    } catch (error) {
        console.error("Error creating Stripe checkout session:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;