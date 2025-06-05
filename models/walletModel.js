const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    balance: { type: Number, default: 0.0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
}, { timestamps: true }); // Auto-adds createdAt & updatedAt

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
