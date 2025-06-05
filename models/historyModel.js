const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    countryCode: {
        type: String,
        required: true
    },
    countryName: {
        type: String,
        required: true
    },
    dialCode: {
        type: String,
        required: true
    },
    service: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'expired'],
        default: 'active'
    },
    smsContent: String,
    expiresAt: {
        type: Date,
        index: { expires: 0 } // Automatically remove expired documents
    }
}, {
    timestamps: true
});

// Add index for faster queries
historySchema.index({ customer_id: 1, status: 1 });
historySchema.index({ orderId: 1 });
historySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('History', historySchema);