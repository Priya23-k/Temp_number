const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true }); // Auto-adds createdAt & updatedAt

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
