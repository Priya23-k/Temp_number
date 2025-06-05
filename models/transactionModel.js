// models/transaction.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["credit"], required: true }, // Only "credit" is allowed
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    balance: { type: Number, required: true } // Store the balance at the time of the transaction
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;